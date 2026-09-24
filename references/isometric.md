# Isometric engine: usage guide (`assets/isometric-engine.js`, global `ISO`)

A small engine with no dependencies. It extrudes flat profiles into solids, gives each face one of three tones, and returns painter-sorted SVG paths. The same code runs in Node (to bake the SVG) and in the browser (to redraw on scroll). Write every scene as a **pure function of its state** (`scene(p)` → `{ solids }`).

Load it one of three ways:
- **Browser:** inline the file in a `<script>` to get `ISO` as a global.
- **Node:** `require('./isometric-engine.js')` returns `ISO`.
- **Node, engine and scene together:** `new Function(engineSrc + '\n' + sceneSrc + '\nreturn {ISO, SCENE}')()`. See §9.

## 1. Mental model and axes

```
            screen                    world: x, y on the ground, z up. 1 unit = S px (default S = 30)
              ▲ +z  (straight up)     screenX = (x − y)·cos30°·S
              │                       screenY = ((x + y)/2 − z)·S
              │                       depth   =  x + y + z   (bigger = nearer the viewer)
          ╱   │   ╲
   +y  ◣╱     o     ╲◢  +x            +x runs RIGHT-DOWN, +y runs LEFT-DOWN.
   (left-down)       (right-down)     The viewer looks from (+x, +y, +z).

 Visible faces and their tones:  top (+z) = c[0] light · left wall (+y) = c[1] mid · right wall (+x) = c[2] dark
 The −x, −y and −z faces are culled. Tones are picked from the normal after rotation, so turning the scene re-shades it.
```
The back corner of the ground is at the top of the screen, at (0, 0). Put the things that should read as "in front" at large x + y.

## 2. Minimal scene
```js
const ISO = require('./isometric-engine.js');            // or the inline <script> global
const sc = { solids: [
  ISO.box(0, 0, -.3, 6, 4, .3, 'paper', { layer: -1 }),  // ground slab, always drawn first
  ISO.box(1, 1, 0, 2, 1.5, 1.2, 'coral', { deco: [ISO.onY(.3, .9, .3, .9, 1.5, '#2E3650')] }), // window on +y wall
  { k: 'ball', o: [4.5, 2.5, 0], r: .5, c: 'lime' }
] };
const r = ISO.render(sc, 0, 24);                          // phi = 0, S = 24 px per unit
const svg = ISO.svg(r, ISO.frame(r, 10));                 // full <svg> string, viewBox = box + 10px padding
```
Shorthand: `box(x, y, z, w, d, h, c, more)` gives `{ pl:'xy', pr:P.rect(w,d), o:[x,y,z], e:h, c }`, with `more` merged in. `ext(a, b)` merges b into a.

## 3. Solid fields
| field | meaning |
|---|---|
| `k` | omitted = extruded prism · `'dome'` = half-sphere standing on `o` (the base centre) · `'ball'` = sphere resting on `o` (its bottom point; centre is at `o.z + r`) |
| `pl` | plane of the profile. `'xy'` (default): profile lies on the ground, extruded **up** by `e`. `'xz'`: u→x, v→z, extruded along **+y**. `'yz'`: u→y, v→z, extruded along **+x** |
| `pr` | profile `[[u,v],…]`, **counter-clockwise** (every `P.*` helper already is; wrap hand-written ones in `P.ccw(pts)`) |
| `o` | `[x,y,z]`, where profile (0,0) sits in the world. For an `xy` box this is the back-bottom corner |
| `e` | extrusion length |
| `c` | palette name (`ISO.PAL` key), a single `'#hex'` (the ramp is derived), or an array `[top, left, right]` (+ optional `[3] slopeL, [4] slopeR`, see §4). Anything else throws a clear error |
| `r` | radius for a dome or ball |
| `g` | height scale about `o.z` (default 1). `enter('rise')` sets it. A dome scales its radius. A ball ignores `g` |
| `dz` | vertical offset, added after `g`: drops, hovers, bobbing |
| `a` | opacity 0–1. `a ≤ .01` removes the solid from the render entirely, including from the `box` |
| `deco` | flat decals, strokes and text painted on this solid (§5). Drawn after the solid's own faces |
| `yaw`, `piv` | turn about the vertical axis through `piv [x,y]` (radians; +yaw turns +x toward +y, clockwise on screen). **`piv` is required whenever `yaw` is set**. Hinged door: `box(1, .3, 0, .9, .1, 1.6, c, { yaw: open * 1.4, piv: [1, .3] })`, where `piv` is the hinge edge and opening swings the door out toward the viewer |
| `layer` | integer. Sorting is by layer first (×10⁴): `-1` for ground and roads, `1` for overlays |
| `key` | absolute sort key that replaces the footprint term (§7). It does **not** follow `phi` rotation |
| `on` | another solid object. Draw this one right after it (rotation-safe). Use it for things that sit on top of something |
| `kb` | sort bias added to whatever key applies (e.g. `-.02` = just before) |
| `ridge` | `true` or 0–1. Up-facing slopes get their own tones, so a pitched roof keeps its ridge (§4) |
| `en`, `drop` | default kind (`'rise'`/`'drop'`) and drop height (default 2.4) for `enter()` |

