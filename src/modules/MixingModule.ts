import * as THREE from "three";
import { RubricEvaluator } from "../assessment/RubricEvaluator";
import { ScoreManager } from "../assessment/ScoreManager";
import { getMixingScenario, MixingScenario } from "../data/practicalScenarios";
import { animateError, animateMixing, animatePowderAdded, animatePowderTransfer, animateSuccess } from "../lab/LabAnimations";
import { InteractionFeedback } from "../interactions/InteractionFeedback";
import { LabMaterials } from "../lab/LabMaterials";
import { saveModuleResult } from "../utils/storage";
import { formatPercent, randomRange } from "../utils/numberFormat";
import { lerpHexColor } from "../utils/colorUtils";
import { BaseModule } from "./BaseModule";
import { createSteps } from "./ModuleStep";

export class MixingModule extends BaseModule {
  private readonly scenario: MixingScenario;
  private readonly evaluator = new RubricEvaluator();
  private readonly scoreManager = new ScoreManager();
  private hasIngredientA = false;
  private hasIngredientB = false;
  private ingredientOrder: string[] = [];
  private homogeneity = 0;
  private transferredToContainer = false;
  private isFinished = false;
  private actionHistory: string[] = [];
  private readonly feedback = new InteractionFeedback(this.ui);
  private mortarSet?: THREE.Group;
  private powder?: THREE.Group;
  private finalContainer?: THREE.Group;
  private homogeneityLabel?: THREE.Sprite;
  private statusBadge?: THREE.Sprite;
  private lastFeedback = "";

  constructor(scene: ConstructorParameters<typeof BaseModule>[0], tables: ConstructorParameters<typeof BaseModule>[1], layout: ConstructorParameters<typeof BaseModule>[2], factory: ConstructorParameters<typeof BaseModule>[3], ui: ConstructorParameters<typeof BaseModule>[4], scenario?: MixingScenario, camera?: THREE.Camera) {
    super(scene, tables, layout, factory, ui, camera);
    this.scenario = scenario ?? getMixingScenario();
  }

  async start(): Promise<void> {
    this.steps = createSteps(this.scenario.requiredSteps.map((step) => ({ ...step, required: true })));
    this.scoreManager.startModule("mixing", this.scenario.id, this.scenario.moduleName);
    const table = this.layout.findStation(this.tables, ["mixing-station", "shared-workbench"]);
    if (!table) {
      this.ui.setMessage("Meja pencampuran belum tersedia.", "error");
      return;
    }

    const set = await this.factory.createMortarAndPestleAsync();
    this.mortarSet = set;
    const bottleA = await this.factory.createIngredientBottleAsync({ label: this.scenario.ingredientA, color: 0x86efac });
    bottleA.translateX(-0.36);
    this.markInteractive(bottleA, "Add Ingredient A");
    set.add(bottleA);

    const bottleB = await this.factory.createIngredientBottleAsync({ label: this.scenario.ingredientB, color: 0xfca5a5 });
    bottleB.translateX(0.36);
    this.markInteractive(bottleB, "Add Ingredient B");
    set.add(bottleB);

    this.homogeneityLabel = this.factory.createSpriteLabel("Homogeneity: 0%", 0.34, 0.075);
    this.homogeneityLabel.position.set(0, 0.34, -0.22);
    set.add(this.homogeneityLabel);

    this.finalContainer = await this.factory.createFinalContainerAsync({ amountNormalized: 0.8 });
    this.finalContainer.position.set(0.42, 0, 0);
    this.finalContainer.visible = false;
    this.markInteractive(this.finalContainer, "Finish");
    set.add(this.finalContainer);

    this.installMortarInteractions(set);

    this.placeOnTable(set, table, new THREE.Vector3(0, 0.02, 0));
    this.renderPanel();
  }

