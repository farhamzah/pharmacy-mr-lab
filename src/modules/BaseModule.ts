import * as THREE from "three";
import { LabLayoutManager } from "../lab/LabLayoutManager";
import { LabObjectFactory } from "../lab/LabObjectFactory";
import { LabTable } from "../lab/LabTable";
import { UIManager } from "../ui/UIManager";
import { ModuleResult } from "../assessment/ModuleResult";
import { disposeObject3D } from "../utils/disposeObject3D";
import { ModuleStep } from "./ModuleStep";

export abstract class BaseModule {
  protected readonly root = new THREE.Group();
  protected steps: ModuleStep[] = [];
  protected currentStepIndex = 0;
  onStepChanged?: (steps: ModuleStep[]) => void;
  onModuleFinished?: (result: ModuleResult) => void;

  constructor(
    protected readonly scene: THREE.Scene,
    protected readonly tables: LabTable[],
    protected readonly layout: LabLayoutManager,
    protected readonly factory: LabObjectFactory,
    protected readonly ui: UIManager,
  ) {
    this.scene.add(this.root);
  }

  abstract start(): void | Promise<void>;
  abstract handleAction(action: string): void;

  reset(): void {
    this.currentStepIndex = 0;
    this.steps = this.steps.map((step, index) => ({
      ...step,
      status: index === 0 ? "active" : "pending",
      completedAt: undefined,
      errorMessage: undefined,
    }));
    this.onStepChanged?.(this.steps);
  }

  completeStep(stepId: string): void {
    const stepIndex = this.steps.findIndex((step) => step.id === stepId);
    if (stepIndex < 0) return;
    this.steps[stepIndex] = {
      ...this.steps[stepIndex],
      status: "done",
      completedAt: new Date().toISOString(),
      errorMessage: undefined,
    };

    const nextIndex = this.steps.findIndex((step) => step.status === "pending");
    if (nextIndex >= 0) {
      this.currentStepIndex = nextIndex;
      this.steps[nextIndex] = { ...this.steps[nextIndex], status: "active", errorMessage: undefined };
    } else {
      this.currentStepIndex = this.steps.length - 1;
    }
    this.onStepChanged?.(this.steps);
  }

  setStepError(stepId: string, message: string): void {
    const stepIndex = this.steps.findIndex((step) => step.id === stepId);
    if (stepIndex < 0) return;
    this.steps[stepIndex] = { ...this.steps[stepIndex], status: "error", errorMessage: message };
    this.currentStepIndex = stepIndex;
    this.onStepChanged?.(this.steps);
  }

  getProgress(): { completed: number; total: number; percent: number } {
    const completed = this.steps.filter((step) => step.status === "done").length;
    const total = this.steps.length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  getCurrentStep(): ModuleStep | undefined {
    return this.steps[this.currentStepIndex] ?? this.steps.find((step) => step.status === "active");
  }

  dispose(): void {
    disposeObject3D(this.root);
    this.scene.remove(this.root);
    this.root.clear();
  }

  protected placeOnTable(object: THREE.Object3D, table: LabTable, offset = new THREE.Vector3()): void {
    object.position.copy(table.group.position).add(offset);
    object.rotation.copy(table.group.rotation);
    this.root.add(object);
  }
}
