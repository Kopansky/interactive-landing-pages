# Concept catalogue — scroll-driven page concepts

Every concept below was built and verified end-to-end on a real landing page. Each one is a **spine**: one mechanic the whole story hangs on. Pick ONE per variant; the rest of the page stays calm around it.

Legend — Fits: **D** drawn/illustrated · **S** SaaS · **P** photographic · **E** editorial · **K** dark/product.
Pin = uses a pinned (sticky) stage. Risk = the thing that broke most often while building it.

## Story spines (the whole page is one metaphor)

| Concept | Mechanic | Fits | Pin | Risk |
|---|---|---|---|---|
| **Conversation** | The core story is one giant chat thread that writes itself: typing dots → bubble grows from its tail → meta line settles; earlier bubbles fade back; scrolling up un-writes. | D S | no | too many bubbles on screen at once — keep one focus bubble |
| **Deck** | A centred stack of huge cards; scroll "deals" them — top card lifts, tilts, flies off to alternating sides; next 2–3 edges peek below; position pill "03 / 14". | D S P | yes | runway length per card; mobile needs shorter runs |
| **Orbit** | The product (a phone) at the centre, 2–3 concentric rings carrying chips/drawings; scroll + drag rotate the rings; each chapter re-populates them. | D S | yes | ring labels colliding; clip rings on mobile |
| **Zoom** | One big illustration (a small town); scroll is a camera zooming INTO a detail (window → room → phone → bubble) and finally pulling back out to the same scene changed (night → morning). Use viewBox animation for crisp SVG. | D P | yes | long runway — 0.8 viewport per zoom max |
| **Path** | A thick road winds down the page; a small character rides it (SVG getPointAtLength), the road paints itself ahead; stations light up as it passes. | D | no | keep the rider vertically stable; mobile = single S-curve |
| **Phone** | One giant pinned phone; every scroll step changes its screen (lock screen at night → notifications → unlock → setup → chat); drawings around it react. | D S K | yes | 12+ states → split into chapters |
| **Stage** | A theatre: rounded proscenium, flat curtains close between acts, props drop on strings, spotlight follows the active character, big surtitle. | D | yes | acts must stay short (≈36 wheel steps total) |
| **Dollhouse** | Flat front cross-section of a building, rooms = businesses; an elevator carries the character between rooms; camera pans floor to floor. | D | yes | captions vs room density on mobile — stack rooms |
| **Desk** | Top-down view of an owner's desk (phone, diary, coffee, laptop); a camera pans across one continuous surface; objects act the story. | D P | yes | mobile: frame one object at a time |
| **Clock** | One giant pinned clock face; scroll moves the hands; content pins itself to hour positions on the ring; the face flips night→day. | D S | yes | ring labels on mobile → small time chips |
| **Storybook** | A pinned stage slides full-screen illustrated pages sideways (RTL-aware); a progress line "05 / 12". | D E | yes | the horizontal track widening the page — clip it |
| **Magazine** | Double-page spreads; scroll turns a real 3D page curl (rotateY over the spine + shading gradient). Mobile = single pages. | E D | yes | short laptop screens → fall back to single pages |
| **Night → morning** | The whole page is one sky: each section's gradient starts where the previous ended; header takes the sky colour; a sun/moon crosses. | D K | no | text contrast in the dawn band — measure pixels |
| **Receipt** | A little printer prints a long receipt line by line as you scroll; stamps thump down; a second receipt tells the "after". | D | brief | paper must grow downward without layout shift — clip, don't insert |
| **Board** | A split-flap departure board; rows flip character by character to new content; status cells flip ("pending" → "done"). | S D K | yes | RTL order + final letters on flaps; tiny flaps on mobile |

## Section mechanics (use inside a calmer page)

