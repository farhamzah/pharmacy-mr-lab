import { describe, expect, it } from "vitest";
import { ModuleResult } from "../../assessment/ModuleResult";
import { buildResultHistoryCSV, buildResultJSON } from "../ResultExporter";

const baseResult: ModuleResult = {
  moduleId: "weighing",
  moduleName: "Module",
  scenarioId: "scenario",
  scenarioTitle: "Scenario Title",
  difficulty: "basic",
  selectedAssetMode: "procedural",
  startedAt: "start",
  finishedAt: "finish",
  score: 80,
  maxScore: 100,
  passed: true,
  stepResults: [],
  feedbackMessages: ["ok"],
  rawData: {},
};

describe("ResultExporter pure builders", () => {
  it("CSV contains Stage 5 header", () => {
    const csv = buildResultHistoryCSV([baseResult]);
    expect(csv.split("\n")[0]).toContain("scenarioTitle,difficulty,assetMode");
  });

  it("old result metadata is safe", () => {
    const csv = buildResultHistoryCSV([{ ...baseResult, scenarioTitle: undefined, difficulty: undefined, selectedAssetMode: undefined }]);
    expect(csv).toContain("unknown");
  });

  it("builds valid JSON", () => {
    expect(JSON.parse(buildResultJSON(baseResult)).scenarioTitle).toBe("Scenario Title");
  });

  it("empty history still returns header", () => {
    expect(buildResultHistoryCSV([])).toContain("finishedAt,moduleId");
  });
});
