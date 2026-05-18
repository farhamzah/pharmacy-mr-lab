# Stage 3 Test Plan

## Test Build

- Jalankan `npm run build`.
- Pastikan tidak ada TypeScript error.
- Catat warning chunk size Vite jika muncul.

## Test Desktop Module Demo

- Buka Home UI.
- Pilih Object Scale 0.8, 1.0, dan 1.2.
- Klik `Desktop Module Demo`.
- Pastikan module menu muncul dan tidak membutuhkan XR session.

## Test Visual Modul 1

- Pilih Modul 1.
- Pastikan analytical scale, display, tare button, glass shield, dan botol Paracetamol muncul.
- Klik `Place Weighing Boat` dan pastikan boat muncul.
- Tambah/kurangi sample dan pastikan powder serta display massa berubah.
- Klik `Confirm Mass` dan pastikan badge status serta animasi success/error muncul.
- Klik `Finish` dan pastikan result panel tetap muncul.

## Test Visual Modul 2

- Pilih Modul 2.
- Pastikan mortar, pestle, botol A/B, dan label homogenitas muncul.
- Tambahkan Ingredient A dan B.
- Klik `Mix 5 Seconds` beberapa kali dan pastikan pestle bergerak serta powder berubah.
- Setelah homogenitas >= 90%, transfer ke container.
- Klik `Finish` dan pastikan result panel muncul.

## Test UI Toast

- Lakukan aksi valid dan invalid.
- Pastikan toast muncul maksimal 3 item.
- Pastikan toast tidak menutupi action buttons.
- Pastikan toast auto dismiss.

## Test Calibration Scale

- Pilih Small, Standard, dan Large di Home.
- Jalankan Desktop Module Demo setelah tiap pilihan.
- Pastikan ukuran object baru berubah.
- Reload browser dan pastikan pilihan tersimpan.

## Test localStorage

- Selesaikan modul.
- Pastikan result tetap disimpan oleh flow Stage 2.
- Reset room setup dan pastikan konfigurasi meja dihapus.

## Test Meta Quest

- Buka via HTTPS di Meta Quest Browser.
- Start MR Lab.
- Placement 1-3 meja.
- Jalankan Modul 1 dan Modul 2.
- Pastikan haptic/audio tidak menyebabkan crash jika tidak tersedia.
