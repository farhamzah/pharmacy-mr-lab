import { LabTable } from "./LabTable";

export class LabLayoutManager {
  assignRoles(tables: LabTable[]): LabTable[] {
    const sortedTables = [...tables].sort((a, b) => a.id.localeCompare(b.id));

    if (sortedTables.length === 1) {
      sortedTables[0].setRole("shared-workbench");
      return sortedTables;
    }

    if (sortedTables.length === 2) {
      sortedTables[0].setRole("weighing-station");
      sortedTables[1].setRole("mixing-station");
      return sortedTables;
    }

    sortedTables[0]?.setRole("material-station");
    sortedTables[1]?.setRole("weighing-station");
    sortedTables[2]?.setRole("mixing-station");
    return sortedTables;
  }

  findStation(tables: LabTable[], roles: string[]): LabTable | undefined {
    return tables.find((table) => roles.includes(table.assignedRole));
  }
}
