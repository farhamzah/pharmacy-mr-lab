import { describe, expect, it } from "vitest";
import { ModuleResult } from "../../assessment/ModuleResult";
import { RoomSetupRecord } from "../../room/RoomSetupRecord";
import { TABLE_STORAGE_KEY } from "../constants";
import { clearRoomSetup, createRoomSetupRecord, getResultHistory, getRoomSetupHistory, loadCurrentRoomSetupRecord, saveModuleResult, saveRoomSetupRecord } from "../storage";

function record(id: string): RoomSetupRecord {
  return createRoomSetupRecord([{ id: "table-1", position: [0, 0, 0], rotation: [0, 0, 0], assignedRole: "shared-workbench" }], { objectScale: 1, profileId: "standard" }, { id, createdAt: "now" } as RoomSetupRecord);
}

function result(id: string): ModuleResult {
  return { moduleId: id, moduleName: id, scenarioId: id, startedAt: "s", finishedAt: "f", score: 1, maxScore: 1, passed: true, stepResults: [], feedbackMessages: [], rawData: {} };
}

describe("storage", () => {
  it("saves and loads RoomSetupRecord", () => {
    saveRoomSetupRecord(record("a"));
    expect(loadCurrentRoomSetupRecord()?.id).toBe("a");
  });

  it("limits room setup history to 5", () => {
    for (let i = 0; i < 7; i += 1) saveRoomSetupRecord(record(String(i)));
    expect(getRoomSetupHistory()).toHaveLength(5);
  });

  it("clears current setup without clearing result history", () => {
    saveRoomSetupRecord(record("a"));
    saveModuleResult(result("r"));
    clearRoomSetup();
    expect(loadCurrentRoomSetupRecord()).toBeNull();
    expect(getResultHistory()).toHaveLength(1);
  });

  it("saves last result and limits result history to 10", () => {
    for (let i = 0; i < 12; i += 1) saveModuleResult(result(String(i)));
    expect(getResultHistory()).toHaveLength(10);
  });

  it("does not crash on corrupt JSON", () => {
    localStorage.setItem("pharmacy-mr-lab.current-room-setup.v2", "{bad");
    expect(loadCurrentRoomSetupRecord()).toBeNull();
  });

  it("migrates legacy table array", () => {
    localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify([{ id: "table-1", position: [1, 2, 3], rotation: [0, 0, 0], assignedRole: "shared-workbench" }]));
    expect(loadCurrentRoomSetupRecord()?.tableCount).toBe(1);
  });
});
