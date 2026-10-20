/* Step 4 — the measurement sheet.

   Without JavaScript every chip shows its own note inline and the sheet reads as
   a complete list. With it, the notes move into one panel so the three columns
   stay scannable, which is the whole point: the middle column is the one the lead sends you to. */

(function () {
  "use strict";

  function init() {
    var plate = document.getElementById("plate-sheet");
    if (!plate) return;
    plate.classList.add("is-live");

        var detail = plate.querySelector("[data-detail]");
    var chips = plate.querySelectorAll(".chip");
        var current = null, kindId = 0;

    /* The key below the columns distinguishes counted measurements from ones only
       seen in images, and marks the one that complicates the story. All three are
       drawn on an aria-hidden mark, so the distinction was visual only. */
    var KIND = { counted: "Counted and tested.",
                 imaged: "Seen in images, not counted.",
                 flag: "Seen in images, not counted." };
    function kindOf(chip) {
      var k = KIND[chip.dataset.kind] || "";
      if (chip.classList.contains("is-flag")) k = "Counted and tested. This is the one that complicates the story.";
      return k;
    }

            /* A chip name is "An inflammation signal" + an <em> symbol the CSS puts on
       its own line, + hidden text. Flattened with textContent it reads
       "An inflammation signalIL-1B", and the aria-hidden "!" comes along too,
       because aria-hidden means nothing to textContent. Every path that needs
       the name as words goes through here. */
    function cleanName(chip) {
      var n = chip.querySelector(".chip-name").cloneNode(true);
      Array.prototype.forEach.call(n.querySelectorAll(".vh, [aria-hidden]"),
        function (el) { el.parentNode.removeChild(el); });
      Array.prototype.forEach.call(n.querySelectorAll("em"),
        function (el) { el.insertAdjacentText("beforebegin", " \u2014 "); });
      return n;
    }
    function nameHTML(chip) { return cleanName(chip).innerHTML; }

    function show(chip) {
      if (current) current.setAttribute("aria-pressed", "false");
      current = chip;
      chip.setAttribute("aria-pressed", "true");
      var col = chip.closest(".sheet-col").dataset.col;
      var verdict = { less: "Less in the trained lungs",
                      same: "No difference detected",
                      more: "More in the trained lungs" }[col];
      detail.innerHTML =
        '<p class="sheet-verdict" data-col="' + col + '">' + verdict + '</p>' +
        /* innerHTML, not textContent: a chip-name carries the symbol in an <em> that
           the chip styles as its own line. Flattened to text it ran straight on from
           the name, so every chip with a symbol read "An inflammation signalIL-1B". */
                /* without the hidden kind label, which the panel states on its own line */
                '<p class="sheet-name">' + nameHTML(chip).replace(" \u2014 <em", "<em") + '</p>' +
                '<p class="sheet-body">' + chip.querySelector(".chip-note").innerHTML + '</p>' +
        '<p class="vh">' + kindOf(chip) + '</p>';
    }

    Array.prototype.forEach.call(chips, function (chip) {
                  chip.setAttribute("aria-pressed", "false");
      var k = document.createElement("span");
      k.className = "vh";
      k.id = "chip-kind-" + (++kindId);
      k.textContent = kindOf(chip);
      chip.insertAdjacentElement("afterend", k);
      chip.setAttribute("aria-describedby", k.id);
      chip.addEventListener("click", function () { show(chip); });
    });

        /* ...and once more as plain text after the three columns. Live, .chip-note is
       display:none, which takes it out of the accessibility tree too, so without
       this a screen reader hears fourteen names and no findings. */
    var all = document.createElement("dl");
    all.className = "vh";
    Array.prototype.forEach.call(chips, function (chip) {
      var dt = document.createElement("dt");
            dt.textContent = chip.closest(".sheet-col").querySelector("h4").textContent +
                       ": " + cleanName(chip).textContent.replace(/\s+/g, " ").trim() +
                       ". " + kindOf(chip);
      var dd = document.createElement("dd");
      dd.textContent = chip.querySelector(".chip-note").textContent;
      all.appendChild(dt); all.appendChild(dd);
    });
    plate.querySelector(".sheet").insertAdjacentElement("afterend", all);

    /* A reader who touches nothing still gets the meaning (style guide §5), so
       the panel opens on the chip that carries the step's punchline: a signal
       that went UP, and a pro-inflammatory one at that. */
    var opener = plate.querySelector(".chip.is-flag") || chips[0];
    if (opener) show(opener);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
