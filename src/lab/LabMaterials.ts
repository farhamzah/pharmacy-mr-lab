import * as THREE from "three";

export const LabMaterials = {
  // === Body & Casing ===
  plasticWhite: new THREE.MeshStandardMaterial({ color: 0xe8eef3, roughness: 0.46, metalness: 0.02 }),
  warmPlasticWhite: new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.62, metalness: 0.01 }),
  plasticDark: new THREE.MeshStandardMaterial({ color: 0x263241, roughness: 0.58, metalness: 0.02 }),
  rubberBlack: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.78, metalness: 0.01 }),

  // === Porcelain / Ceramic ===
  porcelain: new THREE.MeshStandardMaterial({ color: 0xf8f3e7, roughness: 0.5, metalness: 0.01 }),
  porcelainShadow: new THREE.MeshStandardMaterial({ color: 0xd7d0c2, roughness: 0.68, metalness: 0.01 }),
  porcelainGlazed: new THREE.MeshPhysicalMaterial({
    color: 0xf5f0e4,
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  }),

  // === Metal ===
  metal: new THREE.MeshStandardMaterial({ color: 0xb9c3cc, roughness: 0.24, metalness: 0.55 }),
  brushedMetal: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.18, metalness: 0.72 }),
  stainlessSteel: new THREE.MeshPhysicalMaterial({
    color: 0xc8cdd3,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 0.3,
    clearcoatRoughness: 0.12,
  }),
  chromeAccent: new THREE.MeshPhysicalMaterial({
    color: 0xe0e5ea,
    roughness: 0.06,
    metalness: 0.95,
    clearcoat: 0.55,
    clearcoatRoughness: 0.04,
  }),
  anodizedAluminum: new THREE.MeshStandardMaterial({
    color: 0x8a949e,
    roughness: 0.32,
    metalness: 0.65,
  }),

  // === Glass ===
  glassTransparent: new THREE.MeshPhysicalMaterial({
    color: 0xc7f9ff,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  }),
  draftShieldGlass: new THREE.MeshPhysicalMaterial({
    color: 0xe8f4f8,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    transmission: 0.92,
    thickness: 0.003,
    ior: 1.52,
  }),
  amberGlass: new THREE.MeshPhysicalMaterial({
    color: 0xb7791f,
    roughness: 0.16,
    metalness: 0,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  }),
  borosilicateGlass: new THREE.MeshPhysicalMaterial({
    color: 0xd4eef5,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    transmission: 0.88,
    thickness: 0.002,
    ior: 1.47,
  }),

  // === Screen / Display ===
  screenGreen: new THREE.MeshBasicMaterial({ color: 0x9ef7c7 }),
  lcdScreen: new THREE.MeshPhysicalMaterial({
    color: 0x0a1628,
    roughness: 0.15,
    metalness: 0.08,
    emissive: 0x091020,
    emissiveIntensity: 0.2,
  }),
  lcdActive: new THREE.MeshBasicMaterial({
    color: 0x4fd1c5,
    transparent: true,
    opacity: 0.95,
  }),
  ledIndicatorGreen: new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.9,
  }),
  ledIndicatorRed: new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.9,
  }),
  ledIndicatorBlue: new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.9,
  }),

  // === Powder & Sample ===
  powderWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }),
  powderLightYellow: new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.92 }),
  powderMixed: new THREE.MeshStandardMaterial({ color: 0xd9f99d, roughness: 0.9 }),
  powderFine: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.96, metalness: 0 }),

  // === Status / UI ===
  successGreen: new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.52 }),
  warningYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 }),
  errorRed: new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.55 }),
  hologramBlue: new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.76 }),
  labelBackground: new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.78 }),

  // === Rubber & Gasket ===
  rubberSeal: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.0,
  }),
  siliconePad: new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.72,
    metalness: 0.0,
  }),

  // === Textured Plastic ===
  texturedPlasticLight: new THREE.MeshStandardMaterial({
    color: 0xdee4ea,
    roughness: 0.55,
    metalness: 0.02,
  }),
  texturedPlasticDark: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.62,
    metalness: 0.03,
  }),

  // === Weighing Pan specific ===
  weighingPanSurface: new THREE.MeshPhysicalMaterial({
    color: 0xd6dce3,
    roughness: 0.10,
    metalness: 0.82,
    clearcoat: 0.35,
    clearcoatRoughness: 0.08,
  }),

  // === Cable / Wire ===
  cablePlastic: new THREE.MeshStandardMaterial({
    color: 0x374151,
    roughness: 0.68,
    metalness: 0.05,
  }),
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
