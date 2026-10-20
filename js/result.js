/* Step 2 — the outcome, with the numbers counting as it happens.

   The device here is the pair of live readouts. Watching "0% alive" arrive while
   you drag through day six is a different thing from reading that all the control
   mice died, and it is the honest version of the same sentence.

   Curve values are read off Fig. 1b,c and are a schematic of them, which the
   plate says. Two shapes carry the claims and must survive any restyling: one
   survival line never moves, and the trained weight line stops falling rather
   than returning to where it started (D55). */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DAYS = 10;

  /* Phone figures used to shrink rather than reflow. A 920-unit viewBox in the
     435px box a phone gives it renders an 11px label at about 5.2px, and scaling
     the type up with the drawing only crowded it. The figure is now laid out in
     the pixels it actually has — the viewBox matches the box — so a label is the
     size it says it is, at every width. Below about 620px the two panels stop
     sharing a row and stack, which is the room the labels need. */
  function layout(svg) {
    var w = Math.round(svg.getBoundingClientRect().width);
    var W = w > 40 ? w : 920;
    if (W < 620) {
      var padL = 46, pw = W - padL - 14, ph = Math.max(110, Math.min(150, Math.round(W * .32)));
      return { W: W, pw: pw, ph: ph, padL: padL, span: pw,
               at: [[padL, 36], [padL, 36 + ph + 70]], H: 36 + ph + 70 + ph + 36 };
    }
    /* the proportions the wide layout has always had: 92 / 300 / 138 / 300 */
    var pL = Math.round(W * .1), gap = Math.round(W * .15);
    var pwide = Math.round((W - pL - gap - Math.round(W * .098)) / 2);
    return { W: W, pw: pwide, ph: 180, padL: pL, span: pL + pwide + gap + pwide - pL,
             at: [[pL, 46], [pL + pwide + gap, 46]], H: 290 };
  }
  var LAY = null;

  var SURV_T = [[0, 100], [10, 100]];
  /* Read off Fig. 1c: 100% until day 7, 50% at day 7, zero at day 8. The abstract
     says "succumbed by days 5-6"; the figure says otherwise and the site follows
     the figure (D55). The near-duplicate x values draw the Kaplan-Meier steps. */
  var SURV_C = [[0, 100], [6.98, 100], [7, 50], [7.98, 50], [8, 0], [10, 0]];
  var WT_T = [[0, 100], [1, 99.3], [2, 99.3], [3, 99], [5, 97], [6, 92.5],
              [7, 92.3], [8, 93.5], [9, 93], [10, 93]];
  var WT_C = [[0, 100], [1, 99.7], [2, 97.5], [3, 96], [5, 83.4], [6, 76.6], [7, 72.3]];

  var TEAL = "#7af0da", ROSE = "#e4577c";

  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function at(data, day) {
    if (day <= data[0][0]) return data[0][1];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] >= day) {
        var p = data[i - 1], n = data[i];
        return p[1] + (n[1] - p[1]) * ((day - p[0]) / (n[0] - p[0]));
      }
    }
    return null;                       /* past the last measurement: say nothing */
  }

  function panel(svg, ox, oy, pw, ph, title, yMin, yMax, ticks, unit, series) {
    var g = el("g", { transform: "translate(" + ox + "," + oy + ")" }, svg);
    var t = el("text", { x: 0, y: -18, fill: "#e8edf6", "font-size": 12,
                         "font-weight": 600, "letter-spacing": ".16em",
                         "font-family": "Inter, sans-serif" }, g);
    t.textContent = title.toUpperCase();

    function X(d) { return (d / DAYS) * pw; }
    function Y(v) { return ph - ((v - yMin) / (yMax - yMin)) * ph; }

    ticks.forEach(function (v) {
      el("line", { x1: 0, y1: Y(v), x2: pw, y2: Y(v),
                   stroke: "rgba(232,237,246,.09)", "stroke-width": 1 }, g);
      var l = el("text", { x: -10, y: Y(v) + 4, fill: "#9aa6bd", "font-size": 11,
                           "text-anchor": "end", "font-family": "Inter, sans-serif" }, g);
      l.textContent = v + unit;
    });
    [0, 2, 4, 6, 8, 10].forEach(function (d) {
      var l = el("text", { x: X(d), y: ph + 22, fill: "#9aa6bd", "font-size": 11,
                           "text-anchor": "middle", "font-family": "Inter, sans-serif" }, g);
      l.textContent = d === 0 ? "flu" : d;
    });

    var drawn = series.map(function (s) {
      var lab = el("text", { fill: s.colour, "font-size": 11.5, "font-weight": 600,
                             "text-anchor": "end", x: pw,
                             "font-family": "Inter, sans-serif", opacity: 0 }, g);
      lab.textContent = s.label;
      return {
        s: s,
        path: el("path", { d: "", fill: "none", stroke: s.colour, "stroke-width": 2.5,
                           "stroke-dasharray": s.dash || "none",
                           "stroke-linejoin": "round", "stroke-linecap": "round" }, g),
        dot: el("circle", { r: 4, fill: s.colour, opacity: 0 }, g),
        lab: lab
      };
    });
    var head = el("line", { x1: 0, y1: -6, x2: 0, y2: ph,
                            stroke: "rgba(111,227,208,.4)", "stroke-width": 1 }, g);

    return function (day) {
      head.setAttribute("x1", X(day)); head.setAttribute("x2", X(day));
      drawn.forEach(function (o) {
        var pts = [], data = o.s.data, last = data[data.length - 1][0];
        var upto = Math.min(day, last);
        for (var i = 0; i < data.length; i++) {
          if (data[i][0] <= upto) pts.push(data[i]);
          else break;
        }
        var v = at(data, upto);
        if (pts.length && pts[pts.length - 1][0] < upto) pts.push([upto, v]);
        if (pts.length < 2) {
          o.path.setAttribute("d", ""); o.dot.setAttribute("opacity", 0);
          o.lab.setAttribute("opacity", 0);     /* or it survives the rewind */
          return;
        }
        o.path.setAttribute("d", pts.map(function (p, i) {
          return (i ? "L" : "M") + X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1);
        }).join(" "));
        o.dot.setAttribute("cx", X(upto)); o.dot.setAttribute("cy", Y(v));
        o.dot.setAttribute("opacity", day <= last ? 1 : .35);
        var end = data[data.length - 1][1];
        var ly = o.s.above ? Y(end) - 10 : Y(end) + 18;
        if (ly > ph + 2) ly = Y(end) - 10;
        o.lab.setAttribute("y", ly);
        o.lab.setAttribute("opacity", clamp((day - 1.4) / 1.6, 0, 1));
      });
    };
  }

  function init() {
    var plate = document.getElementById("plate-result");
    if (!plate) return;
    var svg = plate.querySelector("svg[data-ex]");
    var a, b;

    function build() {
      LAY = layout(svg);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("viewBox", "0 0 " + LAY.W + " " + LAY.H);
      a = panel(svg, LAY.at[0][0], LAY.at[0][1], LAY.pw, LAY.ph,
                "Survived", 0, 100, [0, 50, 100], "%", [
        { data: SURV_T, colour: TEAL, label: "trained", above: true },
        { data: SURV_C, colour: ROSE, label: "untrained", above: false, dash: "7 4" }
      ]);
      b = panel(svg, LAY.at[1][0], LAY.at[1][1], LAY.pw, LAY.ph,
                "Body weight", 60, 105, [70, 80, 90, 100], "%", [
        { data: WT_T, colour: TEAL, label: "trained", above: true },
        { data: WT_C, colour: ROSE, label: "untrained", above: false, dash: "7 4" }
      ]);
    }
    build();

    /* The layout is in pixels, so a width change is a relayout, not a rescale. */
    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var w = Math.round(svg.getBoundingClientRect().width);
        if (!(w > 40) || Math.abs(w - LAY.W) < 8) return;
        build(); paint(t * DAYS);
      }, 150);
    });

            var dayOut = plate.querySelector("[data-day]");
    var stats = plate.querySelectorAll("[data-stat]");
    var note = plate.querySelector("[data-note]");

    function paint(day) {
      a(day); b(day);
      dayOut.textContent = day < .5 ? "The flu" : "Day " + Math.round(day);
      [SURV_T, SURV_C].forEach(function (d, i) {
        var v = at(d, Math.min(day, 10));
        stats[i].textContent = Math.round(v) + "%";
      });
      /* Past the last measurement, say which day it came from. The group is
         gone by day 8 and there is no later weight; an unlabelled number here
         reads as one. */
      var LAST_C = WT_C[WT_C.length - 1][0];
      var wt = at(WT_T, Math.min(day, 10)), wc = at(WT_C, Math.min(day, LAST_C));
      var wcStale = day > LAST_C + .5;
      if (day < 4) note.textContent = "Both groups are losing a little weight.";
      else if (day < 7) note.textContent = "One group is dropping fast.";
      else if (day < 8.2) note.textContent = "The untrained mice are reaching the end point.";
      else note.textContent = "The trained mice have stopped losing weight — they have not regained it.";
            plate.querySelector("[data-wt]").textContent = wt ? wt.toFixed(0) + "%" : "—";
      plate.querySelector("[data-wc]").textContent =
        wc ? wc.toFixed(0) + "%" + (wcStale ? " on day " + LAST_C : "") : "—";
                  /* see setup.js: whole days only, or a focused slider never stops talking */
      var d = Math.round(day);
      if (rail && d !== paint.said) {
        paint.said = d;
        rail.setAttribute("aria-valuenow", d);
        rail.setAttribute("aria-valuetext", note.textContent);
      }
    }

                var t = 0, raf = null, held = false, DUR = 9000, pause = null, pausedOut = false;
    /* before the first paint(); see setup.js */
    var rail = plate.querySelector("[data-rail]");
    function step(ts) {
      if (!step.last) step.last = ts;
      t = clamp(t + (ts - step.last) / DUR, 0, 1);
      step.last = ts; paint(t * DAYS);
            raf = t < 1 ? requestAnimationFrame(step) : null;
            if (!raf && pause) pause.hidden = true;
    }
            function start() {
      /* Reduced motion means no sweep, including the one Replay asks for. */
            if (still) { t = 1; paint(DAYS); if (pause) pause.hidden = true; return; }
      if (held || raf || t >= 1) return;
            if (pause) { pause.hidden = false; say("Pause"); }
      step.last = 0; raf = requestAnimationFrame(step);
    }
        function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    /* aria-label overrides the content, so it has to move with it. */
    function say(word) {
      pause.textContent = word;
      pause.setAttribute("aria-label", word + " the ten days");
    }
    /* Taking hold is a pause by another route, so the button has to agree: the
       label AND the enabled state, which step() may have switched off at the end. */
        function hold() {
      /* nothing runs under reduced motion, so there is nothing to resume */
      if (pause && !still) { say("Resume"); pause.hidden = false; }
    }

    paint(0);
        if (still) { t = 1; paint(DAYS); pausedOut = true; }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); });
      }, { threshold: 0, rootMargin: "-20% 0px -20% 0px" }).observe(plate);
    } else start();

    function scrub(ev) {
      var r = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      t = clamp((cx / r.width * LAY.W - LAY.padL) / LAY.span, 0, 1);
      paint(t * DAYS);
    }
    function down(ev) {
      held = true; stop(); hold();
      plate.setAttribute("data-grabbing", "true");
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

            rail.addEventListener("keydown", function (ev) {
      var d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[ev.key];
      if (ev.key === "Home") t = 0;
      else if (ev.key === "End") t = 1;
      else if (d === undefined) return;
      else t = clamp(t + d / DAYS, 0, 1);
            held = true; stop(); hold(); paint(t * DAYS); ev.preventDefault();
    });

        /* WCAG 2.2.2: anything that moves by itself for more than five seconds
       needs a visible way to stop it. Dragging the rail already does, but a
       reader who is not dragging has no way to know that. */
            pause = plate.querySelector('[data-act="pause"]');
        if (pausedOut) pause.hidden = true;
    pause.addEventListener("click", function () {
      if (held) {
        held = false;
        if (t >= 1) { t = 0; paint(0); }
        start(); say("Pause");
      } else {
        held = true; stop(); say("Resume");
      }
    });

    plate.querySelector('[data-act="replay"]').addEventListener("click", function () {
      say("Pause");
      stop(); t = 0; held = false; paint(0); start();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
