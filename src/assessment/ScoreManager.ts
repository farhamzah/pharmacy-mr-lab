import { PASSING_SCORE } from "../data/rubrics";
import { ModuleResult, StepResult } from "./ModuleResult";

export class ScoreManager {
  private moduleId = "";
  private moduleName = "";
  private scenarioId = "";
  private startedAt = "";
  private finishedAt = "";
  private stepResults: StepResult[] = [];
  private feedbackMessages: string[] = [];
  private rawData: Record<string, unknown> = {};
  private metadata: Partial<ModuleResult> = {};

  startModule(moduleId: string, scenarioId: string, moduleName = moduleId): void {
    this.moduleId = moduleId;
    this.moduleName = moduleName;
    this.scenarioId = scenarioId;
    this.startedAt = new Date().toISOString();
    this.finishedAt = "";
    this.stepResults = [];
    this.feedbackMessages = [];
    this.rawData = {};
    this.metadata = {};
  }

  recordStep(stepId: string, completed: boolean, score: number, maxScore: number, feedback: string): void {
    const result: StepResult = { stepId, label: stepId, completed, score, maxScore, feedback };
    const existingIndex = this.stepResults.findIndex((step) => step.stepId === stepId);
    if (existingIndex >= 0) {
      this.stepResults[existingIndex] = result;
    } else {
      this.stepResults.push(result);
    }
  }

  recordSteps(results: StepResult[]): void {
    this.stepResults = results;
  }

  addFeedback(message: string): void {
    if (message) {
      this.feedbackMessages.push(message);
    }
  }

  setRawData(rawData: Record<string, unknown>): void {
    this.rawData = rawData;
  }

  setMetadata(metadata: Partial<ModuleResult>): void {
    this.metadata = metadata;
  }

  finishModule(): ModuleResult {
    this.finishedAt = new Date().toISOString();
    return this.getResult();
  }

  getResult(): ModuleResult {
    const score = this.stepResults.reduce((total, step) => total + step.score, 0);
    const maxScore = this.stepResults.reduce((total, step) => total + step.maxScore, 0) || 100;
    return {
      moduleId: this.moduleId,
      moduleName: this.moduleName,
      scenarioId: this.scenarioId,
      ...this.metadata,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      score,
      maxScore,
      passed: score >= PASSING_SCORE,
      stepResults: this.stepResults,
      feedbackMessages: this.feedbackMessages,
      rawData: this.rawData,
    };
  }

  reset(): void {
    this.moduleId = "";
    this.moduleName = "";
    this.scenarioId = "";
    this.startedAt = "";
    this.finishedAt = "";
    this.stepResults = [];
    this.feedbackMessages = [];
    this.rawData = {};
    this.metadata = {};
  }
}
