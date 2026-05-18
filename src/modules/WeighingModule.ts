import * as THREE from "three";
import { RubricEvaluator } from "../assessment/RubricEvaluator";
import { ScoreManager } from "../assessment/ScoreManager";
import { getWeighingScenario, WeighingScenario } from "../data/practicalScenarios";
import { animateError, animatePowderAdded, animatePowderTransfer, animateScaleReading, animateSuccess } from "../lab/LabAnimations";
import { InteractionFeedback } from "../interactions/InteractionFeedback";
import { LabMaterials } from "../lab/LabMaterials";
import { saveModuleResult } from "../utils/storage";
import { formatGram, randomRange } from "../utils/numberFormat";
import { BaseModule } from "./BaseModule";
import { createSteps } from "./ModuleStep";

export class WeighingModule extends BaseModule {
  private readonly scenario: WeighingScenario;
  private readonly evaluator = new RubricEvaluator();
  private readonly scoreManager = new ScoreManager();
  private hasWeighingBoat = false;
  private hasTared = false;
  private sampleMassGram = 0;
  private hasConfirmedMass = false;
  private isFinished = false;
  private actionHistory: string[] = [];
  private readonly feedback = new InteractionFeedback(this.ui);
  private scaleGroup?: THREE.Group;
  private weighingBoat?: THREE.Group;
  private powder?: THREE.Group;
  private statusBadge?: THREE.Sprite;
  private guideBadge?: THREE.Sprite;
  private lastFeedback = "";

  constructor(scene: ConstructorParameters<typeof BaseModule>[0], tables: ConstructorParameters<typeof BaseModule>[1], layout: ConstructorParameters<typeof BaseModule>[2], factory: ConstructorParameters<typeof BaseModule>[3], ui: ConstructorParameters<typeof BaseModule>[4], scenario?: WeighingScenario, camera?: THREE.Camera) {
    super(scene, tables, layout, factory, ui, camera);
    this.scenario = scenario ?? getWeighingScenario();
  }

  async start(): Promise<void> {
    this.steps = createSteps(this.scenario.requiredSteps.map((step) => ({ ...step, required: true })));
    this.scoreManager.startModule("weighing", this.scenario.id, this.scenario.moduleName);
    const table = this.layout.findStation(this.tables, ["weighing-station", "shared-workbench"]);
    if (!table) {
      this.ui.setMessage("Meja penimbangan belum tersedia.", "error");
      return;
    }

    const scale = await this.factory.createAnalyticalScaleAsync();
    this.scaleGroup = scale;
    const bottle = await this.factory.createIngredientBottleAsync({ label: this.scenario.materialName, color: 0xfbbf24 });
    bottle.position.set(-0.34, 0, -0.02);
    this.markInteractive(bottle, "Add Small Sample");
    scale.add(bottle);
    this.installScaleInteractions(scale);
    this.placeOnTable(scale, table, new THREE.Vector3(0, 0.02, 0));
    this.faceObjectToUser(scale);
    this.showGuide("1. Trigger piring timbangan");
    this.renderPanel();
  }

