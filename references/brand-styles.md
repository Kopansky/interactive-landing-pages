# Brand style systems — measured starting points

15 brand-inspired landing pages were built and verified for one product, each against the brand's live site. This file holds what each one taught: tokens, rhythm, header, motion, and what makes the look recognisable. Use it to **start** a variant in a known family; still follow `brand-research.md` when the client names a brand and wants a close match (sites change).

Conventions:
- **Type** is the brand's *intent*. Every build was forced to one client font (a geometric sans), so sizes, weights, tracking and leading carry the look — not the typeface.
- Sizes are "1440 / 375". Many brands sit **below the craft floor** (hero ≥ 88px at 1440, section ≥ 56px). Default to the floor unless the client asks for brand accuracy; scale the whole ramp, not just the h1.
- Colours listed are the brand's own roles. In every build the brand's signature hue was **translated into the client's palette** (e.g. aubergine → client navy, bright green → client accent); neutral systems stayed neutral.
- `e:` = the easing measured on the brand's site.

## Index

| Brand | Family | One-line signature | Good for |
|---|---|---|---|
| Notion | SaaS-light | Warm greys, pastel tiles, rotating word pill in the headline | calm productivity, SMB tools |
| Slack | SaaS-light / playful | One strong colour in big blocks, dark bands joined by curved arcs | team / comms products |
| Stripe | SaaS-light | Skewed 12° mesh gradient hero, column guide lines, layered blue-grey shadows | fintech, dev platforms |
| Linear | SaaS-dark | Near-black, text gradient headings, blur-in lines, pointer-lit cards | dev tools, premium B2B |
| Apple | editorial / product | Huge centred type, 28px tiles, frosted sticky local nav, pinned story | hardware-like hero product |
| Firecrawl | SaaS-light (technical) | Hairline frame, crosshair marks, bracket labels, dot-matrix art | APIs, data, infra |
| Shopify | SaaS-light → dark | Transparent nav that turns black, dark rounded "chapters", marquees | commerce, big-audience SaaS |
| Wise | SaaS-light (bold) | Heavy tight display, forest + bright-lime pair, colour-swap pills | finance for consumers/SMB |
| Figma | drawn / playful | Light 400 headlines in two tones, flat geometric colour blocks, cursors | creative tools |
| Airbnb | photographic / consumer | Search-pill hero that collapses into the header, 32px tiles, ink #222 | marketplaces, consumer |
| Jeton | photographic / playful | One saturated field colour, full-bleed photo hero, bottom floating pill nav | fintech, lifestyle apps |
| Clay | playful / crafted | Oat neutrals, blueprint rails, fruit tints, clay 3D objects, sticky theme stack | data/GTM tools with personality |
| ElevenLabs | editorial-quiet | Eggshell + cream, one light weight, hairline page frame, matte orbs | AI/audio, premium minimal |
| ClickUp | SaaS-light | Grey-fading headings, 1px blueprint grid, one glowing dark panel, rainbow CTA ring | all-in-one work apps |
| Ctrl | playful | Viewport-scaled rem, 2px ink outlines, pastel cards, hide-on-scroll header | consumer apps, youthful brands |

---

## Notion
**Family:** SaaS-light (warm, friendly, restrained).
- **Type:** bold 700 sans, tight: h1 86 / 36 (clamp 40→86, 5.9vw), -0.04em, lh 1.06; h2 48 / 32, -0.03em, lh 1.1; lede 20, lh 1.45; eyebrow 16/600 in ink (not coloured).
- **Colour:** white canvas, ink #0B0B10-ish with warm body greys (#2f2e2b / #5f5c57); warm grey fills #f6f5f4 / #efeeec. **One** accent (blue family) for primary + a pale tint of it for secondary buttons. Pastel tile backgrounds (pink/sky/sun/mint/lilac/peach at ~95% lightness) and Notion's ink-on-pastel icon pairs (red #d44c47 on #fdebec, blue #337ea9 on #e7f3f8, yellow #b8841f on #fbf3db, green #448361 on #edf3ec, purple #9065b0 on #f4f0f7, orange #c9670c on #fbecdd).
- **Surfaces:** card radius 12, button radius 8 (40px tall, 16/500, background-only transitions). Hairlines rgba(0,0,0,.1). Product window: 1px line + soft deep shadow `0 24px 60px -30px`. Floating chips: white, 10px radius, small shadow.
- **Layout:** content 1120 + 32px gutters; nav row up to 1440. Section padding 112 / 72. Centred hero, left-aligned section heads (max 820).
- **Header:** sticky white, 64px; hairline `box-shadow: 0 1px 0` appears only once scrolled. Links = 6px-radius hover fills.
- **Motion:** e: `cubic-bezier(.16,1,.3,1)`; pill width `(.86,0,.07,1)`. Reveals: 14px rise, .7s, once. Signature: a **rotating word pill inside the h1** (word slides up/out, pill re-tints and resizes to the new word). A **sticky logo strip** rides the bottom of the first screen. Tabbed product panels with a 2px progress bar that auto-advances until touched.
- **Recognisable:** pastel bento cards (2-col, one wide); ink doodle illustration peeking behind the product window; hover = background fill, never lift.
- **Pitfalls:** don't reuse Notion's doodle characters or its exact pill phrases; pastel tiles at full saturation look childish — keep them ~95% light; keep one accent.

