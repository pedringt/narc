# NARC Single-Day Playtest Checklist

**Canonical build:** `day.js` + `day-desktop-app.js`  
**Current polish PR:** #101  
**Target first-run runtime:** about 15 minutes

This replaces the old week-oriented checklist for active validation. `week.html` is archive/reference only.

## 1. Opening / tutorial

- [ ] People Ops email gives enough context to start.
- [ ] Dana establishes who the player is, what Meridian is, and what NARC does.
- [ ] Tutorial completes in about 1–2 minutes.
- [ ] Opening an expected app by any path advances/reconciles the tutorial.
- [ ] Old tutorial CTAs disappear if the player reaches the destination another way.
- [ ] Only one required tutorial instruction is active at a time.
- [ ] Optional “Start a conversation” prompts do not compete with required tutorial actions.

## 2. Message UX

- [ ] Selecting an optional prompt appends the player's message at the bottom.
- [ ] Thread stays pinned to newest content after sending/replying.
- [ ] Coworker shows a short “X is typing…” state.
- [ ] Unused optional prompts remain visible but disabled while typing.
- [ ] Controls do not collapse or jump while typing.
- [ ] Once the reply arrives, unused prompts become active again.
- [ ] Optional prompts are hidden while a required coworker/Dana request is waiting.
- [ ] Dana's raccoon callback cannot appear before Marcus's raccoon story.
- [ ] Recurring character patterns are obvious before their NARC cases:
  - [ ] Marcus is repeatedly late/missing things.
  - [ ] Luis is repeatedly away / in the bathroom.
  - [ ] Priya is repeatedly chatty/collaborative.

## 3. NARC persistent status

- [ ] Top-bar NARC status is visible throughout the workday.
- [ ] Initial status reads as normal/safe, not mysterious danger.
- [ ] Meter shifts toward warning/risk when NARC opens a meaningful review/assessment.
- [ ] Review Open produces an intuitively more dangerous status.
- [ ] Status changes do not imply actual work quality.
- [ ] Clicking the top-bar NARC status opens NARC details.

## 4. Visible Activity

- [ ] Never shown as a naked number like “61”.
- [ ] Reads as `X/100`.
- [ ] Includes Low / Normal / High label.
- [ ] Range meaning is understandable:
  - 0–49 low
  - 50–74 normal
  - 75–100 high
- [ ] UI says it reflects observable activity, not quality/performance.
- [ ] A player can explain why a high activity score can still accompany bad/rushed work.

## 5. NARC detail screen

For each meaningful NARC assessment, verify the screen clearly separates:

- [ ] **What NARC saw** — concrete observable signal.
- [ ] **What NARC inferred** — the system's interpretation.
- [ ] **What that changes** — standing/consequence.
- [ ] **What you can do** — concrete player response.

Also:
- [ ] no generic “Add context” button without explaining the actual action
- [ ] first low-activity assessment says “Explain the quiet file review” or equivalent
- [ ] positive activity assessment makes the Trusted Operator bargain clear
- [ ] midmorning assessment wording changes appropriately for the earlier signal
- [ ] NARC 2.0 response says what happened to Focus Time and what responding means
- [ ] categorized recent-event timeline is readable
- [ ] newest event is easy to identify
- [ ] the screen feels like a product the fictional company would actually use, not a debug log

## 6. NARC notifications

- [ ] Notification states current NARC status.
- [ ] Player can tell whether action may be required.
- [ ] Notification points to NARC for full reasoning.
- [ ] Notification remains recoverable in notification history.
- [ ] Opening NARC makes the notification understandable in hindsight.
- [ ] transient toast is never the only place required information exists.

## 7. Pacing / density

- [ ] Around 10:15 there are multiple things worth checking/doing.
- [ ] Coworker activity is discoverable through unread state.
- [ ] “Work until…” does not appear while meaningful unread activity is waiting.
- [ ] Quiet-time prompt is not the default rhythm of the game.
- [ ] No long dead-air stretch.
- [ ] No stretch is so overloaded that causal relationships are impossible to follow.
- [ ] Most beats teach, force a tradeoff, create consequence, reveal character, enable counterplay, or pay off earlier action.

## 8. Core social choices

For Priya, Luis, and Marcus:
- [ ] player can protect/help
- [ ] player can decline/stay out when appropriate
- [ ] player can report/weaponize NARC
- [ ] Culture Champion exemption can materially change a consequence
- [ ] later outcome reflects the earlier player choice

## 9. Adaptive-system arc

- [ ] Focus Time initially works.
- [ ] coworkers adopt it.
- [ ] NARC 2.0 update clearly connects spread -> adaptation.
- [ ] Focus Time becomes less useful rather than simply disappearing.
- [ ] `keepalive.pkg` arrives after the adaptation.
- [ ] player understands that keepalive creates visible signals rather than better work.
- [ ] ending can call out NARC counting synthetic input.

## 10. Ending

- [ ] coworker outcomes match actual state.
- [ ] Trusted Operator / Review Open state is reflected.
- [ ] major earlier choices have recognizable payoff.
- [ ] if NARC rated bad work highly, the contradiction is visible.
- [ ] ending offers replay.
- [ ] replay resets game/tutorial/chat/notification state.

## 11. Portfolio comprehension test

Without explaining the thesis, ask:

- [ ] What does NARC actually measure?
- [ ] What is it assuming from those signals?
- [ ] What did the NARC status meter mean?
- [ ] Did you intentionally game it?
- [ ] Why did Marcus/Luis/Priya get flagged?
- [ ] Did you ever benefit from a misleading NARC interpretation?
- [ ] Did you change strategy during the run?
- [ ] What happened when people discovered the Focus Time workaround?
- [ ] What did the game make you think about AI/automated management?
- [ ] How long did the run take?

Record findings in issue #70 and `docs/CASE_STUDY_NOTES.md`.
