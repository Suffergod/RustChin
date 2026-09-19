/* ============================================================
   RustChin: Microsoft Copilot site config
   Persian numbering for RTL ordered lists; code/math stay LTR.
   ============================================================ */

RustChin.start({
  siteId: "copilot",
  host: "copilot.microsoft.com",
  containers:
    "main, [data-content='user-message'], [data-content='ai-message'], .prose, [class*='prose']:not([class*='not-prose']):not(pre):not(code), .markdown, [class*='message' i], [class*='content' i], [data-testid*='message']",
  extraSelector:
    "[class*='title' i], [class*='history' i] span, [class*='thread' i] span, nav a span",
  exclude:
    "pre, code, .katex, .math, [class*='math' i], [class*='not-prose']",
  editableSelector:
    'textarea, input, #userInput, [contenteditable="true"]',
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
      --rc-font: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --rc-font-size: 15px;
      --rc-line-height: 1.8;
    }
    :root[data-rc-font="estedad"] {
      --rc-font: 'Estedad', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root[data-rc-font="sahel"] {
      --rc-font: 'Sahel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root[data-rc-font="arad"] {
      --rc-font: 'Arad', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root[data-rc-font="mikhak"] {
      --rc-font: 'Mikhak', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    :root[data-rc-font="custom"] {
      --rc-font: var(--rc-custom-font, 'Vazirmatn'), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

    .bidi-scope pre,
    .bidi-scope pre *,
    pre,
    pre code {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      text-align: left !important;
    }

    .bidi-scope code:not(pre code),
    .bidi-scope .katex,
    .bidi-scope .math,
    .bidi-scope [class*='math' i] {
      direction: ltr !important;
      unicode-bidi: isolate !important;
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

    .bidi-scope blockquote[dir="rtl"],
    blockquote.rc-done[dir="rtl"] {
      border-inline-start: 4px solid rgba(150,150,150,0.5) !important;
      border-inline-end: none !important;
      padding-inline-start: 16px !important;
      padding-inline-end: 0 !important;
      direction: rtl !important;
      text-align: right !important;
    }

    ol[dir="rtl"] {
      list-style-type: persian !important;
    }
  `,
});
