import * as THREE from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

type SelectHandler = (controller: THREE.Group) => void;

export class ControllerManager {
  private readonly controllers: THREE.Group[] = [];
  private readonly grips: THREE.Group[] = [];
  private readonly hands: THREE.Group[] = [];
  private onSelect: SelectHandler = () => undefined;
  private lastSelectAt = 0;
  private readonly proximityRadius = 0.12;
  private readonly pinchThreshold = 0.025;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly scene: THREE.Scene) {}

  initialize(): void {
    const modelFactory = new XRControllerModelFactory();
    for (let index = 0; index < 2; index += 1) {
      // Controller ray
      const controller = this.renderer.xr.getController(index);
      controller.addEventListener("selectstart", () => this.triggerSelect(controller));
      controller.addEventListener("select", () => this.triggerSelect(controller));
      controller.addEventListener("squeezestart", () => this.triggerSelect(controller));
      controller.add(this.createPointerLine());
      this.scene.add(controller);
      this.controllers.push(controller);

      // Controller grip model
      const grip = this.renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip));
      this.scene.add(grip);
      this.grips.push(grip);

      // Hand tracking
      const hand = this.renderer.xr.getHand(index);
      hand.userData.handIndex = index;
      hand.addEventListener("pinchstart", () => this.triggerSelect(controller));
      hand.addEventListener("selectstart", () => this.triggerSelect(controller));
      hand.add(this.createHandPointer());
      this.scene.add(hand);
      this.hands.push(hand);
      this.controllers.push(hand);
    }
  }

  setSelectHandler(handler: SelectHandler): void {
    this.onSelect = handler;
  }

  getPrimaryController(): THREE.Group | undefined {
    return this.controllers[0];
  }

  getHands(): THREE.Group[] {
    return this.hands;
  }

  getControllers(): THREE.Group[] {
    return this.controllers;
  }

  /** Check if any hand/controller is near a world position */
  isNearPosition(worldPos: THREE.Vector3): THREE.Group | null {
    const pos = new THREE.Vector3();
    for (const ctrl of this.controllers) {
      pos.setFromMatrixPosition(ctrl.matrixWorld);
      if (pos.distanceTo(worldPos) < this.proximityRadius) return ctrl;
    }
    return null;
  }

  dispose(): void {
    this.controllers.forEach((controller) => this.scene.remove(controller));
    this.grips.forEach((grip) => this.scene.remove(grip));
    this.controllers.length = 0;
    this.grips.length = 0;
    this.hands.length = 0;
  }

  private createPointerLine(): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0x67e8f9 });
    const line = new THREE.Line(geometry, material);
    line.name = "controller-pointer";
    line.scale.z = 2;
    return line;
  }

  private createHandPointer(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.014, 14, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x86efac, transparent: true, opacity: 0.82 });
    const pointer = new THREE.Mesh(geometry, material);
    pointer.name = "hand-pinch-pointer";
    return pointer;
  }

  private triggerSelect(controller: THREE.Group): void {
    const now = performance.now();
    if (now - this.lastSelectAt < 160) return;
    this.lastSelectAt = now;
    this.onSelect(controller);
  }
}
