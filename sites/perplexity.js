/* ============================================================
   RustChin: Perplexity AI site config
   Persian numbering for RTL ordered lists; code/math stay LTR.
   ============================================================ */

RustChin.start({
  siteId: "perplexity",
  host: "perplexity.ai",
  containers:
    "main, .prose, [class*='prose'], [class*='text-content'], [class*='query'], [class*='answer'], [data-testid*='thread'], [class*='wrapper']",
  extraSelector:
    "#ask-input, [id='ask-input'], [class*='title' i], [class*='history' i] span, nav a span",
  exclude:
    "pre, code, .katex, .math, [class*='math' i]",
  editableSelector:
    'textarea, input, [contenteditable="true"], #ask-input, [id="ask-input"]',
  numberedLists: true,
  css: `
    @font-face {
      font-family: 'Vazirmatn';
      src: url({{VAZIR_FONT}}) format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
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
    :root[data-rc-font="custom"] {
      --rc-font: var(--rc-custom-font, 'Vazirmatn'), ui-sans-serif, system-ui, -apple-system, sans-serif;
    }

    .bidi-scope .rc-done:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math),
    .bidi-scope .rc-done :not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math) {
      font-family: var(--rc-font) !important;
    }

    .bidi-scope .rc-done p:not(pre *):not(code *),
    .bidi-scope .rc-done li:not(pre *):not(code *),
    .bidi-scope .rc-done blockquote:not(pre *):not(code *),
    .bidi-scope .rc-done th:not(pre *):not(code *),
    .bidi-scope .rc-done td:not(pre *):not(code *),
    .bidi-scope p.rc-done:not(pre *):not(code *),
    .bidi-scope li.rc-done:not(pre *):not(code *),
    .bidi-scope blockquote.rc-done:not(pre *):not(code *) {
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

    .rc-input[dir="rtl"] {
      font-family: var(--rc-font) !important;
      font-size: var(--rc-font-size) !important;
      line-height: var(--rc-line-height) !important;
      text-align: right !important;
      direction: rtl !important;
    }

    .bidi-scope code:not(pre code) {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      display: inline-block;
    }

    ol[dir="rtl"] {
      list-style-type: persian !important;
    }
  `,
});
