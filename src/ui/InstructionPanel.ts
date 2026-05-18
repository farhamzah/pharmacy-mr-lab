export class InstructionPanel {
  constructor(private readonly root: HTMLElement) {}

  setContent(title: string, lines: string[]): void {
    this.root.innerHTML = `
      <h2>${title}</h2>
      ${lines.map((line) => `<p>${line}</p>`).join("")}
    `;
  }

  setModuleContent(title: string, target: string, currentInstruction: string, feedback: string): void {
    this.root.innerHTML = `
      <h2>${title}</h2>
      <p><strong>Target:</strong> ${target}</p>
      <p><strong>Langkah aktif:</strong> ${currentInstruction}</p>
      <p><strong>Feedback:</strong> ${feedback || "Belum ada aksi."}</p>
    `;
  }
}
