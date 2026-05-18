import * as THREE from "three";
import { DiagnosticReport } from "./WebXRDiagnostics";

export class DiagnosticsManager {
  constructor(private readonly renderer: THREE.WebGLRenderer) {}

  async run(): Promise<DiagnosticReport> {
    const items: DiagnosticReport["items"] = [];
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    const isHttpLan = location.protocol === "http:" && !isLocalhost;
    items.push({
      label: "Secure Context",
      status: window.isSecureContext ? "OK" : "Not Available",
      detail: window.isSecureContext
        ? "Secure context OK."
        : "WebXR immersive-ar requires HTTPS on Meta Quest Browser. Deploy to Vercel/Netlify or use a trusted HTTPS server.",
    });
    items.push({ label: "Protocol", status: location.protocol === "https:" || isLocalhost ? "OK" : "Warning", detail: location.protocol.replace(":", "") });
    items.push({ label: "Hostname", status: isHttpLan ? "Warning" : "OK", detail: location.hostname || "unknown" });
    items.push({
      label: "Quest WebXR Recommendation",
      status: window.isSecureContext ? "OK" : "Warning",
      detail: isHttpLan
        ? "HTTP LAN IP seperti http://192.168.x.x:5173 tidak bisa untuk WebXR immersive-ar di Quest. Gunakan HTTPS deployment."
        : window.isSecureContext ? "Secure context OK." : "Gunakan HTTPS untuk Meta Quest Browser.",
    });
    const xr = navigator.xr;
    items.push({
      label: "navigator.xr",
      status: xr ? "OK" : "Not Available",
      detail: xr ? "WebXR entry point tersedia." : "Browser tidak mengekspos navigator.xr.",
    });

    let immersiveAr: "OK" | "Not Available" | "Unknown" = "Unknown";
    if (xr?.isSessionSupported) {
      try {
        immersiveAr = (await xr.isSessionSupported("immersive-ar")) ? "OK" : "Not Available";
      } catch {
        immersiveAr = "Unknown";
      }
    }
    items.push({ label: "immersive-ar", status: immersiveAr, detail: immersiveAr === "OK" ? "immersive-ar didukung." : "Tidak dapat dipastikan atau tidak didukung." });
    items.push({ label: "hit-test", status: "Unknown", detail: "Feature biasanya diverifikasi saat XR session dibuat." });
    items.push({ label: "anchors", status: "Unknown", detail: "WebXR anchors tidak dapat dipastikan sebelum session pada banyak browser." });
    items.push({ label: "dom-overlay", status: "Unknown", detail: "Diajukan sebagai optional feature saat start XR." });

    try {
      const key = "pharmacy-mr-lab.storage-test";
      localStorage.setItem(key, "ok");
      localStorage.removeItem(key);
      items.push({ label: "localStorage", status: "OK", detail: "localStorage tersedia." });
    } catch {
      items.push({ label: "localStorage", status: "Not Available", detail: "localStorage tidak dapat ditulis." });
    }

    const gl = this.renderer.getContext();
    items.push({ label: "WebGL", status: gl ? "OK" : "Not Available", detail: gl ? `Renderer aktif. DPR ${window.devicePixelRatio}.` : "WebGL context tidak tersedia." });

    return {
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      items,
      viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio },
    };
  }
}
