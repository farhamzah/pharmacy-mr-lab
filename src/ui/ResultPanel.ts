import { ModuleResult } from "../assessment/ModuleResult";

export class ResultPanel {
  constructor(
    private readonly root: HTMLElement,
    private readonly onBackToMenu: () => void,
    private readonly onRetry: () => void,
  ) {}

  render(result: ModuleResult): void {
    this.root.innerHTML = `
      <section class="result-card">
        <p class="eyebrow">Module Result</p>
        <h2>${result.moduleName}</h2>
        <div class="result-meta">
          <p><strong>Scenario:</strong> ${result.scenarioTitle ?? result.scenarioId}</p>
          <p><strong>Difficulty:</strong> ${result.difficulty ?? "unknown"}</p>
          <p><strong>Target:</strong> ${result.materialName ?? result.ingredients?.join(" + ") ?? ""}</p>
          <p><strong>Asset mode:</strong> ${result.selectedAssetMode ?? "unknown"}</p>
        </div>
        <div class="score-line ${result.passed ? "passed" : "failed"}">
          <strong>${result.score}/${result.maxScore}</strong>
          <span>${result.passed ? "Passed" : "Failed"}</span>
        </div>
        <details class="result-details" open>
          <summary>Step details</summary>
          <ul class="result-steps">
            ${result.stepResults
              .map(
                (step) => `
                  <li>
                    <span>${step.label}</span>
                    <strong>${step.score}/${step.maxScore}</strong>
                    <small>${step.feedback}</small>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </details>
        <div class="feedback-list">
          ${result.feedbackMessages.map((message) => `<p>${message}</p>`).join("")}
        </div>
        <div class="button-row">
          <button id="back-to-module-menu" class="primary">Back to Module Menu</button>
          <button id="retry-module">Retry Module</button>
        </div>
      </section>
    `;
    this.root.querySelector("#back-to-module-menu")?.addEventListener("click", this.onBackToMenu);
    this.root.querySelector("#retry-module")?.addEventListener("click", this.onRetry);
  }
}
