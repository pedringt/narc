# Agent Prompt: Continue NARC Expansion

You are continuing work on `pedringt/narc`. Do not restart product discovery. Read the repository handoff and spec first, then continue from the documented state.

## Start here

1. Check out / inspect `game-copy-export-sept26` for the latest handoff artifacts.
2. Read `docs/CORE_GAME_SPEC.md`.
3. Read `docs/HANDOFF.md`.
4. Read GitHub issues #105, #103, #102, #104, #106, and #70.
5. Inspect the canonical single-day implementation:
   - `day.js`
   - `day-desktop-app.js`
   - `single-day-desktop.css`
   - `test-day.mjs`
   - `test-desktop.mjs`

The archived week build is reference only.

## Product goal

NARC is a deterministic, ~15-minute workplace-surveillance satire where the player learns how observable proxies, missing context, institutional authority, gaming, and human incentives interact.

The next expansion deepens the game into a time-triage / moral-compromise loop without making it longer or more lecture-like.

## Implementation order

Work in this order unless Paige changes priority:

1. **#105 — Simplify the NARC tool for instant comprehension**
2. **#103 + #102 — NARC overhead + in-game urgency/time pressure**
3. **#104 — Deepen coworker consequences and moral compromise**
4. **#106 — Rebuild the end-of-day dashboard**
5. **#70 — Full browser playtest of the revised ~15-minute loop**
6. **#88 — Analytics only after #70 stabilizes**

Do not try to implement every issue in one giant pass. Keep changes reviewable and preserve the causal structure of the game.

## Settled product rules

- Keep one compressed 9:00–5:00 workday.
- Keep normal first-run real-world playtime around 15 minutes.
- Time pressure uses **in-game time only**. Never punish the player for real-world reading/thinking time.
- NARC can sound bureaucratic, but the NARC UI itself must be easy to understand quickly.
- Separate what NARC observed from what it inferred.
- Add/strengthen **what NARC cannot see** when the player has relevant context.
- Do not create a new hidden morality score.
- Do not turn coworker choices into explicit universal help/sabotage/ignore buttons.
- Preserve ambiguity: NARC can have a real signal and still make a bad judgment because context is missing.
- Teach AI/product ideas through mechanics and consequences, not explanatory lectures.
- Do not force a universal “you cannot win” ending. Different strategies should protect and sacrifice different things.
- Preserve the tone rule: **The institution is ridiculous. The consequences are real.**
- Keep V1 deterministic/authored-first. Do not add a live LLM just for signaling.

## Copy workflow

`docs/GAME_COPY_EDITABLE.md` is a separate copy-review worksheet. Paige may edit it independently. Do not silently apply or rewrite that material unless she explicitly asks for the copy pass.

## Verification

After each implementation pass:
- run the relevant automated checks
- browser-test the changed behavior and adjacent risks
- preserve the ~15-minute target
- report what passed and what could not be verified
- update the handoff/issues when the project state materially changes

Do not claim tests passed unless they actually ran.

## Credential and authority rules

Use available GitHub/Vercel/platform integrations when needed. Do not ask for or store raw credentials, tokens, cookies, API keys, private keys, session values, or `.env` contents.

Do not merge/push to `main`, deploy production, or publish externally unless Paige explicitly names that destination in the current instruction. Implementation permission is not production permission.

## Do not

- do not re-litigate the one-day / ~15-minute scope without new evidence
- do not restore the archived week build as the main product
- do not add filler just to make the workday feel longer
- do not overload the player with constant notifications
- do not turn NARC into an admin/debug dashboard
- do not make every outcome prove the exact same thesis
- do not implement deferred #45 or #48 unless Paige explicitly pulls them in
