# Changelog

## [1.2.0] - 2026-09-13

### Added
- **5 Bundled Variable Fonts**: Added `Estedad-Variable.woff2`, `Sahel-Variable.woff2`, `Arad-Variable.woff2`, and `Mikhak-Variable.woff2` alongside `Vazirmatn-Variable.woff2` (all 100–900 variable weight, under 380 KB total package footprint).
- **Scalable Frosted Popover Font Picker**: Compact frosted pill selector in the extension popup that expands into an authentic typography menu with category badges and active checkmarks.
- **Full Settings & Typography Studio Dashboard**: Dedicated options page (`options/options.html`) accessible via popup and Chrome context menu with interactive live preview sandbox, code/KaTeX isolation testing, site management grid, and theme controls.
- **Tactile Drag Engine for Toggle Switches**: Implemented smooth pointer dragging and click support for all switch knobs with real-time 60fps tracking (`--drag-x`), 50% threshold snapping, and synthetic click suppression.
- **Metrics Default Reset**: Added one-click "Default" button in Typography Metrics to restore default Font Scale (15px) and Line Height (1.8) across sliders, badges, and preview canvas.
- **Solar Icon Integration**: Replaced raster/generic icons with clean SVG vector icons from the Solar icon set.
- **Zero-Latency Dynamic Font Switching**: Powered by CSS custom properties (`--rc-font`) and dynamic `:root[data-rc-font="..."]` attributes, allowing instant cross-tab font switching without page reload.
- **Enhanced Live Typing Engine**: Real-time Persian input handling with automatic RTL orientation for rich text editors and prompt boxes.

### Changed & Improved
- **Responsive Monochromatic ChatGPT Toggle**: Engineered an authentic OpenAI monochromatic design for ChatGPT toggles (Obsidian Black `#111111` with crisp white knob in light mode; Luminous Snow White `#ffffff` with diffuse glow and obsidian knob in dark mode), synchronized across popup and settings studio.
- **Direction-Aware Squash-and-Stretch Toggle Physics**: Implemented responsive tactile deformation where the switch knob dynamically stretches 3px in its exact movement direction (3px leftward when turning OFF, 3px rightward when turning ON) with deterministic physical coordinates across both English (LTR) and Persian (RTL) locales.
- **Eye-Pleasing Emerald Green Master Switch**: Updated the global master switch from blue to authentic emerald green (`#1f9d55` in light mode, `#22c55e` in dark mode) perfectly matched with the active status badge.
- **Jitter-Free, Concentric Vector Icon Rotation**: Fixed rotation and motion bugs on theme selection buttons and settings gear; standardized dimensions to integer 16px, replaced `fill-box` with `view-box`, enabled `overflow: visible`, wrapped child elements in unified `<g>` containers, and aligned rotation angles with 8-fold and 6-fold radial symmetries (45deg for sun, 60deg for gear) to achieve zero subpixel shimmer and zero center drift.
- **Strict Zero Em Dash Policy**: Standardized all project documentation, code comments, and metadata to eliminate em dashes, replacing them with standard colons, pipes, or hyphens.
- **Full Brand Colors for Platform SVGs**: Updated all 5 AI platform vectors to render with their authentic brand colors (ChatGPT emerald `#10A37F`, Claude terracotta `#D97757`, Gemini Google Aurora gradient, Gemini Notebook multi-tone blue/lavender `#3186FF`/`#4FA0FF`/`#76BBFF`/`#A9A8FF`, and DeepSeek cobalt `#4D6BFE`), providing rich contrast and visibility in both dark and light modes.
- **Gemini Notebook (formerly NotebookLM) Renaming**: Updated platform name and UI references across popup, options dashboard, site config, and repository documentation to match Google's official rebrand.
- **Brand-Colored Active Toggles**: Each platform toggle switch illuminates in that service's authentic brand color (ChatGPT green, Claude terracotta, Gemini blue, Notebook azure, DeepSeek cobalt).
- **Draggable Toggles in Popup & Options**: Implemented pointer capture drag tracking and Apple HIG spring bounce curves across both popup and dashboard toggles.
- **Independent Font Title Preview**: Scoped unique font families directly to each font card title in the dashboard and each dropdown row in the popup, providing authentic previews independent of the active font.
- **Google NotebookLM Domain Migration**: Added full support for Google's new `notebook.google.com` domain across content scripts, engine, and UI toggles.
- **Refined Active Indicator**: Replaced noisy neon border glow on active site rows with a clean, calm pulsing status dot.
- **Fluent Persian Documentation**: Completely rewrote `README.md` in natural, modern Persian tailored to the Iranian tech community.
- **Dashboard Visual & Motion Refinement**: Removed redundant active font header badge in favor of clean font cards; added dynamic dual-color slider gradient track fills (`--slider-fill`).
- **Extension Name & Subtitle**: Renamed to "RustChin: RTL & Persian Fonts" in manifest and popup UI ("RTL & Persian Fonts for AI chat").
- **Fixed ProseMirror / Canvas Freeze**: Eliminated tab freezing when typing Persian or opening Canvas/Writing blocks by guarding editable DOM trees against external mutations and debatching via `requestAnimationFrame`.
- **Eliminated Live Streaming Lag**: Observed `characterData` in `MutationObserver` to style incoming streaming tokens on the next animation frame (~16ms).
- **Universal Multi-Font Engine**: Propagated dynamic font variable architecture across all supported sites (ChatGPT, Claude, Gemini, DeepSeek, NotebookLM).
- **Zero Data & No Donations**: Completely removed donation heart link; affirmed 100% free and private architecture with zero data collection.

## [1.1.0] - 2026-07-11

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
