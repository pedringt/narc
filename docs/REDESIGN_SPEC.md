# NARC Redesign Spec

**Status:** Approved for build, 2026-10-21
**Author:** Paige Edrington (with Claude)
**Live copy:** this doc is also a Claude Doc in the NARC project; the repo copy is the one Claude Code builds from.

This spec turns the research findings (`research/making-narc-feel-like-a-game.md` in the Claude project) into concrete changes to the current single-day build (`day.js`, `day-desktop-app.js`). The goal is one sentence: make the careful, kind path cost something, and make reading the computer the thing the player actually does.

## What's wrong today

The current build has a clean win, and it's the obvious one. A bot that picks every careful, kind option on `main` (commit `8069f17`) finishes the day like this:

| Measure | Always-careful bot | What it should be |
| --- | --- | --- |
| Tasks missed | 0 of 6 | At least 1, or something else gives |
| Coworkers fired | 0 | Possible, never guaranteed |
| Visible Activity at 5:00 | 80/100 ("High") | Not safely in the green |
| Minutes spent by choice | 195 of 480 | Close to 480 |
| "Keep working" skips | 16 | 0 (the action is removed) |

Four causes, each named in the design literature:

1. **Dominant strategy.** Careful + kind beats everything on every axis. Schell: choices only matter when no option is obviously dominant.
2. **Obvious choices.** "Skim it (5 min)" vs "Actually read it (25 min)" states the right answer and its price. Mawhorter calls this an *obvious choice*; a game needs *dilemmas*, where every option threatens something.
3. **Unbinding budget.** 285 of 480 minutes are skipped. Time is not a currency if you never run out of it.
4. **No threat.** Nothing happens to *you* when Visible Activity drops. Emily Short on Reigns: a meter you can't intervene in makes you sit back, not forward.

A fifth, from Orwell's postmortem: explicit investigative prompts made that game "feel like a to-do list." The Loop today is a to-do list.

## Design rules

Every change below has to pass these. They come straight from the research and from the existing spec's own rules (keep the single day, keep it deterministic, no lecture).

