/* Step 1 — the design of the experiment, as a scrubbable month.

   The point of this step is a gap. The worm arrives, passes through, and is
   gone; then nothing happens for four weeks; and the thing the paper is about
   was left behind during the nothing. A row of ticks states that. Dragging
   through thirty-three days where the status line keeps saying "nothing is
   happening" is a different experience, and it is the one worth building.

   Dates and dose are from the Fig. 1a legend: 600 L3 larvae subcutaneously,
   a 4-5 week rest, 150 EID50 PR8 intranasally on day 33. */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DAYS = 33, FLU = 33;

  /* Phone figures used to shrink rather than reflow. A 920-unit viewBox in the
     435px box a phone gives it renders a 12px label at about 5.6px, and scaling
     the type up with the drawing only crowded it. The figure is now laid out in
     the pixels it actually has — the viewBox matches the box — so a label is the
     size it says it is, at every width, and the timeline stretches instead.
     Below about 620px the vertical layout tightens too; nothing is dropped. */
  var W = 920, H = 272;
  var L = 92, R = 846;                   /* the rail */
  var LANE_A = 96, LANE_B = 168;
  var MOUSE = 56, NARROW = false;
  var Y = { rail: 228, lab: 252, span: 208, spanT: 200,
            headTop: 56, headBot: 234, dose: 44 };

  function measure(svg) {
    var w = Math.round(svg.getBoundingClientRect().width);
    W = w > 40 ? w : 920;
    NARROW = W < 620;
    MOUSE = NARROW ? 40 : 56;
    L = MOUSE + (NARROW ? 22 : 36);
    R = W - (NARROW ? 20 : 74);
    if (NARROW) {
      LANE_A = 86; LANE_B = 146; H = 242;
      Y = { rail: 200, lab: 224, span: 182, spanT: 174,
            headTop: 40, headBot: 206, dose: 30 };
    } else {
      LANE_A = 96; LANE_B = 168; H = 272;
      Y = { rail: 228, lab: 252, span: 208, spanT: 200,
            headTop: 56, headBot: 234, dose: 44 };
    }
  }

  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function X(day) { return L + (R - L) * (day / DAYS); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* What the instrument says at each moment. The long middle entry is the
     step's whole argument, so it is allowed to sit there unchanged for
     nineteen of the thirty-three days. */
  function status(day) {
    if (day < 0.6) return ["Day 0", "600 larvae, injected under the skin"];
    if (day < 4)   return ["Day " + Math.round(day), "They travel from there into the lungs"];
    if (day < 14)  return ["Day " + Math.round(day), "The body pushes it out"];
    if (day < 32)  return ["Day " + Math.round(day), "Nothing visible is happening"];
    return ["Day 33", "The same flu, the same dose — both groups"];
  }

  function build(svg) {
    measure(svg);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var g = el("g", {}, svg);
    var imgH = Math.round(MOUSE * 51 / 56);

    /* ---- the two lanes ---- */
    [[LANE_A, "Trained", "#7af0da"], [LANE_B, "Untrained", "#e4577c"]]
      .forEach(function (r) {
        el("line", { x1: L, y1: r[0], x2: R, y2: r[0],
                     stroke: "rgba(232,237,246,.13)", "stroke-width": 1 }, g);
        var t = el("text", { x: L + 10, y: r[0] - (NARROW ? 20 : 22), fill: r[2], "font-size": 13,
                             "font-weight": 600, "letter-spacing": ".08em",
                             "font-family": "Inter, sans-serif" }, g);
        t.textContent = r[1].toUpperCase();
        /* A real mouse, from Servier Medical Art (CC BY 4.0), per D38 - no
           redrawing the cast. The hand-drawn ellipse that stood here read as a
           grey pill and had to be asked about, which is the whole argument for
           using professional illustration. */
        el("image", { href: "img/mouse.svg", x: L - MOUSE - 18,
                      y: r[0] - Math.round(imgH * .53),
                      width: MOUSE, height: imgH, opacity: .9 }, g);
      });

    /* ---- the rail, to scale ---- */
    el("line", { x1: L, y1: Y.rail, x2: R, y2: Y.rail,
                 stroke: "rgba(232,237,246,.28)", "stroke-width": 1 }, g);
    /* Every tick stays — the rail is to scale and that is the point of it — but
       a narrow rail has no room for six labels, and "28" ran into "day 33". */
    var LABEL = NARROW ? [0, 11, 22, 33] : [0, 7, 14, 21, 28, 33];
    var TICK = NARROW ? [0, 7, 11, 14, 21, 22, 28, 33] : [0, 7, 14, 21, 28, 33];
    TICK.forEach(function (d) {
      var major = LABEL.indexOf(d) >= 0;
      el("line", { x1: X(d), y1: Y.rail - (major ? 5 : 3), x2: X(d), y2: Y.rail + (major ? 5 : 3),
                   stroke: "rgba(232,237,246," + (major ? ".4" : ".25") + ")",
                   "stroke-width": 1 }, g);
    });
    LABEL.forEach(function (d) {
      var t = el("text", { x: X(d), y: Y.lab, fill: "#9aa6bd", "font-size": 12,
                           "text-anchor": d === 0 ? "start" : d === 33 ? "end" : "middle",
                           "font-family": "Inter, sans-serif" }, g);
      t.textContent = d === 0 ? "day 0" : d === 33 ? "day 33" : d;
    });

    /* the span that is the point of the step */
    var span = el("g", { opacity: 0 }, g);
    el("line", { x1: X(14), y1: Y.span, x2: X(33), y2: Y.span,
                 stroke: "rgba(232,237,246,.3)", "stroke-width": 1,
                 "stroke-dasharray": "2 4" }, span);
    /* The caption is longer than the span it marks once the figure is narrow,
       so it hangs from the right-hand end rather than overrunning the frame. */
    var st = el("text", { x: NARROW ? R : (X(14) + X(33)) / 2, y: Y.spanT, fill: "#9aa6bd",
                          "font-size": 11.5, "text-anchor": NARROW ? "end" : "middle",
                          "letter-spacing": ".14em", "font-family": "Inter, sans-serif" }, span);
    st.textContent = "NINETEEN DAYS, NOTHING VISIBLE";

    /* ---- the worm: travels lane A, then is gone ---- */
    var worm = el("path", { d: "", fill: "none", stroke: "#b89a63",
                            "stroke-width": 3.4, "stroke-linecap": "round" }, g);
    var gone = el("g", { opacity: 0 }, g);
    el("line", { x1: X(14), y1: LANE_A - 13, x2: X(14), y2: LANE_A + 13,
                 stroke: "rgba(184,154,99,.5)", "stroke-width": 1 }, gone);
    el("circle", { cx: X(14), cy: LANE_A, r: 3, fill: "#b89a63" }, gone);
    var gt = el("text", { x: X(14) + 8, y: LANE_A - 16, fill: "#b89a63", "font-size": 12,
                          "letter-spacing": ".1em", "font-family": "Inter, sans-serif" }, gone);
    gt.textContent = "GONE";

    /* ---- the flu: same dose, both lanes ---- */
    var flu = el("g", { opacity: 0 }, g);
    [LANE_A, LANE_B].forEach(function (y) {
      for (var i = 0; i < 8; i++) {
        el("circle", { cx: X(FLU) - 48 + (i % 4) * 11, cy: y - 13 + Math.floor(i / 4) * 13,
                       r: 3.4, fill: "#ffd27a" }, flu);
      }
    });
    var dose = el("text", { x: X(FLU) - 6, y: Y.dose, fill: "#c7a66a", "font-size": 12,
                            "text-anchor": "end", "letter-spacing": ".12em",
                            "font-family": "Inter, sans-serif", opacity: 0 }, g);
    dose.textContent = "150 EID50 PR8, INTRANASAL";

    /* ---- playhead ---- */
    var head = el("line", { x1: L, y1: Y.headTop, x2: L, y2: Y.headBot,
                            stroke: "rgba(111,227,208,.55)", "stroke-width": 1.5 }, g);
    var knob = el("circle", { cx: L, cy: Y.headBot, r: 5, fill: "#6fe3d0" }, g);

    return function render(t) {
      var day = t * DAYS, x = X(day);
      head.setAttribute("x1", x); head.setAttribute("x2", x);
      knob.setAttribute("cx", x);

      if (day < 14) {
        var head0 = X(Math.min(day, 14));
        var tail = X(clamp(day - 3.2, 0, 14));
        var d = "";
        for (var s = 0; s <= 10; s++) {
          var px = tail + (head0 - tail) * (s / 10);
          var py = LANE_A + Math.sin(s * 1.05 + day * 1.5) * 6.5;
          d += (s ? " L" : "M") + px + "," + py;
        }
        worm.setAttribute("d", d);
        worm.setAttribute("opacity", clamp(day / .9, 0, 1) * clamp((14 - day) / 3, 0, 1));
        gone.setAttribute("opacity", 0);
      } else {
        worm.setAttribute("opacity", 0);
        gone.setAttribute("opacity", clamp((day - 14) / 2, 0, 1) * .95);
      }

      span.setAttribute("opacity", clamp((day - 15) / 3, 0, 1) * .9);
      var f = clamp((day - 32) / 1, 0, 1);
      flu.setAttribute("opacity", f);
      dose.setAttribute("opacity", f);
      return status(day);
    };
  }

  function init() {
    var plate = document.getElementById("plate-setup");
    if (!plate) return;
    var svg = plate.querySelector("svg[data-ex]");
    var dayOut = plate.querySelector("[data-day]");
    var noteOut = plate.querySelector("[data-note]");
        var render = build(svg), builtAt = W;

    var t = 0, raf = null, held = false, DUR = 13000, pause = null, pausedOut = false;
    /* Fetched before the first paint(). The reduced-motion branch paints once and
       never again, so a rail assigned later never got its value written — and the
       `var rail` that used to sit on the line above nulled an earlier assignment
       straight back out. */
    var rail = plate.querySelector("[data-rail]");
        function paint() {
      var s = render(t);
      dayOut.textContent = s[0];
      noteOut.textContent = s[1];
                  /* Only on a whole-day change: written every frame, a focused slider
         announces continuously for the length of the animation. */
      var d = Math.round(t * DAYS);
      if (rail && d !== paint.said) {
        paint.said = d;
        rail.setAttribute("aria-valuenow", d);
        rail.setAttribute("aria-valuetext", s[1]);
      }
    }
    function step(ts) {
      if (!step.last) step.last = ts;
      t = clamp(t + (ts - step.last) / DUR, 0, 1);
      step.last = ts; paint();
            raf = t < 1 ? requestAnimationFrame(step) : null;
            if (!raf && pause) pause.hidden = true;
    }
            function start() {
      /* Reduced motion means no sweep, including the one Replay asks for. */
            if (still) { t = 1; paint(); if (pause) pause.hidden = true; return; }
      if (held || raf || t >= 1) return;
            if (pause) { pause.hidden = false; say("Pause"); }
      step.last = 0; raf = requestAnimationFrame(step);
    }
            function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    /* aria-label overrides the content, so it has to move with it. */
    function say(word) {
      pause.textContent = word;
      pause.setAttribute("aria-label", word + " the month");
    }
    /* Taking hold is a pause by another route, so the button has to agree: the
       label AND the enabled state, which step() may have switched off at the end. */
        function hold() {
      /* nothing runs under reduced motion, so there is nothing to resume */
      if (pause && !still) { say("Resume"); pause.hidden = false; }
    }

    paint();
        if (still) { t = 1; paint(); pausedOut = true; }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); });
      }, { threshold: .4 }).observe(plate);
    } else start();

    /* The layout is in pixels, so a width change is a relayout, not a rescale. */
    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var w = Math.round(svg.getBoundingClientRect().width);
        if (!(w > 40) || Math.abs(w - builtAt) < 8) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        render = build(svg); builtAt = W; paint();
      }, 150);
    });

    /* taking hold hands playback over (style guide §5) */
    function scrub(ev) {
      var r = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var frac = (cx / r.width * W - L) / (R - L);
      t = clamp(frac, 0, 1); paint();
    }
    function down(ev) {
      held = true; stop(); hold(); plate.setAttribute("data-grabbing", "true");
      scrub(ev); if (ev.cancelable) ev.preventDefault();
    }
    svg.addEventListener("mousedown", down);
    svg.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", function (e) { if (plate.getAttribute("data-grabbing")) scrub(e); });
    window.addEventListener("touchmove", function (e) {
      if (plate.getAttribute("data-grabbing")) { scrub(e); if (e.cancelable) e.preventDefault(); }
    }, { passive: false });
    ["mouseup", "touchend"].forEach(function (k) {
      window.addEventListener(k, function () { plate.removeAttribute("data-grabbing"); });
    });

            /* keyboard: the rail is a slider */
    rail.addEventListener("keydown", function (ev) {
      var d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1,
                PageDown: -7, PageUp: 7 }[ev.key];
      if (ev.key === "Home") { t = 0; }
      else if (ev.key === "End") { t = 1; }
      else if (d === undefined) return;
      else t = clamp(t + d / DAYS, 0, 1);
            held = true; stop(); hold(); paint(); ev.preventDefault();
    });

        /* WCAG 2.2.2: anything that moves by itself for more than five seconds
       needs a visible way to stop it. Dragging the rail already does, but a
       reader who is not dragging has no way to know that. */
            pause = plate.querySelector('[data-act="pause"]');
        if (pausedOut) pause.hidden = true;
    pause.addEventListener("click", function () {
      if (held) {
        held = false;
        if (t >= 1) { t = 0; paint(); }
        start(); say("Pause");
      } else {
        held = true; stop(); say("Resume");
      }
    });

    plate.querySelector('[data-act="replay"]').addEventListener("click", function () {
      say("Pause");
      stop(); t = 0; held = false; paint(); start();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
