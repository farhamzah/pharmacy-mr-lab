# Report Stage 2 — Module Interaction & Scoring

## Ringkasan

Stage 2 meng-upgrade Modul 1 dan Modul 2 dari interaksi dummy menjadi simulasi pembelajaran sederhana berbasis skenario, langkah, validasi, scoring, result summary, dan persistence hasil praktikum. Fondasi WebXR Stage 1 tetap dipertahankan.

## Fitur Baru

- Data skenario praktikum untuk penimbangan Paracetamol 500 mg dan pencampuran serbuk sederhana.
- Step system reusable dengan status `pending`, `active`, `done`, dan `error`.
- Progress panel untuk menampilkan daftar langkah modul.
- Scoring system reusable melalui `ScoreManager` dan `RubricEvaluator`.
- Result panel berisi skor, status passed/failed, detail step result, dan feedback.
- Penyimpanan `lastModuleResult` dan history maksimal 10 result ke `localStorage`.
- Desktop Module Demo untuk menguji logic modul tanpa headset.

## File yang Ditambah / Diubah

- `src/data/practicalScenarios.ts`: definisi skenario dan required steps.
- `src/data/rubrics.ts`: bobot rubric dan passing score.
- `src/assessment/ModuleResult.ts`: kontrak result modul.
- `src/assessment/ScoreManager.ts`: lifecycle hasil dan feedback.
- `src/assessment/RubricEvaluator.ts`: scoring Modul 1 dan Modul 2.
- `src/modules/ModuleStep.ts`: tipe dan helper step.
- `src/modules/BaseModule.ts`: lifecycle step, progress, callback, reset.
- `src/modules/WeighingModule.ts`: step-by-step penimbangan.
- `src/modules/MixingModule.ts`: step-by-step pencampuran.
- `src/ui/ProgressPanel.ts` dan `src/ui/ResultPanel.ts`: panel UI baru.
- `src/utils/storage.ts`: room setup dan result persistence.

## Modul 1 — Penimbangan

Alur modul memakai skenario `weighing_paracetamol_500mg`: letakkan weighing boat, tare, tambah sample, konfirmasi massa, lalu finish. State utama meliputi `hasWeighingBoat`, `hasTared`, `sampleMassGram`, `hasConfirmedMass`, `isFinished`, dan `actionHistory`.

Scoring total 100: weighing boat 15, tare 20, sample 15, akurasi massa 35, finish 15. Akurasi massa diberi poin penuh jika berada di 0.500 g +/- 0.005 g, lalu menurun untuk deviasi 2x dan 5x toleransi.

## Modul 2 — Pencampuran

Alur modul memakai skenario `mixing_simple_powder`: tambah ingredient A, tambah ingredient B, mixing, cek homogenitas, transfer ke wadah akhir, lalu finish. State utama meliputi `hasIngredientA`, `hasIngredientB`, `ingredientOrder`, `homogeneity`, `transferredToContainer`, `isFinished`, dan `actionHistory`.

Scoring total 100: ingredient A 15, ingredient B 15, urutan benar 20, homogenitas 30, transfer 10, finish 10. Modul dianggap lulus jika skor minimal 75.

## Scoring System

`RubricEvaluator` menghitung skor berdasarkan state final modul. `ScoreManager` menyimpan metadata modul, step results, feedback, raw data, waktu mulai, dan waktu selesai sebelum membentuk `ModuleResult`.

## Persistence

`storage.ts` sekarang menyimpan room setup, hasil praktikum terakhir, dan history 10 hasil terakhir. Semua operasi JSON memakai `try/catch` agar data rusak tidak membuat aplikasi crash.

## Cara Menjalankan

```bash
npm install
npm run dev
npm run build
```

## Cara Test Desktop

1. Jalankan `npm run dev`.
2. Buka URL Vite di browser desktop.
3. Klik `Desktop Module Demo`.
4. Pilih Modul 1 atau Modul 2.
5. Jalankan tombol aksi sampai `Finish`.
6. Pastikan result panel muncul dan localStorage berisi hasil.

## Cara Test Meta Quest

1. Deploy atau tunnel aplikasi ke HTTPS.
2. Buka URL di Meta Quest Browser.
3. Klik `Start MR Lab`.
4. Tandai 1-3 meja memakai controller.
5. Klik `Selesai Setup`.
6. Pilih modul dan jalankan aksi pembelajaran.
7. Pastikan result panel muncul setelah finish.

## Batasan Saat Ini

- Model masih placeholder geometris.
- Scoring masih simulatif.
- Massa sample masih random terkontrol.
- Homogenitas masih random terkontrol.
- Belum ada GLB realistis.
- Belum ada hand tracking.
- Belum ada spatial anchor permanen.

## Bug / Risiko

- DOM overlay di WebXR dapat berbeda antar browser dan firmware Quest.
- Random massa/homogenitas membuat hasil test perlu beberapa kali aksi.
- LocalStorage room setup masih berbasis posisi relatif session, bukan anchor permanen.
- Desktop demo memakai meja fallback virtual dan bukan placement nyata.

## Rekomendasi Stage 3

- Tambahkan model GLB alat dan bahan realistis.
- Tambahkan spatial anchors permanen.
- Tambahkan hand tracking untuk mengambil dan menuang bahan.
- Tambahkan rubrik detail berbasis waktu, urutan, dan precision.
- Tambahkan export hasil praktikum.
