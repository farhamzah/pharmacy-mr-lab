# Mixed Reality Pharmacy Lab Simulator

Project awal WebXR untuk simulasi laboratorium farmasi berbasis mixed reality. Stage 1 fokus pada fondasi: masuk ke `immersive-ar`, passthrough Meta Quest Browser, penandaan meja nyata, layout adaptif 1-3 meja, placeholder objek lab, dan struktur awal modul praktikum.

## Stack

- Vite
- TypeScript
- Three.js
- WebXR API
- CSS biasa untuk overlay UI

## Install

```bash
npm install
```

## Menjalankan Local Dev Server

```bash
npm run dev
```

Vite akan menjalankan server lokal. Untuk testing di Meta Quest, gunakan URL HTTPS atau tunnel HTTPS ke mesin development.

## Deploy ke HTTPS

WebXR `immersive-ar` membutuhkan secure context. Opsi praktis:

- Deploy ke Vercel, Netlify, atau server HTTPS internal.
- Gunakan reverse proxy HTTPS.
- Gunakan tunnel development seperti Cloudflare Tunnel atau ngrok.

Build production:

```bash
npm run build
```

Folder output ada di `dist/`.

## Membuka di Meta Quest Browser

1. Pastikan headset berada di area aman dan ruangan cukup terang.
2. Buka Meta Quest Browser.
3. Akses URL HTTPS aplikasi.
4. Tekan `Start MR Lab`.
5. Izinkan WebXR/immersive AR jika browser meminta permission.
6. Arahkan controller ke permukaan meja, lalu tekan trigger untuk menandai 1-3 meja.
7. Tekan `Selesai Setup`, lalu pilih Modul 1 atau Modul 2.

## Running on Meta Quest 3

Meta Quest Browser WebXR `immersive-ar` requires an HTTPS secure context. Do not use `http://192.168.x.x:5173` for Quest WebXR testing; local LAN HTTP URLs will fail as not secure.

Desktop development can still use:

```bash
npm run dev
```

For Quest testing, deploy the production build to Vercel, Netlify, GitHub Pages, or another trusted HTTPS host.

Quick checklist:

1. Run `npm run check`.
2. Deploy `dist/` to HTTPS.
3. Open the HTTPS URL in Meta Quest Browser.
4. Press `Start MR Lab`.
5. Allow WebXR permission.
6. Test table placement.
7. Test Modul 1 and Modul 2.

See [HTTPS deployment guide](docs/deployment-https.md) and [Quest QA checklist](docs/quest-qa-checklist.md).

## Fitur Stage 1

- Home UI dengan tombol Start MR Lab dan Reset Room Setup.
- Cek `navigator.xr` dan dukungan `immersive-ar`.
- Three.js renderer dengan WebXR enabled.
- Hit-test reticle untuk mencari permukaan meja.
- Placement meja via trigger controller.
- Persistensi konfigurasi meja ke `localStorage`.
- Layout adaptif untuk 1, 2, atau 3 meja.
- Placeholder timbangan analitik, mortar, stamper, dan botol bahan.
- Modul 1 Penimbangan Bahan dengan massa dummy.
- Modul 2 Pencampuran Sediaan dengan ingredient dan homogenitas dummy.
- Dokumentasi Stage 1 di folder `docs`.

## Batasan Stage 1

- Spatial anchor permanen belum final.
- Model 3D masih placeholder geometris.
- Interaksi farmasi masih dummy.
- Belum ada asset realistis, database, scoring detail, atau multi-user.
- Behavior WebXR bergantung pada dukungan Meta Quest Browser dan versi firmware.

## Rencana Berikutnya

Stage 2 dapat fokus pada asset GLB realistis, spatial anchors yang lebih kuat, hand tracking, scoring praktikum, animasi material, data praktikum, dan export hasil.

## Asset Pipeline

Stage 5 menambahkan pipeline asset GLB/GLTF lokal. Aplikasi tetap berjalan tanpa GLB karena semua asset eksternal bersifat optional dan akan fallback ke procedural objects.

Cara menambahkan GLB lokal:

1. Letakkan file di `public/assets/models/...`.
2. Ikuti nama path di `src/assets/AssetManifest.ts`, atau update manifest jika nama file berbeda.
3. Buka Home UI dan aktifkan `Use External 3D Assets`.
4. Jalankan Desktop Module Demo atau WebXR flow.

Struktur folder model:

- `public/assets/models/analytical-scale/`
- `public/assets/models/mortar-pestle/`
- `public/assets/models/containers/`
- `public/assets/models/bottles/`
- `public/assets/models/tools/`

Gunakan asset legal/lokal, polycount rendah, dan texture kecil agar nyaman di Meta Quest Browser.
