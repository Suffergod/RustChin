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

## 2026-07-07 — Pending Issues (Not Yet Fixed)

### Issue 4: Sent prompt text not getting Vazirmatn/RTL

**Symptom:** User's own sent messages in ChatGPT have Persian text without Vazirmatn font and without RTL direction.

**Root cause:** ChatGPT renders user sent messages with a plain `<div>` wrapper containing text directly — no `<p>`, `<h1>`, or other LEAF_TAG inside. The engine's `processContainer()` only processes LEAF_TAGS (`p, h1-h6, li, blockquote, td, th`). The text-bearing `<div>` is skipped.

**Proposed fix:** Add a scan in `processContainer()` for direct child elements that contain text but have no LEAF_TAG descendants.

**Status:** NOT YET APPLIED.

---

### Issue 5: RTL breaks after multiple toggles on/off

**Symptom:** After toggling the extension off and on a few times, RTL direction stops working.

**Root cause (suspected):** `processContainer()` sets `dir` on `<table>` and `<ol>` elements, but `stop()` doesn't clean up these attributes (no marker class is added to them).

**Proposed fix:** Add table/ol `dir` cleanup to `stop()`.

**Status:** NOT YET APPLIED.

---

## Summary of All Changes

| File | Change | Status |
|------|--------|--------|
| `popup/popup.html` | Added ❤️ donate link before Rate button | ✅ Applied |
| `popup/popup.js` | Added DONATE_URL constant and wired donateLink element | ✅ Applied |
| `sites/chatgpt.js` | Removed `[dir="rtl"]` from Vazirmatn selectors | ✅ Applied |
| `sites/chatgpt.js` | Copy-table button: `div:first-child` → `div:has(button)` + RTL override | ✅ Applied |
| `sites/chatgpt.js` | Fixed backtick in comment breaking template literal | ✅ Applied |
| `core/engine.js` | Add `:scope > *` scan in processContainer for text-bearing child divs | ⏳ Pending |
| `core/engine.js` | Add table/ol `dir` cleanup in stop() | ⏳ Pending |
| `sites/claude.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending |
| `sites/gemini.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending |
| `sites/deepseek.js` | Remove `[dir="rtl"]` from Vazirmatn selectors | ⏳ Pending |

---

## Key Architecture Notes

### Engine flow
1. `RustChin.start(config)` → creates engine → loads font as base64 data URL → replaces `{{FONT}}` in CSS → boots
2. `boot()` reads state from `chrome.storage.local` → calls `start()` or `stop()`
3. `start()` → injects CSS → defers `scanAll()` → creates MutationObserver → sets up 2s interval
4. `processContainer(container)` → adds `.bidi-scope` → processes LEAF_TAGS → sets dir on `<ol>` and `<table>`
5. `fixElement(el)` → counts RTL vs Latin chars → sets `dir` attribute → sets inline `text-align` → adds `.rc-done`

### Direction detection
- `getDirection(text)` counts RTL-script chars vs Latin chars
- RTL wins unless Latin dominates by >1.5x ratio
- Pure English → `"ltr"`, pure Persian → `"rtl"`, mixed → depends on ratio

### CSS injection
- `@font-face` with `unicode-range` ensures Vazirmatn only renders Persian/Arabic glyphs
- Latin characters automatically fall through to the next font in the stack
- Safe to apply Vazirmatn to all elements, not just RTL ones

### Logical properties (important for positioning)
- Tailwind's `end-0` maps to `inset-inline-end: 0` — a logical property
- In `direction: ltr`: resolves to `right: 0` (element on right)
- In `direction: rtl`: resolves to `left: 0` (element on left)
- To move copy-table button to left for RTL tables: set `direction: rtl` on the toolbar container

### stop() cleanup (current, incomplete)
1. Removes `.bidi-scope`, `.bidi-rtl-message`, `.bidi-expanded-wrapper`, `.bidi-scope-list` classes + `dir`
2. Removes `.rc-done` class + `dir` + inline styles from processed elements
3. Removes `.rc-input` class + `dir` + inline styles from input elements
4. **Missing:** `<table>` and `<ol>` `dir` attributes (no marker class)

### CRITICAL: Template literal safety
- NEVER use backticks (\`) inside JavaScript template literals (backtick strings)
- This includes comments — backticks in comments still close the template
- Use single quotes or double quotes in comments inside template literals
- A broken template literal causes a JavaScript error that prevents ALL CSS injection
