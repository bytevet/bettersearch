# BetterSearch

Chrome extension (Manifest V3) — fuzzy full-text search for any web page via a side panel.

## Commands

- `npm run build` — production build to `dist/`
- `npm run dev` — build + watch mode (all bundles rebuild on change)
- `npm test` — run unit/component tests (Vitest)
- `npm run test:watch` — Vitest in watch mode
- `npm run test:e2e` — Playwright end-to-end tests

## Architecture

- **`src/content/`** — content script (IIFE bundle). Runs in the web page context. Handles text extraction, MiniSearch indexing, and highlighting.
- **`src/sidepanel/`** — React app (side panel UI). Entry: `sidepanel.html` + `main.tsx`. Contains hooks (`useSearch`, `useTheme`) and components (`ResultItem`, `StatusBar`).
- **`src/background/`** — service worker. Manages per-tab side panel lifecycle, content script injection, context menu, and unsupported page detection.
- **`src/shared/`** — types, message helpers (`MSG` enum), constants (`isSupportedUrl`), shared between content script and side panel. Communication is via `chrome.runtime.Port` with typed message passing.
- **`src/components/ui/`** — shadcn/ui components (base-nova style)
- **`src/lib/utils.ts`** — `cn()` and `escapeRegex()` helpers
- **`scripts/build.ts`** — build script using Vite programmatic API. Builds side panel (via `vite.config.ts`), then content script + service worker as IIFE bundles inline. Supports `--watch`.

## Rules

- **Do NOT modify generated shadcn/ui components** in `src/components/ui/`. These are generated files — fix issues at the usage site instead.
- **shadcn/ui style**: `base-nova` (configured in `components.json`)

## Key patterns

- Path alias: `@/` maps to `src/`
- Styling: Tailwind v4 with CSS variables for dark mode (`dark` class on `<html>`)
- Side panel is per-tab (not global) — service worker uses `sidePanel.setOptions({ tabId })` + `scripting.executeScript` to inject content script on demand
- Content script sets `window.__bettersearch` flag to prevent double-injection
- Content script responds to `MSG.PING` so the side panel can verify readiness before connecting
- `isSupportedUrl()` in `src/shared/constants.ts` is the single source of truth for page support (http/https only)
- Message protocol defined in `src/shared/types.ts` (`MSG` enum) with typed helpers in `src/shared/messages.ts`

## Testing

- Unit tests: `tests/unit/` — indexer, extractor, highlighter, messages
- Component tests: `tests/component/` — ResultItem (React Testing Library + jsdom)
- E2E: `tests/integration/` (Playwright with Chrome extension loading)
