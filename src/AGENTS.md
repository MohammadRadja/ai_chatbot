# Source Agent Guide

Scope: all application modules under `src/`.

- Keep UI, configuration, shared utilities, data access, and server services separated by folder responsibility.
- Type every public boundary and keep TypeScript strict mode passing.
- Prefer pure functions for parsing, chunking, scoring, and policy decisions.
- Keep provider keys and database access server-only; never import server modules into Client Components.
- Use `docs/AGENTS.md` as product truth and `../docs/ARCHITECTURE.md` for system contracts.
