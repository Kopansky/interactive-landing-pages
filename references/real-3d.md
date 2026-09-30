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

## Networks, globes and shape-shifting objects (from the crypto test)
- **Data-viz 3D** (node meshes, globes, particles, routing arcs): ~40% of the nodes on phones; additive glow on an opaque canvas; an occluder sphere to hide the back of a globe; draw arcs on with `geometry.setDrawRange`. A globe implies geography and coverage — label it "not a map, not live" unless confirmed.
- **An object that changes form** (card → point → mesh → cluster): the transformations are the beats; keep one timeline and let the camera hold on each form. Check the in-between frames — they tend to go empty.
- **One WebGL context across two sections** (stage and footer): move the same canvas into the footer's closing section instead of creating a second renderer.
- **Giant wordmark fitted with JS:** size it in CSS as close as possible first (`vw`), so the JS fit changes the height by only a pixel or two versus no-JS.

## Modelling a real product from photos (from the P90, bottle and SOS tests)
- Copy the reference photos into `work/`, trace a clean side view to pixel coordinates, scale it by one known published dimension (e.g. 505 mm = 1270 px) and build the profile from that; lathe/extrude from the traced curve.
- Report fidelity: what matches the photos, what was traced by eye, and what couldn't be confirmed (far side, materials, how it separates).
- **Footer closing moment when the fixed canvas has already ended:** move the canvas into the footer section, or bake a short flipbook (8–12 frames) from the same scene and scrub it with scroll.

## Liquids, printed wordmarks, one stage across the footer (from the bottle test)
- **Liquid in a clear container:** an opaque mesh clipped by a horizontal plane (`material.clippingPlanes`); compute the level from sampled cross-section volumes so the surface stays level and the volume stays constant when the container tilts. Keep the container glass low-opacity (not transmission) so the liquid and inner parts stay visible.
- **A wordmark printed on the product** is part of the product, not a logo: render it as a canvas decal at the photo's position; redraw it in your own typography if you don't have the artwork, and note that it differs.
- **Compare the render with the photo** side by side (same view, same framing) in `work/` and list what matches and what differs.
- **Closing moment in the footer with one sticky stage:** make the sticky wrapper span main and footer, so the same canvas carries the object into the footer.
- **Phone caption fades:** fade a caption only after its whole block has been on screen; a fixed fade line (e.g. 45% of the screen) cuts the bottom of tall captions.

## Lit scenes, Hebrew wordmarks, tall screens (from the SOS test)
- **Caption colour follows the scene's light**, not the background colour: in a lit 3D scene the table or wall fills the frame, so switch light/dark captions from the light level of the beat (morning/afternoon/evening), not from a CSS background.
- **Giant Hebrew wordmarks with final letters** (ך ם ן ף ץ) are clipped by a tight line-height ("סמוך" read "סמור"): give descenders room (line-height ≥ 1.1, or padding-bottom) and check the footer at 375.
- **Tall screens need a different look-at target**, not only a pulled-back camera: horizontal spreads (explodes, object + phone) get cut at 375 unless the target and layout move to a vertical arrangement.

## Frosted glass that actually blurs (from the privacy-coin test)
- `transmission` + `roughness` blurs only **opaque** objects behind it: moving things behind frost must be opaque and saturated, or they vanish into a white glow; additive/transparent glows never show through.
- The glass needs something to blur: put the backdrop inside the scene as an opaque full-screen quad (not DOM colour behind a transparent canvas) — which also rules out DOM colour floods on that stage; change the quad's colour per beat instead and switch caption/header contrast from its brightness.
- A clear window in frosted glass = a roughness mask, plus a patched `transmission_fragment` in `onBeforeCompile` so the masked area samples sharp.
- **Tall baked stills** must match the phone's aspect (e.g. 900×1950 for 375×812) or `object-fit: cover` crops the object.
- A two-line stacked headline next to an object filling ~90% of the screen may sit under the 45% h1-width guide — that's a deliberate composition, not a timid one.

