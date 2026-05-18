import * as THREE from "three";

type AnimationCallback = (progress: number) => void;

function run(durationMs: number, callback: AnimationCallback, done?: () => void): void {
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    callback(easeOut(progress));
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      done?.();
    }
  };
  requestAnimationFrame(tick);
}

function easeOut(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

export function animatePowderAdded(object: THREE.Object3D): void {
  const target = object.scale.clone();
  object.scale.setScalar(0.2);
  run(260, (progress) => {
    object.scale.set(target.x * progress, target.y * progress, target.z * progress);
  });
}

export function animateScaleReading(displayObject?: THREE.Object3D): void {
  if (!displayObject) return;
  const base = displayObject.scale.clone();
  run(220, (progress) => {
    const pulse = 1 + Math.sin(progress * Math.PI) * 0.14;
    displayObject.scale.set(base.x * pulse, base.y * pulse, base.z);
  }, () => displayObject.scale.copy(base));
}

export function animateMixing(mortarGroup?: THREE.Object3D, pestleGroup?: THREE.Object3D): void {
  const mortarBase = mortarGroup?.rotation.y ?? 0;
  const pestleBase = pestleGroup?.rotation.z ?? 0;
  run(640, (progress) => {
    if (mortarGroup) mortarGroup.rotation.y = mortarBase + Math.sin(progress * Math.PI * 8) * 0.045;
    if (pestleGroup) pestleGroup.rotation.z = pestleBase + Math.sin(progress * Math.PI * 10) * 0.18;
  }, () => {
    if (mortarGroup) mortarGroup.rotation.y = mortarBase;
    if (pestleGroup) pestleGroup.rotation.z = pestleBase;
  });
}

export function animateSuccess(object?: THREE.Object3D): void {
  if (!object) return;
  const base = object.scale.clone();
  run(360, (progress) => {
    const pulse = 1 + Math.sin(progress * Math.PI) * 0.08;
    object.scale.set(base.x * pulse, base.y * pulse, base.z * pulse);
  }, () => object.scale.copy(base));
}

export function animateError(object?: THREE.Object3D): void {
  if (!object) return;
  const baseX = object.position.x;
  run(280, (progress) => {
    object.position.x = baseX + Math.sin(progress * Math.PI * 8) * 0.012;
  }, () => {
    object.position.x = baseX;
  });
}

export function animatePowderTransfer(parent: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material): void {
  const stream = new THREE.Group();
  stream.name = "powder-transfer-animation";
  const particles = Array.from({ length: 10 }, (_, index) => {
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.006 + (index % 3) * 0.0015, 8, 6), material);
    particle.position.copy(from);
    stream.add(particle);
    return particle;
  });
  parent.add(stream);

  run(620, (progress) => {
    particles.forEach((particle, index) => {
      const delay = index * 0.035;
      const localProgress = Math.max(0, Math.min(1, (progress - delay) / 0.65));
      const arc = Math.sin(localProgress * Math.PI) * 0.12;
      particle.position.lerpVectors(from, to, localProgress);
      particle.position.y += arc;
      particle.visible = localProgress > 0 && localProgress < 1;
    });
  }, () => {
    parent.remove(stream);
    stream.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    stream.clear();
  });
}