  handleAction(action: string): void {
    this.actionHistory.push(action);

    if (action === "Add Ingredient A") {
      this.hasIngredientA = true;
      this.ingredientOrder.push("A");
      this.completeStep("addIngredientA");
      this.lastFeedback = "Ingredient A ditambahkan.";
      this.animateIngredientPour("A");
      this.updatePowder("yellow");
      this.showStatus("A masuk", "success");
      this.feedback.success(this.lastFeedback);
    }

    if (action === "Add Ingredient B") {
      this.hasIngredientB = true;
      this.ingredientOrder.push("B");
      this.completeStep("addIngredientB");
      this.lastFeedback = "Ingredient B ditambahkan.";
      this.animateIngredientPour("B");
      this.updatePowder("white");
      this.showStatus("B masuk", "success");
      this.feedback.success(this.lastFeedback);
    }

    if (action === "Mix 5 Seconds") {
      if (!this.hasIngredientA || !this.hasIngredientB) {
        this.fail("mixPowder", "Ingredient A dan B harus lengkap sebelum mixing.");
        return;
      }
      this.homogeneity = Math.min(100, this.homogeneity + Math.round(randomRange(15, 30)));
      this.completeStep("mixPowder");
      if (this.homogeneity >= this.scenario.requiredHomogeneity) {
        this.completeStep("checkHomogeneity");
        this.showStatus("Homogen", "success");
      }
      this.lastFeedback = `Mixing dilakukan. Homogenitas ${formatPercent(this.homogeneity)}.`;
      animateMixing(this.mortarSet?.getObjectByName("mortar-bowl"), this.mortarSet?.getObjectByName("pestle"));
      this.feedback.info(this.lastFeedback);
    }

    if (action === "Transfer To Container") {
      if (this.homogeneity < this.scenario.requiredHomogeneity) {
        this.fail("checkHomogeneity", "Homogenitas minimal 90% sebelum transfer.");
        return;
      }
      this.transferredToContainer = true;
      this.completeStep("transferToContainer");
      this.lastFeedback = "Campuran dipindahkan ke wadah akhir.";
      this.showStatus("Transfer", "success");
      if (this.mortarSet) {
        animatePowderTransfer(this.mortarSet, new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(0.42, 0.12, 0), LabMaterials.powderMixed);
      }
      animateSuccess(this.finalContainer);
      this.feedback.success(this.lastFeedback);
    }

    if (action === "Finish") {
      if (!this.hasIngredientA || !this.hasIngredientB) {
        this.fail("addIngredientA", "Ingredient A dan B wajib masuk sebelum finish.");
        return;
      }
      this.isFinished = true;
      this.completeStep("finish");
      this.finishModule();
      return;
    }

    this.feedback.info(this.lastFeedback);
    this.updateVisuals();
    this.renderPanel();
  }

  private renderPanel(): void {
    const currentStep = this.getCurrentStep();
    this.ui.showLearningModulePanel(
      this.scenario.moduleName,
      `${this.scenario.ingredientA} + ${this.scenario.ingredientB}, homogenitas minimal ${this.scenario.requiredHomogeneity}%`,
      currentStep?.description ?? "Prosedur selesai.",
      `${this.lastFeedback} Homogenitas: ${formatPercent(this.homogeneity)}. Quest: trigger botol bahan, mortar/pestle untuk mix, badge transfer untuk wadah akhir.`,
      ["Add Ingredient A", "Add Ingredient B", "Mix 5 Seconds", "Transfer To Container", "Finish"],
      this.steps,
    );
  }

