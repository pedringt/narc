# NARC Handoff

## Current status

NARC is in **prototype interaction redesign**.

The current `prototype-v1` build already uses the new human-vs-NARC premise: the player is an employee, the game has six deterministic encounters, and the old reviewer-player loop has been removed.

The next problem is not the core premise. It is the interaction model.

The current build still feels too much like a sequence of full-screen scenario cards with explicit game choices. The next pass should make the same logic feel like a normal workday on a fictional corporate laptop.

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

- 5–8 minute run
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
- the mouse-jiggler is a Utilities install with an On/Off switch, NARC 2.0 only catches it while it is On, and it can only be shared with Luis after you have installed it. The Culture Champion email arrives before Priya's flag (nominations open Thursday). NARC 2.0's scan waits until you have read the announcement
- deterministic engine in `game.js` (`tick(state)` / `act(state, action)`), renderer in `app.js`; `node test.mjs` covers orientation, pacing and run length, persistent notifications, active-versus-history, no auto-fallback, the NARC 2.0 beat, leads and first-contact context, carry-over, exploits, save/fire paths, achievements, ending, restart, and all 729 routes
- run length (game clock, no exploring): a brisk player about 5–6 minutes, a player who reads every hint first about 8; exploring adds to that
- QA aid: `?tick=150` in the URL speeds up the game clock
- Vercel preview redeploys from `prototype-v1`; the public production site only changes when `prototype-v1` is merged to `main`

Deferred: Nina and Maya, the remaining encounters, free-text Messages replies, multiple windows, sound, a formal NARC score for the player beyond the Visible Activity Index, final achievement set, real-world monitoring citations.


## Latest playtest conclusion

The desktop concept is working better than the old scenario-card structure, but the current build has a new primary usability problem:

> **The player often does not know what to do.**

The next pass is not "add more content." It is **clarify the loop without exposing the branch tree**.

Settled principles from the feedback round:

- **Hide the branching structure, not the available affordances.**
- **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**
- NARC should primarily talk at the player through notifications/status interruptions.
- Coworkers should provide character + missing context + diegetic clues for evasion.
- Important notifications must persist until handled/closed; closing a toast is not the same as dismissing the case.
- The opening needs a gated orientation before consequential events begin.
- The People Ops email should spell out **Networked Assessment & Risk Coordination** and plainly-but-corporately state that workplace activity is monitored.
- First-contact coworker messages must make sense without assuming the player already opened a NARC alert.
- The hidden 60-second auto-fallback is too easy to trigger while the player is legitimately investigating.
- Active NARC cases must be distinguished from passive NARC history/notices.
- The AI-learning goal is experiential: the player learns about proxies, inference, gaming, context loss, feedback loops, and authority by outsmarting NARC rather than reading explanations.

Research grounding and speculative escalation notes:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Detailed implementation notes:
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## Next recommended implementation action

Address the current first-run clarity, orientation, notification, and pacing problems before adding encounters or coworkers. Keep the existing deterministic content small while making the counterplay discoverable.

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
