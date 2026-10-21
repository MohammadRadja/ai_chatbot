# Security

## Controls

- Zod validates chat, quote, and ingestion route inputs server-side.
- The OpenCode API key and database URL are server-only environment variables. The provider host is restricted to the official `opencode.ai` host by environment validation.
- Ingestion accepts only exact URLs from the source allowlist and validates HTTPS/hostname before fetching, reducing SSRF risk.
- The fetcher does not follow external links, and the HTML parser removes scripts, styles, forms, and navigation noise.
- Requests use a descriptive User-Agent and a one-second delay between source fetches.
- Retrieval content is wrapped as untrusted reference material in the provider prompt. It is never treated as an instruction, and the model is told to ignore prompt-like content in pages.
- Chat and refresh endpoints use in-memory rate limiting and bounded body sizes. A shared limiter is recommended for horizontally scaled production.
- UI renders assistant text as plain text; citation URLs are checked against the allowlist before rendering as links.
- Errors returned to clients are safe summaries; internal details are logged server-side.
- Provider failures are converted to a grounded extractive response rather than exposing upstream errors or fabricating content.

## Medical safety

The chatbot is informational, does not diagnose, does not determine safety for a person, and does not promise appointments or outcomes. Sensitive questions are refused or routed to a qualified clinician. Source content may contain medical claims; those claims remain attributed to the source and are not presented as medical advice.

## Deployment checklist

- Use HTTPS and secure platform secrets.
- Set `INGESTION_TOKEN` in shared environments.
- Restrict database network access to the app.
- Rotate provider/database credentials if exposed.
- Add shared rate limiting and centralized logs before multi-instance scale.

## Agent security rules

- Do not add a source URL, provider key, database credential, fabricated answer, or medical claim to code or documentation without an approved source.
- Do not broaden ingestion to arbitrary user URLs or follow external links from fetched HTML.
- Preserve safe error messages and server-only secrets when refactoring routes.
