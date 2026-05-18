# Stage 2 Test Plan

## Test Desktop

- Jalankan `npm run dev`.
- Buka aplikasi di browser desktop.
- Pastikan Home UI muncul.
- Klik `Desktop Module Demo`.
- Pastikan module menu muncul tanpa headset.

## Test Meta Quest

- Akses aplikasi melalui HTTPS di Meta Quest Browser.
- Klik `Start MR Lab`.
- Tandai 1, 2, dan 3 meja pada percobaan berbeda.
- Pastikan layout role tetap mengikuti aturan Stage 1.
- Pilih modul dan pastikan UI module tetap muncul.

## Test Modul 1

- Pilih Modul 1.
- Klik `Tare / Zero` sebelum weighing boat dan pastikan error muncul.
- Klik `Place Weighing Boat`.
- Klik `Tare / Zero`.
- Tambahkan sample kecil/besar sampai mendekati 0.500 g.
- Klik `Confirm Mass`.
- Klik `Finish`.
- Pastikan result panel memiliki score 0-100 dan passed/failed.

## Test Modul 2

- Pilih Modul 2.
- Klik `Mix 5 Seconds` sebelum ingredient lengkap dan pastikan error muncul.
- Klik `Add Ingredient A`, lalu `Add Ingredient B`.
- Klik `Mix 5 Seconds` sampai homogenitas minimal 90%.
- Klik `Transfer To Container`.
- Klik `Finish`.
- Pastikan result panel memiliki score 0-100 dan passed/failed.

## Test localStorage

- Setelah finish modul, cek `pharmacy-mr-lab.last-result.v1`.
- Pastikan `pharmacy-mr-lab.result-history.v1` berisi maksimal 10 item.
- Klik `Reset Room Setup` dan pastikan room setup terhapus.
- Ubah isi localStorage menjadi JSON rusak, reload, dan pastikan aplikasi tidak crash.

## Test Edge Cases

- Finish Modul 1 sebelum confirm mass.
- Confirm mass sebelum sample ditambahkan.
- Transfer Modul 2 sebelum homogenitas 90%.
- Ingredient B ditambahkan sebelum Ingredient A untuk menguji penalti correct order.
- Pilih Retry Module dari result panel.
- Pilih Back to Module Menu dari result panel.
