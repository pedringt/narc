# NARC Handoff

## Current status (2026-09-27)

**The full #102–#106 expansion is merged to `main` (commit `1caa754`) and Paige is playing it now.** There is nothing left to implement until she reports back from that playtest (#70) — do not start new feature work speculatively.

The canonical experience is the **single-workday desktop build** at `/` and `/day.html`.

Active implementation:
- `day.js` — deterministic game/state engine
- `day-desktop-app.js` — desktop UI and interaction layer
- `single-day-desktop.css` — single-day integration/polish styles
- `test-day.mjs` — engine/regression checks
- `test-desktop.mjs` — source-level desktop integration checks

The old one-week build remains at `/week.html` only as an archive/reference.

## Branch / PR state

- `main` is the **only branch** in the repo (all feature branches, including `game-copy-export-sept26`, were merged/deleted after landing).
- `docs/GAME_COPY_EDITABLE.md` merged to `main` along with everything else — it's the current source for the copy-review workflow below, not stuck on a stale branch.
- All three test suites (`test.mjs`, `test-day.mjs`, `test-desktop.mjs`) are green on `main` as of this commit.
- Do not merge/push/deploy anything to `main` or production unless Paige explicitly names that destination in the current instruction — same rule as always, just noting nothing is currently pending that decision.

## Copy editing workflow

Paige asked for a single editable file containing the game's current dialogue/text.

Use:
- `docs/GAME_COPY_EDITABLE.md`

It contains:
- dialogue
- NARC/system copy
- tutorial text
- emails
- task descriptions
- player choice/button labels
- Browser article copy
- endings/outcomes
- visible UI text

Format:
- **Source**
- **Current text**
- **Edited text**

Workflow:
1. Paige edits only the **Edited text** column.
2. Blank means no change.
3. `DELETE` means remove the line.
4. `NEW` rows may be added for new copy.
5. When the edited file comes back, apply only the approved copy edits to the canonical source files.
6. Preserve dynamic placeholders such as `${state.index}`, `${risk.label}`, and `${clock(...)}` unless Paige intentionally requests implementation changes too.
7. Treat copy review as separate from gameplay/system redesign.

## What PR #101 changed

This pass responds to Paige's latest live playtest feedback.

### NARC status is now legible at a glance

The old headline `VISIBLE ACTIVITY INDEX 61` was not self-explanatory.

New hierarchy:
1. persistent **NARC status** in the top bar
2. derived intervention-risk meter: NORMAL / WATCHING / AT RISK / CRITICAL
3. click NARC for the explanation
4. Visible Activity remains a secondary signal shown as `X/100` plus a plain-English band

Important: the risk meter is **derived UI**, not a new hidden morality/performance score. It summarizes NARC's current intervention pressure from existing state.

Visible Activity bands:
- 0–49: Low visible activity
- 50–74: Normal visible activity
- 75–100: High visible activity

The UI explicitly says Visible Activity measures observable workstation activity, **not work quality**.

### NARC detail screen was redesigned

The NARC screen now answers four questions in order:

- **WHAT NARC SAW**
- **WHAT NARC INFERRED**
- **WHAT THAT CHANGES**
- **WHAT YOU CAN DO**

This is the key mental model for the product. Evidence and inference must stay visibly separate.

Active NARC decisions use concrete action labels instead of generic “Add context,” for example:
- Explain the quiet file review
- Explain that the fast work was rushed
- Explain the quiet work NARC missed
- Explain what the activity score missed
- Explain why Focus Time spread

Recent NARC history is now a categorized event timeline (Observation / Review / Recognition / System Update / Consequence).

NARC toast notifications now include the current NARC status and explicitly direct the player to open NARC for evidence/inference/action details.

### Message action hierarchy was tightened

Rule:
- if a tutorial step or required request is active in a person's thread, show the required action(s) only
- optional “Start a conversation” prompts return when nothing required is waiting
- while a coworker is typing, unused optional prompts remain visible but disabled/dimmed instead of disappearing
- after the reply lands, they become active again

This prevents optional banter from competing with progression.

### Context-aware dialogue

Dana's “Usually the raccoon is metaphorical” line only fires after Marcus's raccoon story has actually occurred.

Before that beat, Dana answers:
> No. Usually the chaos is less coordinated.

General rule: callback jokes must respect what the player has actually seen.

## Current gameplay shape

Target real-world first run: about **15 minutes**.

- 1–2 minutes onboarding
- 8–10 minutes work decisions, interruptions, social choices, and NARC reactions
- 2–3 minutes escalation/payoff/ending

The day remains one deliberately busy 9:00–5:00 workday. Do not return to a multi-day structure.

### Recurring coworker patterns

