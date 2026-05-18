# Report Stage 6 — Testing, QA, and Stability Pass

## Ringkasan

Stage 6 menambahkan Vitest/jsdom, unit tests untuk logic inti, state-machine tests untuk module flow, export compatibility tests, storage migration tests, asset pipeline tests, bugfix asset status live refresh, dan checklist QA Meta Quest.

## Fitur Baru

- Script `typecheck`, `test`, `test:watch`, dan `check`.
- `vitest.config.ts` dengan environment jsdom.
- Pure builders untuk JSON/CSV export.
- State machine test helpers untuk Modul 1 dan Modul 2.
- AssetLoader status subscription untuk refresh panel tanpa reload.
- `docs/quest-qa-checklist.md`.

## Test Framework

Vitest digunakan untuk unit dan integration-style logic tests. jsdom dipakai untuk localStorage dan browser API lightweight. WebXR tidak diuji dengan headset nyata di automated tests; bagian itu dicakup checklist QA manual.

## Test Coverage

- Scoring: `RubricEvaluator`.
- Storage: RoomSetupRecord, history cap, result history, corrupt JSON, migration legacy setup.
- Export: CSV escaping, JSON builder, CSV header Stage 5, old result compatibility.
- Asset pipeline: registry, missing asset fallback, cache clear, clone, status events.
- Scenarios: metadata, uniqueness, valid target/homogeneity.
- Module logic/state machine: tare/order/transfer/finish validation.

## Bugfix

Asset Status panel sekarang menerima update dari `AssetLoader.subscribe()`. Saat loader berubah dari `Not loaded` ke `Loading`, `Available`, atau `Missing / Fallback`, UI bisa diperbarui tanpa reload Home.

## Quest QA Checklist

Checklist manual Meta Quest dibuat di `docs/quest-qa-checklist.md`, mencakup device/browser, pre-flight, WebXR start, placement, semua skenario Modul 1/2, export, diagnostics, performance, dan tabel issue.

## Local Check Script

`npm run check` menjalankan:

```bash
npm run typecheck && npm run test && npm run build
```

## Hasil Verifikasi

- `npm run typecheck`: berhasil.
- `npm run test`: berhasil, 45 tests passed.
- `npm run build`: berhasil.
- `npm run check`: berhasil.

## Batasan Saat Ini

- Tests tidak menggantikan pengujian headset nyata.
- WebXR masih dimock/stub atau tidak disentuh di automated tests.
- Belum ada GLB realistis.
- Belum ada hand tracking.
- Spatial anchor permanen belum final.

## Bug / Risiko

- Download/export dan clipboard tetap perlu validasi langsung di Meta Quest Browser.
- GLB loading nyata belum diuji dengan file besar.
- State machine tests menguji logic inti, bukan semua detail rendering Three.js.

## Rekomendasi Stage 7

- Tambahkan Playwright desktop smoke tests.
- Tambahkan QA run nyata di Meta Quest Browser.
- Tambahkan sample GLB low-poly legal dan performance budget.
