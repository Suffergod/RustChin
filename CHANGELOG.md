# Changelog

## [1.4.0] - 2026-09-25

### Added
- **Project Homepage (`homepage_url`)**: Declared `https://rust-chin.ir/` in the manifest, so Chrome's extension details page and the Web Store listing both link to a real site instead of offering nowhere to go. Until now the extension had no homepage at all.
- **First-Install Setup Guide**: `chrome.runtime.onInstalled` now opens `https://rust-chin.ir/welcome` on an install. The icon lands in Chrome's extensions menu rather than on the toolbar, so a new user has no visible sign the extension is present and no reason to think it is doing anything; a three-step Persian guide with the toolbar labels in both Persian and English is what turns an install into a working install. The tab opens on `details.reason === "install"` only. On an update, re-opening a tab under someone who has used the extension for months is an ambush, not onboarding.
- **Uninstall Survey Hook (`setUninstallURL`)**: Chrome's own "RustChin has been removed" page now offers `https://rust-chin.ir/goodbye`, a short bilingual survey. It is the only moment an ex-user will ever say why they left, and it was previously being thrown away.
- **Feedback Page as the Support Channel**: The popup's report button and the Settings Studio's support link now point at `https://rust-chin.ir/feedback` instead of the raw GitHub issue list. The page asks which platform, which layout, and what the text looked like, copies the write-up to the clipboard, and only then opens a prefilled issue. It also serves the visitor who wants to write in Persian but will not create a GitHub account to do it.
- **Setup Guide Link in Settings Studio**: A second support link beside Send Feedback, for anyone who dismissed the install tab and later wants the pinning steps back.

### Fixed
- **Page Staying Restyled After Disabling RustChin From `chrome://extensions`**: Chrome tears down an extension's runtime but keeps every DOM mutation its content scripts already made, and it cannot run cleanup for a script it has just detached, so the injected styles, marker classes and typography custom properties survived until a reload. Switching the extension off from the popup had always reverted correctly; only the extensions page was affected. The engine now checks `chrome.runtime.id` on each two second recovery tick and on every mutation and input event. It reads back `undefined` once the extension is gone, without throwing, so the engine reverts the page itself. No additional permission is involved.
- **Toolbar Icon Reverting to the Square After a Browser Restart**: `chrome.action.setIcon` writes session state, not stored state. Chrome discards it on exit and falls back to `action.default_icon`, which is the square, so a restart silently flipped a running extension's toolbar icon and left it flipped until the user happened to change a setting. `syncActionIcon` existed for exactly this and was never called. It is now wired to `chrome.runtime.onStartup` and also invoked on every service worker wake.
- **Settings Studio Reporting a Stale Version**: The version pill in `options/options.html` was static markup and never rewritten, so it still read v1.3.0 on later releases. It now reads `chrome.runtime.getManifest().version`, with the markup value kept only as a fallback for a plain `file://` preview. The popup already did this; the two surfaces now agree.
- **Report Button Labelled as a GitHub Link**: The popup tooltip and the Persian and English strings still described the button as a GitHub issue link after it was repointed at the site, which would have been the first thing a user saw on hover. Both locales updated, and the button's static `title` and `aria-label` no longer contradict the runtime strings.

## [1.3.0] - 2026-09-18

