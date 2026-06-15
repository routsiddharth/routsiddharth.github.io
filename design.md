# Design System — "Nocturne"

A dark, editorial, restrained design language. The feel is a quiet magazine spread
at night: near-black paper, warm off-white ink, a single sage-green accent used
sparingly, hairline rules instead of boxes, and serif display type against a clean
geometric sans for body. Everything is calm, typographic, and content-first — no
cards, no shadows, no gradients, no chrome.

This document is portable. Drop it into another project to reproduce the same
philosophy. Frameworks don't matter — the system is expressed entirely in CSS
custom properties, type choices, and a handful of interaction patterns.

---

## 1. Philosophy

- **Editorial, not "appy."** Lay content out like a page in a print magazine:
  numbered sections, a section title, a hairline rule, generous whitespace. No
  cards, no panels, no drop shadows.
- **Hairlines over containers.** Structure comes from thin `1px` rules at very low
  opacity, not from borders, fills, or boxes. Rows are separated by top borders,
  not enclosed.
- **One accent, used like a highlighter.** A single sage green appears only on
  hover underlines, active states, links-of-emphasis, and results/metrics.
  Never as a fill, never as a button background. If everything is accented,
  nothing is.
- **Two type families, two jobs.** A light serif (Newsreader) for display/leads/
  numbers — it carries warmth and personality. A geometric sans (Space Grotesk)
  at weight 300 for everything functional. Body text is dim, not full white.
- **Restraint in color.** Three levels of ink (full / dim / faint) do almost all
  the work. Hierarchy is built from opacity and size, not hue.
- **Motion is a whisper.** Reveal-on-scroll, underline wipes, accordion height
  transitions. Long, eased, subtle. Always respect `prefers-reduced-motion`.
- **Content-first, single column of attention.** A sticky meta rail on the left
  holds identity + nav; the right column is one vertical read. On mobile the rail
  collapses into a simple stacked header.
- **Quietly opinionated copy.** Lowercase taglines, dry humor in stat rows
  ("forgotten by next week: n − 1"), real numbers and outcomes. The design leaves
  room for voice.

---

## 2. Design tokens

Drop these in `:root`. They are the entire palette and the spine of the system.

```css
:root {
  /* surfaces */
  --bg:        #0c0c0d;            /* page — near-black, faintly warm */
  --bg-soft:   #0d0e0f;            /* barely-raised surface */
  --dialog-bg: #0a0a0b;           /* modal/overlay, slightly darker than page */

  /* ink (three levels do most of the work) */
  --ink:   #ece9e3;               /* primary text — warm off-white, never pure #fff */
  --dim:   #8a8a86;               /* secondary text, body copy */
  --faint: #5b5b58;               /* labels, meta, captions, de-emphasized */

  /* hairlines */
  --hair:      rgba(255,255,255,0.08);  /* standard rule / divider */
  --hair-soft: rgba(255,255,255,0.05);  /* even quieter rule */

  /* accent — the only color. sage green. */
  --accent: #5fae7e;

  /* misc */
  --land: #242427;                /* neutral fill for decorative graphics */
  --maxw: 1180px;                 /* content max width */
}
```

