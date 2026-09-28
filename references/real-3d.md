# Real-time 3D (three.js) — single products and hero objects

Use when the direction is "real 3D": one product (watch, keyboard, bottle, flower) modelled and lit live, driven by scroll. The page is still one HTML file; this is the one allowed exception to "external = fonts only".

## Loading
- three.js from `cdn.jsdelivr.net` (or cdnjs), **pinned version**, ES module via an `importmap` (`three` + `three/addons/`).
- Fallback if WebGL is missing, JS is off, reduced motion is on, or the module hasn't loaded within ~9 s: stacked pre-rendered stills + all text (the page must be complete without the canvas).

## Modelling without model files
- Procedural geometry: `LatheGeometry` for round objects (cases, cans, bottles), `ExtrudeGeometry` with bevels for plates and bodies, `InstancedMesh` for repeats (keycaps, trichomes, bubbles, gears), `CanvasTexture` for labels, dials and legends you draw yourself (no real brand marks).
- Materials: `MeshPhysicalMaterial` — metal via metalness + roughness maps (brushed vs polished), clearcoat for lacquer/dials, bump for leather/grain. Environment: `RoomEnvironment` through PMREM + a key and a rim light; soft shadows only where they read (hands on a dial).
- **Glass:** `transmission` glass skips transparent meshes behind it (dial print vanished) → use low-opacity glass and make prints cut-outs (alphaTest), or render prints opaque.

## Scroll story
- One rAF loop, all poses as functions of a smoothed timeline (reversible). Typical beats: turn to profile with a projected dimension line → macro on a detail → explode into labelled layers (labels are HTML positioned from projected points) → flip/reassemble → macro into the mechanism → variants (colour flood of the whole screen per variant while the object turns 360°, swapping the variant while it faces away) → buy block where the same object follows the page.
- A long story = several adjacent pinned runways sharing ONE fixed canvas.
- **Type behind the product:** a fixed canvas between two sticky layers — giant thin headline in the layer behind, copy in the layer in front; no stacking context (transform/filter/opacity) on their parents.

## Performance
Cap `devicePixelRatio` at 2; render only while a 3D section is on screen and the tab is visible; reuse geometries/materials; no per-frame allocations.

## Baking the fallback stills
Expose a `#bake` / `window.__pose(name)` hook that sets a named pose and renders once; a build script opens the page in headless Chrome (scripts/cdp.mjs), calls it per pose, reads `canvas.toDataURL()` (with `preserveDrawingBuffer: true`), and writes WebP stills (soft alpha mask so straps/edges fade, not cut). Headless Chrome usually has the real GPU; if not, add `--use-angle=swiftshader --enable-unsafe-swiftshader`.

## Verification notes
- walk.mjs `largestVisualPctOfScreen` reads 100% for a full-screen canvas and continuously animated parts (a ticking seconds hand) can hide dead scroll — judge from `shots.mjs` contact sheets; freeze idle animation with a `?still` flag when walking.
- Confirm the canvas actually rendered (non-empty pixels) in screenshots at 1440 and 375.

## Implied facts in 3D
Everything modelled is a claim: construction layers and their count, mechanism layout and finishing, materials, accessories, strap/label colours, a spray nozzle. Label the model "illustrative render" and list what it implies.

## Phones
Products cross text on narrow screens: give text a solid/gradient band, lay long objects sideways, or move the object to the top half during text beats.

## More from the keyboard test
- Separate camera keyframes for wide and tall screens; shift the framing with `camera.setViewOffset` so captions get room; add a caption scrim whenever the object fills the screen.
- Put interactive buttons in a layer ABOVE the canvas (they ended up behind it once); fade text with opacity on children, never on the article (it creates a stacking context and breaks "name behind the object").
- three.js gotchas: `RoundedBoxGeometry` is already non-indexed (`toNonIndexed` warns — a console error for walk.mjs); `computeVertexNormals` on it gives faceted edges; canvas-gradient floors with a wrong centre show a rectangle.
- Bake with a render mode (`?render=1` + `window.__render(t, w, h)` returning a JPEG/WebP) and one build script; wide (1600×1000) and tall (900×1200) stills per beat.
- A sticky buy bar's bottom padding must be constant, not follow the bar's live height (it breaks heightStable).

## More from the medical-cannabis 3D test
- **Organic objects (buds, plants, food):** build them procedurally from lumpy lobes plus instanced details (calyxes, leaves, hairs, trichomes: thousands via `InstancedMesh`). Phones get about half the instances and no depth of field.
- **Macro dives:** scale the detail up as the camera arrives, instead of flying the camera into the mesh. Clearing a path for the camera cuts a visible groove.
- **Morphs between products** (bud → drops → bottle fills; small flowers → jar → lid closes) read as one continuous film; drive them all from the same scroll timeline so they reverse.
- **No-JS / reduced-motion stills** must keep the page height identical to the WebGL layout (a sticky still per chapter, same runway heights), or heightStable fails.
- **Render on demand:** render only when progress changes (plus idle motion that `?still` can freeze), so walk.mjs dead-scroll checks stay honest.
- **Captions near a transparent header over a canvas:** fade them out as they approach the header. Keep captions in the half of the screen the object isn't in; check the frames between beats, where the object moves across.
- **three.js pitfalls:** `#include` lines in `onBeforeCompile` shaders must sit on their own line; set `customProgramCacheKey` per custom material; glass can't see other glass, so liquids and contents inside glass must be opaque meshes; post-processing depth of field treats a screen-space background mesh as a real plane (render the background as `scene.background` instead).
- **Weight:** list GPU cost and file size in the report; self-host three.js at launch if the privacy policy requires it.

