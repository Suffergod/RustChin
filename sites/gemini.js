/* ============================================================
   RustChin: Gemini site config
   Gemini uses web components (custom elements). Layout-safe:
   we never flip the container itself, only its inner text tags.
   ============================================================ */

RustChin.start({
  siteId: "gemini",
  host: "gemini.google.com",
  containers:
    "message-content, user-query, .model-response-text, .response-container, [class*='response'], [class*='query'], side-panel .markdown, side-panel .model-response-text, [class*='side-panel' i] .markdown, [class*='side-panel' i] .model-response-text, [class*='panel' i] .markdown, [class*='panel' i] .model-response-text",
  exclude:
    "pre, code, .katex, .math, [class*='math' i], mat-icon, gem-icon, code-block, user-query-file-preview, user-query-file-carousel, [class*='file-preview'], [class*='file-carousel'], inline-preview, [class*='inline-preview'], immersive-entry-chip, gem-processing-card, [class*='attachment-container'], .inline-preview-container",
  editableSelector:
    'textarea, input, [contenteditable="true"], rich-textarea',
  // Sidebar chat-title text and opened side-panel direct text nodes.
  // getDirection() only flips Persian text, so English labels are left untouched.
  extraSelector:
    ".title-text, side-panel .title-text, side-panel [class*='title' i], [class*='side-panel' i] .title-text, [class*='side-panel' i] [class*='title' i], [class*='panel' i] .title-text",
  css: `
    @font-face {
      font-family: 'Vazirmatn';
      src: url({{VAZIR_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      /* Only Persian/Arabic code points use this font. Latin letters,
         digits, punctuation, code, etc. fall through to the next font in
         the stack below automatically, per character, even mid-sentence. */
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    @font-face {
      font-family: 'Estedad';
      src: url({{ESTEDAD_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    @font-face {
      font-family: 'Sahel';
      src: url({{SAHEL_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    @font-face {
      font-family: 'Arad';
      src: url({{ARAD_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    @font-face {
      font-family: 'Mikhak';
      src: url({{MIKHAK_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF,
        U+FE70-FEFF, U+200C-200F;
    }

    :root {
      --rc-font: 'Vazirmatn', 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
      --rc-font-size: 15px;
      --rc-line-height: 1.8;
    }
    :root[data-rc-font="estedad"] {
      --rc-font: 'Estedad', 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
    }
    :root[data-rc-font="sahel"] {
      --rc-font: 'Sahel', 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
    }
    :root[data-rc-font="arad"] {
      --rc-font: 'Arad', 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
    }
    :root[data-rc-font="mikhak"] {
      --rc-font: 'Mikhak', 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
    }
    :root[data-rc-font="custom"] {
      --rc-font: var(--rc-custom-font, 'Vazirmatn'), 'Google Sans Flex', 'Google Sans', system-ui, sans-serif;
    }

    .bidi-scope code:not(pre code) {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      display: inline-block;
    }

    /* Apply active font (--rc-font) to all processed content.
       Since Vazirmatn/Estedad define unicode-range strictly for Persian/Arabic
       code points (U+0600-06FF, etc.), Latin characters naturally fall through
       to Google Sans Flex without distorting English typography. */
    .bidi-scope .rc-done:not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .bidi-scope .rc-done :not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done:not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done :not(mat-icon):not(gem-icon):not(.mat-icon):not([class*="icon"]):not([class*="symbol"]):not(svg):not(i):not(code):not(pre):not(.katex):not(.katex *):not(.math):not(math) {
      font-family: var(--rc-font) !important;
    }

    /* Typography metrics for RTL content */
    .bidi-scope p.rc-done[dir="rtl"],
    .bidi-scope li.rc-done[dir="rtl"],
    .bidi-scope blockquote.rc-done[dir="rtl"],
    .bidi-scope td.rc-done[dir="rtl"],
    .bidi-scope th.rc-done[dir="rtl"],
    .rc-input[dir="rtl"] {
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
    }
    .bidi-scope h1.rc-done[dir="rtl"] {
      font-size: calc(var(--rc-font-size) * 1.55) !important;
      line-height: 1.35 !important;
    }
    .bidi-scope h2.rc-done[dir="rtl"] {
      font-size: calc(var(--rc-font-size) * 1.35) !important;
      line-height: 1.4 !important;
    }
    .bidi-scope h3.rc-done[dir="rtl"] {
      font-size: calc(var(--rc-font-size) * 1.2) !important;
      line-height: 1.45 !important;
    }

    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for active font. */
    .rc-input[dir="rtl"],
    .rc-input[dir="rtl"] *,
    rich-textarea[dir="rtl"],
    rich-textarea[dir="rtl"] *,
    .ql-editor[dir="rtl"],
    .ql-editor[dir="rtl"] * {
      font-family: var(--rc-font) !important;
    }
    .rc-input[dir="rtl"],
    rich-textarea[dir="rtl"],
    .ql-editor[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
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
       Do NOT override its font-family: KaTeX picks its own size variants
       per symbol; forcing one font breaks large operators like ∫. */
    .bidi-scope :not(pre) > code,
    .bidi-scope .katex,
    .bidi-scope .math,
    .bidi-scope [class*='math' i] {
      unicode-bidi: isolate !important;
      direction: ltr !important;
      display: inline-block;
    }

    .bidi-scope [dir="rtl"],
    .rc-done[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }

    .bidi-scope ol[dir="rtl"],
    ol.bidi-scope-list[dir="rtl"],
    ol[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
      list-style-type: persian !important;
    }
    .bidi-scope ol[dir="rtl"] li,
    ol.bidi-scope-list[dir="rtl"] li,
    ol[dir="rtl"] li {
      direction: rtl !important;
      text-align: right !important;
      list-style-type: persian !important;
    }
    .bidi-scope ul[dir="rtl"],
    ul.bidi-scope-list[dir="rtl"],
    ul[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }

    /* Gemini numbered list counter isolation:
       For LTR lists, keep LTR isolate so Latin digits (.2 -> 2.) don't invert.
       For RTL lists, keep RTL and anchor right so inset-inline-start:0 stays at right:0 */
    .bidi-scope ol:not([dir="rtl"]) li::before,
    .bidi-scope ol li:not([dir="rtl"])::before {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    .bidi-scope ol[dir="rtl"] li::before,
    .bidi-scope ol.bidi-scope-list[dir="rtl"] li::before,
    .bidi-scope ol li.rc-done[dir="rtl"]::before {
      direction: rtl !important;
      inset-inline-start: 0 !important;
      right: 0 !important;
      left: auto !important;
      text-align: right !important;
    }

    /* Gemini Canvas (interactive preview cards): keep toolbar, flex headers, and buttons LTR */
    .inline-preview-container,
    .inline-preview-container .title-container,
    immersive-entry-chip,
    inline-preview,
    gem-processing-card,
    [class*='attachment-container']:has(inline-preview),
    response-element:has(inline-preview) {
      direction: ltr !important;
      text-align: left !important;
    }

    /* Gemini Canvas document editor (ProseMirror): dynamically resolve paragraph direction
       and apply active font without mutating the editable DOM tree, preventing inverted punctuation (. : etc.) */
    .immersive-editor .ProseMirror,
    .immersive-editor .ProseMirror p,
    .immersive-editor .ProseMirror h1,
    .immersive-editor .ProseMirror h2,
    .immersive-editor .ProseMirror h3,
    .immersive-editor .ProseMirror li {
      font-family: var(--rc-font) !important;
      unicode-bidi: plaintext !important;
    }

    /* Gemini blockquotes: keep native dotted ::before border and centered margins intact.
       Only apply direction and alignment to content based on detected direction. */
    .bidi-scope blockquote.rc-done[dir="rtl"],
    blockquote.rc-done[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }
    .bidi-scope blockquote.rc-done[dir="ltr"],
    blockquote.rc-done[dir="ltr"] {
      direction: ltr !important;
      text-align: left !important;
    }

    /* Keep file upload previews and carousels strictly LTR */
    user-query-file-preview,
    user-query-file-carousel,
    [class*='file-preview'],
    [class*='file-carousel'] {
      direction: ltr !important;
      text-align: left !important;
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
