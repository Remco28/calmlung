# The Calm Lung

A walk through one immunology paper, at three depths.

**[calmlung.teamremco.org](https://calmlung.teamremco.org)**

Two groups of mice were given the same lethal dose of influenza. One group had
been infected with a parasitic worm a month earlier, and had cleared it. Every
mouse in that group lived. Every mouse in the other group died. The site is
about what the researchers did next to find out why.

The paper is Damani-Yokota *et al.*, *Nature*, 2026 —
[doi:10.1038/s41586-026-11060-y](https://doi.org/10.1038/s41586-026-11060-y),
open access under CC BY-NC-ND 4.0. This site is an independent explainer. It is
not written, endorsed or reviewed by the authors.

## What it is

Every reader gets the same page. Each placard reads at three depths — **for
kids**, **for everyone**, **for scientists** — and you switch between them in
place, at any point, without losing where you are.

The other rule the page keeps is about the honesty of the drawings. **Anything
that says something about the biology is schematic, labelled and traceable to
the paper. Anything that drifts or glows says nothing.** The illustrations are
schematics of the published figures and they say so; they are not the figures
and they are not micrographs. Where the paper reports an association rather than
a test, the page says which. Where a result came from a gentler challenge than
the headline one, the page says so on the figure itself.

## Running it

There is no build step and no framework. Clone it and open `index.html`.

```
index.html      the whole page: arrival, five primers, six stations, credits
css/calm.css    tokens, placards, exhibit frames, reduced motion
css/hall.css    the dark walkthrough and the approach into it
css/plate.css   the instrument plates the exhibits sit on
js/*.js         one file per exhibit; plain ES5, no dependencies
img/            the mouse (Servier Medical Art, CC BY 4.0) and the share card
```

That is deliberate. It has to survive on static hosting and still be editable by
someone who is not a web developer.

It works without JavaScript — every exhibit has a written equivalent — and it
honours `prefers-reduced-motion`, where nothing moves by itself and every
animated exhibit shows its finished state.

## Credits and licence

The mouse is adapted from [Servier Medical Art](https://smart.servier.com),
licensed under **CC BY 4.0**, recoloured for this site. Type is Fraunces and
Inter, both open licence.

Everything else here was written for this site and is © Frank Ng. Quotations and
figure values are from the paper, cited above and credited on the page.

Corrections are welcome. **If you are one of the authors and something here
misrepresents your work, please open an issue — that is a bug, and it will be
fixed or the page will come down.**
