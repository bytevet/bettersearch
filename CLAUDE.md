# BetterSearch

Chrome extension (Manifest V3) that provides full-text search for any web page via a side panel.

## Commands

- `npm run build` — production build to `dist/` (side panel + content script + service worker)
- `npm run dev` — build in watch mode
- `npm test` — run unit/component tests (vitest)
- `npm run test:watch` — vitest in watch mode
- `npm run test:e2e` — Playwright end-to-end tests

## Architecture

- **`src/content/`** — content script (IIFE bundle via `vite.content.config.ts`). Runs in the web page context. Handles text extraction, indexing (MiniSearch), highlighting, and caching (IndexedDB).
- **`src/sidepanel/`** — React app (side panel UI). Entry: `sidepanel.html` + `main.tsx`. Contains hooks (`useSearch`, `useTheme`) and components.
- **`src/background/`** — service worker. Manages per-tab side panel lifecycle and programmatic content script injection.
- **`src/shared/`** — types, message helpers, and constants shared between content script and side panel. Communication is via `chrome.runtime.Port` with typed message passing.
- **`src/components/ui/`** — shadcn/ui components (Button, Input, Badge, etc.)
- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge)

## Rules

- **Do NOT modify generated shadcn/ui components** in `src/components/ui/`. These are generated files — fix issues at the usage site instead.

## Key patterns

- Path alias: `@/` maps to `src/`
- Styling: Tailwind v4 with CSS variables for dark mode (`dark` class on `<html>`)
- Side panel is per-tab (not global) — service worker uses `sidePanel.setOptions({ tabId })` + `scripting.executeScript` to inject content script on demand
- Content script sets `window.__bettersearch` flag to prevent double-injection
- Message protocol defined in `src/shared/types.ts` (`MSG` enum) with typed helpers in `src/shared/messages.ts`

## Testing

- Unit tests: `tests/unit/` — indexer, extractor, highlighter, cache, messages
- Component tests: `tests/component/` — SearchBar, ResultsList (React Testing Library + jsdom)
- E2E: `tests/` (Playwright)
- Test environment uses `fake-indexeddb` for cache tests
