import { describe, expect, it } from "vitest";
import { getMixingScenario } from "../../data/practicalScenarios";
import { MixingModuleStateMachine } from "../MixingModuleStateMachine";

describe("MixingModuleStateMachine", () => {
  it("rejects mix before ingredients", () => {
    const sm = new MixingModuleStateMachine(getMixingScenario());
    expect(sm.mix()).toBe(false);
  });

  it("tracks correct order", () => {
    const sm = new MixingModuleStateMachine(getMixingScenario());
    sm.addIngredientA(); sm.addIngredientB();
    expect(sm.isCorrectOrder()).toBe(true);
  });

  it("tracks wrong order", () => {
    const sm = new MixingModuleStateMachine(getMixingScenario());
    sm.addIngredientB(); sm.addIngredientA();
    expect(sm.isCorrectOrder()).toBe(false);
  });

  it("rejects transfer before enough homogeneity", () => {
    const sm = new MixingModuleStateMachine(getMixingScenario("mixing_dilution_powder"));
    sm.addIngredientA(); sm.addIngredientB(); sm.mix(50);
    expect(sm.transfer()).toBe(false);
  });

  it("finishes after ingredients", () => {
    const sm = new MixingModuleStateMachine(getMixingScenario());
    sm.addIngredientA(); sm.addIngredientB();
    expect(sm.finish()).toBe(true);
  });
});