## Slack
**Family:** SaaS-light with playful blocks.
- **Type:** heavy 700 headlines, gentle tracking (-0.012em); h1 64 / 34 (4.45vw), lh 1.12; h2 50 / 32; body 18, lh 1.55; eyebrow 14/700 uppercase, +0.06em. Stats in a dark band 80px.
- **Colour:** white ↔ warm beige (#F4EDE4) alternation; one strong brand colour (aubergine/purple) used in **big blocks** (dark bands, product window frame); light accent (lilac) for highlights on dark; an amber companion for small shapes. Muted text #55545C.
- **Surfaces:** buttons 4px radius, 42/58px tall, 14–15px, 700, **uppercase +0.03em** (the Slack button). Cards 12–14px, layered navy-tinted shadows. Product shown in a window whose chrome is the brand colour. Photo tiles with an arch top (`999px 999px 18px 18px`).
- **Layout:** rail 1294 + 32. Sections 112 / 80. Feature rows: text + product on a coloured circle/shape, alternating sides, gap 72.
- **Header:** fixed; on scroll it **lifts off into a floating rounded bar** (inset 8/16px, radius 16, shadow, drops 6px). Link underline grows from 0 on hover.
- **Motion:** e: `(.165,.84,.44,1)`, reveals `(.16,1,.3,1)`, 18px, once — "Slack is calm". Signatures: **curved arcs** between a dark band and the page (`clip-path: ellipse(65% 200% at 50% -105%)` into the band, `at 50% 200%` out); a **sticky chapter pill** (TOC) under the nav; a **timed accordion carousel** (progress bar restarts per item). Big coloured circles and a rotated square behind the product.
- **Recognisable:** uppercase heavy buttons; big solid-colour shapes behind UI; dark band with bright stat numbers.
- **Pitfalls:** no hashtag logo, no four-colour pinwheel; don't fake a Slack-like channel list unless the client's product actually has channels.

## Stripe
**Family:** SaaS-light (precise, luxurious).
- **Type:** medium weight, not bold: h1 500, 57 / 38 (4vw), -0.03em, lh 1.08; h2 **400**, 40 / 28, -0.02em, with a second clause in muted colour; body 17–18, lh 1.6; eyebrow 16/600 in the accent.
- **Colour:** ink navy #0A2540, body slate #425466, mute #64748D, soft #F6F9FC, hairline #E3E8EE; dark block #0A2540 with mute #9DB4CC. One accent (Stripe blurple) for eyebrows, links and one button style.
- **Surfaces:** **pill buttons** 36px, 15/500, with an arrow that grows a stem on hover. Shadows are the signature — two-layer blue-grey: `0 13px 27px -5px rgba(50,50,93,.25), 0 8px 16px -8px rgba(0,0,0,.3)` (card) up to `0 50px 100px -20px …` (big). Menus 8px radius.
- **Layout:** content 1080 + 16. Sections 128. **Guides:** two solid rails + three dashed column lines (every 270px) run through every section; titled points get a 1px accent bar sitting exactly on a guide line. Hero copy max 620, left; product floats off the right edge.
- **Header:** not sticky (sits in the hero). Signature **morphing dropdown**: one card that resizes between menus, caret follows the trigger, content slides ±40px (`(.45,.05,.55,.95)` .25s). Phone menu = floating card with scrim blur.
- **Motion:** reveals `.8s` quart-out, 24px, opacity `(.33,1,.68,1)`. **Hero mesh:** soft blobs drifting on a tiny canvas (1/6 resolution, upscaled), in a band **skewed 12°** (`skewY(12deg)`, origin right-top); stops when off-screen or hidden. Floating chips bob ±5px over 7s. Count-ups on stats.
- **Recognisable:** the skewed gradient top; the column guides; soft stacked shadows on everything that floats.
- **Pitfalls:** gradient must keep the headline side pale for contrast; don't copy Stripe's gradient colours verbatim or its "Ready to get started?" close; the guides must be very faint (7–11% alpha).

## Linear
**Family:** SaaS-dark.
- **Type:** 500 weight, tight: h1 64 / 38 (4.45vw), -0.022em, lh 1.04; h2 48 / 30, lh 1.06; secondary clause in grey; lede 17–20, lh 1.45–1.6; small UI text 13–15. Headings use a **text gradient** (white settling into ~42% white along the line).
- **Colour:** bg #08090a, panels #0f1011 / #141516, surfaces #1c1c1f–#28282c; text #f7f8f8 / #d0d6e0 / #8a8f98 / #62666d; lines rgba(255,255,255,.08/.14). One cool accent, used sparingly (glows, active states).
- **Surfaces:** pill buttons 40px (light = #e5e5e6 on black text; dark = #1c1c1f + hairline). Cards radius 16, faint top-to-bottom white gradient, 1px line, inset top highlight. Product frame radius 14 with a 1px **lit top edge** gradient.
- **Layout:** max 1200 + 24, sections 128 / 88, sections separated by a 1px line. Section head = heading on start side, paragraph beside it (2-col grid, aligned to bottom). Numbered 3-column step rows with hairline dividers.
- **Header:** fixed 64px, `backdrop-filter: blur(20px)`, almost transparent; hairline + 72% bg once scrolled.
- **Motion:** e: `(.19,1,.22,1)` expo-out; `(.25,.46,.45,.94)` for UI. Signature **blur-in**: lines rise 20% from `blur(10px)` over 1.1s, staggered 110ms; sections `blur(6px)` + 18px. Hero product **stands up** as you scroll: `rotateX(9deg → 0)` + `scale(.955 → 1)` over the first 560px. **Pointer-lit cards**: a radial light follows the cursor on the border (mask-composite) and inside. Slow logo marquee (34s). "Held screen" pattern: sticky product on one side, steps with a left rule that lights as each hits the middle.
- **Recognisable:** near-black with grey-to-white text; light that follows you; things resolving out of blur.
- **Pitfalls:** pure #000 kills it — use #08090a with lifted panels; keep grey body ≥ 4.5:1 (#8a8f98 is the floor); no purple Linear gradient; blur-in must have a no-JS fallback (they auto-show after 2.5s).

## Apple
**Family:** editorial / product showcase (the model for "calm but huge").
- **Type:** 600, near-neutral tracking: hero 68 / 40, lh 1.06; section h2 **72** / 40, lh 1.0625; h3 48 / 32; eyebrow 21/600; lede 21/500 grey, lh 1.38; body 17, lh 1.47. Gradient text on one key phrase.
- **Colour:** ink #1D1D1F, greys #6E6E73 / #86868B, bands #F5F5F7, lines #D2D2D7; dark sections pure #000 with #F5F5F7 text and #A1A1A6 lede. One accent (link blue), nothing else.
- **Surfaces:** **28px tiles** (white on grey bands or grey on white), padding 40. Buttons 980px pills, 17/400, 12×22 padding. Almost no shadows; depth comes from product renders.
- **Layout:** 1024 text width, 1260 wide; gutter 22 / 16. Sections 128 / 104 / 80. Everything centred; heads max 860, margin-bottom 72.
- **Header:** two bars — **global nav 44px** (12px links, frosted `saturate(1.8) blur(20px)`) scrolls away; **local nav 52px sticky, frosted**, with a title at start, small links, one small pill CTA; turns dark over dark sections.
- **Motion:** nav colour `(.28,.11,.32,1)`; reveal = headline slide 10–14px + fade on easeOutQuad `(.25,.46,.45,.94)` .7s — and it **reverses when you scroll back up**. Hero product (device render) scales `.9 → 1` and rises 24px as the stage reaches mid-screen. Signature **pinned story**: tall runway (~520vh), sticky stage, scroll picks the beat; beat text swaps with ±28px, a device screen changes per beat, progress bars fill per beat. Snapping horizontal gallery with timed dots that stops when the user takes over.
- **Recognisable:** enormous confident type with lots of air; grey bands with rounded tiles; one product object doing all the drama.
- **Pitfalls:** device frames must not be real Apple hardware renders/trademarks — draw generic devices; the pin needs a stacked fallback (no JS / reduced motion); 520vh is the max — size runways from beats.

## Firecrawl
**Family:** SaaS-light, technical / engineering.
- **Type:** 500, -0.012em: h1 60/66 → 34/40; h2 52/56 → 30/36; lede 17/27; cell titles 18/26; bracket labels 12/16, 500, +0.04em, tabular numbers.
- **Colour:** off-white field #F9F9F9, surfaces #FFF, ink #17171C, muted #63636B / faint #8C8C94, lines #E8E8EA / #F0F0F1, alpha inks (4/6/8/12%). **One vivid accent** (Firecrawl orange) carries every action; one dark band (#0B0B10) for the closing.
- **Surfaces:** buttons 36px, radius 10, accent with an **inner bottom shadow** (`inset 0 -6px 12px`) + tiny drop shadows. Input card radius 20 with a 10px ring in the page colour (`0 0 0 10px var(--bg)`) so it sits "cut into" the page. Big soft multi-layer card shadow at 2–3% alpha.
- **Layout:** a **hairline frame** 1112px wide with a second outer frame 100px further out; every band draws a line across the full page and marks where it crosses the frame with **+ crosshairs**; concave corner ticks on boxes. Content lives in **cells** (2- or 3-col grids divided by 1px lines, padding 44/48). Gutter labels in the outer margin at ≥1360px.
- **Header:** sticky, same colour as the page, 68px, sits inside the frame lines; bottom hairline. Accent announcement bar above it.
- **Motion:** e: `(.2,.7,.2,1)`. Entrances: 10px rise out of `blur(4px)`, .6s (Framer default). Signatures: hero **cell field** (canvas squares that light and settle); **dot-matrix / ASCII art** (shapes drawn to an offscreen mask, sampled into glyph ramps ` .:-=+*#%@`, with an accent reading sweep); segmented control with a sliding white pill; a placeholder that types its own examples; latency-style tables.
- **Recognisable:** crosshairs + hairline frame; bracket labels `[ 01 / 05 ]`; monochrome ASCII art with one hot colour.
- **Pitfalls:** the frame must disappear cleanly <1360 / <1144 (overflow!); ASCII art must stay decorative (aria-hidden) and paused off-screen; don't use Firecrawl's flame mark or orange unless it is the client's hue.

## Shopify
**Family:** SaaS-light hero → dark chapters.
- **Type:** 500, -0.022em: h1 78 / 38 (5.3vw), lh 1.05; h2 64 / 34, XL h2 84; h3 22; lede 17–20, lh 1.55. Highlighter marks (`linear-gradient` band behind words).
- **Colour:** white + a pale tinted hero wash (radial blobs + vertical fade to white); **black** #000-ish for nav and marquee; deep near-black-green "night" for dark chapters; one bright accent on dark. Muted #4E4E5A.
- **Surfaces:** **pills 56px**, 2px border, 18/600; colour changes in 150ms on `(.4,0,.2,1)`. Cards 12, plans 24, **chapters 48px top radius** (28 on phone) that overlap the previous section by their radius. Product sits in a tinted rounded frame with padding.
- **Layout:** max 1260, gutter clamp(24, 6.25vw, 90). Sections clamp(72, 9vw, 128). Head = 2-col (h2 left, lede right, bottom-aligned).
- **Header:** sticky 72px, **transparent over the hero, turns solid black** (text white, CTA inverts) once stuck. Full-screen black phone sheet with 32px links.
- **Motion:** e: easeOutCubic `(.215,.61,.355,1)`. Reveals 24px .7s. Signatures: **marquee strip** on black (46s); **app wall** — 2–3 rows sliding forever in opposite directions (64/72/80s) with edge masks and a pause button; **odometer** digits rolling into place (1.6s); words sliding up from a clipped line; product frames **grow `.9 → 1`** as they scroll in.
- **Recognisable:** black nav bar on scroll; dark rounded chapter overlapping the light page; infinite rows of tiles.
- **Pitfalls:** every marquee needs a pause control and a reduced-motion static layout; don't show a wall of real third-party app logos you don't have rights/facts for.

## Wise
**Family:** SaaS-light, bold (consumer finance).
- **Type:** **700, very tight**: display 84 / 44 (5.6vw), lh 0.98, -0.04em; d2 76, d3 48 (-0.03em); h3 26; lede 18–21. Non-Latin scripts get leading ~1.
- **Colour:** a dark "forest" (#163300) + **bright lime** (#9FE870) pair; pastel #E2F6D5; neutral ≈ forest at 7% on white. Hero and "safe" band are full-bleed dark with the bright colour on headlines; closing is a full-bleed **bright** band.
- **Surfaces:** radii **grow with the viewport**: 10–12 / 16–20 / 24–30 / 32–40 / 48–60 (clamp). Pill buttons min 48/56, 16–18/600, **colour-swap only** on hover (150ms `(.42,0,.58,1)`), inverted on press. Sections on "paper" = inset rounded panels (margin 8–24px) in neutral or mint.
- **Layout:** max 1312, gutter clamp(16, 4vw, 56). Sections clamp(76, 9vw, 136). Hero = 2-col: headline left (1.22fr), an **interactive calculator card** right (.78fr).
- **Header:** sticky white 76px, hairline on scroll; 32px bold phone sheet.
- **Motion:** e: `(.6,.2,.1,1)` (Wise's most used). Reveal = move-up 36px (.7s/.9s), staggered through siblings. Hero product stage straddles the dark/white edge and grows `.94 → 1`; 3D objects/photos drift with scroll parallax and slight rotation. Calculator fills a vertical rail step by step.
- **Recognisable:** giant heavy tight headlines in bright-on-dark; a calculator in the hero; rounded paper panels.
- **Pitfalls:** lime-on-white fails contrast — bright colour only on dark or as fills; never show fees/rates/numbers the client hasn't confirmed; the calculator must use the brief's real logic.

## Figma
**Family:** drawn / playful (design-tool vibe, but restrained).
- **Type:** **light 400**, two-tone: hero 58 / 36, -0.025em, lh 1.08, second line grey (60% ink); "intro" statements 36 / 26, -0.018em; closing h2 72, -0.035em; lead 20 grey. Screens section uses **big text tabs** (24px, grey → ink).
- **Colour:** white, ink, grey = ink at 60/72%. Flat companion blocks: **lime #D6F36B, lilac #CDBDFF, coral #FF8A6B** (+ pale versions), selection blue #0D99FF. Diamond-bullet eyebrows.
- **Surfaces:** black rectangle buttons, radius 8, 48px, 17/500 (`.18s` ease-out, press .98). Flat colour canvases with a dot grid (22px). Cards 10px with thin borders. **Selection frame** (1.5px blue + square handles + a dimension label).
- **Layout:** max 1440 + 40; sections **160 / 88** (very airy). Hero 1.62fr text / 1fr **4×3 grid of flat geometric colour tiles**.
- **Header:** fixed white 72px with a bottom line.
- **Motion:** e: `(.2,.7,.2,1)`, `(.65,0,.35,1)`, nav `(.8,0,.2,1)`. "Text stays still, media arrives" (24px). Signatures: **colour tiles re-cut one at a time** (a shape scales out rotating 90°, a new one in; sometimes just a quarter turn); **multiplayer cursors** with name tags gliding (1.1s) to elements and selection boxes resizing onto them.
- **Recognisable:** light big type in two tones; flat Bauhaus shapes; cursors and selection handles.
- **Pitfalls:** clients hear "looks like a design tool / editor canvas" — use cursors and handles for one moment, not everywhere; don't use Figma's five-dot logo colours as a set.

## Airbnb
**Family:** consumer / photographic-friendly.
- **Type:** **700, tight**: h1 64 / 38, -0.035em, lh 1.06; h2 56 / 34; FAQ h2 500 60; close 400 44; lead 20 grey. Second headline line in brand gradient text.
- **Colour:** ink **#222222**, greys #6A6A6A / #717171, lines #DDDDDD / #EBEBEB, band #F7F7F7. One brand gradient (Rausch pink-red → magenta, horizontal) for the primary button and small marks — darkened at the start for white-text AA.
- **Surfaces:** pill buttons 48, 16/500, **scale .96 on press** (.1s); primary gradient **lights up under the pointer** (radial gradient following `--mx/--my`). Big tiles **radius 32** on #F7F7F7; announcement card radius 24; floating chips 14 with `0 6px 20px rgba(0,0,0,.2)`. Round 32px arrow buttons for carousels.
- **Layout:** max 1280 + 80 (40 at ≤1180). Sections 112. Centred hero; listing-style horizontal rows with round arrows; category tabs with icons and a 2px underline.
- **Header:** sticky 80px, `rgba(255,255,255,.85)` + blur 25px; 3-col grid (logo · tabs · actions). **Search collapse:** once the hero's big search pill leaves the screen, the centre tabs fade/shrink out and a **compact pill** springs in (`(.1,.9,.2,1)`); clicking it scrolls back and focuses the field. Phone: **bottom action bar** pinned under the thumb.
- **Motion:** e: `(.2,0,0,1)`. Gentle one-shot reveals, 16px .6s, 70ms stagger; floating chips pop in after the hero.
- **Recognisable:** the big rounded search pill as hero CTA; the collapse into a mini pill; warm #222 ink and soft big tiles.
- **Pitfalls:** don't draw the Bélo mark or reuse Rausch; photos of places/people must be clearly illustrative (see Photographic); the bottom bar must never cover forms.

## Jeton
**Family:** photographic / playful (one-colour brand world).
- **Type:** 500, almost no tracking (-0.005 to -0.01em), huge fluid scale: t1 132 (8.4vw), t2 96, t3 70, t4 56, t5 42; hero = small lead line 34 + big line 96 → 46; lh .98–1.02.
- **Colour:** **one saturated field colour** (Jeton orange) for whole sections, white type on it (≥ 4.5:1); dark brownish ink; pale tint for cards; white paper sections between. Alternating two shades of the field for stacked views.
- **Surfaces:** buttons radius 12, 48px; cards 20; outlined pill tags (`inset 0 0 0 1px currentColor`) above headings. Photos with 6px radius or none.
- **Layout:** fluid grid margin clamp(16, 3.55vw, 52), gap clamp(12, 1.6vw, 24). Hero = full-viewport photo, copy bottom-aligned in 2 columns. Chapters are 100vh.
- **Header:** top bar **scrolls away**; navigation is a **floating pill fixed bottom-centre** (drawer grows up out of it with a thumbnail per link; phone opens a full-colour sheet via `clip-path`). Pill slides up after load.
- **Motion:** e: easeOutCubic `(.215,.61,.355,1)`, drawers quint `(.23,1,.32,1)`. Signatures: **button label rolls letter by letter** (each char out up, a twin in from below, rotated 20°, 7ms stagger); hero photo sinks at **0.225×** scroll while the next chapter slides over; product window rises **tilted −3.2° → 0**; pinned problem where a huge headline shrinks while cards gather; **stacking sticky lines** (each line a 100vh sticky box pulled up −80vh, nudged by index — the list builds itself); closing **opens from an inset rounded card to full screen** (`clip-path: inset(40px round 28px) → 0`); giant wordmark footer.
- **Recognisable:** one colour everywhere; bottom pill nav; photo hero with a colour gradient rising from the bottom.
- **Pitfalls:** field colour must pass contrast with white (darken it); the bottom pill must hide over forms and while pinned; photos of people/cards = illustrative labels.

## Clay
**Family:** playful / crafted (tactile, warm).
- **Type:** 500, tight: h1 78 / 40 (5.3vw), -0.035em, lh 1.02; h2 52 / 32, -0.032em; h3 24; lede 17–19 body #45454F; eyebrow 12.5/600 +0.08em. Word-split headline reveal.
- **Colour:** **oat neutrals** #FEFDFB / #F4F3F0 / #E4E1DB / #7B7974 (page is oat, not white); **fruit tints** lime #EEF673, pink #F8B9E3, sky #AAEAFC, lilac #C8BBFB, lemon #FAE188 — each paired with a near-black ink of its hue for text on it; thin blueprint lines in a dark hue at 16–28%.
- **Surfaces:** soft black rectangle buttons (radius 8) with an **arrow that swaps** on hover; inputs radius 12; product plate radius 22 with a 40px grid + **grain** (SVG noise, multiply) and a drafting frame 14px outside it; theme cards radius **40**. Clay-like 3D objects with big soft drop shadows.
- **Layout:** wrap 1296 + 24; sections clamp(64, 8vw, 112), each with a top rule; **fixed blueprint rails** down both content edges with + marks where rules cross.
- **Header:** sticky oat at 92% + blur, 1px oat line; soft shadow once scrolled. Black announcement bar above.
- **Motion:** Clay's own curve **`cubic-bezier(.625,.05,0,1)`** on everything. Reveals 24px .8–.9s; words rise from a clip (135%). Signatures: **clay objects** floating (7s, ±3° rotate) with slight scroll parallax; a **prompt field that types its own examples** until touched; **sticky theme stack** — tinted panels stick under the nav and the next slides over; underline that slides in from the start and leaves from the end.
- **Recognisable:** oat + fruit tints + blueprint lines; tactile objects; grain.
- **Pitfalls:** 3D objects are the look — they need real renders or generated assets, not CSS blobs; grain on text areas hurts legibility; keep the fruit tints as backgrounds, ink-of-hue as text.

## ElevenLabs
**Family:** editorial-quiet (premium minimal).
- **Type:** **one light weight (400)** for all headings: h1 50 / 36, -0.02em, lh 1.12 (second line muted); h2 38 / 29; h3 24; lede **16**, lh 1.55, max 440. Small, confident, lots of air — scale up to the craft floor for most clients.
- **Colour:** eggshell #FDFCFC page, **cream #F5F3F1 stages** (+ #EBE8E4 pressed), ink, warm greys #6B665F / #8C877F, hairline #E8E5E1. Colour lives **only inside orbs**, one photo, and a few coloured message lines.
- **Surfaces:** black pills 40/48; **white pills floating on a hairline shadow** (`0 0 1px rgba(0,0,0,.4), 0 1px 1px …, 0 2px 4px …`); cream demo stage radius 24 with noise; chips 28px.
- **Layout:** **page frame** — two fixed vertical hairlines 1144px apart; sections 112 with a top hairline and a small + tick where each seam crosses a rail. Section head = split grid (heading / lede bottom-aligned).
- **Header:** top nav scrolls away with the hero; a **white bar slides down** once the hero input leaves the screen.
- **Motion:** std `(.4,0,.2,1)`, tabs `(.31,.325,0,.92)`. **No section reveals** — "the page is simply there"; the motion budget goes to: **matte orbs** (layered radial + conic gradients, blur, grain, slow 18–26s spin), a **try-it stage** with a sliding white tab, a **coverflow** of orbs (centre 256, then 202/145/109), floating message bubbles.
- **Recognisable:** eggshell + cream, light headings, hairline frame, grainy orbs.
- **Pitfalls:** orbs must read matte and blurred, not glass marbles; with so little motion the page needs one real interactive demo or it feels empty; muted greys on cream need AA checks.

## ClickUp
**Family:** SaaS-light (dense product marketing).
- **Type:** **700, tight** -0.035em: h1 68 / 38 (5.1vw), lh 1.04, second line grey; h2 50 / 30 with a **gradient that fades to grey at the end of the line** (`linear-gradient(263deg, ink 42%, #8E8E96 112%)` as text fill); sub 18 grey; labels 13/500 +0.06em with a small square bullet.
- **Colour:** white, ink #16161C, greys #62626C / #72727B, lines #E8E8EB / #F0F0F2, soft #F7F7F8. Selected-state accent (ClickUp blue) for toggles; a **rainbow conic ring** reserved for the main CTA; one near-black panel (#050709) with a glow.
- **Surfaces:** buttons radius 8 (small, 14/600) and 14 (large, 17/600). Input radius 16. Dark panel radius 32, inset 16px from the edges, top radial glow + 64px grid masked to the top. Mega-menu radius 16.
- **Layout:** wrap 1200 + 24; sections 128 / 96. **1px blueprint** — hero frame, logo strip and feature fields are boxed by page-width lines and side rails. Feature "field" = 10-col tile grid with 1px gaps and white edge fades.
- **Header:** sticky 60px, white 90% + blur 6px; grey announcement bar above; mega menu (1fr / 2fr).
- **Motion:** e: `(.16,1,.3,1)`. Reveals 16px .7s. Signatures: **rainbow ring** spinning around the CTA (`@property --ang` conic, 3s) on hover; **hero toggles** — a picker column of checkable features next to one product window that changes as items are ticked (tick pops, "now" row highlighted, pulsing next action); a **wandering focus** that hops between feature tiles every 1.7s; glowing orb in the dark panel.
- **Recognisable:** grey-fading headlines; boxed blueprint layout; the rainbow ring.
- **Pitfalls:** rainbow belongs to one element only; dense tile fields need the edge fades or they look like a spreadsheet; don't list features the client doesn't have to fill the grid.

## Ctrl
**Family:** playful (bold outlines, youthful).
- **Type:** everything in **viewport-scaled rem** (`html{font-size: clamp(8.4px, .694vw, 12px)}` → 1rem = 10px at 1440; `min(2.667vw, 11px)` on phones). Hero **106 / 54**, 500, -0.025em, lh .98; huge 110 (400); big 64 (400); mid 40; card 30; sub 22 grey. A small lead line above the big hero line; a sticker/icon inline in the headline.
- **Colour:** pale grey page #F9FAF9, greys #ECEFEC / #D1D6D2 / #BBBFBB, body #4F524F; **pastels** sky #A9CCF7, pink #FFCADC, lemon #FBE74E, mint #C6F1D9 as full card fills; red dot accents.
- **Surfaces:** **2–3px ink outlines** (`box-shadow: 0 0 0 2px ink`) on pills, inputs, frames, icons. Pills 56px, radius 60; hover = colour **wipes up** from the bottom and the label jumps out and back in. Colour cards radius 40, min-height 560, lift −40px on hover. Product frame radius 24 with a 3px outline.
- **Layout:** max 1400 + 40 (16 phone); sections 160 / 90. "Surtitle with dot" eyebrow offset 18% from the start edge.
- **Header:** fixed, floating items (logo pill, centred grey nav pill with a **sliding blob** under the hovered link, grey action pills); **hides on scroll-down, returns on scroll-up**; logo gains an outline once floating. Floating CTA pill bottom-centre whose label expands on hover.
- **Motion:** quart-out `(.165,.84,.44,1)`, opacity `(.455,.03,.515,.955)`, morph `(.77,0,.175,1)`, power3 `(.215,.61,.355,1)`, back `(.68,-.55,.265,1.55)`. Reveals: **big rise 14rem → 0, 1.2s**, opacity .7s. Hero **load choreography** (staggered to 1.4s, a word wipes in via clip-path, an icon flies in rotating); hero **scrubs out** (scale 1 → .88, fade) over .75 viewport; **stickers drop** wherever the cursor travels 100px; **wheel of questions** on an arc, draggable with snap; pinned phone stage; **sticky horizontal track**.
- **Recognisable:** thick ink outlines + pastels; hide-on-scroll floating header; very large everything.
- **Pitfalls:** 14rem reveals feel slow on long pages — use the short variant (6rem) below the fold; outlines + many pastels get noisy — one pastel per card; the cursor stickers need `pointer: fine` and a reduced-motion off switch.

---

## Families — what to start from

### SaaS-light (Notion, Stripe, Firecrawl, ClickUp, Shopify, Wise)
- **Tokens:** white or off-white (#F9F9F9–#FFF) canvas; ink #0B0B10–#17171C; 2 greys (≥ 4.5:1 for body); hairlines at 6–12% ink; **one** accent for actions; pastels only as tile fills.
- **Type:** 500–700, -0.02 to -0.04em, lh 1.02–1.1 for display; body 16–18, lh 1.5–1.6.
- **Shape:** buttons 8–10 (tool feel) or pills (friendly); cards 12–16; product in a window with a soft layered shadow.
- **Rhythm:** 1080–1312 content, sections 112–128 (72–88 phone), 2-col section heads.
- **Header:** sticky, white, hairline appears on scroll (or transparent → solid).
- **Motion:** expo-out `(.16,1,.3,1)`, 14–24px rise, .6–.8s, once. One signature: rotating word, skewed mesh, guides, marquee, tab carousel with progress.

### SaaS-dark (Linear; ClickUp's dark panel; Shopify's chapters)
- **Tokens:** #08090a page, panels 3–6% lighter, text #f7f8f8 / #d0d6e0 / #8a8f98; lines white at 8–14%; accent only as light (glow, lit edges, active state).
- **Type:** 500, lh 1.04–1.06; heading gradient white → grey.
- **Motion:** blur-in (6–10px), long expo-out (1–1.5s), pointer-following light, perspective "stand-up" of the hero product. Never pure black, never neon everywhere.

### Drawn / illustrated (Figma, Clay, isometric)
- **Tokens:** white or oat canvas; 3–5 flat companion hues + ink; outlines 1.5–3px or none (pick one).
- **Motion:** shapes that re-cut, drop, rise with a small overshoot; draw-on; one character or object system used large. Keep one drawing per section (for path/world spines: one continuous world, one focal action per screen) — clients call busy drawn pages "cluttered".

### Playful (Ctrl, Jeton, Slack's blocks)
- **Tokens:** one saturated field colour or 3–4 pastels; thick radii (24–40) and pills; big type (rem scaled to viewport).
- **Motion:** stronger easing (back, quart), letter/word rolls, floating bottom pill, hide-on-scroll header, stickers. Budget it: one playful mechanic per section.

### Editorial / serious (Apple, ElevenLabs — and law, medical, finance, psychology)
The look for regulated or high-trust clients: **rich but quiet**, never timid.
- **Type does the work:** hero 88–110px at 1440, sections 56–72, one weight family (600 like Apple, or 400 like ElevenLabs), lede 19–21 in a warm grey. Consider a second line in muted ink instead of colour.
- **Palette:** 1 ink, 2 warm greys, 1 paper tone (eggshell/cream/#F5F5F7), **one** deep accent (navy, bottle green, oxblood) used for links and a single band. No gradients on text, no pastel confetti.
- **Surfaces:** large radius tiles (24–28) or none at all; hairline frames and rules; almost no shadows.
- **Rhythm:** narrow measure (≤ 1024 text), sections 128–160, centred or strong asymmetric grid; generous empty space is the luxury signal.
- **Motion:** **one slow signature moment** (a pinned story with 3–5 beats, a slow portal, a document that opens) with 1s+ easing `(.28,.11,.32,1)`; everything else = 10–14px fade-rise that reverses on scroll-up, or no reveals at all.
- **Content rules:** no outcome promises, success rates or "best"; licence numbers and disclaimers are placeholders; no stock handshake/gavel/stethoscope photos.

### Photographic (Jeton, Airbnb, Wise's objects, Slack's arch tiles)
- **Crops:** `object-fit: cover` everywhere; set `object-position` **per breakpoint** to the focal point (face, product, hands) — a 16:9 hero crops to a 9:16 phone; define `--fx/--fy` per image and override in the phone media query. Test 1440, 1024, 375.
- **Text over photos:** never rely on the photo being dark. Use a gradient scrim from the text side (e.g. field colour 100% → 0% by 50% of the height), or place text on a solid band; measure contrast on the lightest pixel under the text, not the average.
- **Motion:** slow parallax (0.15–0.25× scroll), scale 1.1 → 1 on load (1.6s), clip-path openings (card → full screen). Pause and simplify under reduced motion.
- **Honesty:** generated or stock images are **illustrative** — label them ("illustrative image") near the image or in a caption line, never imply they are the client's premises, staff, customers or results. No fake testimonials attached to faces.
- **Performance:** preload only the hero image; `loading="lazy"` + explicit width/height (or aspect-ratio) on the rest; ≤ 250KB per full-bleed JPEG/WebP at 1600w.

---

## Isometric (drawn family, built on Figma-style tokens)

Three variants were built: **scenes per section** (a small iso world beside each section's text), **tower** (one sticky building, a floor per chapter, the camera climbs), **robot** (one character assembled from solids that powers on, rolls, points and waves across every scene). Tokens: white canvas, ink outlines on chips (1.5px), light 400 two-tone headlines at large size (intro clamp 40→82), black 10px buttons, flat pastel fields behind product shots.

Use `assets/isometric-engine.js (full guide: references/isometric.md)` (`ISO`):
- **Solids:** `ISO.box(x,y,z,w,d,h,colour)` and extruded profiles (`P.rect/rrect/circle/sector/arch/tomb/star/plus/bubble/shield/crescent`, `ext({pl, pr, o, e, c})`), domes and balls; flat decals on faces with `onX/onY/onZ/polyY/polyZ` (windows, screens, dots).
- **Colour:** each palette entry is a 3-tone ramp (top light / left mid / right dark) chosen relative to the viewer — `ISO.PAL` (`base, paper, road, mint, aqua, sea, navy, lime, lilac, coral, peach, sun, ink, grey, night`); replace the ramps with the client's hues; `mixPal` blends day → night.
- **Build-in:** `ISO.enter(solid, p, delay, 'rise'|'drop', len)` — rise grows from the ground with a slight overshoot (`backOut`), drop lowers with a hop. Drive `p` from scroll progress.
- **Render:** `ISO.render(scene, phi, S)` returns painter-sorted faces + projected label anchors; `ISO.svgInner(r)` gives SVG paths. Rotating `phi` turns a scene between two iso angles and it still reads flat. Pin HTML chips to `labels` anchors.
- **Rules:** write each scene as a pure function of its state (`p`, plus story values like time/turn/selection); **bake the final state into the HTML** at build time so no-JS and reduced-motion show the finished drawing; only repaint a floor/scene when its state changes; keep scenes small (tens of solids, not hundreds); chips `translate(-50%, -100%)` with a 12px stem; on phones put the scene above the text at `aspect-ratio` of the scene box.
- **Pitfalls:** clients read dense iso scenes as "cluttered" — one clear object per chapter; overlapping solids at the same depth need `key`/`layer` to sort; the tower's floors must stay within their own height band.

## Clinical / medical-device (data-sheet) family
For baby, health, care and safety products the client wants to look "medical", not friendly. White and cool greys, one restrained accent from the product; a precise sans (e.g. IBM Plex Sans Hebrew) plus a monospace for every technical label; squared controls (2–3px radius), no pills; a measuring grid, ruler strip and a drawing title block; orthographic views with centre and hidden lines, a cutting-plane mark and a real section; "DETAIL" frames; an exploded view on one axis with P-01… labels; material callouts (MAT-01…); a four-column data sheet (code · parameter · value · source). Cool even studio light with crisp rims. The document form carries the rigour — the copy stays sourced and descriptive (see the clinical-look rule in SKILL.md). Reference: the Bfree v2 bottle test.

## Editorial at scale (Swiss / International)
Editorial here means monumental art direction, NOT a narrow measure of small serif text (that "calm editorial" was ranked worst). A strict, visible 12-column grid (4 on phones) — draw it as a fixed overlay with `mix-blend-mode: difference` so it reads over light and dark sections; huge grotesk headlines (150–190px at 1440) and giant numerals (01–04, 100+) as the images; black, white and one signal colour used as fills (a green like #29D060 fails as text on white — put black text on it); asymmetric layouts that change every section. Motion comes from the grid: lines reflow and lock onto columns, strips rise and lock, rules draw in, numerals scroll at their own speed, images arrive sliced by column (keep one accessible `<img>` and swap to it once the slices lock), a section index ticks in the header. No print gimmicks (a "magazine issue" wrapper was rejected as unnecessary). Reference: the Click Digital Swiss test.

