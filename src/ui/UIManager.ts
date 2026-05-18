import { APP_VERSION, ModuleId } from "../utils/constants";
import { ModuleResult } from "../assessment/ModuleResult";
import { ModuleStep } from "../modules/ModuleStep";
import { DiagnosticReport } from "../diagnostics/WebXRDiagnostics";
import { RoomSetupRecord } from "../room/RoomSetupRecord";
import { MixingScenario, WeighingScenario } from "../data/practicalScenarios";
import { AssetLoadStatus, AssetLoader } from "../assets/AssetLoader";
import { TableCalibrationProfile, tableCalibrationProfiles } from "../calibration/TableCalibrationProfile";
import { InstructionPanel } from "./InstructionPanel";
import { ProgressPanel } from "./ProgressPanel";
import { ResultPanel } from "./ResultPanel";
import { ToastManager } from "./ToastManager";

interface UIHandlers {
  onStartXR: () => void;
  onResetRoom: () => void;
  onFinishSetup: () => void;
  onSelectModule: (moduleId: ModuleId) => void;
  onStartScenario: (scenarioId: string) => void;
  onModuleAction: (action: string) => void;
  onBackToModuleMenu: () => void;
  onRetryModule: () => void;
  onStartDesktopDemo: () => void;
  onObjectScaleChange: (profileId: TableCalibrationProfile["id"]) => void;
  onResumeSavedSetup: () => void;
  onRecalibrateRoom: () => void;
  onDeleteSavedSetup: () => void;
  onExportLastJSON: () => void;
  onExportHistoryCSV: () => void;
  onClearResultHistory: () => void;
  onRunDiagnostics: () => void;
  onCopyDiagnostics: () => void;
  onExternalAssetsChange: (enabled: boolean) => void;
}

export class UIManager {
  private readonly root: HTMLElement;
  private readonly handlers: UIHandlers;
  private messageEl?: HTMLElement;
  private actionEl?: HTMLElement;
  private progressEl?: HTMLElement;
  private resultEl?: HTMLElement;
  private toastManager?: ToastManager;
  private instructionPanel?: InstructionPanel;
  private progressPanel?: ProgressPanel;

  constructor(root: HTMLElement, handlers: UIHandlers) {
    this.root = root;
    this.handlers = handlers;
  }

