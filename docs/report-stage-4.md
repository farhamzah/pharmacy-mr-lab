# Report Stage 4 — Persistence, Export, and Quest Readiness

## Ringkasan

Stage 4 memperkuat reliability prototype: persistence room setup memakai record baru, resume flow dari Home, export hasil JSON/CSV, diagnostics WebXR/browser, Quest checklist, performance guard, dan cleanup dynamic labels/material. Fondasi WebXR, scoring, visual procedural, dan Desktop Module Demo tetap dipertahankan.

## Fitur Baru

- `RoomSetupRecord` dengan metadata, calibration, persistence mode, dan notes.
- Current room setup dan history maksimal 5 setup.
- Migration ringan dari format meja lama Stage 1-3.
- Saved setup card di Home dengan Resume, Recalibrate, dan Delete.
- Export last result JSON dan result history CSV.
- Diagnostics panel untuk WebXR/browser capability.
- Quest Testing Checklist di Home.
- `PerformanceMonitor` dengan warning FPS rendah saat `DEBUG_PERFORMANCE` aktif.
- `disposeObject3D` untuk membersihkan geometry/material/texture dynamic saat module switch.

## Room Setup Persistence

Room setup sekarang disimpan sebagai `RoomSetupRecord` di `localStorage`. Record memuat `id`, timestamp, `appVersion`, jumlah meja, role meja, label, calibration profile, object scale, dan `persistenceMode`. Karena spatial anchor permanen belum final, mode saat ini adalah `localStorage-fallback`.

Jika data lama `pharmacy-mr-lab.tables.v1` ditemukan, storage melakukan migration ke record baru. Saved setup card menampilkan jumlah meja, role, updated time, object scale, serta warning bahwa recalibration mungkin diperlukan jika ruangan berubah.

Resume Saved Setup membuat ulang table markers dan langsung masuk module menu. Recalibrate menghapus current setup lalu memulai placement dari awal. Delete Saved Setup hanya menghapus setup, bukan result history.

## Result Export

`ResultExporter` mendukung:

- `exportLastResultAsJSON()`
- `exportResultHistoryAsJSON()`
- `exportResultHistoryAsCSV()`

CSV berisi `finishedAt`, `moduleId`, `moduleName`, `scenarioId`, `score`, `maxScore`, `passed`, dan `feedbackSummary`. Escaping comma, quote, dan newline dilakukan di `csvUtils`.

## Diagnostics

Diagnostics mengecek user agent, `navigator.xr`, dukungan `immersive-ar`, status localStorage, WebGL context, device pixel ratio, dan viewport. Feature seperti hit-test, anchors, dan dom-overlay ditandai `Unknown` jika tidak dapat dipastikan sebelum session agar tidak membuat klaim palsu.

## Quest Testing Checklist

Home UI kini memiliki checklist: ruangan terang, area aman, Meta Quest Browser, HTTPS, izin WebXR, controller aktif, meja terlihat jelas, dan tidak berjalan terlalu jauh.

## Performance Guard

`PerformanceMonitor` menghitung FPS rata-rata per beberapa detik. Jika `DEBUG_PERFORMANCE` diaktifkan dan FPS di bawah 45, app menampilkan toast warning dengan cooldown minimal 15 detik.

## Cleanup / Dispose Improvement

Dynamic canvas textures dari labels ditandai lewat `userData.dynamicTexture`; material dynamic ditandai `dynamicMaterial`; shared material dari `LabMaterials` ditandai `sharedMaterial`. `BaseModule.dispose()` memakai `disposeObject3D()` agar module switch/retry membersihkan geometry dan texture dynamic tanpa membuang material shared.

## Error Handling

User-facing toast/message ditambahkan untuk WebXR unsupported, immersive-ar unsupported, saved setup corrupt/resume gagal, export kosong/gagal, diagnostics gagal, copy clipboard gagal, dan result history clear.

## Cara Menjalankan

```bash
npm install
npm run dev
npm run build
```

## Cara Test Desktop

1. Jalankan app di browser desktop.
2. Gunakan Desktop Module Demo untuk membuat saved setup fallback.
3. Reload dan cek saved setup card.
4. Klik Resume Saved Setup dan pastikan module menu muncul.
5. Jalankan modul hingga result muncul.
6. Export Last Result JSON dan History CSV.
7. Run Diagnostics dan Copy Diagnostics JSON.
8. Aktifkan `DEBUG_PERFORMANCE` di `constants.ts` untuk menguji warning FPS.

## Cara Test Meta Quest

1. Buka app via HTTPS di Meta Quest Browser.
2. Start MR Lab, lakukan placement 1-3 meja.
3. Selesaikan setup, jalankan modul, dan lihat result.
4. Reload app, gunakan Resume Saved Setup.
5. Jika room berubah, gunakan Recalibrate Room.
6. Jalankan diagnostics.
7. Coba export jika download didukung browser.

## Batasan Saat Ini

- Spatial anchor permanen belum final.
- Saved setup masih local fallback.
- GLB realistis belum ada.
- Hand tracking belum ada.
- Export download bisa berbeda perilakunya di Meta Quest Browser.
- Diagnostics WebXR feature tidak selalu bisa dipastikan sebelum session.

## Bug / Risiko

- Resume saved setup berbasis posisi relatif session sehingga dapat bergeser dari meja fisik.
- Clipboard copy diagnostics bisa gagal jika browser tidak memberi permission.
- Download Blob di Meta Quest Browser perlu diuji langsung karena perilaku dapat berbeda.
- Performance monitor default off agar tidak mengganggu demo.

## Rekomendasi Stage 5

- Implementasi spatial anchors permanen atau anchor provider abstraction yang lebih nyata.
- Export PDF/printable report.
- QA pass langsung di Meta Quest Browser dengan HTTPS deployment.
- Tambah automated tests untuk storage migration, CSV export, dan rubric.
