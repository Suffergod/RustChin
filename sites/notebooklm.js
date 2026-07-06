/* ============================================================
   RustChin — NotebookLM site config
   Most layout-invasive target. Uses whole-body scanning and a
   "6-ancestor expansion" to break NotebookLM's RTL width walls,
   with a 12px sidebar gutter for RTL messages.
   ============================================================ */

RustChin.start({
  siteId: "notebooklm",
  host: "notebooklm.google.com",
  // NotebookLM has no clean message-root selector, so we scan the body.
  scanBody: true,
  scanSelector:
    "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, span.ng-star-inserted, b, strong, em, i",
  // Broad exclusion list: NotebookLM's UI chrome must NOT get flipped.
  exclude:
    "button, nav, header, footer, [role='toolbar'], pre, code, .katex, .math, mat-icon, svg, [class*='icon' i]",
  editableSelector:
    'textarea, input, [contenteditable="true"]',
  numberedLists: true,
  fixMode: "notebooklm",
  css: `
    @font-face {
      font-family: 'Vazirmatn';
      src: url({{FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    /* Global font, excluding icons, code and math. */
    body *:not(mat-icon):not([class*="icon" i]):not([class*="symbol" i]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math) {
      font-family: 'Vazirmatn', 'Google Sans', 'IRANSans', sans-serif !important;
    }

    pre, code, pre *, code * {
      font-family: Consolas, Monaco, 'Courier New', monospace !important;
      direction: ltr !important;
    }
    /* Math (.katex/math) is already excluded from the global rule above.
       Do NOT override its font-family — KaTeX picks its own size variants
       per symbol; forcing one font breaks large operators like ∫. */

    p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th {
      line-height: 1.8 !important;
    }

    /* The paragraph wrapper (div.paragraph) is not in the scan list, so it
       stays LTR even when all its inner RTL spans get dir="rtl". Without
       this, an inline bold Persian phrase between two RTL spans would sit
       at the LEFT edge of its own line because the parent's inline flow is
       still LTR. Flip any paragraph div that contains an RTL-detected child
       to RTL so the inline flow runs right-to-left, putting bold words at
       the start (right) of the line beside their preceding span. Uses :has()
       (Chrome 112+, fine for our MV3 Chrome-only target). */
    div.paragraph:has(> .rc-done[dir="rtl"]) {
      direction: rtl !important;
      text-align: right !important;
    }

    /* Break RTL width walls on up to 6 ancestor layers. */
    .bidi-expanded-wrapper {
      max-width: 100% !important;
      width: 100% !important;
      padding-right: 0 !important;
    }

    /* RTL message box: 12px gutter from the sidebar. Uses a fixed
       inline-end margin instead of "margin-left: auto" -- an auto margin
       absorbs any leftover flex/grid space, which is exactly what created
       the stray empty gap after removing NotebookLM's own side panel. */
    .bidi-rtl-message {
      width: calc(100% - 12px) !important;
      max-width: calc(100% - 12px) !important;
      margin-inline-end: 12px !important;
      margin-inline-start: 0 !important;
      box-sizing: border-box !important;
    }
    .bidi-rtl-message .to-user-message-card-content,
    .bidi-rtl-message .to-user-message-inner-content,
    .bidi-rtl-message .from-user-message-content,
    .bidi-rtl-message .message-text-content,
    .bidi-rtl-message [class*="message-text"],
    .bidi-rtl-message [class*="message-content"],
    .bidi-rtl-message [class*="response"],
    .bidi-rtl-message labs-tailwind-doc-viewer,
    .bidi-rtl-message element-list-renderer,
    .bidi-rtl-message mat-card {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    blockquote {
      border-inline-start: 4px solid rgba(150,150,150,0.5) !important;
      padding-inline-start: 16px !important;
      border-left: none !important;
      border-right: none !important;
    }

    /* Persian numbering for RTL ordered lists. */
    ol.bidi-scope-list[dir="rtl"],
    ol.bidi-scope-list[dir="rtl"] li {
      list-style-type: persian !important;
    }
    ul.bidi-scope-list {
      list-style-type: disc !important;
    }
  `,
});