## Services without a product (from the agency 3D test)
- A service business has no product to turn and explode: pick one symbolic actor (a cursor, a key, a seal) and make every chapter's object **born from it and return into it** — that's what makes it read as one film.
- **file:// images taint WebGL:** embed texture images (portfolio screens) as data URIs at build time, or serve over http.
- **Chapter colour changes:** RGB lerps go muddy (amber → mint = olive), HSL lerps pass through the wrong hue; flood the new colour as a circle from the click/object point instead.
- **Mode classes vs component classes:** a component class that equals a mode class on `<html>` (`.cd-gl`) can hide the whole page — prefix mode classes differently (`is-gl`, `has-stage`).
- **Phones:** a flex input's min-content can push a sticky caption wider than the screen — use `minmax(0, 1fr)` columns in caption grids. White caption text over a white object is invisible even with correct z-order — give captions a scrim when they can cross the object.

## Engineering drawings in 3D, overlays in stills, caption timing (from the clinical bottle test)
- **Technical lines:** `Line2`/`LineMaterial` (fat lines) with draw-on via `instanceCount`, dashed centre lines, `depthTest: false` for lines drawn over glass; sections with clipping planes and `ShapeGeometry` cut faces.
- **Overlays in baked stills:** HTML/SVG overlays (dimension lines, leaders, labels) must be baked too — keep one overlay list rendered to SVG live and to canvas 2D at bake time, with a scale factor for 2× phone stills.
- **Caption vs scene timing:** sticky captions appear about half a viewport before their chapter's timeline starts, so scenes lag captions — map the timeline from `scrollY + 0.5 × innerHeight`.
- **Tall phone captions:** start the fade at `min(46vh, vh − captionHeight)` so the whole caption is seen before it fades.
- **Holds:** add a slow camera drift in every hold; still frames and repetitive rows read as dead scroll.

## Worlds, portals, walls and fallbacks (from the agency 3D round: portal, orbit, letters, cube, clay, tiles)
- **Many worlds instead of one object** (islands, moons, rooms, letters): give every body per-beat keyframes (composition, not physics — orbital speeds put a moon in front of the core), arrival/leave windows per stop, a sharper ease on flights so mid-flight frames aren't empty sky, and look outward or sideways at landings so the background is sky, not the rest of the system. Dim or avoid neighbours near captions.
- **Portal pass-through:** render the next world to a HalfFloat multisampled render target through a mapped camera (entry frame × inverse(ring) × camera) with a clipping plane; swap scenes while the disc already fills the screen (about 0.14 from the plane); no roll on the ring; NoToneMapping if some materials skip tone mapping; pre-warm every program; keep lights out of the travelling object (a light-count change recompiles shaders at the crossing).
- **Docking a 3D object into a DOM glyph** (the C of a wordmark): unproject the rect's centre and solve the distance from the object's diameter and the FOV; make it lit or emissive at small size.
- **Camera clearance check:** sample the camera path and test the distance to every surface (point-in-shape plus distance to edges); guard against NaN from duplicated shape points, or the check silently reports nothing. Close walls also read as empty frames — judge transitions on the sheet.
- **Tall screens:** use a wider FOV (about 56° instead of 38°) rather than pulling the camera far back; tall overrides must reset the desktop horizontal view offset; re-lay-out wide spreads for phones.
- **Horizon shots:** the camera height sets the horizon (h ≈ 0.016·r gives about 10° below eye level); anything on the surface beyond a short distance is hidden, so start paths at the horizon line.
- **Extruded letters as architecture:** line only the inner faces with separate meshes set slightly back from the front face, or a thin coloured line shows at the silhouette.
- **Walls or fields that fill the screen** (tile walls): keep the grid edges out of view, place reliefs by screen anchor, scrim only the caption side, let the camera lead the flip, and resolve pixel-sampled screenshots into a crisp image — sampled tiles alone don't read.
- **Clay / soft matte:** sheen material, neutral tone mapping so pastels stay true, contact-shadow blobs as fake ambient occlusion.
- **Technical drawings in 3D:** EdgesGeometry plus explicit silhouette lines plus a paper-coloured occluder copy (polygon offset) for hidden lines; a true cross-section is two half-lathes plus flat hatched cap faces.
- **Fallback stills:** the `<picture>` itself must be the sticky element; each still's wrapper extends 100vh past its section so the next slides over it; runways over about 165–270vh need a second still or a wrapper that unpins earlier; a late `is-static` class must not change height; classes JS sets per beat must also be in the HTML for no-JS.
- **The fallback hides errors:** a JS error sends the page to stills and the sheet can look like a pass — check the GL class (e.g. `has-gl`) before trusting a GL sheet. Parallel GL verification can trip the 9 s load timeout (cdp.mjs runs without cache) — run GL walks one or two at a time.
- **Caption fades on a fixed canvas:** drive them from the camera's arrive/leave window (CSS sticky timing drifts); fade near the header only when leaving; a `::before` backdrop covers padding too, so offset captions with margin; sticky captions pin only for (runway − 100vh), so align camera beats with that stretch; clamp projected label chips to the viewport.
- **Margins collapsing out of sections** can make the live page thousands of px taller than no-JS while each mode alone is "height stable" — use `display: flow-root` on sections and compare the JS and no-JS heights.

