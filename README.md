<p align="center">
  <img src="popup/icons/DarkCircleLogo.svg" width="72" alt="RustChin">
</p>

<h1 align="center">RustChin</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="v1.0.0">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
  <a href="PRIVACY.md"><img src="https://img.shields.io/badge/privacy-zero%20data-brightgreen" alt="Zero Data"></a>
</p>

<p align="center">
  <b>راست‌چین</b> &middot; Automatic RTL, Vazirmatn font, and Persian numbering<br>
  for Persian text on AI chat platforms. Private, fast, open source.
</p>

## What it does

Persian text on AI chatbots renders wrong by default. RustChin fixes it.

<table>
  <tr>
    <td align="center"><b>Without RustChin</b></td>
    <td align="center"><b>With RustChin</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/before.png" alt="Without RustChin" width="100%"></td>
    <td><img src="screenshots/after.png" alt="With RustChin" width="100%"></td>
  </tr>
</table>

## Features

<table>
  <tr>
    <td align="center" width="50%">
      <h3>🔤 Smart RTL</h3>
      <p>Analyzes each paragraph by character count. Mixed Persian/English text renders naturally.</p>
    </td>
    <td align="center" width="50%">
      <h3>🔤 Vazirmatn Font</h3>
      <p>Applied only to Persian/Arabic glyphs. English text keeps the site's native font.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h3>📝 Persian Lists</h3>
      <p>Ordered lists show ۱. ۲. ۳. in RTL contexts.</p>
    </td>
    <td align="center" width="50%">
      <h3>💻 Code Stays LTR</h3>
      <p>Code blocks, KaTeX math, and fenced code are never flipped.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h3>⚡ Live Toggle</h3>
      <p>Enable or disable per site without reloading the page.</p>
    </td>
    <td align="center" width="50%">
      <h3>🎯 Active Site Glow</h3>
      <p>The popup highlights which supported site you are on.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h3>🌗 Adaptive UI</h3>
      <p>Popup follows your system light/dark theme.</p>
    </td>
    <td align="center" width="50%">
      <h3>🌐 Bilingual</h3>
      <p>English and Persian, auto-detected from your browser locale.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h3>🔒 Zero Data</h3>
      <p>No analytics, no telemetry, no network requests. Your conversations never leave your browser.</p>
    </td>
    <td></td>
  </tr>
</table>

## Supported sites

| Site | Domain |
|------|--------|
| <img src="popup/icons/chatgpt.svg" width="16"> ChatGPT | `chatgpt.com` |
| <img src="popup/icons/claude.svg" width="16"> Claude | `claude.ai` |
| <img src="popup/icons/gemini.svg" width="16"> Gemini | `gemini.google.com` |
| <img src="popup/icons/deepseek.svg" width="16"> DeepSeek | `chat.deepseek.com` |
| <img src="popup/icons/notebooklm.svg" width="16"> NotebookLM | `notebooklm.google.com` |

## Install

**From Chrome Web Store** (coming soon)

**From source**

1. Download or clone this repo
2. Open `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and select this folder
5. Visit a supported site and start chatting in Persian

## Privacy

- **No network access.** The only `fetch` call loads the locally bundled font.
- **Two permissions.** `storage` saves your toggles. `activeTab` lets the popup detect which site you are on.
- **Open source (MIT).** Every line is public. See [PRIVACY.md](PRIVACY.md).

## Architecture

```
RustChin/
├── core/engine.js              The shared engine
├── sites/
│   ├── chatgpt.js              ChatGPT config
│   ├── claude.js               Claude config
│   ├── gemini.js               Gemini config
│   ├── deepseek.js             DeepSeek config
│   └── notebooklm.js           NotebookLM config
├── fonts/Vazirmatn-Variable.woff2
├── popup/                      Extension popup UI
├── background.js               State relay
└── manifest.json
```

Each site config is a small, declarative file. Adding a new site is a ~90 line file, not a copy of a large script.

## Add a new chatbot

1. Create `sites/yoursite.js`:

```js
RustChin.start({
  siteId: "yoursite",
  host: "yoursite.com",
  containers: ".message, .markdown",
  exclude: "pre, code, .katex, .math",
  editableSelector: 'textarea, [contenteditable="true"]',
  numberedLists: true,
  css: `
    @font-face {
      font-family: 'Vazirmatn';
      src: url({{FONT}}) format('woff2');
      font-weight: 100 900; font-display: swap;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF,
        U+FB50-FDFF, U+FE70-FEFF, U+200C-200F;
    }
    .bidi-scope .rc-done { font-family: 'Vazirmatn', sans-serif !important; }
    .bidi-scope ol[dir="rtl"] { list-style-type: persian !important; }
    .bidi-scope p { unicode-bidi: isolate !important; text-align: start !important; }
  `,
});
```

2. Register it in `manifest.json` and `popup/popup.js`.

## Performance

- **Memoized scanning** each element analyzed once, re-analyzed only when text changes
- **Debatched mutations** DOM changes coalesced into one batch per microtask
- **Frame-throttled typing** live input direction runs at most once per animation frame
- **Non-blocking first paint** initial scan defers to `requestIdleCallback`

## Trademarks

ChatGPT, Claude, Gemini, DeepSeek, and NotebookLM are trademarks of their respective owners. RustChin is not affiliated with or endorsed by these services.

## License

[MIT](LICENSE)

## Contributing

Issues and pull requests welcome. Test on all supported sites before submitting.

<p align="center">
  Made with ❤️ for the Persian AI community
</p>
