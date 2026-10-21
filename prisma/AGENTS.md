# Prisma Agent Guide

Scope: schema, migrations, and seed data.

- Keep MySQL models normalized with explicit foreign keys, constraints, cascade behavior, and indexes.
- Secrets never belong in schema or seed data.
- Update migrations through Prisma workflow; do not edit an applied migration casually.
- Seed only the seven source definitions; seed must not fetch external pages.
- Coordinate schema changes with `../docs/ARCHITECTURE.md` and `../docs/DEVELOPMENT.md`.
