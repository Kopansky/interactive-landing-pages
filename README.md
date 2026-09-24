# interactive-landing-pages

A Claude Code skill for designing and building world-class, scroll-driven landing pages — drawn/illustrated, SaaS, photographic or editorial — and for running the variation → feedback → hybrid loop with a client.

## Install

Clone into your personal skills folder so it is available in every project:

```bash
git clone https://github.com/Kopansky/interactive-landing-pages.git ~/.claude/skills/interactive-landing-pages
```
(Windows: `C:\Users\<you>\.claude\skills\interactive-landing-pages`.) Restart Claude Code; the skill triggers on requests like "build a landing page like Stripe", "give me 6 design variations", "make it interactive with scroll".

## What's inside

| Path | What |
|---|---|
| `SKILL.md` | The process: brief → research → diverge → build in parallel → verify → relay reactions → narrow |
| `references/concepts.md` | ~70 scroll concepts that were built and verified (incl. local services, shops, events, single products) (Deck, Orbit, Zoom, Isometric, Board, Portals, Magazine…), with fit and risks |
| `references/brand-styles.md` | Measured style systems of 15 brands (Notion, Slack, Stripe, Linear, Apple, Firecrawl, Shopify, Wise, Figma, Airbnb, Jeton, Clay, ElevenLabs, ClickUp, Ctrl) |
| `references/brand-research.md` | How to research a new reference brand (Mobbin + live-site measurement) |
| `references/motion-recipes.md` | Vanilla JS/CSS patterns: scroll loop, pinned beats, SVG camera, portals, arc wheel, split-flap, page turn, pendulum + a list of bugs that happened in practice |
| `references/isometric.md` | Guide to the isometric engine: axes, solid fields, draw order, groups, text on faces, camera, baking for no-JS, premium look |
| `scripts/walk.mjs` | Scroll audit: real wheel steps down and back up; reports horizontal overflow, dead scroll, never-visible content, fonts, console errors, type scale and the craft-floor verdict |
| `scripts/shots.mjs` | Screenshots at chosen scroll positions (reached by real scrolling) + one contact sheet — for reviewing pinned stages beat by beat |
| `scripts/compress.mjs` | Resize/re-encode images to JPEG, WebP or PNG with headless Chrome (no ImageMagick needed) |
| `scripts/canvas-job.mjs` | Build-time pixel jobs in Chrome: flatten studio backgrounds, masks, recolouring, cutting a part out of a photo |
| `scripts/serve.mjs` | Tiny static server for previewing a site folder |
| `scripts/cdp.mjs` | Dependency-free headless Chrome driver (Node 22+) that always deletes its profile |
| `assets/isometric-engine.js` | Flat 3-tone isometric SVG engine (prisms, domes, balls, rotation between iso angles) |
| `templates/` | Shared brief and parallel-variant dispatch prompt |

## Requirements
Node 22+ and Google Chrome for the verification scripts (`CHROME_PATH` to override). Optional: the Mobbin MCP for reference research; an image-generation MCP for photographic styles.
