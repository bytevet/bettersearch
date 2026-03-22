export const BATCH_SIZE = 50;
export const SEARCH_DEBOUNCE_MS = 150;
export const MUTATION_DEBOUNCE_MS = 2000;
export const SNIPPET_WINDOW = 120;
export const MIN_SEGMENT_LENGTH = 3;
export const PORT_NAME = "bettersearch";

export function isSupportedUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}