  handleAction(action: string): void {
    this.actionHistory.push(action);

    if (action === "Place Weighing Boat") {
      if (this.hasWeighingBoat) {
        this.lastFeedback = "Weighing boat sudah ada. Trigger botol untuk menambah sampel.";
        this.feedback.info(this.lastFeedback);
        this.renderPanel();
        return;
      }
      this.hasWeighingBoat = true;
      this.lastFeedback = "Weighing boat diletakkan.";
      void this.showWeighingBoat();
      this.showStatus("Sesuai", "success");
      animateSuccess(this.weighingBoat);
      this.feedback.success(this.lastFeedback);
      this.completeStep("placeWeighingBoat");
      this.showGuide("2. Tekan tombol TARE");
    }

    if (action === "Tare / Zero") {
      if (!this.hasWeighingBoat) {
        this.fail("placeWeighingBoat", "Letakkan weighing boat terlebih dahulu.");
        return;
      }
      this.hasTared = true;
      this.sampleMassGram = 0;
      this.lastFeedback = "Timbangan dinolkan.";
      this.updateDisplay();
      animateScaleReading(this.scaleGroup?.getObjectByName("scale-display-text"));
      this.feedback.success(this.lastFeedback);
      this.completeStep("tareScale");
      this.showGuide("3. Trigger botol bahan");
    }

    if (action === "Add Small Sample") {
      if (!this.ensureTared()) return;
      this.sampleMassGram += randomRange(0.001, 0.01);
      this.lastFeedback = `Sampel kecil ditambahkan. Massa ${formatGram(this.sampleMassGram)}.`;
      this.animateSamplePour();
      this.updateDisplay();
      this.updateMassStatus();
      this.feedback.info(this.lastFeedback);
      this.completeStep("addSample");
      this.showGuide("4. Atur massa, lalu trigger display");
    }

    if (action === "Add Large Sample") {
      if (!this.ensureTared()) return;
      this.sampleMassGram += randomRange(0.025, 0.075);
      this.lastFeedback = `Sampel besar ditambahkan. Massa ${formatGram(this.sampleMassGram)}.`;
      this.animateSamplePour(true);
      this.updateDisplay();
      this.updateMassStatus();
      this.feedback.info(this.lastFeedback);
      this.completeStep("addSample");
      this.showGuide("4. Atur massa, lalu trigger display");
    }

    if (action === "Remove Small Sample") {
      const removed = randomRange(0.001, 0.01);
      this.sampleMassGram = Math.max(0, this.sampleMassGram - removed);
      this.lastFeedback = `Sampel dikurangi. Massa ${formatGram(this.sampleMassGram)}.`;
      this.updateDisplay();
      this.updateMassStatus();
      this.feedback.warning(this.lastFeedback);
    }

    if (action === "Confirm Mass") {
      if (this.sampleMassGram <= 0) {
        this.fail("addSample", "Tambahkan sample terlebih dahulu.");
        return;
      }
      this.hasConfirmedMass = true;
      this.completeStep("confirmMass");
      this.lastFeedback = this.getMassFeedback();
      const ok = Math.abs(this.sampleMassGram - this.scenario.targetMassGram) <= this.scenario.toleranceGram;
      if (ok) {
        this.showStatus("Sesuai", "success");
        animateSuccess(this.scaleGroup);
        this.feedback.success(this.lastFeedback);
      } else {
        this.showStatus(this.sampleMassGram < this.scenario.targetMassGram ? "Kurang" : "Terlalu banyak", "error");
        animateError(this.scaleGroup);
        this.feedback.error(this.lastFeedback);
      }
      this.showGuide("5. Trigger Finish jika siap");
    }

    if (action === "Finish") {
      if (!this.hasConfirmedMass) {
        this.fail("confirmMass", "Konfirmasi massa sebelum finish.");
        return;
      }
      this.isFinished = true;
      this.completeStep("finish");
      this.finishModule();
      return;
    }

    this.feedback.info(this.lastFeedback);
    this.updateDisplay();
    this.renderPanel();
  }

  private renderPanel(): void {
    const currentStep = this.getCurrentStep();
    this.ui.showLearningModulePanel(
      this.scenario.moduleName,
      `${this.scenario.materialName} ${formatGram(this.scenario.targetMassGram)} toleransi +/- ${formatGram(this.scenario.toleranceGram)}`,
      currentStep?.description ?? "Prosedur selesai.",
      `${this.lastFeedback} Massa: ${formatGram(this.sampleMassGram)}. Gunakan controller ke objek: piring -> TARE -> botol -> display -> Finish.`,
      ["Place Weighing Boat", "Tare / Zero", "Add Small Sample", "Remove Small Sample", "Confirm Mass", "Finish"],
      this.steps,
    );
  }

  private updateDisplay(): void {
    if (!this.scaleGroup) return;
    this.factory.updateScaleDisplay(this.scaleGroup, formatGram(this.sampleMassGram));
    this.updatePowder();
    animateScaleReading(this.scaleGroup.getObjectByName("scale-display-text"));
  }

  private ensureTared(): boolean {
    if (!this.hasTared) {
      this.fail("tareScale", "Tare / Zero harus dilakukan sebelum menambah sample.");
      return false;
    }
    return true;
  }

  private fail(stepId: string, message: string): void {
    this.lastFeedback = message;
    this.setStepError(stepId, message);
    this.showStatus("Periksa", "error");
    animateError(this.scaleGroup);
    this.feedback.error(message);
    this.renderPanel();
  }

  private getMassFeedback(): string {
    const diff = this.sampleMassGram - this.scenario.targetMassGram;
    if (Math.abs(diff) <= this.scenario.toleranceGram) return "Massa sesuai target.";
    return diff < 0 ? "Massa masih kurang." : "Massa terlalu banyak.";
  }

