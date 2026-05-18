# Report Stage 1 — WebXR MR Pharmacy Lab

## Ringkasan

Stage 1 membangun fondasi aplikasi Mixed Reality Pharmacy Lab Simulator berbasis Vite, TypeScript, Three.js, dan WebXR. Aplikasi memiliki Home UI, mencoba masuk ke mode `immersive-ar`, menampilkan passthrough melalui Meta Quest Browser, menyediakan reticle hit-test untuk menandai meja, menyimpan konfigurasi meja ke `localStorage`, dan menyiapkan placeholder Modul 1 Penimbangan serta Modul 2 Pencampuran.

## Fitur yang Berhasil

- Project Vite + TypeScript + Three.js dibuat.
- UI awal menampilkan judul, tombol Start MR Lab, tombol Reset Room Setup, dan pesan safety.
- WebXR session manager mengecek `navigator.xr` dan dukungan `immersive-ar`.
- Renderer Three.js mengaktifkan `renderer.xr.enabled`.
- Reticle/pointer dibuat untuk placement permukaan.
- Controller Meta Quest menggunakan event `select` untuk menandai meja.
- Pengguna dapat menandai 1 sampai 3 meja.
- Setiap meja disimpan sebagai `LabTable` dengan `id`, `position`, `rotation`, dan `assignedRole`.
- Layout adaptif tersedia untuk 1, 2, dan 3 meja.
- Placeholder objek lab tersedia: timbangan, mortar, stamper, dan botol bahan.
- Modul 1 menampilkan timbangan dan simulasi massa dummy.
- Modul 2 menampilkan mortar/stamper dan simulasi homogenitas dummy.
- Konfigurasi meja disimpan dan dapat dihapus dari `localStorage`.

## Struktur Project

- `src/main.ts`: entry point aplikasi.
- `src/app/AppController.ts`: pengatur lifecycle utama.
- `src/app/XRSessionManager.ts`: abstraksi WebXR session.
- `src/app/StateManager.ts`: state mode aplikasi, meja, dan modul aktif.
- `src/xr/HitTestManager.ts`: reticle dan WebXR hit-test.
- `src/xr/AnchorManager.ts`: abstraction anchor dengan fallback posisi lokal.
- `src/xr/ControllerManager.ts`: setup Quest controller dan trigger select.
- `src/xr/PlacementManager.ts`: membuat dan mengelola meja virtual.
- `src/lab/LabTable.ts`: representasi meja lab.
- `src/lab/LabLayoutManager.ts`: aturan role meja untuk layout 1-3 meja.
- `src/lab/LabObjectFactory.ts`: factory objek placeholder.
- `src/modules/*`: struktur modul simulasi.
- `src/ui/*`: overlay UI dan panel instruksi.
- `src/utils/*`: konstanta dan persistence.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Untuk build production:

```bash
npm run build
```

## Cara Test di Meta Quest

1. Jalankan aplikasi pada URL HTTPS.
2. Buka URL tersebut di Meta Quest Browser.
3. Tekan `Start MR Lab`.
4. Pastikan permission WebXR diberikan.
5. Arahkan controller ke permukaan meja sampai reticle muncul.
6. Tekan trigger untuk menandai meja.
7. Tandai 1, 2, atau 3 meja sesuai skenario ruangan.
8. Tekan `Selesai Setup`.
9. Pilih Modul 1 atau Modul 2 dan uji tombol dummy.

## Keputusan Teknis

- Vite dipilih karena ringan, cepat, dan cocok untuk prototype WebXR bertahap.
- TypeScript dipakai untuk menjaga kontrak antar manager, modul, dan model meja.
- Three.js dipakai sebagai fondasi rendering WebXR yang stabil dan luas ekosistemnya.
- `localStorage` dipakai sebagai fallback persistence karena spatial anchors belum selalu tersedia atau stabil di semua browser/headset.
- Struktur modular dipilih agar Stage 2 dapat menambah asset, scoring, hand tracking, dan data praktikum tanpa menulis ulang lifecycle XR.

## Batasan Saat Ini

- Anchor permanen belum final dan masih fallback ke posisi relatif session.
- Model 3D masih placeholder geometris.
- Interaksi farmasi masih dummy.
- Belum ada asset realistis.
- Belum ada database.
- Belum ada multi-user.
- Belum ada validasi farmasi detail atau scoring rubrik lengkap.

## Bug / Risiko

- Dukungan `immersive-ar`, `hit-test`, `dom-overlay`, dan `anchors` dapat berbeda antar versi Meta Quest Browser.
- Posisi meja dari `localStorage` dapat bergeser antar session karena belum memakai spatial anchors permanen.
- DOM overlay mungkin tidak tampil sama di semua browser WebXR.
- Simulasi massa dan homogenitas masih deterministic dummy, belum mencerminkan proses nyata.

## Rekomendasi Stage 2

- Tambahkan model GLB realistis untuk alat dan bahan.
- Uji spatial anchors yang sebenarnya jika tersedia di target headset.
- Tambahkan hand tracking sebagai opsi interaksi.
- Tambahkan animasi serbuk dan material.
- Tambahkan scoring detail untuk penimbangan dan pencampuran.
- Tambahkan data praktikum dan instruksi berbasis skenario.
- Tambahkan export hasil praktikum.
