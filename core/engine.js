/* ============================================================
   RustChin — Shared RTL Engine
   ------------------------------------------------------------
   One engine, many sites. Each site ships a small config file
   (see sites/*.js) that calls RustChin.start({...}).

   Design contract (do not regress these):
     1. Output parity — the direction-detection algorithm and the
        DOM mutations are identical to the original per-site scripts.
        Optimizations only change HOW OFTEN work runs, not the result.
     2. Live toggle — start()/stop() must be perfectly reversible.
        stop() reverts the page to its original state so toggling
        off never requires a reload.
     3. Hot-path invariants — see the comments marked [PERF].
   ============================================================ */

(function (global) {
  "use strict";

  // Unicode range covering Arabic, Persian, Arabic Supplement, Extended-A,
  // Presentation Forms (A + B). Used to detect RTL script content.
  var RTL_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  var LATIN_RE = /[a-zA-Z]/g;

  /**
   * Decide paragraph direction from text content.
   * Counts RTL-script chars vs Latin chars; RTL wins unless the text is
   * dominated by Latin (ratio > 1.5). Pure function, deterministic.
   */
  function getDirection(text) {
    if (!text) return "ltr";
    var pCount = (text.match(RTL_RE) || []).length;
    var eCount = (text.match(LATIN_RE) || []).length;
    if (pCount === 0) return "ltr";
    if (eCount > pCount * 1.5) return "ltr";
    return "rtl";
  }

  /**
   * Build an engine instance for one site configuration.
   * Each config has:
   *   siteId, host,
   *   containers  -> CSS selector for message roots,
   *   scanBody    -> if true, scan the whole <body> (NotebookLM mode),
   *   scanSelector-> body-scan element selector (with scanBody),
   *   exclude     -> closest() selector of elements to skip,
   *   editableSelector -> CSS selector for the live prompt input boxes,
   *   fixMode     -> "default" | "notebooklm" (6-ancestor expansion),
   *   css         -> site-specific CSS template, uses {{FONT}} placeholder.
   */
  function createEngine(config) {
    var active = false;
    var styleEl = null;
    var cssText = "";
    var observer = null;
    var intervalId = null;
    var rafQueued = false;

    // [PERF] Memoization: remember which elements we already styled and the
    // text length we styled them for. Re-style only when the content changed.
    // WeakSet+WeakMap avoid leaks: entries vanish when elements are GC'd.
    var processed = new WeakSet();
    var processedLen = new WeakMap();

    /* ---------- CSS injection ---------- */

    function injectCSS() {
      if (styleEl || !cssText) return;
      styleEl = document.createElement("style");
      styleEl.id = "rustchin-style-" + config.siteId;
      styleEl.textContent = cssText;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    function removeCSS() {
      if (styleEl) {
        styleEl.remove();
        styleEl = null;
      }
    }

    /* ---------- Element-level fixing (preserves original behavior) ---------- */

    /**
     * We keep inline `!important` styles (exactly as the original scripts did)
     * so output is byte-identical — inline !important always beats page CSS.
     * A marker class (.rc-done) lets stop() find and revert every mutation,
     * so toggling off is clean without a reload. This hybrid preserves both
     * parity and the revert contract.
     */
    function fixElement(el) {
      if (el.closest(config.exclude)) return;

      var text = el.textContent || "";
      if (!text.trim()) return;

      // [PERF] Memoization with change re-check: skip elements whose text
      // length is unchanged since we last styled them. Streaming updates
      // change length, so they still re-process; finished threads cost ~0.
      var len = text.length;
      if (processed.has(el) && processedLen.get(el) === len) return;
      processed.add(el);
      processedLen.set(el, len);

      var dir = getDirection(text);

      el.setAttribute("dir", dir);
      el.style.setProperty("text-align", dir === "rtl" ? "right" : "left", "important");
      el.classList.add("rc-done");

      // NotebookLM-specific: expand ancestors so RTL content has width.
      // NOTE: we used to also force every RTL span to display:block + width:100%,
      // but that fragment-inline breaks the sentence — each span lands on its
      // own line, and an inline bold word (<b>/<strong>) between two block
      // spans gets shoved onto its own line. The ancestor expansion above is
      // what actually breaks NotebookLM's RTL width walls; the span block
      // styling was redundant and is what was forcing "فلش‌کارت" onto a new
      // line. Leaving spans inline preserves natural inline flow so bold words
      // sit inside the sentence where they belong.
      if (config.fixMode === "notebooklm") {
        if (dir === "rtl") {
          el.style.setProperty("direction", "rtl", "important");
          var msgWrapper = el.closest(
            '.to-user-container, .from-user-container, [class*="message-container"], [class*="message-card"], [class*="chat-message"], labs-tailwind-doc-viewer, element-list-renderer'
          );
          if (msgWrapper) {
            msgWrapper.classList.add("bidi-rtl-message");
            var parent = msgWrapper.parentElement;
            var depth = 0;
            // Walk up to 6 ancestors, but never cross the page skeleton so
            // we never break NotebookLM's overall layout.
            while (parent && depth < 6) {
              if (
                parent.tagName === "BODY" ||
                parent.tagName === "MAIN" ||
                parent.tagName.indexOf("SIDENAV") !== -1
              ) {
                break;
              }
              parent.classList.add("bidi-expanded-wrapper");
              parent = parent.parentElement;
              depth++;
            }
          }
        } else {
          el.style.setProperty("direction", "ltr", "important");
        }
        var parentList = el.closest("ul, ol");
        if (parentList) {
          parentList.setAttribute("dir", dir);
          parentList.classList.add("bidi-scope-list");
        }
      }
    }

    var LEAF_TAGS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th";

    function processContainer(container) {
      if (!container.classList.contains("bidi-scope")) {
        container.classList.add("bidi-scope");
      }
      // Some site configs (generic.js) point "containers" straight at
      // text-bearing tags instead of a wrapper div, so fix the container
      // itself too -- not just its descendants.
      if (container.matches(LEAF_TAGS)) fixElement(container);

      // Text-bearing tags inside a message root.
      container.querySelectorAll(LEAF_TAGS).forEach(fixElement);

      // Ordered lists: set their dir so Persian numbering applies.
      if (config.numberedLists !== false) {
        container.querySelectorAll("ol").forEach(function (ol) {
          var t = ol.textContent || "";
          ol.setAttribute("dir", getDirection(t));
        });
      }

    // Tables: detect direction from their content. If Persian text is
    // present, the table itself becomes RTL so the first column starts
    // on the right. English/code tables stay safely LTR.
    container.querySelectorAll("table").forEach(function (table) {
      var tableText = table.textContent || "";
      table.setAttribute("dir", getDirection(tableText));
      table.querySelectorAll("th, td").forEach(fixElement);
    });
    
    }

    /* ---------- Scanning ---------- */

    function scanAll() {
      if (!active) return;

      if (config.scanBody) {
        // NotebookLM: whole-body scan of specific tags.
        document.body
          .querySelectorAll(config.scanSelector)
          .forEach(fixElement);
      } else {
        var containers = document.querySelectorAll(config.containers);
        containers.forEach(processContainer);
      }

      // Optional: standalone leaf elements outside the normal container/tag
      // scan (a sidebar chat-title span, an echoed-prompt div with no <p>
      // inside it, etc). fixElement runs on them directly.
      if (config.extraSelector) {
        document.querySelectorAll(config.extraSelector).forEach(fixElement);
      }
    }

    /**
     * [PERF] Incremental scan: given a set of mutation target nodes, process
     * ONLY them and their descendants instead of re-scanning the document.
     * Coverage is preserved because every added/changed node is still visited.
     */
    function scanNodes(nodes) {
      if (!active) return;
      nodes.forEach(function (node) {
        if (node.nodeType !== 1) return; // elements only
        // Treat the node itself as a potential message root or text tag.
        try {
          if (config.scanBody) {
            if (node.matches(config.scanSelector)) fixElement(node);
          } else if (node.matches(config.containers)) {
            processContainer(node);
          } else if (config.extraSelector && node.matches(config.extraSelector)) {
            fixElement(node);
          }
        } catch (e) {
          /* node may be detached; ignore */
        }
        // And process any relevant descendants.
        if (config.scanBody) {
          node.querySelectorAll(config.scanSelector).forEach(fixElement);
        } else {
          node
            .querySelectorAll(config.containers)
            .forEach(processContainer);
          if (config.extraSelector) {
            node.querySelectorAll(config.extraSelector).forEach(fixElement);
          }
        }
      });
    }

    /* ---------- Live input direction (per keystroke) ---------- */

    function resolveEditable(target) {
      var sel = config.editableSelector;
      if (target.matches(sel)) return target;
      return target.closest(sel);
    }

    // [PERF] Throttle to one check per animation frame while typing.
    function handleDynamicInput(e) {
      if (!active) return;
      var target = e.target;
      if (!target || target.nodeType !== 1) return;
      var inputEl = resolveEditable(target);
      if (!inputEl) return;

      if (rafQueued) return;
      rafQueued = true;
      requestAnimationFrame(function () {
        rafQueued = false;
        var text = inputEl.value || inputEl.textContent || "";
        var dir = getDirection(text);
        inputEl.setAttribute("dir", dir);
        inputEl.style.setProperty("text-align", dir === "rtl" ? "right" : "left", "important");
        inputEl.style.setProperty("direction", dir, "important");
        inputEl.classList.add("rc-input");
      });
    }

    /* ---------- Observer (debatched) ---------- */

    var batchNodes = [];
    var batchScheduled = false;

    function scheduleBatch() {
      if (batchScheduled) return;
      batchScheduled = true;
      // Coalesce all mutations in a microtask, then process once.
      Promise.resolve().then(function () {
        batchScheduled = false;
        var nodes = batchNodes;
        batchNodes = [];
        if (!active) return;
        // [PERF] Process only changed nodes. A full scanAll() runs on the
        // throttled interval as a safety net so nothing is ever missed.
        scanNodes(nodes);
      });
    }

    function onMutation(mutations) {
      if (!active) return;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j++) {
            batchNodes.push(m.addedNodes[j]);
          }
        }
      }
      if (batchNodes.length) scheduleBatch();
    }

    /* ---------- Engine lifecycle ---------- */

    function start() {
      if (active) return;
      active = true;
      injectCSS();

      // [PERF] Defer the first pass so the page paints before we scan.
      var runFirst = function () {
        if (!active) return;
        scanAll();
      };
      if (global.requestIdleCallback) {
        requestIdleCallback(runFirst, { timeout: 500 });
      } else {
        setTimeout(runFirst, 16);
      }

      if (observer) observer.disconnect();
      observer = new MutationObserver(onMutation);
      // subtree:true keeps coverage across SPA re-renders. characterData is
      // NOT observed: direction is derived from element text, and a throttled
      // safety-net scan below catches streaming token updates.
      observer.observe(document.body, { childList: true, subtree: true });

      document.addEventListener("input", handleDynamicInput, true);

      // [PERF] Safety net: re-scan every 2s unconditionally. fixElement()
      // already memoizes per element (skips anything unchanged), so this is
      // a cheap no-op on a stable page. We used to gate this on
      // document.scrollHeight changing, but panel/sidebar toggles (Claude's
      // right-hand panel, Gemini's route swap) can restyle the page WITHOUT
      // changing its height, so that gate silently skipped the recovery
      // scan. Unconditional + memoized is simpler and doesn't regress.
      intervalId = setInterval(function () {
        if (!active) return;
        scanAll();
      }, 2000);
    }

    /**
     * Revert contract: stop() removes EVERYTHING start()/fixElement() added,
     * so toggling off returns the page to its original look — no reload needed.
     */
    function stop() {
      active = false;
      removeCSS();

      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      document.removeEventListener("input", handleDynamicInput, true);

      // [PERF] Reset memoization so a later start() re-processes everything
      // fresh. Old WeakSet/WeakMap are GC'd; can't iterate them to clear.
      processed = new WeakSet();
      processedLen = new WeakMap();
      rafQueued = false;

      // 1. Remove marker classes from containers and ancestors (no inline styles).
      var classSelectors = [
        ".bidi-scope",
        ".bidi-rtl-message",
        ".bidi-expanded-wrapper",
        ".bidi-scope-list",
      ];
      document.querySelectorAll(classSelectors.join(",")).forEach(function (el) {
        el.classList.remove("bidi-scope", "bidi-rtl-message", "bidi-expanded-wrapper", "bidi-scope-list");
        // Containers also got dir from our numbered-list processing.
        el.removeAttribute("dir");
      });

      // 2. Revert elements that received inline style mutations (.rc-done).
      document.querySelectorAll(".rc-done").forEach(function (el) {
        el.classList.remove("rc-done");
        el.removeAttribute("dir");
        el.style.removeProperty("text-align");
        // NotebookLM-specific inline styles.
        el.style.removeProperty("direction");
        el.style.removeProperty("display");
        el.style.removeProperty("width");
      });

      // 3. Revert live-input markers (prompt boxes we set dir on).
      document.querySelectorAll(".rc-input").forEach(function (el) {
        el.classList.remove("rc-input");
        el.removeAttribute("dir");
        el.style.removeProperty("text-align");
        el.style.removeProperty("direction");
      });
    }

    /* ---------- Boot: load font, read state, maybe start ---------- */

    function applyState(state) {
      var on =
        state.masterEnabled !== false &&
        state.sites[config.host] !== false;
      if (on) start();
      else stop();
    }

    function boot() {
      chrome.storage.local.get("state", function (data) {
        var state = data.state || { masterEnabled: true, sites: {} };
        applyState(state);
      });
    }

    // Toggle messages from the popup (relayed by the background worker).
    chrome.runtime.onMessage.addListener(function (msg) {
      if (msg && msg.type === "STATE_CHANGED") {
        applyState(msg.state);
      }
    });

    // Respond to the popup's "are you active here?" ping so the UI can glow
    // the row for the site the user is currently on.
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (msg && msg.type === "RC_PING") {
        sendResponse({ siteId: config.siteId, active: active });
        return false;
      }
    });

    // Public handle so the site config can hand us the assembled CSS.
    return {
      setCSS: function (text) {
        cssText = text;
      },
      boot: boot,
    };
  }

  /* ---------- Public API ---------- */

  global.RustChin = {
    /**
     * Called by each sites/<x>.js with its config.
     * Loads the bundled font as a base64 data URL (page CSP blocks external
     * font URLs, so we embed it once and cache), then boots the engine.
     */
    start: function (config) {
      var engine = createEngine(config);

      chrome.runtime.getURL
        ? loadFontAndStart(engine, config)
        : engine.boot();
    },
  };

  function loadFontAndStart(engine, config) {
    var fontURL = chrome.runtime.getURL(
      "fonts/Vazirmatn-Variable.woff2"
    );
    fetch(fontURL)
      .then(function (r) {
        return r.blob();
      })
      .then(function (blob) {
        var reader = new FileReader();
        reader.onloadend = function () {
          var base64 = reader.result;
          // Replace the {{FONT}} placeholder with the embedded font data URL.
          var css = config.css.split("{{FONT}}").join(base64);
          engine.setCSS(css);
          engine.boot();
        };
        reader.readAsDataURL(blob);
      })
      .catch(function (e) {
        console.error("[RustChin] font load failed:", e);
        // Fall back to booting without the embedded font (CSS still applies,
        // just without Vazirmatn). The direction fixes still work.
        engine.setCSS(config.css.split("{{FONT}}").join(""));
        engine.boot();
      });
  }
})(window);
