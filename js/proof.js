/* Step 5 — the proof, as an argument that accumulates.

   Five branches from one starting point, revealed in order, because the shape of
   the reasoning IS the content: each branch removes an explanation, and the last
   one removes the explanation you had just settled on.

   Three hard rules from docs/walkthrough.md live in this file:
   - Branch 4's milder dose is labelled IN the graphic, not only in a caption.
     Without it the picture says "transfer saved them from a lethal flu", which
     the paper does not show.
   - The never-trained branch is drawn as a CONTROL, visibly subordinate. If a
     reader comes away thinking it is what proves the memory is local, the
     step has taught the wrong thing - all four round-one reviewers caught
     that error in the claims, and it must not reappear in the drawing.
   - Nothing may show replacement cells arriving from the bone marrow. The paper
     says "local and/or BM-derived" and does not separate them. */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TEAL = "#7af0da", ROSE = "#e4577c", GREY = "#8d99b0", AMBER = "#c7a66a";

  var BRANCHES = [
    { y: 86,  kind: "main", tone: TEAL,
      cond: "A trained mouse, left alone",
      why: "The result that needs explaining.",
      out: "All survived", outTone: TEAL,
      note: "The starting point. A month after the worm, the same lethal flu." },

    { y: 170, kind: "main", tone: ROSE,
      cond: "A trained mouse — macrophages taken out, new ones let in",
      why: "So the protection depended on those cells.",
      out: "All died", outTone: ROSE,
      note: "This is the branch that puts the memory in the lung. No more virus on the one day it was measured, which the researchers read as worse damage rather than a bigger infection." },

    { y: 244, kind: "control", tone: GREY,
      cond: "An untrained mouse — macrophages replaced anyway",
      why: "So the swap itself is not what kills.",
      out: "No change", outTone: GREY,
      note: "A control, not part of the argument. It shows that swapping the cells does not by itself make a mouse sicker." },

    { y: 322, kind: "main", tone: TEAL,
      cond: "Trained macrophages moved into an untrained mouse",
      why: "So the cells carry it with them.",
      out: "Less weight loss", outTone: TEAL,
      tag: "at a milder flu dose",
      note: "Protection travels with the cells. But this test used a gentler dose, so it shows less illness — not survival against a lethal one." },

    { y: 414, kind: "reveal", tone: ROSE,
      cond: "A trained mouse, macrophages intact — partner cells blocked",
      why: "So the macrophages had help.",
      out: "Died anyway", outTone: ROSE,
      note: "The macrophages had help. Block the eosinophils that gather beside them and the protection goes — though other cells shifted too, so this is not a clean test of one cell." }
  ];

  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }

  function build(svg) {
    var W = 920, H = 480, SPINE = 104;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    el("line", { x1: SPINE, y1: 56, x2: SPINE, y2: 446,
                 stroke: "rgba(232,237,246,.22)", "stroke-width": 1.5 }, svg);
    var cap = el("text", { x: SPINE + 8, y: 38, fill: "#9aa6bd", "font-size": 11,
                           "letter-spacing": ".14em",
                           "font-family": "Inter, sans-serif" }, svg);
    cap.textContent = "FIVE VERSIONS OF ONE EXPERIMENT";

    return BRANCHES.map(function (b) {
      var g = el("g", { opacity: 0 }, svg);
      var sub = b.kind === "control";
      var x0 = SPINE, x1 = sub ? 196 : 168, xEnd = sub ? 598 : 640;

      /* the branch: out of the spine, then flat */
      var path = el("path", {
        d: "M" + x0 + "," + (b.y - 40) + " Q" + x0 + "," + b.y + " " + x1 + "," + b.y +
           " L" + xEnd + "," + b.y,
        fill: "none", stroke: b.tone, "stroke-width": sub ? 1 : 2,
        "stroke-dasharray": sub ? "3 4" : "none", opacity: sub ? .55 : .85
      }, g);

      if (b.kind === "control") {
        var badge = el("text", { x: x1 + 4, y: b.y - 12, fill: "#aab6cb", "font-size": 11.5,
                                 "letter-spacing": ".16em", "font-family": "Inter, sans-serif" }, g);
        badge.textContent = "CONTROL";
      }

      var cond = el("text", { x: x1 + 6, y: b.y - (sub ? -17 : 12),
                              fill: sub ? "#9aa6bd" : "#e8edf6",
                              "font-size": sub ? 13 : 14.5,
                              "font-family": "Inter, sans-serif" }, g);
            cond.textContent = b.cond;

      var why = el("text", { x: x1 + 6, y: b.y + (sub ? 33 : 18),
                             fill: "#aab6cb", "font-size": 12.5,
                             "font-style": "italic",
                             "font-family": "Inter, sans-serif" }, g);
      why.textContent = b.why;

      /* the outcome, at the end of the branch */
      var oc = el("g", { transform: "translate(" + (xEnd + 14) + "," + b.y + ")" }, g);
      el("circle", { cx: 0, cy: 0, r: 4, fill: b.outTone }, oc);
      var ot = el("text", { x: 14, y: 5, fill: b.outTone,
                            "font-size": sub ? 13 : 15, "font-weight": 600,
                            "font-family": "Inter, sans-serif" }, oc);
      ot.textContent = b.out;

      /* Branch 4's dose lives here, inside the graphic, by rule. */
      if (b.tag) {
        var tag = el("text", { x: 14, y: 23, fill: AMBER, "font-size": 11.5,
                               "letter-spacing": ".08em", "font-family": "Inter, sans-serif" }, oc);
        tag.textContent = b.tag.toUpperCase();
      }

      if (b.kind === "reveal") {
        el("line", { x1: x1 + 2, y1: b.y - 30, x2: xEnd, y2: b.y - 30,
                     stroke: "rgba(199,166,106,.45)", "stroke-width": 1,
                     "stroke-dasharray": "2 5" }, g);
        var rv = el("text", { x: x1 + 6, y: b.y - 38, fill: AMBER, "font-size": 11.5,
                              "letter-spacing": ".18em", "font-family": "Inter, sans-serif" }, g);
        rv.textContent = "AND THEN ONE MORE";
      }
            return { g: g, data: b };
    });
  }

  /* The same five branches as a list, for screens too narrow to hold the drawing. */
  function buildList(ul) {
    return BRANCHES.map(function (b) {
      var li = document.createElement("li");
      li.className = "pbranch" + (b.kind === "control" ? " is-control" : "");
      li.style.setProperty("--tone", b.tone);
      li.innerHTML =
        (b.kind === "control" ? '<span class="pb-badge">Control</span>' : "") +
        '<p class="pb-cond">' + b.cond + "</p>" +
        '<p class="pb-out">' + b.out +
        (b.tag ? ' <span class="pb-tag">' + b.tag + "</span>" : "") + "</p>" +
        '<p class="pb-why">' + b.why + "</p>";
      ul.appendChild(li);
      return li;
    });
  }

  function init() {
    var plate = document.getElementById("plate-proof");
    if (!plate) return;
    var svg = plate.querySelector("svg[data-ex]");
    var note = plate.querySelector("[data-pnote]");
        var rows = build(svg);
    var list = plate.querySelector("[data-plist]");
    var items = list ? buildList(list) : [];
        var shown = 0, paused = false, pause = plate.querySelector('[data-act="pause"]');
    /* aria-label overrides the content, so it has to move with it. */
    function say(word) {
      pause.textContent = word;
      pause.setAttribute("aria-label", word + " the five branches");
    }

    function reveal(i) {
      if (i >= rows.length) return;
            rows[i].g.setAttribute("opacity", 1);
      rows[i].g.classList.add("branch-in");
      if (items[i]) items[i].classList.add("is-in");
      note.textContent = rows[i].data.note;
      shown = i + 1;
      plate.querySelector("[data-step]").textContent = shown + " of " + rows.length;
    }
            function all() { if (pause) { pause.hidden = true; say("Pause"); }
                     paused = false;
                     rows.forEach(function (r, i) { r.g.setAttribute("opacity", 1); });
                     items.forEach(function (li) { li.classList.add("is-in"); });
                     shown = rows.length;
                     note.textContent = rows[rows.length - 1].data.note;
                     plate.querySelector("[data-step]").textContent = rows.length + " of " + rows.length; }

    var timer = null;
            function run() {
      if (still) { all(); return; }
      if (timer || paused) return;
      var i = shown;
      (function next() {
                if (i >= rows.length) { timer = null; if (pause) pause.hidden = true; return; }
        reveal(i);
        /* a longer beat before the last one: the reader thinks it is finished */
        var wait = (i === rows.length - 2) ? 2600 : 1400;
        i++;
        timer = setTimeout(next, wait);
      })();
    }

    if (still) { all(); }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); ob.disconnect(); } });
      }, { threshold: 0, rootMargin: "-20% 0px -20% 0px" }).observe(plate);
    } else run();

        /* WCAG 2.2.2, same as the two rails. "Show all five" ends the sequence but
       does not read as a stop, and cannot be resumed. */
        pause.addEventListener("click", function () {
      if (paused) { paused = false; say("Pause"); run(); }
      else {
        paused = true; say("Resume");
        if (timer) { clearTimeout(timer); timer = null; }
      }
    });

    plate.querySelector('[data-act="all"]').addEventListener("click", function () {
      if (timer) { clearTimeout(timer); timer = null; }
      all();
    });
    plate.querySelector('[data-act="replay"]').addEventListener("click", function () {
            if (timer) { clearTimeout(timer); timer = null; }
            paused = false; say("Pause"); pause.hidden = false;
            rows.forEach(function (r) { r.g.setAttribute("opacity", 0); r.g.classList.remove("branch-in"); });
      items.forEach(function (li) { li.classList.remove("is-in"); });
      shown = 0;
      plate.querySelector("[data-step]").textContent = "0 of " + rows.length;
      note.textContent = " ";
      setTimeout(run, 300);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
