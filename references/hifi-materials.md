# High-fidelity 3D: materials, light and water

Read this as well as `real-3d.md` when the brief asks for realistic 3D: "photoreal", "more texture", a product that has to look touchable, or a world (interior, landscape, underwater) that should look shot rather than modelled. It costs about twice a normal 3D page. The procedural model stays; what changes is maps, light and camera.

## When it is worth it, and the limit
- Worth it for hard-surface and fabric products (cameras, watches, furniture, tools, bags) and for worlds built from simple forms (rooms, water, terrain). Tested well on a camera, a lounge chair and an underwater park.
- The limit is the silhouette of organic products (shoes, bodies, animals, food). Materials can be excellent and the shape still reads slightly off, because a lofted procedural mesh is not a scan. Say so in the report and suggest a scanned or artist-made base mesh. A paid asset needs the owner's approval first.

## Maps baked in the page (no texture files)
- Bake tileable procedural maps on load into textures: a fullscreen ShaderMaterial into render targets (~50 ms) or a Web Worker from a blob URL (~1–2 s while the baked still shows). Use fixed seeds. Bake half-size maps on phones.
- One data pass first (height plus a few masks, half-float), then albedo (sRGB, mipmaps, maximum anisotropy), normal (four height taps or central differences, scaled by physical millimetres) and a packed map: R = AO from cavity, G = roughness from masks, B = metalness, A = a spare mask such as paint fill or height. Colour maps are sRGB; data maps are linear.
- Noise wraps on an integer lattice so maps tile. Grain direction comes from UVs: on swept parts u runs in metres along the sweep and v around it, snapped to whole tiles. On closed rings, duplicate the seam column so U runs 0..N whole tiles, or the tangent frame breaks at the seam.
- **Physical texture scale is the first check on any macro.** A bouclé tile of 15 cm reads as wool and 6 cm reads as sand; leather about 7.5 cm. Wrong scale ruins correct maps.
- Colourways: tint with `material.color` or a mask channel and keep one map set. Don't re-bake.

## Recipes per material
- **Brushed metal:** row noise, variation along the grain, scratches blurred along x; anisotropy ~0.9 with an anisotropyMap (0 inside engravings). Polished chamfers: drop roughness to ~0.05 in onBeforeCompile where the object-space normal is diagonal.
- **Turned dial tops:** concentric lines and an anisotropyMap that encodes the tangential direction per pixel, which gives the radial bow-tie highlight.
- **Knurling:** real geometry (52–64 flat-topped ridges with V valleys) plus polished lathe chamfer rings. Diamond knurl on a barrel: crossed V-groove normal map.
- **Bead-blast:** very fine dimples only, roughness 0.31 ± 0.04. Coarse noise reads as stucco.
- **Engraving:** draw the text on a 2D canvas, turn it into a mask, derive height, normal and roughness from it, and fill the paint in onBeforeCompile (metal to dielectric). Decide the text orientation in world space before drawing, because planar caps mirror it.
- **Leather:** two Voronoi layers with domain warp; pebble dome `h = 1 − f1/((f1+f2)/2)` to the power 0.42, plus fine grain and wrinkles; sheen ~0.55, warm. `f2 − f1` edges read as reptile. Stitches: instanced capsules tilted ~0.34 rad over a dark crease tube.
- **Wood:** irregular ring spacing driven by the across-grain coordinate (big along-grain warps look like a topographic map), pore dashes, ray flecks, fibre streaks, low ring contrast, clearcoat ~0.08.
- **Bouclé and pile fabric:** jittered wobbly loop rings in several layers, heathered, ~2 mm normal depth, sheen. For real pile use shell texturing (about 6 offset copies, each keeping only taller loops), alpha-to-coverage, faded at grazing angles and beyond ~0.8 m.
- **Knit:** wales × courses of V-legs from capsule segments, ply twist, row waviness, fuzz; sheen ~1 with an anisotropy map across the yarn; heather by a ply mask.
- **Suede and nubuck:** fibre clumps 0.3–0.6 mm and a nap-direction map; specular ~0.1, sheen ~1; patches brighten or darken with `dot(nap, view)`. That view-dependent nap is what stops it looking like satin plastic.
- **Foam and rubber:** micro-pores, roughness 0.7–0.92, a translucent look from wrap lighting plus a back-scatter lobe (not transmission); a back-lit shot sells it. Lugs: instanced bevelled geometry with a per-instance UV offset.
- **Plaster and stone:** overlapping elongated trowel strokes (~14 mm normal); limestone in running bond with arrises; travertine as warped strata.
- **Glass lens:** front element transmission 1, IOR ~1.62, attenuation, iridescent coating (IOR 1.38, 180–560 nm). Inner elements opaque dark coated glass, because transmission can't see other glass.
- **Retroreflective:** hex glass-bead normal plus an emissive lobe `pow(dot(L,V),24)` toward a virtual flash fixed in world space.