Scene object: `{ solids, labels?: [{id, p:[x,y,z], a?}], cx?, cy? (rotation centre), S? }`.
Profiles `ISO.P`: `rect(w,h)`, `rrect(w,h,r,n)`, `circle(cx,cy,r,n=44)`, `sector(cx,cy,r,a0,a1,n)`, `tomb(w,h)` (round-top door), `arch(w,h,t)`, `star(cx,cy,R,r)`, `plus(s,t)`, `bubble(w,h,r,tx,tw,th)`, `shield(w,h)`, `crescent(R,dx,dy,R2)`, `clip(poly, convexBy)`, `move(p,dx,dy)`, `ccw(p)`.
A wheel: `{pl:'xz', pr:P.circle(0,0,.2,14), o:[x,y,.2], e:.15}`. A cylinder: `{pl:'xy', pr:P.circle(0,0,r,24), o:[cx,cy,z], e:h}`. A gable roof along x: `{pl:'yz', pr:[[-.2,0],[d+.2,0],[d/2,rise]], o:[x-.15,y,h], e:w+.3, ridge:true}`.

## 4. Palettes
- Each colour is a 3-tone ramp: **top (lightest), left/+y (mid), right/+x (darkest)**. **`ISO.ramp('#4F7FEA', lift=.36, shade=.8)`** builds one from a single brand hue, which becomes the mid tone:
  - top: HSL lightness raised 36% of the way to white, with saturation ×1.15;
  - right: lightness ×0.8, with saturation ×0.75.
  This reproduces the testers' hand-picked ramps within a few points. A plain `c: '#hex'` uses it automatically. Tune it per hue by eye: yellows need a smaller `shade` (≈.85) or they turn olive.
- **Washed out:** the mid tone should sit at HSL lightness ≤ ~80%. Above that, top ≈ white and the top/left edge disappears. For near-white materials (paper, ground, walls), write the ramp by hand, like `PAL.paper = ['#FFFFFF','#EDEDF1','#D8D8DF']`. Keep the left tone about 6% darker and the right about 12–15% darker, and let the ground's side tones carry the edge. On a white page, give the ground a tinted top, never `#FFF`.
- Built-in names: `base paper road mint aqua sea navy lime lilac coral peach sun ink grey night`. Override them by passing arrays.
- `ISO.mix(hexA, hexB, t)` blends two colours and `ISO.mixPal(a, b, t)` blends two ramps (day → night, "dim the others"). Both need `#rrggbb`. An `rgba()` ramp works for plain faces (a shadow slab), but not with mix or ridge.
- **Roofs:** a slope flatter than 60° counts as "top", so with 3 tones both slopes get `c[0]` and merge into one shape with no ridge. Set `ridge: true` (mix 0.5) or `ridge: .8` (more contrast). The left-leaning slope then gets `c[3]`, or `mix(c[0], c[1])` if there is no `c[3]`. The right-leaning slope gets `c[4]`, or `mix(c[0], c[2])`. At a 45° pitch or steeper, only one slope faces the viewer anyway.

