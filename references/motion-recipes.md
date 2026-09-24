# Motion recipes (vanilla JS/CSS, no libraries)

All recipes assume: one rAF-throttled scroll loop, transforms/opacity only, content visible without JS, everything off under `prefers-reduced-motion`.

## 0. The base every page needs

```css
section, .stage { overflow-x: clip; }            /* clip, NOT hidden — hidden breaks position:sticky */
html.js .reveal { opacity: 0; transform: translateY(24px); }   /* hide only when JS is running */
html.js .reveal.in { opacity: 1; transform: none; transition: opacity .7s var(--ease), transform .7s var(--ease); }
@media (prefers-reduced-motion: reduce) {
  html.js .reveal { opacity: 1; transform: none; }
  .pin { position: static !important; }          /* no pinning, show every state stacked */
}
:root { --ease: cubic-bezier(.16, 1, .3, 1); }   /* expo-out; Ctrl-like: cubic-bezier(.65,.05,.36,1) */
```
```js
document.documentElement.classList.add('js');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```
If a no-JS header would sit transparent over text, give `header` the page colour by default and make it transparent only under `html.js`.

## 1. One scroll loop, progress per element

```js
const tracks = [];                          // { el, fn } — fn(p) gets 0→1 as el moves through the viewport
function progress(el) {                     // 0 when el's top hits the viewport bottom, 1 when its bottom hits the top
  const r = el.getBoundingClientRect(), vh = innerHeight;
  return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
}
let ticking = false;
function frame() { ticking = false; for (const t of tracks) t.fn(progress(t.el)); }
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener('resize', frame); frame();
```
Helpers: `const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)); const seg=(p,a,b)=>clamp((p-a)/(b-a)); const lerp=(a,b,t)=>a+(b-a)*t;`
`seg(p, .2, .45)` turns one global progress into a sub-beat — the workhorse for multi-beat pinned scenes.

## 2. Pinned stage with beats (no dead scroll)

```html
<section class="runway" style="height: calc(100vh + 3 * 60vh)">   <!-- 3 beats × 0.6 viewport -->
  <div class="pin" style="position: sticky; top: 0; height: 100vh">…stage…</div>
</section>
```
```js
tracks.push({ el: runway, fn: () => {
  const r = runway.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight));            // 0→1 only while pinned
  const beat = Math.min(2, Math.floor(p * 3));                    // which beat
  stage.dataset.beat = beat;
  bar.style.transform = `scaleX(${p})`;                           // SOMETHING always moves → no dead scroll
}});
```
Rules: ≈0.5–0.8 viewport per beat; total pinned ≤ ~2 viewports per section on desktop, shorter on mobile; a continuous element (clock hand, progress bar, drifting shape) keeps every step visibly different. Hide floating pills/chrome while pinned.

## 3. Smooth follow (weighted camera)

```js
let cur = 0; function tick(){ cur += (target - cur) * .12; apply(cur); if (Math.abs(target - cur) > .001) requestAnimationFrame(tick); }
```
Use for cameras/drums/wheels so scroll feels weighty. Never intercept the wheel event itself.

## 4. SVG camera (zoom / macro crop)

Animate the `viewBox` of one big SVG rather than scaling a bitmap — it stays crisp at 20×.
```js
const A = [812, 402, 36, 24], B = [0, 0, 1600, 1000];            // tiny slice → whole picture
const vb = A.map((a, i) => lerp(a, B[i], ease(p)));
svg.setAttribute('viewBox', vb.join(' '));
```

**Matrix camera** (when the camera must also rotate, or HTML labels must follow moving parts): keep the SVG viewBox fixed and move one world group — `world.setAttribute('transform', `translate(${tx} ${ty}) rotate(${deg}) scale(${s}) translate(${-fx} ${-fy})`)` (focus point fx,fy lands on screen point tx,ty). Position HTML labels from `part.getScreenCTM()` each frame.

**3D object turn (phone, card, product):** `perspective` goes on the element directly above the rotating one; apply scale and rotate together around the centre; fake thickness with ~10–13 stacked layers; swap the screen/face content at 180° while the back faces the viewer. No-JS fallback from the same markup: `display:contents` on the stage + grid rows so each state sits beside its beat text.

## 5. Shape portal (clip-path grows into the next section)

```js
const R = lerp(40, Math.hypot(innerWidth, innerHeight), ease(p));
portal.style.clipPath = `circle(${R}px at 50% 50%)`;               // or path(): rebuild a star/arch path with scale
```

## 6. Arc wheel (list on an arc, snap)

```js
items.forEach((el, i) => {
  const d = i - pos;                                               // distance from centre (pos is fractional)
  el.style.transform = `translateY(${d * 72}px) translateX(${d * d * 9}px) scale(${1 - Math.min(.45, Math.abs(d) * .15)})`;
  el.style.opacity = Math.max(0, 1 - Math.abs(d) * .32);
});
// pos = scroll-driven base + drag offset + slow idle drift; on release, animate pos to Math.round(pos)
```
Touch: capture only horizontal drags (`touch-action: pan-y`) so vertical swipes still scroll the page.

