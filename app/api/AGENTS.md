# API Route Agent Guide

Scope: all route handlers below `app/api/`.

- Validate JSON bodies and route inputs with Zod before calling services.
- Keep handlers thin: rate limiting, auth/token checks, validation, delegation, and safe `NextResponse` mapping only.
- Do not place retrieval, ingestion, provider prompts, or Prisma workflows directly in a handler.
- Return safe client errors; log internal details server-side without secrets or raw credentials.
- Preserve `runtime = "nodejs"` where Prisma or Node APIs are used.
- Maintain no-store behavior for status/chat responses and never expose environment secrets.