These must feel established before NARC turns them into cases:

- **Marcus** — repeatedly late/missing things, often with plausible context; raccoon/transit evidence is one incident in an existing pattern
- **Luis** — repeatedly away from his desk / bathroom breaks; NARC reduces low-input stretches to “presence irregularities”
- **Priya** — genuinely chatty and highly collaborative; NARC flattens client work, onboarding, and social chatter into “Communication Load”

The interesting design is ambiguity: NARC often has a real signal but lacks enough context to judge what the signal means.

### Player complicity

The player can:
- challenge NARC
- accept flattering NARC interpretations
- game NARC
- protect coworkers
- decline to intervene
- weaponize NARC against coworkers

Do not simplify the game into “AI bad / resist AI.” Player incentives and institutional trust are part of the point.

### Adaptive system arc

Focus Time:
- initially protects quiet work
- coworkers learn the workaround
- usage spreads
- NARC 2.0 reinterprets repeated Focus Time as possible gaming

Then Marcus can send `keepalive.pkg`, which produces synthetic activity NARC can count as real visible input.

This is a compact playable feedback loop: users adapt to the model; the model adapts to users.

## Immediate next steps

**#105, #103, #102, #104, and #106 are all done and merged to `main`.** The section below (kept for reference) was the plan going in; every item in it shipped. Do not re-implement any of it — read "What #102–#106 actually shipped" further down for what's real, and diff against `day.js`/`day-desktop-app.js` if in doubt.

**The only real next step is #70** — a full ~15-minute playthrough by Paige. That's happening now, outside this repo. Nothing else should start until she reports back with what she hit. If she comes back with specific friction, turn it into scoped issues rather than a new broad redesign pass — that's the pattern that worked for #105-#106 (audit what exists before building, fix the 1-2 real gaps, verify live, stop).

**#88 (analytics)** stays blocked until then. **#45 and #48** stay explicitly deferred — do not implement without Paige asking.

<details>
<summary>Original recommended implementation order (historical — all shipped)</summary>

1. **#105 — Simplify the NARC tool for instant comprehension**
   - This is first because every later mechanic depends on the player understanding what NARC saw, inferred, missed, changed, and expects next.
   - Preserve the current derived status model. Do not add another hidden score.
   - Add/strengthen **WHAT NARC CANNOT SEE** where the player has relevant context.

2. **#103 + #102 — Make NARC overhead and urgency meaningful**
   - Treat these together as the time-management layer.
   - NARC compliance should consume authored in-game minutes.
   - Hard/soft urgency should use **in-game time only**. Never punish real-world reading time.
   - Make time costs visible enough that the player can deliberately triage work, coworkers, and NARC.

3. **#104 — Deepen coworker consequences and moral compromise**
   - Build on the existing Priya/Luis/Marcus cases.
   - Let ordinary workplace actions protect, expose, exploit, or ignore coworkers.
   - Do not present universal help/sabotage/ignore morality buttons.
   - Preserve ambiguity: NARC often has a real signal but incomplete context.

4. **#106 — Rebuild the end-of-day dashboard**
   - Implement after the underlying time/coworker state exists.
   - Surface actual work, NARC-management overhead, meaningful coworker outcomes, Visible Activity/standing, and the contradiction between measured success and real outcomes.
   - There is **no clean win**, but do not force one universal "you lose" conclusion.

5. **#70 — Full ~15-minute playtest**
   - Re-run the complete experience after the expansion work.
   - Validate comprehension, pacing, tradeoffs, coworker consequences, and ending payoff.
   - Cut or tighten before adding more.

6. **#88 — Analytics**
   - Still blocked until #70 stabilizes the revised loop.

</details>

### What #102–#106 actually shipped

