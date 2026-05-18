export type AssetCategory = "instrument" | "container" | "material" | "tool" | "ui";

export type LabAssetId =
  | "analytical_scale"
  | "mortar_pestle"
  | "weighing_boat"
  | "ingredient_bottle"
  | "final_container"
  | "spatula"
  | "powder_scoop";

export interface LabAssetDefinition {
  id: LabAssetId;
  category: AssetCategory;
  displayName: string;
  path: string;
  scale: [number, number, number];
  rotation: [number, number, number];
  fallbackType: string;
  required: boolean;
  notes?: string;
}

export const labAssetManifest: LabAssetDefinition[] = [
  { id: "analytical_scale", category: "instrument", displayName: "Analytical Scale", path: "/assets/models/analytical-scale/analytical-scale.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "procedural-scale", required: false },
  { id: "mortar_pestle", category: "instrument", displayName: "Mortar and Pestle", path: "/assets/models/mortar-pestle/mortar-pestle.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "procedural-mortar", required: false },
  { id: "weighing_boat", category: "container", displayName: "Weighing Boat", path: "/assets/models/containers/weighing-boat.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "procedural-weighing-boat", required: false },
  { id: "ingredient_bottle", category: "container", displayName: "Ingredient Bottle", path: "/assets/models/bottles/ingredient-bottle.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "procedural-bottle", required: false },
  { id: "final_container", category: "container", displayName: "Final Container", path: "/assets/models/containers/final-container.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "procedural-final-container", required: false },
  { id: "spatula", category: "tool", displayName: "Spatula", path: "/assets/models/tools/spatula.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "none", required: false },
  { id: "powder_scoop", category: "tool", displayName: "Powder Scoop", path: "/assets/models/tools/powder-scoop.glb", scale: [1, 1, 1], rotation: [0, 0, 0], fallbackType: "none", required: false },
];
