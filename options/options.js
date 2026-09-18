/* ============================================================
   RustChin: Settings & Typography Studio Logic
   Multi-Font Calibration, Horizontal Site Controls, Live Sync
   ============================================================ */

const SITES = [
  { host: "chatgpt.com",           name: "ChatGPT",    nameFa: "چت جی‌پی‌تی", color: "#10A37F", logo: "../icons/chatgpt.svg" },
  { host: "claude.ai",             name: "Claude",     nameFa: "کلاود",      color: "#D97757", logo: "../icons/claude.svg" },
  { host: "gemini.google.com",     name: "Gemini",     nameFa: "جمنای",      color: "#8E75B2", logo: "../icons/gemini.svg" },
  { host: "notebook.google.com",   name: "Gemini Notebook", nameFa: "جمنای نوت‌بوک", color: "#3186FF", logo: "../icons/notebooklm.svg", altHost: "notebooklm.google.com" },
  { host: "chat.deepseek.com",     name: "DeepSeek",   nameFa: "دیپ سیک",    color: "#4D6BFE", logo: "../icons/deepseek.svg" },
];

const FONTS = {
  vazirmatn: { nameFa: "وزیرمتن", nameEn: "Vazirmatn", family: "'Vazirmatn', sans-serif" },
  estedad:   { nameFa: "استعداد", nameEn: "Estedad",   family: "'Estedad', sans-serif" },
  sahel:     { nameFa: "ساحل",    nameEn: "Sahel",     family: "'Sahel', sans-serif" },
  arad:      { nameFa: "آراد",     nameEn: "Arad",      family: "'Arad', sans-serif" },
  mikhak:    { nameFa: "میخک",    nameEn: "Mikhak",    family: "'Mikhak', sans-serif" },
};

const I18N = {
  en: {
    appName: "RustChin",
    studioSubtitle: "Persian RTL & Typography Suite for AI Chat",
    storeLink: "Web Store",
    typographyHeading: "Persian Typography Suite",
    typographySub: "Select the primary typeface for Persian and Arabic text. Applied instantaneously across all open chat tabs.",
    badgeStandard: "Standard",
    badgeModern: "Modern",
    badgeClean: "Clean",
    badgeGeometric: "Geometric",
    badgeCasual: "Casual",
    vazirmatnDesc: "Balanced legibility across screen sizes. Clean proportioned letterforms optimized for modern digital displays.",
    estedadDesc: "Sharp contemporary sans-serif with high stroke clarity. Crisp geometry suited for technical text and chat streams.",
    sahelDesc: "Designed for continuous reading with open counters and clear diacritic dots. Ultra-lightweight 38 KB footprint.",
    aradDesc: "Distinct geometric rhythm and modern curvature. Strong visual presence tailored for contemporary digital workspaces.",
    mikhakDesc: "Approachable semi-handwritten aesthetic. Comfortable tone and organic flow for extended conversational reading.",
    workbenchHeading: "Typography Calibration & Live Sandbox",
    workbenchSub: "Adjust metrics and test custom text rendering in real time with complete LTR code isolation.",
    testerTitle: "Interactive Text Tester",
    resetBtn: "Reset",
    metricsTitle: "Typography Metrics",
    fontSize: "Font Scale",
    lineHeight: "Line Height",
    resetDefaults: "Default",
    platformsHeading: "Supported AI Platforms",
    platformsSub: "Toggle extension behavior independently per service or control all simultaneously via the master switch.",
    activeN: (n, t) => `${n}/${t} sites enabled`,
    privacyTitle: "100% Private, Secure & Free Forever",
    privacyBody: "RustChin operates strictly inside your local browser instance. It contains zero analytics, zero external network requests, zero telemetry, and zero tracking. Your conversations, prompts, and personal data are never read, stored, or transmitted anywhere.",
    dir: "ltr",
  },
  fa: {
    appName: "راست‌چین",
    studioSubtitle: "مجموعه فونت‌های فارسی و راست‌چین برای هوش مصنوعی",
    storeLink: "فروشگاه افزونه",
    typographyHeading: "مجموعه فونت‌های اصیل فارسی",
    typographySub: "فونت دلخواه خود را انتخاب کنید. تغییرات فوراً و بدون نیاز به بارگذاری مجدد در تمام زبانه‌های فعال اعمال می‌شود.",
    badgeStandard: "استاندارد",
    badgeModern: "مدرن",
    badgeClean: "روان",
    badgeGeometric: "هندسی",
    badgeCasual: "صمیمی",
    vazirmatnDesc: "خوانایی فوق‌العاده در تمام اندازه‌ها. خطوط متعادل و هماهنگ، بهینه‌سازی‌شده برای نمایشگرهای مدرن.",
    estedadDesc: "سن‌سریف معاصر و شفاف با خوانایی بالا. ساختار هندسی واضح و مناسب برای مکالمات فنی و کدنویسی.",
    sahelDesc: "طراحی‌شده برای مطالعه طولانی با فضاهای باز و نقطه‌های خوانا. حجم بسیار کم و سبک (۳۸ کیلوبایت).",
    aradDesc: "انحناها و ریتم هندسی متمایز و امروزی. گزینه‌ای جذاب برای محیط‌های کاربری و ابزارهای مدرن هوش مصنوعی.",
    mikhakDesc: "سبک نیمه‌دست‌نویس و صمیمی. ایجاد حس راحتی و آرامش بصری در هنگام خواندن پاسخ‌های طولانی.",
    workbenchHeading: "تنظیم ابعاد و میز کار آزمایشی زنده",
    workbenchSub: "ابعاد قلم را تنظیم کنید و متن دلخواه خود را به‌صورت زنده همراه با تفکیک کدهای لاتین بررسی نمایید.",
    testerTitle: "آزمایش زنده متن دلخواه",
    resetBtn: "بازنشانی",
    metricsTitle: "تنظیم ابعاد تایپوگرافی",
    fontSize: "اندازه قلم",
    lineHeight: "فاصله خطوط",
    resetDefaults: "پیش‌فرض",
    platformsHeading: "پلتفرم‌های پشتیبانی‌شده",
    platformsSub: "فعال‌سازی اختصاصی در هر سایت یا کنترل کلیه سرویس‌ها از طریق کلید اصلی.",
    activeN: (n, t) => `${n}/${t} سایت فعال`,
    privacyTitle: "۱۰۰٪ خصوصی، امن و رایگان برای همیشه",
    privacyBody: "راست‌چین تماماً در مرورگر محلی شما اجرا می‌شود. این افزونه شامل هیچ‌گونه ابزار آمارگیر، درخواست به سرورهای خارجی یا ردیابی نمی‌باشد. مکالمات، پرامپت‌ها و اطلاعات شما هرگز ذخیره یا به جایی ارسال نمی‌گردند.",
    dir: "rtl",
  },
};

