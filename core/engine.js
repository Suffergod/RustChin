/* ============================================================
   RustChin: Shared RTL Engine
   ------------------------------------------------------------
   One engine, many sites. Each site ships a small config file
   (see sites/*.js) that calls RustChin.start({...}).

   Design contract (do not regress these):
     1. Output parity: the direction-detection algorithm and the
        DOM mutations are identical to the original per-site scripts.
        Optimizations only change HOW OFTEN work runs, not the result.
     2. Live toggle: start()/stop() must be perfectly reversible.
        stop() reverts the page to its original state so toggling
        off never requires a reload.
     3. Hot-path invariants: see the comments marked [PERF].
   ============================================================ */

(function (global) {
  "use strict";

  // Unicode range covering Arabic, Persian, Arabic Supplement, Extended-A,
  // Presentation Forms (A + B). Used to detect RTL script content.
  var RTL_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  var LATIN_RE = /[a-zA-Z]/g;

  /**
   * Decide paragraph direction from text content.
   * Strips URLs and inline code so technical tokens do not invert Persian sentences.
   * Uses first-strong character detection combined with balanced character ratio.
   * Pure function, deterministic.
   */
  function getDirection(text) {
    if (!text) return "ltr";

    // Strip URLs and inline code/backticks from consideration so English identifiers or URLs
    // do not skew paragraph direction.
    var cleaned = text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/`[^`]*`/g, "")
      .trim();
    if (!cleaned) cleaned = text;

    var pMatches = cleaned.match(RTL_RE);
    var pCount = pMatches ? pMatches.length : 0;
    if (pCount === 0) return "ltr";

    var eMatches = cleaned.match(LATIN_RE);
    var eCount = eMatches ? eMatches.length : 0;
    if (eCount === 0) return "rtl";

    // Find first strong directional character (ignoring symbols, digits, punctuation)
    var firstStrong = "";
    for (var i = 0; i < cleaned.length; i++) {
      var ch = cleaned[i];
      if (RTL_RE.test(ch)) {
        firstStrong = "rtl";
        RTL_RE.lastIndex = 0;
        break;
      }
      if (LATIN_RE.test(ch)) {
        firstStrong = "ltr";
        LATIN_RE.lastIndex = 0;
        break;
      }
    }

    // If the sentence begins with Persian, RTL wins as long as Persian is present (>= 20% ratio)
    if (firstStrong === "rtl") {
      if (pCount >= 2 && (pCount / (pCount + eCount)) >= 0.2) return "rtl";
    }

    // General ratio: RTL wins unless Latin heavily dominates (> 2.5x)
    if (eCount > pCount * 2.5) return "ltr";
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
     * so output is byte-identical: inline !important always beats page CSS.
     * A marker class (.rc-done) lets stop() find and revert every mutation,
     * so toggling off is clean without a reload. This hybrid preserves both
     * parity and the revert contract.
     */
    function fixElement(el) {
      // Never touch editable elements or their descendants (ProseMirror, textarea, input, contenteditable).
      // Editable fields are handled exclusively at the root container level by handleDynamicInput.
      if (el.isContentEditable || (el.matches && el.matches("input, textarea, select"))) return;
      if (config.exclude && el.closest(config.exclude)) return;

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
      // but that fragment-inline breaks the sentence: each span lands on its
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
      if (container.isContentEditable || (container.matches && container.matches("input, textarea, select"))) return;
      if (config.exclude && container.matches && container.matches(config.exclude)) return;
      if (container.closest && container.closest("pre, code, [class*='not-prose']")) return;

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
        containers.forEach(function (c) {
          if (c.matches("pre, code, [class*='not-prose']")) return;
          if (c.closest("pre, code, [class*='not-prose']")) return;
          processContainer(c);
        });
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
        // Skip anything inside an editable surface (ProseMirror, textarea, input)
        if (node.isContentEditable || (node.matches && node.matches("input, textarea, select"))) return;
        if (node.closest && node.closest('[contenteditable="true"], textarea, input')) return;
        if (config.exclude && node.matches && node.matches(config.exclude)) return;
        if (node.closest && node.closest("pre, code, [class*='not-prose']")) return;

        // Treat the node itself as a potential message root or text tag.
        try {
          if (config.scanBody) {
            if (node.matches(config.scanSelector)) fixElement(node);
          } else if (node.matches(config.containers)) {
            processContainer(node);
          } else if (config.extraSelector && node.matches(config.extraSelector)) {
            fixElement(node);
          } else if (node.closest(".bidi-scope") || (config.containers && node.closest(config.containers))) {
            // Node was inserted into an existing message container
            if (node.matches(LEAF_TAGS)) fixElement(node);
            node.querySelectorAll(LEAF_TAGS).forEach(fixElement);
            if (node.matches("table")) {
              var tt = node.textContent || "";
              node.setAttribute("dir", getDirection(tt));
              node.querySelectorAll("th, td").forEach(fixElement);
            }
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
      if (!target) return null;
      if (target.nodeType === 3) target = target.parentElement;
      if (!target || target.nodeType !== 1) return null;
      var sel = config.editableSelector;
      if (target.matches && target.matches(sel)) return target;
      if (target.closest) return target.closest(sel);
      return null;
    }

    // [PERF] Throttle to one check per animation frame while typing.
    function handleDynamicInput(e) {
      if (!active) return;
      var target = e.target;
      var inputEl = resolveEditable(target);
      if (!inputEl) return;

      if (rafQueued) return;
      rafQueued = true;
      var update = function () {
        rafQueued = false;
        var text = inputEl.value || inputEl.innerText || inputEl.textContent || "";
        var dir = getDirection(text);

        // Always set dir, text-align, and direction to guarantee right alignment
        // even if host site or Quill already set dir="rtl" without text-align.
        inputEl.setAttribute("dir", dir);
        inputEl.style.setProperty("text-align", dir === "rtl" ? "right" : "left", "important");
        inputEl.style.setProperty("direction", dir, "important");
        if (!inputEl.classList.contains("rc-input")) {
          inputEl.classList.add("rc-input");
        }

        // Gemini support: sync outer rich-textarea if present
        var richParent = inputEl.closest ? inputEl.closest("rich-textarea") : null;
        if (richParent && richParent !== inputEl) {
          richParent.setAttribute("dir", dir);
          richParent.style.setProperty("direction", dir, "important");
          richParent.style.setProperty("text-align", dir === "rtl" ? "right" : "left", "important");
          if (!richParent.classList.contains("rc-input")) {
            richParent.classList.add("rc-input");
          }
        }
      };
      if (global.requestAnimationFrame) {
        requestAnimationFrame(update);
      } else {
        setTimeout(update, 16);
      }
    }

    /**
     * Keyboard shortcut handler (Alt+Shift+X): toggle direction of active input or focused element.
     */
    function toggleActiveInputDirection() {
      if (!active) return;
      var activeEl = document.activeElement;
      var inputEl = resolveEditable(activeEl);
      if (!inputEl) {
        inputEl = document.querySelector(config.editableSelector);
      }
      if (!inputEl) return;

      var currentDir = inputEl.getAttribute("dir") || "ltr";
      var nextDir = currentDir === "rtl" ? "ltr" : "rtl";
      inputEl.setAttribute("dir", nextDir);
      inputEl.style.setProperty("text-align", nextDir === "rtl" ? "right" : "left", "important");
      inputEl.style.setProperty("direction", nextDir, "important");
      if (!inputEl.classList.contains("rc-input")) {
        inputEl.classList.add("rc-input");
      }

      var richParent = inputEl.closest ? inputEl.closest("rich-textarea") : null;
      if (richParent && richParent !== inputEl) {
        richParent.setAttribute("dir", nextDir);
        richParent.style.setProperty("direction", nextDir, "important");
        richParent.style.setProperty("text-align", nextDir === "rtl" ? "right" : "left", "important");
        if (!richParent.classList.contains("rc-input")) {
          richParent.classList.add("rc-input");
        }
      }
    }

    function handleKeydown(e) {
      if (!active) return;
      if (e.altKey && e.shiftKey && (e.key === "X" || e.key === "x" || e.code === "KeyX")) {
        e.preventDefault();
        toggleActiveInputDirection();
      }
    }

    /* ---------- Observer (debatched) ---------- */

    var batchNodes = [];
    var batchScheduled = false;

    function scheduleBatch() {
      if (batchScheduled) return;
      batchScheduled = true;
      // Coalesce mutations in an animation frame instead of a microtask to
      // prevent microtask starvation and allow smooth browser rendering.
      requestAnimationFrame(function () {
        batchScheduled = false;
        var nodes = batchNodes;
        batchNodes = [];
        if (!active || !nodes.length) return;
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
        } else if (m.type === "characterData") {
          var p = m.target.parentElement;
          if (p && !p.isContentEditable) {
            batchNodes.push(p);
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
      // subtree:true keeps coverage across SPA re-renders. characterData:true
      // catches streaming tokens in real time on the next animation frame.
      observer.observe(document.body, { childList: true, characterData: true, subtree: true });

      document.addEventListener("input", handleDynamicInput, true);
      document.addEventListener("keyup", handleDynamicInput, true);
      document.addEventListener("compositionend", handleDynamicInput, true);
      document.addEventListener("keydown", handleKeydown, true);

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
     * so toggling off returns the page to its original look: no reload needed.
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
      document.removeEventListener("keyup", handleDynamicInput, true);
      document.removeEventListener("compositionend", handleDynamicInput, true);
      document.removeEventListener("keydown", handleKeydown, true);

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

      // 4. Revert tables and lists where dir was set.
      document.querySelectorAll("table[dir], ol[dir]").forEach(function (el) {
        el.removeAttribute("dir");
      });

      // 5. Remove font preference attribute and typography metrics from root.
      document.documentElement.removeAttribute("data-rc-font");
      document.documentElement.style.removeProperty("--rc-font-size");
      document.documentElement.style.removeProperty("--rc-line-height");
      document.documentElement.style.removeProperty("--rc-custom-font");
    }

    /* ---------- Boot: load font, read state, maybe start ---------- */

    function applyState(state) {
      var fontPref = (state && state.font) || "vazirmatn";
      if (fontPref && fontPref !== "vazirmatn") {
        document.documentElement.setAttribute("data-rc-font", fontPref);
      } else {
        document.documentElement.removeAttribute("data-rc-font");
      }

      var fontSize = (state && state.fontSize) ? Number(state.fontSize) : 15;
      var lineHeight = (state && state.lineHeight) ? Number(state.lineHeight) : 1.8;
      var customFont = (state && state.customFont) ? String(state.customFont).trim() : "";

      document.documentElement.style.setProperty("--rc-font-size", fontSize + "px");
      document.documentElement.style.setProperty("--rc-line-height", String(lineHeight));

      if (customFont) {
        var sanitizedFont = customFont.replace(/['";\\]/g, "");
        document.documentElement.style.setProperty("--rc-custom-font", "'" + sanitizedFont + "', sans-serif");
      } else {
        document.documentElement.style.removeProperty("--rc-custom-font");
      }

      var siteEnabled = true;
      if (state && state.sites) {
        if (state.sites[config.host] !== undefined) {
          siteEnabled = state.sites[config.host] !== false;
        } else if (config.altHost && state.sites[config.altHost] !== undefined) {
          siteEnabled = state.sites[config.altHost] !== false;
        }
      }
      var on = state && state.masterEnabled !== false && siteEnabled;
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
      } else if (msg && msg.type === "TOGGLE_INPUT_DIRECTION") {
        toggleActiveInputDirection();
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
     * Loads the bundled fonts as base64 data URLs (page CSP blocks external
     * font URLs, so we embed once and cache), then boots the engine.
     */
    start: function (config) {
      var engine = createEngine(config);

      chrome.runtime.getURL
        ? loadFontAndStart(engine, config)
        : engine.boot();
    },
  };

  function readBlobAsDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function fetchFontAsDataURL(relativePath) {
    var url = chrome.runtime.getURL(relativePath);
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + relativePath);
        return r.blob();
      })
      .then(readBlobAsDataURL);
  }

  function loadFontAndStart(engine, config) {
    Promise.all([
      fetchFontAsDataURL("fonts/Vazirmatn-Variable.woff2"),
      fetchFontAsDataURL("fonts/Estedad-Variable.woff2"),
      fetchFontAsDataURL("fonts/Sahel-Variable.woff2"),
      fetchFontAsDataURL("fonts/Arad-Variable.woff2"),
      fetchFontAsDataURL("fonts/Mikhak-Variable.woff2"),
    ])
      .then(function (results) {
        var vazirBase64 = results[0];
        var estedadBase64 = results[1];
        var sahelBase64 = results[2];
        var aradBase64 = results[3];
        var mikhakBase64 = results[4];
        var css = config.css
          .split("{{VAZIR_FONT}}").join(vazirBase64)
          .split("{{ESTEDAD_FONT}}").join(estedadBase64)
          .split("{{SAHEL_FONT}}").join(sahelBase64)
          .split("{{ARAD_FONT}}").join(aradBase64)
          .split("{{MIKHAK_FONT}}").join(mikhakBase64)
          .split("{{FONT}}").join(vazirBase64);
        engine.setCSS(css);
        engine.boot();
      })
      .catch(function (e) {
        console.error("[RustChin] multi-font load failed, attempting fallback:", e);
        fetchFontAsDataURL("fonts/Vazirmatn-Variable.woff2")
          .then(function (vazirBase64) {
            var css = config.css
              .split("{{VAZIR_FONT}}").join(vazirBase64)
              .split("{{ESTEDAD_FONT}}").join(vazirBase64)
              .split("{{SAHEL_FONT}}").join(vazirBase64)
              .split("{{ARAD_FONT}}").join(vazirBase64)
              .split("{{MIKHAK_FONT}}").join(vazirBase64)
              .split("{{FONT}}").join(vazirBase64);
            engine.setCSS(css);
            engine.boot();
          })
          .catch(function () {
            engine.setCSS(
              config.css
                .split("{{VAZIR_FONT}}").join("")
                .split("{{ESTEDAD_FONT}}").join("")
                .split("{{SAHEL_FONT}}").join("")
                .split("{{ARAD_FONT}}").join("")
                .split("{{MIKHAK_FONT}}").join("")
                .split("{{FONT}}").join("")
            );
            engine.boot();
          });
      });
  }
})(window);