## 7. Split-flap cell

```css
.flap { perspective: 400px; } .flap .top, .flap .bot { backface-visibility: hidden; transform-origin: 50% 100%; }
.flap.flip .top { animation: fl .12s linear forwards; } @keyframes fl { to { transform: rotateX(-90deg); } }
```
Step each cell through intermediate characters (stagger 20–40ms per cell). For RTL text keep logical order in the DOM and lay the row out with `direction: rtl`; don't reverse strings.

## 8. 3D page turn

```css
.book { perspective: 2200px; } .leaf { transform-origin: left center; transform-style: preserve-3d; }
.leaf .front, .leaf .back { position: absolute; inset: 0; backface-visibility: hidden; } .leaf .back { transform: rotateY(180deg); }
```
`leaf.style.transform = rotateY(${-180 * p}deg)` plus a shading gradient whose opacity peaks at 90°. Hebrew books turn the other way — flip `transform-origin` and the sign.

## 9. Damped pendulum (hanging mobile, nudges)

```js
// per beam: angle a, velocity v; torque from off-centre weight w at arm x
v += (-k * a - c * v + torque) * dt; a += v * dt;   // k≈18, c≈3.2
// run the loop only while |v|>1e-3 or |a-target|>1e-3, then stop
```

## 10. Count-up that respects reduced motion

```js
function count(el, to, dur = 900) { if (RM) { el.textContent = to; return; }
  const t0 = performance.now(); (function f(t){ const k = Math.min(1, (t - t0) / dur);
  el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(f); })(t0); }
```

## 11. Mid-screen trigger (flips, doors, "active step")

```js
const mid = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2 < innerHeight * .6; };
```
Flip/open when crossing, reverse when scrolled back below — keep it tied to position, not to a one-shot timer.

## 12. Draw-on as you scroll (plans, maps, signatures, paths)

```js
// each path: pathLength=1 lets one dash cover it; progress 0..1 from the scroll loop
document.querySelectorAll('.draw path').forEach(p => p.setAttribute('pathLength', 1));
const draw = (svg, k) => svg.querySelectorAll('path').forEach((p, i, all) => {
  const local = Math.min(1, Math.max(0, k * all.length - i));   // paths draw one after another
  p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = 1 - local; });
```
- Reversible: tie it to scroll progress, not to a one-shot class, so scrolling up erases.
- Dashed lines (hidden/demolition lines in drawings) can't use this trick → reveal them with a `clip-path`/mask wipe instead.
- No-JS and reduced motion: leave the CSS default fully drawn (only set dash styles from JS).

## 13. Photographic reveals (aperture, letterbox, pull-back)

```css
.frame{position:sticky;top:0;height:100vh;overflow:clip}
.frame img{width:100%;height:100%;object-fit:cover;object-position:var(--fx,50%) var(--fy,50%);transform:scale(var(--z,1.35))}
.frame::before,.frame::after{content:"";position:absolute;inset-inline:0;height:calc(var(--bar,50%) );background:#000}
```
Scroll progress k: `--bar` 46% → 0% (letterbox opens), `--z` 1.35 → 1 (pull-back). Set a focal point per image (`--fx/--fy`) and a lower start zoom on portrait phones, or the start crop is a dark smear. Put a gradient behind any caption over a bright photo and check contrast. Preload the hero image; never lazy-load images inside sticky frames. Generated photos: no faces presented as the owner, staff or customers, caption "illustrative image", and remember they imply products (a dish, a room) — list them as launch blockers.

## 14. Calm but designed (serious, medical, legal, anxious audiences)

Keep one signature moment and slow it down: long easing (0.8–1.2s equivalents), small travel (≤ 24px), no bounce, no loops, pins ≤ 2 screens. Good calm moments: a document or file opening page by page, a hairline timeline filling, a big word resolving from blurred to sharp, a photo arch widening. A page with only fade-ins is not "calm", it is unfinished.

## 15. Drawn worlds (flat geometric illustration at page scale)