| Concept | Mechanic | Fits | Risk |
|---|---|---|---|
| **Pinned lock-screen** | A pinned phone lock screen fills with notifications as the clock advances; wallpaper turns from night to day. | any | — |
| **Arc wheel** | A vertical list on an arc: items scale/fade by distance from centre; auto-spin + scroll + drag + snap; a readout pill shows the centred item. | D S | drag must not block vertical page scroll on touch |
| **Pinned phone assembly** | Boundary/feature cards fly in and dock around a thick-outlined phone while its conversation advances beat by beat. | D S | 3,600px runway once — keep ≈1.8 viewports |
| **Stacking panels** | Colour panels stick below the nav and each new one slides over (optionally the covered one shrinks slightly). | any | — |
| **Accordion strips** | Panels start as slim strips, open when they reach mid-screen, fold back into strips that stack at the top as a clickable table of contents (≤ 19% of viewport). | D S | stack height |
| **Cylinder / drum** | 3D drum on a horizontal axis (rotateX), panels roll up from below, face you, roll away over the top. Render ≤ 4 panels. | S D | screen readers only reach the front panels — add an index |
| **Flip tiles** | Square tiles turn 180° in 3D (drawing front → content back) in a wave as they cross a line at 60% of the viewport. | D S | never hide content behind a flip without JS |
| **Doors** | Advent-calendar doors swing ~95–104° on a hinge and STAY open, revealing a recessed space with content. | D | 110° leaves cover neighbours |
| **Portals** | A small shape (bubble, sun, arch, star) filled with the next section grows via `clip-path: path()` until it covers the screen. | any | — |
| **Macro crop** | Each band starts pressed against a tiny slice of a giant drawing; the camera (SVG viewBox) pulls back to reveal the whole picture. | D E | pulling back too fast — ≥ 115vh bands |
| **Colouring** | Drawings appear as line art; colour floods in shape by shape with scroll; outlines fade when complete. | D | — |
| **Riso print** | 2–3 spot inks with multiply overlap, grain, slight mis-registration; each drawing "prints" ink by ink, registration closing from ~20px to 2px. | D E | never multiply-blend text |
| **Long shadows** | Every flat shape casts a computed long shadow from one moving light; scroll = time of day. | D | per-shape shadow cost — clip per section |
| **Paper** | Shapes as layered paper cut-outs with stacked soft shadows; layers separate in depth, peel, fold, pop up. | D | muddy shadows — keep them subtle |
| **Isometric world** | Flat shapes extruded into 3-tone isometric solids; blocks rise and settle, scenes rotate between iso angles, pieces walk the grid. Engine: `assets/isometric-engine.js`. | D | bake scenes into HTML for no-JS |
| **Isometric tower** | One isometric tower grows floor by floor; camera climbs; each floor is a chapter. | D | only redraw changed floors |
| **Isometric character** | A robot/mascot built from the same solids assembles itself, powers on, walks, points, waves. | D | part rotation needs per-group transforms |
| **Gravity piles** | 5–9 shapes drop, bounce and settle into a pile that forms the chapter's picture (hand-written spring). Pointer nudges. | D | clip; lift on scroll-up |
| **Hanging mobile** | Calder-style mobile: shapes on wires, beams as damped pendulums, re-balancing when scroll hangs/removes a piece. | D | run the loop only while moving |
| **Puzzle** | Jigsaw pieces (pre-cut at build time) fly in from scattered spots and click into place; a missing piece is filled by the hero. | D | pieces must stay clipped in their section |
| **Morph** | One set of ~19 shapes behind the page re-arranges (position, size, radii, colour) into each chapter's picture. | D | outlines redrawn per frame — keep shape count low |
| **Mosaic** | A pinned tile grid re-cuts tile by tile into a new arrangement when a text block crosses mid-screen. | D S | — |
| **Split panel** | 50/50: a sticky half-screen colour panel whose colour wipes and drawing re-composes per section. | D S | reduce to per-section panels below 1000px |
| **Kinetic type** | Giant full-width lines with drawings inline in the words; lines slide opposite ways with scroll; a word rolls through alternatives. | any | clip each row; readable when still |
| **Parallax columns** | Two tile columns frame the page and scroll at different speeds; each stretch is themed to the section beside it. | D S | below 1100px → one drifting row per section |
| **Pattern wallpaper** | Full-bleed repeating print of the shapes; a wave turns tiles 90°; the repeat re-cuts to a new motif per section; white cards on top. | D | keep calm white sections between bands |
| **Kaleidoscope** | 6–12-fold mirrored mandala; wedge contents slide/spin with scroll and resolve into an emblem at each chapter; text stays outside. | D | — |
| **Ribbons** | 3–4 thick flat ribbons draw themselves down the page (stroke-dashoffset), weave, and knot into each section's picture. | D | no pinning (positions tied to layout) |
| **Colour blocks** | Stack of near-full-bleed colour blocks that slide over each other; page background eases between block colours; one drawing per block. | D S | AA contrast on every block colour |
| **Poster sheets** | Each section is a square-cornered colour poster whose drawing "prints" layer by layer and re-cuts every few seconds. | D E | — |
| **Swiss grid** | Visible 12-column hairline grid, huge section numbers that roll digit by digit, modules sliding into cells along the grid lines only. | S E | never look like an editor canvas |

