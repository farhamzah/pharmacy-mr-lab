import { ModuleResult } from "../assessment/ModuleResult";
import { TableCalibrationProfile } from "../calibration/TableCalibrationProfile";
import { RoomSetupRecord } from "../room/RoomSetupRecord";
import { APP_VERSION, TABLE_STORAGE_KEY, TableRole } from "./constants";

const CURRENT_ROOM_SETUP_KEY = "pharmacy-mr-lab.current-room-setup.v2";
const ROOM_SETUP_HISTORY_KEY = "pharmacy-mr-lab.room-setup-history.v2";
const LAST_RESULT_STORAGE_KEY = "pharmacy-mr-lab.last-result.v1";
const RESULT_HISTORY_STORAGE_KEY = "pharmacy-mr-lab.result-history.v1";

export interface StoredLabTable {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  assignedRole: TableRole;
}

export function createRoomSetupRecord(
  tables: StoredLabTable[],
  calibration: { objectScale: number; profileId: TableCalibrationProfile["id"] | string },
  existing?: RoomSetupRecord | null,
): RoomSetupRecord {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? `room-${Date.now()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    appVersion: APP_VERSION,
    deviceHint: navigator.userAgent,
    tableCount: tables.length,
    tables: tables.map((table, index) => ({
      ...table,
      label: `Meja ${index + 1}`,
    })),
    calibration,
    persistenceMode: "localStorage-fallback",
    notes: ["Saved setup uses local fallback. Recalibration may be needed if the physical room changed."],
  };
}

export function loadTables(): StoredLabTable[] {
  return loadRoomSetup();
}

export function saveTables(tables: StoredLabTable[]): void {
  const previous = loadCurrentRoomSetupRecord();
  saveRoomSetupRecord(createRoomSetupRecord(tables, previous?.calibration ?? { objectScale: 1, profileId: "standard" }, previous));
}

export function clearTables(): void {
  clearRoomSetup();
}

export function loadRoomSetup(): StoredLabTable[] {
  return loadCurrentRoomSetupRecord()?.tables.map(({ id, position, rotation, assignedRole }) => ({ id, position, rotation, assignedRole })) ?? [];
}

export function saveRoomSetup(tables: StoredLabTable[]): void {
  saveTables(tables);
}

export function clearRoomSetup(): void {
  try {
    localStorage.removeItem(CURRENT_ROOM_SETUP_KEY);
    localStorage.removeItem(TABLE_STORAGE_KEY);
  } catch (error) {
    console.warn("Gagal menghapus konfigurasi meja.", error);
  }
}

export function saveRoomSetupRecord(record: RoomSetupRecord): void {
  try {
    localStorage.setItem(CURRENT_ROOM_SETUP_KEY, JSON.stringify(record));
    const history = getRoomSetupHistory().filter((item) => item.id !== record.id);
    history.unshift(record);
    localStorage.setItem(ROOM_SETUP_HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
  } catch (error) {
    console.warn("Gagal menyimpan RoomSetupRecord.", error);
  }
}

export function loadCurrentRoomSetupRecord(): RoomSetupRecord | null {
  try {
    const raw = localStorage.getItem(CURRENT_ROOM_SETUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RoomSetupRecord;
      return isRoomSetupRecord(parsed) ? parsed : null;
    }
    return migrateLegacyRoomSetup();
  } catch (error) {
    console.warn("Saved setup corrupt atau gagal dibaca.", error);
    return null;
  }
}

export function getRoomSetupHistory(): RoomSetupRecord[] {
  try {
    const raw = localStorage.getItem(ROOM_SETUP_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RoomSetupRecord[];
    return Array.isArray(parsed) ? parsed.filter(isRoomSetupRecord) : [];
  } catch (error) {
    console.warn("Gagal membaca room setup history.", error);
    return [];
  }
}

export function clearRoomSetupHistory(): void {
  try {
    localStorage.removeItem(ROOM_SETUP_HISTORY_KEY);
  } catch (error) {
    console.warn("Gagal menghapus room setup history.", error);
  }
}

export function deleteRoomSetupRecord(id: string): void {
  try {
    const current = loadCurrentRoomSetupRecord();
    if (current?.id === id) {
      localStorage.removeItem(CURRENT_ROOM_SETUP_KEY);
    }
    const history = getRoomSetupHistory().filter((record) => record.id !== id);
    localStorage.setItem(ROOM_SETUP_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("Gagal menghapus room setup record.", error);
  }
}

export function saveModuleResult(result: ModuleResult): void {
  try {
    localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(result));
    const history = getResultHistory();
    history.unshift(result);
    localStorage.setItem(RESULT_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (error) {
    console.warn("Gagal menyimpan hasil praktikum.", error);
  }
}

export function getLastModuleResult(): ModuleResult | null {
  try {
    const raw = localStorage.getItem(LAST_RESULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ModuleResult) : null;
  } catch (error) {
    console.warn("Gagal membaca hasil praktikum terakhir.", error);
    return null;
  }
}

export function getResultHistory(): ModuleResult[] {
  try {
    const raw = localStorage.getItem(RESULT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ModuleResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Gagal membaca riwayat hasil praktikum.", error);
    return [];
  }
}

export function clearResultHistory(): void {
  try {
    localStorage.removeItem(LAST_RESULT_STORAGE_KEY);
    localStorage.removeItem(RESULT_HISTORY_STORAGE_KEY);
  } catch (error) {
    console.warn("Gagal menghapus riwayat hasil praktikum.", error);
  }
}

function migrateLegacyRoomSetup(): RoomSetupRecord | null {
  try {
    const raw = localStorage.getItem(TABLE_STORAGE_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as StoredLabTable[];
    if (!Array.isArray(legacy)) return null;
    const record = createRoomSetupRecord(legacy, { objectScale: 1, profileId: "standard" });
    saveRoomSetupRecord(record);
    return record;
  } catch (error) {
    console.warn("Gagal migrasi room setup lama.", error);
    return null;
  }
}

function isRoomSetupRecord(value: RoomSetupRecord): value is RoomSetupRecord {
  return Boolean(value && typeof value.id === "string" && Array.isArray(value.tables) && typeof value.tableCount === "number");
}