## A room of several objects, time-of-day light (from the agency desk test)
- **Several objects in one room** (a desk with four devices): place captions per beat — a top band for wide shots, a side column for push-ins — and solve each camera pose from the device's screen normal, size and the FOV so its screen fills the frame; add a camera stop between devices so moves don't skim other objects.
- **Time-of-day as the spine:** key the sun direction, sky/wall colours and a shadow-only window shape (mullions as holes) through states (morning → noon → golden hour → dusk → night); it changes every frame and is a cheap, strong product-film light.
- **Screens on phones:** turn a landscape tablet to portrait; a monitor's texture text needs ~150px+ to read at 375 (the ~70px rule is for phones filling the frame).
- **Static fallback captions** travelling over busy renders need a solid panel, not a scrim.
- **A portfolio of six inside a pinned film:** pinned rows (~170vh each) with fades; unpinned 100vh rows let captions scroll across the objects. Expect a long page — keep each row moving.
- **The last chapter** needs a final drift stop, or frames freeze before the footer.
- Skipping 3D in reduced motion: return from a function; a top-level `throw` in a module counts as a console error.

## Liquid chrome and raymarching (from the agency liquid test)
- **Morphing into crisp shapes:** metaballs turn blocks and cards into blobs — a raymarched signed-distance scene in a ShaderMaterial keeps shapes crisp while the morphs stay liquid; a procedural studio environment avoids an HDR file.
- **Compile time on Windows (ANGLE/D3D11):** constant-bound loops and several inlined calls to the distance function made the first compile take ~90 s. Use uniform-bounded loops, one call site (fold normal and AO taps into the march loop), and `renderer.compileAsync` so the stills show meanwhile.
- **GL starts seconds after load:** early frames run in still mode, so bake stills that match the live poses exactly.
- **Flat chrome faces read as paint** — add a subtle normal wave or graded environment cards.
- **How literal each form must be:** check every service shape at thumbnail size on the sheet; a screen stack, a route and a search bar each needed several redesigns before they read.
- **Sample chips projected onto moving objects** need their own fade curve and phone size.
- A sticky still inside a block shorter than 100vh with `margin-bottom: -100vh` pins for the whole block — unpin short project stills.

## Particle forms (from the agency particles test)
- **Forms that read:** draw each form procedurally on a full-viewport 2D canvas, sample it weighted by alpha in pixel order (so forms flow coherently), store the targets in data textures and morph in the vertex shader. ~260k points on desktop, ~100k on phones. Fills must be a darker tint of the chapter colour, not low-alpha white — with 100k+ points a faint white fill turns solid and swallows white glyphs.
- **Between forms, a swarm, not noise:** each particle leaves on its own delay and is pulled to a lead point travelling on an arc, weighted by sin(πt); shrink the flock radius and x-stretch on phones or it reads as a flat band.
- **Resolving to a crisp image:** the crisp plane must include the frame chrome (browser bar), or the bar stays noisy next to a sharp screenshot.
- **Final hold:** end the last hold at the page's scroll end so the drift keeps changing, and include scroll position in the render-on-demand key, or caption fades stall.
- Rich chapter colours (never a black void) make particle pages read premium.

## One-actor pages: transitions, framing, dimming (from the agency keycaps test)
- **Transition frames with only the actor** (the key row, the cube, the drop) count as empty frames: keep each chapter's scene up for ~70% of its span, bring the caption in as the actor starts moving, and keep it until the next move starts.
- **Aspect-aware poses:** compute each pose to fit a content box to a fraction of the viewport from the FOV and aspect, plus a view offset — fewer hand-tuned wide/tall keyframes.
- **Dimming textured neighbours:** material colours are linear — `setRGB(0.1)` shows as ~35% grey; use `pow(g, 2.2)` to really darken screens behind captions. A wall of project screens needs a focus/dim system.
- **Static fallback as a grid:** for long runways, fixed-vh sections laid out as still → caption row → still (not sticky) give the same height as the GL layout by construction; re-centre stills baked from off-centre poses.
- A sticky contact form taller than the screen gets cut — let it flow (on phones always).

