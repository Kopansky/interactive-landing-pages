# Art director mode — how the main session works

The main session never builds pages itself. It is the art director: it writes the brief, sends one background agent per page, reviews every finished page with its own eyes, sends weak pages back, and shows the client only finished work. This is how the reference pages were made; a single session building its own page and grading itself produces the timid pages the client rejects.

## 1. Set up (once per project)
- Run `node <skill>/scripts/doctor.mjs` the first time on a machine. If it fails, tell the user what to install before building.
- Pick a project folder: `<project>/pages/<page-id>/` with `site/` (deliverable) and `work/` (everything else) per page.
- Start a preview server on the pages folder: `node <skill>/scripts/serve.mjs <project>/pages <port>` (run in the background). Links to the client are `http://localhost:<port>/<page-id>/site/index.html`.
- Write `brief.md` (from `templates/brief-template.md`) with the facts, the direction and the taste: `templates/taste.md` (house taste) + this client's reactions.

## 2. Dispatch
- One background agent per page (the Agent tool, `run_in_background: true`), all dispatched in the same message. Use the prompt in `templates/variant-dispatch.md`, filled in. Even a single page goes to an agent, so the art director stays free to review and to talk to the client.
- Tell the client in 3–5 lines what is being built and what you assumed. Don't wait silently; don't predict results.
- If the client reacts while agents run, SendMessage the running agent instead of restarting it.

## 3. Review every page when its agent reports
Don't forward the agent's report as proof. For each page:
1. `node <skill>/scripts/shots.mjs <url> <review-dir> --n 12` (add `#qa-skip-gate` or similar if the page has a gate), then open the contact sheet image and look at all 12 frames. For pinned 3D or phone stories also look at 375: `shots.mjs <url> <dir> 375 812 --n 12`.
2. Put it next to the matching sheet in `examples/good/` (same style) — it should be at that level of size, fullness and concept — and check against this list; any failure goes back to the agent:
   - **Big:** does the hero fill the screen with a huge headline? Is any frame mostly empty, or text small?
   - **Concept:** can you tell the idea from the contact sheet alone? Does scroll visibly change something in most frames?
   - **Visual:** is the drawing/photo/model large, rendered, and reading as the right object? Nothing blank, clipped, black or broken.
   - **Text:** no caption crossing the object, no faint or overlapping text, no text under the header.
   - **Not template:** no repeated section layout, no small cards in white, no dashed boxes, no pill header.
   - **Facts:** no invented numbers, reviews, prices or claims; placeholders are small tags.
   - **Footer:** a designed closing chapter (closing moment from the world, animated giant wordmark, sitemap + contact + socials in readable type, legal row), at least a screen tall — never a thin strip.
   - **Finished:** nothing that looks half-done.
3. If it fails: SendMessage the same agent with the specific frames and fixes ("frame 5: caption crosses the bud; frame 9: empty screen, bring the object in"). Up to two rounds; then show it with an honest note, or rebuild with a different concept.
4. If it passes: show the client the link, 3–6 lines on the concept and what scroll does, the launch-blocking placeholders, and the one thing you would still improve.

## 4. Learn
- Every client reaction becomes a rule in the brief's taste list; a general one ("minimal is not premium") also goes into `templates/taste.md`.
- Every agent's "what the skill didn't tell me" is read; lessons that recur go into the matching reference.
- After a round: delete leftover `ilp-prof-*` browser profiles that aren't in use, check free disk space.

**Checks that caught most send-backs in the agency rounds 7–8:**
- **The last frame (p = 1.00):** the giant footer wordmark must be whole below the header at the final scroll position — it was clipped on most pages until checked.
- **No-JS on a phone:** a full-screen phone menu sheet that only JS can close covers the whole page without JS (walk counts it as hundreds of dead steps only on a 375 --nojs run) — gate it on `html.js`; run the 375 --nojs walk.
- **Caption over the wrong image:** in carousels and walls, a caption must only ever sit over its own project; dimmed neighbours at ~35–40% (not black holes, not full brightness).
- **Frames that are only the actor or only the road** (flights, turns, lift-offs) and **half-faded captions** over the subject — the most common failures; judge on the dense 24-frame sheet too, because an even 12-frame grid can land on (or be tuned to avoid) transitions.
- **Phones at p = 1.00:** the footer wordmark must be whole on phones too — stacked columns push it off; put a second (static) wordmark after the legal row on phones.
- **Metaphors that imply a service** (print, hardware, a venue): check the footer denies it and the report flags it to the client.
- **Split-screen seams:** full-bleed chapters caught half-and-half on the sheet — ask for a stacking hand-over (see saas.md) or a colour flood, not two half screens.
- **Openings:** every pinned chart/build opens ≥ 30% built; the first object is on stage when the pin starts.
- **Tuned sheets:** if a builder says timing was set to avoid your 12 sample points, review their dense 24-frame sheet too.
- **Portfolio beats:** each project's own image must be showing while its caption is at full strength (covers, silk, lenses, flying books all open before the caption).