## 5. Decals, strokes, text (`deco`)
A deco entry is `{ pts:[[x,y,z],…], n, f, st, sw, z }`:
- **`pts` are world-axis offsets from the solid's `o`**, even for `xz`/`yz` solids. They are not profile u/v. z is multiplied by the solid's `g` and shifted by `dz`; x and y are not scaled. Yaw carries them along.
- `n` is the normal used for culling. **Always set it.** A decal without `n` is never culled, and because decals draw after the solid, it paints straight through the solid. For the back wall, pass `{ n:[0,-1,0] }` so it only shows once the scene turns.
- `f` is the fill. `st` + `sw` give a stroke (`sw` in world units, scaled by S). A stroke with no `f` is an open polyline. `z` sets the order among this solid's decals (higher draws later).
- Balls and domes carry decals too (eyes, a logo), as flat shapes offset from `o`. For a ball, `o` is its bottom point. Give them `n:[0,1,0]` or `n:[1,0,0]`.

Helpers (the last argument is `extra`, merged in):
- `onY(x0,x1,z0,z1, y, f)`: rectangle on a wall facing +y (the left wall).
- `onX(y0,y1,z0,z1, x, f)`: rectangle on a wall facing +x (the right wall).
- `onZ(x0,x1,y0,y1, z, f)`: rectangle on a top face.
- `polyY(pts2, x,y,z, f)`: 2-D shape on a +y wall (u→x, v→z). `polyX(pts2, x,y,z, f)` is the same on a +x wall (u→+y, v→z). `polyZ(pts2, x,y,z, f)` is the same on a top face (u→x, v→y).
  Example: `polyY(P.circle(.5,.5,.3,20), 0, d, 0, '#fff')` puts a round window on the front of a box of depth `d`.
- **Text**: `ISO.text(str, [x,y,z], face, {size:.5, f, weight, font, anchor:'middle', ls, dir, bl:'central', z})`.
  - `face`: `'y'` (left wall, reads along +x), `'x'` (right wall, reads along −y), `'z'` (top, reads along +x), `'-y'`, `'-x'`, or `{u, v}`.
  - `size` is in world units. The text is drawn as an SVG `<text>` with an affine `matrix()`, so it shears with the face and is culled with it.
  - Hebrew: `{ dir:'rtl' }`.
  - `font` must be a family the page actually loads. Without it the baked SVG inherits the page's font.

## 6. Rendering and framing
- `ISO.render(scene, phi=0, S)` returns `{ faces, labels, box }`. The `S` argument wins over `scene.S`.
  - `faces` are in painter's order.
  - `labels[id]` is `{x, y, a}` in viewBox units.
  - `box` is `[x0, y0, x1, y1]` of what was drawn.
- `ISO.svgInner(r)` returns `<path>`/`<text>` markup. `ISO.svg(r, vb?, attrs?)` returns a whole `<svg>`.
- `ISO.frame(rendersOrBoxes, pad)` returns `[x, y, w, h]` for a viewBox.
- **Frame across every state, not just the final one.** `box` only covers solids that are currently visible, so a single-state viewBox makes the scene jump or clip when things drop in from above or drive off. For example: `ISO.frame([0,.25,.5,.75,1].map(p => ISO.render(scene(p), phi, S)), 12)`. For a turntable, also union across the phi values you'll pass through.
- Keep `S` fixed and size the scene with CSS: `<svg viewBox=…>` with `width:100%; aspect-ratio: w / h`. Never re-render at a new S when the window resizes.
- Chips pinned to scene points: `left: (L.x − vb[0]) / vb[2] · 100%`, `top: (L.y − vb[1]) / vb[3] · 100%`. The HTML then scales with the SVG.
- `ISO.proj([x,y,z], S, phi, scene)` gives the `[X, Y]` of any world point, matching `render`.

