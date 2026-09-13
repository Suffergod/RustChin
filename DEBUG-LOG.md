# RustChin — Debugging Log

This document tracks debugging sessions, root causes, and fixes for future reference.

---

## 2026-07-07 — Session 1: Vazirmatn Font, Copy Table Button

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

## 2026-07-07 — Session 2: Backtick Template Literal Bug (Critical)

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

## 2026-09-13 — Session 3: ChatGPT Comprehensive Overhaul, CWS Updates & Multi-Font Preparation

### Issue 4: Sent prompt text not getting Vazirmatn & RTL (Resolved)

**Symptom:** User's own sent messages in ChatGPT had Persian text without Vazirmatn font and without RTL direction.

**Root cause:** ChatGPT renders user sent messages with a plain `<div>` wrapper containing text directly (`.whitespace-pre-wrap`) — no `<p>`, `<h1>`, or other `LEAF_TAG` inside. The engine's `processContainer()` only scanned `LEAF_TAGS` (`p, h1-h6, li, blockquote, td, th`). The text-bearing `<div>` was completely skipped.

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

## Summary of All Changes

| File | Change | Status |
|------|--------|--------|
| `manifest.json` | Name updated to `RustChin: RTL & Persian Fonts`, version `1.2.0` | ✅ Applied |
| `README.md` | Version badge updated to `1.2.0` | ✅ Applied |
| `popup/popup.html` | Removed ❤️ donate link | ✅ Applied |
| `popup/popup.js` | Removed donate URL, connected official Web Store URL, `STORE_URL_KNOWN = true` | ✅ Applied |
| `sites/chatgpt.js` | Removed `[dir="rtl"]` from Vazirmatn selectors | ✅ Applied |
| `sites/chatgpt.js` | Added `extraSelector` for user messages & sidebar titles | ✅ Applied |
| `sites/chatgpt.js` | Optimized `containers` (removed redundant `nav div`) | ✅ Applied |
| `sites/chatgpt.js` | Added `.bidi-scope table[dir="rtl"]` explicit RTL rule | ✅ Applied |
| `sites/chatgpt.js` | Copy-table button: `div:first-child` → `div:has(button)` + RTL override | ✅ Applied |
| `sites/chatgpt.js` | Fixed backtick in comment breaking template literal | ✅ Applied |
| `core/engine.js` | Added text-bearing child div scan in `processContainer()` (user messages) | ✅ Applied |
| `core/engine.js` | Added table/ol `dir` cleanup in `stop()` | ✅ Applied |
| `core/engine.js` | Added incremental mutation handling in `scanNodes()` for existing containers | ✅ Applied |
| `sites/claude.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending next |
| `sites/gemini.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending next |
| `sites/deepseek.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending next |
