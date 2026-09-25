# NARC Handoff

## Current status (2026-09-25)

The canonical experience is the **single-workday desktop build** at `/` and `/day.html`.

The archived one-week prototype remains at `/week.html` for reference only.

### Branch / PR state

- `main` is the last promoted canonical build at commit `00de4abc23449bed421b7d137cdf437100595f01`
- active branch: `tutorial-progress-by-app-open`
- active draft PR: **#86 — Advance tutorial from normal app navigation**
- PR #86 has a READY Vercel preview:
  - `https://narc-ap82m72ce-cairn10.vercel.app`
- do **not** merge to `main` or promote production without Paige explicitly naming that destination

## Immediate work order for Claude Code

Work in this order. Do not jump to backlog features.

### 1. Verify PR #86 in the browser

PR #86 fixes a tutorial bug where Dana's sequence only advanced if the player clicked the shortcut button inside her message.

Expected behavior now:

- opening the expected app from the dock advances the tutorial
- focusing an already-open expected app advances the tutorial
- Dana's shortcut button still works
- the same step never advances twice
- The Loop, Files, Calendar, NARC, and the final return to The Loop all work through normal navigation

If browser verification finds a regression, fix it on the active branch and document it in PR #86.

### 2. Implement #87 — strengthen opening context

Current first Dana message is too mechanics-first.

The opening should establish this mental model before teaching specific apps:

> I work here -> a new workplace AI is being piloted -> it is monitoring me -> I still have a normal job -> Dana is helping me get situated.

Required context, kept concise:

- Dana is the player's manager
- Employee 4417 is an Operations Associate
- Meridian is piloting NARC internally
- NARC is an AI workplace-monitoring / assessment system
- it watches observable work traces and converts them into employee assessments
- the player still has three normal work responsibilities today
- Dana is helping the player get oriented

The People Operations email can reinforce this, but Dana's first message should stand on its own.

A useful copy direction is:

> Hi, Dana here — your manager. Meridian is piloting NARC, a new AI system that watches how work gets done and turns those signals into employee assessments.
>
> You've still got your normal job today: three things need your attention, and I'll get you oriented before NARC starts making too many assumptions. Start with The Loop.

Exact wording can change if a shorter version reads better.

**Do not rename Meridian.** GoodThink is only a candidate and has not been approved.

### 3. Run #70 as the single browser-validation gate

#70 is now the consolidated human/browser gate for the current game.

Target real-world playtime: **about 15 minutes**.

Pacing target:

- 1–2 minutes onboarding/tutorial
- 8–10 minutes decisions, interruptions, NARC reactions, and tradeoffs
- 2–3 minutes escalation/payoff/ending

Record:

- total runtime
- tutorial runtime
- any “what do I do now?” moments
- dead air vs overload separately
- repeated reliance on **Work until...**
- whether the player changes strategy
- whether Focus Time -> NARC adaptation -> keepalive feels causally connected
- whether the ending feels like payoff
- whether the player can explain actual work vs NARC-visible work without prompting

Be ruthless about filler. A beat should generally do at least one of:

- teach a NARC rule
- force a tradeoff
- create a consequence
- reveal useful character/worldbuilding
- let the player exploit/challenge the system
- pay off an earlier action

If the playtest exposes problems, create focused issues rather than reopening broad old implementation issues.

### 4. Only after #70 stabilizes the loop, consider #88

#88 tracks lightweight Vercel Web Analytics custom events.

Do not instrument the current unstable flow first.

Possible later events include:

- `game_started`
- `tutorial_completed`
- `first_task_selected`
- meaningful fast vs careful work choice
- NARC assessment challenged / left standing
- `focus_time_used`
- `keepalive_used`
- Trusted Operator reached
- Review Open reached
- `game_completed`
- completion duration / broad ending
- replay started, if replay exists later

Guardrails:

- anonymous only
- no PII
- no message contents
- no free-text player data
- do not instrument every click

## GitHub cleanup status

Closed as implementation-complete:

