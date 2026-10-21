# Configuration Agent Guide

Scope: environment validation and the knowledge-source allowlist.

- `env.ts` is the only typed access boundary for runtime configuration.
- `sources.ts` is the hard security boundary for ingestion; preserve exact URLs, HTTPS, and approved host assumptions.
- Never place credentials, secrets, or user-controlled URLs in source configuration.
- Any configuration change requires corresponding updates to `../docs/DEVELOPMENT.md`, `../docs/SECURITY.md`, and `../docs/AGENTS.md`.
