/* Three-depth explanations.
   Progressive enhancement on purpose: with JavaScript off, every depth is
   visible and the page still reads as a complete explainer. This script only
   folds the depths into a tab strip once it knows it can unfold them again. */

(function () {
  "use strict";

  var DEPTHS = [
    { key: "kids", label: "For kids" },
    { key: "everyone", label: "For everyone" },
    { key: "scientists", label: "For scientists" }
  ];
  var DEFAULT = "everyone";          // guide §6
  var STORE = "calmlung:depth";

  // Remembering the reader's choice is a convenience, never state we rely on.
  function remembered() {
    try {
      var v = window.localStorage.getItem(STORE);
      return DEPTHS.some(function (d) { return d.key === v; }) ? v : DEFAULT;
    } catch (e) { return DEFAULT; }
  }
  function remember(key) {
    try { window.localStorage.setItem(STORE, key); } catch (e) { /* private mode */ }
  }

  var current = remembered();
  var groups = [];

  function build(placard, index) {
    var body = placard.querySelector(".placard-body");
    if (!body) return;

    var panels = {};
    DEPTHS.forEach(function (d) {
      var el = body.querySelector(".for-" + d.key);
      if (el) panels[d.key] = el;
    });
    var present = DEPTHS.filter(function (d) { return panels[d.key]; });
    if (present.length < 2) return;   // nothing to switch between

    var strip = document.createElement("div");
    strip.className = "placard-depths";
    strip.setAttribute("role", "tablist");
    strip.setAttribute("aria-label", "Reading level");

    var buttons = {};
    present.forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = d.label;
      b.id = "depth-" + index + "-" + d.key;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", "false");
      b.setAttribute("aria-controls", "panel-" + index + "-" + d.key);
      b.tabIndex = -1;
      b.addEventListener("click", function () { select(d.key, true); });
      b.addEventListener("keydown", function (ev) { onKey(ev, d.key, index); });
      strip.appendChild(b);
      buttons[d.key] = b;

      panels[d.key].id = "panel-" + index + "-" + d.key;
      panels[d.key].setAttribute("role", "tabpanel");
      panels[d.key].setAttribute("aria-labelledby", b.id);
      panels[d.key].setAttribute("tabindex", "0");
    });

    placard.insertBefore(strip, body);
    groups.push({ keys: present.map(function (d) { return d.key; }),
                  buttons: buttons, panels: panels });
  }

  /* `from` is the index of the group the key was pressed in. Without it, focus
     lands on the first group that has the destination key - which is always
     group 0, because every placard carries every depth. */
  function onKey(ev, key, from) {
    var order = DEPTHS.map(function (d) { return d.key; });
    var i = order.indexOf(key), next = null;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") next = order[(i + 1) % order.length];
    if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") next = order[(i - 1 + order.length) % order.length];
    if (ev.key === "Home") next = order[0];
    if (ev.key === "End") next = order[order.length - 1];
    if (!next) return;
    ev.preventDefault();
    select(next, true);
    var g = groups[from] && groups[from].buttons[next] ? groups[from]
          : groups.find(function (g) { return g.buttons[next]; });
    if (g && g.buttons[next]) g.buttons[next].focus();
  }

  /* One choice applies to the whole site: a reader who picks "For kids" wants
     it everywhere, not once per graphic. */
  function select(key, persist) {
    current = key;
    if (persist) remember(key);
    groups.forEach(function (g) {
      var use = g.keys.indexOf(key) >= 0 ? key : DEFAULT;
      g.keys.forEach(function (k) {
        var on = k === use;
        g.buttons[k].setAttribute("aria-selected", String(on));
        g.buttons[k].tabIndex = on ? 0 : -1;
        g.panels[k].classList.toggle("is-shown", on);
      });
    });
  }

  function init() {
    document.documentElement.classList.add("js");
    var placards = document.querySelectorAll(".placard");
    Array.prototype.forEach.call(placards, build);
    select(current, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
