/* ============================================================
   RustChin — Popup logic
   • Mirrors background.js SUPPORTED_SITES (update both together).
   • Reads/writes state to chrome.storage.local.
   • Pings the active tab to detect which site the user is on, so
     that row can glow (no extra permissions needed for this).
   • Bilingual UI: detects Persian locale → switches strings.
   ============================================================ */

// Single source of truth for the popup's view of supported sites.
// Keep in sync with background.js SUPPORTED_SITES.
const SITES = [
  { host: "chatgpt.com",          name: "ChatGPT",    nameFa: "چت جی‌پی‌تی", color: "#10A37F", logo: "icons/chatgpt.svg",    siteId: "chatgpt" },
  { host: "claude.ai",            name: "Claude",     nameFa: "کلاود",      color: "#D97757", logo: "icons/claude.svg",     siteId: "claude" },
  { host: "gemini.google.com",    name: "Gemini",     nameFa: "جمنای",      color: "#4285F4", logo: "icons/gemini.svg",     siteId: "gemini" },
  { host: "notebooklm.google.com", name: "NotebookLM", nameFa: "نوت‌بوک اِل اِم", color: "#b7b9bb", logo: "icons/notebooklm.svg", siteId: "notebooklm" },
  { host: "chat.deepseek.com",    name: "DeepSeek",   nameFa: "دیپ سیک",    color: "#4D6BFE", logo: "icons/deepseek.svg",   siteId: "deepseek" },
];

// Single source of truth for the displayed version is manifest.json.
// Avoids the popup drifting out of sync with the package version.
const VERSION = chrome.runtime.getManifest().version || "0.0";

// Bilingual strings. RTL the whole popup when Persian is active.
const I18N = {
  en: {
    name: "RustChin", subtitle: "RTL & Vazirmatn for AI chat",
    enable: "Enabled",
    labelOn: "On",
    labelOff: "Off",
    activeN: (n, t) => `${n}/${t} sites enabled`,
    disabled: "Paused",
    supported: "Supported sites",
    enableMasterFirst: "Enable RustChin to manage individual sites",
    zeroData: "Zero data collected",
    rate: "Rate", report: "Report",
    reloadHint: "Reload this tab to activate RustChin on it.",
    pausedOnSite: "Paused here",
    dir: "ltr",
  },
  fa: {
    name: "RustChin", subtitle: "راست‌چین و فونت وزیرمتن برای هوش مصنوعی",
    enable: "فعال",
    labelOn: "روشن",
    labelOff: "خاموش",
    activeN: (n, t) => `${n}/${t} سایت فعال`,
    disabled: "متوقف",
    supported: "سایت‌های پشتیبانی‌شده",
    enableMasterFirst: "برای مدیریت سایت‌ها، راست‌چین را فعال کنید",
    zeroData: "هیچ داده‌ای جمع‌آوری نمی‌شود",
    rate: "امتیاز", report: "گزارش",
    reloadHint: "برای فعال‌سازی راست‌چین، این زبانه را بازخوانی کنید.",
    pausedOnSite: "متوقف در این سایت",
    dir: "rtl",
  },
};

// lang/t are resolved once state loads (they depend on the saved
// preference, falling back to the browser locale when it's "auto").
let lang = "en";
let t = I18N.en;

function resolveLang(pref) {
  if (pref === "en" || pref === "fa") return pref;
  return (navigator.language || "en").toLowerCase().startsWith("fa") ? "fa" : "en";
}

// Chrome Web Store link (fill in the real listing ID after publishing).
const STORE_URL = "https://chromewebstore.google.com/detail/RustChin";
const DONATE_URL = "https://reymit.ir/suffergod";
const REPORT_URL = "https://github.com/suffergod/RustChin/issues";

/* ---------- i18n ---------- */

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    // The master label mirrors the live master toggle state (Enabled/Paused),
    // set by updateStatus(). Letting i18n blindly write t.enable here would
    // freeze it on "Enabled" until the next toggle. Let updateStatus re-sync
    // it from the current state instead.
    if (key === "enable" && el === masterLabel) return;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  // Re-sync the master label in the new language from the current state.
  if (masterLabel && currentState) updateStatus(currentState);
}

/* ---------- State ---------- */

function defaultState() {
  const sites = {};
  SITES.forEach((s) => { sites[s.host] = true; });
  return { masterEnabled: true, sites, theme: "auto", lang: "auto" };
}

