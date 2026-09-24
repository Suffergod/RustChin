/* ============================================================
   RustChin: Popup logic
   • Mirrors background.js SUPPORTED_SITES.
   • Reads/writes state to chrome.storage.local.
   • Custom popover font selector for 5 variable typefaces and custom system fonts.
   • Bilingual UI with zero tracking.
   ============================================================ */

const SITES = [
  { host: "chatgpt.com",           name: "ChatGPT",    nameFa: "چت جی‌پی‌تی", color: "#10A37F", logo: "../icons/chatgpt.svg",    siteId: "chatgpt" },
  { host: "claude.ai",             name: "Claude",     nameFa: "کلاود",      color: "#D97757", logo: "../icons/claude.svg",     siteId: "claude" },
  { host: "gemini.google.com",     name: "Gemini",     nameFa: "جمنای",      color: "#8E75B2", logo: "../icons/gemini.svg",     siteId: "gemini" },
  { host: "notebook.google.com",   name: "Gemini Notebook", nameFa: "جمنای نوت‌بوک", color: "#3186FF", logo: "../icons/notebooklm.svg", siteId: "notebooklm", altHost: "notebooklm.google.com" },
  { host: "chat.deepseek.com",     name: "DeepSeek",   nameFa: "دیپ سیک",    color: "#4D6BFE", logo: "../icons/deepseek.svg",   siteId: "deepseek" },
  { host: "copilot.microsoft.com", name: "Copilot",    nameFa: "کوپایلت",   color: "#0078D4", logo: "../icons/copilot.svg",    siteId: "copilot" },
  { host: "perplexity.ai",         name: "Perplexity", nameFa: "پرپلکسیتی", color: "#1FB8CD", logo: "../icons/perplexity.svg", siteId: "perplexity" },
  { host: "poe.com",               name: "Poe",        nameFa: "پو",        color: "#5D5CDE", logo: "../icons/poe.svg",        siteId: "poe" },
];

const FONTS = {
  vazirmatn: { nameFa: "وزیرمتن", cls: "font-vazir", family: "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif" },
  estedad:   { nameFa: "استعداد", cls: "font-estedad", family: "'Estedad', -apple-system, BlinkMacSystemFont, sans-serif" },
  sahel:     { nameFa: "ساحل",    cls: "font-sahel", family: "'Sahel', -apple-system, BlinkMacSystemFont, sans-serif" },
  arad:      { nameFa: "آراد",     cls: "font-arad", family: "'Arad', -apple-system, BlinkMacSystemFont, sans-serif" },
  mikhak:    { nameFa: "میخک",    cls: "font-mikhak", family: "'Mikhak', -apple-system, BlinkMacSystemFont, sans-serif" },
  custom:    { nameFa: "فونت دلخواه", cls: "font-custom", family: "inherit" },
};

const VERSION =
  typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest
    ? chrome.runtime.getManifest()?.version || "1.3.0"
    : "1.3.0";

const I18N = {
  en: {
    name: "RustChin", subtitle: "RTL & Persian Fonts for AI chat",
    font: "Font",
    dashboard: "Dashboard",
    badgeStandard: "Standard",
    badgeModern: "Modern",
    badgeClean: "Clean",
    badgeGeometric: "Geometric",
    badgeCasual: "Casual",
    badgeCustom: "Custom",
    customFontPrompt: "Enter font name (e.g. Shabnam, IRANSans, Tahoma):",
    enable: "Enabled",
    labelOn: "On",
    labelOff: "Off",
    activeN: (n, t) => `${n}/${t} sites enabled`,
    disabled: "Paused",
    supported: "Supported sites",
    enableMasterFirst: "Enable RustChin to manage individual sites",
    zeroData: "Zero data collected",
    rate: "Rate", report: "Feedback",
    rateTitle: "Rate on Chrome Web Store",
    reportTitle: "Send feedback to the RustChin team",
    reloadHint: "Reload this tab to activate RustChin on it.",
    pausedOnSite: "Paused here",
    dir: "ltr",
  },
  fa: {
    name: "RustChin", subtitle: "راست‌چین و فونت‌های فارسی برای هوش مصنوعی",
    font: "فونت",
    dashboard: "داشبورد",
    badgeStandard: "استاندارد",
    badgeModern: "مدرن",
    badgeClean: "روان",
    badgeGeometric: "هندسی",
    badgeCasual: "صمیمی",
    badgeCustom: "شخصی",
    customFontPrompt: "نام فونت دلخواه را وارد کنید (مانند شبنم، ایران‌سنس):",
    enable: "فعال",
    labelOn: "روشن",
    labelOff: "خاموش",
    activeN: (n, t) => `${n}/${t} سایت فعال`,
    disabled: "متوقف",
    supported: "سایت‌های پشتیبانی‌شده",
    enableMasterFirst: "برای مدیریت سایت‌ها، راست‌چین را فعال کنید",
    zeroData: "هیچ داده‌ای جمع‌آوری نمی‌شود",
    rate: "امتیاز", report: "بازخورد",
    rateTitle: "ثبت امتیاز در فروشگاه کروم",
    reportTitle: "ارسال انتقاد و پیشنهاد",
    reloadHint: "برای فعال‌سازی راست‌چین، این زبانه را بازخوانی کنید.",
    pausedOnSite: "متوقف در این سایت",
    dir: "rtl",
  },
};

