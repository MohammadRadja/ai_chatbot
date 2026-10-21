# Components Agent Guide

Scope: interactive React UI under `src/components/`.

- Client Components are appropriate here for chat state, form state, fetch calls, and browser events.
- Keep API contracts typed locally and render assistant content as plain text.
- Preserve source links, loading/error/empty/success states, keyboard access, focus visibility, reduced motion, and responsive layouts.
- Keep data fetching and business rules in route/service layers; components should orchestrate presentation and interaction.
- Follow `../../docs/DESIGN.md` and do not introduce undocumented visual systems.
