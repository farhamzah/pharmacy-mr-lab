import * as THREE from "three";
import { AnchorManager } from "../xr/AnchorManager";
import { ControllerManager } from "../xr/ControllerManager";
import { HitTestManager } from "../xr/HitTestManager";
import { PlacementManager } from "../xr/PlacementManager";
import { LabLayoutManager } from "../lab/LabLayoutManager";
import { LabObjectFactory } from "../lab/LabObjectFactory";
import { LabTable } from "../lab/LabTable";
import { ScaleCalibrationManager } from "../calibration/ScaleCalibrationManager";
import { TableCalibrationProfile } from "../calibration/TableCalibrationProfile";
import { AssetLoader } from "../assets/AssetLoader";
import { DiagnosticsManager } from "../diagnostics/DiagnosticsManager";
import { DiagnosticReport } from "../diagnostics/WebXRDiagnostics";
import { ResultExporter } from "../export/ResultExporter";
import { BaseModule } from "../modules/BaseModule";
import { MixingModule } from "../modules/MixingModule";
import { WeighingModule } from "../modules/WeighingModule";
import { PerformanceMonitor } from "../performance/PerformanceMonitor";
import { UIManager } from "../ui/UIManager";
import { getMixingScenario, getWeighingScenario, mixingScenarios, weighingScenarios } from "../data/practicalScenarios";
import { DEBUG_PERFORMANCE, ModuleId } from "../utils/constants";
import { clearResultHistory, clearRoomSetup, createRoomSetupRecord, deleteRoomSetupRecord, loadCurrentRoomSetupRecord, saveRoomSetupRecord } from "../utils/storage";
import { StateManager } from "./StateManager";
import { XRSessionManager } from "./XRSessionManager";

export class AppController {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private readonly state = new StateManager();
  private readonly layout = new LabLayoutManager();
  private readonly assetLoader = new AssetLoader();
  private readonly factory = new LabObjectFactory(this.assetLoader);
  private readonly calibration = new ScaleCalibrationManager();
  private readonly exporter = new ResultExporter();
  private readonly diagnostics = new DiagnosticsManager(this.renderer);
  private readonly performanceMonitor = new PerformanceMonitor((fps) => {
    this.ui.setMessage(`Performance rendah (${fps} FPS). Kurangi objek visual atau gunakan scale standar.`, "warning");
  });
  private readonly xrSessionManager = new XRSessionManager(this.renderer);
  private readonly hitTestManager = new HitTestManager(this.renderer, this.scene);
  private readonly anchorManager = new AnchorManager();
  private readonly placementManager = new PlacementManager(this.scene, this.hitTestManager, this.anchorManager);
  private readonly controllerManager = new ControllerManager(this.renderer, this.scene);
  private readonly ui: UIManager;
  private activeModule: BaseModule | null = null;
  private lastDiagnostics: DiagnosticReport | null = null;
  private pendingModuleId: ModuleId | null = null;

  constructor(private readonly root: HTMLElement) {
    this.ui = new UIManager(root, {
      onStartXR: () => void this.startXR(),
      onResetRoom: () => this.resetRoomSetup(),
      onFinishSetup: () => this.finishSetup(),
      onSelectModule: (moduleId) => this.startModule(moduleId),
      onStartScenario: (scenarioId) => this.startScenario(scenarioId),
      onModuleAction: (action) => this.activeModule?.handleAction(action),
      onBackToModuleMenu: () => this.backToModuleMenu(),
      onRetryModule: () => this.retryActiveModule(),
      onStartDesktopDemo: () => this.startDesktopDemo(),
      onObjectScaleChange: (profileId) => this.updateObjectScale(profileId),
      onResumeSavedSetup: () => this.resumeSavedSetup(),
      onRecalibrateRoom: () => void this.recalibrateRoom(),
      onDeleteSavedSetup: () => this.deleteSavedSetup(),
      onExportLastJSON: () => this.exportLastJSON(),
      onExportHistoryCSV: () => this.exportHistoryCSV(),
      onClearResultHistory: () => this.clearResultHistory(),
      onRunDiagnostics: () => void this.runDiagnostics(),
      onCopyDiagnostics: () => void this.copyDiagnostics(),
      onExternalAssetsChange: (enabled) => this.updateExternalAssets(enabled),
    });
    this.assetLoader.subscribe((statuses) => this.ui.updateAssetStatuses(statuses));
  }

