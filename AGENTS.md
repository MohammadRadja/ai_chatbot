<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Agent Entry Point

This file applies to the repository root and all descendants unless a deeper `AGENTS.md` adds narrower rules.

- Read [`docs/AGENTS.md`](docs/AGENTS.md) before making project changes; it contains product truth, engineering conventions, and documentation rules.
- Read [`README.md`](README.md) for setup and the documentation map.
- Respect the requested scope. For documentation-only tasks, do not modify source code, configuration, migrations, or behavior; for implementation tasks, keep changes limited to the stated product requirements.
- Exclude `node_modules/`, `.next/`, `.impeccable/`, `.git/`, caches, and generated output from documentation audits.
- Preserve the assessment PDF as the primary product requirement source.
