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
