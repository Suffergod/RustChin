/* ============================================================
   RustChin — ChatGPT site config
   Persian numbering for RTL ordered lists; code/math stay LTR.
   ============================================================ */

RustChin.start({
  siteId: "chatgpt",
  host: "chatgpt.com",
  containers: ".markdown, .message-content, [data-message-author-role='user'], #prompt-textarea, nav a, nav li, nav div, [data-testid^='history-item']",
  exclude: "pre, code, .katex, .math, [class*='math' i]",
  editableSelector:
    'textarea, input, [contenteditable="true"]',
  numberedLists: true,
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

    /* Persian text uses Vazirmatn; everything else falls through per-char.
       Scoped to RTL-detected text only so English paragraphs, headings, and
       the ✔ glyph keep ChatGPT's native font. Excludes pre/code (monospace,
       including their descendants) and .katex/math (math symbols) so they
       keep their own fonts. KaTeX needs its OWN CSS to pick the right size
       variant per symbol (KaTeX_Main, KaTeX_Size1 for large operators like
       ∫, etc.) — overriding it to one font breaks integrals. */
    .bidi-scope .rc-done:not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math),
    .bidi-scope .rc-done :not(pre):not(code):not(pre *):not(code *):not(.katex):not(.katex *):not(math):not(.math) {
      font-family: 'Vazirmatn', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
    }
    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for Vazirmatn. */
    .rc-input[dir="rtl"] {
      font-family: 'Vazirmatn', ui-sans-serif, system-ui, -apple-system, sans-serif !important;
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
       starting with a bold English word ("HTML این ..." ) got misread as an
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
    .bidi-scope button[aria-label="Copy table"] {
      position: relative !important;
      z-index: 20 !important;
    }
  `,
});