- #80 Repair single-day opening, desktop window behavior, and midmorning pacing
- #82 Refine onboarding, NARC presence, and quiet-time flow
- #84 Polish notifications, tutorial handoff, NARC actions, and keepalive

Their remaining browser verification is consolidated into #70.

Current active issues that matter now:

- **#70** Playtest the ~15-minute core loop
- **#87** Strengthen opening context
- **#88** Add lightweight Vercel gameplay analytics after the core loop stabilizes

Deferred backlog:

- **#45** promotion/replay authority/settings
- **#48** invasive personalization

Do not implement #45 or #48 automatically.

## Product target

NARC is a short portfolio game, not a long simulation.

Core premise:

**A human employee learns to game an AI workplace-monitoring system by understanding the gap between what the system can see and what is actually true.**

Core loop:

`notice competing priorities -> decide -> act -> spend time -> receive work/NARC/social feedback -> reprioritize`

Three forces should regularly conflict:

1. doing the actual work well
2. protecting NARC-visible productivity / personal standing
3. helping or preserving trust with coworkers

Messages should interrupt or complicate the loop, not carry the whole game.

## Canonical single-day behavior

### Desktop

The fictional company laptop contains:

- The Loop
- Messages
- Email
- Calendar
- Files
- Utilities
- Browser
- NARC

Wide layouts can keep up to three overlapping windows open. Window state persists and dragged windows must remain reachable.

### Work

Three starting responsibilities:

- Halcyon vendor renewal, due 11:30
- Priya client escalation, due 1:00
- Marcus project scope cut, due 3:30

Each offers a fast/visible path and a slower/more substantive path.

Morning shortcuts can create afternoon rework.

### NARC

NARC maintains a **Visible Activity Index** and reacts to observable work traces.

Current arc includes:

- baseline monitoring
- first read after first real task
- response choice
- midmorning pattern check
- Focus Time initially protecting quiet work
- coworkers adopting Focus Time
- NARC 2.0 adapting to repeated Focus Time
- `keepalive.pkg` arriving as a more aggressive workaround

NARC should feel like an active system, not something Dana merely explains.

### Player standing

Possible states:

- Standard
- Trusted Operator
- Review Open

A flattering visible-activity read can earn Trusted Operator if left standing.

A low-activity read left unchallenged can open a review.

Standing changes later options, including whether Dana can rely on NARC's summary instead of hearing the real status.

### Workarounds

**Focus Time**
- initially protects quiet work
- spreads to coworkers
- NARC adapts and begins treating repeated use as gaming

**keepalive.pkg**
- arrives from Marcus after Focus Time is nerfed
- appears as an actionable Messages attachment
- opens Utilities
- can be installed/run once
- simulated input raises visible activity
- ending can call out that NARC counted fake activity as real

## Vercel state

Project: `narc` under the Pallas team.

Useful current setup:

- Git branch preview deployments are working
- production `main` deployment is READY
- no runtime errors were found in the recent 7-day check
- Pallas Spend Management is set to a **$10** on-demand budget
- Paige turned **Pause** on at the budget threshold

Pro features worth using for NARC:

- preview deployments for QA
- Web Analytics / custom gameplay events after the loop stabilizes

Not currently worth adding:

- Fluid Compute
- AI Gateway
- rolling releases
- extra server-side infrastructure
- Speed Insights specifically for NARC

NARC is mostly client-side and deterministic right now.

## Realism rule

For major NARC mechanics:

**real capability -> plausible inference -> ridiculous institutional response -> exploitable weakness**

Grounded examples include workstation activity, application/website usage concepts, calendar/context signals, and synthetic activity workarounds.

Do not imply every employer uses every capability or that NARC's institutional judgments are standard industry behavior.

Public case-study claims should distinguish documented monitoring capabilities from satirical extrapolation.

## Source of truth

For the active single-day build:

1. `docs/CORE_GAME_SPEC.md`
2. this handoff
3. current open GitHub issues
4. `day.js` / `day-desktop-app.js`

The archived week documentation and `week.html` are reference only.
