# SaaS / product-UI pages — checklist and recipes

Distilled from 17 SaaS tests (10 fictional startups: feature flags, spend management, meeting notes, brand assets, delivery routes, support inbox, shift scheduling, feedback roadmap, e-signatures, web analytics; plus CRM, monitoring and the agency SaaS pages). Read this first for any product/app page; the long references are for the recipes you pick.

## The checklist
1. **One story, not a feature tour.** Pick one sample journey that carries every fact (one release rolling out, one purchase start to finish, one contract to signed, one morning of deliveries, one week's schedule). Each fact = one screen with its own composition and colour.
2. **The product UI is the hero and it is BIG** (≥ 50% of the width while it's the subject). A giant readout next to a console (0% → 5% → 50%) works as the image.
3. **Keep only the states the facts name.** "Waiting" + an assignee — not SLAs, durations, extra statuses, AI, notifications. Sorting/routing machines imply automation; times between events imply speed.
4. **Sample content is labelled** (a small "Sample" chip per mockup — exempt from the one-tag rule), names are first names or initials, a fictional domain (your-business.com / your-site.com), and the numbers add up and stay consistent (hours after a swap, receipts totals, budgets vs bars).
5. **Unknown specs live in the FAQ** as questions with tagged answers (pricing, integrations, AI, security, retention, accuracy, languages, customers). One tag per block; a hero that needs two merges them into one tag.
6. **Sector implied facts** (list them in the report):
   - *Money / cards:* card-network marks, EMV chip, "Approved" = pre-authorisation flow, "Matched" = OCR, currency/periods imply a market; a Stripe-style ribbon must not rise to the top-right on money pages ("decoration, not a chart").
   - *AI products:* a clean summary implies accuracy, notes right after the call imply speed, a multilingual sample implies languages, highlighted decisions imply reliable detection.
   - *Recording / privacy:* consent wording, retention, who can see it, data location, "secure/encrypted" — placeholders; a bot tile in a call implies a visible participant.
   - *Legal-tech:* seals, stamps and "certified" marks imply legal status; audit-trail fields (IP, email, timestamps) are feature claims.
   - *Workforce:* faceless figures with ink heads and identical bodies (skin tone and hair are origin/gender cues); hours sheets are "not a payslip"; lanes and 7 open days imply opening hours.
   - *Logistics:* ETA, turn-by-turn, SMS vs email, optimisation quality, stop limits.
   - *Analytics:* category labels (Search/Social, Desktop/Phone) are detection claims; weekly bars stay flat or humped, never rising; every chart labelled sample.
   - *Dev tools:* a code snippet in a real language implies that SDK — use language-neutral pseudo-code with a "not the SDK API" chip.
7. **Invented sample brands** inside the product (a fictional coffee brand in a brand-asset tool): own palette and font, labelled fictional, trademark-check its name like the product's.
8. **Trademark-check every invented product name** and note place names or facilities it evokes.
9. **Not a design tool:** no toolbars, layer panels, cursors (except one deliberate click), selection handles, rulers, canvas grids or inspectors — objects at display size, stamps, drawers, locks instead.
10. **Phones:** dense 3-column consoles become a stacked layout with a slide-up drawer; UI text stays ≥ 12px (a wide board pans sideways rather than shrinking).

## Recipes that worked
- **Pile → queue / cards → rows:** two elements — the loose card flies to its row's centre, shrinks and fades while the row fades in; measure both with transforms cleared. Reordering rows (a "Waiting" view) uses a measured row pitch and transforms only; dimmed rows must have been fully visible earlier.
- **Scroll-driven typing:** reserve the final text height with an invisible copy in the same grid cell; show a placeholder while empty.
- **Travellers (avatars, receipts) flying to a slot:** plan a keep-clear path that never crosses text, per layout; the target includes the slot's own scroll drift.
- **Camera zoom around a product window:** interpolate a focus point, or return to scale 1 between two far-apart focus points (moving the origin at scale > 1 crops both columns).
- **HTML document camera** (a notes page that zooms to a block, then docks aside): fit-scale + end-state table per breakpoint; docked cards below ~0.7 scale make 18px text unreadable.
- **Bento tile → chapter:** cover-scale the chapter back into the tile so the first grow frame matches; tiles swap with FLIP between equal cells; tile aspect differs on phones.
- **Stacking hand-over between full-bleed chapters:** +100vh runway on the outgoing section, chapter progress over `height − 2·vh`, the incoming panel on an eased curve (≈ x^3.2) with a top shadow — otherwise evenly spaced frames catch 50/50 split screens at every seam. Costs about one screen per seam.
- **Pinned charts and builds open ≥ 30% built** (count mid-way, bars up, map partly revealed); the first object is already on stage when the pin begins.
- **SaaS over an isometric world:** side fades outlast captions, card and camera sides alternate, "the world becomes the app window" (a paper frame around the map).
- **Tactile paper (CSS 3D):** fold a sheet in thirds with back faces (swap z-index past 90°), align the shadow to the folded shape, split the envelope into back / letter / front pocket / flap; a tilted dark board in the hero needs a scroll-driven clip on phones.
- **Dot world maps without data:** rasterise rough continent polygons at build time — no borders.
- **Stationery family:** paper tone + one ink + one wax accent, SVG feTurbulence grain, leather-blotter corners.

## Pitfalls
- `aspect-ratio` + `height:100%` inside a flex column works with JS and collapses without it (like `cqh` → 0); give flexible visuals a fixed height in no-JS/reduced motion.
- A pinned stage whose visual is `height:auto` with absolute children resolves to 0 height on phones — walk passes, the sheet shows an empty stage.
- "Item into a container" (letter into envelope) breaks if the container's parent has a transform (stacking context).
- `%` padding on absolutely positioned device frames resolves against the stage width — use px/em.
- The envelope's `bottom:%` refers to its clip box; flaps start in their open state in the HTML so no-JS shows the letter.
- A letter-split wordmark with `space-between` + `max-height` + `overflow:clip` cuts descenders; footer wordmark progress comes from the element itself, not the footer's viewP (which ends ≈ 0.66).
- walk.mjs: `largestVisualPctOfScreen` reads 100 for full-stage SVG/canvas and undercounts HTML documents (add a window/mock/device class); a final scroll step under ~20px can show as dead scroll; `h1WidthPct` under-rates short two-word heroes — judge by height.