let lang = "en";
let t = I18N.en;

function resolveLang(pref) {
  if (pref === "en" || pref === "fa") return pref;
  return (navigator.language || "en").toLowerCase().startsWith("fa") ? "fa" : "en";
}

const STORE_URL = "https://chromewebstore.google.com/detail/rustchin-persian-rtl-vazi/mhmnoojpobfgkpdkdmaaejiimolgagck";
// The site's feedback page, not the raw GitHub issue list. It asks the
// questions that make a report actionable (which platform, which layout, what
// the text looked like), copies the write-up to the clipboard, and only then
// hands off to a prefilled issue. It also catches the visitor who wants to
// write in Persian but will not sign up for a GitHub account to do it.
const REPORT_URL = "https://rust-chin.ir/feedback";

function defaultState() {
  const sites = {};
  SITES.forEach((s) => { sites[s.host] = true; });
  return { masterEnabled: true, sites, theme: "auto", lang: "auto", font: "vazirmatn", fontSize: 15, lineHeight: 1.8, customFont: "" };
}

let currentState = defaultState();

function getStateFromUI() {
  const state = {
    masterEnabled: masterToggle.checked,
    sites: {},
    theme: currentState.theme || "auto",
    lang: currentState.lang || "auto",
    font: currentState.font || "vazirmatn",
    fontSize: currentState.fontSize || 15,
    lineHeight: currentState.lineHeight || 1.8,
    customFont: currentState.customFont || "",
  };
  sitesList.querySelectorAll("input[data-host]").forEach((cb) => {
    state.sites[cb.dataset.host] = cb.checked;
    if (cb.dataset.altHost) {
      state.sites[cb.dataset.altHost] = cb.checked;
    }
  });
  return state;
}

function saveState(state, options = {}) {
  currentState = state;
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ state }, () => {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "STATE_CHANGED", state });
      }
      if (options.render === false) {
        updateStatus(state);
        return;
      }
      render(state);
    });
  } else {
    if (options.render === false) {
      updateStatus(state);
      return;
    }
    render(state);
  }
}

/* ---------- Rendering ---------- */
const masterToggle = document.getElementById("masterToggle");
const masterStatus = document.getElementById("masterStatus");
const masterLabel = document.getElementById("masterLabel");
const sitesList = document.getElementById("sitesList");
const sitesLock = document.getElementById("sitesLock");
const reloadHint = document.getElementById("reloadHint");
const fontPicker = document.getElementById("fontPicker");
const fontPickerBtn = document.getElementById("fontPickerBtn");
const fontPickerCurrent = document.getElementById("fontPickerCurrent");
const fontDropdown = document.getElementById("fontDropdown");
const fontDecBtn = document.getElementById("fontDecBtn");
const fontIncBtn = document.getElementById("fontIncBtn");
const fontSizeVal = document.getElementById("fontSizeVal");
const lineHeightDecBtn = document.getElementById("lineHeightDecBtn");
const lineHeightIncBtn = document.getElementById("lineHeightIncBtn");
const lineHeightVal = document.getElementById("lineHeightVal");
const themeSeg = document.getElementById("themeSeg");
const langSeg = document.getElementById("langSeg");
const dashboardLink = document.getElementById("dashboardLink");
const rateLink = document.getElementById("rateLink");
const reportLink = document.getElementById("reportLink");
const versionBadge = document.getElementById("versionBadge");

