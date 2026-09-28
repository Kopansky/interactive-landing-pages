# Researching a reference brand or style

Use this when the client names a brand ("like Notion", "like Jeton"), sends a Mobbin/site link, or asks for a style that has no entry in `brand-styles.md`. The output is a written spec; build only from the spec.

## 1. Mobbin (if the Mobbin MCP is connected)

- `search_sections` with 8+ queries that NAME the brand and ONE section type each: hero, navigation, feature cards, product showcase, logos/social proof, stats, pricing, FAQ, CTA, footer. e.g. `"Notion feature cards pastel AI Meeting Notes"`.
- Look at every image. Note what the section *is* (layout, hierarchy, what's big, where the product sits) — not what it says.
- A pasted mobbin.com/sites/<brand>/… link = the client's chosen reference: search that brand by name and match it closely.
- No Mobbin → skip to step 2; describe what you see from the live site instead.

## 2. The live site (in your own browser — never the user's personal browser)

Open the real homepage + one product page. Scroll slowly with screenshots and measure with computed styles:

| Measure | How |
|---|---|
| Nav | sticky? hides on scroll-down? transparent → solid? height, border (note: many clients hate a framed sticky header) |
| Type | `getComputedStyle(h1/h2/p)` → size, weight, letter-spacing, line-height at 1440 and 375 |
| Colour | canvas, text, muted text, accent, section alternation |
| Shape | radii of buttons/cards/inputs, border widths, shadow recipe |
| Motion | reveal distance & duration, easing (look in their CSS/JS bundles for cubic-bezier), what pins, what is scrubbed by scroll, hover states |
| Signature | the 1–3 moves that make it recognisable (e.g. rotating word pill, skewed gradient, bottom pill nav) |

If the site is dead or blocked, read a Wayback Machine snapshot's HTML/CSS/JS directly — exact values beat guesses. Decline non-essential cookies; never sign in, submit forms or download.

## 3. Write the spec (before any code)

`research-<brand>.md` in your working folder: tokens (colour, type scale, radii, shadows, easing), behaviours (nav, reveals, pins, hovers), and a section-by-section mapping of THE CLIENT'S content onto the brand's patterns. Translate the brand's signature colour into the client's palette unless told otherwise; keep neutral systems neutral.

## 4. Build rules for brand-inspired variants

- Inspired by, never a copy: no brand logos, names, copy, or product UI of the reference brand.
- The client's real product UI stays recognisable; restyle only its frame.
- No invented logos, testimonials, ratings, customer counts or statistics — where the brand shows a logo wall, show the client's channels/integrations/customer types instead.

## When the reference brand has changed
If the live site doesn't match what the client remembers (io.net is light SaaS today; its dark crypto look is from 2024), check older snapshots (web.archive.org) and say which version you matched. Also list the reference's **forbidden patterns** — tone and claims you must not copy (investment-flavoured copy, taglines, "the world's …" lines that belong to other companies) — not only the visual patterns to take.
