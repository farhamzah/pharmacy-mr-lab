import { describe, expect, it } from "vitest";
import { mixingScenarios, practicalScenarios, weighingScenarios } from "../practicalScenarios";

describe("practicalScenarios", () => {
  it("has at least three weighing and mixing scenarios", () => {
    expect(weighingScenarios.length).toBeGreaterThanOrEqual(3);
    expect(mixingScenarios.length).toBeGreaterThanOrEqual(3);
  });

  it("has required metadata on every scenario", () => {
    practicalScenarios.forEach((scenario) => {
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.learningObjectives.length).toBeGreaterThan(0);
      expect(scenario.safetyNotes.length).toBeGreaterThan(0);
      expect(["basic", "intermediate"]).toContain(scenario.difficulty);
      expect(["weighing", "mixing"]).toContain(scenario.moduleType);
    });
  });

  it("has valid weighing and mixing parameters", () => {
    weighingScenarios.forEach((scenario) => {
      expect(scenario.targetMassGram).toBeGreaterThan(0);
      expect(scenario.toleranceGram).toBeGreaterThan(0);
    });
    mixingScenarios.forEach((scenario) => {
      expect(scenario.requiredHomogeneity).toBeGreaterThan(0);
      expect(scenario.requiredHomogeneity).toBeLessThanOrEqual(100);
    });
  });

  it("has unique ids", () => {
    const ids = practicalScenarios.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