function buildSites(state) {
  sitesList.replaceChildren();

  // With the master switch off the grid stays rendered so the popup keeps a
  // stable height, and gets blurred behind an overlay instead of collapsing.
  // Keeping the checkboxes in the DOM also means getStateFromUI() reads the
  // real per-site values rather than wiping them to {} on a master toggle.
  const locked = !state.masterEnabled;
  if (locked) {
    sitesList.setAttribute("inert", "");
  } else {
    sitesList.removeAttribute("inert");
  }
  if (sitesLock) sitesLock.hidden = !locked;

  SITES.forEach((site) => {
    const enabled = state.sites[site.host] !== false;
    const row = document.createElement("div");
    row.className = "site-row" + (enabled ? "" : " dim");
    row.dataset.host = site.host;
    row.dataset.siteId = site.siteId;
    row.style.setProperty("--site-color", site.color);

    const info = document.createElement("div");
    info.className = "site-info";

    const img = document.createElement("img");
    img.className = "site-icon";
    img.src = site.logo;
    img.alt = site.name;

    const text = document.createElement("div");
    text.className = "site-text";

    const name = document.createElement("div");
    name.className = "site-name";
    name.textContent = lang === "fa" && site.nameFa ? site.nameFa : site.name;

    const domain = document.createElement("a");
    domain.className = "site-domain";
    domain.href = "https://" + site.host + "/";
    domain.target = "_blank";
    domain.rel = "noopener noreferrer";
    domain.textContent = site.host;

    text.appendChild(name);
    text.appendChild(domain);
    info.appendChild(img);
    info.appendChild(text);

    const right = document.createElement("div");
    right.className = "site-right";

    const tag = document.createElement("span");
    tag.className = "paused-tag";
    tag.style.display = "none";
    tag.textContent = t.pausedOnSite;

    const dot = document.createElement("span");
    dot.className = "live-dot";
    dot.style.display = "none";

    const toggle = document.createElement("label");
    toggle.className = "toggle";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.host = site.host;
    if (site.altHost) input.dataset.altHost = site.altHost;
    input.checked = enabled;
    input.disabled = locked;

    const slider = document.createElement("span");
    slider.className = "slider";

    toggle.appendChild(input);
    toggle.appendChild(slider);
    makeToggleDraggable(toggle);
    right.appendChild(tag);
    right.appendChild(dot);
    right.appendChild(toggle);

    row.appendChild(info);
    row.appendChild(right);

    input.addEventListener("change", () => {
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
    if (masterLabel) masterLabel.textContent = t.labelOff;
  } else {
    const n = SITES.filter((site) => state.sites[site.host] !== false).length;
    masterStatus.textContent = t.activeN(n, SITES.length);
    masterStatus.className = "master-status on";
    masterStatus.style.setProperty("--enabled-ratio", `${(n / SITES.length) * 100}%`);
    if (masterLabel) masterLabel.textContent = t.labelOn;
  }
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key === "enable" && el === masterLabel) return;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  if (rateLink) {
    rateLink.setAttribute("title", t.rateTitle || t.rate);
    rateLink.setAttribute("aria-label", t.rateTitle || t.rate);
  }
  if (reportLink) {
    reportLink.setAttribute("title", t.reportTitle || t.report);
    reportLink.setAttribute("aria-label", t.reportTitle || t.report);
  }
  if (masterLabel && currentState) updateStatus(currentState);
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

  const fontPref = state.font || "vazirmatn";
  let fontData = FONTS[fontPref] || FONTS.vazirmatn;
  if (fontPref === "custom" && state.customFont) {
    fontData = { nameFa: state.customFont, cls: "font-custom", family: `'${state.customFont}', 'Vazirmatn', sans-serif` };
  }
  document.documentElement.style.setProperty("--rc-font", fontData.family || "'Vazirmatn', sans-serif");
  if (fontPickerCurrent) {
    fontPickerCurrent.textContent = fontData.nameFa;
    fontPickerCurrent.className = "font-picker-current " + fontData.cls;
  }
  const customDisplay = document.getElementById("customFontNameDisplay");
  if (customDisplay && state.customFont) {
    customDisplay.textContent = state.customFont;
  }
  if (fontDropdown) {
    fontDropdown.querySelectorAll(".font-option").forEach((opt) => {
      const isActive = opt.dataset.value === fontPref;
      opt.classList.toggle("active", isActive);
      opt.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }
  updateFontSizeUI(state.fontSize || 15);
  updateLineHeightUI(state.lineHeight || 1.8);
}

function updateFontSizeUI(size) {
  const sz = Number(size) || 15;
  if (fontSizeVal) fontSizeVal.textContent = sz + "px";
  if (fontDecBtn) fontDecBtn.disabled = sz <= 12;
  if (fontIncBtn) fontIncBtn.disabled = sz >= 24;
}

if (fontDecBtn) {
  fontDecBtn.addEventListener("click", () => {
    let sz = Math.max(12, (currentState.fontSize || 15) - 1);
    currentState.fontSize = sz;
    updateFontSizeUI(sz);
    saveState(currentState, { render: false });
  });
}

if (fontIncBtn) {
  fontIncBtn.addEventListener("click", () => {
    let sz = Math.min(24, (currentState.fontSize || 15) + 1);
    currentState.fontSize = sz;
    updateFontSizeUI(sz);
    saveState(currentState, { render: false });
  });
}

function formatLineHeight(lh) {
  return lh % 1 === 0 ? lh.toFixed(1) : String(lh);
}

function updateLineHeightUI(value) {
  const lh = Number(value) || 1.8;
  if (lineHeightVal) lineHeightVal.textContent = formatLineHeight(lh);
  if (lineHeightDecBtn) lineHeightDecBtn.disabled = lh <= 1.4;
  if (lineHeightIncBtn) lineHeightIncBtn.disabled = lh >= 2.6;
}

/* 0.1 per click keeps the popup quick, while rounding onto a 1/20 grid lands
   on the same values as the dashboard slider and kills float drift. */
function stepLineHeight(delta) {
  const raw = (currentState.lineHeight || 1.8) + delta;
  const lh = Math.min(2.6, Math.max(1.4, Math.round(raw * 20) / 20));
  currentState.lineHeight = lh;
  updateLineHeightUI(lh);
  saveState(currentState, { render: false });
}

if (lineHeightDecBtn) {
  lineHeightDecBtn.addEventListener("click", () => stepLineHeight(-0.1));
}

if (lineHeightIncBtn) {
  lineHeightIncBtn.addEventListener("click", () => stepLineHeight(0.1));
}

function render(state) {
  masterToggle.checked = state.masterEnabled !== false;
  buildSites(state);
  updateStatus(state);
  renderPrefs(state);
  detectActiveTab();
}

/* ---------- Active Tab Detection & Glow ---------- */
function detectActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "RC_PING" }, (resp) => {
      if (chrome.runtime.lastError || !resp) {
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
  if (reloadHint) reloadHint.classList.remove("show");
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
    row.classList.add("paused");
    const tag = row.querySelector(".paused-tag");
    if (tag) tag.style.display = "inline-block";
    if (reloadHint) reloadHint.classList.add("show");
    return;
  }
  if (reloadHint) reloadHint.classList.remove("show");
}

/* ---------- Setup Controls ---------- */
function setupSeg(segEl, onPick) {
  if (!segEl) return;
  segEl.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => onPick(btn.dataset.value));
  });
}

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

