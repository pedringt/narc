# NARC Desktop Interaction Rework

## Why this exists

The current human-vs-NARC prototype proves the state logic, comedy, proxy-metric concept, and carry-over. Its biggest remaining weakness is interaction framing.

Right now the player still moves through a sequence of full-screen scenario cards:
- scenario appears
- click “Look closer”
- read what NARC sees/infers
- choose from large story-choice buttons
- read a result screen
- click Continue
- move to the next encounter

That feels like interactive fiction or a terminal choice game.

The next rework should make the same branching logic feel like **using a work computer during a normal workday**.

## Core UX decision

> **The desktop is the game board.**

The player should remain inside one persistent fictional work laptop/workspace for most of the game.

The game should not normally ask “What do you do?”

Instead, the player's actions in fake work apps become the choices.

## Target feeling

The player should feel like:
- they arrived at work
- NARC was quietly rolled out by the company
- normal messages/emails/tasks continue
- NARC starts surfacing alerts
- coworkers ask for help
- the player learns what NARC watches
- the player starts gaming those measurements
- NARC gradually becomes more invasive

The experience should feel closer to a tiny workplace-system simulation than a sequence of text encounters.

## Opening flow

Recommended opening:

1. Show the desktop/workspace immediately.
2. Small persistent indicator: `● NARC ACTIVE`.
3. Unread company/People Operations email explains that the team has been enrolled in NARC Workforce Support.
4. The language is reassuring and bland.
5. NARC exists as an app/service but is not yet the whole screen.
6. Within the first minute, a normal work message or NARC alert arrives.

Possible email tone:

**From:** People Operations  
**Subject:** Introducing NARC Workforce Support

NARC is presented as a pilot designed to:
- identify workflow friction
- improve collaboration
- surface support needs earlier

The email can say that NARC may analyze approved workplace activity signals and that no action is required.

Optional irony for later:
- “NARC is intended to support employees, not replace human judgment.”
- “Individual signals are considered in context.”

Do not over-explain.

## Desktop shell

Use a fictional corporate workstation, not a precise Windows/macOS clone.

Potential persistent elements:
- day/time
- employee identity or work profile
- Messages
- Email
- Calendar
- Work / Files
- Browser / Utilities
- NARC
- small NARC monitoring indicator

Only the apps needed for V1 must function.

Do not build a full OS.

## NARC's role in the desktop

NARC should be:
- visible
- persistent
- initially small
- increasingly intrusive

Early:
- one menu-bar/tray indicator
- occasional notification
- optional NARC detail panel

Later:
- more alerts
- risk/status labels
- warnings inside other apps
- new NARC permissions/capabilities
- actions blocked or altered by NARC

The UI itself should visually communicate escalation.

## Replace explicit encounter screens

Remove or hide final-player-facing language like:
- `Encounter 1 of 6`
- `Look closer`
- `What do you do?`
- `Afterward`
- `Continue`
- `What you know about NARC`

Those concepts can still exist in the state machine.

Use normal workday progression instead:
- Monday 9:02
- Tuesday 10:14
- Wednesday afternoon

Events can queue or unlock as the player acts.

## Choice design rule

> **Every major branch should first be tested as a plausible computer action.**

Examples:

### Low Visible Activity

Current:
- Do nothing
- Write explanation
- Install mouse jiggler

Desktop version:
- dismiss the NARC alert and keep working = do nothing
- open NARC review and type a note = explain
- discover/open a utility and click Install = mouse jiggler

The mouse-jiggler still needs a selectable action. The improvement is contextual presentation, not pretending the player can physically attach hardware.

Possible implementation:
**Utilities**
- Mouse Activity Helper
- “Keeps workstation active during long tasks.”
- `Install`
- then `On / Off`

Or a coworker sends:
> you know there’s a thing that keeps your mouse active, right?

with an `Open utility` link.

### Luis

NARC notification:
> Restroom-adjacent inactivity detected: Luis Perez

Messages badge:
> Luis: “I am not discussing my digestive system with software.”

