import * as THREE from "three";
import { AssetLoader } from "../assets/AssetLoader";
import { LabMaterials, PowderMaterialType, StatusType, getPowderMaterial } from "./LabMaterials";
import { createTextPlane, createTextSprite, updateTextPlane } from "./LabObjectLabels";

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

    // === MAIN BODY - layered construction like real Mettler/Sartorius ===
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.085, 0.4), LabMaterials.warmPlasticWhite);
    base.name = "scale-body";
    base.position.y = 0.04;
    group.add(base);

    // Subtle body chamfer edges
    const chamferFront = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.012, 0.008), LabMaterials.texturedPlasticLight);
    chamferFront.position.set(0, 0.08, 0.2);
    group.add(chamferFront);
    const chamferBack = chamferFront.clone();
    chamferBack.position.z = -0.2;
    group.add(chamferBack);

    // Inset top panel
    const baseTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.3), LabMaterials.plasticWhite);
    baseTop.name = "scale-top-inset";
    baseTop.position.set(0, 0.087, -0.02);
    group.add(baseTop);

    // Internal chamber floor (visible through glass)
    const chamberFloor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.005, 0.26), LabMaterials.stainlessSteel);
    chamberFloor.name = "scale-chamber-floor";
    chamberFloor.position.set(0, 0.092, 0);
    group.add(chamberFloor);

    // === CONTROL FACE with recessed panel ===
    const frontLip = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.095), LabMaterials.plasticDark);
    frontLip.name = "scale-control-face";
    frontLip.position.set(0, 0.088, 0.17);
    group.add(frontLip);

    // Ventilation grille (back)
    for (let i = 0; i < 8; i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.004, 0.003), LabMaterials.texturedPlasticDark);
      slot.position.set(-0.12 + i * 0.032, 0.035, -0.201);
      group.add(slot);
    }

    // === WEIGHING PAN - high-detail stainless ===
    const plateStem = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.046, 0.035, 36), LabMaterials.stainlessSteel);
    plateStem.name = "scale-plate-stem";
    plateStem.position.y = 0.112;
    group.add(plateStem);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.112, 0.018, 64), LabMaterials.weighingPanSurface);
    plate.name = "scale-plate";
    plate.position.y = 0.14;
    group.add(plate);

    // Pan edge ring
    const panRing = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.004, 12, 64), LabMaterials.chromeAccent);
    panRing.name = "scale-pan-ring";
    panRing.rotation.x = Math.PI / 2;
    panRing.position.y = 0.151;
    group.add(panRing);

    // Pan inner concentric ring detail
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.002, 8, 48), LabMaterials.stainlessSteel);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.15;
    group.add(innerRing);

    // === LCD DISPLAY - backlit panel ===
    const displayPanel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.022), LabMaterials.lcdScreen);
    displayPanel.name = "scale-display-panel";
    displayPanel.position.set(-0.095, 0.112, 0.225);
    displayPanel.rotation.x = -0.18;
    group.add(displayPanel);

    // Display bezel
    const displayBezel = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.09, 0.005), LabMaterials.plasticDark);
    displayBezel.position.set(-0.095, 0.111, 0.215);
    displayBezel.rotation.x = -0.18;
    group.add(displayBezel);

    const display = createTextPlane("0.000 g", { width: 0.28, height: 0.085, fontSize: 58, background: "rgba(3, 7, 18, 0.96)", color: "#4fd1c5" });
    display.name = "scale-display-text";
    display.position.set(-0.095, 0.12, 0.244);
    display.rotation.x = -0.18;
    group.add(display);

    // Screen ambient glow
    const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.07), LabMaterials.lcdActive);
    screenGlow.name = "scale-screen-glow";
    screenGlow.position.set(-0.095, 0.116, 0.238);
    screenGlow.rotation.x = -0.18;
    screenGlow.material.transparent = true;
    screenGlow.material.opacity = 0.12;
    group.add(screenGlow);

    // Stability indicator LED
    const stabilityLed = new THREE.Mesh(new THREE.SphereGeometry(0.005, 10, 8), LabMaterials.ledIndicatorGreen);
    stabilityLed.name = "stability-led";
    stabilityLed.position.set(-0.24, 0.118, 0.237);
    group.add(stabilityLed);

    // === BUTTONS - tactile feel ===
    const tareButton = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.014, 32), LabMaterials.hologramBlue);
    tareButton.name = "tare-button";
    tareButton.rotation.x = Math.PI / 2;
    tareButton.position.set(0.205, 0.118, 0.222);
    group.add(tareButton);

    // Tare button ring
    const tareRing = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.003, 8, 32), LabMaterials.chromeAccent);
    tareRing.rotation.x = Math.PI / 2;
    tareRing.position.set(0.205, 0.118, 0.224);
    group.add(tareRing);

    const tareLabel = createTextPlane("TARE / ZERO", { width: 0.19, height: 0.055, fontSize: 34, background: "rgba(15,23,42,0.96)", color: "#e0f2fe" });
    tareLabel.name = "tare-label";
    tareLabel.position.set(0.205, 0.175, 0.25);
    tareLabel.rotation.x = -0.18;
    group.add(tareLabel);

    // Function buttons with labels
    const buttonDefs: [number, string][] = [[-0.255, "MODE"], [-0.215, "CAL"], [0.275, "ON"]];
    buttonDefs.forEach(([x, text]) => {
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 18), LabMaterials.rubberBlack);
      button.rotation.x = Math.PI / 2;
      button.position.set(x, 0.116, 0.222);
      group.add(button);
      const lbl = createTextPlane(text, { width: 0.07, height: 0.03, fontSize: 22, background: "rgba(15,23,42,0.94)", color: "#cbd5e1" });
      lbl.position.set(x, 0.148, 0.248);
      lbl.rotation.x = -0.18;
      group.add(lbl);
    });

    // === SPIRIT LEVEL ===
    const bubbleLevel = new THREE.Group();
    bubbleLevel.name = "spirit-level";
    const levelCase = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 32), LabMaterials.borosilicateGlass);
    levelCase.rotation.x = Math.PI / 2;
    const levelRing = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.003, 8, 32), LabMaterials.chromeAccent);
    levelRing.rotation.x = Math.PI / 2;
    const levelBubble = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), LabMaterials.hologramBlue);
    levelBubble.position.set(0.003, 0, 0.003);
    // Crosshair in level
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.001, 0.001), LabMaterials.rubberBlack);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.001, 0.04), LabMaterials.rubberBlack);
    bubbleLevel.add(levelCase, levelRing, levelBubble, crossH, crossV);
    bubbleLevel.position.set(0.235, 0.115, -0.125);
    group.add(bubbleLevel);

    // === DRAFT SHIELD - realistic glass with rails ===
    const glassMat = LabMaterials.draftShieldGlass;
    const frameMat = LabMaterials.plasticWhite;

    // Back glass
    const shieldBack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.004), glassMat);
    shieldBack.name = "scale-glass-back";
    shieldBack.position.set(0, 0.265, -0.145);
    group.add(shieldBack);

    // Side glasses
    const shieldLeft = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.24, 0.29), glassMat);
    shieldLeft.name = "scale-glass-side-left";
    shieldLeft.position.set(-0.19, 0.265, 0);
    group.add(shieldLeft);
    const shieldRight = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.24, 0.29), glassMat);
    shieldRight.name = "scale-glass-side-right";
    shieldRight.position.set(0.19, 0.265, 0);
    group.add(shieldRight);

    // Top glass
    const shieldTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.004, 0.29), glassMat);
    shieldTop.name = "scale-glass-top";
    shieldTop.position.set(0, 0.385, 0);
    group.add(shieldTop);

    // Front sliding door panels
    const shieldFrontLeft = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.19, 0.004), glassMat);
    shieldFrontLeft.name = "scale-glass-front-left";
    shieldFrontLeft.position.set(-0.085, 0.255, 0.146);
    group.add(shieldFrontLeft);
    const shieldFrontRight = shieldFrontLeft.clone();
    shieldFrontRight.name = "scale-glass-front-right";
    shieldFrontRight.position.x = 0.075;
    group.add(shieldFrontRight);

    // Door handles (chrome)
    [-0.03, 0.03].forEach((x) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.05, 0.01), LabMaterials.chromeAccent);
      handle.name = "scale-glass-door-handle";
      handle.position.set(x, 0.255, 0.16);
      group.add(handle);
    });

    // Top rail tracks for sliding doors
    [-0.145, 0.145].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.005, 0.005), LabMaterials.anodizedAluminum);
      rail.position.set(0, 0.388, z);
      group.add(rail);
    });
    // Bottom rail tracks
    [-0.145, 0.145].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.005, 0.005), LabMaterials.anodizedAluminum);
      rail.position.set(0, 0.148, z);
      group.add(rail);
    });

    // Frame posts
    [[-0.195, 0.265, -0.145], [0.195, 0.265, -0.145], [-0.195, 0.265, 0.145], [0.195, 0.265, 0.145]].forEach(([x, y, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.23, 0.012), frameMat);
      post.position.set(x, y, z);
      group.add(post);
    });

    // === ANTI-VIBRATION FEET with shock absorbers ===
    [[-0.245, -0.155], [0.245, -0.155], [-0.245, 0.155], [0.245, 0.155]].forEach(([x, z]) => {
      // Rubber base
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.014, 24), LabMaterials.rubberSeal);
      foot.position.set(x, 0.002, z);
      group.add(foot);
      // Metal screw
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 24), LabMaterials.chromeAccent);
      screw.name = "leveling-screw";
      screw.position.set(x, 0.016, z);
      group.add(screw);
      // Shock absorber ring
      const shock = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 20), LabMaterials.siliconePad);
      shock.rotation.x = Math.PI / 2;
      shock.position.set(x, 0.008, z);
      group.add(shock);
    });

    // === BACK PANEL DETAILS ===
    // USB port
    const usbPort = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.006), LabMaterials.plasticDark);
    usbPort.name = "usb-port";
    usbPort.position.set(0.12, 0.05, -0.203);
    group.add(usbPort);
    // Power connector
    const powerPort = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12), LabMaterials.plasticDark);
    powerPort.rotation.x = Math.PI / 2;
    powerPort.position.set(0.18, 0.05, -0.203);
    group.add(powerPort);
    // Cable exit
    const cableExit = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 8), LabMaterials.cablePlastic);
    cableExit.rotation.x = Math.PI / 2;
    cableExit.position.set(0.18, 0.05, -0.22);
    group.add(cableExit);

    // === BRAND & SERIAL PLATES ===
    const label = createTextSprite("Analytical Balance", { width: 0.34, height: 0.075, fontSize: 38 });
    label.position.set(0, 0.455, -0.18);
    group.add(label);

    const brand = createTextPlane("0.1 mg | GMP", { width: 0.14, height: 0.04, fontSize: 22, background: "rgba(255,255,255,0.95)", color: "#334155" });
    brand.position.set(0.04, 0.15, 0.25);
    brand.rotation.x = -0.18;
    group.add(brand);

    // Serial number plate (back)
    const serialPlate = createTextPlane("S/N: MR-2026-001", { width: 0.16, height: 0.03, fontSize: 18, background: "rgba(200,210,220,0.92)", color: "#1e293b" });
    serialPlate.position.set(0, 0.07, -0.202);
    group.add(serialPlate);

    return group;
  }

  async createAnalyticalScaleAsync(options: ScaleOptions = {}): Promise<THREE.Group> {
    const loaded = await this.tryAsset("analytical_scale");
    if (loaded) return this.wrapLoadedAsset(loaded, "Analytical Scale", options.scale);
    return this.createAnalyticalScale(options);
  }

  updateScaleDisplay(scaleGroup: THREE.Group, massText: string): void {
    const display = scaleGroup.getObjectByName("scale-display-text");
    if (display instanceof THREE.Mesh) {
      updateTextPlane(display, massText, { width: 0.28, height: 0.085, fontSize: 58, background: "rgba(3, 7, 18, 0.96)", color: "#7dd3fc" });
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
      const granuleCount = Math.min(28, Math.max(8, Math.round(amount * 18)));
      for (let i = 0; i < granuleCount; i += 1) {
        const angle = (i / granuleCount) * Math.PI * 2;
        const radius = 0.014 + ((i * 7) % 9) * 0.006 * amount;
        const granule = new THREE.Mesh(new THREE.SphereGeometry(0.0045 + (i % 3) * 0.0012, 8, 6), material);
        granule.name = "powder-granule";
        granule.position.set(Math.cos(angle) * radius, 0.022 + (i % 4) * 0.002, Math.sin(angle) * radius * 0.78);
        group.add(granule);
      }
    }
    return group;
  }

  createMortarAndPestle(options: ScaleOptions = {}): THREE.Group {
    const group = new THREE.Group();
    group.name = "Mortar and Pestle";
    group.scale.setScalar(options.scale ?? this.objectScale);

    // Outer bowl - glazed porcelain
    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.105, 0.16, 48, 1, true), LabMaterials.porcelainGlazed);
    mortar.name = "mortar-bowl";
    mortar.position.y = 0.095;
    group.add(mortar);

    // Inner grinding surface - rough texture
    const innerBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.065, 0.125, 48, 1, true), LabMaterials.porcelainShadow);
    innerBowl.name = "mortar-inner-bowl";
    innerBowl.position.y = 0.108;
    group.add(innerBowl);

    // Rim with glazed finish
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.014, 16, 48), LabMaterials.porcelainGlazed);
    rim.name = "mortar-rim";
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.18;
    group.add(rim);

    // Pouring spout
    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.016, 0.025), LabMaterials.porcelainGlazed);
    spout.name = "mortar-spout";
    spout.position.set(0, 0.175, 0.19);
    spout.rotation.x = -0.3;
    group.add(spout);

    // Foot ring
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.035, 42), LabMaterials.porcelainGlazed);
    foot.name = "mortar-foot";
    foot.position.y = 0.02;
    group.add(foot);

    // Foot ring edge
    const footRing = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.005, 8, 36), LabMaterials.porcelain);
    footRing.rotation.x = Math.PI / 2;
    footRing.position.y = 0.005;
    group.add(footRing);

    // Rubber rest pad
    const restPad = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.006, 32), LabMaterials.rubberSeal);
    restPad.name = "mortar-rest-pad";
    restPad.position.y = -0.002;
    group.add(restPad);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.08, 0.012, 32), LabMaterials.powderWhite);
    inner.name = "mortar-powder";
    inner.position.y = 0.106;
    inner.visible = false;
    group.add(inner);

    // Pestle with grip texture
    const pestle = new THREE.Group();
    pestle.name = "pestle";
    pestle.rotation.z = Math.PI / 5;
    pestle.position.set(0.19, 0.17, 0.02);
    const pestleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.31, 32), LabMaterials.porcelainGlazed);
    pestleHandle.name = "pestle-handle";

    // Grip texture rings on pestle handle
    for (let i = 0; i < 5; i++) {
      const gripRing = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.002, 6, 18), LabMaterials.porcelain);
      gripRing.position.y = 0.06 + i * 0.025;
      pestle.add(gripRing);
    }

    // Grinding head - unglazed for rough grinding
    const pestleHead = new THREE.Mesh(new THREE.SphereGeometry(0.048, 24, 14), LabMaterials.porcelainShadow);
    pestleHead.name = "pestle-grinding-head";
    pestleHead.position.y = -0.17;
    pestleHead.scale.set(1, 0.72, 1);

    // Top knob
    const pestleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 10), LabMaterials.porcelainGlazed);
    pestleKnob.position.y = 0.165;
    pestle.add(pestleHandle, pestleHead, pestleKnob);
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

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.066, 0.22, 40), bodyMaterial);
    body.name = "bottle-body";
    body.position.y = 0.1;
    group.add(body);

    const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.13, 36), getPowderMaterial(options.color === 0xfca5a5 ? "white" : "yellow"));
    fill.name = "bottle-powder-fill";
    fill.position.y = 0.064;
    group.add(fill);

    const fillSurface = this.createPowderMound({ amountNormalized: 0.55, materialType: options.color === 0xfca5a5 ? "white" : "yellow" });
    fillSurface.name = "bottle-visible-powder-surface";
    fillSurface.scale.set(0.62, 0.22, 0.62);
    fillSurface.position.y = 0.135;
    group.add(fillSurface);

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

    for (let i = 0; i < 5; i += 1) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(i % 2 === 0 ? 0.032 : 0.02, 0.0025, 0.002), LabMaterials.labelBackground);
      tick.name = "bottle-graduation";
      tick.position.set(0.043, 0.045 + i * 0.028, 0.061);
      group.add(tick);
    }

    const label = createTextSprite(options.label, { width: 0.19, height: 0.07, fontSize: 32, background: "rgba(255,255,255,0.94)", color: "#0f172a" });
    label.position.set(0, 0.115, 0.067);
    group.add(label);
    const hazard = createTextSprite("LAB", { width: 0.07, height: 0.032, fontSize: 22, background: "rgba(250,204,21,0.94)", color: "#111827" });
    hazard.position.set(0, 0.062, 0.068);
    group.add(hazard);
    const tamperBand = new THREE.Mesh(new THREE.TorusGeometry(0.039, 0.004, 8, 28), LabMaterials.hologramBlue);
    tamperBand.name = "bottle-tamper-band";
    tamperBand.rotation.x = Math.PI / 2;
    tamperBand.position.y = 0.231;
    group.add(tamperBand);
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
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.008, 36), LabMaterials.brushedMetal);
    bottom.name = "final-container-bottom";
    bottom.position.y = 0.012;
    group.add(bottom);
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
    const width = Math.min(0.68, Math.max(0.24, text.length * 0.018));
    const badge = createTextSprite(text, { width, height: 0.075, fontSize: 38, status });
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
