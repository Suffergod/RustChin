/* ============================================================
   RustChin: Background Service Worker
   Owns the single source of truth for default state, seeds it on
   install, and relays toggle changes from the popup to content
   scripts running in every open tab.
   ============================================================ */

// The supported sites live here as the single source of truth.
// popup.js mirrors this list; if you add a site, update both.
const SUPPORTED_SITES = [
  "chatgpt.com",
  "claude.ai",
  "gemini.google.com",
  "notebook.google.com",
  "notebooklm.google.com",
  "chat.deepseek.com",
  "copilot.microsoft.com",
  "perplexity.ai",
  "poe.com"
];

const ICONS = {
  on: {
    16: "icons/circleicon16.png",
    48: "icons/circleicon48.png",
    128: "icons/circleicon128.png"
  },
  off: {
    16: "icons/squareicon16.png",
    48: "icons/squareicon48.png",
    128: "icons/squareicon128.png"
  }
};

function defaultState() {
  const sites = {};
  SUPPORTED_SITES.forEach((host) => { sites[host] = true; });
  return { masterEnabled: true, sites, theme: "auto", lang: "auto", font: "vazirmatn", fontSize: 15, lineHeight: 1.8, customFont: "" };
}

function isEnabled(state) {
  return !state || state.masterEnabled !== false;
}

function updateActionIcon(state) {
  chrome.action.setIcon({ path: isEnabled(state) ? ICONS.on : ICONS.off });
}

function syncActionIcon() {
  chrome.storage.local.get("state", (data) => {
    updateActionIcon(data.state || defaultState());
  });
}

// Seed storage on install so first-run state is predictable.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("state", (data) => {
    const state = data.state || defaultState();
    if (!data.state) {
      chrome.storage.local.set({ state }, () => updateActionIcon(state));
      return;
    }
    updateActionIcon(state);
  });
});

// Keyboard shortcut listener (Alt+Shift+X) to toggle input direction in the active tab.
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-input-direction") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "TOGGLE_INPUT_DIRECTION" })
          .catch(() => {});
      }
    });
  }
});

// Relay toggle updates from the popup to every open tab. Tabs without a
// RustChin content script simply reject; we swallow those silently.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "STATE_CHANGED") {
    updateActionIcon(message.state);
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs
          .sendMessage(tab.id, { type: "STATE_CHANGED", state: message.state })
          .catch(() => {}); // silently ignore tabs without our content script
      }
    });
    sendResponse({ ok: true });
  } else if (message.type === "TOGGLE_INPUT_DIRECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "TOGGLE_INPUT_DIRECTION" })
          .catch(() => {});
      }
    });
    sendResponse({ ok: true });
  }
});
