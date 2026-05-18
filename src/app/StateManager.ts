import { ModuleId } from "../utils/constants";
import { LabTable } from "../lab/LabTable";
import { loadTables, saveTables } from "../utils/storage";

export type AppMode = "home" | "placement" | "module-menu" | "module-running";

export class StateManager {
  public mode: AppMode = "home";
  public tables: LabTable[] = [];
  public activeModule: ModuleId | null = null;

  loadPersistedTables(): LabTable[] {
    this.tables = loadTables().map((table) => LabTable.fromStored(table));
    return this.tables;
  }

  setTables(tables: LabTable[]): void {
    this.tables = tables;
    saveTables(tables.map((table) => table.toStored()));
  }

  setMode(mode: AppMode): void {
    this.mode = mode;
  }

  setActiveModule(moduleId: ModuleId | null): void {
    this.activeModule = moduleId;
  }
}