## Light and camera
- **Procedural PMREM studio:** a graded grey room, softboxes with radial-falloff canvas textures, gradient strips, bounce cards. A near-black room makes chrome black and bead-blast dead. Rotating `scene.environmentRotation` per beat sweeps the anisotropic streak and shifts coating colours; it is the biggest single control.
- Key: a spot light with penumbra ~0.9 pooling on the floor, a rim light, a contact shadow from a depth render seen from below and blurred twice.
- **Interiors:** solve the sun angle from window to subject so the beam lands on the subject. Use contact-hardening PCSS patched into three's shadow shader with a 4K map (use `textureLod` inside the PCSS loops on ANGLE), the sky as a rect-area light through the window, a box-room env map rebuilt as the light changes, and GTAO.
- Smooth lofts get a shadow terminator: fade self-shadow with N·L (patch `lights_fragment_begin`) and don't let the part receive shadows.
- Normals: ExtrudeGeometry and LatheGeometry need angle-threshold auto-smooth (~40°) to keep chamfers crisp.
- Tone mapping: AgX for studio products; Neutral for interiors (AgX made the room grey). 4× MSAA half-float target (2× on phones). Depth of field only on macro holds, focused on the near end. No bloom on products. Render on scroll change only.

## Water and underwater worlds
- **One analytic water-path function used everywhere:** water length from camera to fragment (minus air boxes for rooms and boats) plus air length gives per-channel absorption into one in-scatter colour, plus downwelling by fragment depth. Fog then equals the background by construction, the seabed seen through refraction turns turquoise for the right reason, and the half-above, half-below waterline frame just works.
- Extinction σ ≈ 0.2 / 0.05 / 0.04 per metre (R/G/B) and downwelling ≈ 0.085 / 0.03 / 0.02. Physical values give one cyan haze. The seabed seen from above needs a body tint on refraction (about ×0.6, 0.96, 0.92) or it looks milky.
- **Caustics:** multiply them into `reflectedLight.directDiffuse` after `lights_fragment_end`, so shadows mask them. Project along the refracted sun, offset the RGB taps slightly, and drive them by scroll and idle time.
- **The surface from below:** total internal reflection that fades with distance (no hard ceiling line); inside Snell's window, sample the same refraction target used above the water.
- God rays (additive camera-wrapped quads along the refracted sun, faded within ~1 m of the camera) and marine snow sell "underwater" more than textures do. Exclude both from air boxes.
- A camera exactly at the waterline: hide the surface for |y| < 0.04 and treat y ≥ 0 as air.
- Underwater, damp indirect specular, keep the PMREM ground dark, and use no clearcoat on submerged objects, or they glow.
- Carve terrain under interiors (observatories, tunnels) and run a clearance pass on every camera flight: railings, rims, rooms.
- Performance: refraction target always, planar reflection only above the water, both half resolution; DPR cap 1.25 on desktop and 1.5 on phones; idle at ~30 fps and stop when content covers the canvas or with `?still`.
- Clamp NaN before any bloom pass: one NaN pixel spreads into a black square.

## Review checklist for a hi-fi page
- On every macro frame: is the texture at physical scale, and does the highlight move between beats?
- Are the cheapest-looking parts (foliage, background animals, secondary objects) at the same level as the hero? One flat green ribbon or grey slab on a hi-fi page reads as unfinished.
- Is the subject large in frame? Small far-away silhouettes waste the materials.
