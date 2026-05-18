import * as THREE from "three";
import { getStatusColor, StatusType } from "./LabMaterials";

export interface TextSpriteOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  background?: string;
  color?: string;
  status?: StatusType;
}

export function createTextSprite(text: string, options: TextSpriteOptions = {}): THREE.Sprite {
  const material = createSpriteMaterial(text, options);
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(options.width ?? 0.3, options.height ?? 0.095, 1);
  sprite.userData.labelText = text;
  return sprite;
}

export function updateTextSprite(sprite: THREE.Sprite, text: string, options: TextSpriteOptions = {}): void {
  const oldMap = sprite.material.map;
  oldMap?.dispose();
  sprite.material.dispose();
  sprite.material = createSpriteMaterial(text, options);
  sprite.userData.labelText = text;
}

export function createTextPlane(text: string, options: TextSpriteOptions = {}): THREE.Mesh {
  const width = options.width ?? 0.3;
  const height = options.height ?? 0.095;
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = createPlaneMaterial(text, options);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.labelText = text;
  mesh.userData.dynamicLabel = true;
  return mesh;
}

export function updateTextPlane(mesh: THREE.Mesh, text: string, options: TextSpriteOptions = {}): void {
  const material = mesh.material;
  if (material instanceof THREE.MeshBasicMaterial) {
    material.map?.dispose();
    material.dispose();
  }
  mesh.material = createPlaneMaterial(text, options);
  mesh.userData.labelText = text;
}

function createSpriteMaterial(text: string, options: TextSpriteOptions): THREE.SpriteMaterial {
  const texture = createTextTexture(text, options);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  material.userData.dynamicMaterial = true;
  return material;
}

function createPlaneMaterial(text: string, options: TextSpriteOptions): THREE.MeshBasicMaterial {
  const texture = createTextTexture(text, options);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.userData.dynamicMaterial = true;
  return material;
}

function createTextTexture(text: string, options: TextSpriteOptions): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (context) {
    const background = options.background ?? "rgba(8, 16, 24, 0.82)";
    const color = options.color ?? (options.status ? getStatusColor(options.status) : "#eff6ff");
    context.clearRect(0, 0, canvas.width, canvas.height);
    roundRect(context, 12, 12, canvas.width - 24, canvas.height - 24, 22, background);
    context.fillStyle = color;
    context.font = `700 ${options.fontSize ?? 46}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 56);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.dynamicTexture = true;
  return texture;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fillStyle: string): void {
  context.fillStyle = fillStyle;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
}
