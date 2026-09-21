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

- roughly 5–15 minutes for a first run
- one short authored work week
- three current recurring coworkers (Luis, Marcus, Priya)
- six main incidents plus a mid-week NARC 2.0 escalation
- repeated characters so earlier choices matter
- progressive disclosure: apps appear when the player has a reason to understand them
- choices expressed through normal workstation actions instead of story-menu buttons
- branching coworker and player outcomes
- final roster/outcome recap
- seven achievements
- replayable alternate/extreme routes

## Cast

- **Luis Perez** — restroom time becomes a productivity anomaly
- **Priya Shah** — too chatty in person and on Slack
- **Marcus Reed** — frequent lateness and increasingly ridiculous excuses
- **Nina Brooks** — future scenario-bank character: refuses to take vacation
- **Maya Chen** — future scenario-bank character: sarcastic high performer who resists performative AI adoption

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
- 7 achievements and an end-of-week report
- deterministic, no live AI, no backend

NARC shows everyone's alerts to everyone, "for transparency", but you can only act directly on your own cases. You help or hurt coworkers through natural-language Messages replies, Dana, and ordinary actions in Calendar, Files and Utilities. The branch structure stays hidden even when the available affordances are visible.

| Situation | Things you can actually do |
|---|---|
| Your own low activity | dismiss the alert · type a note in NARC · install the Mouse Activity Helper and switch it on · show your contract block as Focus time in Calendar |
| Luis | suggest Focus time · suggest explaining it to NARC · attach the helper (once installed) · confirm or decline Dana's question · later: attribute the script or randomize his copy · relabel his time via Dana · send Dana his ticket output |
| Marcus | suggest adding a calendar entry now or later · add the calendar entry yourself · tell Dana the trace conflicts with his story, add missing context, or decline to confirm · later: endorse/report his documents · send Dana the sanctuary slip · backdate an entry |
| Priya | suggest an in-person sync · suggest posting less · nominate her from the Culture email; following the wrong metric can eventually get her fired |
| Doing nothing | log off for the day: NARC processes what is still open, and the game tells you first |

Run the tests with `node test.mjs`. Serve the folder statically to play it (ES modules need http, not file://). Add `?tick=150` to the URL to speed up the game clock for QA.

For a code-accurate picture of the build (architecture, the week's routes, decisions, known gaps), see `docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md`.

Nina and Maya are not in this slice and remain future scenario-bank ideas. See `docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md` for the code-accurate current build, and `docs/CASE_STUDY_NOTES.md` for the living portfolio/case-study record.

## Project rule

**The institution is ridiculous. The consequences are real.**
