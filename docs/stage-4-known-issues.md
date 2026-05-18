# Stage 4 Known Issues

- Saved setup masih memakai `localStorage-fallback`, bukan spatial anchors permanen.
- Resume setup dapat tidak sejajar dengan meja nyata setelah headset/browser session berubah.
- Diagnostics untuk hit-test, anchors, dan dom-overlay hanya `Unknown` sebelum session.
- Blob download di Meta Quest Browser perlu validasi device langsung.
- Clipboard API untuk diagnostics copy bisa diblokir.
- Performance monitor default off dan belum memiliki UI toggle.
- Cleanup sudah diperbaiki untuk dynamic labels/material, tetapi profiling memory Quest tetap perlu dilakukan.
