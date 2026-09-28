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

**3D page turn, details:** each page back needs its own gutter shading; fix the z-order of stacked pages so they don't flicker; covers are bigger than pages (inset the inside-cover art); opacity or filters on the book container flatten `preserve-3d`; size the book from the space below the caption. Hebrew books: pages lift on the left and land on the right — "right-to-left" in a brief means reading order, not motion direction.

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
- **No-JS default = the hero framing** (for before→after stories: hero in its start state + one still per step in its end state), not the finished scene (a raised sea/sun behind the hero text is a mess); raise end states from JS for reduced motion.
- **Reduced motion for one pinned drawing:** show a still crop of the finished drawing per chapter (one `<svg><use href="#world"/></svg>` with a different viewBox each).
- **Build scripts are allowed:** generate the SVG with a Node script and inline it, so the page stays one self-contained HTML file with the drawing baked in.
- **Cutaways:** plan the reveal layers into the drawing from the start (a clamshell bonnet, a wing panel that fades) — in side view the interesting part is often behind something.
- **One state function:** write the animated states as one self-contained function of progress; the page runs it live and the build script reuses it to bake no-JS/reduced-motion stills.
- **3 tones on a curved object without outlines:** horizontal light/base/shade bands clipped to the object's outline.
- **Wide objects on portrait phones:** let the hero crop bleed past the screen edge and add a pan along the object as its own beat.
- **Jointed human figures:** blend joint ANGLES between poses (blending target points flips elbows); keep the lowest point on the floor; solve two-joint limbs so planted hands/feet stay planted; switch the fixed point (feet ↔ hands) only at a pose both share; add in-between poses for multi-support moves (plank step-back) or hands float; offset joints within a limb for "joint by joint", but never the two legs (accidental three-legged pose). Pre-smooth the figure's centre over the whole timeline for a camera that follows without lag; the mat/floor stays fixed in the world.
- **Label the world:** a small "Illustration" note on the drawing + a footer line; list what the drawing implies (window count, balcony, signage) in the report.

### Multi-keyframe photo camera
Keyframes of {scale s, focus cx, cy (0–1 of the image)}; interpolate s geometrically and the focus linearly; translate = -s·(c − 0.5)·size, clamped to ±(s − 1)/2·size so the image edge never shows. Portrait phones see ~26% of a 16:9 frame — write separate focus points for portrait. Size the image to its full crop area and transform THAT (object-fit:cover crops to its own box first, so clamped pans show black edges on phones). Keep zoom ≤ ~1.5–1.9× on 2000px sources — on portrait phones cover-scaling a 16:9 photo already zooms ~2.7×, so use a camera box (e.g. top 60% of the screen) and separate phone zoom values per stop. Overlays (rings, stickers) live in image coordinates so they ride along.
Plan a **shot list before generating**: matching light, grade and screen direction across photos, and one photo containing the next (a window that shows the next scene) if the camera must travel through it.
No-JS / reduced motion for photo stages: sticky backdrops — `.ph{position:sticky;top:0;height:100vh}` + `.ph + .cap{margin-top:-100vh}` — so each caption scrolls over its own photo instead of one photo stretching over several captions.

### Zoom through a window into the next photo
Measure the window as fractions of the photo; map them to the screen with the object-fit: cover maths; the next photo sits in a layer shaped like the WINDOW (not the viewport — on portrait phones a viewport-shaped layer shows as a strip) and its transform is tied to the facade camera; interpolate zoom in log space. Zoom-through portals are exempt from the zoom cap (the next photo replaces the soft one). Prompt for it: one centred window, symmetric one-point perspective.

### Globe/map → dive into a photo
Keep the camera centred on the destination during the dive so the portal circle's centre stays fixed; zoom the globe exponentially; stop redrawing the canvas while the photo covers it; give each destination a short "close" beat before the next flight. Canvas text in RTL: set `ctx.direction = 'rtl'` and put labels on the far side of the dot for nearby places. Map outlines: low-poly, labelled "illustrative map", no disputed borders.

