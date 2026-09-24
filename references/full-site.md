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
- **Static test / small site (≤ 8 pages):** plain multi-page HTML sharing `assets/site.css` + `assets/site.js`; each page ≤ one page-specific `<script>`. Relative links (works on file:/// and any host).
- **Real project:** recommend Astro (static, component-based, easy to hand to a CMS) or the client's CMS (WordPress/Webflow) — build the design system as components/partials first, then pages. Say which in the report; don't install a framework in a test without being asked.
- **SEO basics per page:** unique `<title>` and meta description, one h1, `lang`/`dir`, Open Graph title/description, canonical placeholder, `sitemap.xml` + `robots.txt` listing the real pages.
- **Shared behaviour** (header states, menu, FAQ, forms, cart) lives in `site.js` once; page-specific scroll moments live on their page.

## 6. Verify the whole site
- Run `walk.mjs` on EVERY page at 1440 and 375 (plus --nojs and --reduce on the homepage and one inner page of each template).
- Link check: every internal link resolves (no 404s), header/footer identical across pages, current-page state correct.
- `shots.mjs` contact sheet per page; review side by side for consistency (type sizes, header, spacing) and for cloned-looking service pages.
- One report for the site: sitemap, per-page walk table, placeholders per page, new wording per page, implied facts.
