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
