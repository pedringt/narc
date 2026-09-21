# Agent Prompt: Rework NARC Into a Natural Work-Desktop Experience

You are continuing work on `pedringt/narc` on branch `prototype-v1`.

Read these files first:
1. `docs/handoffs/claude-rework/HANDOFF.md`
2. `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`
3. `docs/CORE_GAME_SPEC.md`
4. `docs/HANDOFF.md`

Then inspect:
- `index.html`
- `style.css`
- `game.js`
- `app.js`
- `test.mjs`

## Mission

Rework the current human-vs-NARC six-encounter prototype so it feels like the player is naturally using a work laptop during a normal workday.

The current deterministic game logic is already useful. The main problem is presentation: it still feels like a sequence of scenario cards with explicit story choices.

The new rule is:

> **The desktop is the game board. Choices should feel like normal computer actions.**

## Required Interaction Model

Create a persistent fictional corporate desktop/workspace with only the surfaces needed for the current slice, such as:
- Messages
- Email
- Calendar
- Work / Files
- Browser / Utilities
- NARC

Keep scope small. Do not build a full operating system.

### NARC presence

- show a small persistent NARC-active / monitoring indicator
- introduce NARC through a company or People Operations email/alert
- let NARC issue notifications and open detail panels
- keep the existing dark/monospace NARC visual identity inside NARC surfaces
- allow NARC to become more intrusive after its mid-game update

### Remove scenario-game framing

Do not show player-facing:
- `Encounter X of 6`
- generic `Look closer`
- generic `What do you do?`
- dedicated `NARC updates`
- dedicated `Afterward`
- giant `Continue` progression buttons
- tutorial-like `What you know about NARC`

Use day/time and normal incoming events instead.

### Model branches as computer actions

Whenever possible, branch through concrete actions:
- open
- dismiss
- reply
- type
- inspect
- edit
- attach
- install
- enable/disable
- ignore

Explicit controls are fine when the action naturally needs one.

Example: mouse-jiggler path
- surface it in a Utilities/Browser area or from a coworker link
- player clicks `Install`
- player can toggle it `On / Off`
- later NARC's activity metric improves
- the manager sends “Love the energy!” in Messages
- no Afterward explanation screen

### Information separation

NARC should show:
- raw observed signals
- inferred classification
- confidence

Human reality should be found in:
- Messages
- Calendar
- Work / Files
- Email

Do not explain the mismatch in tutorial prose. Let the player infer it.

### Consequences

Deliver consequences naturally:
- boss/coworker reaction → Messages
- HR/policy → Email
- schedule change → Calendar
- NARC judgment → notification/status
- system restriction → app state
- coworker firing/removal → account offline + human/company message


## Current Playtest Feedback — Must Address Before Adding Scope

The desktop shell is directionally successful. The new blocker is **player clarity and pacing**.

Paige's main first-run reaction is:

> **It is generally hard to know what to do.**

Do not solve this by restoring giant story-choice menus.

Use this rule:

> **Hide the branching structure, not the available affordances.**

The next implementation pass should prioritize:

1. **Orientation gate**
   - auto-open/select the initial People Operations email
   - spell out NARC as **Networked Assessment & Risk Coordination**
   - explicitly but blandly state that NARC monitors workplace activity
   - establish Dana as the manager
   - do not start the first consequential incident on a timer before setup is complete

2. **NARC as the primary pressure/voice**
   - NARC talks to the player mainly through persistent notifications and status changes
   - NARC should become increasingly annoying/intrusive
   - NARC app is for case detail/history/actions
   - top-right status should clearly signal an active case and be an obvious way to open NARC

3. **Persistent but manageable notifications**
   - remove 9-second auto-disappearance for important alerts
   - closing a toast only hides the toast; it must not choose the incident's ignore branch
   - cap visible toast stack and preserve older items in badges/history
   - separate active/actionable cases from passive NARC notices/history

