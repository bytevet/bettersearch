import { describe, it, expect, vi } from "vitest";
import {
  sendSearch,
  sendHighlight,
  sendProgress,
  sendIndexComplete,
  sendSearchResults,
  sendPageInfo,
} from "@/shared/messages";
import { MSG } from "@/shared/types";

function mockPort() {
  return {
    postMessage: vi.fn(),
    name: "bettersearch",
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    onDisconnect: { addListener: vi.fn(), removeListener: vi.fn() },
    disconnect: vi.fn(),
  } as unknown as chrome.runtime.Port;
}

describe("messages", () => {
  it("sends search message", () => {
    const port = mockPort();
    sendSearch(port, "hello");
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.SEARCH,
      query: "hello",
    });
  });

  it("sends highlight message", () => {
    const port = mockPort();
    sendHighlight(port, "seg-0", ["hello"]);
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.HIGHLIGHT,
      segmentId: "seg-0",
      terms: ["hello"],
    });
  });

  it("sends progress", () => {
    const port = mockPort();
    sendProgress(port, 50);
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.INDEX_PROGRESS,
      progress: 50,
    });
  });

  it("sends index complete", () => {
    const port = mockPort();
    sendIndexComplete(port, 42, 1700000000000);
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.INDEX_COMPLETE,
      segmentCount: 42,
      timestamp: 1700000000000,
    });
  });

  it("sends search results", () => {
    const port = mockPort();
    const results = [
      { id: "r1", score: 1, snippet: "test", segmentId: "seg-0", terms: ["t"] },
    ];
    sendSearchResults(port, results);
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.SEARCH_RESULTS,
      results,
    });
  });

  it("sends page info", () => {
    const port = mockPort();
    sendPageInfo(port, "https://example.com");
    expect(port.postMessage).toHaveBeenCalledWith({
      type: MSG.PAGE_INFO,
      url: "https://example.com",
    });
  });

});
