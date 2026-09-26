# NARC

**Networked Assessment & Risk Coordination**

NARC is a short satirical workplace-surveillance game for Paige Edrington's AI product portfolio.

## Current product

The canonical build is a **single 9:00–5:00 workday compressed into about 15 minutes of real playtime**.

The player is Employee 4417, working on a fictional company laptop while NARC turns visible work traces into productivity judgments.

The game is deterministic/authored-first. It does not require a live LLM.

## Premise

> A human learns to game an AI workplace-monitoring system by understanding the difference between what the system sees and what is actually true.

The core tension is between:

- doing the real work well
- looking productive to NARC
- helping or preserving trust with coworkers

## Core loop

**notice competing priorities → decide → act → spend time → receive work/NARC/social feedback → reprioritize**

NARC should be learnable and gameable.

The player should discover through play that:

- proxies are not the real goal
- missing context changes interpretation
- people optimize what gets measured
- anti-gaming systems create an arms race
- institutional trust can make a bad inference consequential

## Workstation

The game uses a fictional corporate desktop with:

- The Loop
- Messages
- Email
- Calendar
- Files
- Utilities
- Browser
- NARC

The archived one-week prototype remains available at `week.html` for historical reference only.

## Current single-day mechanics

Three starting responsibilities create visible-vs-substantive work tradeoffs:

- Halcyon vendor renewal
- Priya client escalation
- Marcus project scope decision

NARC reacts to the player's work with a Visible Activity Index and explicit interpretations.

Current counterplay includes:

- Focus Time, which initially protects quiet work
- NARC 2.0 adapting after Focus Time spreads
- `keepalive.pkg`, a mouse-jiggler-style workaround Marcus sends after the adaptation

Player standing is deliberately lightweight:

- Standard
- Trusted Operator
- Review Open

A flattering NARC read can benefit the player personally, even if the work behind it was weak.

## Portfolio target

A healthy first run should be roughly:

- **1–2 minutes:** onboarding
- **8–10 minutes:** work decisions, interruptions, NARC reactions, tradeoffs
- **2–3 minutes:** escalation and ending

Do not add content just to make the simulated workday longer.

## Realism + satire

Design rule:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

The early game draws from recognizable monitoring concepts such as workstation activity, application/website usage, idle/activity signals, and work-pattern metadata.

NARC's classifications, rewards, and institutional responses are fictional satirical extrapolations.

The game should not imply that every employer uses every capability or that real monitoring products make NARC's exact judgments.

Research notes live in `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`.

## Current development

The active polish branch is:

`narc-polish-status-redesign-sept25`

Draft PR: **#101 — Redesign NARC status and clarify interaction hierarchy**

This pass makes NARC's system state easier to understand:
- persistent NARC intervention-risk status
- Visible Activity shown as X/100 with Low / Normal / High meaning
- evidence -> inference -> consequence -> action detail flow
- concrete response labels instead of generic “Add context”
- clearer event history / notifications
- required message actions take priority over optional conversation
- optional conversation prompts remain visible but disabled while a reply is being typed
- callback dialogue only appears after the relevant story beat

Do not merge to `main` or deploy production without Paige explicitly naming that destination.

Human/browser validation is still required. See:
- `docs/HANDOFF.md`
- `docs/PLAYTEST_CHECKLIST.md`
- GitHub issue #70

## Deferred

Do not automatically add:

- promotion/replay authority and NARC settings
- invasive personalization
- a large employee simulation
- live AI just for portfolio signaling

## Project rule

**The institution is ridiculous. The consequences are real.**