### A line through pinned stages, parallel lines, riders
- One segment per section, each meeting its neighbours at a fixed x; a "head" position keeps moving while a stage is pinned (e.g. 70% → 100% of the screen) so riders hand over between sections without a jump.
- Parallel lines along a curve (staff, rails, lanes): sample the path, offset along the normal, draw each with `pathLength=1` so they draw on together.
- Objects riding a path: clamp the angle to ±90° and flip the normal, or they turn upside down on right-to-left runs (the RTL default).
- "Plays with scroll" (instruments, machines): beats at integer scroll positions, a decaying hit envelope measured from the last beat, vibration as a lens shape between ± amplitude.

### Vehicles on a path (truck, car, bike)
Map scroll to a target screen height (e.g. 60%) and look up the matching point on a path that only ever goes down — stability and reversal come free (flat stretches make the rider jump sideways; keep them short). Use two drawn views (side on curves, front/back on straights) switched by the path angle, cap the tilt (~24°), turn wheels with distance, un-mirror lettering when the view flips. Crossing a pinned stage: three path pieces (before the pin / inside the stage / after), the rider lives in whichever contains its target height; the parking spot inside the stage must sit exactly at that height. Drawings sit UNDER the road+rider layer, text above them.

### Time of day from one photo
Grade one photo at build time (canvas-job) into morning / noon / golden / night; mask windows with a BLURRED mask (per-pixel masks speckle floors); add night lamp pools by hand. What keeps it from looking timid: a moving sun/moon on an arc, light bands sliding across the floor, camera drift and captions that change position. Ink type on a bright sky needs a light scrim, not a dark one.

### Path over photography (a line that runs through photos)
- Pick anchor points in each photo (the track, the aisle, the stream) in image coordinates; map them to screen with the same object-fit/object-position maths as the crop, so the line stays on them at any size.
- Inside a zoomed/pinned photo, put an SVG sized to the photo inside the zoomed wrapper so the line zooms with it; draw page-space segments separately (a sticky stage breaks a line drawn in page space).
- Rebuild the page-space path after fonts load, images load and on resize; anchors reveal by opacity only (no translate), or the line lands in the wrong place.
- A thin line over photos: dark edge + light core, so it reads on sky and shadow. No-JS: the line may simply be absent.
- Zoom a photo at most ~source width / viewport width (2.5× on a 2000px source was soft).

### Recolouring part of a photo (nails, a car body, a wall)
- Generate the photo with the region in a colour that is easy to key out (e.g. cobalt nails), then build in Chrome canvas: a region mask (smoothed + dilated 1–2px), a highlight mask and a greyscale shading map.
- Each new colour = flat colour layer + shading map with `mix-blend-mode: luminosity`, revealed by a sweeping gradient mask; don't brighten edge pixels (white halos).
- Keying natural subjects (hair): select by saturation, flood-fill the backdrop from the image border, shrink the mask edge ~2px (halo); each target colour needs its own brightness setting in the luminosity blend (light shades blow out, dark ones go pink). Pixel jobs on 2048px images: downscale to ~1024 or allow a long timeout.
- Inline masks as data URIs; keep the mask aligned with the photo's crop at every breakpoint.
- Design image prompts around the interaction: empty space where the RTL text sits, key-able colours, the subject centred for 16:9 and phone crops.

### Phone-led product stories (app sites)
One persistent phone frame whose screens crossfade (separate frames visibly dip); size the UI in em from the viewport height; the same markup becomes N static phones for no-JS (display:contents + grid). On 375×812 a caption + visual + phone can't coexist: slide the phone away during visual-heavy beats and cap the mobile zoom.
Glows/lights in photo coordinates: an SVG overlay in the image's own coordinate system; blur filters on thin paths need `filterUnits="userSpaceOnUse"` or they clip into a band.

### Scroll-driven chart (response time, prices, growth — sample data only)
Stretched SVG polyline with non-scaling strokes, revealed by a clipPath width tied to progress; an HTML dot rides the head (not an SVG circle, which would stretch); bake the full line for no-JS. Label moving sample numbers with one persistent "sample data" meta bar plus a note under the chart. State colours (red/green) are allowed alongside the single accent when the story needs them.

### Product photo parts (battery out, lid off) and borderless studio shots
- Flatten the generated studio background to exactly the page colour and smooth its grain (canvas-job) so a full-bleed product never shows a box; set the page background to that colour.
- Pull a part out of one photo: cut it along its own axis into a transparent layer, keep the objects in front of it (chainring, handle) as a separate top layer, rebuild hidden sections by repeating along the part, paint the empty bay underneath.
- Generate every later product view with the first product shot as the reference image; on a single-product page the generated photo IS a spec claim (drivetrain, clips, accessories) — list it.
- Spine budget for a product story: ~0.8–1 viewport per beat.

