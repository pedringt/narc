# NARC Desktop Rework Acceptance Criteria

The desktop-interaction rework is ready for Paige to play when the following are true.

## Desktop / workday framing

- [ ] The player spends most of the run in one persistent fictional work desktop/workspace.
- [ ] NARC is presented as monitoring software/service inside the work environment, not as the entire game UI.
- [ ] A small persistent NARC-active/monitoring indicator exists.
- [ ] NARC is introduced through a believable company email or alert.
- [ ] Workday progression uses normal day/time rather than visible `Encounter X of 6`.

## Natural actions

- [ ] The game no longer relies on generic `What do you do?` screens for its main branches.
- [ ] Major branches are represented as plausible computer actions when possible.
- [ ] Dismissing/ignoring something can itself function as a branch.
- [ ] Writing an explanation happens in an actual field/surface rather than a story-choice button.
- [ ] The mouse-jiggler path is represented as installing and/or enabling a utility.
- [ ] Explicit buttons remain only where the underlying computer action naturally requires one.

## Information separation

- [ ] NARC details distinguish observed signal from model inference/confidence.
- [ ] Human context is discoverable in other apps/surfaces.
- [ ] The player can understand at least one NARC mistake by comparing different apps.
- [ ] The UI does not explicitly explain the lesson when the interaction can show it.

## Consequences

- [ ] The mouse-jiggler causes the activity metric/status to improve without a dedicated result screen.
- [ ] The manager's “Love the energy!” reaction arrives through Messages.
- [ ] At least one coworker consequence arrives through Messages, Email, Calendar, app state, or another natural work surface.
- [ ] Dedicated `Afterward` and `NARC updates` screens are removed or no longer necessary for the main flow.
- [ ] The player can continue naturally after a consequence without repeatedly clicking a large `Continue` button.


## Orientation / first-minute clarity

- [ ] The initial People Operations email is open/selected at first load.
- [ ] The email spells out **NARC — Networked Assessment & Risk Coordination**.
- [ ] The email clearly says workplace activity is monitored while preserving bland corporate framing.
- [ ] Dana is clearly established as the player's manager.
- [ ] No consequential incident or auto-resolution timer starts before orientation/setup is complete.
- [ ] The player performs at least one harmless workstation action before the first NARC case arrives.

## Discoverability / knowing what to do

- [ ] A first-time player can tell what is happening in each incident without already knowing the branch map.
- [ ] Each incident exposes at least two discoverable leads/affordances through NARC, coworkers, or changed app state.
- [ ] The player does not need to randomly click every app to find a valid action.
- [ ] Coworker first messages make sense even if the NARC alert has not been opened.
- [ ] Coworker hints remain in character rather than becoming tutorial instructions.
- [ ] Thread headers make each person's role clear.

## NARC as pressure

- [ ] NARC primarily communicates through persistent notifications/status interruptions.
- [ ] NARC feels increasingly annoying/intrusive as the week progresses.
- [ ] The NARC status/tray clearly indicates when an active case needs attention.
- [ ] Opening an alert leads naturally to the relevant NARC case detail.
- [ ] Closing a notification toast does not resolve or dismiss the underlying case.
- [ ] Persistent toast behavior cannot cover the desktop with an unlimited stack.
- [ ] Active cases are visually distinguished from passive NARC history/notices.

## Pacing

- [ ] Important alerts do not disappear on a short timer.
- [ ] The player has time to read a message before another unrelated event lands.
- [ ] Exploration in Calendar/Files/Messages/Utilities is not silently treated as ignoring the case.
- [ ] There is no surprising hidden 60-second fallback during onboarding or normal investigation.
- [ ] NARC 2.0 is understandable before its new capabilities begin generating consequences.

## AI-learning through play

- [ ] At least one incident clearly demonstrates a proxy-vs-reality failure through play.
- [ ] At least one incident lets the player deliberately game or manipulate a metric.
- [ ] At least one later event shows NARC adapting to or detecting previous gaming.
- [ ] Coworker/context information helps the player outsmart NARC.
- [ ] The game communicates an AI/product concept without naming or lecturing about the concept.
- [ ] NARC is sometimes useful/correct; the game does not reduce to "AI is always wrong."

## Preserve current game value

- [ ] Human player role remains.
- [ ] Luis, Marcus, and Priya remain in the playable slice.
- [ ] Carry-over still affects later events.
- [ ] At least one NARC capability update still occurs.
- [ ] Endings/achievements remain reachable.
- [ ] Deterministic tests pass.
- [ ] Restart/reset works.

## Experience bar

A player should feel:
- “I am at work and NARC keeps intruding.”
- “I found a workaround.”
- “The system believed the workaround.”
- “My coworkers/boss reacted naturally.”

A player should not feel:
- “I am answering six scenario questions.”
- “I am reading an AI lesson.”
- “This is a terminal game with a desktop skin.”

## Scope boundaries

- [ ] No full OS simulation.
- [ ] No backend/auth/persistence.
- [ ] No live LLM.
- [ ] No production promotion.
- [ ] No merge/push to `main`.
