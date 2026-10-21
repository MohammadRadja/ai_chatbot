# App Router Agent Guide

Scope: `app/` pages, layout, global CSS, and API route namespaces.

- Keep `page.tsx` as the route entry and `layout.tsx` as metadata/global-style ownership.
- Use Server Components by default; keep interactive state in `src/components` Client Components.
- Route handlers belong under `app/api/**/route.ts` and must delegate business logic to `src/server` or `src/lib`.
- Preserve the Node.js runtime for Prisma, ingestion, and provider work.
- Keep accessibility, responsive behavior, loading/error states, and no-secret browser bundles intact.
- Read `../docs/DESIGN.md`, `../docs/SECURITY.md`, and `../docs/DEVELOPMENT.md` before changing this area.
