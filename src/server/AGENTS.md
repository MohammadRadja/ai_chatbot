# Server Service Agent Guide

Scope: server-only application services under `src/server/`.

- These modules may use Prisma, environment variables, Node APIs, and provider credentials; never import them into Client Components.
- Keep route handlers thin and services responsible for business rules and transactions.
- Preserve safe errors, logging without secrets, bounded inputs, and deterministic behavior where possible.
- Coordinate changes with `../docs/ARCHITECTURE.md` and `../docs/SECURITY.md`.
