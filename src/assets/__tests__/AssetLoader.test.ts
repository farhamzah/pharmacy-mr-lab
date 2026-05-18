import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { AssetLoader } from "../AssetLoader";

describe("AssetLoader", () => {
  it("missing asset returns null and status fallback", async () => {
    const loader = new AssetLoader(undefined, async () => {
      throw new Error("missing");
    });
    await expect(loader.loadAsset("analytical_scale")).resolves.toBeNull();
    expect(loader.getStatus("analytical_scale")).toBe("Missing / Fallback");
  });

  it("clears cache and statuses", async () => {
    const loader = new AssetLoader(undefined, async () => ({ scene: new THREE.Group() }));
    await loader.loadAsset("analytical_scale");
    loader.clearCache();
    expect(loader.getStatus("analytical_scale")).toBe("Not loaded");
  });

  it("clones cached object", () => {
    const loader = new AssetLoader();
    const cached = new THREE.Group();
    (loader as unknown as { cache: Map<string, THREE.Object3D> }).cache.set("analytical_scale", cached);
    const clone = loader.cloneLoadedScene("analytical_scale");
    expect(clone).not.toBe(cached);
  });

  it("emits status changes", async () => {
    const loader = new AssetLoader(undefined, async () => {
      throw new Error("missing");
    });
    const seen: string[] = [];
    loader.subscribe((statuses) => seen.push(statuses.find((s) => s.id === "analytical_scale")?.status ?? ""));
    await loader.loadAsset("analytical_scale");
    expect(seen).toContain("Loading");
    expect(seen).toContain("Missing / Fallback");
  });
});
