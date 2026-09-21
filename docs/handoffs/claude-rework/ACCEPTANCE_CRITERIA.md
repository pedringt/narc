# NARC Claude Rework Acceptance Criteria

The first Claude rework is ready for Paige to play when all required criteria below are met.

## Required

- [ ] The player is explicitly a human employee, not NARC.
- [ ] The old reviewer decision loop is no longer the primary gameplay.
- [ ] The first playable screen is simple and understandable.
- [ ] The interface reveals one decision step at a time.
- [ ] At least 5 short encounters are playable.
- [ ] At least 3 coworkers appear.
- [ ] At least 1 coworker appears more than once.
- [ ] At least 1 later encounter changes based on an earlier player action.
- [ ] The player discovers at least 1 proxy metric through gameplay.
- [ ] The player can deliberately exploit at least 1 NARC limitation.
- [ ] At least 1 exploit has a later unintended or funny consequence.
- [ ] At least 1 NARC capability/policy update occurs mid-run.
- [ ] At least 1 employee can be protected/saved.
- [ ] At least 1 employee can end in a materially worse outcome.
- [ ] A final outcome screen summarizes the run.
- [ ] At least 1 achievement or replay hook exists.
- [ ] Restart returns to a clean initial state.
- [ ] Deterministic tests cover the new state transitions.
- [ ] Tests pass.
- [ ] Mobile layout remains usable.
- [ ] No live LLM is required.

## Experience Bar

A first-time portfolio visitor should plausibly be able to:
- understand the premise within ~30 seconds
- learn what NARC is measuring without reading a tutorial
- laugh at least a few times
- see that the system is limited rather than omniscient
- finish the run in roughly 5–8 minutes
- understand why an earlier decision mattered later
- want to try at least one different path

## Must Not Happen

- [ ] No merge/push to `main`.
- [ ] No production promotion.
- [ ] No backend/auth/persistence added.
- [ ] No live generative AI added.
- [ ] No dense all-controls-visible dashboard.
- [ ] No assumption that every NARC inference is wrong.
- [ ] No long explanatory AI lesson screens.
- [ ] No preservation of old reviewer mechanics solely because they already exist.

## Deferred by Design

These are not required for the first rework:
- all five coworkers appearing in one run
- all eight final V1 encounters
- final achievement set
- final portfolio case-study copy
- real-world monitoring citations inside the game
- production polish
- audio
- save system
- live AI
- public release
