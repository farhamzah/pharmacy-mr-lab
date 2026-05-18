import * as THREE from "three";

export function disposeObject3D(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Sprite || child instanceof THREE.Line) {
      const meshLike = child as THREE.Mesh | THREE.Sprite | THREE.Line;
      const geometry = (meshLike as THREE.Mesh | THREE.Line).geometry;
      geometry?.dispose?.();
      disposeMaterial(meshLike.material);
    }
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[] | undefined): void {
  if (!material) return;
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((item) => {
    if (item.userData.sharedMaterial) return;
    const map = (item as THREE.Material & { map?: THREE.Texture }).map;
    if (map?.userData.dynamicTexture) {
      map.dispose();
    }
    if (item.userData.dynamicMaterial || map?.userData.dynamicTexture) {
      item.dispose();
    }
  });
}