## Service, local and portfolio businesses (built in skill tests)

| Concept | How it works | Fits | Pin | Risk / fix |
|---|---|---|---|---|
| **Case file** (legal, finance, consulting) | A big folder/document opens page by page as you scroll; each tab is a service; the last page is the contact form. | E | 1 | never show real case details; slow, precise motion |
| **One visit, hour by hour** (clinic, salon, garage) | A clock or day strip drives the page: arrive → sit → treatment → leave; hours section is the real schedule. | P E D | 1 | "open now" only from confirmed hours; isolate time ranges in RTL |
| **Drawing set** (architect, builder, interior) | Sections are numbered sheets; plans, elevations and sections draw on with scroll; a title block updates. | E D | 1 | dimensions are illustration, list them; dashed lines need a wipe, not draw-on |
| **Aperture** (photographer, hotel, venue) | Each chapter opens as a letterbox slit on a detail and pulls back to the full photo; one line of text after. | P | per chapter | real work only at launch; label generated images |
| **Path with a character** (kindergarten, kids, tours) | A drawn character walks a path down the page, stops at each fact, arrives at the door/CTA. | D | 0 | scroll-driven steps (reverse on scroll up); reduced motion = end state |
| **Interval timer** (fitness, classes) | A ring timer fills over a pinned stage; each set slams in a service; a countdown leads to the CTA. | P S | 1 | CTA visible without waiting for the countdown |
| **Deck of dishes/rooms** (restaurant, hotel) | Huge photo cards thrown off a pinned stack, "01 / 04" counter. | P | 1 | photos imply specific dishes — replace before launch |
| **X-ray cutaway** (garage, repair, appliance, product service; drawn version: a dollhouse building whose walls turn into an "inside the walls" layer for plumbers/electricians) | One big studio photo of the object; a scan line sweeps across and reveals a precise technical drawing traced from the photo's own outline; the camera pushes in on each serviced part, which glows in one accent; every beat a different composition. | P S | 1 (long) | outline from background removal (not thresholding), clip the photo with the vector outline, upscale for 2–3× zooms, `vector-effect: non-scaling-stroke` |
| **Service bay / lift** (garage, repair, bike shop — a client rejected the toy-car version; keep the vehicle huge and premium) | A flat/isometric vehicle drives in, a lift raises it, each service drops its prop and changes the car (rims, icy windows, lights), a "ready" stamp, it drives out. | D | 1 | props are generic; pins over ~2 viewports need something changing every step |
| **One rep at a time** (trainer, studio, physio) | A flat character built from circles/bars with jointed limbs does one exercise per beat; copies join for groups; background floods per beat. | D | 1 | switch beats at the rest pose; bake poses for no-JS |
| **Walk the site** (festival, venue, campus, resort) | One pinned isometric/drawn map; a dotted path leads the camera stop by stop, each place builds on arrival, ends at tickets. | D | 1 (long) | map positions are implied facts — label "illustrative map", never write "next to"/"a short walk"; line-up TBA → kinetic type + sign-up; passes as big stubs with one price tag |
| **Teardown** (single-product store: knife, headphones, bottle, bike) | One pinned stage: the product turns, explodes into labelled parts, the camera zooms into a material, it reassembles into its box. | D S | 1 | long thin products: stack parts vertically and turn the camera 90° on phones; construction details (rivets, inserts) are implied facts |
| **Split poster** (conference, launch, event) | Kinetic type-as-image: the wordmark splits and re-stacks into a poster; odometer countdown; talk slots as "TBA" blocks assembling into track lanes; huge ticket tiers with live "ends in N days". | S E | 1–2 | TBA can BE the content; no invented speakers/sponsors; no "become a sponsor" unless confirmed |
| **Breath** (yoga, meditation, therapy, spa) | A pinned stage that inhales/exhales with scroll: a soft circle grows and shrinks on a sine, the photo zooms gently around a new focal point each breath, one class/service per breath in huge type at a different spot. | P E | 1 | keep something moving at the bottom of each exhale (progress ring) or it reads as dead scroll; no health-outcome claims |
| **Pop-up book** (bookstore, publisher, kids brands, museums, story brands) | One 3D book opens the Hebrew way (pages lift on the LEFT and land on the RIGHT); each spread stands up a 3-layer paper-cut scene (back first), one scroll-linked motion per spread, the scene folds flat before every turn; the closed book becomes the final object (a bag, a gift). | D | 1 (long) | no readable titles on spines/covers; section signs only from confirmed categories |
| **One strand / one thread** (portfolio trades without real work photos: salon, tailor, florist) | A drawn motif (a lock of hair, a thread, a stem) runs through the page and BECOMES each service (cut, dipped in colour, curled, braided); photos appear once each, between type-only chapters. | D P | 1–5 | each photo once; a recolour is one beat, not the spine; no fake before/after from one photo |
| **Lifeline** (pension, insurance, family wealth, life-stage services) | One elegant line runs across the screen as a lifetime; it branches at life moments (words only, no ages/axes) and each branch lights a service; family members join as abstract circles; the next generation forks. | E S | 1 | never rises like a chart; no numbers; text attached 1:1 to the moving world |
| **Transformation** (roastery, bakery, brewery, winery, plants) | The product changes state with scroll: green bean → dark roast, dough → loaf; a curve or gauge tracks it; product cards reuse the same drawing at the end state. | D P | 1 | stage texts = general knowledge, not business claims; report as new wording |
| **One object, four states** (clinic, salon, repair) | One huge flat object (a tooth, a nail, a car) on a pinned stage transforms through each service; background colour eases per state. | D | 1 | slow, no bounce for anxious audiences; no-JS = one still per state from shared parts |
| **Quiet light** (last resort for clinics) | Photo arch widens; sticky photo cross-fades. Rejected by a client as template-like when the photos were small — only with full-bleed photos. | P | 0–1 | never a small arch floating in white |

