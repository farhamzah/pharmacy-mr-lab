import * as THREE from "three";

export const LabMaterials = {
  plasticWhite: new THREE.MeshStandardMaterial({ color: 0xe8eef3, roughness: 0.46, metalness: 0.02 }),
  warmPlasticWhite: new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.62, metalness: 0.01 }),
  plasticDark: new THREE.MeshStandardMaterial({ color: 0x263241, roughness: 0.58, metalness: 0.02 }),
  rubberBlack: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.78, metalness: 0.01 }),
  porcelain: new THREE.MeshStandardMaterial({ color: 0xf8f3e7, roughness: 0.5, metalness: 0.01 }),
  porcelainShadow: new THREE.MeshStandardMaterial({ color: 0xd7d0c2, roughness: 0.68, metalness: 0.01 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb9c3cc, roughness: 0.24, metalness: 0.55 }),
  brushedMetal: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.18, metalness: 0.72 }),
  screenGreen: new THREE.MeshBasicMaterial({ color: 0x9ef7c7 }),
  amberGlass: new THREE.MeshPhysicalMaterial({
    color: 0xb7791f,
    roughness: 0.16,
    metalness: 0,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  }),
  glassTransparent: new THREE.MeshPhysicalMaterial({
    color: 0xc7f9ff,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  }),
  powderWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }),
  powderLightYellow: new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.92 }),
  powderMixed: new THREE.MeshStandardMaterial({ color: 0xd9f99d, roughness: 0.9 }),
  successGreen: new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.52 }),
  warningYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 }),
  errorRed: new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.55 }),
  hologramBlue: new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.76 }),
  labelBackground: new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.78 }),
};

Object.values(LabMaterials).forEach((material) => {
  material.userData.sharedMaterial = true;
});

export type PowderMaterialType = "white" | "yellow" | "mixed";
export type StatusType = "success" | "warning" | "error" | "info";

export function getPowderMaterial(type: PowderMaterialType): THREE.Material {
  if (type === "white") return LabMaterials.powderWhite;
  if (type === "mixed") return LabMaterials.powderMixed;
  return LabMaterials.powderLightYellow;
}

export function getStatusColor(status: StatusType): string {
  if (status === "success") return "#86efac";
  if (status === "warning") return "#fde68a";
  if (status === "error") return "#fecaca";
  return "#bae6fd";
}
