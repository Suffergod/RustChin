# RustChin: Debugging Log

This document tracks debugging sessions, root causes, and fixes for future reference.

---

## 2026-07-07 - Session 1: Vazirmatn Font, Copy Table Button

### Issue 1: Vazirmatn font not applied to mixed LTR+RTL content

**Symptom:** Persian text in headings with mixed English/Persian content (e.g., "Persian Literature / ادبیات فارسی") was not rendered in Vazirmatn font.

**Root cause:** The `getDirection()` function in `engine.js` counts RTL-script chars vs Latin chars. When Latin chars outnumber RTL chars (ratio > 1.5), it returns `"ltr"`. The CSS rule for Vazirmatn only targeted `[dir="rtl"]` elements:
```css
.bidi-scope .rc-done[dir="rtl"]:not(pre):not(code)... {
  font-family: 'Vazirmatn', ...;
}
```
So mixed content with `dir="ltr"` never received Vazirmatn, even though the `@font-face` `unicode-range` would correctly filter it to only Persian/Arabic glyphs.

**Fix:** Removed `[dir="rtl"]` from both Vazirmatn selectors in `sites/chatgpt.js`.

**Why safe:** The `@font-face` `unicode-range: U+0600-06FF, ...` ensures Vazirmatn is only used for Persian/Arabic codepoints. Latin characters fall through to the next font in the stack.

**Status:** Applied to chatgpt.js. Same fix needed for claude.js, gemini.js, deepseek.js.

---

### Issue 2: Copy table button not on left side for RTL tables

**Symptom:** The "Copy table" button in ChatGPT was not positioned on the left side for RTL tables.

**Root cause:** ChatGPT's copy button uses Tailwind's `absolute end-0` class → `inset-inline-end: 0`. This is a CSS **logical property**:
- `direction: ltr` → resolves to `right: 0` (button on right)
- `direction: rtl` → resolves to `left: 0` (button on left)

The CSS rule was forcing `direction: ltr` on the toolbar for ALL tables, which meant `end-0` always resolved to `right: 0`.

**Fix:** Changed `> div:first-child` to `> div:has(button)` (more robust DOM matching) and added a second CSS rule for RTL tables:
```css
.bidi-scope div:has(> table) > div:has(button) {
  direction: ltr !important;
}
.bidi-scope div:has(> table[dir="rtl"]) > div:has(button) {
  direction: rtl !important;
}
```

**Why safe:** The `[dir="rtl"]` attribute selector makes the override rule more specific, only activating for RTL tables.

**Status:** Applied to chatgpt.js only.

---

## 2026-07-07 - Session 2: Backtick Template Literal Bug (Critical)

### Issue 3: CSS comment backticks broke entire extension

**Symptom:** After applying the fixes above, the ENTIRE extension broke:
- Vazirmatn font gone for ALL text
- RTL direction broken
- English headings incorrectly forced to RTL
- Sidebar Persian content lost RTL and Vazirmatn

**Root cause:** A CSS comment in `sites/chatgpt.js` contained backtick characters:
```javascript
css: `
    /* Copy-table button: the toolbar uses \`absolute end-0\` (logical ... */
