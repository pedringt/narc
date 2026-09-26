# NARC Handoff

## Current status (2026-09-26)

The canonical experience is the **single-workday desktop build** at `/` and `/day.html`.

Active implementation:
- `day.js` — deterministic game/state engine
- `day-desktop-app.js` — desktop UI and interaction layer
- `single-day-desktop.css` — single-day integration/polish styles
- `test-day.mjs` — engine/regression checks
- `test-desktop.mjs` — source-level desktop integration checks

The old one-week build remains at `/week.html` only as an archive/reference.

## Branch / PR state

- `main` includes PR **#101**, merged at commit `c514c46d27d478ad61efb73448935b9c3db4eb09`.
- Current working branch for copy review/export: `game-copy-export-sept26`.
- `docs/GAME_COPY_EDITABLE.md` exists on that branch as the editable master inventory of current player-facing text.
- The copy-export branch has **not** been merged to `main`.
- Do not merge/push/deploy this branch to `main` or production unless Paige explicitly names that destination in the current instruction.

## Copy editing workflow

Paige asked for a single editable file containing the game's current dialogue/text.

Use:
- `docs/GAME_COPY_EDITABLE.md`

It contains:
- dialogue
- NARC/system copy
- tutorial text
- emails
- task descriptions
- player choice/button labels
- Browser article copy
- endings/outcomes
- visible UI text

Format:
- **Source**
- **Current text**
- **Edited text**

Workflow:
1. Paige edits only the **Edited text** column.
2. Blank means no change.
3. `DELETE` means remove the line.
4. `NEW` rows may be added for new copy.
5. When the edited file comes back, apply only the approved copy edits to the canonical source files.
6. Preserve dynamic placeholders such as `${state.index}`, `${risk.label}`, and `${clock(...)}` unless Paige intentionally requests implementation changes too.
7. Treat copy review as separate from gameplay/system redesign.

## What PR #101 changed

This pass responds to Paige's latest live playtest feedback.

### NARC status is now legible at a glance

The old headline `VISIBLE ACTIVITY INDEX 61` was not self-explanatory.

New hierarchy:
1. persistent **NARC status** in the top bar
2. derived intervention-risk meter: NORMAL / WATCHING / AT RISK / CRITICAL
3. click NARC for the explanation
4. Visible Activity remains a secondary signal shown as `X/100` plus a plain-English band

Important: the risk meter is **derived UI**, not a new hidden morality/performance score. It summarizes NARC's current intervention pressure from existing state.

Visible Activity bands:
- 0–49: Low visible activity
- 50–74: Normal visible activity
- 75–100: High visible activity

The UI explicitly says Visible Activity measures observable workstation activity, **not work quality**.

### NARC detail screen was redesigned

The NARC screen now answers four questions in order:

- **WHAT NARC SAW**
- **WHAT NARC INFERRED**
- **WHAT THAT CHANGES**
- **WHAT YOU CAN DO**

This is the key mental model for the product. Evidence and inference must stay visibly separate.

Active NARC decisions use concrete action labels instead of generic “Add context,” for example:
- Explain the quiet file review
- Explain that the fast work was rushed
- Explain the quiet work NARC missed
- Explain what the activity score missed
- Explain why Focus Time spread

Recent NARC history is now a categorized event timeline (Observation / Review / Recognition / System Update / Consequence).

NARC toast notifications now include the current NARC status and explicitly direct the player to open NARC for evidence/inference/action details.

### Message action hierarchy was tightened

Rule:
- if a tutorial step or required request is active in a person's thread, show the required action(s) only
- optional “Start a conversation” prompts return when nothing required is waiting
- while a coworker is typing, unused optional prompts remain visible but disabled/dimmed instead of disappearing
- after the reply lands, they become active again

This prevents optional banter from competing with progression.

### Context-aware dialogue

Dana's “Usually the raccoon is metaphorical” line only fires after Marcus's raccoon story has actually occurred.

Before that beat, Dana answers:
> No. Usually the chaos is less coordinated.

General rule: callback jokes must respect what the player has actually seen.

## Current gameplay shape

Target real-world first run: about **15 minutes**.

- 1–2 minutes onboarding
- 8–10 minutes work decisions, interruptions, social choices, and NARC reactions
- 2–3 minutes escalation/payoff/ending

The day remains one deliberately busy 9:00–5:00 workday. Do not return to a multi-day structure.

### Recurring coworker patterns

These must feel established before NARC turns them into cases:

- **Marcus** — repeatedly late/missing things, often with plausible context; raccoon/transit evidence is one incident in an existing pattern
- **Luis** — repeatedly away from his desk / bathroom breaks; NARC reduces low-input stretches to “presence irregularities”
- **Priya** — genuinely chatty and highly collaborative; NARC flattens client work, onboarding, and social chatter into “Communication Load”

