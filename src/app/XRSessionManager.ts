import * as THREE from "three";

export class XRSessionManager {
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;

  constructor(private readonly renderer: THREE.WebGLRenderer) {}

  async isImmersiveARSupported(): Promise<boolean> {
    if (!navigator.xr) return false;
    return navigator.xr.isSessionSupported("immersive-ar");
  }

  async startSession(): Promise<XRSession> {
    if (!window.isSecureContext) {
      throw new Error("WebXR requires HTTPS secure context on Meta Quest Browser. Current page is not secure. Deploy to Vercel/Netlify or use a trusted HTTPS server.");
    }

    if (!navigator.xr) {
      throw new Error("WebXR tidak tersedia di browser ini.");
    }

    const supported = await this.isImmersiveARSupported();
    if (!supported) {
      throw new Error("immersive-ar tidak didukung. Gunakan Meta Quest Browser dengan passthrough aktif.");
    }

    this.session = await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["local-floor"],
      optionalFeatures: ["hit-test", "anchors", "dom-overlay"],
      domOverlay: { root: document.getElementById("app") ?? document.body },
    });

    this.renderer.xr.enabled = true;
    await this.renderer.xr.setSession(this.session);
    this.referenceSpace = await this.session.requestReferenceSpace("local-floor");
    this.session.addEventListener("end", () => {
      this.session = null;
      this.referenceSpace = null;
    });
    return this.session;
  }

  getReferenceSpace(): XRReferenceSpace | null {
    return this.referenceSpace ?? this.renderer.xr.getReferenceSpace();
  }

  getSession(): XRSession | null {
    return this.session;
  }

  async endSession(): Promise<void> {
    await this.session?.end();
  }
}
