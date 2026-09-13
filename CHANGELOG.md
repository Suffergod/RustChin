# Changelog

## [1.2.0] — 2026-09-13

### Changed & Improved
- **Extension Name**: Renamed to "RustChin: RTL & Persian Fonts" in preparation for multi-font support.
- **ChatGPT User Messages**: Added automatic RTL and Vazirmatn font for sent prompt messages (no longer skipped when inside plain `<div>`).
- **ChatGPT Table & Canvas Support**: Tables inside Canvas / Writing Blocks (`ProseMirror`) now render strictly RTL with Vazirmatn font across all table headers and cells.
- **Copy Table Button**: Fixed alignment for RTL tables to place the button on the natural start (left) side.
- **Live Toggle Fix**: Revert contract now completely removes `dir` attributes from `<table>` and `<ol>` when the extension is toggled off (zero residual DOM state).
- **Streaming Mutation Observer**: Fixed incremental scanner in `engine.js` to instantly process dynamically streamed tokens inserted into existing `.bidi-scope` containers.
- **Cleaned Selectors**: Removed redundant `nav div` query from ChatGPT container list to boost DOM scanning performance.
- **Popup UI**: Removed donation heart link; extension is 100% free forever. Connected official Chrome Web Store listing URL to the Rate button.

## [1.1.0] — 2026-07-11

Published on Chrome Web Store!

### Features
- Automatic RTL direction detection for Persian/Farsi text on AI chat sites.
- Vazirmatn font applied across all supported sites (bundled locally, no network fetch).
- Persian numbering for ordered lists in RTL contexts.
- Code and math blocks kept strictly LTR (KaTeX, fenced code, inline code).
- Live per-site toggling without page reload.
- Active-site glow indicator in the popup (detects which supported tab is open).
- Adaptive frosted-glass popup UI with system light/dark theme support.
- Bilingual UI (English / Persian) with automatic locale detection.
- Master enable/disable toggle with status bar.
- Circle icon (ON) / Square icon (OFF) toolbar badge.
- Reload hint for tabs opened before installation.
- Donate button in the popup footer.

### Supported sites
- ChatGPT (`chatgpt.com`)
- Claude (`claude.ai`)
- Gemini (`gemini.google.com`)
- DeepSeek (`chat.deepseek.com`)
- NotebookLM (`notebooklm.google.com`)

### Privacy
- No analytics, no telemetry, no remote server.
- `storage` permission: local preferences only.
- `activeTab` permission: popup site-detection ping only.
- No conversation content is collected, stored, or transmitted.
