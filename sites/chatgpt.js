/* ============================================================
   RustChin: ChatGPT site config
   Persian numbering for RTL ordered lists; code/math stay LTR.
   ============================================================ */

RustChin.start({
  siteId: "chatgpt",
  host: "chatgpt.com",
  containers:
    ".markdown, .message-content, [data-message-author-role='user'], nav a, nav li, [data-testid^='history-item']",
  extraSelector:
    "[data-message-author-role='user'] [class*='whitespace-pre-wrap'], nav a span, [data-testid^='history-item'] span",
  exclude:
    "pre, code, .katex, .math, [class*='math' i], [contenteditable='true'], .ProseMirror",
  editableSelector:
    'textarea, input, [contenteditable="true"], [contenteditable=""], #prompt-textarea, .ProseMirror',
  numberedLists: true,
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
      --rc-font: 'Vazirmatn', ui-sans-serif, system-ui, -apple-system, sans-serif;
      --rc-font-size: 15px;
      --rc-line-height: 1.8;
    }
    :root[data-rc-font="estedad"] {
      --rc-font: 'Estedad', ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    :root[data-rc-font="sahel"] {
      --rc-font: 'Sahel', ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    :root[data-rc-font="arad"] {
      --rc-font: 'Arad', ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    :root[data-rc-font="mikhak"] {
      --rc-font: 'Mikhak', ui-sans-serif, system-ui, -apple-system, sans-serif;
    }

    /* Persian text uses active font (--rc-font); everything else falls through per-char.
       Scoped to RTL-detected text only so English paragraphs, headings, and
       the check glyph keep ChatGPT's native font. Excludes pre/code (monospace,
       including their descendants) and .katex/math (math symbols) so they
       keep their own fonts. */
    .bidi-scope .rc-done:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math),
    .bidi-scope .rc-done :not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math) {
      font-family: var(--rc-font) !important;
    }

    /* Typography metrics for RTL content */
    .bidi-scope .rc-done p:not(pre *):not(code *),
    .bidi-scope .rc-done li:not(pre *):not(code *),
    .bidi-scope .rc-done blockquote:not(pre *):not(code *),
    .bidi-scope .rc-done th:not(pre *):not(code *),
    .bidi-scope .rc-done td:not(pre *):not(code *),
    .bidi-scope p.rc-done:not(pre *):not(code *),
    .bidi-scope li.rc-done:not(pre *):not(code *),
    .bidi-scope blockquote.rc-done:not(pre *):not(code *),
    [data-message-author-role='user'] [class*='whitespace-pre-wrap'][dir="rtl"] {
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
    }
    .bidi-scope .rc-done h1:not(pre *):not(code *), .bidi-scope h1.rc-done:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.55) !important;
      line-height: 1.35 !important;
    }
    .bidi-scope .rc-done h2:not(pre *):not(code *), .bidi-scope h2.rc-done:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.35) !important;
      line-height: 1.4 !important;
    }
    .bidi-scope .rc-done h3:not(pre *):not(code *), .bidi-scope h3.rc-done:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.2) !important;
      line-height: 1.45 !important;
    }

    /* User sent messages */
    [data-message-author-role='user'] [class*='whitespace-pre-wrap'][dir="rtl"] {
      font-family: var(--rc-font) !important;
    }

    /* Prompt/textarea and Canvas/ProseMirror: Pure CSS styling avoids mutating editor DOM */
    .rc-input[dir="rtl"],
    .rc-input[dir="rtl"] *,
    .ProseMirror[dir="rtl"],
    .ProseMirror[dir="rtl"] *:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math),
    [contenteditable="true"][dir="rtl"],
    [contenteditable="true"][dir="rtl"] *:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math),
    .writing-block-surface [dir="rtl"],
    .writing-block-surface [dir="rtl"] *:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math) {
      font-family: var(--rc-font) !important;
    }
    .rc-input[dir="rtl"],
    .ProseMirror[dir="rtl"],
    [contenteditable="true"][dir="rtl"],
    .writing-block-surface [dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
    }

    /* Ensure tables inside Canvas / ProseMirror render RTL without DOM fighting */
    .writing-block-surface table,
    .ProseMirror table {
      margin-top: 0.5rem;
    }
    .writing-block-surface table[dir="rtl"],
    .ProseMirror table[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }
    .writing-block-surface table[dir="rtl"] th,
    .writing-block-surface table[dir="rtl"] td,
    .ProseMirror table[dir="rtl"] th,
    .ProseMirror table[dir="rtl"] td {
      font-family: var(--rc-font) !important;
      text-align: right !important;
    }
    /* Code blocks + their descendants: keep ChatGPT's original monospace
       font and LTR direction. The :not(pre *)/:not(code *) guards above
       stop the Vazirmatn rule from reaching spans/br inside code, and this
       rule positively restores the monospace stack on every descendant. */
    .bidi-scope pre, .bidi-scope code,
    .bidi-scope pre *, .bidi-scope code * {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }

    /* Persian numbering only for RTL ordered lists; leave <ul> as disc. */
    .bidi-scope ol[dir="rtl"] { list-style-type: persian !important; }
    .bidi-scope ul { list-style-type: disc !important; }

    /* unicode-bidi: isolate lets the dir="rtl"/dir="ltr" attribute we set in
       JS (getDirection, based on actual character counts) decide the order.
       The previous "direction: auto" + "unicode-bidi: plaintext" combo
       re-detected direction from the FIRST character instead, so a sentence
       starting with a bold English word ('HTML این ...' ) got misread as an
       LTR paragraph and the English word was pushed to the end. */
    .bidi-scope p, .bidi-scope li, .bidi-scope blockquote {
      unicode-bidi: isolate !important;
      text-align: start !important;
    }
    .bidi-scope pre, .bidi-scope code {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }

    /* Copy-table button: the toolbar uses 'absolute end-0' (a Tailwind
       utility mapping to the CSS logical property inset-inline-end:0).
       In LTR, end-0 resolves to right:0; in RTL, to left:0. For RTL
       tables we want the button on the left (start) side, so we set
       direction:rtl on the toolbar container. For LTR tables the
       default direction:ltr is correct. */
    .bidi-scope div:has(> table) > div:has(button) {
      direction: ltr !important;
    }
    .bidi-scope div:has(> table[dir="rtl"]) > div:has(button) {
      direction: rtl !important;
    }
    .bidi-scope table {
      margin-top: 0.5rem;
    }
    .bidi-scope table[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }
    .bidi-scope button[aria-label="Copy table"] {
      position: relative !important;
      z-index: 20 !important;
    }
  `,
});
