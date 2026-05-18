# Report Stage 5 — Asset Pipeline & Pharmacy Content Pack

## Ringkasan

Stage 5 menambahkan pipeline asset GLB/GLTF lokal, fallback procedural otomatis, manifest/registry asset, content pack skenario farmasi, scenario selection sebelum modul, dan metadata skenario di result/export. Aplikasi tetap bisa berjalan tanpa file GLB.

## Fitur Baru

- `AssetManifest`, `AssetRegistry`, dan `AssetLoader`.
- Toggle `Use External 3D Assets`.
- Asset status panel.
- Folder `public/assets/models` dengan README per kategori.
- Tambahan skenario penimbangan dan pencampuran.
- Scenario selection untuk Modul 1 dan Modul 2.
- Result report menyimpan scenario title, difficulty, learning objectives, material/ingredients, dan asset mode.

## Asset Pipeline

Manifest mendefinisikan asset id, kategori, nama, path GLB, scale, rotation, fallback type, dan required flag. Semua asset Stage 5 `required: false`, sehingga missing GLB tidak menyebabkan crash. `AssetLoader` memakai `GLTFLoader`, cache hasil load, clone scene saat dibutuhkan, dan mengembalikan `null` jika file tidak tersedia.

## Asset Settings

Home UI memiliki toggle `Use External 3D Assets`. Jika aktif, `LabObjectFactory` mencoba memuat GLB. Jika gagal, factory memakai procedural fallback dan mencatat status `Missing / Fallback`. Jika nonaktif, procedural object dipakai langsung.

## Pharmacy Content Pack

Modul 1 kini memiliki:
- Penimbangan Paracetamol 500 mg
- Penimbangan Lactose 1 g
- Penimbangan Talcum 250 mg

Modul 2 kini memiliki:
- Pencampuran Serbuk Sederhana
- Pencampuran Paracetamol dan Lactose
- Pencampuran Pengenceran Serbuk

## Scenario Selection

Saat user memilih Modul 1 atau Modul 2, aplikasi menampilkan scenario selection panel. User dapat melihat target, difficulty, dan learning objectives sebelum menekan `Start Selected Scenario`.

## Result Report Update

`ModuleResult` sekarang mendukung `scenarioTitle`, `difficulty`, `learningObjectives`, `materialName`, `ingredients`, dan `selectedAssetMode`. CSV export menambahkan kolom scenario title, difficulty, dan asset mode. Result lama tetap aman karena field optional diberi fallback kosong atau `unknown`.

## Backward Compatibility

Missing GLB tidak fatal. Result lama tanpa field Stage 5 tetap bisa dirender dan diexport. Mode procedural tetap default agar Stage 1-4 flow tidak berubah.

## Cara Menjalankan

```bash
npm install
npm run dev
npm run build
```

## Cara Menambahkan GLB Lokal

1. Taruh file di `public/assets/models/...`.
2. Update `AssetManifest.ts` jika nama/path berbeda.
3. Aktifkan `Use External 3D Assets`.
4. Test modul di Desktop Module Demo atau Meta Quest Browser.

## Cara Test Desktop

- Jalankan Desktop Module Demo.
- Pilih Modul 1, pilih skenario berbeda, dan finish.
- Pilih Modul 2, pilih skenario berbeda, dan finish.
- Aktifkan external assets tanpa GLB dan pastikan fallback berjalan.
- Export CSV/JSON dan cek field scenario.

## Cara Test Meta Quest

- Buka via HTTPS.
- Jalankan Start MR Lab dan placement.
- Pilih modul lalu skenario.
- Test mode procedural dan external-assets fallback.
- Pastikan missing GLB tidak crash.

## Batasan Saat Ini

- Belum ada GLB bawaan.
- Kualitas asset bergantung file lokal.
- Fallback procedural masih digunakan.
- Belum ada hand tracking.
- Belum ada spatial anchor permanen.
- Belum ada validasi farmasi lanjutan oleh SME.

## Bug / Risiko

- Asset status baru berubah setelah percobaan load, sehingga panel Home perlu dibuka ulang untuk melihat status terbaru.
- GLB besar dapat menurunkan FPS di Quest.
- Asset orientation/scale mungkin perlu tuning per file.

## Rekomendasi Stage 6

- Tambahkan GLB low-poly legal dan optimasi LOD.
- Tambahkan validasi farmasi oleh SME.
- Tambahkan tests untuk AssetLoader dan scenario selection.
