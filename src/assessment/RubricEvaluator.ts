import { mixingRubric, PASSING_SCORE, weighingRubric } from "../data/rubrics";
import { StepResult } from "./ModuleResult";

export interface WeighingEvaluationParams {
  hasWeighingBoat: boolean;
  hasTared: boolean;
  sampleMassGram: number;
  targetMassGram: number;
  toleranceGram: number;
  hasConfirmedMass: boolean;
  isFinished: boolean;
}

export interface MixingEvaluationParams {
  hasIngredientA: boolean;
  hasIngredientB: boolean;
  ingredientOrder: string[];
  homogeneity: number;
  requiredHomogeneity: number;
  transferredToContainer: boolean;
  isFinished: boolean;
}

export interface EvaluationResult {
  score: number;
  maxScore: number;
  passed: boolean;
  stepResults: StepResult[];
  feedbackMessages: string[];
}

export class RubricEvaluator {
  evaluateWeighing(params: WeighingEvaluationParams): EvaluationResult {
    const accuracyScore = this.getMassAccuracyScore(params.sampleMassGram, params.targetMassGram, params.toleranceGram);
    const stepResults: StepResult[] = [
      this.step("placeWeighingBoat", "Place weighing boat", params.hasWeighingBoat, params.hasWeighingBoat ? weighingRubric.placingWeighingBoat : 0, weighingRubric.placingWeighingBoat),
      this.step("tareScale", "Tare before sample", params.hasTared, params.hasTared ? weighingRubric.tareBeforeSample : 0, weighingRubric.tareBeforeSample),
      this.step("addSample", "Sample added", params.sampleMassGram > 0, params.sampleMassGram > 0 ? weighingRubric.sampleAdded : 0, weighingRubric.sampleAdded),
      this.step("confirmMass", "Mass accuracy", params.hasConfirmedMass, accuracyScore, weighingRubric.massAccuracy, this.massFeedback(params.sampleMassGram, params.targetMassGram, params.toleranceGram)),
      this.step("finish", "Finish procedure", params.isFinished, params.isFinished ? weighingRubric.finishProcedure : 0, weighingRubric.finishProcedure),
    ];
    return this.toEvaluation(stepResults);
  }

  evaluateMixing(params: MixingEvaluationParams): EvaluationResult {
    const correctOrder = params.ingredientOrder[0] === "A" && params.ingredientOrder[1] === "B";
    const homogeneous = params.homogeneity >= params.requiredHomogeneity;
    const stepResults: StepResult[] = [
      this.step("addIngredientA", "Ingredient A added", params.hasIngredientA, params.hasIngredientA ? mixingRubric.ingredientAAdded : 0, mixingRubric.ingredientAAdded),
      this.step("addIngredientB", "Ingredient B added", params.hasIngredientB, params.hasIngredientB ? mixingRubric.ingredientBAdded : 0, mixingRubric.ingredientBAdded),
      this.step("correctOrder", "Correct order", correctOrder, correctOrder ? mixingRubric.correctOrder : 0, mixingRubric.correctOrder, correctOrder ? "Urutan A lalu B benar." : "Urutan bahan belum benar."),
      this.step("checkHomogeneity", "Homogeneity >= 90%", homogeneous, homogeneous ? mixingRubric.homogeneity : 0, mixingRubric.homogeneity, `Homogenitas akhir ${params.homogeneity}%.`),
      this.step("transferToContainer", "Transfer to final container", params.transferredToContainer, params.transferredToContainer ? mixingRubric.transferToFinalContainer : 0, mixingRubric.transferToFinalContainer),
      this.step("finish", "Finish procedure", params.isFinished, params.isFinished ? mixingRubric.finishProcedure : 0, mixingRubric.finishProcedure),
    ];
    return this.toEvaluation(stepResults);
  }

  private getMassAccuracyScore(mass: number, target: number, tolerance: number): number {
    const diff = Math.abs(mass - target);
    if (diff <= tolerance) return weighingRubric.massAccuracy;
    if (diff <= tolerance * 2) return 20;
    if (diff <= tolerance * 5) return 10;
    return 0;
  }

  private massFeedback(mass: number, target: number, tolerance: number): string {
    const diff = mass - target;
    if (Math.abs(diff) <= tolerance) return "Massa sesuai target.";
    return diff < 0 ? "Massa masih kurang." : "Massa terlalu banyak.";
  }

  private step(stepId: string, label: string, completed: boolean, score: number, maxScore: number, feedback?: string): StepResult {
    return {
      stepId,
      label,
      completed,
      score,
      maxScore,
      feedback: feedback ?? (completed ? "Selesai." : "Belum selesai."),
    };
  }

  private toEvaluation(stepResults: StepResult[]): EvaluationResult {
    const score = stepResults.reduce((total, step) => total + step.score, 0);
    const maxScore = stepResults.reduce((total, step) => total + step.maxScore, 0);
    return {
      score,
      maxScore,
      passed: score >= PASSING_SCORE,
      stepResults,
      feedbackMessages: stepResults.map((step) => `${step.label}: ${step.feedback}`),
    };
  }
}
