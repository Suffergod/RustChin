/* ============================================================
   RustChin — Gemini site config
   Gemini uses web components (custom elements). Layout-safe:
   we never flip the container itself, only its inner text tags.
   ============================================================ */

RustChin.start({
  siteId: "gemini",
  host: "gemini.google.com",
  containers:
    "message-content, user-query, .model-response-text, side-panel .markdown, side-panel .model-response-text, [class*='side-panel' i] .markdown, [class*='side-panel' i] .model-response-text, [class*='panel' i] .markdown, [class*='panel' i] .model-response-text",
  exclude:
    "pre, code, .katex, .math, [class*='math' i], mat-icon, gem-icon, code-block",
  editableSelector:
    'textarea, input, [contenteditable="true"], rich-textarea',
  numberedLists: false,
  // Sidebar chat-title text and opened side-panel direct text nodes.
  // getDirection() only flips Persian text, so English labels are left untouched.
  extraSelector:
    ".title-text, side-panel .title-text, side-panel [class*='title' i], [class*='side-panel' i] .title-text, [class*='side-panel' i] [class*='title' i], [class*='panel' i] .title-text",
  css: `
    @font-face {
      font-family: 'Vazirmatn';
      src: url({{FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      /* Only Persian/Arabic code points use this font. Latin letters,
         digits, punctuation, code, etc. fall through to the next font in
         the stack below automatically, per character, even mid-sentence. */
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    /* Apply Vazirmatn only to text that RustChin actually detected as RTL.
       This preserves Gemini's original Latin/UI typography — including
       weight/optical rendering — so English text no longer looks bolder or
       bigger after enabling. A second arm catches RTL-detected text outside
       any .bidi-scope (e.g. sidebar conversation titles), which the engine
       fixes via extraSelector and would otherwise keep Gemini's Latin font. */
    .bidi-scope .rc-done[dir="rtl"]:not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .bidi-scope .rc-done[dir="rtl"] :not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done[dir="rtl"]:not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done[dir="rtl"] :not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math) {
      font-family: 'Vazirmatn', 'Google Sans', system-ui, sans-serif !important;
    }
    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for Vazirmatn. */
    .rc-input[dir="rtl"] {
      font-family: 'Vazirmatn', 'Google Sans', system-ui, sans-serif !important;
    }

    /* Sidebar conversation titles: the engine sets dir/text-align on the
       title span, but Material's LTR list layout can keep inline text from
       visually moving. Make only processed Persian titles occupy the line. */
    gem-nav-list-item[data-test-id="conversation"] a[aria-label] span.title-text.rc-done[dir="rtl"] {
      display: block !important;
      width: 100% !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      text-align: right !important;
    }

    .bidi-scope pre, .bidi-scope code, .bidi-scope pre code, .code-block,
    .bidi-scope pre *, .bidi-scope code * {
      direction: ltr !important;
    }
    /* Math (.katex/math) is already excluded from the global rule above.
       Do NOT override its font-family — KaTeX picks its own size variants
       per symbol; forcing one font breaks large operators like ∫. */
    .bidi-scope :not(pre) > code {
      unicode-bidi: isolate !important;
      direction: ltr !important;
    }

    .bidi-scope p.rc-done[dir="rtl"],
    .bidi-scope li.rc-done[dir="rtl"],
    .bidi-scope h1.rc-done[dir="rtl"],
    .bidi-scope h2.rc-done[dir="rtl"],
    .bidi-scope h3.rc-done[dir="rtl"],
    .bidi-scope blockquote.rc-done[dir="rtl"],
    .bidi-scope td.rc-done[dir="rtl"],
    .bidi-scope th.rc-done[dir="rtl"] {
      line-height: 1.65 !important;
    }

    .bidi-scope blockquote {
      border-left: none !important;
      border-right: none !important;
      border-inline-start: 4px solid rgba(150,150,150,0.5) !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-inline-start: 16px !important;
      margin-inline-start: 0 !important;
    }

    .bidi-scope ul, .bidi-scope ol {
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-inline-start: 1.5em !important;
    }

    .bidi-scope th, .bidi-scope td {
      padding: 8px 12px !important;
      border: 1px solid rgba(150,150,150,0.3) !important;
    }
  `,
});