// Popover dropdown toggle
if (fontPickerBtn && fontPicker) {
  fontPickerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = fontPicker.classList.toggle("open");
    fontPickerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (fontPicker.classList.contains("open") && !fontPicker.contains(e.target)) {
      fontPicker.classList.remove("open");
      fontPickerBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fontPicker.classList.contains("open")) {
      fontPicker.classList.remove("open");
      fontPickerBtn.setAttribute("aria-expanded", "false");
    }
  });
}

if (fontDropdown) {
  fontDropdown.querySelectorAll(".font-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const val = opt.dataset.value;
      if (val === "custom") {
        const currentCustom = currentState.customFont || "";
        const entered = prompt(t.customFontPrompt, currentCustom);
        if (entered !== null && entered.trim()) {
          currentState.customFont = entered.trim();
          currentState.font = "custom";
        } else if (!currentState.customFont) {
          return;
        } else {
          currentState.font = "custom";
        }
      } else {
        currentState.font = val;
      }
      if (fontPicker) {
        fontPicker.classList.remove("open");
        if (fontPickerBtn) fontPickerBtn.setAttribute("aria-expanded", "false");
      }
      saveState(currentState);
    });
  });
}

/* ---------- Draggable Toggle Switches (Pointer Drag & Tap Support) ---------- */
function makeToggleDraggable(toggleEl) {
  if (!toggleEl || toggleEl._draggableInit) return;
  toggleEl._draggableInit = true;

  const input = toggleEl.querySelector('input[type="checkbox"]');
  if (!input) return;

  const isMaster = !!toggleEl.closest(".master");
  const TRAVEL = isMaster ? 18 : 16;
  let isDown = false;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startChecked = false;
  let currentOffset = 0;

  const onPointerMove = (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (!isDragging && Math.abs(dx) > 2) {
      isDragging = true;
      hasMoved = true;
      toggleEl.classList.add("dragging");
    }
    if (isDragging) {
      currentOffset = Math.max(0, Math.min(TRAVEL, (startChecked ? TRAVEL : 0) + dx));
      toggleEl.style.setProperty("--drag-x", `${currentOffset.toFixed(1)}px`);
      if (currentOffset >= TRAVEL / 2) {
        toggleEl.classList.add("drag-on");
      } else {
        toggleEl.classList.remove("drag-on");
      }
    }
  };

  const onPointerUp = (e) => {
    if (!isDown) return;
    isDown = false;

    window.removeEventListener("pointermove", onPointerMove, true);
    window.removeEventListener("pointerup", onPointerUp, true);
    window.removeEventListener("pointercancel", onPointerUp, true);

    try {
      if (toggleEl.hasPointerCapture(e.pointerId)) {
        toggleEl.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    toggleEl.classList.remove("dragging");
    toggleEl.classList.remove("drag-on");
    toggleEl.style.removeProperty("--drag-x");

    if (hasMoved) {
      const finalState = currentOffset >= TRAVEL / 2;
      if (finalState !== input.checked) {
        input.checked = finalState;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const suppressClick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      toggleEl.addEventListener("click", suppressClick, { capture: true, once: true });
      setTimeout(() => {
        toggleEl.removeEventListener("click", suppressClick, { capture: true });
      }, 150);
    }
  };

  toggleEl.addEventListener("pointerdown", (e) => {
    if (input.disabled || e.button !== 0) return;
    isDown = true;
    startX = e.clientX;
    startChecked = input.checked;
    currentOffset = startChecked ? TRAVEL : 0;
    isDragging = false;
    hasMoved = false;

    try {
      toggleEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
  });
}

const masterWrap = masterToggle ? masterToggle.closest(".toggle") : null;
if (masterWrap) makeToggleDraggable(masterWrap);

masterToggle.addEventListener("change", () => {
  saveState(getStateFromUI());
});

function openDashboard() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options/options.html"));
  }
}

const openDashboardBtn = document.getElementById("openDashboardBtn");
if (openDashboardBtn) {
  openDashboardBtn.addEventListener("click", openDashboard);
}

if (dashboardLink) {
  dashboardLink.addEventListener("click", (e) => {
    e.preventDefault();
    openDashboard();
  });
}

if (rateLink) rateLink.href = STORE_URL;
if (reportLink) reportLink.href = REPORT_URL;
if (versionBadge) versionBadge.textContent = "v" + VERSION;

/* ---------- Boot ---------- */
function initBoot() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("state", (data) => {
      currentState = data.state || defaultState();
      if (!currentState.sites) currentState.sites = {};
      SITES.forEach((s) => {
        if (currentState.sites[s.host] === undefined) {
          currentState.sites[s.host] = true;
        }
      });
      applyTheme(currentState.theme || "auto");
      lang = resolveLang(currentState.lang || "auto");
      t = I18N[lang];
      applyI18n();
      render(currentState);
    });
  } else {
    currentState = defaultState();
    applyTheme(currentState.theme || "auto");
    lang = resolveLang(currentState.lang || "auto");
    t = I18N[lang];
    applyI18n();
    render(currentState);
  }
}
initBoot();
