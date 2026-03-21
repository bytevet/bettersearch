import { useState, useEffect, useRef, useCallback } from "react";
import type { SearchResult } from "@/shared/types";
import { MSG } from "@/shared/types";
import { PORT_NAME, SEARCH_DEBOUNCE_MS } from "@/shared/constants";
import { sendIndexPage, sendSearch, sendHighlight, sendClearHighlights } from "@/shared/messages";

export type IndexStatus = "idle" | "indexing" | "ready" | "error" | "unsupported";

const MAX_CONNECT_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export function useSearch() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [indexStatus, setIndexStatus] = useState<IndexStatus>("idle");
  const [indexProgress, setIndexProgress] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [lastIndexedAt, setLastIndexedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const retryRef = useRef<ReturnType<typeof setTimeout>>();

  const connectToTab = useCallback(async (retriesLeft = MAX_CONNECT_RETRIES) => {
    // Disconnect previous port
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    portRef.current?.disconnect();
    portRef.current = null;

    // Reset state for new tab (only on first attempt)
    if (retriesLeft === MAX_CONNECT_RETRIES) {
      setIndexStatus("indexing");
      setIndexProgress(0);
      setQuery("");
      setResults([]);
      setActiveResultId(null);
      setError(null);
      setPageUrl(null);
      setLastIndexedAt(null);
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    const port = chrome.tabs.connect(tab.id, { name: PORT_NAME });
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      switch (msg.type) {
        case MSG.PAGE_INFO:
          setPageUrl(msg.url);
          break;
        case MSG.INDEX_PROGRESS:
          setIndexStatus("indexing");
          setIndexProgress(msg.progress);
          break;
        case MSG.INDEX_COMPLETE:
          setIndexStatus("ready");
          setIndexProgress(100);
          setLastIndexedAt(msg.timestamp);
          break;
        case MSG.SEARCH_RESULTS:
          setResults(msg.results);
          break;
        case MSG.INDEX_ERROR:
          setIndexStatus("error");
          setError(msg.error);
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      if (portRef.current !== port) return;
      portRef.current = null;

      // Content script may not be loaded yet — retry
      if (retriesLeft > 0) {
        retryRef.current = setTimeout(() => connectToTab(retriesLeft - 1), RETRY_DELAY_MS);
        return;
      }

      setIndexStatus("unsupported");
      setError(null);
    });

    try {
      sendIndexPage(port);
    } catch {
      // Port disconnected synchronously — onDisconnect will handle retry
    }
  }, []);

  useEffect(() => {
    connectToTab();

    // Reconnect when the active tab finishes navigating to a new page
    const handleTabUpdate = async (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
    ) => {
      if (changeInfo.status !== "complete") return;
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id === tabId) {
        connectToTab();
      }
    };

    chrome.tabs.onUpdated.addListener(handleTabUpdate);

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      if (retryRef.current) clearTimeout(retryRef.current);
      portRef.current?.disconnect();
    };
  }, [connectToTab]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!newQuery.trim()) {
      setResults([]);
      setActiveResultId(null);
      if (portRef.current) {
        sendClearHighlights(portRef.current);
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (portRef.current) {
        sendSearch(portRef.current, newQuery);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const highlightResult = useCallback((result: SearchResult) => {
    setActiveResultId(result.id);
    if (portRef.current) {
      sendHighlight(portRef.current, result.segmentId, result.terms);
    }
  }, []);

  const reindex = useCallback(() => {
    setIndexProgress(0);
    setResults([]);
    setError(null);
    setLastIndexedAt(null);
    setIndexStatus("indexing");
    if (portRef.current) {
      sendIndexPage(portRef.current);
    }
  }, []);

  const triggerSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (portRef.current && query.trim()) {
      sendSearch(portRef.current, query);
    }
  }, [query]);

  return {
    indexStatus,
    indexProgress,
    query,
    updateQuery,
    results,
    activeResultId,
    highlightResult,
    error,
    pageUrl,
    lastIndexedAt,
    reindex,
    triggerSearch,
  };
}
