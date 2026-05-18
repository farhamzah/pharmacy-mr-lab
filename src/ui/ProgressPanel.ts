import { ModuleStep } from "../modules/ModuleStep";

export class ProgressPanel {
  constructor(private readonly root: HTMLElement) {}

  render(steps: ModuleStep[]): void {
    this.root.innerHTML = `
      <h2>Progress</h2>
      <ol class="step-list">
        ${steps
          .map(
            (step) => `
              <li data-status="${step.status}">
                <span><b>${this.icon(step.status)}</b>${step.label}</span>
                <strong>${step.status}</strong>
              </li>
            `,
          )
          .join("")}
      </ol>
    `;
  }

  private icon(status: ModuleStep["status"]): string {
    if (status === "done") return "✓ ";
    if (status === "active") return "→ ";
    if (status === "error") return "! ";
    return "○ ";
  }
}
