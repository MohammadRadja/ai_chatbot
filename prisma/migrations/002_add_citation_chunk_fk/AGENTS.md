# Migration instructions

- This migration adds the nullable `Citation.chunkId` foreign key to `KnowledgeChunk`.
- It is additive and non-destructive; preserve existing citation rows and allow missing chunks to become `NULL` when a chunk is deleted.
- Do not edit an applied migration. Add a new ordered migration for future schema changes and verify it with `npx prisma migrate deploy`.
- Keep the Prisma schema, SQL migration, `prisma/AGENTS.md`, and `docs/ARCHITECTURE.md` consistent.