let lang = "en";
let t = I18N.en;

function resolveLang(pref) {
  if (pref === "en" || pref === "fa") return pref;
  return (navigator.language || "en").toLowerCase().startsWith("fa") ? "fa" : "en";
}

function defaultState() {
  const sites = {};
  SITES.forEach((s) => { sites[s.host] = true; });
  return { masterEnabled: true, sites, theme: "auto", lang: "auto", font: "vazirmatn", fontSize: 15, lineHeight: 1.8 };
}

let currentState = defaultState();

/* ---------- DOM Elements ---------- */
const themeSeg = document.getElementById("themeSeg");
const langSeg = document.getElementById("langSeg");
const fontGrid = document.getElementById("fontGrid");
const sandboxView = document.getElementById("sandboxView");
const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeVal = document.getElementById("fontSizeVal");
const lineHeightSlider = document.getElementById("lineHeightSlider");
const lineHeightVal = document.getElementById("lineHeightVal");
const sitesGrid = document.getElementById("sitesGrid");
const masterToggle = document.getElementById("masterToggle");
const masterStatusLabel = document.getElementById("masterStatusLabel");
const liveInput = document.getElementById("liveInput");
const dynamicHeading = document.getElementById("dynamicHeading");
const dynamicParagraph = document.getElementById("dynamicParagraph");
const resetTextBtn = document.getElementById("resetTextBtn");
const resetMetricsBtn = document.getElementById("resetMetricsBtn");

const DEFAULT_PARAGRAPH = "رندر صحیح زبان‌های راست‌چین مانند فارسی در بستر وب نیازمند رعایت چند اصل بنیادی است: محاسبه دقیق نسبت کاراکترهای راست‌به‌چپ، استفاده از فونت متغیر بهینه‌سازی‌شده برای صفحه نمایش و ایزولاسیون کامل کلمات لاتین مانند async / await یا متغیرهای فنی.";

