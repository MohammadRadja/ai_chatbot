# Ingestion Route Agent Guide

`route.ts` starts a knowledge refresh.

- Preserve the optional `INGESTION_TOKEN` Bearer check and per-IP refresh rate limit.
- Delegate fetching, parsing, chunking, transactions, and run accounting to `src/server/ingestion/service.ts`.
- Never accept arbitrary URLs or add URL parameters to this endpoint.
- Return partial failure counts without deleting the previous working snapshot.
