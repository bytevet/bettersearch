import type { SearchResult } from "./types";
import { MSG } from "./types";

export function sendIndexPage(port: chrome.runtime.Port): void {
  port.postMessage({ type: MSG.INDEX_PAGE });
}

export function sendSearch(port: chrome.runtime.Port, query: string): void {
  port.postMessage({ type: MSG.SEARCH, query });
}

export function sendHighlight(
  port: chrome.runtime.Port,
  segmentId: string,
  terms: string[],
): void {
  port.postMessage({ type: MSG.HIGHLIGHT, segmentId, terms });
}

export function sendClearHighlights(port: chrome.runtime.Port): void {
  port.postMessage({ type: MSG.CLEAR_HIGHLIGHTS });
}

export function sendProgress(port: chrome.runtime.Port, progress: number): void {
  port.postMessage({ type: MSG.INDEX_PROGRESS, progress });
}

export function sendIndexComplete(
  port: chrome.runtime.Port,
  segmentCount: number,
  timestamp: number,
): void {
  port.postMessage({ type: MSG.INDEX_COMPLETE, segmentCount, timestamp });
}

export function sendSearchResults(
  port: chrome.runtime.Port,
  results: SearchResult[],
): void {
  port.postMessage({ type: MSG.SEARCH_RESULTS, results });
}

export function sendIndexError(
  port: chrome.runtime.Port,
  error: string,
): void {
  port.postMessage({ type: MSG.INDEX_ERROR, error });
}

export function sendPageInfo(port: chrome.runtime.Port, url: string): void {
  port.postMessage({ type: MSG.PAGE_INFO, url });
}

