interface Navigator {
  xr?: XRSystem;
}

interface Window {
  webkitAudioContext?: typeof AudioContext;
}

interface GamepadHapticActuator {
  pulse?(value: number, duration: number): Promise<boolean>;
}

interface Gamepad {
  hapticActuators?: GamepadHapticActuator[];
}

interface XRSystem {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>;
  requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
}

type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: Element };
}

interface XRSession extends EventTarget {
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  requestHitTestSource?(options: { space: XRReferenceSpace }): Promise<XRHitTestSource>;
  end(): Promise<void>;
}

type XRReferenceSpaceType = "viewer" | "local" | "local-floor" | "bounded-floor" | "unbounded";

interface XRReferenceSpace {}

interface XRFrame {
  getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
}

interface XRHitTestSource {
  cancel(): void;
}

interface XRHitTestResult {
  getPose(baseSpace: XRReferenceSpace): XRPose | undefined;
}

interface XRPose {
  transform: XRRigidTransform;
}

interface XRRigidTransform {
  matrix: Float32Array;
}