  private finishModule(): void {
    const evaluation = this.evaluator.evaluateWeighing({
      hasWeighingBoat: this.hasWeighingBoat,
      hasTared: this.hasTared,
      sampleMassGram: this.sampleMassGram,
      targetMassGram: this.scenario.targetMassGram,
      toleranceGram: this.scenario.toleranceGram,
      hasConfirmedMass: this.hasConfirmedMass,
      isFinished: this.isFinished,
    });
    this.scoreManager.recordSteps(evaluation.stepResults);
    evaluation.feedbackMessages.forEach((message) => this.scoreManager.addFeedback(message));
    this.scoreManager.setRawData({
      sampleMassGram: this.sampleMassGram,
      actionHistory: this.actionHistory,
      progress: this.getProgress(),
    });
    this.scoreManager.setMetadata({
      scenarioTitle: this.scenario.title,
      materialName: this.scenario.materialName,
      difficulty: this.scenario.difficulty,
      learningObjectives: this.scenario.learningObjectives,
      selectedAssetMode: this.factory.assetMode,
    });
    const result = this.scoreManager.finishModule();
    saveModuleResult(result);
    this.feedback.finish(result.passed ? "Modul penimbangan selesai dan lulus." : "Modul penimbangan selesai, skor belum lulus.", result.passed);
    this.renderPanel();
    this.ui.showResult(result);
    this.onModuleFinished?.(result);
  }

  private async showWeighingBoat(): Promise<void> {
    if (!this.scaleGroup || this.weighingBoat) return;
    const plateHotspot = this.scaleGroup.getObjectByName("place-boat-hotspot");
    if (plateHotspot) this.scaleGroup.remove(plateHotspot);
    this.weighingBoat = await this.factory.createWeighingBoatAsync();
    this.weighingBoat.position.set(0, 0.155, 0);
    this.markInteractive(this.weighingBoat, "Remove Small Sample");
    this.scaleGroup.add(this.weighingBoat);
  }

  private updatePowder(): void {
    if (!this.weighingBoat) return;
    if (this.powder) {
      this.weighingBoat.remove(this.powder);
      this.powder.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
    }
    if (this.sampleMassGram <= 0) {
      this.powder = undefined;
      return;
    }
    const amountNormalized = Math.min(1.5, this.sampleMassGram / this.scenario.targetMassGram);
    this.powder = this.factory.createPowderMound({ amountNormalized, materialType: "yellow" });
    this.powder.position.y = 0.04;
    this.weighingBoat.add(this.powder);
    animatePowderAdded(this.powder);
  }

  private installScaleInteractions(scale: THREE.Group): void {
    const plateHotspot = this.createInteractionHotspot("place-boat-hotspot", "Place Weighing Boat", 0.105);
    plateHotspot.scale.set(1.2, 0.22, 1.2);
    plateHotspot.position.set(0, 0.18, 0);
    scale.add(plateHotspot);

    const tareButton = scale.getObjectByName("tare-button");
    if (tareButton) this.markInteractive(tareButton, "Tare / Zero");

    const display = scale.getObjectByName("scale-display-text");
    if (display) this.markInteractive(display, "Confirm Mass");

    const finishHotspot = this.createInteractionHotspot("finish-weighing-hotspot", "Finish", 0.065);
    finishHotspot.position.set(0.24, 0.18, 0.18);
    scale.add(finishHotspot);

    const finishLabel = this.factory.createSpriteLabel("Finish", 0.12, 0.045);
    finishLabel.position.set(0.24, 0.25, 0.18);
    scale.add(finishLabel);
  }

  private showGuide(text: string): void {
    if (!this.scaleGroup) return;
    if (this.guideBadge) this.scaleGroup.remove(this.guideBadge);
    this.guideBadge = this.factory.createStatusBadge(text, "info");
    this.guideBadge.position.set(0, 0.5, 0.02);
    this.scaleGroup.add(this.guideBadge);
  }

  private updateMassStatus(): void {
    const diff = this.sampleMassGram - this.scenario.targetMassGram;
    if (Math.abs(diff) <= this.scenario.toleranceGram) {
      this.showStatus("Sesuai", "success");
    } else if (diff < 0) {
      this.showStatus("Kurang", "warning");
    } else {
      this.showStatus("Terlalu banyak", "error");
    }
  }

  private animateSamplePour(large = false): void {
    if (!this.scaleGroup) return;
    animatePowderTransfer(
      this.scaleGroup,
      new THREE.Vector3(-0.34, 0.28, -0.02),
      new THREE.Vector3(0, 0.2, 0),
      LabMaterials.powderLightYellow,
    );
    if (large) animateSuccess(this.scaleGroup.getObjectByName(`${this.scenario.materialName} Bottle`));
  }

  private showStatus(text: string, status: "success" | "warning" | "error" | "info"): void {
    if (!this.scaleGroup) return;
    if (this.statusBadge) {
      this.scaleGroup.remove(this.statusBadge);
    }
    this.statusBadge = this.factory.createStatusBadge(text, status);
    this.statusBadge.position.set(0.18, 0.3, 0.05);
    this.scaleGroup.add(this.statusBadge);
  }
}
