export type StepStatus = "pending" | "active" | "done" | "error";

export interface ModuleStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  required: boolean;
  completedAt?: string;
  errorMessage?: string;
}

export function createSteps(steps: Array<Omit<ModuleStep, "status">>): ModuleStep[] {
  return steps.map((step, index) => ({
    ...step,
    status: index === 0 ? "active" : "pending",
  }));
}
