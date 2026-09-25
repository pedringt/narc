# NARC Handoff

## Current status (2026-09-26)

The canonical experience is the **single-workday desktop build** at `/` and `/day.html` (`day.js`/`day-desktop-app.js`/`single-day-desktop.css`).

The archived one-week prototype remains at `/week.html` for reference only (`game.js`/`app.js`/`style.css`).

### Branch / PR state

- `main` is the only branch, at whatever commit `git log -1` shows — this file is not kept in sync with the exact SHA, don't trust a hardcoded commit hash here over `git log`
- **#86 and #87 are both done and merged** — PR #86 (tutorial advances via any real app-navigation path, verified live in browser before merging) and #87 (Dana's opening line now establishes the situation before app mechanics) are closed/merged, not pending work
- no open branches or PRs as of this writing

## Immediate work order for Claude Code

Work in this order. Do not jump to backlog features.

### 1. Run #70 as the single browser-validation gate

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

### 2. Only after #70 stabilizes the loop, consider #88

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
- #86 Advance tutorial from normal app navigation (merged to `main`, browser-verified)
- #87 Strengthen opening context (merged to `main`, browser-verified)

Their remaining browser verification (plus #86/#87's own) is consolidated into #70.

Current active issues that matter now:

- **#70** Playtest the ~15-minute core loop — the only real gate left before more code work
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
