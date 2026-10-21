# Migration Directory Agent Guide

Scope: ordered Prisma migration history.

- Migration folders are append-only history for deployed databases.
- Do not rename, delete, or rewrite an applied migration to fix a new requirement; add a new migration instead.
- Verify foreign keys, indexes, enum values, and destructive changes before generating or applying migrations.
