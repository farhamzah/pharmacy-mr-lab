# Stage 4 Test Plan

## Test Build

- Jalankan `npm run build`.
- Pastikan tidak ada TypeScript error.

## Test Storage Migration

- Simpan data lama `pharmacy-mr-lab.tables.v1`.
- Reload app.
- Pastikan data dimigrasikan menjadi `currentRoomSetup`.
- Uji JSON rusak dan pastikan app tidak crash.

## Test Saved Setup Resume

- Jalankan Desktop Module Demo.
- Reload app.
- Pastikan saved setup card muncul.
- Klik Resume Saved Setup.
- Pastikan module menu muncul dan marker meja dibuat ulang.

## Test Recalibrate/Delete Setup

- Klik Recalibrate Room dan pastikan setup lama diabaikan/dihapus.
- Klik Delete Saved Setup dan pastikan card hilang.
- Pastikan result history tidak ikut terhapus.

## Test Module Result

- Jalankan Modul 1 sampai result.
- Jalankan Modul 2 sampai result.
- Pastikan scoring dan result panel tetap bekerja.

## Test JSON Export

- Setelah ada result, klik Export Last Result JSON.
- Pastikan file terunduh di browser desktop.
- Jika belum ada result, pastikan toast info muncul.

## Test CSV Export

- Setelah ada result history, klik Export History CSV.
- Pastikan CSV berisi header dan row result.
- Uji feedback dengan comma/quote/newline jika memungkinkan.

## Test Diagnostics Desktop

- Klik Run Diagnostics.
- Pastikan hasil readable muncul.
- Klik Copy Diagnostics JSON.
- Pastikan tidak crash jika clipboard gagal.

## Test Quest Checklist

- Buka Quest Testing Checklist.
- Pastikan semua item muncul dan mudah dibaca.

## Test Performance Monitor

- Set `DEBUG_PERFORMANCE = true`.
- Jalankan app dan pastikan monitor tidak spam toast.
- Simulasikan beban rendah jika memungkinkan.

## Test Cleanup Switch Module

- Pindah Modul 1 ke Modul 2 berulang.
- Retry module beberapa kali.
- Pastikan tidak ada crash karena disposed texture/material.

## Test Meta Quest Flow

- HTTPS deployment.
- Start MR Lab.
- Placement meja.
- Finish setup.
- Jalankan modul.
- Reload dan resume saved setup.
- Run diagnostics.
- Coba export jika download didukung.
