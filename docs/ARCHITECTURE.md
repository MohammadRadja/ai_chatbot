# Architecture, Traceability, and Delivery Record

This is the canonical technical record for system boundaries, workflows, data design, assessment compliance, verification, implementation status, limitations, and meaningful changes. Product truth and coding-agent rules live in [`AGENTS.md`](AGENTS.md); setup, design, security, and capability details remain in the other focused documents in `docs/`.

## 1. System overview

The application is a single Next.js App Router service with a MySQL 8+ database accessed through Prisma. It has three bounded workflows:

1. Ingestion fetches only the seven assessment URLs, extracts readable text, chunks it, and replaces the active searchable knowledge snapshot.
2. Chat retrieves relevant chunks, classifies safety/scope, optionally asks OpenCode Zen for a grounded answer, and persists the conversation and citations.
3. Quote capture stores an explicit visitor request in MySQL; it does not send email or claim to book an appointment without a configured integration.

The product is a bounded knowledge assistant for patients and prospective medical-travel visitors. An operator can refresh the fixed source set and inspect ingestion state. The differentiator is evidence before fluency: every answer exposes source links or says that the supplied pages do not contain the answer.

## 2. Architecture boundaries

```text
Browser
  ├─ ChatShell / quote form
  └─ Refresh action
       │
Next.js route handlers (Node.js runtime)
  ├─ /api/chat         → chat service → policy + retrieval → provider/fallback
  ├─ /api/ingest       → ingestion service → fetcher → parser → chunker → Prisma
  ├─ /api/quotes       → validation → Prisma Lead
  └─ /api/health       → knowledge status → Prisma
       │
Prisma Client → MySQL 8+
```

### Repository map

- `app/` — App Router page, metadata, global CSS, and route handlers.
- `src/components/` — interactive chat and quote UI plus local reusable primitives.
- `src/config/` — environment schema and the exact seven-source allowlist.
- `src/lib/` — Prisma singleton, rate limiting, text normalization, and UI utilities.
- `src/server/chat/` — safety policy, provider abstraction/fallback, and chat persistence.
- `src/server/ingestion/` — allowlisted fetch, HTML extraction, deterministic chunking, and snapshot refresh.
- `src/server/retrieval/` — bounded lexical retrieval over MySQL chunks.
- `prisma/` — schema, migration, and source seed.

## 3. Data and request flows

### Visitor chat

```text
Visitor enters question
  → client validates non-empty input
  → POST /api/chat with conversationId + question
  → server loads recent history
  → classify medical / booking / out-of-scope / supported
  → retrieve top bounded chunks from MySQL
  → provider receives policy + excerpts + history, or extractive fallback runs
  → persist user message, assistant response, citations, and unanswered flag
  → client renders answer, source links, disclaimer, and quote CTA when relevant
```

### Knowledge refresh

```text
Operator clicks Refresh
  → POST /api/ingest
  → validate optional token + rate limit
  → create IngestionRun
  → for each exact source URL: fetch, parse, normalize, chunk, wait ~1s
  → replace that source's chunks transactionally
  → finalize run with counts/errors
  → return refresh status to UI
```

The fetcher uses a descriptive User-Agent, rejects non-HTTPS or non-`www.placidway.com` URLs, disables redirects, does not follow links, and applies a 20-second timeout. A failed source does not erase its previous working snapshot. A refresh takes about seven seconds for the seven sources.

### Unknown, medical, booking, and comparison questions

```text
Question classified as unsafe, unsupported, or missing comparison evidence
  → do not call the model for medical advice or booking promises
  → return explicit refusal / unknown message
  → suggest a free quote or licensed clinician as appropriate
  → persist unanswered=true for content-gap review
```

The provider prompt treats retrieved content as untrusted reference material rather than instructions. It prohibits unsupported facts, invented prices, medical advice, and appointment guarantees. Price-aware retrieval preserves currencies and qualifiers such as “starting from”. Comparison questions require evidence for the locations mentioned; otherwise the answer refuses to infer a winner.

### Quote capture

```text
Visitor chooses request a quote
  → name/email/message validated with Zod
  → POST /api/quotes
  → Lead persisted with optional conversation link
  → confirmation shown; no email or booking claim
```

## 4. Retrieval and grounding

The implementation uses deterministic lexical retrieval over normalized `KnowledgeChunk` rows. Query terms are normalized and tokenized; chunks are scored using content matches, source/title matches, phrase matches, and intent boosts for prices, inclusions, and treatment duration. The top passages are sent to the provider. If no OpenCode key is configured, the same bounded passages produce a grounded extractive answer. This keeps the assessment system inspectable and avoids an unnecessary vector database.

The sole AI integration is OpenCode Zen at `https://opencode.ai/zen/v1/chat/completions`, using the configured OpenCode model, temperature `0`, and a bounded output size. `OPENCODE_API_KEY` is server-only. For migration compatibility, an existing `OPENAI_API_KEY` environment variable may supply the same existing OpenCode credential, but OpenAI endpoints and models are never called. Provider failures fall back to the grounded extractive response; they never fall back to a fabricated answer.

## 5. Database design

