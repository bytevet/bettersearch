export interface TextSegment {
  id: string;
  text: string;
  xpath: string;
  elementRef?: WeakRef<Node>;
}

export interface SearchResult {
  id: string;
  score: number;
  snippet: string;
  segmentId: string;
  terms: string[];
}

export const MSG = {
  INDEX_PAGE: "INDEX_PAGE",
  SEARCH: "SEARCH",
  HIGHLIGHT: "HIGHLIGHT",
  CLEAR_HIGHLIGHTS: "CLEAR_HIGHLIGHTS",
  INDEX_PROGRESS: "INDEX_PROGRESS",
  INDEX_COMPLETE: "INDEX_COMPLETE",
  SEARCH_RESULTS: "SEARCH_RESULTS",
  INDEX_ERROR: "INDEX_ERROR",
  PAGE_INFO: "PAGE_INFO",
  PING: "PING",
} as const;

export interface IndexPageMessage {
  type: typeof MSG.INDEX_PAGE;
}

export interface SearchMessage {
  type: typeof MSG.SEARCH;
  query: string;
}

export interface HighlightMessage {
  type: typeof MSG.HIGHLIGHT;
  segmentId: string;
  terms: string[];
}

export interface ClearHighlightsMessage {
  type: typeof MSG.CLEAR_HIGHLIGHTS;
}

export interface IndexProgressMessage {
  type: typeof MSG.INDEX_PROGRESS;
  progress: number;
}

export interface IndexCompleteMessage {
  type: typeof MSG.INDEX_COMPLETE;
  segmentCount: number;
  timestamp: number;
}

export interface SearchResultsMessage {
  type: typeof MSG.SEARCH_RESULTS;
  results: SearchResult[];
}

export interface IndexErrorMessage {
  type: typeof MSG.INDEX_ERROR;
  error: string;
}

export interface PageInfoMessage {
  type: typeof MSG.PAGE_INFO;
  url: string;
}

export type ContentMessage =
  | IndexPageMessage
  | SearchMessage
  | HighlightMessage
  | ClearHighlightsMessage;

export type SidePanelMessage =
  | IndexProgressMessage
  | IndexCompleteMessage
  | SearchResultsMessage
  | IndexErrorMessage
  | PageInfoMessage;
