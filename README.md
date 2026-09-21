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

`prototype-v1` is a human-vs-NARC vertical slice played on a fictional work laptop. You are Employee 4417. NARC is monitoring software on that laptop, and it watches you and three coworkers (Luis, Marcus, Priya) across one work week.

- you start with a short orientation: the People Operations email introducing NARC, then your manager Dana asking you to check your Calendar
- there are no scenario cards: problems arrive as NARC notifications, messages, email and calendar changes, and consequences arrive the same way
- NARC is the pressure (persistent, increasingly pushy notifications); coworkers and the other apps are the counterplay
- NARC's window shows what it *observed* and what it *inferred*; the real human context is in Calendar, Files, Messages and Utilities
- six incidents plus a mid-week NARC 2.0 update; Luis and Marcus each return, and what you did before decides what comes back
- nothing is decided by a hidden timer: dismiss an alert, or log off and NARC processes it (the game tells you first)
- 6 achievements and an end-of-week report
- deterministic, no live AI, no backend

| Situation | Things you can actually do |
|---|---|
| Your own low activity | dismiss the alert · type a note in NARC · install the Mouse Activity Helper in Utilities and switch it on |
| Luis | agree with NARC's flag · dismiss it · attach the helper in Messages (once you have installed it) · (later) attribute the script, randomize his copy, or ask your manager to relabel his time |
| Marcus | confirm the location trace · dismiss · add a calendar event on the team calendar · (later) endorse, report documents, or attach the trace |
| Priya | ask her to cut back in Messages · nominate her in the Culture email · dismiss |

Run the tests with `node test.mjs`. Serve the folder statically to play it (ES modules need http, not file://). Add `?tick=150` to the URL to speed up the game clock for QA.

Nina and Maya are not in this slice. See `docs/handoffs/claude-rework/` for the scope and acceptance criteria.

## Project rule

**The institution is ridiculous. The consequences are real.**
