# interactive-landing-pages

A Claude Code skill for designing and building world-class, scroll-driven landing pages — drawn/illustrated, SaaS, photographic or editorial — and for running the variation → feedback → hybrid loop with a client.

## Install

Clone into your personal skills folder so it is available in every project:

```bash
git clone https://github.com/Kopansky/interactive-landing-pages.git ~/.claude/skills/interactive-landing-pages
```
(Windows: `C:\Users\<you>\.claude\skills\interactive-landing-pages`.) Restart Claude Code; the skill triggers on requests like "build a landing page like Stripe", "give me 6 design variations", "make it interactive with scroll".

## Getting the same results

1. **Check the machine once:** `node ~/.claude/skills/interactive-landing-pages/scripts/doctor.mjs`. It needs Node 22+, Google Chrome, WebGL and access to Google Fonts. If a check fails, the agent can't verify its pages and quality drops silently.
2. **Strongest model, high effort.** A good page takes an agent 25–60 minutes and 250–600k tokens. Quick, cheap runs produce the timid pages this skill exists to prevent.
3. **Invoke it explicitly:** start with `/interactive-landing-pages` (or say "use the interactive-landing-pages skill"), then describe the business. It asks one question, which direction, and builds.
4. **Give it the facts you have** (name, services, hours, prices). Everything else becomes a placeholder tag, never an invented fact.
5. **It works as an art director.** The session sends one background agent per page, then reviews each page's screenshots against the house taste (`templates/taste.md`) and sends weak pages back before you see them.
6. **Be the client.** React to each page ("too small", "looks like a template", "bad", "love the knife page"). Each reaction becomes a rule in the brief's taste list. `templates/taste.md` is the starting taste, distilled from ~100 reviewed pages.
7. **Several directions at once:** ask for 3–4 far-apart directions. The session then runs one background agent per page with `templates/variant-dispatch.md`, and reviews each page's contact sheet before showing it.
8. **Optional tools:** an image-generation MCP for photographic directions (without one, choose drawn, isometric, 3D or type-led directions), and the Mobbin MCP for brand research.

## What's inside

| Path | What |
|---|---|
| `SKILL.md` | The process: brief → research → diverge → build in parallel → verify → relay reactions → narrow |
| `references/concepts.md` | ~70 scroll concepts that were built and verified (incl. local services, shops, events, single products) (Deck, Orbit, Zoom, Isometric, Board, Portals, Magazine…), with fit and risks |
| `references/brand-styles.md` | Measured style systems of 15 brands (Notion, Slack, Stripe, Linear, Apple, Firecrawl, Shopify, Wise, Figma, Airbnb, Jeton, Clay, ElevenLabs, ClickUp, Ctrl) |
| `references/brand-research.md` | How to research a new reference brand (Mobbin + live-site measurement) |
| `references/motion-recipes.md` | Vanilla JS/CSS patterns: scroll loop, pinned beats, SVG camera, portals, arc wheel, split-flap, page turn, pendulum + a list of bugs that happened in practice |
| `references/art-director.md` | How the main session works: one background agent per page, review of every contact sheet against a checklist, fixes sent back, only finished pages shown |
| `references/full-site.md` | Full-site mode: design system from the approved homepage, sitemap, inner-page patterns, navigation, SEO, whole-site verification |
| `references/real-3d.md` | Real-time 3D with three.js: procedural products, scroll stories, baking fallback stills, performance, traps |
| `references/isometric.md` | Guide to the isometric engine: axes, solid fields, draw order, groups, text on faces, camera, baking for no-JS, premium look |
| `scripts/walk.mjs` | Scroll audit: real wheel steps down and back up; reports horizontal overflow, dead scroll, never-visible content, fonts, console errors, type scale and the craft-floor verdict |
| `scripts/shots.mjs` | Screenshots at chosen scroll positions (reached by real scrolling) + one contact sheet — for reviewing pinned stages beat by beat |
| `scripts/compress.mjs` | Resize/re-encode images to JPEG, WebP or PNG with headless Chrome (no ImageMagick needed) |
| `scripts/canvas-job.mjs` | Build-time pixel jobs in Chrome: flatten studio backgrounds, masks, recolouring, cutting a part out of a photo |
| `scripts/serve.mjs` | Tiny static server for previewing a site folder |
| `scripts/doctor.mjs` | One-time check: Node, Chrome, WebGL, Google Fonts |
| `scripts/cdp.mjs` | Dependency-free headless Chrome driver (Node 22+) that always deletes its profile |
| `assets/isometric-engine.js` | Flat 3-tone isometric SVG engine (prisms, domes, balls, rotation between iso angles) |
| `templates/` | Shared brief, default client taste (`taste.md`) and the per-page agent prompt (`variant-dispatch.md`) |

## Requirements
Node 22+ and Google Chrome for the verification scripts (`CHROME_PATH` to override). Optional: the Mobbin MCP for reference research; an image-generation MCP for photographic styles.