  showHome(activeProfile: TableCalibrationProfile = tableCalibrationProfiles[1], savedSetup: RoomSetupRecord | null = null, externalAssets = false, assetStatuses: Array<{ id: string; status: AssetLoadStatus }> = []): void {
    this.root.innerHTML = `
      <main class="home-shell">
        <section class="home-panel">
          <p class="eyebrow">WebXR Demo</p>
          <h1>Mixed Reality Pharmacy Lab</h1>
          <p class="version-badge">Build ${APP_VERSION}</p>
          <p class="lead">Gunakan Meta Quest Browser untuk mode Mixed Reality.</p>
          <label class="scale-picker">
            <span>Object Scale</span>
            <select id="object-scale">
              ${tableCalibrationProfiles
                .map((profile) => `<option value="${profile.id}" ${profile.id === activeProfile.id ? "selected" : ""}>${profile.label} (${profile.objectScale}x)</option>`)
                .join("")}
            </select>
          </label>
          <label class="scale-picker">
            <span>Use External 3D Assets</span>
            <input id="external-assets" type="checkbox" ${externalAssets ? "checked" : ""} />
          </label>
          <div class="button-row">
            <button id="start-xr" class="primary">Start MR Lab</button>
            <button id="desktop-demo">Desktop Module Demo</button>
            <button id="reset-room">Reset Room Setup</button>
          </div>
          ${savedSetup ? this.renderSavedSetup(savedSetup) : ""}
          <details class="home-tools">
            <summary>Meta Quest Setup Help</summary>
            <ul class="checklist">
              <li>Use Meta Quest Browser.</li>
              <li>Open an HTTPS URL.</li>
              <li>HTTP LAN IP such as http://192.168.x.x:5173 will not work for WebXR.</li>
              <li>Run Diagnostics before Start MR Lab.</li>
              <li>See docs/deployment-https.md.</li>
            </ul>
          </details>
          <details class="home-tools">
            <summary>Asset Status</summary>
            <ul id="asset-status-list" class="checklist">
              ${assetStatuses.map((asset) => `<li>${asset.id}: ${asset.status}</li>`).join("")}
            </ul>
          </details>
          <details class="home-tools">
            <summary>Result Export</summary>
            <div class="button-row">
              <button id="export-last-json">Export Last Result JSON</button>
              <button id="export-history-csv">Export History CSV</button>
              <button id="clear-result-history">Clear Result History</button>
            </div>
          </details>
          <details class="home-tools">
            <summary>System Diagnostics</summary>
            <div class="button-row">
              <button id="run-diagnostics">Run Diagnostics</button>
              <button id="copy-diagnostics">Copy Diagnostics JSON</button>
            </div>
            <div id="diagnostics-output" class="diagnostics-output">Diagnostics belum dijalankan.</div>
          </details>
          <details class="home-tools">
            <summary>Quest Testing Checklist</summary>
            <ul class="checklist">
              <li>Ruangan terang</li>
              <li>Area sekitar aman</li>
              <li>Meta Quest Browser digunakan</li>
              <li>Website dibuka via HTTPS</li>
              <li>HTTP LAN IP tidak dipakai untuk WebXR</li>
              <li>Izin WebXR diberikan</li>
              <li>Controller aktif</li>
              <li>Meja terlihat jelas</li>
              <li>Jangan berjalan terlalu jauh</li>
            </ul>
          </details>
          <div id="message" class="message"></div>
          <ul class="safety-list">
            <li>Pastikan area sekitar aman sebelum memakai headset.</li>
            <li>Gunakan di ruangan terang.</li>
            <li>Jangan berjalan terlalu jauh saat mode demo.</li>
          </ul>
        </section>
      </main>
    `;
    this.messageEl = this.root.querySelector("#message") ?? undefined;
    this.root.querySelector("#start-xr")?.addEventListener("click", this.handlers.onStartXR);
    this.root.querySelector("#desktop-demo")?.addEventListener("click", this.handlers.onStartDesktopDemo);
    this.root.querySelector("#reset-room")?.addEventListener("click", this.handlers.onResetRoom);
    this.root.querySelector("#resume-setup")?.addEventListener("click", this.handlers.onResumeSavedSetup);
    this.root.querySelector("#recalibrate-room")?.addEventListener("click", this.handlers.onRecalibrateRoom);
    this.root.querySelector("#delete-saved-setup")?.addEventListener("click", this.handlers.onDeleteSavedSetup);
    this.root.querySelector("#export-last-json")?.addEventListener("click", this.handlers.onExportLastJSON);
    this.root.querySelector("#export-history-csv")?.addEventListener("click", this.handlers.onExportHistoryCSV);
    this.root.querySelector("#clear-result-history")?.addEventListener("click", this.handlers.onClearResultHistory);
    this.root.querySelector("#run-diagnostics")?.addEventListener("click", this.handlers.onRunDiagnostics);
    this.root.querySelector("#copy-diagnostics")?.addEventListener("click", this.handlers.onCopyDiagnostics);
    this.root.querySelector("#object-scale")?.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        this.handlers.onObjectScaleChange(target.value as TableCalibrationProfile["id"]);
      }
    });
    this.root.querySelector("#external-assets")?.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        this.handlers.onExternalAssetsChange(target.checked);
      }
    });
  }

  showDiagnostics(report: DiagnosticReport): void {
    const output = this.root.querySelector("#diagnostics-output");
    if (!(output instanceof HTMLElement)) return;
    output.innerHTML = `
      <p><strong>Created:</strong> ${report.createdAt}</p>
      <p><strong>Viewport:</strong> ${report.viewport.width}x${report.viewport.height}, DPR ${report.viewport.devicePixelRatio}</p>
      <p><strong>User Agent:</strong> ${report.userAgent}</p>
      <ul>
        ${report.items.map((item) => `<li><strong>${item.label}:</strong> ${item.status} - ${item.detail}</li>`).join("")}
      </ul>
    `;
  }

  updateAssetStatuses(statuses: Array<{ id: string; status: AssetLoadStatus }>): void {
    const output = this.root.querySelector("#asset-status-list");
    if (!(output instanceof HTMLElement)) return;
    output.innerHTML = statuses.map((asset) => `<li>${asset.id}: ${asset.status}</li>`).join("");
  }

  showXROverlay(): void {
    this.root.innerHTML = `
      <div class="xr-overlay">
        <div class="build-badge">Build ${APP_VERSION}</div>
        <section id="instruction" class="overlay-panel"></section>
        <section id="progress" class="progress-panel"></section>
        <section id="actions" class="action-panel"></section>
        <section id="result" class="result-panel" hidden></section>
        <div id="message" class="toast-stack"></div>
      </div>
    `;
    const instructionRoot = this.root.querySelector("#instruction");
    this.actionEl = this.root.querySelector("#actions") ?? undefined;
    this.progressEl = this.root.querySelector("#progress") ?? undefined;
    this.resultEl = this.root.querySelector("#result") ?? undefined;
    this.messageEl = this.root.querySelector("#message") ?? undefined;
    if (this.messageEl instanceof HTMLElement) {
      this.toastManager = new ToastManager(this.messageEl);
    }
    if (instructionRoot instanceof HTMLElement) {
      this.instructionPanel = new InstructionPanel(instructionRoot);
    }
    if (this.progressEl instanceof HTMLElement) {
      this.progressPanel = new ProgressPanel(this.progressEl);
    }
  }

  showPlacement(tableCount: number): void {
    const ready = tableCount > 0;
    this.instructionPanel?.setContent("Setup Meja", [
      ready
        ? "Meja kerja sudah siap. Langsung mulai modul di meja ini, atau trigger permukaan lain jika benar-benar ingin menambah meja."
        : "Arahkan controller ke satu meja kerja nyata, lalu tekan trigger. Satu meja saja cukup untuk mulai.",
      `Meja aktif: ${tableCount || 0}. Tambah meja hanya opsional untuk ruang praktikum yang punya lebih dari satu meja.`,
    ]);
    if (this.actionEl) {
      this.actionEl.innerHTML = `
        <button id="quick-weighing" class="primary" ${ready ? "" : "disabled"}>Mulai Penimbangan</button>
        <button id="quick-mixing" ${ready ? "" : "disabled"}>Mulai Pencampuran</button>
        <button id="finish-setup" ${ready ? "" : "disabled"}>Pilih Skenario Lain</button>
        <span class="action-hint">Trigger controller hanya untuk tambah meja opsional.</span>
      `;
      this.actionEl.querySelector("#quick-weighing")?.addEventListener("click", () => this.handlers.onSelectModule("weighing"));
      this.actionEl.querySelector("#quick-mixing")?.addEventListener("click", () => this.handlers.onSelectModule("mixing"));
      this.actionEl.querySelector("#finish-setup")?.addEventListener("click", this.handlers.onFinishSetup);
    }
  }

  showModuleMenu(): void {
    this.hideResult();
    if (this.progressEl) this.progressEl.innerHTML = "";
    this.instructionPanel?.setContent("Pilih Modul", [
      "Pilih modul. Setelah modul muncul, kamu bisa memakai tombol menu atau trigger langsung pada objek 3D yang menyala.",
    ]);
    if (this.actionEl) {
      this.actionEl.innerHTML = `
        <button id="module-weighing" class="primary">Modul 1: Penimbangan Bahan</button>
        <button id="module-mixing">Modul 2: Pencampuran Sediaan</button>
      `;
      this.actionEl.querySelector("#module-weighing")?.addEventListener("click", () => this.handlers.onSelectModule("weighing"));
      this.actionEl.querySelector("#module-mixing")?.addEventListener("click", () => this.handlers.onSelectModule("mixing"));
    }
  }

  showScenarioSelection(moduleId: ModuleId, scenarios: Array<WeighingScenario | MixingScenario>): void {
    this.instructionPanel?.setContent(moduleId === "weighing" ? "Pilih Skenario Penimbangan" : "Pilih Skenario Pencampuran", [
      "Pilih skenario praktikum. Di Quest, interaksi utama bisa dilakukan dengan trigger pada alat dan bahan yang diberi hotspot biru.",
    ]);
    if (this.progressEl) this.progressEl.innerHTML = "";
    if (this.actionEl) {
      this.actionEl.innerHTML = `
        <div class="scenario-list">
          ${scenarios.map((scenario, index) => this.renderScenarioOption(scenario, index === 0)).join("")}
        </div>
        <div class="button-row">
          <button id="start-selected-scenario" class="primary">Start Selected Scenario</button>
          <button id="back-module-menu">Back to Module Menu</button>
        </div>
      `;
      this.actionEl.querySelector("#start-selected-scenario")?.addEventListener("click", () => {
        const selected = this.actionEl?.querySelector<HTMLInputElement>("input[name='scenario']:checked");
        this.handlers.onStartScenario(selected?.value ?? scenarios[0].id);
      });
      this.actionEl.querySelector("#back-module-menu")?.addEventListener("click", this.handlers.onBackToModuleMenu);
    }
  }

  showModulePanel(title: string, lines: string[], actions: string[]): void {
    this.instructionPanel?.setContent(title, lines);
    if (this.actionEl) {
      this.actionEl.innerHTML = actions.map((action) => `<button data-action="${action}">${action}</button>`).join("");
      this.actionEl.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => this.handlers.onModuleAction(button.getAttribute("data-action") ?? ""));
      });
    }
  }

  showLearningModulePanel(title: string, target: string, currentInstruction: string, feedback: string, actions: string[], steps: ModuleStep[]): void {
    this.hideResult();
    this.instructionPanel?.setModuleContent(title, target, currentInstruction, feedback);
    this.progressPanel?.render(steps);
    if (this.actionEl) {
      this.actionEl.innerHTML = actions.map((action) => `<button data-action="${action}">${action}</button>`).join("");
      this.actionEl.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => this.handlers.onModuleAction(button.getAttribute("data-action") ?? ""));
      });
    }
  }

  showResult(result: ModuleResult): void {
    if (!this.resultEl) return;
    this.resultEl.hidden = false;
    if (this.actionEl) this.actionEl.innerHTML = "";
    const panel = new ResultPanel(this.resultEl, this.handlers.onBackToModuleMenu, this.handlers.onRetryModule);
    panel.render(result);
  }

  private hideResult(): void {
    if (!this.resultEl) return;
    this.resultEl.hidden = true;
    this.resultEl.innerHTML = "";
  }

  setMessage(message: string, kind: "info" | "error" | "success" | "warning" = "info"): void {
    if (!this.messageEl) return;
    if (this.toastManager) {
      this.toastManager.push(message, kind);
      return;
    }
    this.messageEl.textContent = message;
    this.messageEl.dataset.kind = kind;
  }

  private renderSavedSetup(record: RoomSetupRecord): string {
    const roles = record.tables.map((table) => `${table.label}: ${table.assignedRole}`).join(", ");
    return `
      <section class="saved-setup-card">
        <h2>Saved Room Setup Found</h2>
        <p>${record.tableCount} meja. ${roles}</p>
        <p>Updated: ${new Date(record.updatedAt).toLocaleString()}</p>
        <p>Object scale: ${record.calibration.profileId} (${record.calibration.objectScale}x)</p>
        <p class="warning-text">Saved setup uses local fallback. Recalibration may be needed if the physical room changed.</p>
        <div class="button-row">
          <button id="resume-setup" class="primary">Resume Saved Setup</button>
          <button id="recalibrate-room">Recalibrate Room</button>
          <button id="delete-saved-setup">Delete Saved Setup</button>
        </div>
      </section>
    `;
  }

  private renderScenarioOption(scenario: WeighingScenario | MixingScenario, checked: boolean): string {
    const target = scenario.moduleType === "weighing"
      ? `${scenario.materialName} ${scenario.targetMassGram.toFixed(3)} g +/- ${scenario.toleranceGram.toFixed(3)} g`
      : `${scenario.ingredientA} + ${scenario.ingredientB}, homogeneity ${scenario.requiredHomogeneity}%`;
    return `
      <label class="scenario-option">
        <input type="radio" name="scenario" value="${scenario.id}" ${checked ? "checked" : ""} />
        <span>
          <strong>${scenario.title}</strong>
          <small>${target}</small>
          <small>Difficulty: ${scenario.difficulty}</small>
          <small>${scenario.learningObjectives.join("; ")}</small>
        </span>
      </label>
    `;
  }
}
