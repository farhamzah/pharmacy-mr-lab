import { MixingScenario } from "../data/practicalScenarios";

export interface MixingState {
  hasIngredientA: boolean;
  hasIngredientB: boolean;
  ingredientOrder: string[];
  homogeneity: number;
  transferredToContainer: boolean;
  isFinished: boolean;
  actionHistory: string[];
  lastFeedback: string;
}

export class MixingModuleStateMachine {
  state: MixingState = {
    hasIngredientA: false,
    hasIngredientB: false,
    ingredientOrder: [],
    homogeneity: 0,
    transferredToContainer: false,
    isFinished: false,
    actionHistory: [],
    lastFeedback: "",
  };

  constructor(private readonly scenario: MixingScenario) {}

  addIngredientA(): void {
    this.record("Add Ingredient A");
    this.state.hasIngredientA = true;
    this.state.ingredientOrder.push("A");
    this.state.lastFeedback = "Ingredient A ditambahkan.";
  }

  addIngredientB(): void {
    this.record("Add Ingredient B");
    this.state.hasIngredientB = true;
    this.state.ingredientOrder.push("B");
    this.state.lastFeedback = "Ingredient B ditambahkan.";
  }

  mix(amount = 25): boolean {
    this.record("Mix 5 Seconds");
    if (!this.state.hasIngredientA || !this.state.hasIngredientB) {
      this.state.lastFeedback = "Ingredient A dan B harus lengkap sebelum mixing.";
      return false;
    }
    this.state.homogeneity = Math.min(100, this.state.homogeneity + amount);
    this.state.lastFeedback = `Mixing dilakukan. Homogenitas ${this.state.homogeneity}%.`;
    return true;
  }

  transfer(): boolean {
    this.record("Transfer To Container");
    if (this.state.homogeneity < this.scenario.requiredHomogeneity) {
      this.state.lastFeedback = "Homogenitas minimal sebelum transfer belum terpenuhi.";
      return false;
    }
    this.state.transferredToContainer = true;
    this.state.lastFeedback = "Campuran dipindahkan ke wadah akhir.";
    return true;
  }

  finish(): boolean {
    this.record("Finish");
    if (!this.state.hasIngredientA || !this.state.hasIngredientB) {
      this.state.lastFeedback = "Ingredient A dan B wajib masuk sebelum finish.";
      return false;
    }
    this.state.isFinished = true;
    return true;
  }

  isCorrectOrder(): boolean {
    return this.state.ingredientOrder[0] === "A" && this.state.ingredientOrder[1] === "B";
  }

  private record(action: string): void {
    this.state.actionHistory.push(action);
  }
}