`,
```
The backticks (`) in the comment prematurely closed the JavaScript template literal (backtick string). Everything after the first backtick in the comment was interpreted as JavaScript code, not CSS. This caused a `chatgpt.js:74 Uncaught` error and prevented the ENTIRE CSS from being injected.

**Why this was catastrophic:**
- No `@font-face` declaration → Vazirmatn font never loaded
- No `.bidi-scope` CSS rules → no direction fixes applied
- No `unicode-bidi: isolate` → browser default direction behavior took over
- The extension appeared completely broken because ALL CSS was missing

**Fix:** Replaced backticks with single quotes in the comment:
```javascript
/* Copy-table button: the toolbar uses 'absolute end-0' (a Tailwind
   utility mapping to the CSS logical property inset-inline-end:0). ... */
```

**Lesson learned:** NEVER use backticks inside JavaScript template literals, even in comments. Template literals are delimited by backticks, and there is no escape mechanism that works inside comments. Use single quotes or double quotes instead.

**Debugging approach:**
1. User reported console error: `sites/chatgpt.js:74 Uncaught`
2. Line 74 was inside the CSS template string
3. Found backtick characters in the comment on that line
4. Backticks in template literals cause the string to close prematurely

---

## 2026-09-13 - Session 3: ChatGPT Comprehensive Overhaul, CWS Updates & Multi-Font Preparation

### Issue 4: Sent prompt text not getting Vazirmatn & RTL (Resolved)

**Symptom:** User's own sent messages in ChatGPT had Persian text without Vazirmatn font and without RTL direction.

**Root cause:** ChatGPT renders user sent messages with a plain `<div>` wrapper containing text directly (`.whitespace-pre-wrap`): no `<p>`, `<h1>`, or other `LEAF_TAG` inside. The engine's `processContainer()` only scanned `LEAF_TAGS` (`p, h1-h6, li, blockquote, td, th`). The text-bearing `<div>` was completely skipped.

**Fix:**
1. In `core/engine.js` `processContainer()`, added a scan for child text-bearing `<div>` elements that do not contain child leaf tags (`if (d.querySelector(LEAF_TAGS)) return;`). If text is non-empty, `fixElement(d)` is called.
2. In `sites/chatgpt.js`, added `extraSelector: "[data-message-author-role='user'] [class*='whitespace-pre-wrap'], nav a span, [data-testid^='history-item'] span"`.

**Status:** ✅ Applied & Verified via live browser inspection.

---

### Issue 5: Revert contract broken on toggle OFF (Resolved)

**Symptom:** After toggling the extension off and on, RTL direction and table styles were not cleanly reset.

**Root cause:** `processContainer()` sets `dir` on `<table>` and `<ol>` elements, but `stop()` only cleaned `.bidi-scope`, `.rc-done`, and `.rc-input` markers. `<table>` and `<ol>` `dir` attributes were left behind.

**Fix:** Added table and list `dir` cleanup to `stop()` in `core/engine.js`:
```javascript
document.querySelectorAll("table[dir], ol[dir]").forEach(function (el) {
  el.removeAttribute("dir");
});
```

**Status:** ✅ Applied.

---

### Issue 6: Table & Canvas / ProseMirror documents in ChatGPT (Resolved)

**Symptom:** In ChatGPT's Canvas/Writing-block mode (`writing-block-surface ProseMirror markdown`), tables and cells (`th`, `td`) with inner `<span>` elements lacked RTL table alignment and Vazirmatn font.

**Root cause:**
1. Table direction was not explicitly set to `direction: rtl !important; text-align: right !important;` in the CSS stylesheet.
2. In Canvas mode, cell text is wrapped in `<span>` tags. Cells need `.rc-done` so that `.bidi-scope .rc-done` cascades Vazirmatn to all non-code/math descendants.

**Fix:**
1. In `core/engine.js`, `processContainer()` now detects table direction and marks all `th, td` with `fixElement()`.
2. Added `.bidi-scope table[dir="rtl"] { direction: rtl !important; text-align: right !important; }` to `sites/chatgpt.js`.

**Status:** ✅ Applied & Verified via live screenshot inspection.

---

### Issue 7: Incremental mutation scanning for streamed content (Resolved)

**Symptom:** When ChatGPT streams new tokens into an already existing `.markdown` or `.bidi-scope` container, newly inserted child nodes (`p`, `table`, etc.) were ignored by `scanNodes()`.

**Root cause:** In `scanNodes()`, nodes were only processed if `node.matches(config.containers)` or `node.querySelectorAll(config.containers)`. When a `<p>` or `<table>` is appended into an *already existing* container, it does not match `config.containers`.

**Fix:** In `core/engine.js` `scanNodes()`, added an `else if (node.closest(".bidi-scope") || (config.containers && node.closest(config.containers)))` branch to immediately process newly inserted leaf tags and tables.

**Status:** ✅ Applied.

---

### Issue 8: Redundant container selector slowing down scan (Resolved)

**Symptom:** `config.containers` in `sites/chatgpt.js` included `nav div`, which matched over 250 unnecessary `<div>` elements in the sidebar.

**Fix:** Removed `nav div` from `config.containers`. Kept specific sidebar targets (`nav a`, `nav li`) and added `nav a span, [data-testid^='history-item'] span` to `extraSelector`.

**Status:** ✅ Applied.

---

### Issue 9: Tab freeze / JavaScript lock-up on typing Persian or opening Canvas conversations (Resolved)

**Symptom:** The moment the user started typing Persian into ChatGPT's prompt box, or opened a conversation containing Canvas/Writing Blocks, the ChatGPT browser tab completely stopped responding (100% CPU lock-up).

**Root causes:**
1. **ProseMirror Mutation Deadlock**: `#prompt-textarea` (the prompt box) and Canvas (`writing-block-surface ProseMirror`) are ProseMirror rich-text editors. `#prompt-textarea` was erroneously included in `config.containers`, and `scanNodes()` modified child nodes inside existing containers. When Persian text was present/typed, `fixElement()` set `dir="rtl"`, `rc-done`, and inline styles on internal nodes inside ProseMirror. ProseMirror's internal `DOMObserver` detected these external attribute mutations, interpreted them as unsynced changes, and re-rendered/replaced the DOM nodes. This triggered another `childList` mutation in RustChin, which re-mutated the nodes, triggering ProseMirror again in an infinite loop.
2. **Microtask Starvation**: `scheduleBatch()` scheduled mutations using `Promise.resolve().then(...)` (a microtask). In JavaScript, microtasks drain recursively before the browser can render, process input, or execute macro tasks. The cyclical mutation between RustChin and ProseMirror starved the browser event loop completely.
3. **Broad `div` scanning in containers**: `processContainer()` scanned all `div` elements inside containers and ran subqueries, matching toolbars, SVG wrappers, and nested editor internals.

**Fix:**
1. **Editable & ProseMirror Exclusion**: Added an immediate `if (el.isContentEditable || (el.matches && el.matches('input, textarea, select')))` guard at the top of `fixElement()`, `processContainer()`, and `scanNodes()`. External scripts must NEVER mutate the internal DOM of active rich-text editors.
2. **Removed `#prompt-textarea` from `containers`**: `#prompt-textarea` is an input element, handled exclusively at the root container level by `handleDynamicInput()` and `editableSelector`. Removed from `containers`.
3. **Animation Frame Scheduling (`requestAnimationFrame`)**: Changed `scheduleBatch()` from `Promise.resolve().then(...)` to `requestAnimationFrame(...)`. This ties DOM updates to display frames, completely eliminating microtask starvation and ensuring the browser main thread remains responsive.
4. **Pure CSS for Canvas & ProseMirror**: Styled `.ProseMirror[dir="rtl"]`, `[contenteditable="true"][dir="rtl"]`, and Canvas tables via CSS stylesheet rules rather than imperative JavaScript DOM manipulation. CSS does not trigger ProseMirror DOMObserver reconciliations.
5. **Deduplicated input writes**: `handleDynamicInput()` now checks `if (inputEl.getAttribute("dir") !== dir)` before writing attributes, avoiding redundant DOM attribute mutations while typing.

**Status:** ✅ Applied & Verified.

---

### Extension Metadata & UI Changes

1. **Donation Link Removed:** Completely removed the heart icon and `reymit.ir` donation link from `popup/popup.html` and `popup/popup.js`. The extension is 100% free and private.
2. **Chrome Web Store Link Connected:** Linked official store URL `https://chromewebstore.google.com/detail/rustchin-persian-rtl-vazi/mhmnoojpobfgkpdkdmaaejiimolgagck` to the "Rate" button (`STORE_URL_KNOWN = true`).
3. **Version Bump:** Bumped version to `1.2.0` in `manifest.json` and `README.md`.
4. **Extension Name Update:** Changed name in `manifest.json` to `"RustChin: RTL & Persian Fonts"` in preparation for multi-font support (Vazirmatn + Estedad).

---

---

### Issue 10: Toggle Switch Drag Support & Tactile Motion (Resolved)

**Symptom:** In the Options dashboard, toggle switches only responded to clicks. Users attempting to drag the white circle knob across the track found it unresponsive, and spring physics in CSS occasionally overshot the track pill.

**Root causes:**
1. Default `<label class="toggle-switch">` elements with nested checkboxes rely on the browser's default click-toggling mechanism. No Pointer Events drag engine was implemented.
2. An initial Pointer Events implementation bound listeners only to `toggleEl` and guarded on `toggleEl.hasPointerCapture()`, which dropped drag gestures if the pointer moved outside the 42px element bounds or if capture was not retained.
3. Upon drag release, the browser fired a synthetic `click` event on the `<label>`, causing the checkbox state to invert back.

**Fix:**
1. Implemented `makeToggleDraggable(toggleEl)` using `pointerdown`, `window.pointermove`, `window.pointerup`, and `window.pointercancel`.
2. Direct 60fps tracking using the CSS custom property `--drag-x` and `transform: translate3d(var(--drag-x, 0px), 0, 0) !important` with `transition: none !important`.
3. Added real-time track color feedback (`.drag-on`) when passing the 50% midpoint (`TRAVEL / 2 = 9px`).
4. Suppressed synthetic post-drag click events via a capturing-phase click interceptor (`ev.preventDefault(); ev.stopPropagation();`).
5. Standardized switch dimensions to 42px×24px, 20px knob diameter, with tactile squash-and-stretch on click/press (`width: 24px`).
6. Enforced `direction: ltr` on `.toggle-switch` to ensure physical coordinate stability in RTL mode.

**Status:** ✅ Applied & Verified via live browser pointer simulation.

---

### Issue 11: Typography Metrics Default State Recovery (Resolved)

**Symptom:** Sliders for Font Scale (12-24px) and Line Height (1.4-2.6) had no quick way to return to their recommended default settings (15px, 1.8).

**Fix:**
1. Added `<button type="button" class="btn-text-reset" id="resetMetricsBtn" data-i18n="resetDefaults">Default</button>` in the Typography Metrics header in `options/options.html`.
2. Bound click handler in `options/options.js` to reset `fontSize = 15` and `lineHeight = 1.8`, updating CSS variables (`--preview-size`, `--preview-line-height`), numeric badges, slider values, `--slider-fill`, and storage sync.

**Status:** ✅ Applied & Verified.

---

### Issue 12: Dual-Color Dynamic Slider Track Fill (Resolved)

**Symptom:** Range inputs in `options.css` lacked progress track coloring, making it difficult to discern slider progress at a glance.

**Fix:**
1. Bound `--slider-fill` custom property to slider `input` events in `options.js`.
2. Applied a linear-gradient background fill in `options.css`:
   ```css
   background: linear-gradient(
     to right,
     var(--accent) 0%,
     var(--accent) var(--slider-fill, 25%),
     var(--slider-track-bg) var(--slider-fill, 25%),
     var(--slider-track-bg) 100%
   );
   ```
3. Set `direction: ltr;` on `.smooth-slider` so fill direction is independent of document text direction.

**Status:** ✅ Applied & Verified.

---

### Issue 13: Theme-Responsive ChatGPT Monochromatic Toggle Switch (Resolved)

**Symptom:** The previous beige/creamy toggle for ChatGPT had weak contrast and did not reflect OpenAI's authentic monochrome brand identity across light and dark modes.

**Root cause:** Hardcoded static background colors clashed with dark or light backgrounds. Furthermore, an internal media query in `icons/chatgpt.svg` caused inverted rendering on dark OS themes.

**Fix:**
1. Stripped the internal media query from `icons/chatgpt.svg` to maintain a solid `#111111` base path and handled dark inversion exclusively via external CSS filters.
2. In light mode: styled the active ChatGPT toggle with an Obsidian Black track (`#111111`) and snow-white knob (`#ffffff`).
3. In dark mode: styled the active ChatGPT toggle with a Luminous Snow White track (`#ffffff`) with subtle diffuse glow and obsidian knob (`#111111`).
4. Fully synchronized across `popup/popup.css` and `options/options.css`.

**Status:** ✅ Applied & Verified.

---

### Issue 14: Direction-Aware Toggle Squash-and-Stretch Physics (Resolved)

**Symptom:** Active switch anticipation stretched to the right even when the user intended to flip the switch to the left (turning OFF).

**Root cause:** The `:active:not(.dragging)` rule increased knob width from 20px to 23px without modifying its translation origin, forcing the width increase to expand rightward.

**Fix:**
1. Added `.toggle:active:not(.dragging) input:checked + .slider::before { transform: translate3d(15px, 0, 0) !important; }` in `popup/popup.css` and matching `.toggle-switch` rule in `options/options.css`.
2. When OFF: knob starts at 2px and stretches 3px rightward to 25px in the direction of activation.
3. When ON: knob right edge stays anchored at 40px while expanding 3px leftward to 17px in the direction of deactivation.
4. Preserved physical coordinate predictability in both English (LTR) and Persian (RTL) via `direction: ltr;`.

**Status:** ✅ Applied & Verified.

---

### Issue 15: Eye-Pleasing Emerald Green for Global Master Switch (Resolved)

**Symptom:** Global master switch used standard blue, creating visual ambiguity with site-specific blue toggles (Gemini Notebook, DeepSeek) and disconnecting from the active status indicator.

**Fix:**
1. Replaced blue with authentic Emerald Green (`#1f9d55` in light mode, `#22c55e` in dark mode) matching the active status badge ("5/5 sites enabled").
2. Synchronized across `popup/popup.css` and `options/options.css`.
3. Updated dynamic label lighting in `options/options.js`.

**Status:** ✅ Applied & Verified.

---

### Issue 16: Mathematical Vector Alignment for Icon Hover Rotations (Resolved)

**Symptom:** Rotating SVG icons (theme selection and settings gear) jittered, shifted position, and multi-part icons (sun rays/circle, gear teeth/center) tore apart into each other.

**Root cause:**
1. `transform-box: fill-box` caused child `<circle>` and `<path>` elements to compute independent bounding boxes, resulting in diverging rotation centers.
2. Odd dimensions (15px) caused fractional subpixel centers (7.5px), forcing the rasterizer to snap across pixels each frame.
3. Lack of `overflow: visible` caused bounding box clipping on angled vectors.

**Fix:**
1. Standardized icon dimensions to integer `16px x 16px` with `display: block; overflow: visible;`.
2. Switched from `fill-box` to `transform-box: view-box; transform-origin: center;`.
3. Grouped all multi-part vector paths inside a single `<g>` element in `popup/popup.html` and `options/options.html`.
4. Aligned rotation angles with radial symmetries: 45deg for 8-ray sun (`360 / 8`), 60deg for 6-lobe gear (`360 / 6`).
5. Verified via browser harness that center drift during rotation is 0.0000px.

**Status:** ✅ Applied & Verified.

---

### Issue 17: Strict Zero Em Dash Policy Across Codebase (Resolved)

**Symptom:** Em dashes were present in documentation, titles, code comments, and strings.

**Fix:** Replaced every instance of em dashes with standard colons, pipes, or hyphens across HTML, CSS, JavaScript, and Markdown files.

**Status:** ✅ Applied & Verified.

---

---

### Issue 18: Vector Layer Shimmer & Orbital Wobble on Star, Bug, and Moon Icons (Resolved)

**Symptom:** Hovering on Star, Bug, and Moon icons in the popup and options page caused visible jitter, fluttering, and lateral orbital drift. On the Moon icon, jitter occurred when hovered in inactive state but disappeared when active.

**Root cause:**
1. CSS transforms (`transform: rotate(...)`, `will-change: transform`, `transform-box: view-box`) applied to the root HTML `<svg>` element forced Chromium/Blink to promote the small (14px/16px) SVG container into a low-resolution GraphicsLayer bitmap. Rotating this texture over subpixel coordinates under Windows 11 high-DPI scaling forced continuous bilinear filter resampling and pixel snapping.
2. Rotating the root `<svg>` element expanded its axis-aligned bounding box (AABB) from 14px to 19.8px, causing hit-test bounding box oscillations.
3. Color transitions (`color 0.2s ease` on `:hover`) combined with `stroke="currentColor"` forced continuous raster repaints during rotation when the icon was inactive.
4. Eccentric vertex coordinates in original paths:
   - Star polygon had top vertex at y=2.0 (distance 10.0) and bottom vertices at y=21.02 (distance 10.93), shifting geometric center to (12.0, 11.51) and causing 0.49px orbital precession.
   - Bug path spanned y in [4, 21], placing vertical center at y=12.5 and causing lateral pendulum swing.

**Fix:**
1. Transferred all transform and transition rules from the root `<svg>` element to internal vector `<g>` containers:
   ```css
   .header-actions .btn-icon svg g,
   .seg-btn svg g,
   .seg-item svg g,
   .footer-btn svg g {
     transform-origin: 12px 12px;
     transition: transform 0.35s cubic-bezier(0.2, 0, 0, 1);
   }
   ```
2. Stripped `will-change: transform`, `backface-visibility`, and `transform-box` from `<svg>`, keeping the outer HTML box completely static (0.0px layout shift).
3. Replaced Star coordinates with an exact 5-fold symmetric polygon centered at (12.0, 12.0) with outer tip radius 9.5 and inner valley radius 4.2.
4. Shifted Bug coordinates by -0.5 on Y to lock its bounding box to [3.5, 20.5], aligning center of mass precisely at (12.0, 12.0).
5. Locked Moon hover rotation to -15deg on `<g>` with origin at (12px, 12px) in both popup and options page.
6. Verified 0.0px layout movement and zero texture shimmer via browser harness.

**Status:** ✅ Applied & Verified.

---

### Issue 19: Font Cards Redundant Badges & Compact Alignment (Resolved)

**Symptom:** Font cards in the options dashboard displayed redundant "100-900" weight text, inflated card heights, and contained an unnecessary "Active" text badge alongside the already active colored border and glow.

**Fix:**
1. Removed "100-900" weight line from all 5 font cards.
2. Removed `.font-active-status` text element from HTML, CSS, and JS translations, relying on the accent border and glow as the sole active indicator.
3. Updated `.font-card` to centered alignment: `align-items: center; text-align: center; justify-content: center; gap: 6px; padding: 18px 14px 16px;`.
4. Reduced card height to compact ~143px across all 5 cards.

**Status:** ✅ Applied & Verified.

---

### Issue 20: Popup Footer Quick Actions Redesign (Resolved)

**Symptom:** The footer displayed plain text links for "Rate" and "Report", and the privacy shield was misaligned with the text label.

**Fix:**
1. Replaced text links with interactive icon action buttons (`#rateLink` Star and `#reportLink` Bug) with branded hover colors:
   - Rate Star: `#f59e0b` amber on hover with 72deg vector rotation.
   - Report Bug: `#f43f5e` rose ruby on hover with -15deg vector rotation.
2. Aligned the privacy shield icon (`.zero-shield`) and text within `.zero-badge`.

**Status:** ✅ Applied & Verified.

---

## Summary of All Changes

| File | Change | Status |
|------|--------|--------|
| `manifest.json` | Name updated to `RustChin: RTL & Persian Fonts`, version `1.2.0`, registered 5 variable fonts and options studio | ✅ Applied |
| `README.md` | Version badge updated to `1.2.0`, full RTL Persian layout, zero em dashes | ✅ Applied |
| `CHANGELOG.md` | Updated v1.2.0 release log with all features, vector transforms, and zero em dashes | ✅ Applied |
| `fonts/*.woff2` | 5 authentic variable fonts: Vazirmatn, Estedad, Sahel, Arad, Mikhak | ✅ Applied |
| `popup/popup.html` | Popover font picker, centered Star & Bug footer buttons, `<g>` vector groups | ✅ Applied |
| `popup/popup.css` | Vector `<g>` rotation, emerald master toggle, OpenAI monochrome toggle, drag engine | ✅ Applied |
| `popup/popup.js` | Popover interaction state, bilingual font badges, options dashboard trigger, draggable switches | ✅ Applied |
| `options/options.html` | Typography Studio with live sandbox, compact font cards, `<g>` grouped icons | ✅ Applied |
| `options/options.css` | Centered font cards, vector `<g>` rotation, emerald master toggle, OpenAI monochrome toggle | ✅ Applied |
| `options/options.js` | Dynamic font previewing, site toggles, theme/lang sync, XSS-safe DOM, Pointer Events drag engine | ✅ Applied |
| `background.js` | Added `font: "vazirmatn"` default preference, zero em dashes | ✅ Applied |
| `core/engine.js` | Parallel 5-font Base64 loading, dynamic `:root[data-rc-font="..."]` switching, RAF batching | ✅ Applied |
| `sites/*.js` | All 5 site configs updated with 5-font declarations, `--rc-font` variable theming | ✅ Applied |
| `icons/*.svg` | Added standalone SVG assets with authentic brand colors and responsive OpenAI monochrome | ✅ Applied |
| `icons/solar/*` | Added clean Solar Icon Set vector assets for theme modes and security badges | ✅ Applied |


