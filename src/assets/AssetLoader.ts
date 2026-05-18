import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { LabAssetId } from "./AssetManifest";
import { AssetRegistry } from "./AssetRegistry";

export type AssetLoadStatus = "Available" | "Missing / Fallback" | "Not loaded" | "Error" | "Loading";
type StatusListener = (statuses: Array<{ id: LabAssetId; status: AssetLoadStatus }>) => void;
type LoadFunction = (path: string) => Promise<{ scene: THREE.Object3D }>;

export class AssetLoader {
  private readonly gltfLoader = new GLTFLoader();
  private readonly cache = new Map<LabAssetId, THREE.Object3D | null>();
  private readonly statuses = new Map<LabAssetId, AssetLoadStatus>();
  private readonly listeners = new Set<StatusListener>();

  constructor(private readonly registry = new AssetRegistry(), private readonly loadFunction?: LoadFunction) {}

  async loadAsset(assetId: LabAssetId): Promise<THREE.Object3D | null> {
    if (this.cache.has(assetId)) return this.cloneLoadedScene(assetId);
    const definition = this.registry.getAssetDefinition(assetId);
    if (!definition) {
      this.setStatus(assetId, "Error");
      console.warn(`Asset definition tidak ditemukan: ${assetId}`);
      return null;
    }

    try {
      this.setStatus(assetId, "Loading");
      const gltf = this.loadFunction ? await this.loadFunction(definition.path) : await this.gltfLoader.loadAsync(definition.path);
      const scene = gltf.scene;
      scene.name = definition.displayName;
      scene.scale.set(...definition.scale);
      scene.rotation.set(...definition.rotation);
      this.cache.set(assetId, scene);
      this.setStatus(assetId, "Available");
      return this.cloneLoadedScene(assetId);
    } catch (error) {
      console.warn(`Asset GLB tidak ditemukan, menggunakan procedural fallback: ${assetId}`, error);
      this.cache.set(assetId, null);
      this.setStatus(assetId, "Missing / Fallback");
      return null;
    }
  }

  async preloadAssets(assetIds: LabAssetId[]): Promise<void> {
    await Promise.all(assetIds.map((id) => this.loadAsset(id)));
  }

  getCachedAsset(assetId: LabAssetId): THREE.Object3D | null | undefined {
    return this.cache.get(assetId);
  }

  clearCache(): void {
    this.cache.clear();
    this.statuses.clear();
    this.emit();
  }

  cloneLoadedScene(assetId: LabAssetId): THREE.Object3D | null {
    const cached = this.cache.get(assetId);
    if (!cached) return null;
    return cloneSkeleton(cached);
  }

  getStatus(assetId: LabAssetId): AssetLoadStatus {
    return this.statuses.get(assetId) ?? "Not loaded";
  }

  getStatuses(): Array<{ id: LabAssetId; status: AssetLoadStatus }> {
    return this.registry.listAssets().map((asset) => ({ id: asset.id, status: this.getStatus(asset.id) }));
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatuses());
    return () => this.listeners.delete(listener);
  }

  private setStatus(assetId: LabAssetId, status: AssetLoadStatus): void {
    this.statuses.set(assetId, status);
    this.emit();
  }

  private emit(): void {
    const statuses = this.getStatuses();
    this.listeners.forEach((listener) => listener(statuses));
  }
}