MySQL 8+ is accessed through Prisma. `DATABASE_URL` is required at runtime and migrations.

### Entities

- `IngestionRun` — refresh attempt, status, counts, error summary, and timestamps.
- `KnowledgeSource` — one fixed page, latest fetched text/metadata, and active state.
- `KnowledgeChunk` — normalized searchable passage with source foreign key, stable hash, heading, and token count.
- `Conversation` — visitor session, locale, and timestamps.
- `Message` — user/assistant content, role, unanswered flag, structured metadata, and conversation foreign key.
- `Citation` — assistant-message-to-source/chunk link, label, and URL.
- `Lead` — optional quote request, contact details, message, and optional conversation link.

### Integrity, indexes, and migrations

- Source key and URL are unique; chunk hashes are unique per source; citations are unique per message/source.
- Foreign keys cascade from conversations to messages/citations and from sources to chunks; leads use `SetNull` when a conversation is removed.
- `Citation.chunkId` has a nullable foreign key to `KnowledgeChunk` with `SetNull` deletion behavior, preventing orphaned citation references without deleting existing citations.
- Indexes cover source activity/recency, chunk source/order, conversations, messages by role/unanswered state, citation source, and lead email/recency.
- Secrets are never stored in MySQL.
- `prisma/migrations/001_init/migration.sql` creates the schema.
- `prisma/migrations/002_add_citation_chunk_fk/migration.sql` adds citation-to-chunk integrity without destructive changes.
- `prisma/seed.ts` upserts the seven source definitions without fetching pages.
- Ingestion replaces chunks transactionally after a successful parse; chat writes user message, assistant response, and citations in one transaction; quote capture validates and persists in one operation.

## 6. API contracts