### Focus / blur reveal (optician, camera, "clarity" stories)
The page sits under a blurred copy; a moving lens-shaped window (inline SVG mask, not a separate file) shows the sharp layer through it; at the end the blur drops away. Keep the headline, CTA and trust line sharp from frame one — checks count blurred text as "visible", so look at screenshots. See-through product parts (lenses, glass, bottles): background removal keeps them solid — clear the transparent regions in a canvas-job.

### Light strips / glows in a photo (ambient light, neon, lamps)
Generate with the lights in a key-able colour, split into a neutral base (colour stripped) + a greyscale glow layer; tint the glow with a multiply fill inside an isolated group and `screen` it over the base — the hue can then sweep continuously. A hue sweep is not the product's real palette — label it.

### One neutral product, many looks
Generate ONE blank product (white can, plain bottle, blank box) on white; tint it with `mix-blend-mode: multiply` over each colour field and wrap your own HTML/SVG label on it (lay the photo's highlights/condensation back over the label with `screen`/`luminosity`). Avoids brand text in generated images and keeps every variant consistent. Multiply only blends with the element's own backdrop — a transform, `isolation`, or `container-type` on an ancestor creates a new stack and the product turns invisible or boxed.

### One object that travels the whole page (drone, car, bird, parcel)
- Put the traveller in a fixed layer that is a direct child of `body` (a fixed element inside a section can be trapped under later sections by stacking contexts).
- Keyframes in document scroll positions; some anchored to moving elements (read their rect each frame). Pinned chapters are "programs": functions of the chapter's own progress returning position, scale, rotation and any sub-parts (gimbal angle, camera footprint).
- Weighted follow (recipe #3) for the lag; bank/pitch from scroll velocity; reverse cleanly on scroll up.
- If the traveller must vanish (absorbed, merged into rain) and return, make the hand-off visible (it re-forms at a named source) so it still reads as one object. Moving between two scrolling anchors can make a fixed traveller drift UP on screen while it still falls relative to the page — expected. A scroll-linked end moment in the last section must fit the scroll actually left above the footer.
- Always-running parts (props, wheels) must not hide dead scroll: support a `?still` flag and run walk.mjs with `--pause-animations`.

### Fly to a target (objects into a shield, cart, phone row)
Measure each object's start rect and target rect with transforms off (on load and resize), then interpolate translate/scale between them by beat progress; use a different target on phones. A continuous element (progress bar/rail) must stay visible on phones too, or dead scroll returns.

### Growing worlds and season changes (from the finance family-tree test)
- **Full-screen colour changes:** blending two saturated colours directly (yellow→blue, blue→orange) goes through mud-grey. Pass through a light cream at the midpoint, and make the change while the camera is moving.
- **One drawing, live and still:** drive growth and season with CSS custom properties on the drawing (`--grow`, `--season`). The no-JS stills are `<use>` copies that set their own values, and the defaults give the hero state.
- **Camera over something that grows:** define the framings in the object's own coordinates, scaled by its current growth, so each framing stays steady while the world changes around it.
- **Pure camera beats** (pull-backs with no copy) need one giant word (a season, a chapter name), alternating sides, or they read as empty scroll.
- **Plan what each wide shot reveals:** a finale object placed in the world shows up in every earlier pull-back. Lay the world out around what each camera view may see.
- **Crossfading plates look faint in screenshots:** judge text from the held frames, and make sure the hold covers at least 30% of the beat.
- **More stages than services:** map the spare stage to a stated fact, or give it a statement beat. Never invent a service for it.

### Colour poster / kinetic type (from the hiring poster test)
- Hebrew variable fonts with a width axis (e.g. Noto Sans Hebrew) make `font-stretch` a kinetic lever: a word stretches across the page with scroll. Cap the stretch at what fits 375 minus the gutters and check on the phone sheet — it clips first there.
- Split-flap in RTL: pad words of different lengths to a fixed cell count on the left (the line end in RTL), and flip cells right to left.
- RTL marquees: the track starts on the right; offset it so no empty strip shows at the start.
- The frameless header takes each chapter's colour (ink on light floods, paper on dark).
- A flex `<summary>` or flex row with text + `<bdi>` turns them into separate unwrappable flex items that overflow on phones — wrap the text in one span.
- Replace arrow/symbol characters with drawn SVG: a glyph missing from the font falls back silently, and `--font` doesn't catch it.

### Colour floods between chapters (from the agency poster test)
- A flood that completes before the next pinned chapter arrives leaves a bare colour screen and a dead step at every seam. Overlap the next chapter onto the flooded stage (`margin-top: -100vh`) and let the flood finish just after the next chapter starts rising. Check every seam with a dense sheet (`shots.mjs --n 24`) at 1440 and 375 — no frame may be a bare colour field.
- Transformed elements (a travelling cursor, a word scaled 8×) grow `scrollHeight`: put `overflow: clip` (not only `overflow-x`) on pinned sections and the footer.
- Fit-to-width words without JS: measure each word's em-width once, bake it as a CSS variable (`font-size: calc(100vw / var(--em))`), and let JS only refine it.
- Visually-hidden screen-reader text inside a split-letter heading must reset its font size, or it inflates measurements.

### Horizontal tracks, stacked cards and product windows (from the agency tests)
- A pinned horizontal track or a stack of cards needs a hold on each panel (~30% of its scroll) with something moving (a loading bar, a slow push-in), or the sheets show half-panels and the walk reports dead scroll.
- Swapping dissimilar UI screens (dark code editor → light design canvas): use a wipe (a scan line), never a crossfade — mixed UIs look broken mid-fade.
- UI inside a scaled product window must stay readable: size its text in container-query units with a floor (≥ 12px on screen); side-by-side caption layouts shrink the window too far — put captions above or below it.
- Cap a fitted footer wordmark's height (e.g. `max-height` ≈ 42vh via font-size clamp): condensed or serif faces fitted to the width can make the footer taller than the screen.
- A fit-to-width wordmark measured with `scrollWidth` must be `width: max-content` (a block element narrower than its container measures wrong).

### Bento boards (from the agency bento test)
- **What makes a bento not a template:** unequal spans, mixed fills (one dark, one accent, pastels), live UI inside tiles, and tiles that change state as the story advances ("done" after their chapter).
- **Tile grows into a chapter:** animate a `clip-path: inset()` from the cell to the full screen and scale the chapter content to fit the current clip — without the scaling every transition frame is a bare coloured field. Box-shadows don't survive a clip-path; put the shadow on a wrapper that fades.
- **Pinned boards need movement at their lead and tail** (the first/last ~0.3 viewport): a staggered settle or drift, or they read as dead scroll. Between two pinned boards in a row, keep the header fixed and overlap the seam.
- **Custom-property defaults are the no-JS state:** write `--k` defaults as the finished state so skeleton layers never show without JS.

### Paper-cut pop-up cards (from the agency paper test)
- **90° pop-up card:** the base rotates `rotateX(90deg)` from its top edge, the back page and each pop-up piece rotate from the bottom edge; cap every piece's angle at the card's current open amount so nothing pokes through a closing card.
- Fake contact shadows as blurred bars on the base; accordion folds alternate ±2θ; an SVG drawn "on" a 3D plane needs its own rotated plane (children of a 3D-transformed parent can render flat).
- A half-closed card seen from the open side reads as broken at thumbnail size — stop around half-closed, or design a cover.
- `<img height>` beats CSS `aspect-ratio` unless you add `height: auto`.
- A one-column grid with a flexible absolutely-positioned demo gets a zero-height row on phones — use `grid-template-rows: auto minmax(0, 1fr)`. Generic nav-link rules (`.nav a { background… }`) can wipe the header CTA's fill — scope them.

### Always-moving backgrounds, card stacks, big product windows (from the Stripe-style and portal tests)
- A WebGL/rAF background that never stops makes every frame differ, so dead-scroll checks can't fail — give it a `#still` hook that freezes its time, and walk once with it (`--pause-animations` doesn't stop rAF/WebGL). A fixed full-screen canvas also reads 100% on largestVisual — judge from the sheets.
- CSS 3D card stacks: per-card `perspective()` plus explicit z-index (not preserve-3d sorting); build cards at their focused size and scale them down so text stays crisp; the focused card fills ≥ 60% of the width.
- A gradient wordmark with transformed (rising) letters paints nothing if `background-clip: text` is on the parent — give each letter the gradient offset by its own position.
- Big product window under changing chapter headlines: measure the tallest caption once and place the window below it; keep captions outside the window so no-JS shows them inline; the static fallback is one tall window with every view stacked. UI text inside the window lives in divs/spans (not `<p>`) so it doesn't drag the body-size median.
- A final state that looks empty (a board with every card in Done) — keep one item in progress.

### Path pages, manifesto sentences, a photographed object that turns (from the agency round)
- **Path page:** one path per section, joined at the section edges at fixed positions, each drawn by scroll progress; bake a copy of the full line (1440 and 375) for no-JS. Time strokes that go back up (window edges, lettering) explicitly so the pen never finishes off-screen. Check joined-up lettering for letter pairs that merge into other words. A continuous line is the signature moment — pinning would break it.
- **Manifesto (editorial as giant type):** 5–7 huge sentences, each sized to its own word and pill count (about 8–10vw), 3–5 lines per screen. Words light grey to ink over a soft ~3-word sweep mapped to the sentence's top from ~92% to ~26% of the screen (a pinned sentence needs entry-driven lighting or it sticks half-grey). Inline image pills use separate crops of the most visual region (a 2:1 site screenshot shrunk to a pill reads empty). Pill to full-bleed chapter: the background clip first hugs the image rect, then floods; drive a slow drift over the whole open + hold + close span.
- **A photographed object that turns** (a dial): erase the baked engraving and draw an SVG indicator; rotate it in un-projected ellipse space (scale Y, rotate, scale Y back). Generate a consistent set by passing the first image as reference — framing matches, so crossfades and screen compositing are trivial. Composite real screenshots into a photographed monitor by measuring its screen rect (threshold scan on a blank-white version) and positioning overlays in percentages of a cover-fit camera box; CSS clamp() with container units reproduces the JS camera for no-JS.
- A portal that ends on a flat colour leaves a dead seam — put content inside its last frame.

## Dates, countdowns and deadlines
- Required facts: the year and the time zone (default: the business's). No year → no countdown; say so in the report.
- Decide and document whether a deadline day counts ("until 1 Feb" = last valid day), singular/plural wording, and what each element shows after its date passes (tier greyed and struck, "has closed", event-day state).
- Daily cut-offs ("order by 12:00"): decide which days they apply, what shows after the cut-off without implying "tomorrow" delivery, and support `?now=HH:MM`; walk once with a frozen `?now=` so a live clock doesn't hide dead scroll.
- Support `?today=YYYY-MM-DD` for testing and check the edge days (day before, day of, day after) for every deadline.

### Assemble one photo from pieces (bouquet, dish, product)
Background-remove once → alpha WebP (`compress.mjs in.png out.webp`); cut soft wedges with conic-gradient masks around a pivot; land them one by one; hide seams by stacking "landed so far" and swapping to the unmasked image at the end.

### Pile → layout (receipts into columns, tiles into a grid, cards onto a shelf)
Split one multi-object cut-out into pieces by connected components (not a coarse grid — stair-step edges); generate container and pieces at the same camera distance; add a drop-shadow (cut-outs lose contact shadows); `height:auto` on every piece. When the final layout sits inside a zooming container, compute pile positions with the inverse transform; user toggles inside a pinned stage change the target layout — animate from the current positions. Let the page's own layout be the FINAL state; compute each piece's offset from a seeded "pile" position and animate the offset to 0 by beat progress. No-JS, reduced motion and the end state then come for free. Put shadows on a wrapper when the piece is clip-pathed (zigzag receipts clip their own shadow).

### Numbers as the image
Section numbers only count up from 0; rolling digits settle into whole positions quickly (a paused roll must never read "49" for "04"); a price never rolls through other values (₪0 passing ₪8 implies a price). Sample documents (receipts, forms, payslips): say "not an official form", keep the maths consistent, no years, and treat rates (VAT %) as legal facts to confirm.

### Bilingual / split-letter kinetic type
Split letters into `<span>` (never `<i>` — fake italic), give each word its own `dir` wrapper (inline-block letters are bidi-neutral), keep one visually-hidden text copy and `aria-hidden` on the split letters, measure after `document.fonts.ready`. Hebrew leaves right→left, English arrives left→right. "+1" in a Hebrew line → `<bdi dir="ltr">`. A `width:max-content` row in RTL aligns right (breaks translateX maths); a block English line in an RTL heading aligns left — set `text-align` explicitly.

## Type as image
- Fit text to width by measuring once (`scrollWidth`) and scaling font-size, not transform (`will-change: transform` on scaled text blurs it).
- Odometer digits: each cell `height:1em; line-height:1em; overflow:clip`, a column of 0–9 translated by -n em.
- Set the size on the heading element, not only on inner spans (checks and screen readers read the heading).

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
- Stacking panels with no hold: each panel was covered the moment it arrived → give every panel a hold (~0.6–0.8 viewport of margin) with something scroll-linked inside it (slow zoom, progress bar); compute the LAST panel's hold separately or it becomes dead scroll.
- Aperture/letterbox hero: put the hero copy inside the letterbox bar and size the bars from the copy height, so headline, CTA and trust line are on screen from frame one.
- Header over mixed sections (photo / light / dark): three header states, switched per section — a transparent header shows content through it on plain dark sections.
- Hebrew labels for actions: use nouns (אימוץ, אומנה, התנדבות, תרומה), not infinitives — prefixed verbs produce non-words.
- A `.pin` state class on `<html>` matched a `.pin` stage rule and squashed the page into a 454px column → prefix state classes on `<html>` (`is-pinned`, `has-js`).
- A tall pinned runway without JS = pure dead scroll → set the runway height only under `html.js` (and not under reduced motion).
- Absolute stage panels without `isolation:isolate` + explicit `z-index` let an earlier panel paint over a later one.
- Frameless header: transparent only over photos; over light or dark text sections give it a borderless solid fill, or it overlaps the content.
- Caption swaps overlapped two titles on phones → never overlap two beats' caption fades (the out-fade ends before the in-fade starts).
- Lines on a zooming SVG turn chunky → `vector-effect: non-scaling-stroke` — but NOT on paths that use `pathLength=1` dash progress (the dashes break apart); scale those strokes by hand instead. Styling parts inside a reused `<use>` symbol: CSS custom properties DO inherit into it (`fill: var(--part-a)`), so light one part at a time by setting the variable on the `<use>`.
- Multi-beat pinned scenes: every beat gets a different composition (scale, side, where the name sits), not only "something changes".
- A reveal class named `.in` collided with a layout class `.in` and changed page height → prefix state classes (`is-in`).
- A sticky panel inside a pinned story with nothing else moving = dead scroll → keep one continuous element moving through every beat.
- A sliced SVG with `overflow: visible` showed its cropped-out parts over the text above → `overflow: hidden` on sliced SVGs.
- No-JS for a staged finale (concert lights, a finished build): show the finished state; the "hero framing" rule applies to the hero only.
- `position: sticky` + `margin-bottom: -100vh` spilled the stage (and header) 100vh into the next section → put the sticky element inside an absolutely positioned track instead.
- Caption crossfades: outgoing ~0.28s, incoming delayed 0.15–0.2s, and phone beats ≥ 70vh — otherwise screenshots show overlapping text and checks flag partial opacity.
- Container-query height units (`cqh`) inside a column without a fixed height resolved to 0 in no-JS/reduced-motion (not pinned) → size with viewport units or give the container a height.
- Patching files with JS `String.replace`: `$$`, `$&` in the replacement are special patterns (`$$(` became `$(`) → use a replacer function.
- RTL: a flowing image wider than the screen is aligned to the right edge and crops the subject off the left → position with `margin-inline-start` / logical properties, not `left`.
- Single-file pages: a generic class (`.scrim`) reused by a fixed overlay (cart backdrop) leaked position/blur/z-index into a section → prefix component classes (`cart-scrim`, `soil-scrim`).
- Scaling a layer that carries its own backdrop gradient showed the rectangle edges → transform the content wrapper, never the layer with the gradient. Sticky-backdrop fallbacks: feather each caption backdrop top and bottom.
- Overlays that must zoom with a cover-cropped photo: a camera box sized `max(100vw, 177.78vh)` (16:9) so % positions equal image coordinates.
- Schedules with no confirmed days: show the grid with `--:--` and one tag, but avoid implying days that may be closed (e.g. Shabbat) — flag it.
- Full-screen colour per object: mid-tint field + saturated object + ink text (the same hue for both makes the object vanish). A colour flood from a contact point = clip-path circle whose origin comes from the SVG camera's projected coordinates.
- An `<img>` with width/height attributes whose width is set from JS kept its old height (squashed) → `height:auto`.
- Two-layer drawings (surface / inside): clip the inside layer to the building and ground only (the sky stays normal); put the clip on a wrapper group when the scene is reused with `<use>`.
- Long pinned stories (>4 chapters): place each beat inside the camera's arrival-and-hold window for that chapter, derived from the same timeline — beats timed independently drift and play after the camera has left.
- No-JS fallback with wide/top caption plates: stack those chapters (plate above its still crop) instead of side by side.
- RTL kanban / wide tracks: a track wider than its viewport anchors to the right in RTL, so pan maths and `offsetLeft` measurements break → give the track `direction:ltr` (content rtl inside) or anchor it left explicitly.
- Varying beats inside one product window: zoom around a focus point (mind the transform-origin maths), slide the window aside for a document to grow out, and fade elements you no longer need to make room.
- Neighbouring chapters: one chapter's closing colour must differ from the next chapter's opening colour, or two bands merge.
- A wall with a door-shaped hole to push the camera through: a rounded frame with a huge `box-shadow` spread as the wall, scale the wall around the frame centre; a door leaf rotated past ~85° on `rotateY` swings over the wall on the far side of the hinge — stop at ~80°.
- Gamified pages (puzzles, countdowns): clues use only confirmed facts; a fake timer never reads as a success rate — say in the footer it is scroll-driven, not real.
- Stacking panels: `overflow: clip` on each panel so hanging decorations don't leak into the one above; pinned stage content taller than (viewport − header) is only caught by screenshots — check it.
- A transform on a hero wrapper makes it the containing block for absolute/fixed children — captions positioned to the page landed above the viewport.
- A "hold" at t≈0 produces a dead step when the page returns to the top — start the first motion at t=0.
- Accessories drawn beside a product (cup, jug, case) imply they are in the box — list them.
- Countdown sequences ("3, 2, 1") reorder under RTL bidi — spell them in words or isolate them with `<bdi>`.
- A pinned runway that starts with the hero, under an in-flow sticky header, sits one header-height low at scroll 0 (the object gets cut at the fold) → negative top margin equal to the header height.
- The global `img{max-width:100%}` rule caps an intentionally widened/offset photo → override it on that image.
- An inline SVG's own height beats the parent's `aspect-ratio` → position the SVG absolutely inside the ratio box.
- A portal/clip opening that finishes before its pin ends = dead scroll → map progress over the whole pinned span.
- RTL drawers open from the inline-end side (left in Hebrew).
- Muted second headline lines still need ≥ 3:1 contrast — check them. Labels are `<p>`, not `<h2>`.
- Sections sized by viewport height also play while scrolling IN — drive floods/draw-ons from entry progress when the pin starts late, or the screen looks empty on phones.
- Baking pinned SVG drawings for no-JS: expose `window.__bake()` returning each beat's SVG, call it from a build script in headless Chrome (cdp.mjs `ev`), inject the results into the HTML.
- Image budget spent and the client wants more photography: reuse generated variants and crops, use drawn motifs/type chapters, and report the gap.
- One photo carrying several chapters (image budget): vary crop, colour, caption position and camera per chapter; when a rejected generation eats the budget, never cut the hero view — drop the view that can be rebuilt from crops.
- Short product names in huge thin type: wide tracking is the lever for width, not only size.
- Several scenes from a 3-prompt budget: generate ONE detailed still life, upscale it 4×, and use macro crops as separate full-screen worlds.
- Relighting a bright studio photo to low-key dark: multiply a dark tone, then add a hand-painted light map with `screen`; don't re-generate.
- Two pinned sections back to back show two half-frames at the hand-off → merge one camera story into one pin.
- A sticky overlay with `inset:0` slides in early → use `top:0` only with `inset:auto`.
