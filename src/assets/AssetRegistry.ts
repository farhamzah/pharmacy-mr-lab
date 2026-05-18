import { AssetCategory, LabAssetDefinition, LabAssetId, labAssetManifest } from "./AssetManifest";

export class AssetRegistry {
  constructor(private readonly manifest: LabAssetDefinition[] = labAssetManifest) {}

  getAssetDefinition(id: LabAssetId): LabAssetDefinition | undefined {
    return this.manifest.find((asset) => asset.id === id);
  }

  hasAssetDefinition(id: LabAssetId): boolean {
    return Boolean(this.getAssetDefinition(id));
  }

  listAssets(): LabAssetDefinition[] {
    return [...this.manifest];
  }

  listAssetsByCategory(category: AssetCategory): LabAssetDefinition[] {
    return this.manifest.filter((asset) => asset.category === category);
  }
}
