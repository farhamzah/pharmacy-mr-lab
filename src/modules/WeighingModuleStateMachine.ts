import { WeighingScenario } from "../data/practicalScenarios";
import { formatGram, randomRange } from "../utils/numberFormat";

export interface WeighingState {
  hasWeighingBoat: boolean;
  hasTared: boolean;
  sampleMassGram: number;
  hasConfirmedMass: boolean;
  isFinished: boolean;
  actionHistory: string[];
  lastFeedback: string;
}

export class WeighingModuleStateMachine {
  state: WeighingState = {
    hasWeighingBoat: false,
    hasTared: false,
    sampleMassGram: 0,
    hasConfirmedMass: false,
    isFinished: false,
    actionHistory: [],
    lastFeedback: "",
  };

  constructor(private readonly scenario: WeighingScenario) {}

  placeWeighingBoat(): void {
    this.record("Place Weighing Boat");
    this.state.hasWeighingBoat = true;
    this.state.lastFeedback = "Weighing boat diletakkan.";
  }

  tare(): boolean {
    this.record("Tare / Zero");
    if (!this.state.hasWeighingBoat) return this.error("Letakkan weighing boat terlebih dahulu.");
    this.state.hasTared = true;
    this.state.sampleMassGram = 0;
    this.state.lastFeedback = "Timbangan dinolkan.";
    return true;
  }

  addSample(kind: "small" | "large", amount?: number): boolean {
    this.record(kind === "small" ? "Add Small Sample" : "Add Large Sample");
    if (!this.state.hasTared) return this.error("Tare / Zero harus dilakukan sebelum menambah sample.");
    const delta = amount ?? (kind === "small" ? randomRange(0.001, 0.01) : randomRange(0.025, 0.075));
    this.state.sampleMassGram += delta;
    this.state.lastFeedback = `Sampel ditambahkan. Massa ${formatGram(this.state.sampleMassGram)}.`;
    return true;
  }

  removeSmall(amount = 0.005): void {
    this.record("Remove Small Sample");
    this.state.sampleMassGram = Math.max(0, this.state.sampleMassGram - amount);
    this.state.lastFeedback = `Sampel dikurangi. Massa ${formatGram(this.state.sampleMassGram)}.`;
  }

  confirmMass(): boolean {
    this.record("Confirm Mass");
    if (this.state.sampleMassGram <= 0) return this.error("Tambahkan sample terlebih dahulu.");
    this.state.hasConfirmedMass = true;
    this.state.lastFeedback = this.getMassFeedback();
    return true;
  }

  finish(): boolean {
    this.record("Finish");
    if (!this.state.hasConfirmedMass) return this.error("Konfirmasi massa sebelum finish.");
    this.state.isFinished = true;
    return true;
  }

  getMassFeedback(): string {
    const diff = this.state.sampleMassGram - this.scenario.targetMassGram;
    if (Math.abs(diff) <= this.scenario.toleranceGram) return "Massa sesuai target.";
    return diff < 0 ? "Massa masih kurang." : "Massa terlalu banyak.";
  }

  private record(action: string): void {
    this.state.actionHistory.push(action);
  }

  private error(message: string): false {
    this.state.lastFeedback = message;
    return false;
  }
}
