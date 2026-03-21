import { extractSegments } from "./extractor";
import { buildIndex, search, clearIndex, getSegment } from "./indexer";
import { highlightSegment, clearHighlights } from "./highlighter";
import { MSG, type TextSegment } from "@/shared/types";
import { sendProgress, sendIndexComplete, sendSearchResults, sendIndexError, sendPageInfo } from "@/shared/messages";
import { PORT_NAME, MUTATION_DEBOUNCE_MS } from "@/shared/constants";

// Flag for service worker to detect if already injected
(window as any).__bettersearch = true;

let currentSegments: TextSegment[] = [];
let isIndexing = false;
let abortController: AbortController | null = null;
let currentPort: chrome.runtime.Port | null = null;
let suppressMutations = false;

function withSuppressedMutations(fn: () => void): void {
  suppressMutations = true;
  fn();
  Promise.resolve().then(() => { suppressMutations = false; });
}

function abortCurrentIndex(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  isIndexing = false;
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME) return;

  // Abort any in-progress indexing from a previous connection
  abortCurrentIndex();
  currentPort = port;

  // Send page URL immediately — side panel can't read tab.url without "tabs" permission
  try { sendPageInfo(port, location.href); } catch {}

  port.onDisconnect.addListener(() => {
    if (currentPort === port) currentPort = null;
    abortCurrentIndex();
  });

  port.onMessage.addListener(async (msg) => {
    switch (msg.type) {
      case MSG.INDEX_PAGE:
        await handleIndex(port);
        break;
      case MSG.SEARCH:
        handleSearch(port, msg.query);
        break;
      case MSG.HIGHLIGHT:
        handleHighlight(msg.segmentId, msg.terms);
        break;
      case MSG.CLEAR_HIGHLIGHTS:
        withSuppressedMutations(clearHighlights);
        break;
    }
  });
});

async function handleIndex(port: chrome.runtime.Port): Promise<void> {
  if (isIndexing) return;
  isIndexing = true;
  abortController = new AbortController();
  const { signal } = abortController;

  try {
    sendProgress(port, 0);
    currentSegments = extractSegments();

    await buildIndex(currentSegments, (progress) => {
      if (!signal.aborted) {
        try { sendProgress(port, progress); } catch {}
      }
    }, signal);

    if (signal.aborted) return;
    sendIndexComplete(port, currentSegments.length, Date.now());
  } catch (err) {
    if (signal.aborted) return;
    try {
      sendIndexError(port, err instanceof Error ? err.message : "Indexing failed");
    } catch {}
  } finally {
    isIndexing = false;
    abortController = null;
  }
}

function handleSearch(port: chrome.runtime.Port, query: string): void {
  const results = search(query);
  sendSearchResults(port, results);
}

function handleHighlight(segmentId: string, terms: string[]): void {
  const segment = getSegment(segmentId);
  if (!segment) return;
  withSuppressedMutations(() => highlightSegment(segment.xpath, terms, segment.elementRef));
}

// SPA support: auto re-index on significant DOM changes
let mutationTimer: ReturnType<typeof setTimeout> | null = null;

const observer = new MutationObserver(() => {
  if (suppressMutations) return;
  if (mutationTimer) clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    abortCurrentIndex();
    clearIndex();
    currentSegments = [];

    if (currentPort) {
      handleIndex(currentPort);
    }
  }, MUTATION_DEBOUNCE_MS);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

