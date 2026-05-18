import * as THREE from "three";

export class AnchorManager {
  async createAnchorFallback(position: THREE.Vector3, rotation: THREE.Euler): Promise<THREE.Group> {
    const anchor = new THREE.Group();
    anchor.position.copy(position);
    anchor.rotation.copy(rotation);
    return anchor;
  }
}