## Captions over a fixed canvas, carousels, machines, glass, landscapes (from the agency round 7)
- **Flights are short, holds are long.** On a fixed-canvas page make each flight ~⅓ of a screen at the end of its section and hold (with a slow drift) for the rest; hand captions over mid-flight — the leaving caption stays until the flight is half done, the next comes straight after. Letting sticky captions release naturally over a full screen always leaves caption-less frames. Counter-translate captions by the section's overflow and crossfade them, so text never slides across the object; same-side captions fade in sequence, not together.
- **Transition frames with only the actor** (lift-off, a wheel mid-turn, a marble rolling, scatter between two assembled pictures) are empty frames: keep the previous caption pinned until the next arrives, and put the transition just before the next section's top.
- **Carousels / screen rings for the portfolio:** hold each screen square-on for ~75% of its slice and turn in ~25% (eased); screen brightness follows the camera angle so the outgoing screen dims as the incoming one lights (never two dark screens in view); captions crossfade in a tiny window at the exact midpoint of the turn and only ever sit over their own project's image. Keep the screen on the side opposite its caption and ease that offset with the turn (a midpoint flip reads as "pushed hard left"). Camera inside a ring on phones: widen the FOV instead of pulling back (pull-back pushes through the far side and shows screen backs). Leave the ring through a gap between screens.
- **Exit moves:** turn to face the destination first (~40% of the move), then walk straight at it; the destination's caption arrives as the turn starts. Make a door read as a door (frame, open leaves, light beyond, a sign).
- **Build-up objects are never blank:** a browser assembling from bricks starts with its bar, nav, one hero block and a wireframe of every slot; inflatables start inflating before their caption and are full ~10% into the chapter; every object is as thick as its siblings (a route as a fat glossy tube, not a string).
- **Anamorphic "one angle aligns the picture" concepts** only work when the aligned picture is on screen: hold it for 75–80% of each span; scatter only in the short hand-over.
- **Long multi-station machines (marble runs, benches):** lay stations along one axis, away from the chapter cameras, and check every chapter camera's frustum against the other modules before building details. A close-up that fills the frame reads as a blur — keep objects readable as objects.
- **Chapter floods from a moving actor:** drive the header background (and dark/light header text) from the flood's current colour at the header, not from the chapter index.
- **Glass on light backgrounds:** clear glass on pale pastel reads as matte plastic or resin — put a coloured or projected backdrop behind it (an opaque projected spectrum behind a prism). Beams on bright walls: additive glow vanishes — use normal blending with a white core, and a round soft cone (a 4-sided projector frustum reads as a solid triangle). A spatially blended wall tint goes black past the last station — clamp x and extend floor/wall meshes far beyond the camera path.
- **Focus-rack project swaps** (lens in → blur → crisp): the blur happens only inside the short hand-over (13–20% of the beat) and the project's caption is already up while the lens is in.
- **Landscapes whose regions rise per chapter:** store each landmark's height (and slope for normals) per vertex and blend on the GPU with one strength uniform per landmark; patch the shadow depth material the same way and place objects with a CPU copy of the same height function. 3D labels need depth testing and a max screen size, and must stay clear of the hero text; keep contact/closing cameras outside the terrain.
- **Phones:** frosted caption panels cover ~45% of the screen — keep the subject in the top 40% with its own tall pose; start fading captions that scroll over the object at ~45% of the viewport height.
- **Static fallback runways:** only frames with a caption are sticky (a captionless sticky still = dead scroll); a sticky still with `margin-bottom:-100vh` collapses with a negative margin on the next sibling — offset with `position:relative; top` instead.

