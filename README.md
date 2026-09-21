# NARC

**Networked Assessment & Risk Coordination**

NARC is a short satirical workplace-surveillance game for Paige Edrington's AI product portfolio.

## Current direction

The player is a **human employee** inside a workplace monitored by NARC, an AI system that watches work traces and turns them into scores, classifications, and interventions.

The player gradually learns what NARC can actually observe, what it merely infers, and how to exploit the gap.

Core loop:

**NARC flags something → infer what it measures → respond or game the metric → observe the consequence → learn more about the model.**

## Portfolio target

The first real version should stay small:

- 5–8 minute run
- one short work week
- 5 funny recurring coworkers
- roughly 8 short encounters
- 3–4 coworkers central in a typical run
- repeated characters so earlier choices matter
- one decision step on screen at a time
- 1–2 increasingly invasive NARC updates
- branching coworker outcomes
- final roster/outcome recap
- a small achievement set
- replayable extreme routes

## Cast

- **Luis Perez** — restroom time becomes a productivity anomaly
- **Priya Shah** — too chatty in person and on Slack
- **Marcus Reed** — frequent lateness and increasingly ridiculous excuses
- **Nina Brooks** — refuses to take vacation
- **Maya Chen** — sarcastic high performer who resists performative AI adoption

## Realism + satire

NARC should start from recognizable workplace-monitoring ideas such as activity/idle signals, communication volume, app/tool usage, after-hours work, location/device traces, AI adoption, and behavioral anomalies.

The escalation should follow:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

The company should sound completely sincere even when the system becomes absurd.

## AI stance

The game is **about AI**, but the first version does not need live generative AI.

The current product judgment is to keep gameplay deterministic unless a future AI mechanic clearly improves the experience. Authored comedy, testable state, reliable branching, and fast portfolio play matter more than adding an LLM for its own sake.

## Current implementation status

The current deployed `prototype-v1` build is an earlier mechanical proof where the player acts as NARC reviewing employees.

That structure is now **superseded**. It is useful as a throwaway prototype, but the next implementation pass should rebuild around the human-vs-NARC exploit loop above.

See:

- `docs/CORE_GAME_SPEC.md`
- `docs/HANDOFF.md`
- GitHub issues #1–#7

## Project rule

**The institution is ridiculous. The consequences are real.**
