# Report Stage 3 — Visual & Interaction Polish

## Ringkasan

Stage 3 meningkatkan kualitas demo tanpa merombak fondasi WebXR. Fokusnya adalah procedural low-poly lab objects, visual feedback untuk massa dan homogenitas, animasi ringan, audio/haptic fallback, toast non-blocking, dan kalibrasi ukuran objek.

## Fitur Baru

- Reusable material lab di `LabMaterials`.
- Text sprite helper dengan update texture aman di `LabObjectLabels`.
- Animasi ringan di `LabAnimations`.
- Toast manager dengan maksimal 3 pesan dan auto dismiss.
- Haptic/audio feedback aman di desktop dan headset.
- Object scale calibration: Small 0.8x, Standard 1.0x, Large 1.2x.
- Upgrade procedural object factory untuk scale, weighing boat, powder mound, mortar, bottle, final container, dan status badge.

## Visual Upgrade

- Timbangan: base lebih besar, weighing plate metal, display digital, tombol tare, glass wind shield, dan label alat.
- Weighing boat: tray dangkal dengan label dan powder mound.
- Serbuk: mound procedural yang ukurannya mengikuti massa atau state mixing.
- Mortar/stamper: mortar cup dengan rim, pestle, inner powder area, dan label.
- Botol bahan: body transparan, shoulder, cap, dan label ingredient.
- Final container: cup kecil transparan dengan powder mixed.
- Labels/status badge: sprite canvas untuk nama alat, massa, homogenitas, dan status singkat.

## Modul 1 Upgrade

Modul penimbangan sekarang memunculkan scale procedural dan botol Paracetamol. Weighing boat baru muncul setelah aksi `Place Weighing Boat`. Saat sample ditambahkan atau dikurangi, powder mound berubah ukuran dan display massa pada objek scale ikut berubah. Confirm mass memberi pulse success jika sesuai toleransi atau shake/error jika belum sesuai.

## Modul 2 Upgrade

Modul pencampuran sekarang memakai mortar/pestle procedural, botol A/B, label homogenitas, powder di mortar, dan final container. Aksi mixing memicu animasi pestle serta perubahan warna powder menuju mixed ketika homogenitas naik. Transfer memunculkan final container dan menyembunyikan powder mortar.

## UI/UX Upgrade

Instruction panel menampilkan title, target, langkah aktif, dan feedback. Progress panel kini memakai tanda status: `✓`, `→`, `!`, dan `○`. Result panel menampilkan skor besar, status Passed/Failed, dan detail step dalam elemen collapsible. ToastManager diposisikan di sisi kanan/atas agar tidak menutupi tombol aksi.

## Haptic / Audio Feedback

`HapticsManager` mencoba memanggil haptic actuator gamepad jika tersedia dan silent fallback jika tidak ada. `AudioFeedbackManager` memakai Web Audio API dengan volume rendah dan try/catch agar tidak crash saat browser memblokir audio. `InteractionFeedback` menjadi facade untuk success, error, warning, info, dan finish.

## Calibration

`ScaleCalibrationManager` menyimpan pilihan object scale ke `localStorage`. Home UI menyediakan pilihan Small Lab Table 0.8x, Standard Lab Table 1.0x, dan Large Lab Table 1.2x. Pilihan ini mempengaruhi ukuran alat baru saat modul dijalankan.

## Performance Notes

Model masih procedural low-poly dan ringan untuk Meta Quest Browser. Powder dibatasi sebagai beberapa geometry sederhana, bukan particle system. Canvas texture label lama dibuang saat update display. Potensi masalah tersisa: beberapa material warna dinamis pada mixing masih dapat dibuat ulang saat update visual dan perlu pooling lebih ketat jika frekuensi update ditingkatkan.

## Cara Menjalankan

```bash
npm install
npm run dev
npm run build
```

## Cara Test Desktop

1. Buka app di browser desktop.
2. Pilih Object Scale.
3. Klik `Desktop Module Demo`.
4. Jalankan Modul 1 dan amati scale, weighing boat, powder, display massa, badge status, dan result.
5. Jalankan Modul 2 dan amati mortar, powder, homogenitas, final container, dan result.

## Cara Test Meta Quest

1. Akses aplikasi melalui HTTPS di Meta Quest Browser.
2. Klik `Start MR Lab`.
3. Tandai 1-3 meja seperti Stage 1.
4. Pilih modul dan jalankan aksi.
5. Pastikan overlay tidak menutup tombol, visual alat muncul di meja, dan result panel tetap tampil.

## Batasan Saat Ini

- Belum memakai GLB realistis.
- Procedural model masih sederhana.
- Belum ada hand tracking penuh.
- Spatial anchor permanen belum final.
- Audio/haptic bergantung dukungan browser/device.
- Belum ada physics cairan/serbuk nyata.

## Bug / Risiko

- DOM overlay tetap bisa berbeda pada versi Meta Quest Browser tertentu.
- Audio dapat diblokir sampai ada user gesture.
- Haptics hanya bekerja jika gamepad XR expose haptic actuator.
- Label sprite selalu billboard, tetapi belum secara eksplisit menghadap camera per-frame.
- Calibration hanya mempengaruhi objek baru, bukan objek yang sudah muncul.

## Rekomendasi Stage 4

- Ganti procedural tools dengan GLB realistis dan optimasi LOD.
- Tambahkan hand tracking dan gesture grabbing.
- Tambahkan spatial anchors permanen.
- Tambahkan pooling material/label yang lebih formal.
- Tambahkan export report praktikum.
