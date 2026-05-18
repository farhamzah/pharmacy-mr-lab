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
  granules?: boolean;
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

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.075, 0.34), LabMaterials.warmPlasticWhite);
    base.name = "scale-body";
    base.position.y = 0.04;
    group.add(base);

    const baseTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.018, 0.26), LabMaterials.plasticWhite);
    baseTop.name = "scale-top-inset";
    baseTop.position.set(0, 0.087, -0.02);
    group.add(baseTop);

    const frontLip = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.032, 0.068), LabMaterials.plasticDark);
    frontLip.name = "scale-control-face";
    frontLip.position.set(0, 0.088, 0.17);
    group.add(frontLip);

    const plateStem = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.046, 0.035, 36), LabMaterials.brushedMetal);
    plateStem.name = "scale-plate-stem";
    plateStem.position.y = 0.112;
    group.add(plateStem);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.112, 0.018, 64), LabMaterials.brushedMetal);
    plate.name = "scale-plate";
    plate.position.y = 0.14;
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

    const tareLabel = createTextSprite("TARE", { width: 0.075, height: 0.032, fontSize: 26, background: "rgba(15,23,42,0.9)", color: "#e0f2fe" });
    tareLabel.position.set(0.14, 0.13, 0.205);
    group.add(tareLabel);

    const functionButtons = [-0.19, -0.155, 0.185].map((x) => {
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 18), LabMaterials.rubberBlack);
      button.rotation.x = Math.PI / 2;
      button.position.set(x, 0.104, 0.185);
      return button;
    });
    functionButtons.forEach((button) => group.add(button));

    const shieldFrameMaterial = LabMaterials.plasticWhite;
    const shieldBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.01), LabMaterials.glassTransparent);
    shieldBack.name = "scale-glass-back";
    shieldBack.position.set(0, 0.245, -0.125);
    group.add(shieldBack);
    const shieldLeft = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.22, 0.25), LabMaterials.glassTransparent);
    shieldLeft.name = "scale-glass-side";
    shieldLeft.position.set(-0.17, 0.245, 0);
    group.add(shieldLeft);
    const shieldRight = shieldLeft.clone();
    shieldRight.position.x = 0.15;
    group.add(shieldRight);
    const shieldTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.01, 0.25), LabMaterials.glassTransparent);
    shieldTop.name = "scale-glass-top";
    shieldTop.position.set(0, 0.355, 0);
    group.add(shieldTop);

    [
      [-0.175, 0.245, -0.125],
      [0.175, 0.245, -0.125],
      [-0.175, 0.245, 0.125],
      [0.175, 0.245, 0.125],
    ].forEach(([x, y, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.23, 0.012), shieldFrameMaterial);
      post.position.set(x, y, z);
      group.add(post);
    });

    [
      [-0.2, -0.13],
      [0.2, -0.13],
      [-0.2, 0.13],
      [0.2, 0.13],
    ].forEach(([x, z]) => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.014, 20), LabMaterials.rubberBlack);
      foot.position.set(x, 0.002, z);
      group.add(foot);
    });

    const label = createTextSprite("Analytical Scale", { width: 0.27, height: 0.07, fontSize: 36 });
    label.position.set(0, 0.42, -0.16);
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

    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.09, 0.024, 4), LabMaterials.plasticWhite);
    tray.name = "weighing-boat-tray";
    tray.rotation.y = Math.PI / 4;
    tray.position.y = 0.014;
    group.add(tray);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.072, 0.006, 4), LabMaterials.warmPlasticWhite);
    inner.name = "weighing-boat-inner";
    inner.rotation.y = Math.PI / 4;
    inner.position.y = 0.031;
    group.add(inner);

    const foldLine = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.004, 0.006), LabMaterials.labelBackground);
    foldLine.name = "weighing-boat-fold";
    foldLine.position.y = 0.036;
    group.add(foldLine);

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
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 12), material);
    mound.name = "powder-main-mound";
    mound.scale.set(1.25 * amount, 0.23 + amount * 0.18, 0.9 * amount);
    mound.position.y = 0.014;
    group.add(mound);

    if (options.granules ?? true) {
      const granuleCount = Math.min(14, Math.max(4, Math.round(amount * 9)));
      for (let i = 0; i < granuleCount; i += 1) {
        const angle = (i / granuleCount) * Math.PI * 2;
        const radius = 0.018 + (i % 4) * 0.01 * amount;
        const granule = new THREE.Mesh(new THREE.SphereGeometry(0.006 + (i % 3) * 0.0015, 8, 6), material);
        granule.name = "powder-granule";
        granule.position.set(Math.cos(angle) * radius, 0.024 + (i % 2) * 0.003, Math.sin(angle) * radius * 0.75);
        group.add(granule);
      }
    }
    return group;
  }

  createMortarAndPestle(options: ScaleOptions = {}): THREE.Group {
    const group = new THREE.Group();
    group.name = "Mortar and Pestle";
    group.scale.setScalar(options.scale ?? this.objectScale);

    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.105, 0.16, 48, 1, true), LabMaterials.warmPlasticWhite);
    mortar.name = "mortar-bowl";
    mortar.position.y = 0.095;
    group.add(mortar);

    const innerBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.065, 0.125, 48, 1, true), LabMaterials.plasticWhite);
    innerBowl.name = "mortar-inner-bowl";
    innerBowl.position.y = 0.108;
    group.add(innerBowl);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.014, 14, 48), LabMaterials.warmPlasticWhite);
    rim.name = "mortar-rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.18;
    group.add(rim);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.035, 42), LabMaterials.warmPlasticWhite);
    foot.name = "mortar-foot";
    foot.position.y = 0.02;
    group.add(foot);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.08, 0.012, 32), LabMaterials.powderWhite);
    inner.name = "mortar-powder";
    inner.position.y = 0.106;
    inner.visible = false;
    group.add(inner);

    const pestle = new THREE.Group();
    pestle.name = "pestle";
    pestle.rotation.z = Math.PI / 5;
    pestle.position.set(0.19, 0.17, 0.02);
    const pestleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.31, 32), LabMaterials.warmPlasticWhite);
    pestleHandle.name = "pestle-handle";
    const pestleHead = new THREE.Mesh(new THREE.SphereGeometry(0.048, 24, 14), LabMaterials.warmPlasticWhite);
    pestleHead.name = "pestle-grinding-head";
    pestleHead.position.y = -0.17;
    pestleHead.scale.set(1, 0.72, 1);
    pestle.add(pestleHandle, pestleHead);
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

    const bodyMaterial = (options.color ?? color) === 0xfbbf24 ? LabMaterials.amberGlass : new THREE.MeshPhysicalMaterial({
      color: options.color ?? color,
      transparent: true,
      opacity: 0.74,
      roughness: 0.18,
      metalness: 0,
      depthWrite: false,
    });
    bodyMaterial.userData.dynamicMaterial = true;

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.064, 0.2, 36), bodyMaterial);
    body.name = "bottle-body";
    body.position.y = 0.1;
    group.add(body);

    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.052, 0.044, 32), bodyMaterial);
    shoulder.name = "bottle-shoulder";
    shoulder.position.y = 0.22;
    group.add(shoulder);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.029, 0.035, 28), bodyMaterial);
    neck.name = "bottle-neck";
    neck.position.y = 0.255;
    group.add(neck);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.042, 28), LabMaterials.plasticDark);
    cap.name = "bottle-cap";
    cap.position.y = 0.255;
    group.add(cap);

    for (let i = 0; i < 4; i += 1) {
      const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.0018, 6, 24), LabMaterials.rubberBlack);
      ridge.name = "bottle-cap-ridge";
      ridge.rotation.x = Math.PI / 2;
      ridge.position.y = 0.241 + i * 0.008;
      group.add(ridge);
    }

    const label = createTextSprite(options.label, { width: 0.19, height: 0.07, fontSize: 32, background: "rgba(255,255,255,0.94)", color: "#0f172a" });
    label.position.set(0, 0.115, 0.067);
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
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.066, 0.12, 36, 1, true), LabMaterials.glassTransparent);
    cup.name = "final-container-cup";
    cup.position.y = 0.065;
    group.add(cup);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.006, 10, 36), LabMaterials.glassTransparent);
    rim.name = "final-container-rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.125;
    group.add(rim);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.012, 36), LabMaterials.plasticWhite);
    lid.name = "final-container-lid";
    lid.position.set(0, 0.153, -0.02);
    lid.rotation.x = 0.35;
    group.add(lid);
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
