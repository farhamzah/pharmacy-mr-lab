import { ModuleResult } from "../assessment/ModuleResult";
import { getLastModuleResult, getResultHistory } from "../utils/storage";
import { rowsToCsv } from "./csvUtils";

export function buildResultJSON(result: ModuleResult): string {
  return JSON.stringify(result, null, 2);
}

export function buildResultHistoryCSV(history: ModuleResult[]): string {
  const rows = [
    ["finishedAt", "moduleId", "moduleName", "scenarioId", "scenarioTitle", "difficulty", "assetMode", "score", "maxScore", "passed", "feedbackSummary"],
    ...history.map((result: ModuleResult) => [
      result.finishedAt,
      result.moduleId,
      result.moduleName,
      result.scenarioId,
      result.scenarioTitle ?? "",
      result.difficulty ?? "",
      result.selectedAssetMode ?? "unknown",
      result.score,
      result.maxScore,
      result.passed,
      result.feedbackMessages.join(" | "),
    ]),
  ];
  return rowsToCsv(rows);
}

export class ResultExporter {
  exportLastResultAsJSON(): boolean {
    const result = getLastModuleResult();
    if (!result) return false;
    this.download("pharmacy-mr-last-result.json", buildResultJSON(result), "application/json");
    return true;
  }

  exportResultHistoryAsJSON(): boolean {
    const history = getResultHistory();
    if (history.length === 0) return false;
    this.download("pharmacy-mr-result-history.json", JSON.stringify(history, null, 2), "application/json");
    return true;
  }

  exportResultHistoryAsCSV(): boolean {
    const history = getResultHistory();
    if (history.length === 0) return false;
    this.download("pharmacy-mr-result-history.csv", buildResultHistoryCSV(history), "text/csv");
    return true;
  }

  private download(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
