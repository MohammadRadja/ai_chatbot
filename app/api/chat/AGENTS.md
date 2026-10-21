# Chat Route Agent Guide

`route.ts` is the public question endpoint.

- Accept only the typed question, optional CUID conversation ID, and optional language hint defined by the Zod schema.
- Keep per-IP rate limiting and delegate all answer behavior to `src/server/chat/service.ts`.
- Preserve the response contract: conversation ID, assistant message, citations, unanswered flag, and quote affordance.
- Never add direct model calls, source URLs, or business rules here.
