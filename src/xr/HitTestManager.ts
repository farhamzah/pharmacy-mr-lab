import * as THREE from "three";

export class HitTestManager {
  private hitTestSource: XRHitTestSource | null = null;
  private viewerSpace: XRReferenceSpace | null = null;
  private readonly reticle: THREE.Mesh;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly scene: THREE.Scene) {
    this.reticle = this.createReticle();
    this.scene.add(this.reticle);
  }

  async initialize(session: XRSession): Promise<void> {
    this.viewerSpace = await session.requestReferenceSpace("viewer");
    this.hitTestSource = await session.requestHitTestSource?.({ space: this.viewerSpace }) ?? null;
  }

  update(frame: XRFrame, referenceSpace: XRReferenceSpace): void {
    if (!this.hitTestSource) return;
    const hits = frame.getHitTestResults(this.hitTestSource);
    if (hits.length === 0) {
      this.reticle.visible = false;
      return;
    }

    const pose = hits[0].getPose(referenceSpace);
    if (!pose) return;
    this.reticle.visible = true;
    this.reticle.matrix.fromArray(pose.transform.matrix);
  }

  getPlacementPose(): { position: THREE.Vector3; rotation: THREE.Euler } | null {
    if (!this.reticle.visible) return null;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this.reticle.matrix.decompose(position, quaternion, scale);
    return { position, rotation: new THREE.Euler().setFromQuaternion(quaternion) };
  }

  dispose(): void {
    this.hitTestSource?.cancel();
    this.hitTestSource = null;
    this.reticle.visible = false;
  }

  private createReticle(): THREE.Mesh {
    const geometry = new THREE.RingGeometry(0.08, 0.105, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.visible = false;
    return mesh;
  }
}
