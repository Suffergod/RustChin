# RustChin — Privacy Policy

**Effective date: 2026**

RustChin is built with one overriding principle: **your conversations never
leave your device, and we never see them.** This page documents exactly what
the extension does and does not touch, so you can verify it yourself — the
source code is open under the MIT license.

## Summary

- **Zero data collection.** RustChin does not collect, store, or transmit any
  personal data or conversation content. None.
- **No remote server.** The extension has no API endpoint and sends no analytics,
  no telemetry, no "phone home", and no error reporting to any server. All
  processing happens locally in your browser.
- **Two minimal permissions:**
  - `storage` — remembers your on/off preferences locally on your device.
  - `activeTab` — lets the popup detect which supported site you're currently
    viewing, so it can show a live/paused status indicator. No conversation
    content is read for this — it is a simple ping that checks whether the
    RustChin engine is running on that tab.
- **Fully auditable.** Every line of code is public.

## What RustChin does

RustChin fixes right-to-left (RTL) text rendering and applies the Vazirmatn
font on supported AI chat websites. To do this it:

1. **Reads the text of message elements in the page** — locally, in your
   browser — to decide whether each paragraph should be right- or
   left-aligned. This reading is done only to set a `dir` attribute; the text
   itself is never stored or sent anywhere.
2. **Adds CSS and a few HTML attributes/classes** to make Persian/Farsi text
   render correctly. These changes are reverted the moment you toggle the
   extension off.
3. **Stores your on/off preferences** (which sites are enabled) using Chrome's
   local storage. This stays on your device.

## What RustChin does NOT do

- ❌ Does **not** read, log, or store the content of your conversations.
- ❌ Does **not** send any data to any server. There is no backend.
- ❌ Does **not** use analytics, telemetry, or tracking of any kind.
- ❌ Does **not** request permissions beyond `storage` and `activeTab`.
- ❌ Does **not** sell, share, or transfer any data — because there is no data.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Remember your master on/off toggle, per-site toggles, theme, and language preference locally. |
| `activeTab` | When you open the popup, lets RustChin detect which supported site you're on so the UI can show whether the engine is live or paused on that tab. No conversation content is read. |

The extension does **not** request `tabs`, `history`, `cookies`,
`webRequest`, `scripting` (programmatic injection), or `host_permissions`.
The minimal permission footprint is itself a privacy guarantee: the extension
has no API access that would let it read or transmit your data.

## The bundled font

RustChin ships with the [Vazirmatn](https://github.com/rastikerdar/vazirmatn)
font (an open-source Persian typeface). It is loaded locally from the
extension package — never fetched over the network.

## Verifying it yourself

Because the code is open source, you don't have to take our word for it:

- Search the codebase for `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`,
  or `WebSocket` — you will find **none** used to contact any server. The only
  `fetch` call retrieves the locally-bundled font file.
- Review `manifest.json` — `permissions` contains only `["storage", "activeTab"]`.

## Changes to this policy

Any future changes will be documented in this file and in the release notes on
the project's GitHub repository.

## Contact

To report a privacy concern or ask a question, please open an issue on the
project's GitHub repository:
https://github.com/suffergod/RustChin/issues

## Credits

- **Logo** designed by [MahanCN](https://www.linkedin.com/in/mahancn/)
- **Font** — [Vazirmatn](https://github.com/rastikerdar/vazirmatn) by Saeed Bahmanabad
