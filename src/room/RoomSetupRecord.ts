import { TableRole } from "../utils/constants";

export interface RoomSetupTableRecord {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  assignedRole: TableRole;
  label: string;
}

export interface RoomSetupRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
  deviceHint?: string;
  tableCount: number;
  tables: RoomSetupTableRecord[];
  calibration: {
    objectScale: number;
    profileId: string;
  };
  persistenceMode: "localStorage-fallback" | "webxr-anchor" | "unknown";
  notes?: string[];
}
