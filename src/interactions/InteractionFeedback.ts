import { UIManager } from "../ui/UIManager";
import { AudioFeedbackManager } from "./AudioFeedbackManager";
import { HapticsManager } from "./HapticsManager";

export class InteractionFeedback {
  private readonly haptics = new HapticsManager();
  private readonly audio = new AudioFeedbackManager();

  constructor(private readonly ui: UIManager) {}

  success(message: string): void {
    this.ui.setMessage(message, "success");
    this.haptics.pulse(0.28, 50);
    this.audio.playSuccess();
  }

  error(message: string): void {
    this.ui.setMessage(message, "error");
    this.haptics.pulse(0.55, 80);
    this.audio.playError();
  }

  warning(message: string): void {
    this.ui.setMessage(message, "warning");
    this.haptics.pulse(0.22, 45);
    this.audio.playClick();
  }

  info(message: string): void {
    this.ui.setMessage(message, "info");
    this.haptics.pulse(0.12, 35);
    this.audio.playClick();
  }

  finish(message: string, passed: boolean): void {
    this.ui.setMessage(message, passed ? "success" : "error");
    this.haptics.pulse(passed ? 0.36 : 0.5, 110);
    this.audio.playFinish();
  }
}
