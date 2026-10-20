/* Step 3 — the two eyepieces.

   The load-bearing moment of the whole site: switch to the virus channel alone
   and the two lungs look alike. Switch to damage and they do not.

   Honesty rules this file must keep (docs/walkthrough.md, claims 3.1 / 4.7):
   - The virus channel is never captioned "identical" or "the same". The paper
     reports no DETECTED difference, which is a different statement, so the two
     fields are drawn with similar but deliberately unequal virus counts.
   - The third channel is neutrophils and their traps, which were imaged. It is
     NOT "cleanup": dead-cell clearing was never measured, and drawing more of it
     on the trained side would state something the paper does not show.
   - The tissue substrate carries no claim. It is the same in both fields, drawn
     from the same seed, so nothing about it can be read as a difference. */

(function () {
  "use strict";

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* deterministic, so the picture is the same for every reader and for review */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var CH = {
    virus:  { core: "#b07d24", glow: "#ffd27a" },
    damage: { core: "#d24e96", glow: "#ff8fc8" },
    neut:   { core: "#2196c8", glow: "#7fd4ff" }
  };

  /* Counts. Virus is close but NOT equal between the two fields - equal counts
     would draw the word "identical", which the paper does not support. */
  var FIELDS = {
    lived: { seed: 20260117, virus: 228, damage: 3,  dmin: 9,  dmax: 15,
             neut: 5,  nets: false },
    died:  { seed: 20260311, virus: 236, damage: 21, dmin: 20, dmax: 48,
             neut: 42, nets: true  }
  };

  function build(canvas, spec) {
    var ctx = canvas.getContext("2d");
    var S = 440;                       /* internal drawing units */
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      var w = canvas.clientWidth || 420;
      canvas.width = w * dpr; canvas.height = w * dpr;
      ctx.setTransform(dpr * w / S, 0, 0, dpr * w / S, 0, 0);
    }

    /* ---- the layers, generated once from the seed ---- */
    var r = rng(spec.seed);
    var tissueR = rng(40411);          /* SAME seed both sides: carries no claim */

    var tissue = [];
    for (var i = 0; i < 54; i++) {
      tissue.push({ x: tissueR() * S, y: tissueR() * S,
                    a: 20 + tissueR() * 26, b: 16 + tissueR() * 22,
                    rot: tissueR() * Math.PI });
    }
    var virus = [];
    for (i = 0; i < spec.virus; i++) {
      virus.push({ x: r() * S, y: r() * S, r: 1.5 + r() * 1.7, o: .62 + r() * .38 });
    }
    var damage = [];
    for (i = 0; i < spec.damage; i++) {
      damage.push({ x: 56 + r() * (S - 112), y: 56 + r() * (S - 112),
                    s: spec.dmin + r() * (spec.dmax - spec.dmin), seed: (r() * 1e6) | 0 });
    }
    var neut = [];
    for (i = 0; i < spec.neut; i++) {
      neut.push({ x: 34 + r() * (S - 68), y: 34 + r() * (S - 68),
                  s: 5 + r() * 3.4, nets: spec.nets && r() < .55, seed: (r() * 1e6) | 0 });
    }

    function blob(cx, cy, rad, seed, wob) {
      var br = rng(seed), pts = 11, d = [];
      for (var k = 0; k < pts; k++) {
        var a = (k / pts) * Math.PI * 2;
        var rr = rad * (1 - wob / 2 + br() * wob);
        d.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      ctx.beginPath();
      for (k = 0; k < pts; k++) {
        var p = d[k], n = d[(k + 1) % pts];
        var mx = (p[0] + n[0]) / 2, my = (p[1] + n[1]) / 2;
        if (!k) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p[0], p[1], mx, my);
      }
      ctx.closePath();
    }

    function draw(alpha) {
      ctx.clearRect(0, 0, S, S);

      /* substrate: air sacs, identical both sides, no claim */
      ctx.lineWidth = 1.1;
      tissue.forEach(function (t) {
        ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rot);
        ctx.beginPath(); ctx.ellipse(0, 0, t.a, t.b, 0, 0, 6.283);
        ctx.fillStyle = "rgba(200,69,79,.045)"; ctx.fill();
        ctx.strokeStyle = "rgba(232,170,180,.13)"; ctx.stroke();
        ctx.restore();
      });

      /* damage: torn, collapsed patches */
      if (alpha.damage > .004) {
        ctx.save(); ctx.globalAlpha = alpha.damage;
        ctx.shadowColor = CH.damage.glow; ctx.shadowBlur = 16;
        damage.forEach(function (p) {
          blob(p.x, p.y, p.s, p.seed, .66);
          ctx.fillStyle = "rgba(210,78,150,.42)"; ctx.fill();
        });
        ctx.restore();
      }

      /* neutrophils, and their traps where they crowd */
      if (alpha.neut > .004) {
        ctx.save(); ctx.globalAlpha = alpha.neut;
        neut.forEach(function (c) {
          if (c.nets) {
            var nr = rng(c.seed);
            ctx.strokeStyle = "rgba(33,150,200,.55)"; ctx.lineWidth = 1; ctx.lineCap = "round";
            for (var k = 0; k < 3; k++) {
              var a = nr() * 6.283, L = c.s + 9 + nr() * 17;
              ctx.beginPath(); ctx.moveTo(c.x, c.y);
              ctx.quadraticCurveTo(c.x + Math.cos(a) * L * .55 + (nr() - .5) * 11,
                                   c.y + Math.sin(a) * L * .55 + (nr() - .5) * 11,
                                   c.x + Math.cos(a) * L, c.y + Math.sin(a) * L);
              ctx.stroke();
            }
          }
          ctx.shadowColor = CH.neut.glow; ctx.shadowBlur = 9;
          blob(c.x, c.y, c.s, c.seed + 7, .3);
          ctx.fillStyle = "rgba(33,150,200,.3)"; ctx.fill();
          ctx.strokeStyle = CH.neut.glow; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.shadowBlur = 0;
        });
        ctx.restore();
      }

      /* virus: many tiny particles */
      if (alpha.virus > .004) {
        ctx.save(); ctx.globalAlpha = alpha.virus;
        ctx.shadowColor = CH.virus.glow; ctx.shadowBlur = 7;
        ctx.fillStyle = CH.virus.glow;
        virus.forEach(function (v) {
          ctx.globalAlpha = alpha.virus * v.o;
          ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, 6.283); ctx.fill();
        });
        ctx.restore();
      }
    }

    size();
    window.addEventListener("resize", function () { size(); draw(build.alpha); });
    return { draw: draw, damage: damage, neut: neut };
  }

  /* ---- callouts: a hairline from the detail out to the rim, numbered there.
     Annotating inside the eyepiece's own coordinate space keeps the geometry
     correct at any size, which cross-container leader lines do not. ---- */

  function callouts(svg, marks) {
    svg.setAttribute("viewBox", "0 0 440 440");
    var discs = [], nums = [];
    marks.forEach(function (m) {
      var cx = 220, cy = 220, R = 206;
      var a = Math.atan2(m.y - cy, m.x - cx);
      var ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R;
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "callout");
      g.setAttribute("data-ch", m.ch);

      var ring = document.createElementNS(NS, "circle");
      ring.setAttribute("cx", m.x); ring.setAttribute("cy", m.y);
      ring.setAttribute("r", m.r || 15);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "rgba(240,245,255,.85)");
      ring.setAttribute("stroke-width", "1.3");
      g.appendChild(ring);

      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", m.x + Math.cos(a) * (m.r || 15));
      line.setAttribute("y1", m.y + Math.sin(a) * (m.r || 15));
      line.setAttribute("x2", ex); line.setAttribute("y2", ey);
      line.setAttribute("stroke", "rgba(240,245,255,.6)");
      line.setAttribute("stroke-width", "1");
      g.appendChild(line);

      var disc = document.createElementNS(NS, "circle");
      disc.setAttribute("cx", ex); disc.setAttribute("cy", ey); disc.setAttribute("r", 11);
      disc.setAttribute("fill", "#6fe3d0");
      g.appendChild(disc);
      discs.push(disc);

      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", ex); t.setAttribute("y", ey + 4);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", "12");
      t.setAttribute("font-weight", "600");
      t.setAttribute("font-family", "Inter, sans-serif");
      t.setAttribute("fill", "#0d111c");
      t.textContent = m.n;
      g.appendChild(t);
      nums.push({ t: t, ey: ey });

      svg.appendChild(g);
    });

    /* The eyepiece is about 300px across on a wide screen and less on a phone,
       so a numeral written at 12 of 440 units lands at 8px. The disc and its
       numeral are furniture, not part of the drawing: size them in the pixels
       the figure is given, so the numeral never falls under 11px. */
    return function fit() {
      var w = svg.getBoundingClientRect().width;
      var k = w > 40 ? Math.min(2.4, Math.max(1, 440 / w)) : 1;
      discs.forEach(function (d) { d.setAttribute("r", (11 * k).toFixed(1)); });
      nums.forEach(function (o) {
        o.t.setAttribute("font-size", (12 * k).toFixed(1));
        o.t.setAttribute("y", (o.ey + 4 * k).toFixed(1));   /* keep it centred */
      });
    };
  }

  function init() {
    var plate = document.getElementById("plate-twist");
    if (!plate) return;

    var made = {};
    var draws = {};
    ["lived", "died"].forEach(function (key) {
      var c = plate.querySelector('canvas[data-field="' + key + '"]');
      if (c) { made[key] = build(c, FIELDS[key]); draws[key] = made[key].draw; }
    });

    /* Callout 1 marks virus on CLEAR ground: if it circled a damage patch the
       ring would seem to point at the damage instead. Pick the candidate centre
       furthest from any patch rather than guessing a coordinate. */
    function clearest(layer, cands, keepOut) {
      var best = cands[0], bestD = -1;
      cands.forEach(function (c) {
        var d = Infinity;
        layer.forEach(function (p) {
          d = Math.min(d, Math.hypot(p.x - c[0], p.y - c[1]) - (p.s || 0));
        });
        if (d > bestD) { bestD = d; best = c; }
      });
      return { x: best[0], y: best[1], r: keepOut };
    }
    function densest(layer, cands, rad) {
      var best = cands[0], bestN = -1;
      cands.forEach(function (c) {
        var n = layer.filter(function (p) {
          return Math.hypot(p.x - c[0], p.y - c[1]) < rad;
        }).length;
        if (n > bestN) { bestN = n; best = c; }
      });
      return { x: best[0], y: best[1], r: rad };
    }
    var GRID = [];
    for (var gx = 120; gx <= 320; gx += 50)
      for (var gy = 120; gy <= 320; gy += 50) GRID.push([gx, gy]);

    var m1 = clearest(made.lived.damage, GRID, 48);
    var m2 = densest(made.died.damage, GRID, 52);
    var m3 = densest(made.died.neut, GRID, 44);
    var fits = [
      callouts(plate.querySelector('svg[data-field="lived"]'),
               [{ n: 1, x: m1.x, y: m1.y, r: m1.r, ch: "virus" }]),
      callouts(plate.querySelector('svg[data-field="died"]'), [
        { n: 2, x: m2.x, y: m2.y, r: m2.r, ch: "damage" },
        { n: 3, x: m3.x, y: m3.y, r: m3.r, ch: "neut" }
      ])
    ];
    function fitAll() { fits.forEach(function (f) { f(); }); }
    fitAll();
    var frt = null;
    window.addEventListener("resize", function () {
      clearTimeout(frt); frt = setTimeout(fitAll, 150);
    });

    var on = { virus: true, damage: true, neut: true };
    var alpha = { virus: 1, damage: 1, neut: 1 };
    build.alpha = alpha;

    function paint() { draws.lived(alpha); draws.died(alpha); }

    /* channels cross-fade; nothing races (guide §5) */
    var raf = null;
    function settle() {
      var moving = false;
      Object.keys(on).forEach(function (k) {
        var target = on[k] ? 1 : 0, d = target - alpha[k];
        if (Math.abs(d) < .01) { alpha[k] = target; }
        else { alpha[k] += d * .14; moving = true; }
      });
      plate.querySelectorAll(".callout").forEach(function (g) {
        g.style.opacity = alpha[g.dataset.ch];
      });
      paint();
      raf = moving ? requestAnimationFrame(settle) : null;
    }

    plate.querySelectorAll(".channels button").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.ch;
        on[k] = !on[k];
        b.setAttribute("aria-pressed", String(on[k]));
        plate.querySelector('.readout-row[data-ch="' + k + '"]')
             .classList.toggle("is-off", !on[k]);
        if (still) { alpha[k] = on[k] ? 1 : 0;
                     plate.querySelectorAll('.callout[data-ch="' + k + '"]')
                          .forEach(function (g) { g.style.opacity = alpha[k]; });
                     paint(); }
        else if (!raf) raf = requestAnimationFrame(settle);
      });
    });

    paint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
