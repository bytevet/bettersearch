import { describe, it, expect, beforeEach } from "vitest";
import {
  buildIndex,
  search,
  clearIndex,
} from "@/content/indexer";
import type { TextSegment } from "@/shared/types";

function makeSegments(texts: string[]): TextSegment[] {
  return texts.map((text, i) => ({
    id: `seg-${i}`,
    text,
    xpath: `/body/p[${i + 1}]`,
  }));
}

describe("indexer", () => {
  beforeEach(() => {
    clearIndex();
  });

  it("builds index and searches", async () => {
    const segments = makeSegments([
      "The quick brown fox jumps over the lazy dog",
      "A fast red car drives on the highway",
      "The brown bear sleeps in the forest",
    ]);
    await buildIndex(segments);

    const results = search("brown");
    expect(results.length).toBeGreaterThan(0);
    const segmentIds = results.map((r) => r.segmentId);
    expect(segmentIds).toContain("seg-0");
  });

  it("returns empty for empty query", async () => {
    await buildIndex(makeSegments(["Hello world"]));
    expect(search("")).toEqual([]);
    expect(search("  ")).toEqual([]);
  });

  it("supports fuzzy search", async () => {
    await buildIndex(makeSegments(["JavaScript programming language"]));
    const results = search("JavaScrpt"); // missing 'i'
    expect(results.length).toBeGreaterThan(0);
  });

  it("supports prefix search", async () => {
    await buildIndex(makeSegments(["programming in TypeScript"]));
    const results = search("prog");
    expect(results.length).toBeGreaterThan(0);
  });

  it("ranks results by relevance", async () => {
    const segments = makeSegments([
      "The cat sat on the mat",
      "cat cat cat cat cat",
      "A dog ran fast",
    ]);
    await buildIndex(segments);

    const results = search("cat");
    expect(results.length).toBeGreaterThanOrEqual(2);
    // Both cat segments should be returned, dog segment should not
    const segmentIds = results.map((r) => r.segmentId);
    expect(segmentIds).toContain("seg-0");
    expect(segmentIds).toContain("seg-1");
    expect(segmentIds).not.toContain("seg-2");
  });

  it("generates snippets with <mark> tags", async () => {
    await buildIndex(makeSegments(["Hello world from the search engine"]));
    const results = search("world");
    expect(results.length).toBe(1);
    expect(results[0].snippet).toContain("<mark>");
    expect(results[0].snippet).toContain("world");
  });

  it("HTML-escapes snippets before marking", async () => {
    await buildIndex(makeSegments(["Use div tags and more divs here"]));
    const results = search("div");
    expect(results.length).toBe(1);
    expect(results[0].snippet).toContain("<mark>div</mark>");
  });

  it("reports progress during indexing", async () => {
    const segments = makeSegments(Array(100).fill("Some text content here"));
    const progressValues: number[] = [];
    await buildIndex(segments, (p) => progressValues.push(p));
    expect(progressValues.length).toBeGreaterThan(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
  });

});
