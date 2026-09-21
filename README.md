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

`prototype-v1` is now a human-vs-NARC vertical slice: you are Employee 4417, and NARC watches you and three coworkers (Luis, Marcus, Priya) across one work week.

- 6 encounters plus one mid-week NARC 2.0 update; Luis and Marcus each return once
- what you did to a coworker (and whether NARC 2.0 can detect it) changes their return encounter
- one step per screen: signal, look closer (one optional evidence pull), choose, result, reaction
- 6 achievements, a per-coworker outcome screen, and a "what you know about NARC" list
- deterministic, no live AI, no backend

Run the tests with `node test.mjs`. Serve the folder statically to play it (ES modules need http, not file://).

Nina and Maya are not in this slice. See `docs/handoffs/claude-rework/` for the scope and acceptance criteria this pass followed.

## Project rule

**The institution is ridiculous. The consequences are real.**
