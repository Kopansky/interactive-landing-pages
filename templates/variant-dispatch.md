# Dispatch prompt for one variant agent

Send one of these per variant, all in the same message so they run in parallel. Fill every <slot>.

---
Build the **<VARIANT NAME>** variation of the <client> landing page.

1. Read the brief first: <absolute path>/brief.md — every rule in it is mandatory. Work only in <scratch>/<variant-slug>/ and never delete anything outside it.
2. Load the `interactive-landing-pages` skill and follow its build + verification steps. (Also load `<extra skill>` if relevant.)
3. <IF BRAND> Research <brand> per the skill's brand-research reference (Mobbin queries + live site in your own headless browser), write research-<brand>.md, then build from it.
4. Concept: <one paragraph — the spine, what each chapter shows, what scroll does>. It must differ from: <list existing variants>.
5. Output: <absolute path>/<file>.html (title "<client> · <Variant>").
6. Verify with the skill's walk script at 1440×900 and 375×812 (+ --reduce, --nojs), fix, re-run.

Reply with: file path; concept and how scroll drives it; checks run and results; any NEW wording not verbatim from the brief (for the client to approve). Don't paste HTML.
---

Rules for the dispatcher:
- 4–6 agents per round is the sweet spot; each costs ~400–600k tokens and 25–45 min.
- Name concepts far apart in round one; narrow to hybrids of what the client liked afterwards.
- When the client reacts mid-round, SendMessage the running agents instead of restarting them.
- After the round: check free disk space and delete leftover browser profiles older than the running agents.
