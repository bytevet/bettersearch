import { vi } from "vitest";

// Polyfill scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock chrome.* APIs
const mockPort = {
  name: "bettersearch",
  postMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onDisconnect: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  disconnect: vi.fn(),
};

const chrome = {
  runtime: {
    connect: vi.fn(() => mockPort),
    onConnect: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    lastError: null,
  },
  tabs: {
    connect: vi.fn(() => mockPort),
    query: vi.fn().mockResolvedValue([{ id: 1, windowId: 1 }]),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  sidePanel: {
    open: vi.fn().mockResolvedValue(undefined),
    setOptions: vi.fn(),
    setPanelBehavior: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: true }]),
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

Object.assign(globalThis, { chrome });

export { mockPort };