### Added
- **3 New Supported AI Platforms**: Added dedicated site integrations for Microsoft Copilot (`copilot.microsoft.com`), Perplexity AI (`perplexity.ai`), and Poe (`poe.com`) with authentic brand SVG icons, custom message container selectors, input listeners, and site-specific CSS scopes. Total supported platforms scaled from 5 to 8.
- **Custom Local System Font Support**: Enabled user-defined typography without bundling extra font assets. Users can specify any font installed on their operating system (e.g. Shabnam, Samim, IRANSans, B Nazanin) with clean fallback to Vazirmatn. Configurable via both the popup dropdown and the Settings & Typography Studio.
- **Zero-Latency Keyboard Shortcut Engine (`Alt+Shift+X`)**: Registered `toggle-input-direction` in manifest commands and added an in-DOM capture-phase keydown handler in the core engine. Users can toggle the active input box between RTL and LTR instantly with 0ms latency.
- **Persian Ordered List Numerals**: Enforced `ol[dir="rtl"] { list-style-type: persian !important; }` across all platforms so enumerated lists render with Persian digits (۱، ۲، ۳).
- **Line Height Stepper in Popup**: Added a compact stepper control (`[−] 1.8 [+]`) directly to the left of the font scale stepper, so line height can be tuned without opening the Settings & Typography Studio. Steps 0.1 per click across the 1.4 to 2.6 range and rounds onto the same 1/20 grid as the dashboard slider, so the two surfaces can never disagree and floating point drift never reaches the display. Both buttons disable at the range ends. Changes relay through the existing `STATE_CHANGED` path and reflow open conversations instantly, matching the font scale stepper exactly.
- **Trademark and Branding Policy (`TRADEMARK.md`)**: Declared the project name "RustChin", its Persian form, the logo, and the extension icon as exclusive property of the author, separate from the MIT license that covers the source code. The document states what is permitted (referring to the extension by name, linking to the official listing, stating compatibility) and what is not (publishing any copy, fork, rebuilt package, or modified version under the RustChin name, logo, or icon). Its Fork section records the exact position under MIT: the code is free to reuse, the identity is not, so every fork must be renamed and re-iconed. This is the basis for a Chrome Web Store impersonation complaint against a rebranded copy.

### Enhanced & Fixed
- **First-Strong & Token-Stripped Bidirectional Algorithm**: Upgraded `getDirection(text)` in `core/engine.js` to strip URLs (`https?://\S+`) and inline code backticks (`` `...` ``) before computing character frequencies, combined with first-strong character detection. Technical Persian sentences containing English method names or URLs never mistakenly snap to LTR.
- **Smart Input Synchronizer & Rich-Textarea Web Component Binding**: Fixed Google Gemini input styling where Quill editors assign `dir="rtl"` without enforcing text alignment. In v1.3.0, `handleDynamicInput` unconditionally enforces `text-align: right !important`, `direction: rtl !important`, and `--rc-font`, while bidirectionally synchronizing both the inner `.ql-editor` and the outer `<rich-textarea>` custom element.
- **Inline Code & LaTeX Shielding**: Enforced `direction: ltr !important; unicode-bidi: isolate !important; display: inline-block;` on `.bidi-scope code:not(pre code)`. Eliminates punctuation inversions, parenthesis flips, and dot mangling in inline code (e.g. `user.getName()`) embedded within Persian sentences.
- **Stable Popup Height When the Master Switch Is Off**: Turning the master switch off used to replace the 8 site rows with a single hint line, collapsing the popup by 141px. Chrome sizes the popup window once when it opens, so the freed space stayed behind as an empty band below the panel. The grid now stays rendered in both states and is blurred and desaturated in place (`filter: blur(4px) grayscale(1); opacity: .5`) behind a feathered scrim that carries the hint text. `inert` is set on the grid so pointer, focus, and screen reader access all close together. The popup measures 485px in both states and nothing shifts.
- **Backdrop Filter Nesting Trap in the Popup**: The locked-state veil first used `backdrop-filter` on its overlay, which rendered at a small fraction of the requested radius because `.panel` carries its own `backdrop-filter` and therefore becomes a backdrop root. Requesting `blur(24px)` there looked closer to `blur(2px)`, so the site rows stayed readable under a gray haze and the veil read as a smudge rather than frosted glass. The veil now blurs the grid element directly, since an element `filter` is not subject to backdrop roots. Worth remembering before adding any further `backdrop-filter` inside `.panel`, as `getComputedStyle` reports the requested radius and gives no hint that the rendered one differs.
- **Per-Site Preferences Survive the Master Switch**: Because the site checkboxes are no longer torn out of the DOM when the master switch is off, `getStateFromUI()` reads their real values instead of returning an empty map. Toggling the master switch off and back on no longer resets every individual site to enabled.
- **Official Distribution Notice in `README.md`**: Added an `[!IMPORTANT]` callout to the install section stating that the official extension is published only from the Chrome Web Store listing, and that any other build carrying the RustChin name or logo is unofficial and unsupported.
- **License Section Cross-Link in `README.md`**: The license section now links to `TRADEMARK.md` and states that the name, logo, and icon carry their own terms. The source license is unchanged and remains MIT.
- **Expanded Options Studio Grid**: Scaled the supported platforms grid to 8 services with live toggles, authentic brand colors, and status indicators.

