# Dispatch prompt for one variant agent

Send one of these per variant, all in the same message so they run in parallel (background agents). Fill every <slot>. For a single page, the same prompt works for one agent — or follow it yourself.

---
Build the **<VARIANT NAME>** variation of the <client> landing page.

1. Read from disk (not a cached copy): `<skills dir>/interactive-landing-pages/SKILL.md` and the references it points to for this style (`real-3d.md`, `isometric.md`, `motion-recipes.md`, `brand-styles.md`, `concepts.md`).
2. Read the brief: <absolute path>/brief.md — every rule in it is mandatory, including the **Client taste** list (start from `templates/taste.md` if the client's own taste is unknown). Work only in <scratch>/<variant-slug>/ (`site/` = deliverable, `work/` = everything else); never write or delete outside it. Use only your own headless Chrome via the skill's scripts, with `--workdir <your work folder>`.
3. Facts: only what the brief states. Every price, spec, number, name, review, rating or claim that isn't in it is a placeholder tag or a sample-value chip, reported as a launch blocker. Everything you draw, model or generate implies facts (props, features, rooms, colours) — list them.
4. <IF BRAND> Research <brand> per `references/brand-research.md` and write research-<brand>.md, then build from it.
5. Direction: <style family> — <one paragraph: the spine, what each chapter shows, what scroll does>. It must differ from: <list existing variants>. Write 3 concept sketches in `work/concepts.md` within this direction and pick one.
6. Output: <absolute path>/site/index.html (title "<client> · <Variant>").
7. Verify and fix until clean: `walk.mjs` at 1440×900 with `--font "<font>"`, 375×812, `--nojs`, `--reduce` (check `verdict.craftFloor` and `typeScale`), then `shots.mjs` contact sheets of every pinned runway at 1440 and 375. LOOK at every frame: fix anything small, empty, faint, clipped, text crossing the visual, or template-like. Walk passing is not enough.

Reply tightly with: file path; concept and why; typeScale; walk table; placeholders; NEW wording not in the brief (for the client to approve); implied facts; and what the skill did not tell you for this kind of site. Don't paste HTML.
---

Rules for the dispatcher (the orchestrator):
- Use the strongest model at high effort. A good page takes one agent 25–60 min and 250–600k tokens — short, cheap runs produce the timid pages clients reject.
- 4–6 agents per round is the sweet spot. Name concepts far apart in round one; narrow to hybrids of what the client liked afterwards.
- **You are the art director.** When an agent reports, run `shots.mjs` on its page yourself and look at the contact sheet before showing the client. Send back (SendMessage) anything weak; only show finished pages.
- When the client reacts mid-round, SendMessage the running agents instead of restarting them. Turn each reaction into a rule in the brief's taste list — and, if it's general, into the skill.
- After the round: check free disk space and delete leftover `ilp-prof-*` browser profiles that aren't in use.