## Phones with live app screens (from the fitness-app test)
- **Screens are canvas textures you draw** (≈1080×2424): an unlit material, tone mapping off, maximum anisotropy, redrawn only when scroll progress changes. Legibility at 375: the phone ≥ ~54% of the viewport height and texture text ≥ ~70px.
- **RTL on canvas:** `ctx.direction = 'rtl'` reverses number-only strings ("4 × 12" → "12 × 4"). Set the direction per string (canvas has no `<bdi>`): RTL for Hebrew, LTR for numbers and Latin.
- **Fonts on canvas:** `await document.fonts.load('700 70px Font', 'אבג 0123')` with Hebrew AND digits before drawing. Unicode-range subsets otherwise leave the texture in a fallback font, and walk.mjs only checks DOM fonts.
- **Screen changes:** crossfade two offscreen buffers into the texture (`globalAlpha` over the old frame looks muddy), or hard-swap while the phone faces away.
- **UI to 3D:** to make a card fly out of a screen tile, map the tile's pixel rect to phone-local coordinates, `localToWorld`, then slerp/lerp to its free pose. Cards must never be the accent colour on an accent-coloured section.
- **Sample data across screens** (exercise count, sets, totals) must agree everywhere. Keep one data object that every screen is drawn from.
- **Progress screens in wellness apps:** vary values rather than drawing a steady rise, and label "sample screen, not an outcome". Streaks and counters are feature claims; put them on the implied list.
- **Static fallback without dead scroll:** a sticky still with the caption entering as the still pins and leaving as it unpins (caption offset ≈ min(100vh, (runway − 100vh) × 0.75)).
- **Pinned-caption exit:** fade captions over the first ~20% of the sticky wrapper's exit progress, not only near the header; on tall screens they cross the object earlier.
- **No idle animation:** render only when the timeline changes; then `?still` isn't needed.

## Self-lit products, oval parts, hollow objects (from the gaming-headset test)
- **Emissive parts** (light rings, RGB zones): `toneMapped: false`; fake the halo with additive sprites/rings instead of a bloom pass (bloom kills the transparent canvas, and with it the DOM colour floods behind the object). Put point lights behind the emitting face, or they show as specular dots.
- **Additive glow in baked stills:** `AdditiveBlending` writes alpha², so `toDataURL` un-premultiplies and clamps the glow to yellow. Use `CustomBlending` with `blendSrcAlpha = OneFactor` (and `blendDstAlpha = OneFactor`) for glow materials that get baked.
- **Oval or mirrored parts:** nest groups (axis frame → scaled oval group → parts). Decals on the mirrored side need counter-rotation and pre-squashing, and explode vectors live in each part's local frame.
- **Hollow objects** (headphones, rings, frames) have nothing to macro into: pull the inner part out, turn it to face the camera and scale it up.
- **Bands, arms, cables:** sweep a profile along a curve (`TubeGeometry` or `ExtrudeGeometry` with `extrudePath`). Swinging parts (a boom mic) need a clearance check through the whole arc.
- **Labels on a straight-line explode** stack up: alternate the anchors above and below per part, and re-check on phones.
- **Unknown price:** the buy block shows a price placeholder and "Colourway (illustrative)"; the picker recolours the live model.
- **No cable shown** can read as "wireless": list it as an implied fact, and leave battery and latency out unless confirmed.

## RTL pages, installed products, camera paths (from the smart-lock test)
- **RTL × 3D:** text on the right, object on the left via a negative `setViewOffset`. Exploded layers should read right→left (outside → inside), which decides which side the camera sits on. In the scene use number badges and put the Hebrew names in the caption legend; floating Hebrew labels collide. Canvas text in baked stills needs the per-string direction rule (see phones).
- **Installed products** (locks, taps, lights, fittings): the environment is part of the story. Make the door/wall see-through with opacity plus edge lines (jamb and wall fade too), use fog that follows camera distance so walls fall away, and change the lighting per beat (dusk outside → warm inside → white studio for the explode).
- **Camera through geometry:** straight lerps between keyframes pass through slabs and objects. Give each segment a Bézier control point that swings wide, and check that no keyframe leaves the camera inside a mesh.
- **Hands and fingers:** a capsule reads as a stick. Use a lathe profile with joint creases and a nail.
- **Projected HTML labels:** call `updateMatrixWorld(true)` before `project()` when you pose and render in the same frame. Store label coordinates in JS; never parse `style.transform` back, because the browser rewrites it.
- **Fallback stills must be `display:block`:** `<picture>` is inline, so `position: sticky` is silently ignored. In static mode the caption travels over the pinned still (both pinned = dead scroll).
- **Header parity:** a negative header margin that applies only in live (`.gl`) mode breaks heightStable by exactly the header height; apply it in every mode.
- **Captions on colour floods:** switch caption colour from the flood's brightness in JS.
- **Absences are claims too:** no keyhole implies no mechanical backup; no keypad implies none; a success LED colour is a feature. Security products: never "unbreakable", "only you", "100% secure".

## Two-sided app stories, card round-trips, transitions (from the hiring-app test)
- **Canvas RTL for mixed strings** ("יום ג׳ 10:00", "נ.ש"): draw the Hebrew part RTL and the number/time part LTR separately, placed by measured widths.
- **Card round-trip:** when a card flies out of the screen and lands back on it, match the card's aspect to the screen element's rect and draw both with one shared function, so the landing is seamless.
- **Transitions cross text too:** when the object changes sides while the next caption rises, it sweeps over the text. Arc the object up and over, or dip it below the fold and bring it back late; check the in-between frames on the contact sheet, not only the held ones.
- **Honest labels:** a "sample screen" chip inside the texture is unreadable at thumbnail size; the disclosure that counts is the DOM caption. Keep both.
- **Tall-screen static fallback:** on phones the caption band can cover most of a pinned still; there, stack the still above the caption instead.