## Bloom, fixed captions, machines, neon, underwater (from the agency round 8: synthwave, deep sea, robot, hologram, bricks, exploded device, arcade)
- **Bloom turns one NaN pixel into huge black rectangles** (ANGLE/D3D, HalfFloat targets). Clamp every `pow()` base (`max(x, 0.)`, and |n·v| ≤ 1 in fresnel), and add a clamp pass `min(max(c, 0.), 12.)` right after the RenderPass. Don't use `isnan()` guards (ANGLE warning X3577 counts as a console error in walk), and don't trust `readRenderTargetPixels` on HalfFloat targets (may read zeros). Debug by hiding objects one at a time with `preserveDrawingBuffer`.
- **Bloom and content:** sRGB-white screenshots and canvas-text planes bloom to pure white — keep them below the threshold (scale screenshot output ~0.86, threshold ~0.86–0.9) and paint text glow inside the canvas texture. A small accent (the green full stop) vanishes inside its word's bloom — make it a solid, un-bloomed block. A scan-line band on flat horizontal meshes lights the whole surface — damp it by `1 − |normal.y|`.
- **Fixed captions driven by the 3D clock** (opacity from the same timeline as the camera) give cleaner hand-overs than sticky captions on a fixed canvas: keep each at full opacity through its hold, swap in a short window (fades touching or overlapping — a gap gives caption-less frames, especially on phones), give them `visibility:hidden` at 0 and `:focus-within` visibility, and let the contact form flow on phones (explicit exception). If you do use sticky captions, don't centre them with `translateY(-50%)` — they unstick half a caption early; set `top` from the measured height.
- **Camera flights:** Catmull-Rom over timed keys overshoots where a slow hold meets a fast flight — clamp tangents to the chord; add mid-flight keys through open space so flights don't skim structures; a short "hop" (rise and pull back mid-flight) keeps both builds in view between spaced stations; clamp camera height after a tall-screen pull-back (a low camera goes underground); alternating left/right subjects put the leaving caption where the next subject arrives — fade it earlier.
- **Machines and robot arms:** drive a kinematic chain with analytic IK plus waypoints (joint vs linear moves, wrist unwrap with a direction bias) — hand-keyed joint angles are unusable; keep the tool and the part it holds in frame (the action is at the gripper); a writing robot stands in front of the board with its base on the unwritten side; swap a presented display's texture while its face is turned away. Shadows from a front key vanish behind objects — key back-left-top relative to the camera, fill below ~0.55.
- **Exploded views:** explode along one axis (reads at 1440 and on a tall phone); callout labels in a screen-space column (unproject at a fixed NDC x), de-overlapped by projected y, elbow at label height; drop everything below the module in focus out of frame while it plays.
- **Toy plastic:** neutral tone mapping plus strong hemisphere/environment washes saturated primaries to pastel — hemi ~0.5, env ~0.55, stronger key, no sheen. Builds arrive ~30% pre-built (never a loose pile alone). Change a studio sweep's colour by spreading a circle from the build during the camera hop, not by a backdrop crossfade.
- **Render-to-texture screens** (a CRT you push into): the target stays linear, tone map once in OutputPass, hide the cut from texture to direct render under a card — and an opaque full-screen card across several scroll steps needs something moving inside it (scaling title, loading bar) or it is dead scroll.
- **Underwater and sky:** dim a water-surface plane before its fog mix (after = a hard ceiling line); sea-to-sky horizons share one colour; tall kelp or tubes read as up-arrows (growth-chart risk).
- **Footer scene on a fixed canvas:** offset the camera view by `-footer.getBoundingClientRect().top` once the footer scene fills the screen so the object scrolls away with its scene and type never crosses it (skip when baking); a low camera (elevation ~5°) looking down the row fits between the footer heading and the wordmark.
- **Idle animation vs the walk:** a scene that flickers or drifts on its own needs a `?still` switch for honest dead-scroll walks.
- **Pixel/display fonts:** check the brand name first — some pixel faces make C read as O.