  start(): void {
    this.setupRenderer();
    this.setupScene();
    const profile = this.calibration.getProfile();
    this.factory.setObjectScale(profile.objectScale);
    this.factory.preferExternalAssets = this.getExternalAssetsEnabled();
    this.ui.showHome(profile, loadCurrentRoomSetupRecord(), this.factory.preferExternalAssets, this.assetLoader.getStatuses());
    this.renderer.setAnimationLoop((timestamp, frame) => this.render(timestamp, frame));
    window.addEventListener("resize", () => this.resize());
    if (DEBUG_PERFORMANCE) {
      this.performanceMonitor.start();
    }
  }

  private setupRenderer(): void {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  private setupScene(): void {
    this.camera.position.set(0, 1.6, 2);
    this.scene.add(this.camera);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.6));

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(1.5, 3, 2);
    this.scene.add(light);
  }

  private async startXR(): Promise<void> {
    try {
      const session = await this.xrSessionManager.startSession();
      this.ui.showXROverlay();
      this.controllerManager.initialize();
      this.controllerManager.setSelectHandler((controller) => void this.handleSelect(controller));
      await this.hitTestManager.initialize(session);

      this.activeModule?.dispose();
      this.activeModule = null;
      this.placementManager.clear();
      this.state.setTables([]);
      this.state.setMode("placement");
      this.ui.showPlacement(0);
      this.ui.setMessage("Tandai satu meja kerja. Setelah trigger pertama, modul penimbangan langsung dimulai.");
    } catch (error) {
      this.ui.setMessage(error instanceof Error ? error.message : "Gagal memulai WebXR.", "error");
    }
  }

  private async handleSelect(controller?: THREE.Object3D): Promise<void> {
    if (this.state.mode === "module-running" && controller && this.activeModule?.handleObjectSelect(controller)) {
      this.ui.setMessage("Input controller diterima.", "success");
      return;
    }

    if (this.state.mode !== "placement") return;
    this.ui.setMessage("Input controller diterima. Mencari permukaan meja...", "info");
    const table = await this.placementManager.placeTableFromReticle();
    if (!table) {
      this.ui.setMessage("Reticle belum menemukan permukaan meja atau jumlah meja sudah maksimal.", "error");
      return;
    }

    const tables = this.layout.assignRoles(this.placementManager.getTables());
    this.state.setTables(tables);
    this.ui.setMessage(`${table.id.replace("table-", "Meja ")} ditandai. Modul penimbangan dimulai otomatis.`, "success");
    this.startModule("weighing");
  }

  private finishSetup(): void {
    const tables = this.layout.assignRoles(this.placementManager.getTables().length ? this.placementManager.getTables() : this.state.tables);
    if (tables.length === 0) {
      this.ui.setMessage("Tandai minimal 1 meja sebelum selesai setup.", "error");
      return;
    }

    this.state.setTables(tables);
    this.saveCurrentRoomSetup(tables);
    this.state.setMode("module-menu");
    this.hitTestManager.dispose();
    this.ui.showModuleMenu();
    this.ui.setMessage(`Setup selesai dengan ${tables.length} meja. Layout sudah disesuaikan.`, "success");
  }

  private startModule(moduleId: ModuleId): void {
    if (this.state.mode === "placement") {
      const tables = this.layout.assignRoles(this.placementManager.getTables());
      if (tables.length === 0) {
        this.ui.setMessage("Tandai 1 meja dulu sebelum mulai modul.", "error");
        return;
      }
      this.state.setTables(tables);
      this.saveCurrentRoomSetup(tables);
      this.hitTestManager.dispose();
      this.pendingModuleId = moduleId;
      this.startScenario(moduleId === "weighing" ? getWeighingScenario().id : getMixingScenario().id);
      this.ui.setMessage(`Mulai ${moduleId === "weighing" ? "penimbangan" : "pencampuran"} dengan ${tables.length} meja.`, "success");
      return;
    }

    this.pendingModuleId = moduleId;
    this.ui.showScenarioSelection(moduleId, moduleId === "weighing" ? weighingScenarios : mixingScenarios);
  }

  private startScenario(scenarioId: string): void {
    const moduleId = this.pendingModuleId ?? (scenarioId.startsWith("weighing") ? "weighing" : "mixing");
    this.activeModule?.dispose();
    this.state.setActiveModule(moduleId);
    this.state.setMode("module-running");

    if (moduleId === "weighing") {
      this.activeModule = new WeighingModule(this.scene, this.state.tables, this.layout, this.factory, this.ui, getWeighingScenario(scenarioId), this.camera);
    } else {
      this.activeModule = new MixingModule(this.scene, this.state.tables, this.layout, this.factory, this.ui, getMixingScenario(scenarioId), this.camera);
    }

    void this.activeModule.start();
  }

  private resetRoomSetup(): void {
    clearRoomSetup();
    this.state.setTables([]);
    this.placementManager.clear();
    this.ui.setMessage("Room setup dihapus dari localStorage.", "success");
  }

  private updateObjectScale(profileId: TableCalibrationProfile["id"]): void {
    const profile = this.calibration.setProfile(profileId);
    this.factory.setObjectScale(profile.objectScale);
    this.ui.setMessage(`Object scale disimpan: ${profile.label}.`, "success");
    this.ui.showHome(profile, loadCurrentRoomSetupRecord(), this.factory.preferExternalAssets, this.assetLoader.getStatuses());
  }

  private updateExternalAssets(enabled: boolean): void {
    try {
      localStorage.setItem("pharmacy-mr-lab.external-assets.v1", JSON.stringify(enabled));
    } catch {
      this.ui.setMessage("Gagal menyimpan setting external assets.", "error");
    }
    this.factory.preferExternalAssets = enabled;
    this.ui.showHome(this.calibration.getProfile(), loadCurrentRoomSetupRecord(), enabled, this.assetLoader.getStatuses());
    this.ui.setMessage(enabled ? "External assets aktif. Missing GLB memakai fallback." : "Procedural assets aktif.", "info");
  }

  private getExternalAssetsEnabled(): boolean {
    try {
      return JSON.parse(localStorage.getItem("pharmacy-mr-lab.external-assets.v1") ?? "false") === true;
    } catch {
      return false;
    }
  }

  private startDesktopDemo(): void {
    this.ui.showXROverlay();
    this.activeModule?.dispose();
    this.placementManager.clear();
    const table = new LabTable("table-1", new THREE.Vector3(0, 1.05, -1.25), new THREE.Euler(0, 0, 0), "shared-workbench");
    this.scene.add(table.group);
    this.state.setTables(this.layout.assignRoles([table]));
    this.saveCurrentRoomSetup(this.state.tables);
    this.state.setMode("module-menu");
    this.ui.showModuleMenu();
    this.ui.setMessage("Desktop demo aktif dengan 1 meja shared-workbench.", "success");
  }

  private resumeSavedSetup(): void {
    try {
      const record = loadCurrentRoomSetupRecord();
      if (!record) {
        this.ui.setMessage("Saved setup tidak ditemukan.", "error");
        return;
      }
      this.ui.showXROverlay();
      this.activeModule?.dispose();
      this.placementManager.clear();
      const tables = this.layout.assignRoles(record.tables.map((table) => LabTable.fromStored(table)));
      this.factory.setObjectScale(record.calibration.objectScale);
      this.placementManager.addExistingTables(tables);
      this.state.setTables(tables);
      this.state.setMode("module-menu");
      this.ui.showModuleMenu();
      this.ui.setMessage("Saved room setup dipulihkan. Recalibration mungkin diperlukan jika ruangan berubah.", "warning");
    } catch {
      this.ui.setMessage("Resume setup gagal. Saved setup mungkin corrupt.", "error");
    }
  }

  private async recalibrateRoom(): Promise<void> {
    clearRoomSetup();
    this.state.setTables([]);
    this.placementManager.clear();
    await this.startXR();
  }

  private deleteSavedSetup(): void {
    const record = loadCurrentRoomSetupRecord();
    if (record) {
      deleteRoomSetupRecord(record.id);
    } else {
      clearRoomSetup();
    }
    this.ui.showHome(this.calibration.getProfile(), null);
    this.ui.setMessage("Saved room setup dihapus. Result history tetap disimpan.", "success");
  }

  private exportLastJSON(): void {
    try {
      const ok = this.exporter.exportLastResultAsJSON();
      this.ui.setMessage(ok ? "Last result JSON diexport." : "Belum ada hasil praktikum untuk diexport.", ok ? "success" : "info");
    } catch {
      this.ui.setMessage("Export JSON gagal.", "error");
    }
  }

  private exportHistoryCSV(): void {
    try {
      const ok = this.exporter.exportResultHistoryAsCSV();
      this.ui.setMessage(ok ? "Result history CSV diexport." : "Belum ada hasil praktikum untuk diexport.", ok ? "success" : "info");
    } catch {
      this.ui.setMessage("Export CSV gagal.", "error");
    }
  }

  private clearResultHistory(): void {
    clearResultHistory();
    this.ui.setMessage("Result history dihapus.", "success");
  }

  private async runDiagnostics(): Promise<void> {
    try {
      this.lastDiagnostics = await this.diagnostics.run();
      this.ui.showDiagnostics(this.lastDiagnostics);
      this.ui.setMessage("Diagnostics selesai.", "success");
    } catch {
      this.ui.setMessage("Diagnostics gagal dijalankan.", "error");
    }
  }

  private async copyDiagnostics(): Promise<void> {
    try {
      this.lastDiagnostics ??= await this.diagnostics.run();
      await navigator.clipboard?.writeText(JSON.stringify(this.lastDiagnostics, null, 2));
      this.ui.setMessage("Diagnostics JSON disalin.", "success");
    } catch {
      this.ui.setMessage("Copy diagnostics gagal. Clipboard mungkin tidak tersedia.", "error");
    }
  }

  private saveCurrentRoomSetup(tables: LabTable[]): void {
    const profile = this.calibration.getProfile();
    saveRoomSetupRecord(createRoomSetupRecord(
      tables.map((table) => table.toStored()),
      { objectScale: profile.objectScale, profileId: profile.id },
      loadCurrentRoomSetupRecord(),
    ));
  }

  private backToModuleMenu(): void {
    this.activeModule?.dispose();
    this.activeModule = null;
    this.state.setActiveModule(null);
    this.state.setMode("module-menu");
    this.ui.showModuleMenu();
  }

  private retryActiveModule(): void {
    const moduleId = this.state.activeModule;
    if (!moduleId) {
      this.backToModuleMenu();
      return;
    }
    this.startModule(moduleId);
  }

  private render(_timestamp: number, frame?: XRFrame): void {
    this.controllerManager.updateFromSession(this.xrSessionManager.getSession());
    const referenceSpace = this.xrSessionManager.getReferenceSpace();
    if (frame && referenceSpace && this.state.mode === "placement") {
      this.hitTestManager.update(frame, referenceSpace);
    }
    this.renderer.render(this.scene, this.camera);
  }

  private resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
