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

Branch:
- `main` — do not modify or promote without Paige explicitly naming `main`
- `prototype-v1` — current working/prototype branch

Current implementation (first rework pass, on `prototype-v1`):
- human-vs-NARC vertical slice: 6 encounters + 1 NARC 2.0 update, three coworkers (Luis, Marcus, Priya)
- deterministic engine in `game.js` (`act(state, controlId)` / `view(state)`), thin renderer in `app.js`, `node test.mjs` covers progression, carry-over, exploits and their consequences, fire/save paths, achievements, ending, restart, and all 729 choice combinations
- the old reviewer-player loop is removed
- Vercel preview redeploys from `prototype-v1`

Deferred: Nina and Maya, the remaining encounters, a formal NARC score for the player beyond the Visible Activity Index, final achievement set, real-world monitoring citations.

## Next recommended implementation action

Rework the current six-encounter prototype into a **persistent work-desktop experience**.

The desktop/workspace should stay visible while:
- NARC issues alerts
- People Operations sends email
- coworkers and the manager use Messages
- Calendar/Work surfaces reveal human context
- utilities provide concrete actions such as installing/enabling the mouse-jiggler
- consequences arrive through notifications, Messages, Email, Calendar, or app state

The deterministic branch structure can remain underneath, but the player should rarely see abstract `What do you do?` choice menus.

Detailed UX source of truth:
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

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
