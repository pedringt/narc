# NARC Handoff

## Current status (2026-09-22)

**Playable end to end and live in production at https://narc-opal.vercel.app** (`main` at `1853476`). `prototype-v1` is the working branch and is level with `main` apart from docs.

The premise, the desktop rework and the clarity pass are all **done** — do not redo them. The last pass (issue #13) covered pacing, an assessment update on every branch, the Employee 4417 prediction, and the three-part case card.

Where the build stands:

- a brisk run is about **5.3 minutes**, reading every hint about **7.1**; exploring adds to that
- after a case opens, the game points at something to do within **10 seconds** (asserted by tests)
- every branch, including "let NARC handle it", ends in a visible assessment change
- `node test.mjs` is green and covers all **2,400** routes

**What is genuinely open** is in GitHub, not here:

- **#13** stays open until Paige plays the new pacing. Two things to ask her about: whether the gap *between* incidents now feels like dead air (the pacing fix moved waiting there, `GAP` 14 → 24 s), and whether the notification rail should be reserved in the desktop layout (between 761 and 900px it still covers part of the case).
- **#6** playtest plan, **#7** handoff upkeep, **#1–#5** older framing and spec work.

Before starting anything, read `docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md`: it is the code-accurate description of the engine, the week, and the known limits.

## Current premise

**NARC — Networked Assessment & Risk Coordination**

The player is a human employee inside a workplace monitored by an AI system.

The human gradually learns:
- what NARC can actually observe
- what NARC merely infers
- which proxy metrics drive decisions
- how to create traces that make the model believe something different from reality

Core line:

> A human learns to exploit AI limitations by understanding the gap between what the system sees and what is true.

## Scope

Keep the first portfolio version small:

- about a 5–10 minute run (5–15 overall, 8–10 healthy)
- one short work week
- five funny recurring coworkers
- roughly eight encounters
- three to four coworkers central in a typical run
- repeated coworkers
- progressive one-step-at-a-time UI
- one or two NARC updates
- branching coworker outcomes
- final roster/outcome screen
- small achievement set
- deterministic first
- no live AI required

## Cast

- Luis Perez — bathroom/productivity anomaly
- Priya Shah — too chatty / communication metrics
- Marcus Reed — late/absent with escalating ridiculous excuses
- Nina Brooks — refuses vacation / “rest resistance”
- Maya Chen — sarcastic high performer / AI adoption and alignment risk

All five should be funny.

## Design principles

- NARC sees proxies, not reality.
- Monitoring data can be accurate while interpretation is wrong.
- People change behavior when they know what the system rewards.
- Earlier records can become evidence in later judgments.
- Some NARC signals should be useful; “AI is always wrong” is too easy.
- Corporate language stays sincere.
- Humor comes from human absurdity + institutional overreach.
- Do not add generative AI unless it clearly improves gameplay.

## Realism standard

For each mechanic:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

Before public portfolio publication, verify real-world monitoring claims with current sources and clearly distinguish real capabilities from invented NARC extensions.

## Source of truth

1. `docs/CORE_GAME_SPEC.md`
2. GitHub issues #1–#7
3. this handoff
4. README for project-level summary

If these conflict with the current deployed prototype, the docs/issues win.

## Current implementation

**Start with [`docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md`](handoffs/claude-rework/IMPLEMENTATION_STATE.md)**: a code-accurate description of what is built, the week's incidents and routes, decisions the implementer made, and known gaps. Where it disagrees with an older handoff, it describes the code and the older docs describe intent.

Branch:
- `main` — do not modify or promote without Paige explicitly naming `main`
- `prototype-v1` — current working/prototype branch

Current implementation (desktop rework + playtest clarity pass, on `prototype-v1`):
- the game is a persistent fictional work laptop: menu bar with clock, a Log off button and the NARC tray indicator, a dock, and Messages / Email / Calendar / Files / Utilities / NARC windows; it stacks into a tab bar on phones
- **orientation gate:** the People Operations email is open on load, spells out NARC — Networked Assessment & Risk Coordination, says it monitors activity, and asks for an acknowledgment. Dana (your manager) then asks you to check the Calendar and reply. Only after that is the first NARC case scheduled; nothing consequential runs before it
- the same human-vs-NARC week (Luis, Marcus, Priya; six incidents plus a NARC 2.0 beat; carry-over; endings; achievements) runs on a workday clock. Problems arrive as NARC notifications, messages, email and calendar changes; consequences are scheduled deliveries, spaced so nothing lands on top of anything else
- **NARC is the pressure:** notifications persist until opened or closed (closing one only hides it), at most 3 show at once (2 on phones), NARC nudges about an unresolved case, and nudges more pointedly after NARC 2.0. The tray reads `NARC · ACTION REQUIRED` only when a case really needs the player; NARC's window separates "Needs attention" from "Recent activity"
- **no hidden timers:** exploring is never treated as inaction. Doing nothing is legible: "Dismiss alert", or "Log off", which says NARC will process the open case before it does
- **you see everyone's NARC alerts but act only on your own.** Teammates' cases are view-only ("Team alerts", tray `NARC · TEAM ALERT`); helping or hurting a coworker happens through natural-language Messages replies, Dana, or actions in Files, Calendar and Utilities. Calendar-based covers (Focus time) survive NARC 2.0; keystroke fakery does not
- **counterplay is discoverable:** every first-contact coworker message carries its own setup, each incident leaves at least two leads (NARC's case, a coworker line, a "new" dot on an app), and follow-up hints disappear once you have decided
- NARC's window shows only observed signals plus its inference and confidence; the human context lives in Calendar, Files, Messages and Utilities
- the mouse-jiggler is a Utilities install with an On/Off switch, NARC 2.0 only catches it while it is On, and it can only be shared with Luis after you have installed it. The Culture Champion email arrives before Priya's flag and nominations open with it; nominating Priya early pre-empts her flag entirely. NARC 2.0's scan waits until you have read the announcement
- deterministic engine in `game.js` (`tick(state)` / `act(state, action)`), renderer in `app.js`; `node test.mjs` covers orientation, pacing and run length, persistent notifications, active-versus-history, no auto-fallback, the NARC 2.0 beat, leads and first-contact context, carry-over, exploits, save/fire paths, achievements, ending, restart, and all 2,400 routes
- run length (game clock, no exploring): a brisk player about 5.3 minutes, a player who reads every hint first about 7.1; exploring adds to that
- QA aid: `?tick=N` in the URL sets **milliseconds per game second** (so `?tick=200` is 5x speed, and the default is 1000). It is not a multiplier: `?tick=2` runs about 500x and skips past everything
- Vercel preview redeploys from `prototype-v1`; the public production site only changes when `prototype-v1` is merged to `main`

Deferred: Nina and Maya, the remaining encounters, free-text Messages replies, multiple windows, sound, a formal NARC score for the player beyond the Visible Activity Index, final achievement set, real-world monitoring citations.


## Settled principles (from the feedback rounds; all now implemented)

These came out of the round where the primary problem was "the player often does not know what to do". That pass, and the pacing pass after it, are complete — the list is kept because the principles still govern new work, not as a to-do list.

- **Hide the branching structure, not the available affordances.**
- **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**
- NARC should primarily talk at the player through notifications/status interruptions.
- Coworkers should provide character + missing context + diegetic clues for evasion.
- Important notifications must persist until handled/closed; closing a toast is not the same as dismissing the case.
- The opening needs a gated orientation before consequential events begin.
- The People Ops email should spell out **Networked Assessment & Risk Coordination** and plainly-but-corporately state that workplace activity is monitored.
- First-contact coworker messages must make sense without assuming the player already opened a NARC alert.
- No hidden auto-fallback: exploring is never treated as inaction (the old 60-second fallback is gone, and a test holds that line).
- Active NARC cases must be distinguished from passive NARC history/notices.
- The AI-learning goal is experiential: the player learns about proxies, inference, gaming, context loss, feedback loops, and authority by outsmarting NARC rather than reading explanations.

Research grounding and speculative escalation notes:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Detailed implementation notes:
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## Next recommended implementation action

**Wait for Paige's playtest of the current build before building anything new.** The open question is whether the pacing now feels right, not what to add. If she asks for work in the meantime, prefer the two decisions parked on #13 (the between-incident gap; whether to reserve a rail for notifications in the desktop layout) over new content.

Do **not** add Nina or Maya, more scenarios, more meters, hidden rules or explainer text. The target is still: easy to understand in seconds, interesting because the consequences are weird.

### How to work on this repo

- Feature work on `prototype-v1`; `main` is production and only Paige authorizes a merge, each time.
- `node test.mjs` (about 16 s) must be green before pushing. Mutation-check new rules by breaking them deliberately and confirming a test fails.
- Serve over http, not `file://`. `?tick=N` in the URL is **milliseconds per game second** (`?tick=200` is 5x), not a multiplier.
- The static preview server serves `style.css` from cache: force a fresh fetch before trusting any CSS check.
- Vercel is on the shared Hobby budget, so batch work and avoid unnecessary production builds.

Detailed UX source of truth: `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## AI stance

The game can demonstrate AI product learning without containing a live model.

Portfolio value can come from:
- proxy metrics
- false positives
- Goodhart-style metric gaming
- feedback loops
- behavioral adaptation
- human oversight problems
- overconfident automation
- escalating authority
- deliberate choice not to use an LLM where deterministic software is better

## Separate project boundary

NARC is separate from `pedringt/tell-me-what-you-remember`.

Carry forward only broad design ideas:
- partial traces vs reality
- AI inference is not truth
- recurring humans
- actions affect future evidence
- consequences without one universal correct answer

Do not import Evelyn-specific canon, elder-care material, or that prototype's structure.

## Authority boundaries

- Review/feedback does not authorize edits.
- Paige must explicitly authorize implementation after a feedback round.
- Do not push/merge to `main` unless Paige explicitly names `main`.
- Do not deploy to production unless Paige explicitly names production/public release.
- Preview deployment is separate from production promotion.


## Claude Code rework bundle

For a fresh Claude Code implementation chat, use:
- `docs/handoffs/claude-rework/HANDOFF.md`
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`
- `docs/handoffs/claude-rework/AGENT_PROMPT.md`
- `docs/handoffs/claude-rework/ACCEPTANCE_CRITERIA.md`

This bundle is intentionally more implementation-detailed than this project-level handoff and should be treated as the starting context for the next prototype rewrite.


## Current product direction: fun first, simple, visibly AI-driven

Latest direction from Paige:

- The game still needs to feel more fun/interesting and less passive.
- Do **not** solve that by adding more notifications, more prose, more meters, or a complicated simulation.
- Keep the core interaction extremely simple: **NARC judges → player changes something → NARC visibly updates → consequence follows.**
- The player should feel like they are reverse-engineering and exploiting an AI system, not reading a branching story.
- Every major incident should ideally include at least one satisfying action that changes what NARC believes.
- AI concepts should surface through the mechanic, not educational copy.

Preferred AI arc across the week:

1. NARC watches.
2. NARC infers.
3. NARC adapts to a workaround.
4. NARC predicts future behavior.
5. NARC gains authority and acts.

Keep the vocabulary light: **confidence, prediction, pattern detected, assessment updated** are enough. Avoid turning the NARC window into an ML dashboard.

Per incident, aim for one judgment, a small amount of context, 2–3 actions, one visible model reaction, and one consequence.

The Stanley Parable is a useful tonal/design reference for the feeling that the system notices what the player is doing and confidently reinterprets it. Do not copy the narrator structure. Use the principle: **the system watches the player's choices and keeps trying to explain them back to the player.**
