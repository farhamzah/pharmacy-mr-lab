import * as THREE from "three";
import { TableRole } from "../utils/constants";
import { StoredLabTable } from "../utils/storage";

export class LabTable {
  public readonly group = new THREE.Group();
  public assignedRole: TableRole;

  constructor(
    public readonly id: string,
    position: THREE.Vector3,
    rotation: THREE.Euler,
    assignedRole: TableRole = "unassigned",
  ) {
    this.assignedRole = assignedRole;
    this.group.position.copy(position);
    this.group.rotation.copy(rotation);
    this.group.name = id;
    this.group.add(this.createMarker());
    this.group.add(this.createLabel(id.replace("table-", "Meja ")));
  }

  setRole(role: TableRole): void {
    this.assignedRole = role;
  }

  toStored(): StoredLabTable {
    return {
      id: this.id,
      position: this.group.position.toArray(),
      rotation: [this.group.rotation.x, this.group.rotation.y, this.group.rotation.z],
      assignedRole: this.assignedRole,
    };
  }

  static fromStored(stored: StoredLabTable): LabTable {
    return new LabTable(
      stored.id,
      new THREE.Vector3().fromArray(stored.position),
      new THREE.Euler(...stored.rotation),
      stored.assignedRole,
    );
  }

  private createMarker(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(0.55, 0.38);
    const material = new THREE.MeshBasicMaterial({
      color: 0x30cfd0,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.006;
    return mesh;
  }

  private createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "rgba(8, 16, 24, 0.78)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#ffffff";
      context.font = "600 38px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(0, 0.23, -0.28);
    sprite.scale.set(0.35, 0.13, 1);
    return sprite;
  }
}
