/* The arrival specimens: two pairs of lungs, grown rather than drawn.

   A bronchial tree really is a recursive branching structure, so generating one
   from a branching rule is not a stylistic flourish here - it is the honest way
   to draw the thing. This is the one place where "generated, not drawn" (D26,
   D39) matches the biology instead of decorating it.

   Both specimens are grown from THE SAME SEED. They are anatomically identical,
   on purpose: the whole experiment rests on the two groups being alike in every
   way except one, and a picture that quietly varied them would argue against the
   thing the page is about. The caption says so. */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SEED = 1834;                    /* shared by both specimens */

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) if (a.hasOwnProperty(k)) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }

  /* One airway, then two smaller ones, down and down. Real bronchi narrow by
     roughly four-fifths at each generation and split at a shallow angle; those
     are the two numbers that make the shape read as a lung rather than a shrub. */
  function grow(g, r, x, y, ang, len, wide, depth) {
    if (depth === 0 || len < 3) return;
    var x2 = x + Math.cos(ang) * len;
    var y2 = y + Math.sin(ang) * len;
    var cx = x + Math.cos(ang - .35) * len * .55;
    var cy = y + Math.sin(ang - .35) * len * .55;
    el("path", {
      d: "M" + x.toFixed(1) + "," + y.toFixed(1) +
         " Q" + cx.toFixed(1) + "," + cy.toFixed(1) +
         " " + x2.toFixed(1) + "," + y2.toFixed(1),
      fill: "none", stroke: "var(--tissue)", "stroke-width": wide.toFixed(2),
      "stroke-linecap": "round", opacity: (.35 + depth * .055).toFixed(2)
    }, g);

    /* the terminal twigs end in a cluster of air sacs */
    if (depth === 1) {
      for (var k = 0; k < 3; k++) {
        el("circle", { cx: (x2 + (r() - .5) * 7).toFixed(1),
                       cy: (y2 + (r() - .5) * 7).toFixed(1),
                       r: (1.6 + r() * 1.3).toFixed(1),
                       fill: "var(--tissue)", opacity: .22 }, g);
      }
      return;
    }
    var spread = .38 + r() * .26;
    var decay = .76 + r() * .08;
    grow(g, r, x2, y2, ang - spread, len * decay, wide * .74, depth - 1);
    grow(g, r, x2, y2, ang + spread * (.8 + r() * .4), len * decay * .96, wide * .72, depth - 1);
  }

  var BODY = "M150,44 C100,58 62,112 60,188 C58,252 88,292 120,292 C143,292 148,262 150,212"
           + " C152,262 157,292 180,292 C212,292 242,252 240,188 C238,112 200,58 150,44 Z";
  var uid = 0;

  function specimen(svg) {
    svg.setAttribute("viewBox", "0 0 300 320");
    var r = rng(SEED);
    /* The breath is applied to the <svg> element, NOT to this group. See the
       note on .breath in plate.css: a transform on an SVG's contents cannot be
       composited, so it repaints every path in here on every frame. */
    svg.classList.add("breath");
    var g = el("g", {}, svg);

    /* The tree is clipped to the body. Left to itself a branching rule sprawls
       past the organ and reads as coral; clipped, it fills the lobes the way an
       airway tree actually does, and the silhouette stops being decoration. */
    var id = "lungclip" + (++uid);
    var defs = el("defs", {}, g);
    var cp = el("clipPath", { id: id }, defs);
    el("path", { d: BODY }, cp);

    /* the soft body, behind: atmosphere, carries no claim */
    el("path", { d: BODY, fill: "var(--tissue)", opacity: .07 }, g);

    /* Four branches off the carina, not two. With only a downward pair every
       terminal twig funnels to the base and the upper lobes stay bare, which no
       lung does. An upper and a lower bronchus per side fills the whole organ. */
    var tree = el("g", { "clip-path": "url(#" + id + ")" }, g);
    grow(tree, r, 150, 94, Math.PI * 1.02, 34, 4.2, 8);   /* left,  upper */
    grow(tree, r, 150, 98, Math.PI *  .74, 44, 5.4, 9);   /* left,  lower */
    grow(tree, r, 150, 94, Math.PI * -.02, 34, 4.2, 8);   /* right, upper */
    grow(tree, r, 150, 98, Math.PI *  .26, 44, 5.4, 9);   /* right, lower */

    /* outline over the tree, so the organ reads as one shape */
    el("path", { d: BODY, fill: "none", stroke: "var(--tissue)",
                 "stroke-width": 1.2, opacity: .34 }, g);

    /* trachea sits above the body, so it is drawn outside the clip */
    el("path", { d: "M150,28 L150,96", fill: "none", stroke: "var(--tissue)",
                 "stroke-width": 7, "stroke-linecap": "round", opacity: .6 }, g);
    return g;
  }

  function init() {
    var svgs = document.querySelectorAll("svg[data-specimen]");
    Array.prototype.forEach.call(svgs, function (svg, i) {
      specimen(svg);
      /* The pair used to breathe 1.7s out of phase, so they would read as two
         animals rather than one picture shown twice. That was the wrong trade:
         the breath scales by 2.8%, so at any moment one lung was larger than
         the other and sat at a different height, which is exactly the thing
         this plate says is not true of the two groups. They breathe together. */
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