## Walk-through worlds, galleries, physics, macro machines, materials (from the agency round 9: museum, greenhouse, paper plane, turntable, press, stone garden, watch movement, unboxing, silk, cinema)
- **Camera rigs:** for worlds you walk through (doorways, aisles) use position + target keys on a chord-clamped Hermite with zero-velocity holds and a per-key FOV — orbit-parameter cameras swing wide and can't pass doors. Doorway flights need two pass keys: turn first, then the doorway, with its target blended toward the next hold's target. Size rooms from the fit distance (a clamped camera silently breaks the framing). Choose ±360° per azimuth key so flights take the short way round. Give every key a tall (phone) override by default; a wide screen square-on on a phone needs a wider FOV (~72° for 2.2:1), not a longer distance.
- **Which side the caption goes on:** in a lateral dolly the caption sits on the side the camera is leaving and the subject on the side it travels toward; in rows of framed works dim neighbours with picture lights that follow the current work, and space works so no neighbour's image sits under a caption. A vertical stack of stations (camera descends as you scroll) removes caption crossings entirely. In macro close-ups that fill the frame, choose each chapter's azimuth so the object's outside edge and backdrop fall on the caption side, and use frosted caption cards at ≥ 0.75 alpha (a scrim alone fails over bright metal or busy prints).
- **Hand-overs:** the object starts leaving before its caption fades; reveal the subject (cover flipped, silk lifted, sheet printed) before its caption reaches full strength, and don't raise the next object until the hand-over. Props removed mid-story (a lid) fly out of frame and return only for the footer. Scenery that sits in every sightline (a booth) appears only in its own chapter.
- **Line of sight:** check every hold camera against walls, rims, bridges and hinged parts (a platen, a case wall) that sit between it and the subject.
- **Footer scene:** keep the heading as a clock-driven fixed caption with `translateY(min(0, footer.top))`, or render the footer scene in a scissored second pass below the footer's top edge with a view offset of `−footerTop`; a full offset can leave frames of only the upper wall — ~0.5× parallax plus an earlier flight worked. A section timeline referenced to `scrollY + 0.5vh` only reaches u ≈ 0.69 in the last section — map footer beats inside that.
- **Physics driven by scroll:** simulate once at load in Web Workers (deterministic verlet with pins, long-range attachments, grid broadphase), record the frames and let scroll scrub them — reversible and render-on-demand; one worker per simulation (~3–5 s before GL starts, stills cover it). Cloth pressed over lettering doesn't read as a wordmark — keep a DOM wordmark.
- **Mechanisms:** meshing gears share one module per pair, tooth phases solved to interlock, directions alternate; a precision metaphor (watch) never implies timing or turnaround.
- **Morphs:** fold/unfold between shapes by interpolating hinge angles per cross-section (not vertex lerp) with one shared UV space and a texture crossfade; leaf → card morphs in the shader.
- **Materials and light:** physical lights (three r155+) need spot/point intensities ~10–20× lower than intuition in a dark room; with `scene.environment` and no material envMap, `envMapIntensity` is ignored — keep `scene.environmentIntensity` ~0.02–0.13 for lit landscapes; UI or print on lit/emissive surfaces washes to pastel under Neutral tone mapping — mix toward the card colour before `opaque_fragment` (or unlit faces ~0.9 grey with bloom threshold ~1.45); a colour-flooded room swallows an object of the same colour — darken the room to ~50% while it's presented; check foreground/background contrast per chapter colour (yellow ink on cream fails); white actors in front of white geometry vanish — design contrast into the set. Anisotropic vinyl/brushed discs: a tangent `anisotropyMap` on planar-UV CircleGeometry plus a roughness ring map. Polished floors: a Reflector under a semi-transparent concrete overlay. `IcosahedronGeometry` is non-indexed — delete normal/uv, `mergeVertices`, then compute normals. Dust in a projector beam with the camera inside it needs a clamped point size and a near-camera fade.
- **Procedural relief** (raked sand, engraving): per-pixel SDF plus contour grooves from primitives in a float DataTexture, analytic gradient from the argmin primitive only, grooves faded by `fwidth` (never inside branches); overlapping shapes need a plates-and-marks rule (plates clipped by the plates in front) or a union erases the stacking; deep grooves, dark engraved edges, background lines weaker than the service patterns, and a low sun raking across (not along) the grooves.
- **A DOM form on a moving 3D surface:** project the surface's corners every frame, set the fixed caption's rect from them, size the type in `cqi` with a px floor for the walk's h2 check.
- **Readable props:** pom-pom flowers read as fruit (use layered scalloped rosettes); procedural blob tree lines read as balloons; tall kelp or tubes read as up-arrows; soft-noise canvas mist sprites show rectangle edges (use fog). A metaphor that implies a service the client doesn't sell (a printing press → print work) gets a denial in the footer and a line in the report.
- **Didone display type:** hairlines vanish at display size — lower the optical size and set symbols (/ +) in the sans.