### Camera over a world with a path (pinned stage)
Render the whole world once per state and move only the `viewBox`. The camera itself costs nothing.
```js
const WORLD = ISO.frame(ISO.render(scene(1), 0, S), 16);                   // clamp box
const SHOTS = { play: [[9, 8, 0], [12, 11, 2.5]], kitchen: [[8, 1, 0], [12, 4, 4]] };   // camera-only anchor points (world)
function shot(id, desktop) {                                                  // aspect = the stage's own w/h
  return ISO.camera(SHOTS[id], { S, pad: 30, within: WORLD, aspect: stage.clientWidth / stage.clientHeight,
    fx: desktop ? .62 : .5, fy: desktop ? .5 : .7 });                          // text left → subject right; text on top → subject low
}
svg.setAttribute('viewBox', lerpVB(shot(a, d), shot(b, d), ISO.easeIO(t)).join(' '));   // lerpVB = per-number lerp
```
- **Anchor points belong to the camera only.** Keep them as world points next to the scene, and don't hang them on solids. Project them with `camera`/`proj` for the current `phi`.
- **Match the stage aspect.** Recompute the shots on resize. Place the subject by layout: `fx≈.62` when text sits on the left (desktop), and `fy≈.7` when text sits on top (phone). Put a solid→transparent fade layer (HTML, behind the text) over the caption area, so the world can run underneath without fighting the copy.
- **Zoom at most 1.6–1.9× the wide shot.** Past that, the flat 3-tone faces turn into big empty slabs. `within` keeps the view inside the world, and a shot larger than the world is centred instead.
- **Smooth it.** Wheel steps make build-ins and camera moves jump. Chase the target with the weighted follow in motion-recipes.md §3 (`cur += (target − cur) * .12`); §4 covers viewBox lerping.
- **A path between the ground and the buildings** (a walking route, a van trail) needs two render calls: `ground = render({solids: GROUND})`, then the path `<path>` (use `proj` for its points, `stroke-dasharray` to draw it on), then `render({solids: BUILDINGS})`. The markup is `svgInner(ground) + pathMarkup + svgInner(buildings)`. The path then passes under roofs and in front of the slab without joining the depth sort.
- **Reduced motion:** use cropped stills, one per beat. Put the same baked final-world markup in each `<svg>` with that beat's `camera()` viewBox, next to the beat's text. Clients read these as the full story.

## 7. Draw order: why small things vanish and how to fix it
Each solid is sorted by `layer·10⁴ + (key | key of on + .01 | footprint centre x+y after rotation) + kb + (o.z+dz)·.02`. Then each solid's own faces are sorted by depth. So the sort is by **the centre of the footprint, not the nearest point**. A crate on a big table has a centre further back than the table's centre, so it gets painted first and the table covers it. Fixes, best first:
1. **`on: table`**: the crate draws right after the table, at every rotation.
2. **`layer`**: the ground slab and roads at `-1`, floating overlays (pins, beams) at `1`.
3. **`kb`**: small nudges, e.g. the far wheels of a van `{ on: body, kb: -.02 }` (just before the body) and the near wheels `{ on: body }` (after it).
4. **`key`**: absolute and cheap, but frozen. It breaks when the scene turns (`phi`) or the object moves across other objects.

**Long, flat things are the worst case**: belts, floors, room slabs, roads. Their footprint centre lies behind the small objects standing near their front edge, so the slab paints over them. Put each standing object `on: belt`, or keep the slab one layer down (`layer: -1`). Otherwise split the slab into chunks about as big as the things on it. If you really need a numeric `key`, compute it for the current angle as `ISO.foot(s)` centre rotated by `phi` about `cx, cy`, never as a constant. Two solids that overlap in the same space never sort correctly, so don't let them interpenetrate.