Local businesses (garage, clinic, salon, restaurant): the page exists to get a call. Walk-in shops (ice cream, bakery, café): the conversion is "come now" — make the live open/closed status the punchline. Tap-to-call and WhatsApp in the hero; on phones a sticky primary action bar is allowed (it is not decorative chrome) — reserve bottom padding for it, hide it while the hero's own call buttons are visible and over the contact section and footer, and keep pinned captions above it. Unknown number → the button jumps to the contact section and shows the placeholder, never a dummy `tel:`. "Open now" only from confirmed hours, in the business's time zone.

Non-profits / donations: preset amounts are UI suggestions for the client to approve; never "₪X = a week of food", never tax-credit claims unless confirmed; monthly is never pre-selected; the picker works, submit says nothing was charged. Emotional framing is fine, invented rescue stories and suffering imagery are not. Animal/people photos on adoption or charity pages read as "this one is real" — label every photo illustrative and say so in the footer.

Shops: cart drawer = `role=dialog`, focus trap, Esc closes, focus returns; quantity limits, VAT, shipping outside the stated area and legal pages (imprint, withdrawal right) are placeholders; a top buy bar may stay during pins if it never covers captions. Product cards, cart and subscription builders stay real UI. Unknown prices: either one uniform, obviously round demo price (with size variants add a "price per size" tag, or hide prices) (e.g. ₪100) labelled "demo price" on every card, in the cart and in a site bar — so subtotals and free-shipping bars work — or no prices at all; never plausible varied numbers. Unknown product names → neutral numbering ("Mug 01") + one catalogue-level tag. A product grid is exempt from "one idea per screen" — keep it big (≤ 3 large columns, sticky filter bar). 3 image prompts cannot photograph a 12-product catalogue honestly → prefer a seeded drawing generator (siblings, not copies). Checkout says it is not connected.

## Choosing

1. What is the product's (or service's) core story in one line? A local business has one too: the visit, the day, the journey from problem to relief. (e.g. "they write at night, you answer in the morning") — prefer a spine that *is* that story (Clock, Night→morning, Phone, Receipt).
2. How much content? Heavy pricing/FAQ → keep the spine to the story sections and leave the rest calm.
3. Audience patience: B2B buyers → Deck/Board/Split/Swiss; consumers → Zoom/Stage/Isometric/Gravity.
4. For a first round, pick concepts that are **far apart** (one spine, one section-mechanic page, one calm/minimal page) so the client's reaction is informative.
