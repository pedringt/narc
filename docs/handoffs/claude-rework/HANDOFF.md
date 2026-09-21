# Handoff: NARC Desktop Interaction Rework

## Purpose

This handoff is for a fresh Claude Code chat continuing the current NARC prototype on `prototype-v1`.

The **human-vs-NARC game loop is already implemented**. The next job is primarily an interaction/UI rework: make the same game feel like a person naturally using a work laptop rather than clicking through scenario cards.

Read `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md` as the detailed UX source of truth.

## Current Objective

Reframe the existing six-encounter deterministic prototype around a persistent fictional work desktop.

Do not throw away working state logic unless it prevents the desktop interaction model.

The key question for this pass is:

> Can the current branching game feel like a natural workday where choices happen through Messages, Email, Calendar, NARC, Work/Files, and small utilities?

## Current State

Repository:
- `pedringt/narc`

Working branch:
- `prototype-v1`

Current prototype:
- player is already a human employee
- 6 encounters
- Luis, Marcus, Priya
- one NARC 2.0 update
- deterministic engine in `game.js`
- renderer in `app.js`
- automated tests in `test.mjs`
- Vercel preview redeploys from `prototype-v1`

The current human-vs-NARC build is structurally closer to the goal than the old reviewer prototype, but the presentation still feels like:
- encounter card
- Look closer
- what NARC sees/infers
- giant choice buttons
- result card
- Afterward
- Continue

That interaction framing is now superseded.

## Settled UX Direction

### Desktop is the game board

The player should remain in one persistent fictional work laptop/workspace.

Potential surfaces:
- Messages
- Email
- Calendar
- Work / Files
- Browser / Utilities
- NARC

A small persistent NARC indicator should show that monitoring is active.

### NARC introduction

Prefer a company/People Operations email or company alert introducing NARC rather than opening the game inside a full-screen NARC application.

NARC can be explained in reassuring corporate language.

### Problems arrive naturally

NARC issues should arrive as:
- notifications
- alerts
- unread badges
- Messages
- emails
- calendar changes
- status changes

Do not show `Encounter X of 6` in the final player UI.

### Choices are concrete computer actions

Avoid generic `What do you do?` menus whenever a branch can be represented as:
- reply
- dismiss
- open
- inspect
- type
- edit
- attach
- install
- enable/disable
- ignore

The underlying branch can remain deterministic.

### Explicit buttons are still allowed

The rule is not “no choices.”

A mouse jiggler, for example, can and should use an explicit `Install` button because installing a utility is itself a natural computer action.

The problem is presenting `Install a mouse jiggler` alongside abstract story choices on a scenario screen.

### Consequences happen through the desktop

Examples:
- NARC status quietly changes
- manager messages “Love the energy!”
- HR emails a warning
- coworker reacts
- policy email arrives
- account goes offline
- calendar invite appears

Avoid dedicated `Afterward` and `NARC updates` screens if the same information can arrive naturally.

### NARC sees vs reality

Keep this core mechanic.

NARC detail can show observed signals and model inference.

Human reality should be found in the other apps.

The player should connect the two.

## Current Example That Must Be Reframed

Current low-visible-activity branch:

1. NARC says player had 3h12m with no mouse/keyboard input.
2. “Look closer.”
3. Screen explicitly explains NARC sees keyboard/mouse/messages/window focus and infers engagement.
4. “What do you do?”
5. Choice: do nothing / explain / install mouse jiggler.
6. Dedicated NARC update screen.
7. Dedicated Afterward screen.
8. Manager says “Love the energy!”
9. Continue.

Desired desktop version:

1. Desktop is visible.
2. NARC notification: low visible activity.
3. Player may open NARC details.
4. NARC shows observed signals + engagement inference/confidence.
5. Other app(s) reveal actual work context if player looks.
6. Player may dismiss, submit context in NARC, or find/install a mouse-jiggler utility.
7. If mouse jiggler is enabled, later the NARC score quietly rises.
8. Manager message arrives: “Love the energy!”
9. No result/Afterward/Continue screen.
10. Workday continues.


## Latest playtest conclusion

The desktop concept is working better than the old scenario-card structure, but the current build has a new primary usability problem:

> **The player often does not know what to do.**

The next pass is not "add more content." It is **clarify the loop without exposing the branch tree**.

Settled principles from the feedback round:

- **Hide the branching structure, not the available affordances.**
- **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**
- NARC should primarily talk at the player through notifications/status interruptions.
- Coworkers should provide character + missing context + diegetic clues for evasion.
- Important notifications must persist until handled/closed; closing a toast is not the same as dismissing the case.
- The opening needs a gated orientation before consequential events begin.
- The People Ops email should spell out **Networked Assessment & Risk Coordination** and plainly-but-corporately state that workplace activity is monitored.
- First-contact coworker messages must make sense without assuming the player already opened a NARC alert.
- The hidden 60-second auto-fallback is too easy to trigger while the player is legitimately investigating.
- Active NARC cases must be distinguished from passive NARC history/notices.
- The AI-learning goal is experiential: the player learns about proxies, inference, gaming, context loss, feedback loops, and authority by outsmarting NARC rather than reading explanations.

Research grounding and speculative escalation notes:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Detailed implementation notes:
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## Preserve

- deterministic engine and tests where possible
- six-event content
- carry-over
- current jokes
- NARC scoring/confidence
- Luis/Marcus/Priya
- mouse-jiggler exploit
- NARC 2.0 escalation
- achievement/end logic
- dark monospace NARC visual style inside NARC windows

## Rework

- full-screen NARC framing
- visible encounter numbering
- Look closer buttons
- tutorial-style “what NARC sees / what NARC infers” pages
- generic What do you do? menus
- Afterward screens
- Continue screens
- “What you know about NARC” knowledge panel
- large result cards that explain cause/effect

## Scope

Keep this small.

Do not build a real OS.

Only the work surfaces needed for the existing slice need meaningful interaction.

The desktop can be highly scripted while still feeling natural.

## Implementation Priority

1. Read the current code/tests.
2. Preserve working state transitions.
3. Build desktop shell.
4. Map current encounter events into desktop notifications/messages/email.
5. Move NARC evidence into NARC panels.
6. Move human context into other apps.
7. Convert story-choice buttons into contextual actions.
8. Replace result screens with natural consequences.
9. Remove visible encounter/tutorial framing.
10. Run all deterministic tests.
11. Smoke test the complete desktop flow.
12. Report what was preserved, rewritten, deferred, and what Paige should test.

## Wrong Turns

Do not:
- rebuild the old reviewer version
- turn the desktop into a decorative wrapper around the same scenario cards
- build a full OS simulator
- add live AI
- add backend/auth/persistence
- make every app fully functional
- explain the AI lesson with tutorial text
- merge to `main`
- promote to production

## Authority / Credentials

Use existing platform-provided GitHub/Vercel access.

Do not request raw credentials.

Work only on `prototype-v1`.

No destructive actions.

No `main` or production promotion without Paige explicitly naming that destination.