4. **Slower pacing**
   - no consequential notifications during orientation
   - do not silently resolve a case while the player is actively exploring the workstation
   - redesign/remove the hidden 60-second fallback behavior
   - give multi-message jokes enough spacing to read

5. **Coworkers as counterplay**
   - first message in each incident must make sense without assuming the player opened NARC first
   - roles must be clear
   - messages can hint at missing context/loopholes in character
   - NARC applies pressure; coworkers and desktop evidence help the player evade/outsmart it

6. **Discoverable actions**
   - every incident should provide at least 2 plausible, discoverable leads
   - use relevant app badges/state, coworker hints, or NARC's statement of missing evidence
   - player should not have to randomly click every app

7. **Specific cleanup**
   - fix first-incident Halvorsen file timestamp inconsistency (12:41 file edit vs 12:14 alert)
   - do not allow Luis helper attachment before the player has actually discovered/acquired the helper
   - move Priya Culture Champion email earlier so the exemption can be discovered as an existing loophole
   - let the NARC 2.0 email land/read before its consequences pile up
   - make Messages/Slack naming consistent

## Product / AI thesis

This remains deterministic software by design, but the gameplay should demonstrate AI-product learning.

The fun is:

> **Learn what the AI-like system actually measures, then outsmart it.**

NARC is not required to remain realistic forever. Begin with recognizable current monitoring and algorithmic-management ideas, then extrapolate toward dystopian monitoring, prediction, and preemptive intervention.

Read:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Do not implement all speculative ideas now. They are a scenario bank / escalation direction, not permission to expand V1 scope.

## Preserve

Preserve current deterministic logic and tests where practical:
- player is human
- six-event slice
- Luis, Marcus, Priya
- carry-over
- NARC metrics/confidence
- mouse-jiggler exploit
- NARC 2.0 escalation
- endings/achievements
- current humor where it still works

Do not preserve the current UI flow merely because it exists.

## Implementation Order

1. Inspect current code and tests.
2. Write a short implementation plan before editing.
3. Preserve state-machine behavior unless desktop UX requires a change.
4. Build the desktop shell.
5. Map the current six events into notifications/messages/email/app states.
6. Move NARC evidence into NARC panels.
7. Move human context into work apps.
8. Convert abstract choices to contextual computer actions.
9. Replace result/Afterward/Continue screens with natural consequences.
10. Remove visible encounter numbering/tutorial framing.
11. Run deterministic tests.
12. Add/update tests for desktop action routing if needed.
13. Smoke-test the complete run.
14. Push only to `prototype-v1` if that is the established workflow and report preview status.

## Acceptance Bar

The pass is successful if:
- the player stays in one persistent desktop/workspace for most of the run
- NARC feels like software monitoring the employee rather than the game itself
- problems arrive as alerts/messages/email/calendar changes
- most branches are triggered through believable computer actions
- the mouse-jiggler path feels like installing/using a utility
- manager “Love the energy!” arrives through Messages after the exploit works
- NARC-sees vs human-reality is discoverable across different apps
- the game no longer feels like six scenario cards
- carry-over still works
- tests pass
- the run remains a compact portfolio experience: roughly 5–15 minutes overall, with ~8–10 minutes as the healthy first-run target

## Do Not

- do not build a full OS simulator
- do not add live AI
- do not add backend/auth/persistence
- do not reintroduce the reviewer-player premise
- do not make the desktop a decorative shell around unchanged choice cards
- do not add long AI tutorial text
- do not merge to `main`
- do not deploy to production

## Output

When done, report:
- what UI/interaction structure changed
- which current mechanics were preserved
- which screens were removed/reframed
- how each major branch is now expressed as a computer action
- tests run and results
- preview URL/status if available
- anything intentionally deferred
- 3–5 focused questions Paige should answer while playtesting

## Credential and Authority Rules

Use existing platform-provided or brokered GitHub/Vercel access.

Do not ask for or store raw credentials, tokens, cookies, API keys, session values, private keys, or `.env` contents.

Work only on `prototype-v1`.

Do not merge to `main` or promote to production without Paige explicitly authorizing that destination.
