# PlacidWay Knowledge Desk

An assessment-compliant website knowledge chatbot built with Next.js App Router, TypeScript, Prisma, and MySQL. It ingests exactly seven supplied PlacidWay pages, retrieves relevant passages, and answers with source links or an honest refusal.

## Quick start

Requirements: Node.js 20+, MySQL 8+, and npm 10+.

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`, then use **Refresh knowledge** to fetch the seven allowlisted pages. Set `OPENCODE_API_KEY` to enable the OpenCode Zen integration. Without it, the app uses a grounded extractive fallback and never fabricates a response. An existing `OPENAI_API_KEY` variable is accepted only as a migration alias for an existing OpenCode credential; no OpenAI endpoint is used.

## Commands

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Architecture

- `src/server/ingestion` — allowlisted fetcher, HTML cleanup, polite refresh, and chunking.
- `src/server/retrieval` — deterministic lexical retrieval over MySQL chunks.
- `src/server/chat` — safety policy, grounded provider abstraction, fallback, conversation persistence, and citations.
- `app/api` — chat, ingestion, quote, and health route handlers.
- `prisma` — MySQL schema, migration, and source seed.
- `src/components` — responsive evidence-desk chat UI and quote form.
- `vercel.json` — existing-project Vercel framework, install, and build configuration.

## Documentation

Start with [`docs/AGENTS.md`](docs/AGENTS.md) for product truth and agent rules, then [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system behavior, traceability, compliance, verification, planning status, and changelog.

- [`docs/DESIGN.md`](docs/DESIGN.md) — visual system and UI behavior.
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) — setup, environment, scripts, refresh, and deployment.
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat controls, medical safety, and deployment security.
- [`docs/SKILLS.md`](docs/SKILLS.md) — required technical capabilities and conventions.

## Deployment note

The assessment requires a public URL kept online for seven days. A new Vercel project is deployed at [ai-automation-knowledge-chatbot.vercel.app](https://ai-automation-knowledge-chatbot.vercel.app). The production build is ready and the root page returns 200. Runtime database-backed features remain pending a remotely reachable MySQL `DATABASE_URL`; the local database URL intentionally was not copied to Vercel because it targets `localhost`.