Rules of thumb:
- Primary text is `--ink` (#ece9e3), **never** pure white. Reserve `#fff` for a
  single hover brighten on the largest display element if you want extra lift.
- Body copy is `--dim`. Labels/meta/captions are `--faint`.
- Pure-white selection is wrong; tint selection with the accent:
  `::selection { background: rgba(95,174,126,0.22); }`
- The accent is always either text color or a `1px` underline/rule — never a fill.

---

## 3. Typography

Load two families:

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Space+Grotesk:wght@300;400;500&display=swap" rel="stylesheet" />
```

```css
body {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 300;
  font-size: 15px;
  line-height: 1.65;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Newsreader (serif, light)** — display & personality:
- Big leads / hero: `clamp(28px, 3.6vw, 44px)`, weight 300, `line-height: 1.28`,
  `letter-spacing: -0.012em`, `max-width: ~22ch`.
- Names, project titles, big stat values. Often italic for asides/footnotes.
- Always light (300). The thinness is the point.

**Space Grotesk (sans, light)** — everything functional:
- Body: 15–17px, weight 300, `line-height: 1.65–1.85`.
- Strong/emphasis inside body = weight **400** + `--ink` (not bold, not heavier).

**The label style** — the signature recurring micro-typographic element. Used for
section titles, eyebrows, kicker labels, captions:

```css
.label {
  font-size: 10.5px;
  letter-spacing: 0.22em;     /* very wide tracking */
  text-transform: uppercase;
  color: var(--faint);
}
```

Type scale in use (approx): 10.5 (labels) · 12–13 (meta/nav) · 15 (body) ·
16 (row titles) · 17 (lead body) · 20–24 (serif values/titles) · 28–44 (hero).

---

## 4. Layout

**Sticky meta rail + single content column.**

```css
.shell {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 90px;
  align-items: start;
}
.rail {                     /* left: identity, nav, socials, now-playing */
  position: sticky; top: 0; height: 100vh;
  padding: 64px 0;
  display: flex; flex-direction: column; justify-content: space-between;
}
.content { padding: 64px 0 0; min-width: 0; }
```

- The rail is sticky full-height and splits top (identity + nav) from bottom
  (socials + a small live widget) via `justify-content: space-between`.
- Sections are tall and airy: `padding: 0 0 110px`. Let whitespace breathe.
- **Mobile (`max-width: 900px`):** rail `display: none`; grid collapses to one
  column; a stacked `.m-header` takes over identity. Reduce side padding to ~26px
  and section spacing to ~84px.

**Section header** — number + wide-tracked title + a hairline that fills the rest:

```css
.sec-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 40px; }
.sec-num, .sec-title {
  font-size: 10.5px; letter-spacing: 0.22em; color: var(--faint);
}
.sec-title { text-transform: uppercase; }
.sec-rule { flex: 1; height: 1px; background: var(--hair); }
```

```html
<div class="sec-head"><span class="sec-num">01</span><span class="sec-title">About</span><span class="sec-rule"></span></div>
```

---

## 5. Components & patterns

These are the reusable building blocks. All share the same DNA: hairline-separated
rows in a vertical stack, content-first, accent only on interaction.

### Hairline list (rows with top borders)
The universal layout primitive. Every list — facts, experience, stats — is a
column of rows divided by `border-top: 1px solid var(--hair)`, with a closing
`border-bottom` on the last row. No outer container, no fills.

```css
.row { border-top: 1px solid var(--hair); padding: 20px 0; }
.list .row:last-child { border-bottom: 1px solid var(--hair); }
```

### Definition list (key → value)
Two-column grid, narrow uppercase key + value block. Collapses to one column on
mobile.

```css
.dl-row { display: grid; grid-template-columns: 160px 1fr; gap: 36px; padding: 28px 0; border-top: 1px solid var(--hair); }
.dl-key { color: var(--faint); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
.dl-val .dl-title { color: var(--ink); font-size: 16px; font-weight: 400; }
.dl-val .dl-desc { color: var(--dim); margin-top: 6px; }
```

### List + "show more" reveal
A short visible set, then extra rows that animate open via `grid-template-rows`
(0fr → 1fr) — the smooth, no-fixed-height accordion technique. Toggle button uses
the wide-tracked label style with an accent `+ / −` mark.

```css
.extra { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.5s cubic-bezier(0.2,0.6,0.2,1); }
.extra.open { grid-template-rows: 1fr; }
.extra-inner { overflow: hidden; }
```

### Accordion item (expandable detail)
For project/work entries. A summary row (serif title + dim kind + accent `+`) that
expands a body via the same `grid-template-rows` trick. The `+` rotates 45° to an
`×` and turns accent when open. Single-open behavior (opening one closes others)
is handled in JS.

```css
.work-name { font-family: "Newsreader", serif; font-weight: 300; font-size: 24px; }
.work-plus { color: var(--faint); transition: transform 0.4s cubic-bezier(0.2,0.6,0.2,1), color 0.3s ease; }
.work-item.open .work-plus { transform: rotate(45deg); color: var(--accent); }
.work-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.45s cubic-bezier(0.2,0.6,0.2,1); }
.work-item.open .work-body { grid-template-rows: 1fr; }
```
Inside the body: a description in `--dim`, then a footer row of metadata where the
**result/metric is the accent color** and the tech stack is `--faint`.

### Links
Two link idioms, both built on the accent:

1. **Underline-on-hover wipe** (nav, social-style lists): a `::after` 1px bar that
   `scaleX(0) → scaleX(1)` from the left on hover. Text goes `--dim → --ink`.

```css
.nav a { color: var(--dim); position: relative; transition: color 0.3s ease; }
.nav a::after {
  content: ""; position: absolute; left: 0; bottom: -2px; width: 100%; height: 1px;
  background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.2,0.6,0.2,1);
}
.nav a:hover { color: var(--ink); }
.nav a:hover::after { transform: scaleX(1); }
```

2. **Inline body link**: a persistent hairline underline that turns accent on
   hover (`border-bottom: 1px solid var(--hair)` → `border-color: var(--accent)`).

### Active / current state
Scroll-spy nav reuses the hover treatment as a persistent `.active` state (text
`--ink`, underline fully wiped in). Hover and current look identical — current is
just hover that stays.

### Modal / dialog
Native `<dialog>`. Darker-than-page background, hairline border, small radius,
blurred backdrop. Close button is a hairline circle that turns accent on hover.

```css
.dialog { border: 1px solid var(--hair); border-radius: 6px; background: var(--dialog-bg); }
.dialog::backdrop { background: rgba(0,0,0,0.72); backdrop-filter: blur(2px); }
```

### Footer
Hairline top border, `--faint` text, baseline-aligned ends, small wide-tracked
text. Two short strings (place · date). Stacks on mobile.

---

## 6. Motion

Keep it slow, eased, and few. One shared easing curve everywhere:
`cubic-bezier(0.2, 0.6, 0.2, 1)`.

- **Reveal on scroll:** elements start `opacity: 0; translateY(16px)` and settle to
  `opacity: 1; transform: none` over ~0.9s when they enter the viewport
  (IntersectionObserver adds an `.in` class). Always ship a fallback that forces
  visibility after load so nothing can get stuck hidden.

```css
.reveal { opacity: 0; transform: translateY(16px);
  transition: opacity 0.9s cubic-bezier(0.2,0.6,0.2,1), transform 0.9s cubic-bezier(0.2,0.6,0.2,1); }
.reveal.in { opacity: 1; transform: none; }
```

- **Underline wipes:** ~0.35s, the curve above.
- **Accordions:** `grid-template-rows` 0fr↔1fr, ~0.45–0.5s.
- **Hover micro-shifts:** color 0.3s; small `translateY(-1px)` lifts on icons.
- **Hairline transitions:** when a row's border should disappear (e.g. last-visible
  row when a list opens), transition `border-color` so it fades rather than snaps.

**Always** honor reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto; }
  .reveal { opacity: 1 !important; transform: none !important; transition: none; }
  /* disable looping/decorative animations and accordion transitions too */
}
```

Also set `html { scroll-behavior: smooth; }` for in-page anchor nav.

---

## 7. Iconography & imagery

- **Icons:** inline SVG, `stroke: currentColor`, `stroke-width: 1.5`, `fill: none`,
  ~16–18px, rounded line caps/joins. Hairline-weight to match the type. Color them
  `--faint`, brighten to `--ink` on hover.
- **Photos:** muted — `filter: grayscale(0.25) brightness(0.96)`, circular for
  avatars, a `1px var(--hair)` border. Imagery should sit quietly in the palette,
  never pop.
- **Decorative graphics** (maps, charts): neutral `--land` fills, hairline strokes,
  and the accent or `--ink` only to mark the meaningful data.

---

## 8. Do / Don't

**Do**
- Build everything from hairline-separated rows in a single column.
- Use the three ink levels for hierarchy before reaching for size.
- Reserve the accent for hover, active, links of emphasis, and results/metrics.
- Let sections breathe (80–110px of bottom padding).
- Write with voice: lowercase, dry, specific numbers.

**Don't**
- No cards, boxes, drop shadows, or gradients.
- No pure white text, no pure black background.
- No second accent color. No accent fills or accent buttons.
- No heavy font weights (cap at 500; body lives at 300–400).
- No fast or bouncy motion; nothing that ignores reduced-motion.

---

## 9. Minimal starter

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0c0c0d" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Space+Grotesk:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  :root{
    --bg:#0c0c0d; --dialog-bg:#0a0a0b;
    --ink:#ece9e3; --dim:#8a8a86; --faint:#5b5b58;
    --hair:rgba(255,255,255,0.08); --hair-soft:rgba(255,255,255,0.05);
    --accent:#5fae7e; --maxw:1180px;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--ink);
    font-family:"Space Grotesk",system-ui,sans-serif;font-weight:300;
    font-size:15px;line-height:1.65;letter-spacing:.01em;-webkit-font-smoothing:antialiased}
  ::selection{background:rgba(95,174,126,.22);color:var(--ink)}
  a{color:inherit;text-decoration:none}
  .shell{max-width:var(--maxw);margin:0 auto;padding:0 40px}
  .label,.sec-title{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
  .lead{font-family:"Newsreader",serif;font-weight:300;
    font-size:clamp(28px,3.6vw,44px);line-height:1.28;letter-spacing:-.012em;max-width:22ch}
  .lead .accent{color:var(--accent)}
</style>
</head>
<body>
  <main class="shell">
    <p class="label">Section</p>
    <p class="lead">A quiet, editorial line with one <span class="accent">accent</span>.</p>
  </main>
</body>
</html>
```

---

*Captured from sidrout.com. Theme: "Nocturne" — dark editorial, sage accent,
serif + grotesk, hairline-driven, motion as a whisper.*
