/* Step 6 — how the cells remember.

   The one place on this site where dimensional drawing is honest, because the
   subject really is DNA and its geometry is textbook (D64). Everywhere else a
   rotating three-dimensional cell would be a confident lie about morphology.

   The two things this step must not do, both from walkthrough.md:
   - It must not draw the resting trained cell running the repair programme.
   - It must not draw it producing nothing different from an untrained one
     either. A short list, Arg1 among it, is already being read.

   The locus strip exists for the second trap in claim 6.4: naming the
   IL-4 -> STAT6 -> PPARy pathway does not mean every part of it is turned up.
   Stat6's locus is MORE accessible while its transcript is LOWER. A explanation with
   every arrow pointing up would state the opposite of the measurement. */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SEGS = 15;

  /* Phone figures used to shrink rather than reflow. A 920-unit viewBox in the
     435px box a phone gives it renders a 12px label at about 5.6px, and scaling
     the type up with the drawing only crowded it. The figure is now laid out in
     the pixels it actually has — the viewBox matches the box — so a label is the
     size it says it is, at every width, and the drawing stretches instead. */
  function boxWidth(svg) {
    var w = Math.round(svg.getBoundingClientRect().width);
    return w > 40 ? w : 920;
  }

  /* openness per segment, 0 packed .. 1 open. Trained opens far more than it
     closes, which is the 24,456 against 310 in the readout. */
  /* The two stretches that stay shut must not sit under a labelled locus: every
     locus on this plate is one the paper reports as MORE accessible, and closing
     the segment under Stat6 drew the opposite of the table beneath it. Loci live
     at segments 2, 5, 9 and 12, so the closed pair are 7 and 10. */
  var NAIVE   = [.10,.08,.12,.10,.09,.13,.08,.11,.10,.12,.09,.08,.11,.10,.09];
  var TRAINED = [.88,.82,.92,.80,.86,.90,.84,.14,.83,.89,.17,.81,.91,.85,.87];

  var LOCI = [
    { seg: 2,  name: "Pparg",  access: "more open",  read: "being read more" },
    { seg: 5,  name: "Arg1",   access: "more open",  read: "being read more" },
    { seg: 9,  name: "Stat6",  access: "more open",  read: "being read LESS", flag: true },
    { seg: 12, name: "Ccl11",  access: "more open",  read: "being read more" }
  ];

  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function build(svg) {
    var W = boxWidth(svg), H = 168, MID = 60;
    var L = Math.round(W * .065), R = W - L;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var segW = (R - L) / SEGS;

    var segs = [];
    for (var i = 0; i < SEGS; i++) {
      var g = el("g", {}, svg);
      segs.push({
        a: el("path", { fill: "none", stroke: "#8f6fd0", "stroke-width": 2,
                        "stroke-linecap": "round" }, g),
        b: el("path", { fill: "none", stroke: "#c9a5ff", "stroke-width": 2,
                        "stroke-linecap": "round" }, g),
        rungs: el("g", { stroke: "#8f6fd0", "stroke-width": 1.6 }, g),
        x0: L + i * segW
      });
    }

    /* the loci markers sit under their segment */
    LOCI.forEach(function (lo) {
      var x = L + (lo.seg + .5) * segW;
      el("line", { x1: x, y1: MID + 34, x2: x, y2: MID + 50,
                   stroke: lo.flag ? "#c7a66a" : "rgba(232,237,246,.3)", "stroke-width": 1 }, svg);
      var t = el("text", { x: x, y: MID + 66, "text-anchor": "middle",
                           fill: lo.flag ? "#c7a66a" : "#9aa6bd",
                           "font-size": 12, "font-style": "italic",
                           "font-family": "Inter, sans-serif" }, svg);
      t.textContent = lo.name;
    });

    return function render(t) {
      segs.forEach(function (s, i) {
        var open = lerp(NAIVE[i], TRAINED[i], t);
        var amp = lerp(2.5, 21, open);      /* packed = flat and tight */
        var turns = lerp(7, 1.7, open);     /* packed = many fast turns */
        var da = "", db = "", step = segW / 16;
        for (var k = 0; k <= 16; k++) {
          var x = s.x0 + k * step;
          var ph = (k / 16) * Math.PI * 2 * turns;
          var ya = MID + Math.sin(ph) * amp;
          var yb = MID + Math.sin(ph + Math.PI) * amp;
          da += (k ? "L" : "M") + x.toFixed(1) + "," + ya.toFixed(1);
          db += (k ? "L" : "M") + x.toFixed(1) + "," + yb.toFixed(1);
        }
        s.a.setAttribute("d", da);
        s.b.setAttribute("d", db);
        s.a.setAttribute("opacity", lerp(.45, 1, open));
        s.b.setAttribute("opacity", lerp(.45, 1, open));

        /* rungs only resolve once a stretch is open enough to read */
        while (s.rungs.firstChild) s.rungs.removeChild(s.rungs.firstChild);
        if (open > .45) {
          for (var r = 1; r < 16; r += 3) {
            var rx = s.x0 + r * step, rph = (r / 16) * Math.PI * 2 * turns;
            el("line", { x1: rx, y1: MID + Math.sin(rph) * amp,
                         x2: rx, y2: MID + Math.sin(rph + Math.PI) * amp,
                         opacity: ((open - .45) / .55).toFixed(2) }, s.rungs);
          }
        }
      });
    };
  }

  function init() {
    var plate = document.getElementById("plate-memory");
    if (!plate) return;
    var svg = plate.querySelector("svg[data-ex]");
    var render = build(svg), builtAt = boxWidth(svg);
    var t = 0, target = 0, raf = null;

    /* The layout is in pixels, so a width change is a relayout, not a rescale. */
    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var w = boxWidth(svg);
        if (Math.abs(w - builtAt) < 8) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        render = build(svg); builtAt = w; render(t);
      }, 150);
    });

    function settle() {
      var d = target - t;
      if (Math.abs(d) < .005) { t = target; render(t); raf = null; return; }
      t += d * .12; render(t);
      raf = requestAnimationFrame(settle);
    }
    function go(v) {
      target = v;
      if (still) { t = v; render(t); return; }
      if (!raf) raf = requestAnimationFrame(settle);
    }

        render(0);
    var touched = false;
    plate.querySelectorAll("[data-cell]").forEach(function (b) {
      b.addEventListener("click", function (ev) {
        if (ev.isTrusted) touched = true;
        plate.querySelectorAll("[data-cell]").forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });
        plate.classList.toggle("is-trained", b.dataset.cell === "trained");
        go(b.dataset.cell === "trained" ? 1 : 0);
      });
    });

    /* Reduced motion gets the finished state, like every other exhibit and like
       the README promises - it just gets it without the transition. The click
       goes through the normal path so the button, the class and the drawing
       cannot disagree; it is untrusted, so it does not count as the reader
       having chosen. */
    if (still) {
      var tb = plate.querySelector('[data-cell="trained"]');
      if (tb) tb.click();
    }

    /* a reader who touches nothing sees the change happen once */
    if (!still && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          ob.disconnect();
                    setTimeout(function () {
            /* only if the reader has not already chosen for themselves */
            if (touched) return;
            var b = plate.querySelector('[data-cell="trained"]');
            if (b) b.click();
          }, 900);
        });
      }, { threshold: 0, rootMargin: "-20% 0px -20% 0px" }).observe(plate);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