## [1.2.1] - 2026-09-18

### Fixed & Enhanced
- **Live Typography Metrics on Websites**: Connected font scale and line height directly to content scripts across all supported platforms (ChatGPT, Claude, Gemini, DeepSeek, Google Notebook). Dynamic CSS custom properties (`--rc-font-size`, `--rc-line-height`) now immediately scale RTL paragraphs, lists, blockquotes, user messages, inputs, and proportional headings without reload.
- **Quick Font Scale Stepper in Popup**: Added compact stepper controls (`[−] 15px [+]`) directly beside the font picker in the popup for instant 1-click resizing without leaving the chat.
- **State Preservation Across Contexts**: Fixed state synchronization between popup, options studio, and content scripts so typography metrics are never reset or overwritten when toggling sites or switching fonts.
- **Bidirectional Live Synchronization**: Sliders in the options studio and steppers in the popup now stay in sync across storage updates and active tabs.

## [1.2.0] - 2026-09-13

### Added
- **5 Bundled Variable Fonts**: Added `Estedad-Variable.woff2`, `Sahel-Variable.woff2`, `Arad-Variable.woff2`, and `Mikhak-Variable.woff2` alongside `Vazirmatn-Variable.woff2` (all 100-900 variable weight, under 380 KB total package footprint).
- **Interactive Vector Footer Buttons**: Replaced plain text links with centered vector buttons for rating on Chrome Web Store (Star) and reporting issues on GitHub (Bug), with branded hover feedback.
- **Scalable Frosted Popover Font Picker**: Compact frosted pill selector in the extension popup that expands into an authentic typography menu with category badges and active checkmarks.
- **Full Settings & Typography Studio Dashboard**: Dedicated options page (`options/options.html`) accessible via popup and Chrome context menu with interactive live preview sandbox, code/KaTeX isolation testing, site management grid, and theme controls.
- **Tactile Drag Engine for Toggle Switches**: Implemented smooth pointer dragging and click support for all switch knobs with real-time 60fps tracking (`--drag-x`), 50% threshold snapping, and synthetic click suppression.
- **Metrics Default Reset**: Added one-click "Default" button in Typography Metrics to restore default Font Scale (15px) and Line Height (1.8) across sliders, badges, and preview canvas.
- **Solar Icon Integration**: Replaced raster/generic icons with clean SVG vector icons from the Solar icon set.
- **Zero-Latency Dynamic Font Switching**: Powered by CSS custom properties (`--rc-font`) and dynamic `:root[data-rc-font="..."]` attributes, allowing instant cross-tab font switching without page reload.
- **Enhanced Live Typing Engine**: Real-time Persian input handling with automatic RTL orientation for rich text editors and prompt boxes.

### Changed & Improved
- **Concentric Vector Group Transforms & Zero Icon Jitter**: Transferred all CSS transforms and transitions from root `<svg>` elements to internal `<g>` containers with `transform-origin: 12px 12px` and `0.35s cubic-bezier(0.2, 0, 0, 1)`. Eliminates GraphicsLayer raster texture promotion, subpixel pixel-snapping crawl on Windows 11 high-DPI scaling, and bounding box expansion, preserving 0.0px layout stability.
- **Mathematically Centered Star and Bug Geometry**: Standardized the Star icon to an exact 5-point symmetric polygon centered at (12.0, 12.0) with radius 9.5, and shifted the Bug icon coordinates by -0.5 on Y to align its center of mass precisely at (12.0, 12.0), eliminating all orbital precession and lateral swing during hover.
- **Refined Moon Icon Theme Animation**: Applied calm -15deg rotation on internal `<g>` vector group, eliminating jitter in both active and inactive states in popup and options studio.
- **Compact Center-Aligned Typography Cards**: Center-aligned all font cards in the options dashboard, removed redundant 100-900 weight indicators, and eliminated the active text badge in favor of clean accent border highlights and subtle glow, reducing card height to ~143px.
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
