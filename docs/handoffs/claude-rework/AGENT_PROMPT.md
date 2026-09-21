# Agent Prompt: Rework NARC Prototype Around Human-vs-AI Gameplay

You are continuing work on the GitHub repository `pedringt/narc`.

Read these files in full before editing:
1. `docs/handoffs/claude-rework/HANDOFF.md`
2. `docs/CORE_GAME_SPEC.md`
3. `docs/HANDOFF.md`
4. `README.md`

Then inspect:
- `app.js`
- `game.js`
- `style.css`
- `test.mjs`

## Task

Rework the existing `prototype-v1` browser game into the new small NARC vertical slice.

The current deployed prototype is structurally superseded. Do not extend its “player is NARC reviewing employees” loop.

The new player is a **human employee** trying to understand and exploit the limitations of an AI workplace-monitoring system.

The core loop must become:

**signal → understand the proxy → respond/exploit → result → human reaction → later carry-over**

## First-Pass Scope

Build a small playable vertical slice, not the whole final game.

Target:
- 5–6 encounters
- around 5–8 minutes
- 3 core coworkers are enough for this pass
- at least one coworker must reappear
- at least one earlier choice must change a later encounter
- one NARC capability/policy update
- one-step-at-a-time UI
- deterministic logic
- final outcome screen
- at least one achievement/replay hook

Prefer Luis, Marcus, and Priya for the first slice because their mechanics are visually/mechanically distinct.

Keep Nina and Maya represented in the data model only if useful; do not force them into the first pass just to hit five characters.

## Required Product Behavior

- Player role must clearly be human.
- NARC must observe proxies, not reality.
- The player must discover at least one system limitation through play.
- The player must be able to exploit at least one limitation.
- A later screen must visibly reflect an earlier action.
- The system should occasionally be directionally useful; do not make NARC universally stupid.
- Corporate copy stays sincere and deadpan.
- Humor comes from the mismatch between human behavior and reductive measurement.
- Do not add a live LLM.

## Interface Requirements

The old interface exposes too much at once.

Replace it with progressive disclosure:
1. show signal
2. let player review/inspect
3. show only current response choices
4. show result
5. show coworker reaction
6. continue

Do not display all investigation, intervention, reporting, and dossier controls together.

Keep the internal-tool / terminal-adjacent tone, but make it immediately readable and portfolio-friendly.

## Reuse Guidance

You may reuse:
- static browser setup
- Vercel branch deployment
- basic style direction
- helper functions
- test patterns

You may substantially rewrite:
- `game.js`
- `app.js`
- `test.mjs`
- layout/style structure

Do not preserve old architecture if it fights the new loop.

## Testing

Add/replace tests so they cover:
- encounter progression
- carry-over
- exploit effect
- unintended consequence
- at least one save path
- at least one firing/removal path
- achievement
- ending
- restart reset

Run the tests before reporting completion.

## Branch / Deployment Rules

Work only on `prototype-v1`.

Do not:
- merge to `main`
- push directly to `main`
- promote to production
- alter the public portfolio site

The `prototype-v1` Vercel preview may redeploy automatically when the branch changes. That is acceptable.

## Output

When implementation is complete, report:
- concise summary of what changed
- which encounters were implemented
- what carry-over exists
- tests run and result
- preview deployment status/URL if available
- what was deliberately deferred
- the 3–5 most useful questions Paige should answer by playing the new version

## Credential and Authority Rules

Do not ask for raw credentials, tokens, cookies, API keys, session values, private keys, or `.env` contents.

Use existing platform-provided or brokered GitHub/Vercel access.

Do not perform destructive or externally visible promotion actions beyond the authorized `prototype-v1` preview workflow.

## Do Not

- re-litigate the settled player-role change
- make the player NARC again
- turn the game into an ethics quiz
- turn the game into a long text adventure
- add live AI
- add backend/auth/persistence
- overbuild before the exploit loop is proven