1. **No option is free.** Every meaningful action moves at least two things, and at least one moves the way you don't want. (Reigns: every card moves a meter; Papers Please: every kindness is a fine.)
2. **Reading is the verb.** The player finds the problem by using the computer, not by picking a button that says they found it. (Papers Please: "find any two pieces of information that don't match.")
3. **Confirm by enabling, never by saying "correct."** Finding a discrepancy unlocks a verb. There is no "you found it" toast. (Obra Dinn, Golden Idol.)
4. **The score is the adversary.** NARC's number must be able to hurt the player at both ends, and the player must be able to see the threshold coming. (Reigns full-or-empty; Frostpunk's grace window.)
5. **The system's lesson lives in the number, not in dialogue.** Cut every line where a coworker explains the thesis. The proxy degrading because of the player's own exploits *is* the Goodhart lesson. (Universal Paperclips.)
6. **Time only moves on actions.** Reading, thinking and scrolling are free. Opening, sending, submitting and approving cost authored minutes. (Already true in `spend()`; keep it.)
7. **Consequences are legible and traceable.** When NARC adapts or a coworker is hurt, the player can point to the minute they caused it. (Beholder's failure: muted, untraceable consequences.)
8. **Keep the content budget flat.** Prefer rule changes, re-cut content and tuning over new scenes. Target stays ~15 minutes.

## Change 1 — Visible Activity becomes a threat

Visible Activity (VA) stays the one visible number, but it gets two failure boundaries, passive drift, and a consequence for the player that lands the same day.

**Drift.** VA falls 1 point per 10 in-game minutes of quiet work (reading in Files, `inspect`, any action with `visible: false`). Today `visible: false` costs a flat −2 per action regardless of length; a 25-minute careful read should hurt more than a 3-minute glance. Implement in `spend()`: `if (visible === false) s.index -= Math.ceil(minutes / 10)`.

**Low boundary: Review.** Below 50 for 30 consecutive in-game minutes, NARC opens a formal review on *you* (reuse `flags.formalReview`, `standing.status = 'review'`). A review is not game over, but it changes the day: Dana's check-in becomes a review meeting that costs 15 minutes, and every later NARC request is mandatory (the `ignore`/`accept` options disappear). The 30-minute grace window is Frostpunk's rule: the player sees the meter go red and has time to act.

**High boundary: Synthetic Activity flag.** Above 90, or above 80 with no task completed in the last 90 in-game minutes, NARC 2.0 flags *you* for possible metric manipulation. This closes the always-careful run (which ends at 80) and the keepalive run (which can hit 95+). Before NARC 2.0 fires (see Change 7), the high boundary does not exist, so the morning rewards gaming and the afternoon punishes it; that is the arms race, taught by the number.

**Visible threshold.** The top-bar NARC status already derives NORMAL / WATCHING / AT RISK / CRITICAL from state (`narcRisk()` in `day-desktop-app.js`). Add the actual boundary lines to the NARC app's VA meter (a red tick at 50, an amber tick at 90 once NARC 2.0 is live) and a countdown line when the player is inside the grace window: "Review opens in 20 min unless activity recovers." This is the one place a countdown is allowed; it is in-game time only.

**Tuning targets** (verify with the bot suite in Build order):

| Policy | Expected end-of-day result |
| --- | --- |
| Always careful, always kind | VA 45–55, review opened once, at least one task missed |
| Always fast, always visible | VA 85+, Synthetic Activity flag, rework and at least one coworker fired |
| Focus Time + keepalive whenever available | VA 90+, Synthetic flag, both time-gaming lines on the ledger |
| Mixed (the intended play) | VA 60–75, no flag, one or two coworker outcomes the player can name |

## Change 2 — Time becomes scarce

The day keeps its action clock (`spend()` already advances time only on actions), but the budget has to bind. Three moves, all tuning rather than content.

**Remove `workUntil`.** The "Current work is caught up" card and its jump-to-next-event button go away. Idle time no longer exists: if nothing is pending, the next scheduled beat fires on the player's next action, whatever it is. Reading remains free. This alone removes 285 skipped minutes from the careful run.

**Raise the cost of care.** Current careful options total 103 minutes of work across six tasks. Double the careful path and leave the fast path alone (Meier: halve or double, don't nudge):

| Task | Fast (unchanged) | Careful today | Careful proposed |
| --- | --- | --- | --- |
| Halcyon vendor | 5 min | 25 | 45 |
| Priya's client | 5 | 25 | 45 |
| Marcus's project | 10 | 20 | 35 |
| Rework (if earned) | 8 | 20 | 30 |
| Carrier exceptions | 8 | 18 | 30 |
| Client handoff | 5 | 15 | 30 |

Careful on everything is now ~215 minutes of tasks plus ~70 of coworker favors plus ~45 of NARC overhead, against deadlines that are not moving. The vendor (11:30) and client (1:00) deadlines already overlap; with 45-minute careful reads the player cannot do both carefully *and* read Priya's draft *and* answer NARC's first review. That is the first real triage of the day, at about 10:15.

**Delayed obligations from kind choices.** Today only *fast* choices create afternoon work (rework). Add one delayed cost per kind choice so helping is never free either:

- Helping Marcus with his second opinion (`marcusFavor: help`) means he loops you into the client call at 2:40 (10 min, interrupts whatever is open).
- Reading Priya's draft (`priyaDraft: help`) means she sends a second draft at 12:20.
- Covering for Luis's dentist appointment (`luisCover: cover`) means the fake vendor meeting shows up in NARC's calendar scan at 3:10 and you have to explain it (5 min of NARC overhead) or let it stand.

Each of these is one `requests` entry with an `at` time and a two-option response, the same shape as `marcusFallout`. None of them need new characters or scenes.

## Change 3 — Reading is the verb

Today the Files app narrates the answer. `Halcyon_Vendor_Renewal.pdf` literally says "The rate table contains a 30% increase buried in the updated commercial terms." Then a button says "Actually read it (25 min)." The player never reads anything. This change rewrites each task file as a real document with the problem actually buried in it, and makes finding it the work.

**Each task file becomes a multi-page document.** Pages are the time unit: opening a file is free, turning to the next page costs 5 in-game minutes (`spend(5, { visible: false })`). The problem is on a specific page, never page one. The player decides how far to read before acting. The decision button (Approve / Reply / Submit) is always present at the top of the document, from page one, with no time label on it.

| File | Pages | What's on the pages | The thing to find |
| --- | --- | --- | --- |
| `Halcyon_Vendor_Renewal.pdf` | 5 | Cover letter, service summary, SLA table, commercial terms, signature page | Page 4, rate table: "Unit rate: $18.20 (prior: $14.00)". Page 1's cover letter says "no changes to commercial terms." |
| `Priya_Client_Escalation.txt` | 4 | Client's complaint thread, shipment record, account notes, Priya's draft reply | Page 3, account note dated last month: client asked for pallets, not cartons. Shipment record (page 2) says cartons. |
| `Marcus_Project_Scope.doc` | 4 | New timeline, feature list, dependency map, Marcus's handoff notes | Page 3: the dashboard polish has no dependents; the handoff context feeds three downstream items. Cutting polish is right; cutting context breaks tomorrow. |
| `Carrier_Exception_Queue.csv` | 3 | Three exception rows, each with a notes page | Page 3, third exception's notes: a routing rule dated 14 months ago that the other two also match. |
| `Client_Handoff_Notes.doc` | 3 | Today's activity log, open risks, client context | The activity log is auto-generated and complete; the risks page is empty until the player writes it (see below). |

**The outcome follows from what the player did, not what they clicked.** When the player hits Approve on Halcyon, the engine checks `s.pages.vendor` (the furthest page read). Reached page 4: the engine treats it as `thorough` (the rate hike is caught). Stopped before: `quick`, and `vendorRisky` is set. The existing `TASK_OPTIONS` outcomes stay; only the *selector* changes from a button to a read-depth check. The player is never told which it was until the consequence lands (procurement at 1:00, or nothing).

**One visible exception: the handoff.** Rather than reading, the handoff is the one writing task. The player picks which of the day's open risks to include from a checklist generated from state (Halcyon rate, client packaging, Marcus's cut, the exception rule), each costing 5 minutes. Including none sends the activity summary. This is the only task where a list is the right UI, because the player is assembling, not discovering.

**Nudges stay in-fiction.** A coworker may say "did you get to the rate table?" (Priya, 10:40, only if the vendor file is open and unread past page 2). No tooltip ever says "check page 4." Gone Home's rule: notes point elsewhere, nobody says you have to.

**Cost of a miss is a consequence, not a fail.** Approving Halcyon at page 2 is a legitimate play. Procurement's rework task arrives at 1:00 as today. What changes is that the player knows they didn't read it, instead of having been told they chose "Skim."

## Change 4 — Discrepancies unlock exploits

This is the Papers Please primitive applied to NARC: the player puts two things that disagree next to each other, and if they form an authored mismatch, a verb appears that wasn't there before. The player holds context NARC can't see, and that context is a tool.

**Mechanic.** Every line in a NARC assessment's "What NARC saw" row has a **Compare with…** button. It opens a picker listing the artifacts the player has *already opened* today: file pages they've turned to, messages they've read, calendar entries, Utilities log lines. Unopened artifacts are not in the list, so the discovery still has to happen. If the chosen pair is an authored discrepancy, the matching verb unlocks in that assessment's "What you can do" row and the pair is logged as evidence. If not, nothing happens except 1 minute spent. There is no "wrong" message. (Confirm by enabling, never by saying "correct.")

**Authored pairs** (six is enough for a 15-minute game; the player needs to find two or three):

| NARC saw | Artifact that contradicts it | Where it is | Verb unlocked |
| --- | --- | --- | --- |
| "Low-input stretch 9:05–9:50 during document work" | Halcyon page 4, rate table | Files | **Attach as context** on your own first review (replaces the current `context` button) |
| "Marcus Reed: late arrival 9:09, pattern: 4 of 5 days" | Transit alert, Route 14, 8:14, "service suspended 22 min" | Utilities › System log | **Submit evidence** on Marcus's case |
| "Luis Perez: presence gap 11:40–11:46" | Luis's message at 11:45 about carrier calls, or the returns queue log | Messages / Utilities | **Add work context** on Luis's case |
| "Priya Shah: 52 message threads, Communication Load elevated" | Client escalation thread header: 31 of 52 threads tagged `client:` | Files, page 1 of the escalation | **Reclassify** on Priya's case |
| "Vendor meeting 1:50–3:00 (Luis)" | No meeting invite exists in Calendar | Calendar | Nothing. This is the trap: the player *created* this discrepancy by covering for Luis, and NARC 2.0 finds it at 3:10 |
| "Sustained input 2:15–2:45, keyboard cadence 112 ms" | `keepalive.pkg` running in Utilities | Utilities | Nothing to unlock. This is what NARC 2.0's Synthetic Activity flag cites against *you* |

The last two rows are the point: the same mechanic that lets the player defend coworkers is what NARC uses against the player once it adapts.

**Evidence is planted in two channels each.** The transit alert is in Utilities *and* Marcus mentions "the transit feed confirms it" in Messages. The rate hike is on page 4 *and* the cover letter's "no changes" line is a tell. A player who skips one channel still has a route. (Golden Idol: several clue paths to one conclusion.)

**What this replaces.** Today each coworker case has a flat `context` button that costs minutes and always works. After this change, `context` only exists once the player has found the evidence. If they haven't, the case has only `leave` and `report`. That is the moral pressure: with nothing found and the clock running, reporting is the fast, visible, score-positive option, and leaving means trusting the system. The player who did the reading has a third option. Nobody has to say "context matters."

**UI note.** The picker is the decided approach (see Decisions). It works on mobile with no special case and is a fraction of the build of cross-window selection. If playtests want a more tactile gesture, cross-window click-to-select can be layered on later without changing the engine: `act('compare', { claim, artifact })` is the same call either way.

## Change 5 — Unlabeled choices

With Change 3, the task buttons lose their labels entirely: Approve, Reply, Submit. What remains are the coworker and NARC requests in Messages, which today are two-button picks like "Help (5 min)" / "Later." Rewrite each as the employee's own line, in three options where the request has three real answers, with no minute costs shown.

**The Ingold triad: accept, reject, deflect.** Two options read as right-vs-wrong; four lose focus. Deflect is the one that changes most play: it's the option that costs less now and more later.

| Request (today) | Today's buttons | Proposed lines |
| --- | --- | --- |
| Priya: read my draft? | Help (5 min) / Later | "Send it over." / "Can't right now, send it as is." / "Send it. I'll read it after." (deflect: she sends, you get a second draft at 12:20 anyway) |
| Marcus: borrow five minutes? | Help (15 min) / Decline (1 min) | "Pull it up." / "Not today." / "Send me the doc, I'll look when I can." (deflect: it sits in Files as a 2-page item; reading it later is what helps) |
| Luis: put a meeting on my calendar? | Cover (3 min) / Decline | "Done." / "I'm not putting a fake meeting on the calendar." / "Just mark it Focus Time yourself." (deflect: he does, and that's one more Focus Time use feeding NARC 2.0) |
| Dana: check-in | Full update (15) / Brief (5) / Trust NARC (2) | "Here's where everything actually is." / "Mostly on track." / "NARC's summary is accurate." (the last only appears with Trusted Operator standing) |
| NARC: first review | Add context (5) / Leave it | Only **Attach as context** (if evidence found) or **Acknowledge**. No free text. |

**Cost is communicated by the world, not the label.** The clock in the top bar moves when the player commits. The NARC meter moves within 100 ms of the clock. If the player wants to know what something costs, they learn by spending, the same way they learn how NARC reads things.

**Keep the Messages rule from the existing spec.** Required beats still show required options only; optional chat prompts return when nothing is pending. Optional chats stay as they are (they're flavor and already cost 2 minutes), except the lines that explain the thesis, which get cut under Change 7.

## Change 6 — Coworker cases and reporting

The three coworker cases (Priya 11:40, Luis 3:05, Marcus 4:20) are the moral core, and today they're the flattest part of the game: a `context` button that always works, a `report` button that's labeled as such, and the outcome announced in the next message. Four changes.

**Context requires evidence (from Change 4).** The defend option only exists if the player found the discrepancy. A player who skipped the reading walks into Luis's case at 3:05 with only *leave* and *confirm*.

**Reporting is composed, not clicked.** NARC's case screen shows three or four "observations" it has collected about the coworker, each a true fact with two readings (Orwell's datachunks). The player picks which to endorse. Luis's case: "6-minute gap at 10:15" / "11-minute gap at 11:40" / "Away at 1:50–3:00, calendar: vendor meeting" / "Returns queue cleared 3:40". Endorsing two or more gaps with no work context is what fires him. Endorsing the returns-queue line and the dentist cover is what saves him, if the player covered for him. The verb is **Endorse**, never **Report**. The player authors the record.

**It is the fast move.** Endorsing an observation takes 1 minute and reads as collaboration (+2 VA). Attaching context takes 6–8 minutes and is quiet. Leaving takes nothing. Under a 3:05 case with the handoff due at 4:15 and VA sitting at 48, the honest player feels the pull. That pull is the game.

**Consequences arrive later, through the same inbox.** Today Luis replies instantly with "Well. There goes my afternoon." Move the outcome to the next hour-block: at 4:05 a People Operations email, "Headcount adjustment: Customer Operations," and Luis's thread goes grey. Marcus's outcome lands in the end screen, because his case is at 4:20. The player sees the name in the same Email app they've been using all day. Cut the instant quip.

**Culture Champion stays, with one fix.** The nomination (one coworker, routes their next NARC action to human review) is a good mechanic because it forces the player to pick who to protect before knowing who'll need it. Keep it, but move the email earlier (10:30 instead of 11:35) so the choice is made before Priya's case opens, with less information.

**Trust stays hidden.** `s.trust` keeps driving the "someone else spoke up for them" outcomes when the player leaves. It is never shown as a number. The player learns it from who covers for whom.

## Change 7 — NARC adapts because of you

Today NARC 2.0 fires at 1:30 on a timer (`spreadHappened`), whether or not the player used Focus Time. The handoff doc even calls this out as intentional. The research says the opposite: adaptation only reads as counterplay when the player can trace it to their own actions. Make the trigger the player's, and make the lesson the number, not Priya's line about it.

**Trigger on the player's own gaming.** NARC 2.0 fires when `s.narc.focusUses + (keepaliveUsed ? 2 : 0) >= 3`, *or* at 2:30 regardless (the team spread, as a floor so the beat always happens). A player who games early gets NARC 2.0 by 11:00 and spends the afternoon under the high boundary. A player who never games it sees it at 2:30 and loses little. Both are legible: the early trigger is clearly your doing.

**Show NARC's inputs, hide the weights.** The NARC app's "What NARC saw" row lists the proxies by name: idle minutes, active-window switches, calendar labels, message count, input cadence. Round constants only (NARC reads every 30 minutes; a gap counts after 5 minutes). Never show how they combine. (Cultist Simulator: memorable constants, negative space.)

**Give NARC a refresh lag.** NARC's read of the desktop updates on the half hour. A Focus Time label or a keepalive spoof works until the next read; the player can see the next read's time in the NARC app. This makes gaming a timing game rather than a button, and it's Hitman's "shared knowledge updates periodically" rule.

**The lesson lives in the number.** Cut these lines, which say the thesis out loud:

- Priya, on NARC 2.0: "We all found the same workaround, so now the workaround is the pattern. Cute."
- Luis: "Accurate measurement. Extremely incomplete story."
- Luis: "Strong signal. Wrong story."
- The `narcResponse` note: "the rule keys on the pattern, not the person."
- Both intro emails' sentences explaining that proxies are not work quality.
- Tutorial step 4: "signal, interpretation, consequence. The first two are not the same thing."

These are cut as *scripted* beats. The ones with a real joke in them (Luis's two, and Priya's "true, technically") move to `CHAT_OPTIONS` as optional replies: the player has to ask Luis how Ops is going to hear "Strong signal. Wrong story." It costs two minutes and nobody is told the thesis without having asked. Keep the raccoon. Keep Marcus's "I hate that the dumbest sentence I've said today has the best evidence." Those are a person being funny about a situation, not the designer explaining the design. Rule of thumb: if a line would work as a slide in a talk about Goodhart's law, it's not a scripted beat.

**Focus Time reversal is already right.** +8 before adaptation, −1 after. Keep it, but after NARC 2.0 make each use also add to the Synthetic Activity evidence NARC cites against the player at the high boundary.

## Change 8 — End screen

The #106 end screen already has the right sections (Your day, NARC metrics, People, The contradiction). Three additions make it a payoff rather than a summary, and all three come from state the engine already has.

**A ledger, not a paragraph.** Replace the time-breakdown sentence with a Papers Please ledger: one line per thing that happened, each with the minute it happened and what it did to VA. "9:05 Opened Halcyon renewal, read to page 4 (45 min, −5 VA)" / "11:40 Endorsed two observations on Priya (2 min, +2 VA)" / "3:10 NARC found the vendor meeting on Luis's calendar (−4 VA, Synthetic Activity evidence)." The player can point at the minute where the day turned. Everything here is already in `s.log`; it just needs the VA delta recorded per entry.

**A bonus table with the unearned ones greyed out.** A fixed list of named, thresholded, partly mutually exclusive outcomes. Earned ones light up; the rest show greyed with their condition. This is how the player learns there was another path without being told what it was. (Slay the Spire's score table.)

| Name | Condition | Excludes |
| --- | --- | --- |
| By the Book | Every task completed with full reading | Inbox Zero |
| Inbox Zero | Every request answered within 10 in-game minutes | By the Book |
| Clean Record | No review opened, no Synthetic flag | — |
| Nobody Fired | All three coworkers employed at 5:00 | Team Player |
| Team Player | NARC classified you as strong collaboration (two endorsements) | Nobody Fired |
| Ghost | VA never above 60, no flags, nothing missed | Trusted Operator |
| Trusted Operator | Accepted the flattering read and kept it all day | Ghost |
| Raccoon Witness | Submitted the transit alert on Marcus's case | — |

**One rank.** Below the table, a single aspirational rank that only the deliberate, mixed run reaches: **Employee of the Month** (no review, no flag, nobody fired). It does not require missing a task; the time budget makes that point on its own, and if a run can still do everything, that's a tuning bug for the bot suite to catch. The wording is NARC's, sincere and corporate. The bad runs get NARC's rank too ("Within Normal Range," "Flagged for Review," "Exemplary Engagement" for the keepalive run, which is the joke).

**Replace the moral grade with the question.** The end screen currently has a "contradiction" section that explains the irony ("NARC rated the day well. A coworker lost their job during it."). Keep the facts side by side, cut the sentence that connects them. End on one line, Frostpunk's register: "NARC's assessment is final. Was it right?" Then the ledger.

**Replay hooks in localStorage.** Endings found (N of 8 bonuses), personal best VA, and the one-line NARC rank from last time, shown on the login screen under "Previous session." No backend. Wrap every read in try/catch and render without it.

## Build order

Four phases, each verified by the bot suite before the next starts. Phases 1 and 2 are built together before the first playtest, so the first run Paige plays has both the scarcity and the paged documents; playing Phase 1 alone would mean feeling the pressure while the choices are still labeled buttons. Phases 3 and 4 each get their own playtest.

| Phase | Changes | Touches | Done when |
| --- | --- | --- | --- |
| 1. Make it bite | Change 1 (score threat), Change 2 (scarcity) | `day.js`: `spend()`, `checkThresholds()`, `TASK_OPTIONS` minutes, three new `requests`; `day-desktop-app.js`: remove `renderQuietAction`, add meter ticks | Always-careful bot opens a review and misses a task. Always-fast bot gets the Synthetic flag. |
| 2. Reading is the verb | Change 3 (paged files), Change 5 (unlabeled requests) | `day-desktop-app.js`: `FILES` rewritten as page arrays, `renderFiles` pager, `TASK_OPTIONS` labels removed; `day.js`: `s.pages`, `act('page')`, `act('task')` reads depth instead of approach; handoff checklist | A playtester finds the Halcyon rate without being told it's there. |
| 3. Evidence | Change 4 (discrepancy pairs), Change 6 (cases, endorse, delayed outcomes) | `day.js`: `s.evidence`, `act('compare')`, authored pair table, case observations; `day-desktop-app.js`: Compare picker, case screen rewrite | A playtester saves Marcus with the transit alert and can say how. |
| 4. Adaptation and payoff | Change 7 (player-triggered NARC 2.0, lag, line cuts), Change 8 (ledger, bonuses, rank, localStorage) | `day.js`: trigger, read schedule, `ending()` ledger and bonus evaluation; `day-desktop-app.js`: `renderNarc` inputs row, `renderEnd` rewrite, login screen | All four tuning-target rows in Change 1 hold. |

**Bot suite** (extend `test-day.mjs`). Five constant-policy bots plus one random bot, each run to 5:00; the suite fails if any of these is false:

- No constant policy ends with VA in 60–75 *and* no flag *and* nobody fired. (No dominant strategy.)
- The best-scoring run spends at least 440 of 480 minutes by choice. (Budget binds.)
- Always-careful opens a review; always-fast gets the Synthetic flag.
- Every coworker outcome (employed / warning / fired / protected) is reachable by some policy.
- At least one of the eight bonuses is unreachable by every constant policy. (The mixed run is required for it.)

**Unchanged.** Single day. Deterministic. Desktop as the board. Meridian name. The Messages rule. Culture Champion. The raccoon. `game.js` and the week build stay archived.

**Copy review** stays separate, per the handoff: the line cuts in Change 7 go into `docs/GAME_COPY_EDITABLE.md` as `DELETE` rows for Paige to approve, not applied silently.

## Decisions

Settled with Paige on 2026-10-21. These are inputs to the build, not open items.

| Question | Decision | Why |
| --- | --- | --- |
| Page-turn cost | 5 min per page, files of 3–5 pages | Halcyon's full read is ~20 min; skimming two pages is a real temptation without longer files to write |
| Evidence comparison UI | Picker inside NARC ("Compare with…" lists opened artifacts) | Discovery is where the game is; the gesture is polish. Works on mobile, quarter of the build. Cross-window selection can be layered on later |
| Can a review end the day early? | No. A review changes the afternoon and shows on the end screen; the player keeps their job | Strongest satire is living with the record; avoids Beholder's "dark for its own sake" |
| Thesis lines | Cut as scripted beats; the funny ones move to optional chat replies | Keeps the voice; nobody hears the thesis without asking |
| Employee of the Month | Outcomes only: no review, no flag, nobody fired | The time budget makes the "can't do everything" point; the rank shouldn't restate it |
| First playtest | After Phases 1 and 2 together | The first run should be the real thing, with paged documents, not pressure on top of labeled buttons |