Audited what already existed before building anything new in every case — most of the acceptance criteria for each issue turned out to already be satisfied by earlier passes (#99–#101). Only the real gaps got new code:

- **#105**: added a "WHAT NARC CANNOT SEE" row to every NARC assessment (between INFERRED and CHANGES) — the one genuinely missing piece; everything else in the issue was already built.
- **#103**: NARC-overhead time was already real (narcFirstReview/narcCheckpoint/narcResponse already cost 5-10 min and already competed with deadlines) — it just wasn't tracked. Added `s.time = { work, narc, social, gamed }`, categorized every time-spending action, surfaced it in the ending.
- **#102**: each pending task in The Loop now shows "N min left" plus a draining progress bar, in-game clock only, no reflex pressure.
- **#104**: coworker cases already existed; added a real mechanical payoff for reporting on coworkers (a one-time Visible Activity bump at the second report, not per-instance) and made trust from earlier choices change what happens when you stay out of a later coworker's case.
- **#106**: replaced the flat `ending().lines` text dump with four real sections in the end screen — Your day, NARC metrics, People, The contradiction — each collapsing away when empty. `ending()` keeps returning `lines` unchanged for backward compatibility; the new structured fields (`timeBreakdown`, `standing`, `peopleList`, `contradictions`) are additive.

All three test suites green throughout, every new rule mutation-checked, every change verified live in browser (desktop + mobile, no console errors) before merging.

### Settled expansion direction

NARC is becoming a short **moral-compromise and time-triage simulator**, not a larger narrative game.

The player should regularly feel tension between:
- doing actual work
- maintaining NARC-visible productivity / personal standing
- helping or protecting coworkers
- spending time managing NARC itself

NARC concepts should be learned through system behavior and consequences, not tutorial lectures.

The NARC interface itself must remain easy to understand even when NARC's *voice* is bureaucratic.

### Parallel copy-review track

Paige may edit `docs/GAME_COPY_EDITABLE.md` at any time. Treat that as a separate copy pass. Do not silently combine those edits with gameplay/system redesign.

## Verification state

`main` @ `1caa754` (the #102-#106 merge) has all three suites green: `node test.mjs`, `node test-day.mjs`, `node test-desktop.mjs`. Every change in that range was also verified live in browser (desktop + mobile widths, no console errors) before merging — this was run locally with real Node, not inferred from a Vercel build.

If a future session can't run local Node, say so explicitly rather than claiming a pass based on build status alone.

## GitHub issue state

Completed and merged to `main`:
- **#87** opening context
- **#101** NARC status / interaction hierarchy redesign
- **#105** Simplify the NARC tool for instant comprehension
- **#103** Make NARC overhead a real gameplay cost
- **#102** In-game urgency timers for consequential decisions
- **#104** Deepen coworker consequences and moral compromise
- **#106** Rebuild the end-of-day dashboard around tradeoffs and consequences

In progress, outside this repo:
- **#70** Playtest the ~15-minute core loop — Paige is playing it now; nothing else should start until she reports back

Blocked until #70 stabilizes:
- **#88** lightweight Vercel gameplay analytics

Deferred, do not implement automatically:
- **#45** promotion/replay authority/settings
- **#48** benignly invasive personalization

## Authority / release boundaries

- GitHub may be used to inspect and implement branch work.
- Do not merge or push to `main`, deploy production, or publish externally unless Paige explicitly names that destination in the current instruction.
- Implementation approval is not production approval.
- Preserve unrelated work and existing branches.
- Never request or store raw credentials. Use available platform/brokered access.

## Start here

1. Read `docs/CORE_GAME_SPEC.md`.
2. Read this handoff, especially "Current status" and "GitHub issue state" at the top — #105/#103/#102/#104/#106 are done, not a to-do list.
3. Check whether Paige has reported back on the #70 playtest. If not, don't start new feature work — ask, or do read-only investigation at most.
4. If she has reported friction, read the specific issue(s) she wants addressed and scope narrowly to those, the same way #105-#106 were each scoped to their real gaps rather than a rebuild.
5. Inspect `day.js`, `day-desktop-app.js`, `single-day-desktop.css`, `test-day.mjs`, and `test-desktop.mjs` directly — this doc can drift, the code is the source of truth for current behavior.
6. Run all three suites and verify live in browser before claiming anything is done.

## Portfolio / case-study framing worth preserving

Strong thesis:

> NARC is a playable systems-design experiment about what happens when organizations turn observable proxies into judgments, and people begin adapting to the measurement system.

Important case-study themes:
- ambiguous evidence rather than cartoonishly wrong AI
- player incentives and complicity
- model/user feedback loops
- human review as both safeguard and possible failure point
- explainability as interaction design, not a documentation paragraph
- proxy metrics / Goodhart-style behavior taught through play
- deliberate compression from a larger multi-day idea into a short portfolio experience
- live playtesting changed mechanics and pacing, not just visual polish
- humor makes serious AI-system behavior approachable without turning the game into a lecture

AI-assisted creation should be attributed accurately:
- Paige made the product/game decisions, playtested, selected what to keep/cut, and directed scope/tone
- AI tools helped explore design space, inspect/recover prior mechanics, draft variants, implement code, perform QA, and maintain documentation
- NARC is authored/deterministic-first; a live LLM is not required for the game mechanic

## Source of truth

For the active build, use this order:
1. `docs/CORE_GAME_SPEC.md`
2. `docs/HANDOFF.md`
3. current open GitHub issues
4. `day.js` / `day-desktop-app.js`
5. `docs/CASE_STUDY_NOTES.md`

The archived week build and old issue descriptions are reference material only.
