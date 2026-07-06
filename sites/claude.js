/* ============================================================
   RustChin — Claude site config
   Applies Vazirmatn globally while protecting Claude's custom
   icon font (Anthropicons) and routing code to monospace.
   ============================================================ */

RustChin.start({
  siteId: "claude",
  host: "claude.ai",
  containers: "[class*='font-claude' i], [class*='message-content' i], [data-testid='user-message'], [data-user-message-bubble]",
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

    /* Vazirmatn only on RTL-detected text. English paragraphs, headings, UI
       chrome, and sidebar titles keep Claude's native font ('Söhne' / system).
       Preserves Claude's icon font (Anthropicons), code, and math. */
    .rc-done[dir="rtl"]:not(svg):not(code):not(pre):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math),
    .rc-done[dir="rtl"] :not(svg):not(code):not(pre):not([data-cds="Icon"]):not([data-cds="Icon"] *):not(.katex):not(.katex *):not(.math):not(math) {
      font-family: 'Vazirmatn', 'Söhne', 'ui-sans-serif', system-ui, sans-serif !important;
    }
    /* Prompt/textarea areas: the live-input handler marks these with .rc-input
       instead of .rc-done, so a separate rule is needed for Vazirmatn. */
    .rc-input[dir="rtl"] {
      font-family: 'Vazirmatn', 'Söhne', 'ui-sans-serif', system-ui, sans-serif !important;
    }
    [data-cds="Icon"], [data-cds="Icon"] * {
      font-family: var(--font-anthropicons, Anthropicons-Variable) !important;
    }

    .bidi-scope pre, .bidi-scope code, .bidi-scope pre code, .code-block,
    .bidi-scope pre *, .bidi-scope code * {
      font-family: Consolas, Monaco, 'Courier New', monospace !important;
      direction: ltr !important;
    }
    /* Math (.katex/math) is already excluded above. Do NOT override its
       font-family here — KaTeX picks its own size variants per symbol
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

    .bidi-scope p, .bidi-scope li, .bidi-scope h1, .bidi-scope h2,
    .bidi-scope h3, .bidi-scope blockquote, .bidi-scope td, .bidi-scope th {
      line-height: 1.8 !important;
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

    /* Persian numbering for RTL ordered lists. */
    .bidi-scope ol[dir="rtl"],
    .bidi-scope [dir="rtl"] ol,
    .bidi-scope li[dir="rtl"] {
      list-style-type: persian !important;
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
