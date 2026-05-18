import { describe, expect, it } from "vitest";
import { RubricEvaluator } from "../RubricEvaluator";

const evaluator = new RubricEvaluator();

describe("RubricEvaluator weighing", () => {
  it("gives full mass accuracy at target", () => {
    const result = evaluator.evaluateWeighing({ hasWeighingBoat: true, hasTared: true, sampleMassGram: 0.5, targetMassGram: 0.5, toleranceGram: 0.005, hasConfirmedMass: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "confirmMass")?.score).toBe(35);
    expect(result.passed).toBe(true);
  });

  it("passes when mass is within tolerance", () => {
    const result = evaluator.evaluateWeighing({ hasWeighingBoat: true, hasTared: true, sampleMassGram: 0.504, targetMassGram: 0.5, toleranceGram: 0.005, hasConfirmedMass: true, isFinished: true });
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  it("gives partial score within 2x tolerance", () => {
    const result = evaluator.evaluateWeighing({ hasWeighingBoat: true, hasTared: true, sampleMassGram: 0.509, targetMassGram: 0.5, toleranceGram: 0.005, hasConfirmedMass: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "confirmMass")?.score).toBe(20);
  });

  it("gives zero mass accuracy when far from target", () => {
    const result = evaluator.evaluateWeighing({ hasWeighingBoat: true, hasTared: true, sampleMassGram: 0.6, targetMassGram: 0.5, toleranceGram: 0.005, hasConfirmedMass: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "confirmMass")?.score).toBe(0);
  });

  it("reduces score without tare", () => {
    const result = evaluator.evaluateWeighing({ hasWeighingBoat: true, hasTared: false, sampleMassGram: 0.5, targetMassGram: 0.5, toleranceGram: 0.005, hasConfirmedMass: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "tareScale")?.score).toBe(0);
  });
});

describe("RubricEvaluator mixing", () => {
  it("scores high for correct order and homogeneity", () => {
    const result = evaluator.evaluateMixing({ hasIngredientA: true, hasIngredientB: true, ingredientOrder: ["A", "B"], homogeneity: 95, requiredHomogeneity: 90, transferredToContainer: true, isFinished: true });
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("reduces score for wrong order", () => {
    const result = evaluator.evaluateMixing({ hasIngredientA: true, hasIngredientB: true, ingredientOrder: ["B", "A"], homogeneity: 95, requiredHomogeneity: 90, transferredToContainer: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "correctOrder")?.score).toBe(0);
  });

  it("reduces score for low homogeneity", () => {
    const result = evaluator.evaluateMixing({ hasIngredientA: true, hasIngredientB: true, ingredientOrder: ["A", "B"], homogeneity: 70, requiredHomogeneity: 90, transferredToContainer: true, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "checkHomogeneity")?.score).toBe(0);
  });

  it("reduces score when not transferred", () => {
    const result = evaluator.evaluateMixing({ hasIngredientA: true, hasIngredientB: true, ingredientOrder: ["A", "B"], homogeneity: 95, requiredHomogeneity: 90, transferredToContainer: false, isFinished: true });
    expect(result.stepResults.find((s) => s.stepId === "transferToContainer")?.score).toBe(0);
  });
});
