import MiniSearch from "minisearch";
import type { TextSegment, SearchResult } from "@/shared/types";
import { BATCH_SIZE, SNIPPET_WINDOW } from "@/shared/constants";
import { escapeRegex } from "@/lib/utils";

const MINISEARCH_OPTIONS = {
  fields: ["text"] as string[],
  storeFields: ["text"] as string[],
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
  },
};

let miniSearch: MiniSearch | null = null;
let indexedSegments: Map<string, TextSegment> = new Map();

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function buildIndex(
  segments: TextSegment[],
  onProgress?: (progress: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  miniSearch = new MiniSearch(MINISEARCH_OPTIONS);
  indexedSegments = new Map();

  for (let i = 0; i < segments.length; i += BATCH_SIZE) {
    if (signal?.aborted) return;
    const batch = segments.slice(i, i + BATCH_SIZE);
    for (const seg of batch) {
      indexedSegments.set(seg.id, seg);
    }
    miniSearch.addAll(batch);
    onProgress?.(Math.min(100, Math.round(((i + batch.length) / segments.length) * 100)));
    // Yield to main thread
    await new Promise((r) => setTimeout(r, 0));
  }
}

export function search(query: string): SearchResult[] {
  if (!miniSearch || !query.trim()) return [];

  const results = miniSearch.search(query);

  return results
    .sort((a, b) => b.score - a.score)
    .map((r) => {
      const segment = indexedSegments.get(r.id);
      const text = segment?.text ?? "";
      return {
        id: `result-${r.id}`,
        score: r.score,
        snippet: generateSnippet(text, r.terms),
        segmentId: String(r.id),
        terms: r.terms,
      };
    });
}

function generateSnippet(text: string, terms: string[]): string {
  const lowerText = text.toLowerCase();
  let bestStart = 0;
  let bestScore = -1;

  // Find the window with the most term coverage
  for (let i = 0; i <= Math.max(0, text.length - SNIPPET_WINDOW); i++) {
    const window = lowerText.slice(i, i + SNIPPET_WINDOW);
    let score = 0;
    for (const term of terms) {
      if (window.includes(term.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }

  let snippet = text.slice(bestStart, bestStart + SNIPPET_WINDOW);
  if (bestStart > 0) snippet = "..." + snippet;
  if (bestStart + SNIPPET_WINDOW < text.length) snippet = snippet + "...";

  // Escape HTML first, then wrap terms in <mark>
  const escaped = escapeHtml(snippet);
  let marked = escaped;
  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
    marked = marked.replace(regex, "<mark>$1</mark>");
  }

  return marked;
}

export function getSegment(id: string): TextSegment | undefined {
  return indexedSegments.get(id);
}

export function clearIndex(): void {
  miniSearch = null;
  indexedSegments.clear();
}
