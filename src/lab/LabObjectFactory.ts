import * as THREE from "three";
import { AssetLoader } from "../assets/AssetLoader";
import { LabMaterials, PowderMaterialType, StatusType, getPowderMaterial } from "./LabMaterials";
import { createTextSprite, updateTextSprite } from "./LabObjectLabels";

interface ScaleOptions {
  scale?: number;
}

interface PowderOptions {
  amountNormalized?: number;
  materialType?: PowderMaterialType;
}

interface BottleOptions {
  label: string;
  color?: number;
  scale?: number;
}

export class LabObjectFactory {
  private objectScale = 1;
  preferExternalAssets = false;
  assetMode: "procedural" | "external-assets" | "fallback" = "procedural";

  constructor(private readonly assetLoader?: AssetLoader) {}

  setObjectScale(scale: number): void {
    this.objectScale = scale;
  }

  getObjectScale(): number {
    return this.objectScale;
  }

  createAnalyticalScale(options: ScaleOptions = {}): THREE.Group {
    const objectScale = options.scale ?? this.objectScale;
    const group = new THREE.Group();
    group.name = "Analytical Scale";
    group.scale.setScalar(objectScale);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.075, 0.32), LabMaterials.plasticWhite);
    base.position.y = 0.04;
    group.add(base);

    const frontLip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.055), LabMaterials.plasticDark);
    frontLip.position.set(0, 0.082, 0.17);
    group.add(frontLip);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.018, 40), LabMaterials.metal);
    plate.name = "scale-plate";
    plate.position.y = 0.098;
    group.add(plate);

    const displayPanel = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.058, 0.018), LabMaterials.plasticDark);
    displayPanel.name = "scale-display-panel";
    displayPanel.position.set(-0.055, 0.098, 0.188);
    displayPanel.rotation.x = -0.18;
    group.add(displayPanel);

    const display = createTextSprite("0.000 g", { width: 0.17, height: 0.052, fontSize: 42, background: "rgba(3, 7, 18, 0.92)", color: "#67e8f9" });
    display.name = "scale-display-text";
    display.position.set(-0.055, 0.103, 0.203);
    group.add(display);

    const tareButton = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.009, 24), LabMaterials.hologramBlue);
    tareButton.name = "tare-button";
    tareButton.rotation.x = Math.PI / 2;
    tareButton.position.set(0.14, 0.106, 0.184);
    group.add(tareButton);

    const shieldBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.19, 0.012), LabMaterials.glassTransparent);
    shieldBack.position.set(0, 0.19, -0.102);
    group.add(shieldBack);
    const shieldLeft = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.19, 0.22), LabMaterials.glassTransparent);
    shieldLeft.position.set(-0.15, 0.19, 0.006);
    group.add(shieldLeft);
    const shieldRight = shieldLeft.clone();
    shieldRight.position.x = 0.15;
    group.add(shieldRight);

    const label = createTextSprite("Analytical Scale", { width: 0.27, height: 0.07, fontSize: 36 });
    label.position.set(0, 0.32, -0.14);
    group.add(label);
    return group;
  }

  async createAnalyticalScaleAsync(options: ScaleOptions = {}): Promise<THREE.Group> {
    const loaded = await this.tryAsset("analytical_scale");
    if (loaded) return this.wrapLoadedAsset(loaded, "Analytical Scale", options.scale);
    return this.createAnalyticalScale(options);
  }

  updateScaleDisplay(scaleGroup: THREE.Group, massText: string): void {
    const display = scaleGroup.getObjectByName("scale-display-text");
    if (display instanceof THREE.Sprite) {
      updateTextSprite(display, massText, { width: 0.17, height: 0.052, fontSize: 42, background: "rgba(3, 7, 18, 0.92)", color: "#67e8f9" });
    }
  }

  createWeighingBoat(options: PowderOptions = {}): THREE.Group {
    const group = new THREE.Group();
    group.name = "Weighing Boat";

    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.028, 4), LabMaterials.plasticWhite);
    tray.name = "weighing-boat-tray";
    tray.rotation.y = Math.PI / 4;
    tray.position.y = 0.014;
    group.add(tray);

    const label = createTextSprite("Boat", { width: 0.13, height: 0.045, fontSize: 32 });
    label.position.set(0, 0.075, 0.09);
    group.add(label);

    if ((options.amountNormalized ?? 0) > 0) {
      const powder = this.createPowderMound(options);
      powder.position.y = 0.036;
      group.add(powder);
    }
    return group;
  }

  async createWeighingBoatAsync(options: PowderOptions = {}): Promise<THREE.Group> {
    const loaded = await this.tryAsset("weighing_boat");
    if (loaded) return this.wrapLoadedAsset(loaded, "Weighing Boat");
    return this.createWeighingBoat(options);
  }

  createPowderMound(options: PowderOptions = {}): THREE.Group {
    const amount = Math.max(0.08, Math.min(1.5, options.amountNormalized ?? 0.5));
    const group = new THREE.Group();
    group.name = "Powder Mound";
    const material = getPowderMaterial(options.materialType ?? "yellow");
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 10), material);
    mound.scale.set(1.25 * amount, 0.28 + amount * 0.15, 0.9 * amount);
    mound.position.y = 0.014;
    group.add(mound);
    return group;
  }

  createMortarAndPestle(options: ScaleOptions = {}): THREE.Group {
    const group = new THREE.Group();
    group.name = "Mortar and Pestle";
    group.scale.setScalar(options.scale ?? this.objectScale);

    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.11, 0.16, 36, 1, true), LabMaterials.plasticWhite);
    mortar.name = "mortar-bowl";
    mortar.position.y = 0.095;
    group.add(mortar);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 12, 36), LabMaterials.plasticWhite);
    rim.name = "mortar-rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.18;
    group.add(rim);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.08, 0.012, 32), LabMaterials.powderWhite);
    inner.name = "mortar-powder";
    inner.position.y = 0.106;
    inner.visible = false;
    group.add(inner);

    const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.043, 0.36, 28), LabMaterials.plasticWhite);
    pestle.name = "pestle";
    pestle.rotation.z = Math.PI / 5;
    pestle.position.set(0.19, 0.17, 0.02);
    group.add(pestle);

    const label = createTextSprite("Mortar", { width: 0.18, height: 0.06, fontSize: 36 });
    label.position.set(0, 0.31, -0.19);
    group.add(label);
    return group;
  }

  async createMortarAndPestleAsync(options: ScaleOptions = {}): Promise<THREE.Group> {
    const loaded = await this.tryAsset("mortar_pestle");
    if (loaded) return this.wrapLoadedAsset(loaded, "Mortar and Pestle", options.scale);
    return this.createMortarAndPestle(options);
  }

  createIngredientBottle(optionsOrLabel: BottleOptions | string, color = 0x7dd3fc): THREE.Group {
    const options = typeof optionsOrLabel === "string" ? { label: optionsOrLabel, color } : optionsOrLabel;
    const group = new THREE.Group();
    group.name = `${options.label} Bottle`;
    group.scale.setScalar(options.scale ?? this.objectScale);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.2, 28), new THREE.MeshStandardMaterial({
      color: options.color ?? color,
      transparent: true,
      opacity: 0.82,
      roughness: 0.28,
    }));
    body.position.y = 0.1;
    group.add(body);

    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.052, 0.04, 24), LabMaterials.glassTransparent);
    shoulder.position.y = 0.22;
    group.add(shoulder);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.04, 24), LabMaterials.plasticDark);
    cap.position.y = 0.255;
    group.add(cap);

    const label = createTextSprite(options.label, { width: 0.15, height: 0.055, fontSize: 34, background: "rgba(255,255,255,0.9)", color: "#0f172a" });
    label.position.set(0, 0.11, 0.064);
    group.add(label);
    return group;
  }

  async createIngredientBottleAsync(optionsOrLabel: BottleOptions | string, color = 0x7dd3fc): Promise<THREE.Group> {
    const loaded = await this.tryAsset("ingredient_bottle");
    if (loaded) {
      const label = typeof optionsOrLabel === "string" ? optionsOrLabel : optionsOrLabel.label;
      const group = this.wrapLoadedAsset(loaded, `${label} Bottle`);
      const labelSprite = this.createSpriteLabel(label, 0.15, 0.055);
      labelSprite.position.set(0, 0.16, 0.08);
      group.add(labelSprite);
      return group;
    }
    return this.createIngredientBottle(optionsOrLabel, color);
  }

  createBottle(label: string, color = 0x7dd3fc): THREE.Group {
    return this.createIngredientBottle({ label, color });
  }

  createFinalContainer(options: PowderOptions = {}): THREE.Group {
    const group = new THREE.Group();
    group.name = "Final Container";
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.11, 28, 1, true), LabMaterials.glassTransparent);
    cup.position.y = 0.065;
    group.add(cup);
    const powder = this.createPowderMound({ amountNormalized: options.amountNormalized ?? 0.75, materialType: "mixed" });
    powder.position.y = 0.05;
    group.add(powder);
    const label = createTextSprite("Final Mix", { width: 0.18, height: 0.055, fontSize: 34 });
    label.position.set(0, 0.18, 0.08);
    group.add(label);
    return group;
  }

  async createFinalContainerAsync(options: PowderOptions = {}): Promise<THREE.Group> {
    const loaded = await this.tryAsset("final_container");
    if (loaded) return this.wrapLoadedAsset(loaded, "Final Container");
    return this.createFinalContainer(options);
  }

  createStatusBadge(text: string, status: StatusType = "info"): THREE.Sprite {
    const badge = createTextSprite(text, { width: 0.24, height: 0.07, fontSize: 38, status });
    badge.name = "status-badge";
    return badge;
  }

  createSpriteLabel(text: string, width = 0.28, height = 0.09): THREE.Sprite {
    return createTextSprite(text, { width, height, fontSize: 38, background: "rgba(255,255,255,0.9)", color: "#0f172a" });
  }

  private async tryAsset(assetId: Parameters<AssetLoader["loadAsset"]>[0]): Promise<THREE.Object3D | null> {
    if (!this.preferExternalAssets || !this.assetLoader) {
      this.assetMode = "procedural";
      return null;
    }
    const loaded = await this.assetLoader.loadAsset(assetId);
    this.assetMode = loaded ? "external-assets" : "fallback";
    return loaded;
  }

  private wrapLoadedAsset(object: THREE.Object3D, name: string, scale?: number): THREE.Group {
    const group = new THREE.Group();
    group.name = name;
    group.scale.setScalar(scale ?? this.objectScale);
    group.add(object);
    return group;
  }
}