Player may:
- open NARC details
- message Luis
- inspect available activity evidence
- help him use a workaround
- ignore it
- take an action that increases monitoring

Do not show these as three giant moral-choice buttons if they can be represented in apps.

### Marcus

Marcus messages:
> running late. bird situation.

The player can:
- reply
- inspect attendance/location evidence
- edit/attach a work record if authorized by the game
- create a calendar/client context
- ignore him
- open NARC and see what it already knows

The game records the branch under those actions.

### Priya

Instead of:
> Reduce Priya’s communication?

Let the player:
- mute/remove from a channel
- warn her in Messages
- move something to an in-person meeting
- leave it alone
- use a visible collaboration action

Later, NARC may flag isolation or low collaboration.

## Information architecture: NARC vs reality

Keep the “NARC SEES / NARC INFERS” concept but integrate it into NARC's product UI.

Example NARC detail:

**Observed**
- keyboard/mouse events
- messages sent
- active window

**Model**
- Engagement concern: moderate
- Confidence: 64%

Do not immediately show “what you were actually doing.”

The player finds reality elsewhere:
- Calendar: in-person warehouse audit
- Messages: coworker context
- Work: completed task
- Files: document activity not captured by NARC's chosen metric

This is one of the central game mechanics.

## Consequence delivery

Consequences should happen through normal work surfaces.

### Mouse jiggler example

Player installs/enables utility.

Later:
- NARC indicator quietly changes 61 → 75
- notification: `Engagement trend: positive`
- manager messages: “Love the energy!”

Do not show a dedicated “Afterward” screen explaining:
> your cursor was busy, you were not.

The player should understand the joke from the contradiction.

Later NARC can upgrade:
> Synthetic engagement detection enabled

Then the old exploit may stop working or create risk.

### Other consequence channels

- manager reaction → Messages
- HR consequence → Email
- meeting/work schedule change → Calendar
- NARC judgment → notification/status
- coworker fired → account offline + message/email
- policy escalation → company email + new NARC capability
- tool restriction → app becomes disabled or shows warning

## Natural inaction

Inaction should often be represented by simply not doing something.

Examples:
- do not answer Marcus
- dismiss a notification
- leave an email unread
- continue working instead of opening NARC

Do not require a button labeled `REFUSE TO HELP` unless there is a reason the player must explicitly refuse.

## Scope protection

This is not a full desktop simulator.

For V1:
- only 4–6 apps/surfaces need to work
- most apps can have only a handful of stateful items
- events can be scripted
- the system can still be deterministic
- not every icon must be interactive
- not every event needs multiple branches

The goal is to hide the finite branching structure behind believable work-computer interactions.

## What to preserve from the current prototype

Preserve:
- human player role
- NARC proxy metrics
- current humor/copy where it still works
- Luis, Marcus, Priya scenarios
- carry-over state
- achievements/end states
- deterministic engine/tests
- NARC dark monospace visual identity inside NARC UI
- score/confidence language
- mouse-jiggler exploit and its effect

Reframe:
- full-screen NARC pages
- “Look closer”
- “What do you do?”
- “NARC updates”
- “Afterward”
- “What you know about NARC”
- “Encounter X of 6”
- giant Continue buttons

## First-pass acceptance test

A player should be able to complete the existing six-event prototype while feeling like they are:
- using a work computer
- reacting to messages/alerts
- opening relevant apps
- taking concrete software actions

They should not feel like they are:
- reading six scenario cards
- answering a quiz
- selecting abstract moral choices
- being taught AI concepts through explicit tutorial prose

## Implementation strategy

Do not rewrite the deterministic logic first unless necessary.

Preferred order:
1. preserve current state transitions/tests
2. build persistent desktop shell
3. map current encounter state into desktop events
4. distribute information across apps
5. convert explicit choice buttons to contextual computer actions
6. convert result screens into notifications/messages/status changes
7. remove visible encounter numbering/tutorial framing
8. smoke test the full run
9. only then adjust story/state logic if the desktop flow exposes a real problem

## Authority

Work remains on `prototype-v1`.

Do not merge to `main` or promote to production without Paige explicitly authorizing that destination.
