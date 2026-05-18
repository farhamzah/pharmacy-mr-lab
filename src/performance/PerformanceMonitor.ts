export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private lastWarning = 0;
  private running = false;
  private averageFps = 0;

  constructor(private readonly onLowFps: (fps: number) => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
  }

  getAverageFps(): number {
    return this.averageFps;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.frameCount += 1;
    const now = performance.now();
    const elapsed = now - this.lastTime;
    if (elapsed >= 3000) {
      this.averageFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
      if (this.averageFps < 45 && now - this.lastWarning > 15000) {
        this.lastWarning = now;
        this.onLowFps(this.averageFps);
      }
    }
    requestAnimationFrame(this.tick);
  };
}
