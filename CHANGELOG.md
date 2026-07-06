# Changelog

## [1.0.0] — 2026-07-07

Initial release.

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