## 8. Animation tied to scroll progress
Drive everything from one `p` (0–1, the runway's scroll progress) plus helpers: `ISO.clamp(v,a,b)`, `ISO.smooth(a,b,p)` (smoothstep of p between a and b), `easeOut`, `easeIO`, `backOut` (overshoot).
- **`ISO.enter(solid, p, start, 'rise'|'drop', len=.3)`** works on **one** solid and mutates it:
  - Before `start`: `a = 0`. The old alpha is restored once the entrance starts, so a reused object is safe.
  - `'rise'`: `g` goes 0 → 1 with overshoot. `'drop'`: `dz` goes from the drop height (default 2.4) to 0 with a hop, and `a` fades in.
  - Call it **every frame**, because the values stick where you last left them.
- **Stacked parts need group entrances.** With per-part `rise`, the walls grow while the roof hangs at its own `o.z`. Use:
  - **`ISO.enterGroup(parts, p, start, kind, len, {z0, drop})`**. `'rise'` scales the whole group about `z0` (default: the lowest `o.z`), so stacked parts ride up. `'drop'` moves every part by the same `dz` and `a`.
  - **`ISO.group(parts, {dx,dy,dz, g,z0, yaw,piv, a, layer, kb})`** returns **shallow clones** and leaves the originals untouched, so build parts once and group them every frame. It moves, grows, fades and turns the parts as one piece. Yaw composes with each part's own yaw. `piv` defaults to the group's footprint centre. `on` links inside the group are remapped to the clones.
- Stagger parts by delay: `parts.map((s, i) => ISO.enter(ISO.ext({}, s), p, .2 + i*.04, 'drop', .15))`. For stacked parts, use groups in order: floor 1 group, then floor 2 group.
- Motion along a path: compute `x = lerp(a, b, ISO.smooth(t0, t1, p))`. For a vehicle, use `ISO.group(VAN, { dx, dy, yaw })` and change `yaw` on corners.
- Parameters of any kind (a rim colour, a door angle `yaw`, a lift height `dz`, a screen `mixPal`) are just values computed from `p`.

Tested pattern (`scene.js`, in the classic-script style that loads in both the browser and Node):
```js
var SCENE = (function (ISO) {
  var box = ISO.box, C = { ground: ['#F6F1E7','#E4DAC6','#CDBFA5'], wall: ['#FFFFFF','#EEE8DD','#D9D0C0'],
    roof: ['#F08A6C','#D96A4E','#B5503A'], van: ['#8FB6FF','#4F7FEA','#3558B8'], ink: ['#4A4A55','#2B2B33','#16161C'],
    crate: ['#EFD2A8','#D9AF76','#BD9056'] };
  var walls = box(1, 1, 0, 3, 2.4, 1.6, C.wall, { deco: [ISO.onY(.3, .9, .4, 1, 2.4, '#2E3650'),
    ISO.text('BAKERY', [1.45, 2.4, 1.28], 'y', { size: .3, f: '#2B2B33', weight: 800 }),
    ISO.text('OPEN', [3, 1.2, .8], 'x', { size: .3, f: C.roof[1], weight: 800 })] });
  var roof = { pl: 'yz', pr: [[-.2, 0], [2.6, 0], [1.2, .8]], o: [.85, 1, 1.6], e: 3.3, c: C.roof, ridge: true };
  var HOUSE = [walls, roof];                                    // parts built ONCE
  var body = box(0, 0, .2, 1.6, .9, .9, C.van);
  function wheel(x, y, near) { return { pl: 'xz', pr: ISO.P.circle(0, 0, .2, 14), o: [x, y, .2], e: .15, c: C.ink, on: body, kb: near ? 0 : -.02 }; }
  var VAN = [wheel(.35, -.05), wheel(1.25, -.05), body, wheel(.35, .8, 1), wheel(1.25, .8, 1)];
  function scene(p) {
    var S = [box(0, 0, -.4, 8, 6, .4, C.ground, { layer: -1 })];
    S = S.concat(ISO.enterGroup(HOUSE, p, .05, 'rise', .3));    // walls + roof rise as one
    var big = box(5, .8, 0, 1.6, 1.6, 1, C.crate);
    S.push(big, ISO.enter(box(5.5, 1.3, 1, .6, .6, .5, C.crate, { on: big }), p, .4, 'drop', .2));
    var van = ISO.group(VAN, { dx: 1 + 4 * ISO.smooth(.5, .9, p), dy: 4.4, yaw: -Math.PI / 2 * ISO.smooth(.9, 1, p) });
    S = S.concat(ISO.enterGroup(van, p, .3, 'drop', .2));
    return { solids: S, cx: 4, cy: 3, labels: [{ id: 'shop', p: [2.5, 2.2, 2.6] }] };
  }
  return { scene: scene };
})(ISO);
```

**Rotating between the iso angles.** `render(sc, phi)` turns the whole world about `(sc.cx, sc.cy)`.
- `phi = 0` is the standard view and `phi = ±π/2` is the other iso angle: the left and right walls swap and every face is re-toned.
- `±π/4` is a front-on view (flat, symmetric), and it looks good as a mid-turn frame. Drive it as `phi = -Math.PI/2 * ISO.easeIO(ISO.smooth(a, b, p))`.
- Put `cx`/`cy` at the centre of the scene, or it swings off-frame. Frame across all the phis.
- Absolute `key`s don't rotate. Use `on`, `kb` and `layer` instead.
- Decals on back walls need a correct `n` so they appear only when turned toward you.
- To turn **one object** instead of the camera, use `group(parts, {yaw})` (or `yaw` + `piv` on the solid).

## 9. Bake the final SVG for no-JS (tested)
`build.mjs` runs next to `isometric-engine.js`, `scene.js` and `page.html`:
```js
import fs from 'node:fs';
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const ENGINE = read('isometric-engine.js'), SCENE_SRC = read('scene.js');
const { ISO, SCENE } = new Function(ENGINE + '\n' + SCENE_SRC + '\nreturn { ISO, SCENE };')();
const S = 24;
const vb = ISO.frame([0, .25, .5, .75, 1].map(p => ISO.render(SCENE.scene(p), 0, S)), 12);   // every state fits
const map = { VB: vb.join(' '), RATIO: vb[2] + ' / ' + vb[3], BAKED: ISO.svgInner(ISO.render(SCENE.scene(1), 0, S)),
  ENGINE, SCENE: SCENE_SRC, S };
const html = read('page.html').replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in map)) throw new Error('missing ' + k); return map[k]; });
fs.mkdirSync(new URL('dist/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('dist/index.html', import.meta.url), html);
```
`page.html` bakes the final state in, and JS takes over and redraws only when `p` changes:
```html
<div class="runway" style="height:400vh"><div class="stage" style="position:sticky;top:0;height:100vh;display:grid;place-items:center">
  <svg id="city" viewBox="{{VB}}" style="width:min(90vw,900px);aspect-ratio:{{RATIO}}" role="img" aria-label="…">{{BAKED}}</svg></div></div>
<script>{{ENGINE}}
{{SCENE}}
(function () {
  var svg = document.getElementById('city'), run = document.querySelector('.runway'), last = -1, queued = false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;          // keep the baked final state
  function progress() { var r = run.getBoundingClientRect(); return ISO.clamp(-r.top / (r.height - innerHeight)); }
  function draw() { queued = false; var p = Math.round(progress() * 400) / 400;
    if (p === last) return; last = p; svg.innerHTML = ISO.svgInner(ISO.render(SCENE.scene(p), 0, {{S}})); }
  addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
  draw();
})();
</script>
```
With JS off, the page shows the finished drawing, text included. It was checked in headless Chrome with scripts disabled: 31 paths and 2 texts. For small throwaway scripts, `require('./isometric-engine.js')` is enough on its own.

## 10. Performance: only redraw what changed
- Quantise `p` (e.g. to 1/400), skip the draw when it hasn't changed, throttle to one draw per rAF, and stop drawing off-screen scenes (IntersectionObserver).
- Split the static and moving parts into two `<g>`s. Render the background once (ground, back walls, static buildings), and redraw only the front group each frame. This works when the static part is entirely behind the moving one. The garage test drew back walls, then painted text, then the front props.
- For a tower or a grid of rooms, keep one `<g>` per floor or room and repaint only the one whose state changed. Cache the markup by state (`cache[floor + ':' + state]`).
- Keep scenes to tens of solids. Lower the segment counts: `P.circle` defaults to 44, and 12–20 is plenty for wheels and posts. Decals are cheap. Solids cost the most.
- Build the parts once. `group()` and `enterGroup()` clones are shallow and cheap, while rebuilding geometry every frame costs more.
- Fade a whole scene with CSS `opacity` on the `<svg>`. Per-solid `a` is applied per face, so a half-faded solid shows its seams and the faces under its decals.

## 11. Gotchas
1. +y goes **left-down**, not "into the screen". "In front" means large x + y. The visible walls are +x (right, dark) and +y (left, mid).
2. Deco points are **world-axis offsets from `o`**, whatever the `pl`. Their z is scaled by `g`. To convert world points: `[X − o[0], Y − o[1], Z − o[2]]`.
3. A decal without `n` paints through its solid. Back-wall decals need `n:[0,-1,0]` or `n:[-1,0,0]`.
4. A clockwise profile renders inside-out, so use `P.ccw()`. The argument order of `onX` is `(y0, y1, z0, z1, x)`, not x first.
5. `yaw` without `piv` throws. A ball's `o` is its **bottom** point and a dome's is its base centre. `g` doesn't scale a ball (`group` scales `r` instead).
6. Per-part `enter('rise')` on stacked parts leaves the upper parts floating. Use `enterGroup`. `backOut` overshoots about 12% (peaks near t = .56), so leave headroom in the frame and between neighbours.
7. The render `box` excludes hidden solids and culled faces, and text only adds its anchor point. Frame across states (§6) and pad for text.
8. Small things on big things vanish: use `on`. An absolute `key` breaks under `phi` and when things move.
9. `mix`, `mixPal` and `ridge` need `#rrggbb` colours.
10. SVG text needs its font loaded (or a `font` fallback stack). Text on the `'x'` face reads along −y. For RTL, set `dir:'rtl'` and keep `anchor:'middle'`.
11. Domes and balls are flat 2-tone discs: they don't show yaw, and they sort by their centre point.
12. **Every prop is an implied fact.** A pot says "we cook on site", six stools say "groups of six", a second van says "two vehicles", a lift says "we have a lift". Draw only what the brief confirms, and keep the others generic (crates, plants).
13. Everything in the scene has to come from the state, with no `Date.now()` or randomness per frame (use a seeded helper). Otherwise the bake and the live page disagree, and the scene flickers while scrolling.

## Premium (serious) isometric
- Near-monochrome solids (stone/navy) with ONE accent on the key object; no outlines; rise/drop with ease-in-out and no overshoot (bounce reads as toy).
- Cutaway stacked floors hide each other: lift the storeys above the current floor and empty the floors below; bake each floor as an isolated room for no-JS stills (cropping the full stack gives hard cuts).
- Fading a solid makes its own faces see-through while it fades — fade whole groups over a solid backdrop, or fade the group's `<g>` opacity instead of each face.
- Phones: let rooms crop past the screen sides rather than fitting the whole scene to the width.

## No-JS state, camera and labels (from tests)
- **What to bake:** a static scene → the finished state. A before→after story (mess → clean, bare roof → panels) → bake the hero in its START state plus one still per step in that step's END state. Never one baked image for both.
- **Keep the subject clear of the text:** `ISO.camera` places the subject by a fraction only; for a subject that must land in a free region (text on the other side) use the fit-region camera from motion-recipes §15 on the projected bounds.
- **Dollhouse cutaways:** fractional `layer` values (e.g. −0.5) for low partitions, and front "cut wall" curbs as an overlay layer.
- **Labels in scenes:** put text on floors only where no wall or furniture is drawn over it; prefer HTML chips anchored to projected points.
- **Configurators on phones:** keep the drawing sticky above the controls.

## Big objects, sky and live recolouring (from the drone test)
- A screen-scale object (drone, plane) can't live at world scale: render it at its own scale, derive its altitude from a target screen height, and project its shadow/cone into viewport space.
- The diamond leaves two empty sky triangles: put headlines and floating HUD there.
- Behind captions over a bright world use a soft elliptical halo, not a full-height fade (it bleaches half the scene).
- Measure zoom against the wide shot you actually use; district shots land at ~2.2–2.5× of a whole-island shot.
- Recolouring baked faces live (thermal panels, highlighted tiles): render with marker colours, rewrite them to `data-` attributes after rendering, then drive fills from CSS/JS.
- Iso diamond → flat square tile: CSS rotate(45°) + scaleY(~1.73) morph.
- Smooth ONE timeline value and derive camera, rider, cone and shadow from it — smoothing each separately breaks alignment.

## Fresh/bright premium, ground cutaways, water (from the irrigation test)
- Bright brands: white model plinth, one hue family for living things, the accent (water blue) only for the element it represents.
- A ground that opens: split plinth/lawn around the hole with fixed sort keys; draw only the above-ground part of the lifting block; dark decals on the hole's inner walls. Use single pieces when closed (split pieces show hairline seams at 1:1) or add a same-colour stroke on ground faces.
- Floating white objects vanish on a white page → tint their top tone.
- Clouds: an extruded outline of overlapping circles reads premium; clouds of balls read toy-like.
- Flowing water: light a line with a dash on `pathLength=1`, beads = small solids moved along the line.
- Zoom cap relaxes when the subject has its own detail (a lifted soil block held up at 3×).
- Caption column on a pinned stage: size it so the hero h1 fits on two lines.
- Drawn product: keep invented design minimal (plain faces, one screen, no connectors) and label it.

## Holes, liquids, tiles, dusk (from the pool test)
- A hole in the ground: only the far +y and +x inner walls are visible; keep a fixed order; soil-layer decals use offsets relative to each piece's corner (world offsets draw bands outside the model).
- Liquid filling a container: semi-transparent, drawn after the far walls and before the near ones, or its sides paint over the wall tops.
- Rows of tiles/panels: one polygon per tile with a gap showing the base colour as grout — cheap and reads well when filled row by row.
- Dusk: mix each colour's top/left/right tones by different amounts, darken props less, light windows warm — mixing everything toward one tone turns the scene grey.
- Captions over a background that changes from light to dark: switch the text colour from the background's progress, not from which caption is showing.
- RTL: fit-region boxes are measured from the left edge; decide the subject's side explicitly.
- A solid that is behind some objects and in front of others (a machine head overhanging a cup bay): split it into parts (tower / base / head) with absolute keys.
- Recolour by classes with `var()` fills when the scene is reused via `<use>` or re-rendered live — one variable change recolours every copy.
- Fit-region cameras happily zoom 3–4× on small subjects: cap close-ups (~2× the hero scale).
- Pinned world from frame one: the diamond's top corner collides with a centred headline — use a side column or the sky triangle; captions are timed from the camera's arrival; phone zoom ≈2× desktop or the world is a strip.
- Trees on terraced hills (stacked cylinders): default `on:` sorting draws hill trees after all levels, so back-half trees paint over higher terraces — use a per-tree `kb` or front-half placement.
- No-JS stage fallback: caption first in DOM flow (or `order:-1`) and cap the SVG height, or the headline falls below the fold.

## Build-as-you-arrive stories, big shelves, round labels (from the finance-town and pharmacy tests)
- **Never an empty hero:** when buildings rise as the camera arrives, the start state shows empty plots. Draw each future building as a thin outline "plan" (stroke-only override, `vector-effect: non-scaling-stroke`) so the hero already shows the whole story.
- **Hold, then travel:** split each stop's scroll into ~30% hold and ~70% travel, and let the build finish just after the camera arrives. Captions appear during the hold.
- **Contrast objects** (the "other banks", a competitor) sit next to the stop just before their beat, so one medium shot holds both. Placing them at a far corner leaves them tiny in every frame.
- **Rise without bounce:** `enter('rise')` overshoots; for premium work use your own ease-in-out rise (`y = (1 - easeInOut(t)) * h`).
- **Captions over a zoomed world:** past ~2× zoom the world fills the screen. Use a soft halo about 1.5× the caption box, or a side fade, or a panel on phones; decide per beat.
- **Open shelving with rows of items:** sort per bay, row by row (back row first), with boards and dividers drawn between rows. Plain x-major order clips lids and boards.
- **Labels on cylinders:** face the label 45° toward the viewer and keep it narrower than the radius, or it sticks out of the outline.
- **Wide ending shot:** frame the building, not the whole plinth; let the ground bleed off the edges.
- **Two pinned drawn chapters on one page:** each gets its own smoothed progress and redraws only while on screen. In no-JS mode, put the caption before the still.
- **Preview helper:** a small script that renders the scene at (state, camera) to PNG speeds up iteration. Build it early.
