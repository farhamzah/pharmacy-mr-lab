export class AudioFeedbackManager {
  private context?: AudioContext;

  playClick(): void {
    this.playTone(520, 0.025, 0.025);
  }

  playSuccess(): void {
    this.playTone(720, 0.045, 0.04);
  }

  playError(): void {
    this.playTone(180, 0.06, 0.045);
  }

  playFinish(): void {
    this.playTone(660, 0.04, 0.035);
    window.setTimeout(() => this.playTone(880, 0.05, 0.03), 70);
  }

  private playTone(frequency: number, duration: number, volume: number): void {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context ??= new AudioContextClass();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.value = volume;
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    } catch {
      // Browser audio policies can block sound before a trusted gesture.
    }
  }
}