/* ---------- Theme & i18n ---------- */
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
    if (t[key] !== undefined) el.textContent = t[key];
  });
  updateSitesUI();
  updateSliderProgress(fontSizeSlider);
  updateSliderProgress(lineHeightSlider);
}

/* ---------- State Save & Relay ---------- */
function saveState(state) {
  currentState = state;
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ state }, () => {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "STATE_CHANGED", state });
      }
    });
  }
}

/* ---------- Typography Calibration ---------- */
function applyFont(fontKey) {
  const font = FONTS[fontKey] || FONTS.vazirmatn;
  if (sandboxView) {
    sandboxView.style.setProperty("--preview-font", font.family);
  }

  if (fontGrid) {
    fontGrid.querySelectorAll(".font-card").forEach((card) => {
      const isActive = card.dataset.font === fontKey;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-checked", isActive ? "true" : "false");
    });
  }
}

function updateSliderProgress(slider) {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  slider.style.setProperty("--slider-fill", `${pct.toFixed(1)}%`);
}

function applyMetrics(size, lh) {
  if (sandboxView) {
    sandboxView.style.setProperty("--preview-size", size + "px");
    sandboxView.style.setProperty("--preview-line-height", lh);
  }
  if (fontSizeVal) fontSizeVal.textContent = size + "px";
  if (lineHeightVal) lineHeightVal.textContent = String(lh);
  if (fontSizeSlider) {
    fontSizeSlider.value = size;
    updateSliderProgress(fontSizeSlider);
  }
  if (lineHeightSlider) {
    lineHeightSlider.value = lh;
    updateSliderProgress(lineHeightSlider);
  }
}

