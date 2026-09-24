# Full site mode — from an approved homepage to a whole website

Use this after a homepage direction is approved (never before): the homepage is the brand's proof, the rest of the site inherits it. Everything in SKILL.md still applies (content rules, craft floor, verification) — this file adds what a multi-page site needs.

## 1. Extract the design system from the approved homepage (before any inner page)
Write `site/assets/site.css` + `site/assets/site.js` and a short `work/design-system.md`:
- **Tokens:** colours (roles, not just hexes), type scale (display / h1–h3 / body / small at 1440 and 375), spacing scale, radii, shadows, motion easing + durations.
- **Shared parts:** header (frameless, states over photo / light / dark), mobile menu, footer, buttons, links, form fields + "not connected" states, placeholder tag, "illustrative" label, cards/rows, FAQ accordion, cart drawer if any.
- **The visual system:** how drawings / photos / 3D are used on inner pages (smaller doses of the homepage's world, same palette and light).
- **Class naming:** prefixed components (`hdr-`, `ftr-`, `btn-`, `faq-`) so pages never collide.

## 2. Sitemap first, from the facts
List pages the brief supports — never invent pages for services that don't exist. Typical:
| Business | Pages |
|---|---|
| Local service (garage, clinic, salon) | Home · Services (index) · one page per service · About · FAQ · Contact |
| Hospitality (hotel, restaurant) | Home · Rooms/Menu · Experience/Area · Gallery · FAQ · Contact/Booking |
| Professional (law, finance, architect) | Home · Practice areas · one page per area · About/Approach · FAQ · Contact |
| Product / shop | Home · Product(s) · How it works · FAQ / Shipping & returns · Contact · Cart |
| SaaS / app | Home · Features · Pricing · Customers (only if real) · Docs/Help link · Contact |
Plus always: 404, Privacy / Terms / Accessibility statement (as placeholders if not supplied).

## 3. Inner pages: quieter, never template
The homepage has the big spine; inner pages get **one signature moment each** from the same world (a smaller pinned beat, a draw-on, a portal into a photo, an isometric close-up) and otherwise calm, big typography.
- Each inner page opens with a **page hero**: big headline (≥ 72px at 1440), one line, one visual from the world — not a thin banner.
- **Service/area pages** share a template: hero → what it is (facts only) → how it works (process steps from the brief) → a signature visual → FAQ for that service (placeholders) → CTA. Vary one element per page (visual, colour, crop) so they don't look cloned.
- **About** without facts = the business's confirmed story only (years, family, location); everything else placeholder. Never invent team members, values or history.
- **Contact** = the local-business rules (tap-to-call/WhatsApp placeholders, map as illustrative, hours only if confirmed, form "not connected").
- **FAQ / legal** pages are text pages but still use the type scale and header/footer.

## 4. Navigation
- Header links = the sitemap's top level; current page marked; mobile menu is a full-screen sheet with big type.
- Cross-links: every service page links to siblings ("Other services") and to Contact; breadcrumbs on deep pages.
- Page transitions optional and light (a short fade / the header staying put) — never block navigation.
- Anchor links from the homepage chapters to the matching inner pages.

## 5. Build
- **Static test / small site (up to ~15 pages incl. legal + 404):** plain multi-page HTML sharing `assets/site.css` + `assets/site.js`; each page ≤ one page-specific `<script>`. Relative links (works on file:/// and any host).
- **Real project:** recommend Astro (static, component-based, easy to hand to a CMS) or the client's CMS (WordPress/Webflow) — build the design system as components/partials first, then pages. Say which in the report; don't install a framework in a test without being asked.
- **SEO basics per page:** unique `<title>` and meta description, one h1, `lang`/`dir`, Open Graph title/description, canonical placeholder, `sitemap.xml` + `robots.txt` listing the real pages.
- **Shared behaviour** (header states, menu, FAQ, forms, cart) lives in `site.js` once; page-specific scroll moments live on their page.

## 6. Verify the whole site
- Run `walk.mjs` on EVERY page at 1440 and 375 (plus --nojs and --reduce on the homepage and one inner page of each template).
- Link check: every internal link resolves (no 404s), header/footer identical across pages, current-page state correct.
- `shots.mjs` contact sheet per page; review side by side for consistency (type sizes, header, spacing) and for cloned-looking service pages.
- One report for the site: sitemap, per-page walk table, placeholders per page, new wording per page, implied facts.

## 7. Lessons from the hotel full-site test
- **Moving the homepage onto shared files:** if the homepage came from a generator, rebuild it from the generator and confirm it is byte-identical before refactoring; then rename to prefixed classes, move shared CSS/JS out, and compare before/after screenshots at 1440 and 375. Expected changes only: nav links go from `#anchors` to pages, and chapters gain "→ inner page" links.
- **One loop per site, not per file:** SKILL.md's "one rAF loop" becomes one loop in `site.js` that each page registers its moment with (`Site.stage(el, fn)`); pages never start their own loop.
- **Shared big drawings:** an external SVG `<use href>` doesn't work from file:///. Inline it per page if ≤ ~250 KB, otherwise put the drawing module in `site.js` and draw it from there.
- **Vary hero composition across pages, not just the drawing:** list each page's hero layout (split left, split right, centred over scene, full-bleed band) in `work/design-system.md` and never repeat the same one on sibling pages. Text over a busy drawing needs a plate.
- **Pages named after two things** ("Rooftop & breakfast") must keep them in separate sections, so the page doesn't imply they happen in the same place.
- **Scrubbed colour changes** (sunset, day→night): caption colour follows the scene (a class toggled at the midpoint), checked at 375.
- **FAQ pages** may answer from confirmed brief facts; only the unknowns are placeholders.
- **Placeholder domain:** `https://www.example.com` (or the local TLD, e.g. `example.co.il`) in canonical, sitemap.xml and robots.txt, listed as a launch blocker.
- **Header over dark heroes:** check the current-page style stays visible on every hero background.
- **Mobile between rounds:** after each fix round, take a quick 375 contact sheet of the changed pages; don't wait for the final walk.
- **Verification cost:** ~30 walks take ~25 minutes, so run them in parallel (separate `--workdir` per run). Walk every page at 1440 and 375, and run --nojs/--reduce once per template.
- **Serving:** multi-file sites need a server that sends `text/css` (scripts/serve.mjs does). A raw server that sends `.css` as octet-stream makes Chrome drop the stylesheet, so the pages look unstyled.

## 8. Lessons from the law-firm full-site test
- **Thin briefs:** when a service is known only by name, the service template becomes mostly placeholders, and near-empty pages look like SEO doorway pages. Either merge the services into one Areas page with anchored sections, or build the pages and list the missing copy as the first question for the client. Per-service FAQs only when the brief has service-specific questions.
- **What "vary per page" means on sibling pages:** vary at least three of: camera move, hero alignment, numeral/visual placement, section order, section theme (dark/light). Identical steps and sibling blocks in the same order on every page still read as cloned.
- **A fixed image set** (e.g. 6 approved photos for 13 pages): write a photo-usage plan (page → photo, crop, camera move) so no two adjacent pages open on the same frame, and each service keeps the photo it had on the homepage. Only generate new images if the client asks.
- **Regulated inner pages:** a disclaimer on every service page, the licence number in the footer, and a note on About/Office photos that they aren't the actual office unless confirmed.
- **Partials:** assemble pages from `work/src/` partials with a small build script (header, footer, menu in one place) so they can't drift. Keep `linkcheck` and `walk-all` scripts in `work/` (walk-all runs 3 at a time).
- **`Site.stage` API:** `Site.stage(el, (p, el) => {...})` gets the element's pinned progress 0..1 from the shared loop; the camera move is `Site.camera(img, from, to)` with {x, y, scale} keyframes. Write the API down in design-system.md.
- **Menu:** the footer carries the full nav, so the site works without JS; the menu sheet is `inert` while closed, traps focus while open, closes on Esc. Mark the parent as current on child pages (area pages → "Areas").
- **404:** it can't be tested on file://, and relative links break on deep paths on a real host. Use root-relative links in the 404 at launch.
- **Signature moments on phones:** a pinned photo that becomes static on mobile needs a replacement (a crop change or crossfade per question), never nothing.
- **CSS traps:** a rule like `.x > *:not(.bg){position:relative}` silently cancels absolutely positioned labels. A relative `url()` inside a CSS custom property resolves against the stylesheet unreliably, so set background images inline.
- **walk.mjs body size:** it reports 0 when every paragraph sits inside pinned captions. Check body size by hand on those pages.

