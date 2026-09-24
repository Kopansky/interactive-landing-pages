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
