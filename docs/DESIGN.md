# Design System

## Product direction

PlacidWay Evidence Desk is an editorial research surface for a high-stakes question. It should feel like a calm source room: warm paper, dark ink, restrained terracotta and teal, visible provenance, and clear boundaries. The chat is the work surface; there is no marketing hero, generic AI dashboard, or decorative visual noise.

## Visual tokens

- `--paper`: warm ivory `#F7F4EE`, the page canvas.
- `--surface`: soft white `#FFFDF9`, the active conversation surface.
- `--surface-muted`: warm gray `#EFEBE3`, subtle utility states.
- `--ink`: deep navy `#17212B`, primary text and high-contrast controls.
- `--ink-soft`: `#273943`, hover state for primary controls.
- `--muted`: slate `#60707A`, secondary text with readable contrast.
- `--line`: warm gray `#D7D1C6`, structural rules and input borders.
- `--terracotta`: `#B85C45`, action and editorial emphasis.
- `--terracotta-strong`: `#994832`, hover emphasis.
- `--teal`: `#2E7D73`, trust, indexed state, and evidence markers.
- `--teal-ink`: `#205B54`, readable text on teal-wash surfaces.
- `--teal-wash`: `#E9F3F0`, quote and evidence feedback surface.

Typography uses a system sans for interface copy and a restrained Georgia/Cambria serif for the primary statement. Monospace is reserved for compact operational labels. Body copy uses generous line height and a readable measure; display type is never used for controls.

## Layout

- A compact header carries the PlacidWay mark, product name, live status, and the mobile source-panel trigger.
- The intro establishes the product promise in two short lines, followed by a factual status rail.
- The main workspace is a bordered two-column composition: conversation on the left, knowledge base on the right.
- The right panel uses rules and grouped rows instead of stacked cards. It collapses into a full-height mobile dialog so source links remain available without squeezing the chat.
- The conversation and composer are one surface with a clear divider. Messages stay readable at narrow widths and never force horizontal scrolling.

## Components

- `src/components/brand-mark.tsx` — shared inline SVG brand mark used by the header.
- `src/components/chat-shell.tsx` — client interaction surface, message thread, source citations, refresh panel, mobile source dialog, and states.
- `src/components/quote-form.tsx` — validated lead capture with success and error feedback.
- `src/components/ui/button.tsx` — solid, outline, and ghost button variants with minimum touch height.
- `src/components/ui/badge.tsx` — compact source-count/status badge.
- `app/icon.svg` and `public/apple-icon.svg` — browser tab and Apple icon assets using the same terracotta/ivory mark.

## Interaction and state rules

- Use Lucide icons with one consistent stroke style; never use emoji or Unicode symbols as interface icons.
- Buttons, links, inputs, and the composer have visible keyboard focus states and at least a 44px touch target where practical.
- Loading states use a small spinner and an accessible status label. Error states name the problem and preserve the current knowledge snapshot.
- Empty knowledge state explains the required MySQL/refresh action. Indexed sources show passage counts and external source links.
- Citation links remain visible below assistant messages and open in a new tab with `rel="noreferrer"`.
- The mobile source panel behaves as a dialog, closes on backdrop, close button, or Escape, and receives initial focus.
- Motion is limited to message reveal and status pulse. `prefers-reduced-motion` removes authored animation without hiding content or feedback.

## Accessibility and responsive behavior

- Use semantic headings, landmarks, labels, `aria-live` for the thread, `role="status"` for loading, and `role="alert"` for errors.
- Keep body and muted text at WCAG AA contrast targets; use teal-ink on teal-wash surfaces rather than muted gray.
- The layout switches to one column below the desktop breakpoint and the source panel moves into a mobile drawer.
- The composer grows vertically instead of overflowing horizontally. Long source titles truncate inside a flexible row.
- Focus order follows header, intro/status, thread, composer, then desktop source controls.

## Guardrails

Avoid gradient backgrounds, glass effects, excessive shadows, nested cards, dashboard metric tiles, decorative grids, and placeholder branding. Every visual element must support reading, asking, checking evidence, or submitting a quote request.
