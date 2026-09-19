/* ============================================================
   RustChin: Claude site config
   Applies Vazirmatn globally while protecting Claude's custom
   icon font (Anthropicons) and routing code to monospace.
   ============================================================ */

RustChin.start({
  siteId: "claude",
  host: "claude.ai",
  containers:
    "[class*='font-claude' i], [class*='font-user' i], [class*='message-content' i], [class*='user-message'], [class*='bg-user-message'], .cds-user-message-body, [data-testid*='user-message'], [data-user-message-bubble], .standard-markdown, [class*='standard-markdown'], .prose, [class*='prose']:not([class*='not-prose']):not(pre):not(code)",
  // Conversation title text only. Direction is still content-detected, so
  // English Claude titles stay LTR while Persian titles become RTL.
  extraSelector:
    "a[href*='/chat/'] [class*='truncate' i], a[href*='/chat/'] [class*='line-clamp' i], a[href*='/chat/'] [title], nav a[href*='/chat/'] span",
  exclude:
    'pre, code, .katex, .math, [class*="math" i], svg, [data-cds="Icon"]',
  editableSelector:
    'textarea, input, [contenteditable="true"], .ProseMirror',
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
      --rc-font: 'Vazirmatn', 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
      --rc-font-size: 15px;
      --rc-line-height: 1.8;
    }
    :root[data-rc-font="estedad"] {
      --rc-font: 'Estedad', 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
    }
    :root[data-rc-font="sahel"] {
      --rc-font: 'Sahel', 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
    }
    :root[data-rc-font="arad"] {
      --rc-font: 'Arad', 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
    }
    :root[data-rc-font="mikhak"] {
      --rc-font: 'Mikhak', 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
    }
    :root[data-rc-font="custom"] {
      --rc-font: var(--rc-custom-font, 'Vazirmatn'), 'Söhne', 'ui-sans-serif', system-ui, sans-serif;
    }

    .bidi-scope code:not(pre code) {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      display: inline-block;
    }

    /* Active font only on RTL-detected text. English paragraphs, headings, UI
       chrome, and sidebar titles keep Claude's native font ('Söhne' / system).
       Preserves Claude's icon font (Anthropicons), code, and math. */
    .rc-done[dir="rtl"]:not(svg):not(code):not(pre):not(pre *):not(code *):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done[dir="rtl"] :not(svg):not(code):not(pre):not(pre *):not(code *):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math),
    .bidi-scope [dir="rtl"]:not(svg):not(code):not(pre):not(pre *):not(code *):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math),
    .bidi-scope [dir="rtl"] :not(svg):not(code):not(pre):not(pre *):not(code *):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math) {
      font-family: var(--rc-font) !important;
    }

    .bidi-scope [dir="rtl"],
    .rc-done[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }

    /* Typography metrics for RTL content */
    .bidi-scope p:not(pre *):not(code *),
    .bidi-scope li:not(pre *):not(code *),
    .bidi-scope blockquote:not(pre *):not(code *),
    .bidi-scope td:not(pre *):not(code *),
    .bidi-scope th:not(pre *):not(code *),
    .bidi-scope div[dir="rtl"]:not(pre *):not(code *),
    .rc-done[dir="rtl"]:not(pre *):not(code *),
    .rc-input[dir="rtl"] {
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
    }
    .bidi-scope h1:not(pre *):not(code *), h1.rc-done[dir="rtl"]:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.55) !important;
      line-height: 1.35 !important;
    }
    .bidi-scope h2:not(pre *):not(code *), h2.rc-done[dir="rtl"]:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.35) !important;
      line-height: 1.4 !important;
    }
    .bidi-scope h3:not(pre *):not(code *), h3.rc-done[dir="rtl"]:not(pre *):not(code *) {
      font-size: calc(var(--rc-font-size) * 1.2) !important;
      line-height: 1.45 !important;
    }

    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for active font. */
    .rc-input[dir="rtl"] {
      font-family: var(--rc-font) !important;
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
      direction: rtl !important;
      text-align: right !important;
    }
    [data-cds="Icon"], [data-cds="Icon"] * {
      font-family: var(--font-anthropicons, Anthropicons-Variable) !important;
    }

    .bidi-scope pre, .bidi-scope code, .bidi-scope pre code, .code-block,
    .bidi-scope pre *, .bidi-scope code * {
      font-family: Consolas, Monaco, 'Courier New', monospace !important;
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: left !important;
    }

    .bidi-scope .katex,
    .bidi-scope .math,
    .bidi-scope [class*='math' i],
    .bidi-scope code:not(pre code) {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      display: inline-block;
    }
    /* Math (.katex/math) is already excluded above. Do NOT override its
       font-family here: KaTeX picks its own size variants per symbol
       (KaTeX_Main, KaTeX_Size1 for large operators like ∫), and forcing
       one font breaks integrals. */
    .bidi-scope :not(pre) > code {
      unicode-bidi: isolate !important;
      direction: ltr !important;
      background-color: rgba(150, 150, 150, 0.15) !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      display: inline-block;
    }

    .bidi-scope blockquote[dir="rtl"],
    blockquote.rc-done[dir="rtl"],
    .bidi-scope blockquote {
      border-inline-start: 4px solid rgba(150,150,150,0.5) !important;
      border-inline-end: none !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-inline-start: 16px !important;
      margin-inline-start: 0 !important;
      direction: rtl !important;
      text-align: right !important;
    }

    .bidi-scope ul, .bidi-scope ol {
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-inline-start: 1.5em !important;
    }

    /* Persian numbering for RTL ordered lists. */
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
    .bidi-scope ul[dir="rtl"] li,
    ul.bidi-scope-list[dir="rtl"] li,
    ul[dir="rtl"] li {
      direction: rtl !important;
      text-align: right !important;
    }

    .bidi-scope table[dir="rtl"],
    table[dir="rtl"] {
      direction: rtl !important;
      text-align: right !important;
    }

    /* Fix Claude's RTL padding bug on pl-* utility classes. */
    .bidi-scope[dir="rtl"][class*="pl-"],
    .bidi-scope[dir="rtl"] [class*="pl-"],
    .bidi-scope [dir="rtl"][class*="pl-"],
    .bidi-scope [dir="rtl"] [class*="pl-"] {
      padding-left: 0 !important;
      padding-right: 0.5rem !important;
    }

    .bidi-scope th, .bidi-scope td {
      padding: 8px 12px !important;
      border: 1px solid rgba(150,150,150,0.3) !important;
    }
  `,
});
