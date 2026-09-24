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

// Seed storage on install or upgrade so state always includes newly added sites.
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get("state", (data) => {
    const base = defaultState();
    const state = data.state || base;
    if (!state.sites) state.sites = {};
    SUPPORTED_SITES.forEach((host) => {
      if (state.sites[host] === undefined) {
        state.sites[host] = true;
      }
    });
    chrome.storage.local.set({ state }, () => updateActionIcon(state));
  });

  // Open the setup guide once, on a first install only. The icon starts in
  // Chrome's extensions menu rather than on the toolbar, so a brand new user
  // has no visible sign the extension is there and no reason to believe it is
  // doing anything; the guide is what turns an install into a working install.
  // The reason check matters: onInstalled also fires on every update and on
  // Chrome's own updates, and re-opening a tab under someone who has been
  // using the extension for months is an ambush, not onboarding. The URL has
  // no trailing slash to match what Vercel serves (trailingSlash: false); the
  // slashed form would take a redirect to say the same thing.
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://rust-chin.ir/welcome" });
  }
});

// Where the uninstall survey lives. Set on every service worker start rather
// than stored, because Chrome holds it per profile and drops it on some
// updates; the call is cheap and idempotent. Chrome opens this on its own
// "RustChin has been removed" page, which is the only moment an ex-user will
// ever answer a question about why they left.
chrome.runtime.setUninstallURL("https://rust-chin.ir/goodbye");

// The action icon is session state, not stored state: Chrome discards what

// The action icon is session state, not stored state: Chrome discards what
// setIcon wrote when the browser exits and falls back to action.default_icon,
// which is the square. Nothing put the circle back, so a restart flipped a
// running extension's toolbar icon from circle to square and left it there
// until the user happened to change a setting. syncActionIcon was written for
// exactly this and was never called. Both hooks are here on purpose: onStartup
// covers a profile launch, and the bare call covers a service worker that
// wakes on its own mid-session.
chrome.runtime.onStartup.addListener(syncActionIcon);
syncActionIcon();

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
