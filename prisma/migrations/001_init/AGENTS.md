# Initial Migration Agent Guide

Scope: `migration.sql` for the initial MySQL schema.

- This migration creates ingestion, knowledge, conversation, citation, and lead tables.
- Treat it as immutable once applied; future schema changes require a new sibling migration.
- Keep its documented behavior synchronized with `docs/ARCHITECTURE.md`.
