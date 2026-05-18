import { describe, expect, it } from "vitest";
import { getWeighingScenario } from "../../data/practicalScenarios";
import { WeighingModuleStateMachine } from "../WeighingModuleStateMachine";

describe("WeighingModuleStateMachine", () => {
  it("cannot tare before weighing boat", () => {
    const sm = new WeighingModuleStateMachine(getWeighingScenario());
    expect(sm.tare()).toBe(false);
  });

  it("place boat then tare is valid", () => {
    const sm = new WeighingModuleStateMachine(getWeighingScenario());
    sm.placeWeighingBoat();
    expect(sm.tare()).toBe(true);
  });

  it("rejects add sample before tare", () => {
    const sm = new WeighingModuleStateMachine(getWeighingScenario());
    expect(sm.addSample("small", 0.1)).toBe(false);
  });

  it("reports mass less/match/more", () => {
    const scenario = getWeighingScenario();
    const sm = new WeighingModuleStateMachine(scenario);
    sm.placeWeighingBoat(); sm.tare(); sm.addSample("small", scenario.targetMassGram); sm.confirmMass();
    expect(sm.state.lastFeedback).toBe("Massa sesuai target.");
  });

  it("finishes after confirm", () => {
    const sm = new WeighingModuleStateMachine(getWeighingScenario("weighing_lactose_1g"));
    sm.placeWeighingBoat(); sm.tare(); sm.addSample("large", 1); sm.confirmMass();
    expect(sm.finish()).toBe(true);
    expect(sm.state.isFinished).toBe(true);
  });
});
