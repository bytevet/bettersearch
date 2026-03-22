import { isSupportedUrl } from "@/shared/constants";

// Disable side panel globally — only enable per-tab when user clicks the action
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
chrome.sidePanel.setOptions({ enabled: false });

// Track tabs where the side panel has been opened
const panelTabs = new Set<number>();

async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!(window as any).__bettersearch,
    });
    if (result) return true;

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    return true;
  } catch {
    // Injection fails on chrome://, about:, etc.
    return false;
  }
}

function openPanel(tabId: number): void {
  panelTabs.add(tabId);
  chrome.sidePanel.setOptions({ tabId, path: "sidepanel.html", enabled: true });
  chrome.sidePanel.open({ tabId });
  ensureContentScript(tabId);
}

// Context menu: right-click to open BetterSearch
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bettersearch-open",
    title: "Search with BetterSearch",
    contexts: ["page"],
    documentUrlPatterns: ["http://*/*", "https://*/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "bettersearch-open") return;
  if (!tab?.id) return;
  openPanel(tab.id);
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  if (tab.url && !isSupportedUrl(tab.url)) return;
  openPanel(tab.id);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "_execute_action" && command !== "toggle-search") return;
  if (!tab?.id) return;
  if (tab.url && !isSupportedUrl(tab.url)) return;
  openPanel(tab.id);
});

// When a tracked tab navigates, check if the new page is scriptable.
// If not (chrome://, about:, etc.), disable the side panel for that tab.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete" || !panelTabs.has(tabId)) return;

  const ok = await ensureContentScript(tabId);
  if (!ok) {
    chrome.sidePanel.setOptions({ tabId, enabled: false });
    panelTabs.delete(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  panelTabs.delete(tabId);
});