// Single in-memory copy of the saved state. Every save reads from here and
// writes back here, so an update to one field (e.g. a site toggle) never
// clobbers another (e.g. the theme/language pick) that isn't part of the
// UI currently being edited.
let currentState = defaultState();

function getStateFromUI() {
  const state = {
    masterEnabled: masterToggle.checked,
    sites: {},
    theme: currentState.theme || "auto",
    lang: currentState.lang || "auto",
  };
  sitesList.querySelectorAll("input[data-host]").forEach((cb) => {
    state.sites[cb.dataset.host] = cb.checked;
  });
  return state;
}

function scheduleActiveDetect() {
  detectActiveTab();
  // The background relay to content scripts is async; re-ping once after
  // the page script has had time to start/stop so stale paused/live UI clears.
  setTimeout(detectActiveTab, 180);
}

function saveState(state, options = {}) {
  currentState = state;
  chrome.storage.local.set({ state }, () => {
    // Broadcast so content scripts in open tabs update live.
    chrome.runtime.sendMessage({ type: "STATE_CHANGED", state });
    if (options.render === false) {
      updateStatus(state);
      scheduleActiveDetect();
      return;
    }
    render(state);
    setTimeout(detectActiveTab, 180);
  });
}

/* ---------- Rendering ---------- */

const masterToggle = document.getElementById("masterToggle");
const masterStatus = document.getElementById("masterStatus");
const masterLabel = document.getElementById("masterLabel");
const sitesList = document.getElementById("sitesList");
const reloadHint = document.getElementById("reloadHint");
const brandLogo = document.getElementById("brandLogo");

function buildSites(state) {
  sitesList.innerHTML = "";

  if (!state.masterEnabled) {
    sitesList.innerHTML = `<div class="disabled-msg">${t.enableMasterFirst}</div>`;
    return;
  }

  SITES.forEach((site) => {
    const enabled = state.sites[site.host] !== false;
    const row = document.createElement("div");
    row.className = "site-row" + (enabled ? "" : " dim");
    row.dataset.host = site.host;
    row.dataset.siteId = site.siteId;
    row.style.setProperty("--site-color", site.color);

    row.innerHTML = `
      <div class="site-info">
        <img class="site-icon" src="${site.logo}" alt="${site.name}">
        <div class="site-text">
          <div class="site-name">${lang === "fa" && site.nameFa ? site.nameFa : site.name}</div>
          <a class="site-domain" href="https://${site.host}/" target="_blank" rel="noopener noreferrer" dir="ltr">${site.host}</a>
        </div>
      </div>
      <div class="site-right">
        <span class="paused-tag" style="display:none">${t.pausedOnSite}</span>
        <span class="live-dot" style="display:none"></span>
        <label class="toggle">
          <input type="checkbox" data-host="${site.host}" ${enabled ? "checked" : ""} aria-label="${site.name}">
          <span class="slider"></span>
        </label>
      </div>
    `;

    row.querySelector('input[data-host]').addEventListener("change", () => {
      const nextState = getStateFromUI();
      clearActive();
      row.classList.toggle("dim", nextState.sites[site.host] === false);
      saveState(nextState, { render: false });
    });

    sitesList.appendChild(row);
  });
}

function updateStatus(state) {
  if (!state.masterEnabled) {
    masterStatus.textContent = t.disabled;
    masterStatus.className = "master-status off";
    masterStatus.style.setProperty("--enabled-ratio", "0%");
    // The master label shows a short state pill (On/Off). The status bar
    // below carries the detail (5/5 sites enabled / Paused). Setting the
    // label from t.labelOn/labelOff keeps it localized.
    if (masterLabel) masterLabel.textContent = t.labelOff;
  } else {
    const n = SITES.filter((site) => state.sites[site.host] !== false).length;
    masterStatus.textContent = t.activeN(n, SITES.length);
    masterStatus.className = "master-status on";
    masterStatus.style.setProperty("--enabled-ratio", `${(n / SITES.length) * 100}%`);
    if (masterLabel) masterLabel.textContent = t.labelOn;
  }
}

function render(state) {
  masterToggle.checked = state.masterEnabled;
  buildSites(state);
  updateStatus(state);
  renderPrefs(state);
  // Re-detect active tab after re-render so the glow persists.
  detectActiveTab();
}

/* ---------- Theme + language ---------- */

const themeSeg = document.getElementById("themeSeg");
const langSeg = document.getElementById("langSeg");
const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function effectiveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return systemDarkQuery.matches ? "dark" : "light";
}