| Endpoint      | Method | Purpose                                     | Validation / behavior                                                                             |
| ------------- | -----: | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/api/chat`   |   POST | Answer a bounded knowledge question         | Zod question/conversation schema, per-IP rate limit, safe 400/429/500 errors, persisted citations |
| `/api/ingest` |   POST | Refresh the seven sources                   | Optional Bearer token, per-IP rate limit, exact allowlist, partial run reporting                  |
| `/api/quotes` |   POST | Persist a quote request                     | Zod name/email/message schema, per-IP rate limit, safe errors                                     |
| `/api/health` |    GET | Return indexed source and latest run status | No secrets returned; safe 503 if MySQL is unavailable                                             |

## 7. Assessment traceability and compliance

| ID  | Requirement                       | Implementation evidence                                                  | Status                      |
| --- | --------------------------------- | ------------------------------------------------------------------------ | --------------------------- |
| R1  | Read content from shared URLs     | `src/config/sources.ts`, `src/server/ingestion/*`, `/api/ingest`         | Implemented                 |
| R2  | Find the right content            | normalized chunks and lexical retrieval in `src/server/retrieval`        | Implemented                 |
| R3  | Grounded answers with source URLs | provider prompt, fallback, citation rows, and UI source links            | Implemented                 |
| R4  | Honest unknown / quote fallback   | policy classifier, comparison evidence gate, unanswered logging          | Implemented                 |
| R5  | Cost currency and context         | price-aware retrieval and source-preserving responses                    | Implemented                 |
| R6  | Simple chat UI                    | responsive App Router `ChatShell`                                        | Implemented                 |
| R7  | Refresh                           | refresh button and `POST /api/ingest`                                    | Implemented                 |
| R8  | Public deployment for seven days  | deployment instructions and health endpoint                              | Pending external hosting    |
| N1  | Answers in user language          | provider prompt preserves requested language when provider is configured | Implemented when configured |
| N2  | Follow-up questions               | recent conversation history is included in retrieval/provider context    | Implemented                 |
| N3  | Medical disclaimer                | one-per-conversation safety disclaimer                                   | Implemented                 |
| N4  | Lead capture                      | `/api/quotes`, `QuoteForm`, and `Lead`                                   | Implemented                 |
| N5  | Log unanswered questions          | `Message.unanswered=true` and stored question                            | Implemented                 |

Acceptance checklist:

- [x] Seven exact source URLs are allowlisted and arbitrary URLs are rejected.
- [x] Ingestion identifies itself and spaces requests at approximately one second.
- [x] Retrieved passages are the only answer evidence.
- [x] Answers expose citations or a transparent inability statement.
- [x] Prices preserve currency and qualifiers.
- [x] Medical advice is refused safely.
- [x] Follow-up context is retained per conversation.
- [x] Refresh and failure states are visible.
- [ ] A public deployment URL is configured and kept online for seven days.

## 8. Vercel deployment contract

- The local workspace is linked to the existing Vercel project `ai_chatbot`; no new project was created.
- `vercel.json` sets the Next.js framework, `npm ci` install command, and `npm run build` command. It deliberately omits a static output directory because Next.js owns its server/function output.
- `OPENCODE_API_KEY`, `OPENCODE_BASE_URL`, `OPENCODE_MODEL`, and `LOG_LEVEL` are synchronized for Development and Production. Values remain encrypted in Vercel and are not printed by the audit.
- Preview variables could not be added because the existing Vercel project has no connected Git repository/branch; the CLI requires a preview branch target. The existing Git remote was not connected automatically because that would change an external repository integration.
- `DATABASE_URL` was not copied to Vercel because the local value targets `localhost`. A remote MySQL URL must be supplied before Preview or Production runtime verification.

## 9. Verification record

Executed locally against MySQL after a successful seven-source refresh:

- Refresh result: `COMPLETED`, 7/7 sources, 89 searchable chunks.
- `npm run typecheck`: passed after the OpenCode, database, UI, and branding changes.
- `npm test`: 4 files, 10 tests passed, including the OpenCode adapter contract, fallback, and endpoint normalization tests.
- `npm run lint`: passed.
- `npm run build`: passed.
- Prisma migration and seed: passed.
- Runtime smoke: `/` returned 200, `/api/health` returned indexed sources, `/api/chat` returned a grounded price answer with citations.
- Database audit: MySQL reported all seven application tables, expected primary/unique/foreign-key indexes, and zero orphaned `Citation.chunkId` values before migration `002`.
- OpenCode compatibility: the configured base URL was corrected from a duplicated `/chat/completions` path, and the official OpenCode Zen endpoint now accepts the request shape/model but returns provider HTTP `402` (`Insufficient account funds`). The application safely uses the grounded fallback in this condition.
- UI audit: the app now uses a tokenized editorial evidence-desk system, explicit focus/loading/error states, mobile source dialog semantics, and consistent browser/Apple icon assets. Automated browser screenshots were unavailable because no local browser automation binary is installed.

Assessment test outcomes:

1. **Cost:** adenocarcinoma package returns an out-patient 3-week program at `$18,995 USD` and an in-patient 3-week program at `$30,000 USD`, with package context and citation.
2. **Comparison:** Turkey vs Mexico returns an explicit inability to compare when both locations lack comparable supplied evidence; it does not infer a cheaper option.
3. **Procedure:** package answer summarizes weekly labs, prescribed imaging, core therapies, two health-focused meals per day, standard medications, and three-month post-discharge follow-up.
4. **Follow-up:** prior context is retained; the answer distinguishes the three-week treatment period and three-month follow-up from any unsupported universal recovery promise.
5. **Booking:** cannot book or confirm an appointment; offers a quote path.
6. **Out of scope:** weather questions are declined because only the supplied PlacidWay pages are in scope.
7. **Medical advice:** refuses safety assessment/diagnosis and recommends a licensed healthcare professional with a one-time disclaimer.
8. **Trick:** does not confirm a claimed `$50` price and only presents supported source figures.

## 10. Implementation status and limitations

### Completed phases

- Assessment analysis: parsed the four-page PDF and recovered all seven hyperlink targets from PDF annotations.
- Architecture/schema: selected a single Next.js service with Prisma/MySQL, deterministic retrieval, configurable provider, and source snapshot model.
- Foundation: configured TypeScript strict mode, Tailwind, Prisma, environment validation, linting, testing, and build scripts.
- Backend: implemented ingestion, parser, chunker, retriever, policy classifier, provider/fallback, chat, quote, and health routes.
- Frontend: implemented the evidence-desk chat UI, knowledge panel, refresh states, citations, and quote capture.
- Verification: passed local quality gates, migration/seed, source refresh, health, and chat smoke tests.
- Handoff: documented setup, test outcomes, limitations, and the external hosting requirement.
- Vercel: linked the local workspace to the existing `ai_chatbot` project and added `vercel.json` so the project uses the Next.js framework and build pipeline. No new Vercel project or production deployment was created.

Known limitations:

- Default retrieval is lexical rather than embedding-based by design so it remains easy to audit.
- Provider quality and multilingual fluency depend on the configured provider.
- In-memory rate limiting should be replaced with shared storage for multi-instance deployment.
- Public seven-day hosting cannot be completed without an external deployment target and credentials.
- The existing Vercel project now has OpenCode runtime variables synchronized for Development and Production, but no remotely reachable `DATABASE_URL`, no production URL, and no Preview branch variables. The local `DATABASE_URL` points to `localhost`, so it was intentionally not copied to Vercel; a remotely reachable production MySQL URL is required before runtime deployment.

## 11. Changelog

### Unreleased

- Added assessment-derived product context and requirement traceability.
- Added architecture, database, design, development, security, flow, planning, and skills documentation.
- Added the initial Next.js/MySQL chatbot implementation.
- Added seven-source ingestion, deterministic retrieval, grounded provider/fallback answers, safety policy, citations, quote capture, and assessment test results.
- Switched the sole AI integration to OpenCode Zen with a server-only key and safe extractive fallback on provider failure.
- Added the non-destructive citation-to-chunk foreign key migration and verified the MySQL schema/indexes.
- Redesigned the evidence-desk UI, centralized visual tokens, improved responsive/accessibility states, and added consistent favicon/Apple icon branding.
- Audited and corrected `.env` OpenCode endpoint/model configuration, added endpoint suffix normalization, linked the existing Vercel project, synchronized encrypted OpenCode variables for Development/Production, and added Next.js Vercel deployment configuration.
