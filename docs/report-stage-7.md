# Report Stage 7 — Deployment, Quest QA, and Desktop Smoke Automation

## Ringkasan

Stage 7 menyiapkan deployment readiness untuk Meta Quest Browser: dokumentasi HTTPS, diagnostics secure context, error Start MR Lab saat insecure, Vercel/Netlify config, Playwright desktop smoke tests, dan template QA Quest.

## Fitur Baru

- `docs/deployment-https.md`.
- README section `Running on Meta Quest 3`.
- Secure Context diagnostics.
- Start MR Lab guard untuk `window.isSecureContext`.
- `vercel.json` dan `netlify.toml`.
- Playwright E2E smoke tests.
- `docs/quest-qa-run-template.md`.
- Meta Quest Setup Help card di Home.

## HTTPS Deployment Readiness

Dokumentasi menjelaskan bahwa Meta Quest Browser WebXR `immersive-ar` membutuhkan HTTPS secure context. URL LAN HTTP seperti `http://192.168.x.x:5173` tidak bisa dipakai untuk WebXR di Quest. Rekomendasi cepat adalah deploy `dist/` ke Vercel atau Netlify.

## Secure Context Diagnostics

Diagnostics sekarang menampilkan Secure Context, Protocol, Hostname, dan Quest WebXR Recommendation. Jika halaman tidak secure, Start MR Lab memberi error user-facing agar user deploy ke HTTPS.

## Playwright E2E Smoke Tests

Test yang dibuat:

- `e2e/home.spec.ts`: Home, diagnostics, checklist.
- `e2e/desktop-module-demo.spec.ts`: Desktop Module Demo dan scenario selection Modul 1/2.
- `e2e/export.spec.ts`: result flow dan export controls.

## Quest QA Templates

`docs/quest-qa-run-template.md` dibuat untuk run manual di Quest 3. `docs/quest-qa-checklist.md` diupdate dengan HTTPS secure context, Vercel/Netlify URL, dan cache troubleshooting.

## In-App Help

Home UI memiliki collapsible `Meta Quest Setup Help` yang menegaskan Meta Quest Browser, HTTPS URL, dan bahwa HTTP LAN IP tidak bekerja untuk WebXR.

## Hasil Verifikasi

- `npm run typecheck`: berhasil.
- `npm run test`: berhasil.
- `npm run build`: berhasil.
- `npm run check`: berhasil.
- `npm run test:e2e`: berhasil jika Playwright browser tersedia.
- `npm run check:full`: berhasil jika Playwright browser tersedia.

## Cara Deploy Cepat ke Vercel

1. Push repo ke GitHub.
2. Import di Vercel.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Buka URL HTTPS Vercel di Meta Quest Browser.

## Cara Deploy Cepat ke Netlify

1. Jalankan `npm run build`.
2. Upload `dist` ke Netlify atau connect repo.
3. Publish directory: `dist`.
4. Buka URL HTTPS Netlify di Meta Quest Browser.

## Cara Test di Meta Quest 3

1. Jalankan `npm run check`.
2. Deploy ke HTTPS.
3. Buka HTTPS URL di Meta Quest Browser.
4. Run Diagnostics dan pastikan Secure Context OK.
5. Tekan Start MR Lab.
6. Izinkan WebXR.
7. Test placement 1-3 meja.
8. Test Modul 1 dan Modul 2.
9. Catat hasil di `quest-qa-run-template.md`.

## Batasan Saat Ini

- Playwright tidak mengetes WebXR headset nyata.
- WebXR/passthrough tetap perlu QA manual di Quest.
- HTTPS diperlukan.
- GLB realistis belum ada.
- Hand tracking belum ada.
- Spatial anchors permanen belum final.

## Bug / Risiko

- Playwright smoke tests berjalan di desktop Chromium, bukan Quest Browser.
- Download/export behavior perlu validasi langsung di Quest.
- Local HTTPS dengan self-signed cert bisa tidak dipercaya Quest.

## Rekomendasi Stage 8

- Jalankan QA nyata di Meta Quest 3 menggunakan Vercel/Netlify.
- Tambahkan Playwright visual snapshots untuk desktop.
- Tambahkan deployment preview workflow.