- **Tones:** every colour as a light/base/shade triple; choose outlines OR no outlines for the whole page. Large flat areas get a second layer (distant roofs, hills, pattern at 6–10% contrast) or they read as empty.
- **Zoom-safe detail:** if the camera zooms 3–4×, the zoomed part needs its own detail (door hardware, date stone) — check a screenshot at the maximum zoom.
- **Fit-region camera (phones):** don't hard-code start/end viewBoxes; define regions of the drawing and fit each into a target box of the screen, with separate targets for landscape and portrait:
```js
function fit(region, box, vw, vh){ // region/box = {x,y,w,h}; box in screen px
  const s = Math.min(box.w / region.w, box.h / region.h);
  return { x: region.x - (box.x / s), y: region.y - (box.y / s), w: vw / s, h: vh / s }; } // → viewBox
```
- **Text over a moving drawing:** put copy on solid panels that scroll over it, or over a flat sky zone the camera keeps clear — never over busy detail.
- **No-JS default = the hero framing,** not the finished scene (a raised sea/sun behind the hero text is a mess); raise end states from JS for reduced motion.
- **Reduced motion for one pinned drawing:** show a still crop of the finished drawing per chapter (one `<svg><use href="#world"/></svg>` with a different viewBox each).
- **Build scripts are allowed:** generate the SVG with a Node script and inline it, so the page stays one self-contained HTML file with the drawing baked in.
- **Label the world:** a small "Illustration" note on the drawing + a footer line; list what the drawing implies (window count, balcony, signage) in the report.

### Path over photography (a line that runs through photos)
- Pick anchor points in each photo (the track, the aisle, the stream) in image coordinates; map them to screen with the same object-fit/object-position maths as the crop, so the line stays on them at any size.
- Inside a zoomed/pinned photo, put an SVG sized to the photo inside the zoomed wrapper so the line zooms with it; draw page-space segments separately (a sticky stage breaks a line drawn in page space).
- Rebuild the page-space path after fonts load, images load and on resize; anchors reveal by opacity only (no translate), or the line lands in the wrong place.
- A thin line over photos: dark edge + light core, so it reads on sky and shadow. No-JS: the line may simply be absent.
- Zoom a photo at most ~source width / viewport width (2.5× on a 2000px source was soft).

## 16. Things that broke in practice (check each)

- Off-screen fly-in items widened the page (2,223px at a 1440 viewport) and it stayed wide after scrolling back → `overflow-x: clip` on every section/stage.
- A pinned phone runway of 3,600px with the last 600px doing nothing → size runways from beats.
- A floating bottom pill covered text and forms on phones → hide while pinned, dots-only < 600px, never over a form.
- `data-reveal` markup copied from another page kept content hidden → strip foreign reveal attributes.
- Emoji in mockups fell back to a system font → replace with small drawn icons when a single font is required.
- A visibility observer restarted a demo while the page scrolled to it, cancelling it on phones → guard re-entrancy.
- SVG `<text>` inherited `direction: rtl` and spilled out of bubbles → set `direction="ltr"`/`text-anchor` explicitly inside SVG.

- `overflow-x: clip` on `body` plus a nowrap row made an RTL phone page unscrollable → clip sections, not `body`.
- Constant animations (sparks, marquees, looping steam) make every frame differ, so frame-hash dead-scroll checks pass even when the scroll does nothing → pause loops while testing, or judge dead scroll from the scroll-linked elements.
- A scroll-linked countdown hid the only CTA until the very bottom → the main action is always visible without scrolling to a trigger.
- RTL number ranges ("08:00–19:00", "30–50") rendered reversed → wrap in `<bdi dir="ltr">`.
- A `hidden` attribute lost to `display:inline-flex` → `[hidden]{display:none!important}`.
- Buttons fell back to Arial → `button,input,select,textarea{font:inherit}` in the base CSS.
- `<use href="#sym">` without width/height on a symbol with a negative-origin viewBox rendered clipped → give the `<use>` explicit size.
- Styles on `path` inside a `<symbol>` reused via `<use>` did not apply (ticks rendered as black triangles) → style the `<use>` with `fill`/`stroke` + `currentColor` inside the symbol.
- Some Hebrew display fonts (Suez One) draw ₪ as "שח" → check the ₪ glyph in the chosen font or set it in the body font.
- A max-content marquee row inside a CSS grid widened the grid column to 7,083px and, in RTL, anchored off-screen → `grid-template-columns:minmax(0,1fr)`, make the track `direction:ltr`, clamp its translate to [-(track − viewport), 0].
- Fire/smoke that should flicker: drive it from scroll progress (e.g. a sine of k), not a CSS loop, so dead-scroll checks stay meaningful.
- Header over changing colour blocks / pinned steps: give each section (and stage step) a `data-theme`, and let the header take the theme of whatever is under it — frameless, never a pill.
- Heading size set on inner spans made walk.mjs measure a 216px heading as 30px → set font-size on the heading element itself.
- Pin budget: ~0.5–0.8 viewport per beat. A section may pin longer than ~2 viewports only when it is the page spine (path, world, one-object story) AND every wheel step changes something; otherwise split it.
- A later `@media` rule silently beat a mockup's `@container` rule (video half-width on phones) → keep container-query rules last, or scope media rules away from mockup internals.
- A section `padding` shorthand wiped the `.wrap` side gutters on phones → set only `padding-block` on sections.
- Assembling a product window on a pinned stage: stagger pieces within a beat, never overlap two beats' fades, start the first piece before the pin so the stage never opens empty, keep one continuous element (progress bar) moving.
