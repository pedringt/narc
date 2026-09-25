# NARC Handoff

## Current status (2026-09-25)

The canonical NARC experience is the **single-workday desktop build** served at `/` and `/day.html`.

The archived one-week prototype remains at `/week.html` for reference only.

### Current working branch

- `main`: last promoted canonical build
- `notification-tutorial-keepalive-polish`: current implementation branch
- do not merge or deploy this branch without Paige explicitly naming the destination

## Product target

NARC is a short portfolio game, not a long simulation.

**Target real-world playtime: about 15 minutes.**

Rough pacing target:

- 1–2 minutes onboarding
- 8–10 minutes of decisions, coworker interruptions, NARC reactions, and tradeoffs
- 2–3 minutes escalation, payoff, and ending

The in-game clock still spans one 9:00–5:00 workday, but time is heavily compressed.

A beat should generally earn its place by doing at least one of these:

- teach a NARC rule
- force a tradeoff
- create a consequence
- reveal useful character/worldbuilding
- let the player exploit or challenge the system
- pay off an earlier choice

## Core premise

**A human employee learns to game an AI workplace-monitoring system by understanding the gap between what the system can see and what is actually true.**

The current company name is still **Meridian Supply Co.**

Paige is considering **GoodThink** as a replacement, framed as a workplace-tech company dogfooding NARC internally before client rollout. That rename is **not final**. Do not change Meridian without explicit approval.

## Current loop

`notice competing priorities → decide → act → spend time → receive work/NARC/social feedback → reprioritize`

Three forces should regularly conflict:

1. doing the actual work well
2. protecting NARC-visible productivity / personal standing
3. helping or preserving trust with coworkers

Messages should interrupt or complicate this loop, not carry the whole game.

## Canonical single-day behavior

### Desktop

The game is a fictional company laptop with:

- The Loop
- Messages
- Email
- Calendar
- Files
- Utilities
- Browser
- NARC

Wide layouts can keep up to three overlapping windows open. Close hides a window; state persists. Windows must remain reachable when dragged.

### Onboarding

The People Operations email opens first.

After **Start workday**:

- Email stays open
- Dana arrives through a Messages notification
- Dana's tutorial lives entirely in Messages
- each Dana message explains the next app and why it matters **before** the player opens it
- after the app visit, Dana sends the next notification
- the final tutorial message explicitly sends the player to The Loop to pick one of the three real responsibilities

### Work

Three starting responsibilities:

- Halcyon vendor renewal, due 11:30
- Priya client escalation, due 1:00
- Marcus project scope cut, due 3:30

Each has a fast/visible path and a slower/more substantive path.

Morning shortcuts can create afternoon rework.

### NARC

NARC maintains a **Visible Activity Index** and reacts to work traces.

The current single-day arc includes:

- baseline monitoring on login
- an immediate first read after the player's first real task
- a first-response decision
- a midmorning pattern check
- Focus Time initially protecting quiet work
- NARC 2.0 adapting after Focus Time spreads
- a later response to that adaptation

NARC should feel like an active system, not something Dana merely explains.

### Player standing

Player stakes are now lightweight and explicit without adding another meter.

Possible standing states:

- Standard
- Trusted Operator
- Review Open

A flattering visible-activity read can earn **Trusted Operator** recognition if the player leaves it standing.

A low-activity read left unchallenged can open a review.

Standing can change later options. For example, a Trusted Operator can let Dana rely on NARC's summary instead of giving a full status update, which is personally efficient but can hide bad work.

### Coworkers and Messages

Current recurring coworkers:

- Dana Whitfield
- Luis Perez
- Marcus Reed
- Priya Shah

Messages should always do useful work: teach a rule, reveal missing context, prompt a choice, warn about a consequence, unlock an action, or set up a callback.

### Notifications

Toasts show the actual notification/message preview, not generic “sent you a message” copy.

A top-bar notification center keeps recent notifications with:

- sender/source
- message preview
- time
- read/unread state
- click-through to the relevant app/thread

### Workarounds

**Focus Time**

- initially helps protect quiet work from being read as inactivity
- spreads to coworkers
- NARC 2.0 begins treating repeated Focus Time as possible gaming

**keepalive.pkg**

- arrives from Marcus after Focus Time is nerfed
- appears as an actionable attachment in Messages
- opens Utilities
- can be installed/run once
- simulated input raises visible activity
- ending can call out that NARC counted fake input as real activity

## Development / validation state

### Implemented on current branch

Tracked primarily in #84 plus the personal-stakes/message-audit work:

- notification previews
- notification history
- improved Messages sidebar previews
- explanation-before-navigation tutorial sequencing
- explicit post-tutorial handoff
- NARC button styling
- keepalive reintroduction
- lightweight player standing
- Trusted Operator reward path
- Review Open downside
- later option changed by standing
- message usefulness audit
- ~15-minute portfolio runtime target

### Still requires a human/browser gate

Do not mark these complete from source inspection alone:

- #70: at least one uncoached ~15-minute playtest
- #80 / #82 / #84: browser smoke of the actual updated desktop flow
- runtime observation, dead-air notes, overload notes, and whether the player changes strategy

## Explicitly deferred

Do not build automatically:

- #45 promotion/replay authority/settings layer
- #48 invasive personalization

These remain later backlog unless Paige explicitly reopens them.

## Realism rule

For major NARC mechanics:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

Grounded examples currently used include workstation activity, application/website usage concepts, calendar/context signals, and synthetic activity workarounds.

The game should not imply every employer uses every capability or that NARC's institutional judgments are standard industry behavior.

Public-facing claims should distinguish documented monitoring capabilities from the game's satirical extrapolation.

## Source of truth

For the active single-day build:

1. `docs/CORE_GAME_SPEC.md`
2. this handoff
3. current open GitHub issues
4. `day.js` / `day-desktop-app.js`

The archived week documentation and `week.html` are reference material only.