function initFontGrid() {
  if (!fontGrid) return;
  fontGrid.querySelectorAll(".font-card").forEach((card) => {
    const pick = () => {
      const fontKey = card.dataset.font;
      currentState.font = fontKey;
      applyFont(fontKey);
      saveState(currentState);
    };
    card.addEventListener("click", pick);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
    // Prevent clicking the GitHub link from switching the selected font
    card.querySelectorAll(".font-github-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  });

  if (fontSizeSlider) {
    fontSizeSlider.addEventListener("input", (e) => {
      const sz = Number(e.target.value);
      currentState.fontSize = sz;
      applyMetrics(sz, currentState.lineHeight || 1.8);
      saveState(currentState);
    });
  }

  if (lineHeightSlider) {
    lineHeightSlider.addEventListener("input", (e) => {
      const lh = Number(e.target.value);
      currentState.lineHeight = lh;
      applyMetrics(currentState.fontSize || 15, lh);
      saveState(currentState);
    });
  }

  if (resetMetricsBtn) {
    resetMetricsBtn.addEventListener("click", () => {
      currentState.fontSize = 15;
      currentState.lineHeight = 1.8;
      applyMetrics(15, 1.8);
      saveState(currentState);
    });
  }
}

/* ---------- Custom Text Tester ---------- */
if (liveInput && dynamicParagraph) {
  liveInput.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    dynamicParagraph.textContent = val ? val : DEFAULT_PARAGRAPH;
  });
}

if (resetTextBtn && liveInput && dynamicParagraph) {
  resetTextBtn.addEventListener("click", () => {
    liveInput.value = "";
    dynamicParagraph.textContent = DEFAULT_PARAGRAPH;
  });
}

/* ---------- Draggable Toggle Switches (Pointer Drag & Tap Support) ---------- */
function makeToggleDraggable(toggleEl) {
  if (!toggleEl || toggleEl._draggableInit) return;
  toggleEl._draggableInit = true;

  const input = toggleEl.querySelector('input[type="checkbox"]');
  if (!input) return;

  const TRAVEL = 18; // 42px width - 20px knob - 4px horizontal padding
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
      // Suppress the synthetic click event generated by browser after pointerup
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

/* ---------- Sites Management (Horizontal Grid) ---------- */
function buildSitesList() {
  if (!sitesGrid) return;
  sitesGrid.replaceChildren();
  const isMasterOn = currentState.masterEnabled !== false;

  SITES.forEach((site) => {
    const enabled = isMasterOn && currentState.sites[site.host] !== false;
    const card = document.createElement("div");
    card.className = "platform-card" + (enabled ? " active" : " dim");
    card.dataset.host = site.host;
    card.style.setProperty("--site-color", site.color);

    const info = document.createElement("div");
    info.className = "platform-brand";

    const img = document.createElement("img");
    img.className = "platform-logo";
    img.src = site.logo;
    img.alt = site.name;

    const text = document.createElement("div");
    text.className = "platform-meta";

    const name = document.createElement("span");
    name.className = "platform-name";
    name.textContent = lang === "fa" && site.nameFa ? site.nameFa : site.name;

    const domain = document.createElement("a");
    domain.className = "platform-domain";
    domain.href = "https://" + site.host + "/";
    domain.target = "_blank";
    domain.rel = "noopener noreferrer";
    domain.textContent = site.host;

    text.appendChild(name);
    text.appendChild(domain);
    info.appendChild(img);
    info.appendChild(text);

    const toggle = document.createElement("label");
    toggle.className = "toggle-switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = currentState.sites[site.host] !== false;
    input.disabled = !isMasterOn;

    const slider = document.createElement("span");
    slider.className = "switch-slider";

    toggle.appendChild(input);
    toggle.appendChild(slider);
    makeToggleDraggable(toggle);

    input.addEventListener("change", () => {
      currentState.sites[site.host] = input.checked;
      if (site.altHost) {
        currentState.sites[site.altHost] = input.checked;
      }
      card.classList.toggle("active", input.checked);
      card.classList.toggle("dim", !input.checked);
      saveState(currentState);
      updateSitesCount();
    });

    card.appendChild(info);
    card.appendChild(toggle);
    sitesGrid.appendChild(card);
  });
}

function updateSitesCount() {
  const isMasterOn = currentState.masterEnabled !== false;
  const n = SITES.filter((s) => currentState.sites[s.host] !== false).length;
  if (masterStatusLabel) {
    masterStatusLabel.textContent = isMasterOn ? t.activeN(n, SITES.length) : (lang === "fa" ? "غیرفعال" : "Disabled");
    masterStatusLabel.classList.toggle("on", isMasterOn);
  }
}

function updateSitesUI() {
  const isMasterOn = currentState.masterEnabled !== false;
  if (masterToggle) masterToggle.checked = isMasterOn;
  updateSitesCount();
  buildSitesList();
}

if (masterToggle) {
  const masterWrap = masterToggle.closest(".toggle-switch");
  if (masterWrap) makeToggleDraggable(masterWrap);
  masterToggle.addEventListener("change", (e) => {
    currentState.masterEnabled = e.target.checked;
    saveState(currentState);
    updateSitesUI();
  });
}

/* ---------- Segmented Controls ---------- */
function setupSeg(segEl, onPick) {
  if (!segEl) return;
  segEl.querySelectorAll(".seg-item").forEach((btn) => {
    btn.addEventListener("click", () => onPick(btn.dataset.value));
  });
}

setupSeg(themeSeg, (val) => {
  applyTheme(val);
  currentState.theme = val;
  themeSeg.querySelectorAll(".seg-item").forEach(b => b.classList.toggle("active", b.dataset.value === val));
  saveState(currentState);
});

setupSeg(langSeg, (val) => {
  currentState.lang = val;
  lang = resolveLang(val);
  t = I18N[lang];
  langSeg.querySelectorAll(".seg-item").forEach(b => b.classList.toggle("active", b.dataset.value === val));
  applyI18n();
  applyFont(currentState.font || "vazirmatn");
  saveState(currentState);
});

/* ---------- Initialization ---------- */
function finishInit() {
  // Theme
  const theme = currentState.theme || "auto";
  applyTheme(theme);
  if (themeSeg) {
    themeSeg.querySelectorAll(".seg-item").forEach(b => b.classList.toggle("active", b.dataset.value === theme));
  }

  // Language
  lang = resolveLang(currentState.lang || "auto");
  t = I18N[lang];
  if (langSeg) {
    langSeg.querySelectorAll(".seg-item").forEach(b => b.classList.toggle("active", b.dataset.value === (currentState.lang || "auto")));
  }
  applyI18n();

  // Font & Metrics
  applyFont(currentState.font || "vazirmatn");
  applyMetrics(currentState.fontSize || 15, currentState.lineHeight || 1.8);

  updateSitesUI();
  initFontGrid();
}

function init() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("state", (data) => {
      currentState = data.state || defaultState();
      finishInit();
    });
  } else {
    currentState = defaultState();
    finishInit();
  }
}

if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.state) {
      currentState = changes.state.newValue;
      applyFont(currentState.font || "vazirmatn");
      applyMetrics(currentState.fontSize || 15, currentState.lineHeight || 1.8);
      updateSitesUI();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
