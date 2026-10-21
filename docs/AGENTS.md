# Agent Instructions and Product Context

This is the canonical product and AI coding-agent guide. The assessment PDF remains the primary requirements source; this file captures the durable product decisions derived from it. Architecture, security, development, design, and capability details live in the focused files in this folder.

## Product identity

- Platform: web.
- Product: PlacidWay Knowledge Desk, an assessment submission rather than an official PlacidWay product.
- Primary users: patients and prospective medical-travel visitors asking about the seven supplied PlacidWay pages.
- Secondary user: an operator who refreshes the knowledge base and inspects ingestion state.
- Purpose: answer only from supplied PlacidWay content, cite the page(s) used, and route unknown or medically sensitive questions toward a free quote or qualified healthcare professional.
- Positioning: bounded knowledge. Retrieval is limited to the fixed assessment source set, and every answer includes evidence or explicitly says it is unavailable.

## Operating context

Visitors use a simple public chat interface. The operator can refresh the seven fixed URLs. Refreshing fetches them politely at roughly one request per second, extracts readable text, chunks it, and transactionally replaces the searchable snapshot. Conversations and unanswered questions are logged for review.

## Stack and constraints

- Next.js App Router with React and TypeScript strict mode.
- Tailwind CSS, Lucide React, and local reusable UI primitives following shadcn/ui conventions.
- Prisma ORM with MySQL 8+.
- OpenCode Zen is the only AI integration; no provider key is exposed to the browser.
- Node.js route-handler runtime, Zod validation, Prisma transactions, and safe structured errors.
- Deterministic lexical retrieval is intentional; do not add a vector database or microservice without a documented requirement.
- If no OpenCode key is configured, or OpenCode fails, use the grounded extractive fallback; never replace it with a fabricated mock answer.
- Public deployment for seven days is an external operational handoff and depends on a remotely reachable production database plus the existing repository/branch connection.

## Product rules

- The source scope is exactly the seven URLs in `src/config/sources.ts`. Ingestion must not follow links beyond them.
- Answers must be grounded in retrieved source text, include source links, and preserve price currency and context.
- Unknown, out-of-scope, incorrect-premise, appointment-booking, and medical-advice questions must not be answered speculatively.
- Follow-up questions may use recent conversation history only while remaining within the bounded knowledge base.
- A short medical disclaimer may appear when relevant, but must not repeat on every answer.
- Quote capture is optional product scope and persists an explicit request to MySQL; it does not claim to send email or book appointments.
- Do not fabricate PlacidWay branding, testimonials, guarantees, clinical claims, availability, or any other claim not supported by the supplied content.

## Evidence and source of truth

- Primary requirements: `AI Automation Assessment Website Knowledge Chatbot.pdf`.
- The seven linked URLs are allowlisted in `src/config/sources.ts`.
- The assessment defines eight test-question patterns, evaluation weights, and submission deliverables.
- No supplied logo, brand kit, or original application code should be assumed. Runtime credentials may exist in local or Vercel environment configuration, but they must never be committed or exposed.

## Engineering conventions

- Server Components by default; Client Components only where state, browser APIs, or event handlers are required.
- Keep UI, route handlers, application services, retrieval/provider adapters, data access, validation, configuration, and utilities separated.
- Prefer small pure services and typed boundaries; do not place complex business logic in React components or route handlers.
- Validate all external input with Zod at route boundaries and return safe errors without internal details.
- Keep credentials server-only and use exact allowlists for external content.
- Use Prisma transactions for source snapshot replacement, chat persistence, citations, and quote capture.
- Use semantic HTML, keyboard-accessible controls, visible focus, readable contrast, reduced motion, and responsive layouts.
- Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` before handoff.

## Documentation rules

- `README.md` is the entry point for installation, commands, and documentation navigation.
- `docs/ARCHITECTURE.md` owns system architecture, flows, data model summary, traceability, compliance, verification, planning status, known limitations, and changelog.
- `docs/DESIGN.md`, `docs/DEVELOPMENT.md`, `docs/SECURITY.md`, and `docs/SKILLS.md` own their focused topics.
- Update the relevant focused document whenever behavior, architecture, schema, security, design, configuration, or operations change.
- Keep links relative to their current location. Do not resurrect deleted legacy documentation files.
- Record assumptions and limitations explicitly rather than hiding uncertainty.

## Accessibility and inclusion

Use semantic markup, visible focus states, readable contrast, reduced-motion support, responsive layouts, and explicit loading/empty/error/success states. Spanish and Arabic are examples of supported user-language questions when the configured provider can answer them; the English source set remains unchanged.