The interesting design is ambiguity: NARC often has a real signal but lacks enough context to judge what the signal means.

### Player complicity

The player can:
- challenge NARC
- accept flattering NARC interpretations
- game NARC
- protect coworkers
- decline to intervene
- weaponize NARC against coworkers

Do not simplify the game into “AI bad / resist AI.” Player incentives and institutional trust are part of the point.

### Adaptive system arc

Focus Time:
- initially protects quiet work
- coworkers learn the workaround
- usage spreads
- NARC 2.0 reinterprets repeated Focus Time as possible gaming

Then Marcus can send `keepalive.pkg`, which produces synthetic activity NARC can count as real visible input.

This is a compact playable feedback loop: users adapt to the model; the model adapts to users.

## Immediate next steps

There are now two parallel next-step tracks:

1. **Copy review:** Paige may edit `docs/GAME_COPY_EDITABLE.md` and hand it back for application.
2. **Gameplay validation:** issue #70 remains the main browser/playtest gate for the current production build.

Validate:

### NARC clarity
- top-bar NARC status is visible but not distracting
- NORMAL/WATCHING/AT RISK/CRITICAL changes make intuitive sense
- clicking NARC explains **why** the status changed
- Visible Activity always reads as X/100 plus Low/Normal/High
- player understands that Visible Activity is not job performance
- every active NARC event clearly separates signal -> inference -> consequence -> action
- concrete action wording is understandable without prior knowledge of “add context”
- event history is readable rather than a log dump

### Messages
- optional conversation prompts are hidden while required/tutorial actions are active
- while someone is typing, remaining optional prompts stay visible but disabled
- layout does not collapse/jump during typing
- new replies stay at the bottom
- Dana does not mention the raccoon before the player has heard the story

### Pacing
- 10:15 still feels busy
- unread coworker activity is discoverable
- “Work until...” does not appear while meaningful unread activity is waiting
- no new NARC UI causes the run to slow down significantly

### Ending / consequences
- coworker employment/protection outcomes still match choices
- Trusted Operator / Review Open still affect later play
- Focus Time -> NARC 2.0 -> keepalive remains causally legible

## Verification state

PR #101 was merged to `main` after a successful Vercel preview build.

The current copy-export branch only adds documentation/copy-review material; it does not change gameplay behavior.

Environment limitation from the last implementation pass:
- local Node test execution was not available in the ChatGPT environment
- Vercel build status was used for deployment verification
- do not claim a full automated-test pass unless it is actually run elsewhere

## GitHub issue state

Primary current issue:
- **#70** Playtest the ~15-minute core loop for agency, pacing, and payoff

New design exploration:
- **#102** Explore in-game urgency timers for consequential decisions
  - inspiration: Cooking Fever-style draining urgency
  - must use **in-game time**, never real-world countdown pressure
  - intended to make action-time costs and prioritization more meaningful
  - selectively test hard deadlines, soft deadlines, and NARC attention pressure
  - do not implement automatically without a new explicit implementation instruction

Blocked until #70 stabilizes:
- **#88** lightweight Vercel gameplay analytics

Deferred, do not implement automatically:
- **#45** promotion/replay authority/settings
- **#48** benignly invasive personalization

Completed:
- **#87** opening context

## Portfolio / case-study framing worth preserving

Strong thesis:

> NARC is a playable systems-design experiment about what happens when organizations turn observable proxies into judgments, and people begin adapting to the measurement system.

Important case-study themes:
- ambiguous evidence rather than cartoonishly wrong AI
- player incentives and complicity
- model/user feedback loops
- human review as both safeguard and possible failure point
- explainability as interaction design, not a documentation paragraph
- proxy metrics / Goodhart-style behavior taught through play
- deliberate compression from a larger multi-day idea into a short portfolio experience
- live playtesting changed mechanics and pacing, not just visual polish
- humor makes serious AI-system behavior approachable without turning the game into a lecture

AI-assisted creation should be attributed accurately:
- Paige made the product/game decisions, playtested, selected what to keep/cut, and directed scope/tone
- AI tools helped explore design space, inspect/recover prior mechanics, draft variants, implement code, perform QA, and maintain documentation
- NARC is authored/deterministic-first; a live LLM is not required for the game mechanic

## Source of truth

For the active build, use this order:
1. `docs/CORE_GAME_SPEC.md`
2. `docs/HANDOFF.md`
3. current open GitHub issues
4. `day.js` / `day-desktop-app.js`
5. `docs/CASE_STUDY_NOTES.md`

The archived week build and old issue descriptions are reference material only.
