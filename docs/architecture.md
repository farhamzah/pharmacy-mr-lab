# Architecture — Mixed Reality Pharmacy Lab Stage 1

## Diagram Alur Aplikasi

```text
Home
  -> Start XR
    -> XRSessionManager checks navigator.xr and immersive-ar
    -> Meta Quest Browser starts passthrough AR session
      -> Placement Mode
        -> HitTestManager shows reticle
        -> ControllerManager listens to trigger/select
        -> PlacementManager creates LabTable
        -> LabLayoutManager assigns table roles
        -> storage persists table setup
          -> Table Setup Finished
            -> Module Menu
              -> WeighingModule or MixingModule
                -> Module Simulation
                  -> Result feedback
```

## Komponen

### AppController

Orchestrator utama. Membuat scene Three.js, renderer, camera, UI, XR manager, placement manager, layout manager, factory objek, dan modul aktif.

### XRSessionManager

Mengelola pengecekan `navigator.xr`, dukungan `immersive-ar`, pembuatan session WebXR, reference space, dan status session.

### PlacementManager

Membuat `LabTable` dari pose reticle. Manager ini juga menambahkan marker meja ke scene dan menjaga daftar meja aktif.

### LabLayoutManager

Mengatur role meja berdasarkan jumlah meja:

- 1 meja: `shared-workbench`
- 2 meja: `weighing-station`, `mixing-station`
- 3 meja: `material-station`, `weighing-station`, `mixing-station`

### LabObjectFactory

Factory objek placeholder berbasis geometry Three.js untuk timbangan, mortar, stamper, botol bahan, dan label sprite.

### BaseModule

Kelas dasar untuk modul praktikum. Menyediakan root group, dispose, dan helper placement object ke meja.

### WeighingModule

Placeholder Modul 1. Menampilkan timbangan, massa dummy, tombol `Tare`, `Add Sample`, dan `Finish`.

### MixingModule

Placeholder Modul 2. Menampilkan mortar dan stamper, ingredient dummy, homogenitas, tombol `Add Ingredient A`, `Add Ingredient B`, `Mix`, dan `Finish`.

### UIManager

Mengelola Home UI, overlay XR, instruksi placement, module menu, tombol aksi modul, dan pesan feedback.

### storage

Wrapper `localStorage` untuk menyimpan dan memuat konfigurasi meja. Ini menjadi fallback sampai spatial anchors permanen digunakan.

## Alur Detail

```text
Home -> Start XR -> Placement Mode -> Table Setup -> Module Menu -> Module Simulation -> Result
```

1. User membuka aplikasi dan melihat Home UI.
2. User menekan `Start MR Lab`.
3. Aplikasi mengecek WebXR dan meminta session `immersive-ar`.
4. Setelah session aktif, passthrough ditangani browser/headset.
5. User menandai meja dengan reticle dan trigger controller.
6. Role meja dihitung berdasarkan jumlah meja.
7. Setup disimpan ke `localStorage`.
8. User memilih Modul 1 atau Modul 2.
9. Modul menempatkan placeholder alat pada meja sesuai role.
10. User menjalankan aksi dummy dan menerima feedback hasil.
