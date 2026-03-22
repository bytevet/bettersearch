# BetterSearch

Instantly search, find, and highlight any text on the current page with fuzzy full-text search.

A Chrome extension that opens a side panel with a powerful search bar — type a query and get ranked results from the page's content, with highlighted matches and one-click navigation.

## Features

- **Fuzzy full-text search** — powered by [MiniSearch](https://lucaong.github.io/minisearch/), with prefix matching and typo tolerance
- **Side panel UI** — stays open alongside the page, doesn't block content
- **Highlighted matches** — click a result to scroll to it and highlight matching terms
- **Dark mode** — system, light, or dark theme with one-click toggle
- **Keyboard shortcut** — `Alt+F` to open/close
- **Right-click menu** — "Search with BetterSearch" on any web page
- **SPA support** — automatically re-indexes when the page content changes
- **Unsupported page detection** — gracefully handles `chrome://`, `about:`, and other restricted pages

## Installation

### From source

```bash
git clone https://github.com/bytevet/bettersearch.git
cd bettersearch
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

### From releases

Download the latest `bettersearch.zip` from [Releases](https://github.com/bytevet/bettersearch/releases), unzip it, and load as an unpacked extension.

## Usage

1. Navigate to any web page
2. Click the BetterSearch icon in the toolbar, press `Alt+F`, or right-click and select **Search with BetterSearch**
3. Type your query — results appear instantly with highlighted snippets
4. Click a result to scroll to the match on the page

## Development

```bash
npm run dev       # Build + watch mode
npm test          # Run unit & component tests
npm run test:e2e  # Run Playwright end-to-end tests
```

### Project structure

```
src/
├── background/     # Service worker (panel lifecycle, context menu)
├── content/        # Content script (extraction, indexing, highlighting)
├── sidepanel/      # React app (UI, hooks, components)
├── shared/         # Types, messages, constants
├── components/ui/  # shadcn/ui components
└── lib/            # Utilities (cn, escapeRegex)
```

## Tech stack

- **TypeScript** + **React 18**
- **Vite** (build tooling)
- **Tailwind CSS v4** + **shadcn/ui** (base-nova)
- **MiniSearch** (full-text search engine)
- **Vitest** + **React Testing Library** (unit/component tests)
- **Playwright** (end-to-end tests)
- **Chrome Extension Manifest V3**

## License

MIT