  private updateVisuals(): void {
    if (this.powder) {
      const color = lerpHexColor(0xfef3c7, 0xd9f99d, this.homogeneity / 100);
      this.powder.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = this.homogeneity >= this.scenario.requiredHomogeneity ? LabMaterials.powderMixed : new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
        }
      });
    }
    if (this.finalContainer) {
      this.finalContainer.visible = this.transferredToContainer;
    }
    if (this.transferredToContainer && this.powder) {
      this.powder.visible = false;
    }
    if (this.homogeneityLabel) {
      const replacement = this.factory.createSpriteLabel(`Homogeneity: ${formatPercent(this.homogeneity)}`, 0.34, 0.075);
      this.homogeneityLabel.material = replacement.material;
    }
  }

  private fail(stepId: string, message: string): void {
    this.lastFeedback = message;
    this.setStepError(stepId, message);
    this.showStatus("Periksa", "error");
    animateError(this.mortarSet);
    this.feedback.error(message);
    this.renderPanel();
  }

  private finishModule(): void {
    const evaluation = this.evaluator.evaluateMixing({
      hasIngredientA: this.hasIngredientA,
      hasIngredientB: this.hasIngredientB,
      ingredientOrder: this.ingredientOrder,
      homogeneity: this.homogeneity,
      requiredHomogeneity: this.scenario.requiredHomogeneity,
      transferredToContainer: this.transferredToContainer,
      isFinished: this.isFinished,
    });
    this.scoreManager.recordSteps(evaluation.stepResults);
    evaluation.feedbackMessages.forEach((message) => this.scoreManager.addFeedback(message));
    this.scoreManager.setRawData({
      ingredientOrder: this.ingredientOrder,
      homogeneity: this.homogeneity,
      transferredToContainer: this.transferredToContainer,
      actionHistory: this.actionHistory,
      progress: this.getProgress(),
    });
    this.scoreManager.setMetadata({
      scenarioTitle: this.scenario.title,
      ingredients: [this.scenario.ingredientA, this.scenario.ingredientB],
      difficulty: this.scenario.difficulty,
      learningObjectives: this.scenario.learningObjectives,
      selectedAssetMode: this.factory.assetMode,
    });
    const result = this.scoreManager.finishModule();
    saveModuleResult(result);
    this.feedback.finish(result.passed ? "Modul pencampuran selesai dan lulus." : "Modul pencampuran selesai, skor belum lulus.", result.passed);
    this.renderPanel();
    this.ui.showResult(result);
    this.onModuleFinished?.(result);
  }

  private updatePowder(materialType: "white" | "yellow" | "mixed"): void {
    if (!this.mortarSet) return;
    if (this.powder) {
      this.mortarSet.remove(this.powder);
      this.powder.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
    }
    this.powder = this.factory.createPowderMound({
      amountNormalized: this.hasIngredientA && this.hasIngredientB ? 1 : 0.55,
      materialType,
    });
    this.powder.position.set(0, 0.125, 0);
    this.mortarSet.add(this.powder);
    animatePowderAdded(this.powder);
  }

  private showStatus(text: string, status: "success" | "warning" | "error" | "info"): void {
    if (!this.mortarSet) return;
    if (this.statusBadge) {
      this.mortarSet.remove(this.statusBadge);
    }
    this.statusBadge = this.factory.createStatusBadge(text, status);
    this.statusBadge.position.set(0.2, 0.31, 0.08);
    this.mortarSet.add(this.statusBadge);
  }

  private installMortarInteractions(set: THREE.Group): void {
    const mortar = set.getObjectByName("mortar-bowl");
    const pestle = set.getObjectByName("pestle");
    if (mortar) this.markInteractive(mortar, "Mix 5 Seconds");
    if (pestle) this.markInteractive(pestle, "Mix 5 Seconds");

    const mixHotspot = this.createInteractionHotspot("mix-hotspot", "Mix 5 Seconds", 0.12);
    mixHotspot.scale.set(1.2, 0.45, 1.2);
    mixHotspot.position.set(0, 0.19, 0);
    set.add(mixHotspot);

    const transferHotspot = this.createInteractionHotspot("transfer-hotspot", "Transfer To Container", 0.07);
    transferHotspot.position.set(0.27, 0.18, 0.03);
    set.add(transferHotspot);

    const transferLabel = this.factory.createSpriteLabel("Transfer", 0.15, 0.045);
    transferLabel.position.set(0.27, 0.255, 0.03);
    set.add(transferLabel);
  }

  private animateIngredientPour(ingredient: "A" | "B"): void {
    if (!this.mortarSet) return;
    animatePowderTransfer(
      this.mortarSet,
      ingredient === "A" ? new THREE.Vector3(-0.36, 0.28, 0) : new THREE.Vector3(0.36, 0.28, 0),
      new THREE.Vector3(0, 0.16, 0),
      ingredient === "A" ? LabMaterials.powderLightYellow : LabMaterials.powderWhite,
    );
  }
}
