type ToastType = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export class ToastManager {
  private items: ToastItem[] = [];
  private nextId = 1;

  constructor(private readonly root: HTMLElement) {}

  push(message: string, type: ToastType = "info"): void {
    const item = { id: this.nextId, message, type };
    this.nextId += 1;
    this.items = [item, ...this.items].slice(0, 3);
    this.render();
    window.setTimeout(() => {
      this.items = this.items.filter((current) => current.id !== item.id);
      this.render();
    }, 2800);
  }

  private render(): void {
    this.root.innerHTML = this.items
      .map((item) => `<div class="toast-item" data-kind="${item.type}">${item.message}</div>`)
      .join("");
  }
}
