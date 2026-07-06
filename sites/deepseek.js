/* ============================================================
   RustChin — DeepSeek site config
   Widens the chat frame ~50% and applies Persian numbering.
   ============================================================ */

RustChin.start({
  siteId: "deepseek",
  host: "chat.deepseek.com",
  containers: ".ds-message, .ds-markdown",
  // Your own sent-prompt bubble is a plain <div> directly inside
  // .ds-message (no <p> tag), so it's invisible to the normal p/li/etc
  // scan. Sidebar/reasoning selectors are direct text targets only;
  // getDirection() keeps non-Persian UI untouched.
  extraSelector:
    ".ds-message > div, a[href^='/a/chat/s/'] div.c08e6e93, a[href^='/a/chat/s/'] > div:not(.ds-focus-ring):not([class*='button' i]):not([class*='icon' i]), [class*='conversation' i] [class*='title' i], [class*='chat' i] [class*='title' i], [class*='session' i] [class*='title' i], [class*='think' i], [class*='reason' i]",
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

    /* Apply Vazirmatn only to text that RustChin actually detected as RTL.
       This preserves DeepSeek's original Latin/UI typography. */
    .rc-done[dir="rtl"]:not(code):not(pre):not(.ds-icon):not(.ds-icon *):not(.katex):not(.katex *):not(.math):not(.math),
    .rc-done[dir="rtl"] :not(svg):not(code):not(pre):not(.ds-icon):not(.ds-icon *):not(.katex):not(.katex *):not(.math):not(.math) {
      font-family: 'Vazirmatn', system-ui, sans-serif !important;
    }
    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for Vazirmatn. */
    .rc-input[dir="rtl"] {
      font-family: 'Vazirmatn', system-ui, sans-serif !important;
    }

    /* Widen DeepSeek's chat frame (~50% larger). */
    :root {
      --message-list-max-width: 1200px !important;
    }

    /* DeepSeek chat-history titles. Keep this gated by rc-done+RTL so
       English titles and action/menu wrappers are not visually flipped. */
    a[href^="/a/chat/s/"] div.c08e6e93.rc-done[dir="rtl"],
    a[href^="/a/chat/s/"] > div.rc-done[dir="rtl"]:not(.ds-focus-ring):not([class*="button" i]):not([class*="icon" i]) {
      display: block !important;
      width: 100% !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      text-align: right !important;
    }

    /* Persian numbering for RTL ordered lists; <ul> stays disc. */
    .bidi-scope ol[dir="rtl"] { list-style-type: persian !important; }
    .bidi-scope ul { list-style-type: disc !important; }

    /* unicode-bidi: isolate honors the dir="rtl"/"ltr" attribute our JS
       already set from a real character count (getDirection). The previous
       "direction: auto" + "unicode-bidi: plaintext" re-guessed direction
       from the first character instead, which broke sentences that open
       with an English word. */
    .bidi-scope p.rc-done[dir="rtl"],
    .bidi-scope li.rc-done[dir="rtl"],
    .bidi-scope blockquote.rc-done[dir="rtl"] {
      unicode-bidi: isolate !important;
      text-align: start !important;
    }
    .bidi-scope blockquote {
      border-inline-start: 4px solid rgba(150,150,150,0.5) !important;
      padding-inline-start: 16px !important;
      border-left: none !important;
      border-right: none !important;
    }
    .bidi-scope pre, .bidi-scope code,
    .bidi-scope pre *, .bidi-scope code * {
      direction: ltr !important;
      unicode-bidi: isolate !important;
    }
    /* Math (.katex/math) is already excluded from the global rule above.
       Do NOT override its font-family — KaTeX picks its own size variants
       per symbol; forcing one font breaks large operators like ∫. */
  `,
});
