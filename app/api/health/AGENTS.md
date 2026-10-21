# Health Route Agent Guide

`route.ts` reports indexed knowledge status.

- Return source counts, chunk counts, and latest ingestion status only; never return credentials or raw database errors.
- Delegate status reads to `src/server/ingestion/service.ts`.
- Keep the endpoint safe for deployment probes and return a safe 503 when MySQL is unavailable.
