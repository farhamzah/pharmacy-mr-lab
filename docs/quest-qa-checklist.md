# Meta Quest Browser QA Checklist

## Device / Browser

| Item | Value |
| --- | --- |
| Quest model |  |
| Browser version |  |
| OS version |  |
| Lighting condition |  |
| Room size |  |

## Pre-flight

- [ ] Website dibuka via HTTPS.
- [ ] Diagnostics menampilkan Secure Context: OK.
- [ ] Tidak memakai HTTP LAN IP seperti `http://192.168.x.x:5173` untuk WebXR.
- [ ] URL berasal dari Vercel/Netlify/HTTPS host lain.
- [ ] Controller aktif.
- [ ] Area sekitar aman dan kosong.
- [ ] Saved setup state diketahui.
- [ ] Object scale sesuai meja.
- [ ] Clear browser cache jika permission/browser issue muncul.

## WebXR Start

- [ ] Prompt immersive-ar muncul.
- [ ] Passthrough terlihat.
- [ ] Reticle muncul.
- [ ] DOM overlay terbaca.

## Placement

- [ ] 1 meja berhasil.
- [ ] 2 meja berhasil.
- [ ] 3 meja berhasil.
- [ ] Recalibrate Room berhasil.
- [ ] Resume Saved Setup berhasil.

## Modul 1

- [ ] Penimbangan Paracetamol 500 mg.
- [ ] Penimbangan Lactose 1 g.
- [ ] Penimbangan Talcum 250 mg.
- [ ] Scoring tampil.
- [ ] Result tampil.

## Modul 2

- [ ] Pencampuran Serbuk Sederhana.
- [ ] Pencampuran Paracetamol dan Lactose.
- [ ] Pencampuran Pengenceran Serbuk.
- [ ] Scoring tampil.
- [ ] Result tampil.

## Export

- [ ] Export JSON dicoba.
- [ ] Export CSV dicoba.

## Diagnostics

- [ ] Run Diagnostics.
- [ ] Copy Diagnostics JSON.

## Performance

- [ ] UI responsif.
- [ ] FPS warning tidak spam.
- [ ] Tidak ada crash saat ganti modul.

## Issues Found

| Area | Steps | Expected | Actual | Severity | Notes |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
