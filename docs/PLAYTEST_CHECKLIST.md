# NARC Live Playtest / Pre-Merge Checklist

**Purpose:** Manual QA checklist for the current `prototype-v1` branch before merging to `main`.

This complements `node test.mjs`. The deterministic suite verifies state logic; this checklist verifies that the experience actually feels clear, funny, and intentional.

## 1. Fresh start / orientation

- [ ] Page loads at Monday 09:02.
- [ ] Email is the only initially exposed dock app.
- [ ] People Operations NARC email is already selected/open.
- [ ] Email spells out **NARC — Networked Assessment & Risk Coordination**.
- [ ] Email clearly says workplace activity is monitored, without sounding like tutorial copy.
- [ ] No consequential NARC case begins before orientation is complete.
- [ ] Dana is clearly established as the player's manager.
- [ ] Messages and Calendar appear only when introduced.
- [ ] The first minute makes it obvious what to do without showing explicit "Step 1 / Step 2" instructions.

## 2. Progressive disclosure

Verify each app appears only when relevant.

- [ ] Email starts visible.
- [ ] Messages appears with Dana.
- [ ] Calendar appears when Dana asks the player to check it.
- [ ] NARC becomes clearly available with the first NARC case.
- [ ] Files appears when evidence becomes relevant.
- [ ] Utilities appears when a tool/workaround becomes relevant.
- [ ] No newly revealed app feels like it appeared without context.
- [ ] No needed action is hidden inside an app that has not been introduced.

## 3. First NARC case: does the AI idea land?

- [ ] The player can see the distinction between **workplace signals**, **NARC inference**, and **company action**.
- [ ] "What NARC observed" contains only data NARC plausibly sees.
- [ ] "What NARC inferred" includes a confidence value.
- [ ] The human reality (printed contract / $40,000 discrepancy) is discoverable elsewhere.
- [ ] At least two plausible responses/workarounds are discoverable without outside help.
- [ ] Mouse-helper and Focus-time routes feel meaningfully different.

Question to answer after play:
> Did this feel like an AI/algorithmic inference problem, or just generic monitoring software?

## 4. Luis

- [ ] Luis's first message makes sense even if the player has not opened the NARC alert.
- [ ] Dana gives both confirm and decline-to-confirm options.
- [ ] The player's coworker replies sound like actual messages, not branch labels.
- [ ] Mouse Activity Helper cannot be shared before it is acquired.
- [ ] Support-output evidence is understandable as counter-evidence.
- [ ] If NARC 2.0 catches fixed synthetic input, the cause is obvious.
- [ ] If the player protects Luis another way, the later result is understandable.

## 5. Marcus

- [ ] Marcus's rapid-fire excuse chain is readable rather than overwhelming.
- [ ] The player can help, expose, or stay out of it.
- [ ] Dana's replies do not force the player to narc.
- [ ] Calendar/transit/location evidence is discoverable.
- [ ] If fabricated/late records are caught later, the reason is understandable.
- [ ] If the ridiculous bird/goose story is true, NARC's historical weighting is legible.

## 6. NARC 2.0 escalation

- [ ] Announcement gets its own readable beat.
- [ ] New capabilities do not act before the announcement is opened.
- [ ] Synthetic-activity detection feels like NARC adapting to prior gaming.
- [ ] Behavioral forecast is noticeable.
- [ ] Forecast reads as a prediction, not established truth.
- [ ] Ambient workstyle/baseline nudge feels creepy/annoying rather than confusing.
- [ ] Notification volume feels more intrusive than Monday/Tuesday without becoming unreadable.

Question:
> By this point, does NARC feel like it has moved from watching → inferring → adapting → predicting?

## 7. Priya

- [ ] Priya's opening message sounds natural.
- [ ] Culture Champion email already exists before the incident.
- [ ] Player can discover the exemption without being handed a puzzle answer.
- [ ] If player suggests posting less, NARC first rewards the lower communication load.
- [ ] The later Collaboration collapse clearly follows from that earlier change.
- [ ] If Priya is terminated, it is obvious that she followed one NARC metric and was punished by another.
- [ ] This reads as a feedback-loop/conflicting-objectives problem, not random punishment.

## 8. Dana / player agency

For every direct Dana question:

- [ ] There is no moment where the only reply is "report them."
- [ ] Protect/help, expose/report, and neutral/decline options exist when the scenario supports them.
- [ ] Replies sound conversational.
- [ ] Multiple unanswered Dana questions do not stack into a quest log.
- [ ] Dana sounds like a manager, not a tutorial system.

## 9. Notifications and pacing

- [ ] Important NARC notifications persist until opened/closed.
- [ ] Closing a toast never resolves the underlying incident.
- [ ] Max visible toast stack remains manageable.
- [ ] Player never loses an option because they spent time reading/exploring.
- [ ] No unrelated events land too quickly to understand.
- [ ] The player can always tell whether NARC actually needs something from them.
- [ ] "Needs attention" / team alert / history distinctions are obvious.

## 10. Endings

Test at least these outcome shapes:

- [ ] Everyone survives.
- [ ] Luis is fired.
- [ ] Marcus is fired.
- [ ] Priya is fired.
- [ ] Multiple coworkers are fired.
- [ ] Player is under review.
- [ ] Player is terminated.
- [ ] Player is terminated while all three coworkers remain employed.
- [ ] Someone is absurdly rewarded for gaming a metric.

For each:
- [ ] The player can connect the ending to earlier choices.
- [ ] No ending feels like an arbitrary hidden morality score.
- [ ] Employment statuses shown in recap match what happened in the week.

## 11. Replay

- [ ] Ending button says **Replay this week**.
- [ ] Replay returns to Monday 09:02.
- [ ] Welcome email is open again.
- [ ] Progressive disclosure resets.
- [ ] Prior unread state, alerts, flags, helper state, threads, and outcomes are gone.
- [ ] It feels like replaying the scenario, not entering a mysterious literal Week 2.

## 12. Portfolio test

Ask a first-time player, without explaining the design:

- [ ] What did you think NARC was measuring?
- [ ] What did you think it was *assuming*?
- [ ] Did you intentionally game it? How?
- [ ] Did anything surprise you?
- [ ] Did you understand why someone was fired/rewarded?
- [ ] Did the game teach you anything about AI/algorithmic systems without feeling educational?
- [ ] Did you want to replay?
- [ ] How long did your run take?

### Success target

A first-time player should:
- understand the premise in roughly the first minute
- discover at least two satisfying "I can game this" moments unaided
- notice at least one AI-style inference/confidence mismatch
- see one consequence from an earlier choice
- reach a complete ending in under ~15 minutes
- not need the creator to explain what to click next

## 13. Case-study evidence to capture

During the next public/live playtest, record:
- run time
- hesitation points
- screenshots of orientation, first NARC inference, NARC 2.0 forecast, Priya conflict, and ending
- exact places where the player asks "what do I do?"
- any line that sounds written/unnatural
- any route the player expected but could not take
- whether they choose to replay without prompting

Add meaningful findings to:
- `docs/CASE_STUDY_NOTES.md`