## Infrastructure, machines, landscapes and one-object stories (from the agency round 10 and the AI data-center tests)
- **Process chains without a product** (energy path, heat path, factory → site, land → campus): one scene laid out along one axis, each chapter a station; a travelling "front" value per stage (normalised along branches feeding a trunk); outside equipment sinks away before the next set rises; the same land or object stays in every chapter so each one visibly changes one subject.
- **Time of day as a continuous function of scroll** (sun elevation against a colour table) gives every chapter its own light and removes dead frames; night emissives ~1–2× with bloom ≤ 0.55 (ACES) — 3× washes the frame; unlit cables read as ditches (discard the unlit part so energy "appears").
- **Scale:** landscape-scale scenes in real units with a dynamic near plane (1.2 m outside, 0.2 m inside); a multi-scale zoom (hall → rack → chip) eases distance on a log scale, sets near/far and fog from the distance, and reassembles parts by camera distance (never inside a heatsink). In macro views of packed parts, lift all the neighbours, not only the hero part. Fog/lighting inside a building follows the camera position, not the chapter.
- **Cutaway dives** (through a roof, into a tank): lift the roof and make it semi-transparent; exit across the roof plane outside the footprint; don't look up at empty sky while climbing out. A volume behind glass: ray-march on the box's back faces (depth test off), stop rays at a depth pre-pass of the opaque objects, handle the cut-away analytically.
- **Staged construction:** near subjects first (the substation before distant towers) so chapters never open on empty land; builds and machines hold until the caption hand-over.
- **Long subjects** (pods, trucks, trains) next to a wide caption need a view offset of ~0.20–0.25 and a fit into the remaining ~55%; on phones change the angle (3/4 front/rear), don't only pull back. Frame half-height = max(fh, hw / (aspect · 2·min(sx, 1−sx))) with a per-key phone factor.
- **Camera rigs:** keys attached to a moving carrier (a cabin on a rim, a train) are functions of the carrier; keys in a vehicle frame vs a world frame are resolved to world at the current scroll; the vehicle has its own monotone timeline so stops are real; entering through a window needs real openings (enter from the side opposite the view); a "follow the object" camera blends its look-at toward the flying object and back; far-apart stations get a hard cut at the caption swap (flights between them are empty).
- **Line of sight:** keep a per-chapter clearance list — props (columns, crane booms, a booth, a PPC sign) leak into other chapters' views in an open world; hide objects around a landmark until their chapter; end light beams where they land.
- **Lights and materials:** volumetric beams = closest approach of the view ray to the axis plus a side term; a hot HDR sky swallows additive beams (scale the sky); physical point/spot lights need intensities ~10–20× below intuition; a coloured light closer than ~0.5 m to a pale sheet blows out under bloom; a structural ring near the camera blooms into a white band; pale lit bodies bloom into fog below a threshold of ~1.35; `vertexColors` on a shared material renders black on geometry without a colour attribute; give jewels their own strip-light envMap; BokehPass needs a circle-of-confusion patch for a macro look; with EffectComposer `toneMapped:false` does nothing (OutputPass tone-maps everything); opaque-canvas fog must equal the background's raw colour; white-on-white models need tinted massing and edge lines; merged-limb figures read as people, lathe-only figures as pawns.
- **Heat, energy and physics as colour** are implied readings: add a "colours are a drawing, not a reading" key and no temperatures; bubbles imply boiling (two-phase); flow direction, loop count and fans on "quiet" gear are implied facts.
- **Infrastructure implied facts** (list them): redundant fibre, backup generators, cooling type, lit at night = 24/7, PUE/tiers, GPUs per server and rack layout, reserved = dedicated hardware, branding on hardware = builds its own, renewable share, "clean" vs "carbon-neutral", co-located supply, grid/permit timelines; equipment metaphors (truck, crane, printing press, neon workshop, vending machine) imply services — deny in the footer and flag. Name checks include place names and facilities.
- **Commerce metaphors** (vending, shop, tickets, pier): no slots, card readers, currency, "buy" or implied opening hours.
- **Problem → fix pages:** each problem frame and each fix frame gets its own caption; problems come from the brief's own words, never numbers; screen-space colour floods from world-anchored pools (projected centre + FOV radius) also give the header ink; leaving objects exit vertically so they never cross the next caption.
- **Hero objects placed relative to the camera** (screen fraction + fit-to-bounds scale per frame) "pop out big" at every aspect. Wide display fonts: measure the JS-fitted wordmark per font and set it in CSS for no-JS. `background-clip:text` on a parent of per-letter transformed spans makes the wordmark invisible (walk passes) — put the gradient on each span.
- **Harness:** reuse an approved sibling's build/bake/caption/fallback harness; the timeline should read `scrollY + 0.5·innerHeight` by default; always log `gl true/false` before trusting a sheet (a name collision like a `key` light vs a `key()` helper silently falls back to stills); `setViewOffset` with positive y moves the scene up.
