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
  private readonly raycaster = new THREE.Raycaster();
  onStepChanged?: (steps: ModuleStep[]) => void;
  onModuleFinished?: (result: ModuleResult) => void;

  constructor(
    protected readonly scene: THREE.Scene,
    protected readonly tables: LabTable[],
    protected readonly layout: LabLayoutManager,
    protected readonly factory: LabObjectFactory,
    protected readonly ui: UIManager,
    protected readonly camera?: THREE.Camera,
  ) {
    this.scene.add(this.root);
  }

  abstract start(): void | Promise<void>;
  abstract handleAction(action: string): void;

  handleObjectSelect(controller: THREE.Object3D): boolean {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    origin.setFromMatrixPosition(controller.matrixWorld);
    direction.applyQuaternion(controller.getWorldQuaternion(new THREE.Quaternion())).normalize();
    this.raycaster.set(origin, direction);
    this.raycaster.far = 4;

    const hits = this.raycaster.intersectObject(this.root, true);
    const target = hits
      .map((hit) => this.findInteractiveAction(hit.object))
      .find((action): action is string => typeof action === "string" && action.length > 0);

    if (!target) return false;
    this.handleAction(target);
    return true;
  }

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
    this.faceObjectToUser(object);
    this.root.add(object);
  }

  protected faceObjectToUser(object: THREE.Object3D): void {
    if (!this.camera) return;
    const cameraPosition = new THREE.Vector3();
    this.camera.getWorldPosition(cameraPosition);
    const dx = cameraPosition.x - object.position.x;
    const dz = cameraPosition.z - object.position.z;
    if (Math.abs(dx) + Math.abs(dz) < 0.001) return;
    object.rotation.set(0, Math.atan2(dx, dz), 0);
  }

  protected markInteractive(object: THREE.Object3D, action: string): void {
    object.userData.moduleAction = action;
    object.traverse((child) => {
      child.userData.moduleAction = action;
    });
  }

  protected createInteractionHotspot(name: string, action: string, radius = 0.075): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 18, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const hotspot = new THREE.Mesh(geometry, material);
    hotspot.name = name;
    this.markInteractive(hotspot, action);
    return hotspot;
  }

  private findInteractiveAction(object: THREE.Object3D): string | undefined {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (typeof current.userData.moduleAction === "string") return current.userData.moduleAction;
      current = current.parent;
    }
    return undefined;
  }
}
