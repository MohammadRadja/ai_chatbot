# Development

## Requirements

- Node.js 20+
- MySQL 8+
- npm 10+

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment

See [`../.env.example`](../.env.example). `OPENCODE_API_KEY` is optional for the extractive fallback, while `DATABASE_URL` is required. `OPENCODE_BASE_URL` must remain on the official `opencode.ai` host and defaults to OpenCode Zen; `OPENCODE_MODEL` defaults to a supported OpenCode chat-completions model. An existing `OPENAI_API_KEY` is accepted only as a migration alias for the current OpenCode credential. `INGESTION_TOKEN` can protect refresh in shared deployments. `APP_URL` is used when explicitly set; otherwise Vercel's `VERCEL_URL` is promoted to HTTPS automatically, with localhost used only for local development. Never commit `.env` files or credentials.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Operational refresh

Use the Refresh knowledge action in the right rail or `POST /api/ingest`. It is intentionally bounded to the seven configured URLs and rate-limited. A refresh can take about seven seconds because of the one-request-per-second politeness requirement.

## Deployment

The repository includes [`../vercel.json`](../vercel.json) to force Vercel to use the Next.js framework, `npm ci`, and `npm run build`. The current production URL is [ai-automation-knowledge-chatbot.vercel.app](https://ai-automation-knowledge-chatbot.vercel.app). Provision a remotely reachable MySQL 8+ database before adding `DATABASE_URL` to Vercel; never copy the local `localhost` URL into Preview or Production. Set `OPENCODE_API_KEY`, `OPENCODE_BASE_URL`, `OPENCODE_MODEL`, and any protected `INGESTION_TOKEN` in the appropriate Vercel environments, run Prisma migrations against the production database, and verify `/api/health`. The public URL is deployed, but full runtime verification remains pending production database provisioning.
