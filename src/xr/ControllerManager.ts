import * as THREE from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

type SelectHandler = (controller: THREE.Group) => void;

export class ControllerManager {
  private readonly controllers: THREE.Group[] = [];
  private readonly grips: THREE.Group[] = [];
  private onSelect: SelectHandler = () => undefined;
  private lastSelectAt = 0;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly scene: THREE.Scene) {}

  initialize(): void {
    const modelFactory = new XRControllerModelFactory();
    for (let index = 0; index < 2; index += 1) {
      const controller = this.renderer.xr.getController(index);
      controller.addEventListener("selectstart", () => this.triggerSelect(controller));
      controller.addEventListener("select", () => this.triggerSelect(controller));
      controller.add(this.createPointerLine());
      this.scene.add(controller);
      this.controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip));
      this.scene.add(grip);
      this.grips.push(grip);

      const hand = this.renderer.xr.getHand(index);
      hand.addEventListener("selectstart", () => this.triggerSelect(hand));
      hand.add(this.createHandPointer());
      this.scene.add(hand);
      this.controllers.push(hand);
    }
  }

  setSelectHandler(handler: SelectHandler): void {
    this.onSelect = handler;
  }

  getPrimaryController(): THREE.Group | undefined {
    return this.controllers[0];
  }

  dispose(): void {
    this.controllers.forEach((controller) => this.scene.remove(controller));
    this.grips.forEach((grip) => this.scene.remove(grip));
    this.controllers.length = 0;
    this.grips.length = 0;
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
    const geometry = new THREE.SphereGeometry(0.018, 12, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x86efac, transparent: true, opacity: 0.72 });
    const pointer = new THREE.Mesh(geometry, material);
    pointer.name = "hand-pinch-pointer";
    return pointer;
  }

  private triggerSelect(controller: THREE.Group): void {
    const now = performance.now();
    if (now - this.lastSelectAt < 180) return;
    this.lastSelectAt = now;
    this.onSelect(controller);
  }
}
