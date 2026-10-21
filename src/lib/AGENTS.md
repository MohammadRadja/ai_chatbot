# Shared Library Agent Guide

Scope: `src/lib/` utilities shared by server and UI code.

- Keep utilities dependency-light and side-effect aware.
- `prisma.ts` owns the singleton client; do not create clients in individual services.
- `rate-limit.ts` is an in-memory baseline guard; document any change toward shared production storage.
- `text.ts` owns normalization/tokenization/excerpt behavior used by ingestion and retrieval.
- `utils.ts` owns UI class composition and safe display formatting; do not place domain policy here.
