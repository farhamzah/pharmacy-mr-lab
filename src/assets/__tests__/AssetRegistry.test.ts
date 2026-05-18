import { describe, expect, it } from "vitest";
import { AssetRegistry } from "../AssetRegistry";

describe("AssetRegistry", () => {
  const registry = new AssetRegistry();

  it("lists manifest assets", () => expect(registry.listAssets().length).toBeGreaterThan(0));
  it("finds analytical scale", () => expect(registry.getAssetDefinition("analytical_scale")?.displayName).toContain("Scale"));
  it("lists instrument category", () => expect(registry.listAssetsByCategory("instrument").length).toBeGreaterThan(0));
  it("handles unknown asset", () => expect(registry.hasAssetDefinition("unknown" as never)).toBe(false));
});
