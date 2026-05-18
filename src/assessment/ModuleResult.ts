export interface StepResult {
  stepId: string;
  label: string;
  completed: boolean;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ModuleResult {
  moduleId: string;
  moduleName: string;
  scenarioId: string;
  scenarioTitle?: string;
  materialName?: string;
  ingredients?: string[];
  difficulty?: string;
  learningObjectives?: string[];
  selectedAssetMode?: "procedural" | "external-assets" | "fallback";
  startedAt: string;
  finishedAt: string;
  score: number;
  maxScore: number;
  passed: boolean;
  stepResults: StepResult[];
  feedbackMessages: string[];
  rawData: Record<string, unknown>;
}