function updateBrandLogo(theme) {
  if (!brandLogo) return;
  // Use the darker logo on light backgrounds and the lighter logo on dark backgrounds.
  brandLogo.src = effectiveTheme(theme) === "dark"
    ? "icons/LightCircleLogo.svg"
    : "icons/DarkCircleLogo.svg";
}

function applyTheme(theme) {
  // "auto" (or anything unrecognized) clears the attribute so the
  // prefers-color-scheme media query in popup.css takes back over.
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateBrandLogo(theme);
}

function renderPrefs(state) {
  const theme = state.theme || "auto";
  themeSeg.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === theme);
  });
  const langPref = state.lang || "auto";
  langSeg.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === langPref);
  });
}

function setupSeg(segEl, onPick) {
  segEl.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => onPick(btn.dataset.value));
  });
}

systemDarkQuery.addEventListener("change", () => {
  if ((currentState.theme || "auto") === "auto") updateBrandLogo("auto");
});

setupSeg(themeSeg, (value) => {
  applyTheme(value);
  currentState.theme = value;
  saveState(currentState);
});

setupSeg(langSeg, (value) => {
  currentState.lang = value;
  lang = resolveLang(value);
  t = I18N[lang];
  applyI18n();
  saveState(currentState);
});

/* ---------- Active-site detection (permission-free ping) ---------- */

/**
 * Pings the active tab. If a RustChin content script answers, we know:
 *   - which site the user is on (siteId), and
 *   - whether the engine is currently running there (active).
 * Used to glow the matching row. Uses NO extra permissions: querying the
 * active tab for its id needs none, and sendMessage to it is allowed.
 */
function detectActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "RC_PING" }, (resp) => {
      if (chrome.runtime.lastError || !resp) {
        // No content script answered — either not a supported site, or a
        // pre-install/pre-update tab. Clear any glow.
        clearActive();
        return;
      }
      highlightRow(resp.siteId, resp.active);
    });
  });
}

function clearActive() {
  sitesList.querySelectorAll(".site-row").forEach((r) => {
    r.classList.remove("active", "paused");
    const dot = r.querySelector(".live-dot");
    const tag = r.querySelector(".paused-tag");
    if (dot) dot.style.display = "none";
    if (tag) tag.style.display = "none";
  });
  reloadHint.classList.remove("show");
}

function highlightRow(siteId, engineActive) {
  clearActive();
  const row = sitesList.querySelector(`.site-row[data-site-id="${siteId}"]`);
  if (!row) return;
  const cb = row.querySelector('input[data-host]');
  const siteOn = cb && cb.checked;
  const masterOn = masterToggle.checked;

  if (engineActive) {
    row.classList.add("active");
    const dot = row.querySelector(".live-dot");
    if (dot) dot.style.display = "inline-block";
  } else if (masterOn && siteOn) {
    // Supported site, enabled, but engine reports inactive → likely a
    // pre-install tab. Show the reload hint.
    row.classList.add("paused");
    const tag = row.querySelector(".paused-tag");
    if (tag) tag.style.display = "inline-block";
    reloadHint.classList.add("show");
    return;
  }
  reloadHint.classList.remove("show");
}

/* ---------- Master toggle ---------- */

masterToggle.addEventListener("change", () => {
  saveState(getStateFromUI());
});

/* ---------- Footer links ---------- */

// Report (GitHub issues) is always safe to ship.
// Rate link: until the Chrome Web Store listing ID exists, the URL is
// unknown, so we hide the Rate button for the initial release. After
// publishing, set STORE_URL to the real listing URL and remove the
// STORE_URL_KNOWN guard below to re-enable the Rate button in a follow-up.
const STORE_URL_KNOWN = false;

const rateLink = document.getElementById("rateLink");
const donateLink = document.getElementById("donateLink");
const reportLink = document.getElementById("reportLink");

if (rateLink) {
  if (STORE_URL_KNOWN) {
    rateLink.href = STORE_URL;
  } else {
    rateLink.style.display = "none";
  }
}
if (donateLink) donateLink.href = DONATE_URL;
if (reportLink) reportLink.href = REPORT_URL;

// Keep the popup's version badge in sync with the manifest.
const versionBadge = document.getElementById("versionBadge");
if (versionBadge) versionBadge.textContent = "v" + VERSION;

/* ---------- Boot ---------- */

chrome.storage.local.get("state", (data) => {
  currentState = data.state || defaultState();
  applyTheme(currentState.theme || "auto");
  lang = resolveLang(currentState.lang || "auto");
  t = I18N[lang];
  applyI18n();
  render(currentState);
  detectActiveTab();
});
