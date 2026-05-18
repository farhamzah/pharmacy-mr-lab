import * as THREE from "three";
import { LabTable } from "../lab/LabTable";
import { MAX_TABLES } from "../utils/constants";
import { AnchorManager } from "./AnchorManager";
import { HitTestManager } from "./HitTestManager";

export class PlacementManager {
  private readonly tables: LabTable[] = [];

  constructor(
    private readonly scene: THREE.Scene,
    private readonly hitTestManager: HitTestManager,
    private readonly anchorManager: AnchorManager,
  ) {}

  getTables(): LabTable[] {
    return this.tables;
  }

  addExistingTables(tables: LabTable[]): void {
    tables.forEach((table) => {
      this.tables.push(table);
      this.scene.add(table.group);
    });
  }

  async placeTableFromReticle(): Promise<LabTable | null> {
    if (this.tables.length >= MAX_TABLES) return null;
    const pose = this.hitTestManager.getPlacementPose();
    if (!pose) return null;

    await this.anchorManager.createAnchorFallback(pose.position, pose.rotation);
    const table = new LabTable(`table-${this.tables.length + 1}`, pose.position, pose.rotation);
    this.tables.push(table);
    this.scene.add(table.group);
    return table;
  }

  clear(): void {
    this.tables.forEach((table) => this.scene.remove(table.group));
    this.tables.length = 0;
  }
}
