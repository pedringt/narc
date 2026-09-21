# NARC: Implementation State (read this first when picking the build up)

This describes what is actually built on `prototype-v1` / `main`, why it works the way it does, and what is still open. It is written for a fresh chat or agent. Where it disagrees with an older handoff, **this file describes the code; the design docs describe intent**. When you change behavior, update this file.

Last updated after the "view-only team alerts / advice in Messages / calendar covers" pass.

## Status

- Live prototype: **https://narc-opal.vercel.app** (Vercel production, deploys from `main`).
- `prototype-v1` is the working branch. Its Vercel previews are **login-protected**, so reviewers cannot open them. Anything meant for reviewers must reach `main`.
- **Authority:** never merge or push to `main`, and never promote to production, unless Paige explicitly names `main` or a public release in that turn. Passing tests is not permission. Feature work goes `prototype-v1` -> PR -> `main`. Do not delete `prototype-v1`.
- Vercel is on the Hobby plan: batch pushes rather than pushing after every small change.
- No backend, no accounts, no persistence, **no live AI** (deliberate; see `CORE_GAME_SPEC.md`).

## What the game is right now

One work week on a fictional work laptop. The player is **Employee 4417**, a human. NARC (Networked Assessment & Risk Coordination) is monitoring software on that laptop. Core loop: NARC flags someone; NARC only sees proxies; the player finds the human context in other apps and decides whether to help, hurt, or ignore, using ordinary computer actions.

Design rules the build follows (all from the docs, see `DESKTOP_INTERACTION_REWORK.md`):

- **The desktop is the game board.** Apps are progressively disclosed instead of all appearing at once: Email starts visible; Messages + Calendar arrive with Dana's orientation; NARC appears with the first NARC case; Files/Utilities appear when evidence or a tool is introduced. No scenario cards, no "What do you do?", no encounter numbers, no Continue buttons.
- **Hide the branching structure, not the affordances.** Every incident leaves at least two leads (NARC's case, a coworker message, a "new" dot on an app).
- **NARC is the pressure; coworkers and the desktop are the counterplay.** Direct questions from Dana now preserve visible agency instead of presenting only a report/narc reply: relevant moments include protect/help, report/expose, and neutral/decline options.
- **NARC shows everyone's alerts to everyone, "for transparency". You can only act on your own.** Helping or hurting coworkers happens in Messages, through Dana, or with evidence and tools in the other apps.
- **Nothing is decided by a hidden timer.** Exploring is never inaction. Doing nothing is legible: dismiss your own alert, or **Log off for the day** (a dialog says what NARC will do first).
- NARC is sometimes right (Priya really did miss an escalation; the raccoon was real). The failure is treating partial signals as the whole truth.

## Files

| File | Role |
|---|---|
| `game.js` | The whole deterministic engine and all game content. Pure functions, plain-data state. |
| `app.js` | The desktop renderer. Only draws state and turns clicks into actions. No game rules. |
| `style.css` | Desktop, apps, NARC's dark monospace window, toasts, mobile layout. |
| `index.html` | One `#desk` div plus the module script. |
| `test.mjs` | `node test.mjs`. About 18 s. |

Plain static site, ES modules (serve over http, not `file://`). QA aid: add `?tick=150` to the URL to speed up the game clock (`tick=1000` is normal; idle timers do not exist, so it is safe to script).

## Engine in one screen

```
newGame()                -> state
tick(state)              -> state    // one game second; delivers anything due
act(state, action)       -> state    // something the player does
```

Read-only helpers the UI uses: `caseView`, `replies`, `canAttachHelper`, `fileActions`, `calendarAction`, `narcSections`, `attention`, `ownCase`, `unread`, `logoffInfo`, `clockText`, `ending`, `achievements`.

- **Everything is plain data and pure.** `act`/`tick` never mutate their input (tested). `tick` copies shallowly when nothing is due; everything else clones.
- **Incidents arrive on the clock; consequences are scheduled deliveries.** Deliveries are data in `state.pending`: `msg`, `notice`, `mail`, `score`, `cal`, `mark`, `shown`, `offline`, `nudge`, `arm`, `end`. A delivery tagged `when: 'e3'` is dropped if that incident is already resolved (used for follow-up hints and NARC nudges).
- **`resolve(state, branch)`** closes the open incident, records `state.picked[incident]`, runs the branch (which only schedules deliveries), then arms the next incident `GAP` (14 s) after the last real delivery. Consequences start after any remaining unguarded arrival chatter (`state.base`), so nothing overlaps even for a fast player.
- **Orientation gate:** nothing consequential is scheduled until the player acknowledges the welcome email, checks the Calendar, and replies to Dana (`oriented`). The first case then arrives `ORIENT_LEAD` (22 s) later.
- **NARC 2.0 is a beat:** the announcement lands (`state.awaiting`), NARC nudges about it, and the scan only runs after the player opens the email. The scan now also generates a forward-looking behavioral forecast for Employee 4417 so the AI arc visibly moves from signals → inference → prediction.
- **Marks** (`state.marks`) are the small blue "new" dots on the dock (Files, Calendar, Utilities, Email). Viewing the app clears it.
- **Action vocabulary** (`act` `do:` values): `view`, `open`, `gone` (close a toast; decides nothing), `clear`, `ack`, `dismiss` (own alert only), `logoff`, `case` (only the note on your own case), `reply` (a Messages chip), `attach` (helper to Luis), `sendFile` (file to Dana), `markFocus`, `helper` (`install` / `toggle` / `randomize`), `nominate`, `addEvent`, `restart`. Invalid actions return the state unchanged.
- **Removed on purpose:** the old idle-timeout fallback, "Look closer", result/afterward screens, the "what you know about NARC" list.

## The week

Times are the in-game clock; real time is roughly one game second per second.

| # | When | Case | NARC's alert (visible to all) | Player's routes |
|---|---|---|---|---|
| orient | Mon 09:02 | (none) | People Ops email, Dana | acknowledge, check Calendar, reply to Dana |
| e1 | Mon 12:14 | **You**: low visible activity | "Visible activity below team baseline" | dismiss (`wait`) · type a note in NARC (`explain`) · install and switch on the Mouse Activity Helper (`jiggle`) · mark the contract block as Focus time in Calendar (`focus`) |
| e2 | Tue 10:14 | **Luis**: restroom inactivity | view-only | tell Dana the flag seems accurate (`confirm`) · decline to confirm / log off (`ignore`) · attach the helper in Luis's thread, needs it installed (`script`) · suggest Focus time (`focus`) · suggest explaining it to NARC (`badtip`) |
| e3 | Wed 10:52 | **Marcus**: attendance | view-only | tell Dana the trace does not match his story (`truth`) · tell Dana there is missing context / add a calendar entry (`paper`) · decline to confirm / log off (`stay`) · suggest adding the entry now (`paper`) · suggest adding it later (`badtip`) |
| update | Wed 15:00 | NARC 2.0 | People Ops email | read it; scan follows |
| e4 | Thu 09:30 | **Priya**: communication load | view-only | suggest posting less (`quiet`, can eventually get her fired when Collaboration collapses) · suggest an in-person sync (`sync`) · nominate her from the Culture email (`champion`) · log off (`leave`) |
| e5 | Thu 14:14 | **Luis returns** (variant by history) | view-only | see below |
| e6 | Fri 11:20 | **Marcus returns** (variant by history) | view-only | see below |
| end | Fri 17:00 | weekly report | | replay |

Return variants:

- **e5, Luis gamed (`g`)** (you gave him the helper): NARC 2.0 caught the fixed interval. Tell Dana the script was yours (`admit`) · tell Dana it was his (`blame`) · randomize his copy in Utilities (`human`) · log off (`auto`).
- **e5, Luis covered (`c`)** (the Focus-time tip): resolves itself on arrival ("excellent boundaries"). No decision.
- **e5, Luis neither (`n`)**: PIP. Ask Dana to relabel his time (`label`) · send Dana his ticket output from Files (`output`) · log off (`letit`, he is fired).
- **e6, Marcus documented (`g`)**: workshop via Dana (`workshop`) · report the documents via Dana (`expose`) · reply "absence approved" in his thread (`approve`, also the log-off default).
- **e6, Marcus burned (`b`)**: send Dana the sanctuary slip from Files (`vouch_trace`) · backdate a calendar entry (`backdate`, caught as retroactive) · log off (`let`, he is fired).

### NARC 2.0 rules (the arms race)

- The **mouse helper is caught only while it is switched On** at the announcement. Off means not caught.
- **Calendar covers (Focus time) and existing-before-the-flag records are not caught.** Records created after a flag are "retroactive".
- The helper can only be handed to Luis **after you have installed it**.

### Endings and achievements

Coworker statuses: employed / promoted / warning / heavily monitored / absurdly rewarded / terminated. The player's own result can now also be **TERMINATED**: two or more integrity flags cause NARC to recommend separation. One flag produces an Employee Integrity Review. This allows endings where the player is fired while some or all coworkers remain employed. Seven achievements: Nobody Gets Fired Today, Two Fewer Problems, Technically Compliant, The Boy Who Cried Bird, Do Not Ask (never open the restroom alerts), Culture Champion, **Friendly Fire** (two bad tips that backfire).

## Pacing (asserted by tests)

- A brisk player who clears everything immediately: about 5-6 minutes.
- A player who reads every coworker hint before deciding: about 8 minutes (asserted 7-10).
- Exploring and experimenting add to that. Stated target: about 8-10 minutes healthy, 5-15 overall.
- No two notifications land within 3 seconds of each other (asserted across several routes).

## Tests

`node test.mjs` covers: orientation and the gate, the welcome email's four jobs, view-only team cases, persistent toasts and "closing a toast decides nothing", NARC nudges that escalate after NARC 2.0, active vs history in NARC, no hidden fallback, the helper (install then on, off means not caught), Focus-time cover surviving NARC 2.0, natural-language coworker choices, what each suggestion does, Send to Dana, first-contact messages standing alone, at least two leads per incident, the Culture email arriving before Priya's flag, the NARC 2.0 beat, save/fire/player-termination paths, all seven achievements, ending, restart, purity, invalid actions, cadence, run length, and **all 3,120 routes reaching an ending** with no junk text ("undefined", "NaN").

I mutation-checked the important rules by deliberately breaking them and confirming the tests fail. Do the same when you change a rule.

## Decisions made by the implementer (change freely, but check with Paige)

- Dana's line after orientation: "I'll leave you to the Halvorsen read-through."
- Focus time can be toggled on any of your own calendar events; only the Monday contract block matters to the game.
- Bad advice does not cost Luis's or Marcus's trust; reporting them does (deniable harm).
- Dana relays much of the official input. Her thread can now expose up to three natural-language replies when a direct question needs protect/report/neutral agency; watch whether this still feels too menu-like.
- The NARC 2.0 announcement nags until it is read (there is no way to skip it).
- Log off is only enabled while something is open; otherwise nothing is waiting on you.

## Known gaps and open questions

- **Nina and Maya are not in the slice**, and no new scenarios are planned until playtesting judges the desktop model.
- Messages has no free-text replies, only chips. There is one window at a time, no sound, no keyboard shortcuts.
- **Real-world monitoring claims are not cited inside the game.** `RESEARCH_ALGORITHMIC_MANAGEMENT.md` distinguishes real capabilities from fictional escalation; verify against current sources before any portfolio case study.
- Dana's chip load may still feel menu-like. The latest pass fixes the worst case (direct questions with only one "narc on them" response), and coworker advice no longer exposes "Sincere tip" / "Polite sabotage" labels. Watch whether the remaining conversational chips still feel too much like branch labels.
- Accessibility has had only basic attention (button semantics, labels, focus restoration). It has not been audited.
- Mobile layout was checked at 375 px in a browser pane, not on a real phone.
- The test suite takes about 18 s because of the exhaustive routes; sample them if that becomes a problem.
- Issue #5 tracks the rework and holds the latest playtest questions.

## Which incident teaches which AI concept

The game is deterministic on purpose. The learning hook is: **the player learns how an AI-like system fails by learning to exploit it.** This maps the concepts in `CORE_GAME_SPEC.md` and `RESEARCH_ALGORITHMIC_MANAGEMENT.md` to where the current slice shows them. None are explained in prose; the player infers them from the contradiction.

| Concept | Where it shows up |
|---|---|
| Proxy metric vs the real goal | e1: NARC counts keyboard and mouse input while you read the contract on paper and caught a $40,000 error. e2: NARC sees restroom-corridor pings; the support queue shows Luis at 112% of the median. |
| Missing context | e1, e2, e3 (the raccoon is real and covers 11 of 112 minutes), e6 burned (NARC's own location trace shows the sanctuary but is weighted at 20%). |
| Confidence vs truth | e3: 38% credibility for a story that is partly true. e5 gamed: 96% "automated presence". e6 documented: 94% credibility and "Documentation Excellence" for fabricated paperwork. |
| Metric gaming (Goodhart) | e1 helper, e2 helper, e3 calendar entry, e4 Culture Champion badge, Focus time. |
| Behavior changes when measured | Luis's fixed-interval script, Priya going quiet, Marcus's calendar entry. |
| Feedback loops | e4 "post less" first fixes Communication Load, then causes a social-withdrawal flag, collapses Collaboration Index, and can terminate Priya for following the prior recommendation. e2 "agree with the flag" or "write NARC an explanation" tightens Luis's threshold from 18 to 5 minutes, which becomes the PIP in e5. |
| Conflicting institutional metrics | e4: Collaboration Index 97 (best in Operations) vs Communication Load "elevated", from the same message count. |
| Anti-gaming arms race | NARC 2.0: the helper is caught while On; a calendar cover and records created before the flag are not; records created after a flag are "retroactive". |
| History outweighs new evidence | e6 burned: prior flags carry 80% weight, today's evidence 20%. |
| Human review is thin | Dana mostly says "I'll pass that along to NARC". A manager relaying peer input into an automated system is the oversight. |
| Rising authority raises the stakes | NARC 2.0, then "Automatic action: Performance Improvement Plan" and "Attendance Integrity Termination" pending on a confidence score. |
| NARC is sometimes useful | Priya's flag matches a real missed escalation and the coaching improves reply time by 2 h 40 min; Marcus's goose is real. |

Not demonstrated yet (future scenario bank in the research doc): attrition-risk prediction, AI-adoption scoring, influence-network inference, sarcasm and alignment inference, compulsory wellness, physiological monitoring, preemptive intervention.

## Partly built: NARC gets more annoying as the week goes on

The docs ask for NARC to become "more frequent, more invasive, and more absurd". What exists:

- One polite reminder per unresolved case at first (`Review pending ... No action is required`), two pointed ones after NARC 2.0 (`Unreviewed cases may appear in team reports`, `Authentic activity is more valuable than simulated activity`).
- The announcement nag until the NARC 2.0 email is read.
- One ambient post-upgrade baseline/deviation notification even when there is no explicit case.
- The tray, the Team alerts section, and the Integrity flags counter appearing after NARC 2.0.

What the docs describe that is **not** built:

- A broader pattern of unprompted corporate nudges throughout the week; only one ambient baseline/deviation nudge is built today.
- More notification volume from Wednesday onward as its own escalation signal, beyond the current single ambient nudge.
- NARC restricting or altering actions inside other apps (for example a disabled utility, warnings inside Messages or Calendar).

## Discussed but not built

Ideas from playtesting conversations that were proposed and liked but deliberately left out of this pass, so a new chat does not think they were forgotten or rejected:

- **Priya:** a "mute her out of channels" action as an additional hurt route. Her current "post less" route can already end in termination, so this is optional rather than necessary for agency.
- **Marcus:** forwarding him the transit alert from Utilities into his thread as a help route, and deleting his cover story from his calendar as a hurt route.
- **Luis:** editing his calendar directly. Today it is a tip only, and he adds the blocks himself.
- **NARC "Peer Insight"** ("do you agree this flag is accurate?"). Removed when team alerts became view-only. Agreeing now happens by telling Dana.
- **Making Dana less of the central channel** if playtests find her chips menu-like.

Untested or unverified: the Focus-time toggle on your own non-contract calendar events only changes its label. The exhaustive route test is slow enough (about 18 s) that sampling may be worth it later.

## Latest Paige playtest findings now implemented on `prototype-v1`

- Progressive disclosure: do not show side-nav apps before the player has a reason to understand them. Email is the only initial dock app; other surfaces appear as orientation/incidents introduce them.
- Dana no longer corners the player into a single reporting response when she asks about Luis/Marcus; direct questions expose help/protect, report/expose, or neutral/decline choices where the scenario supports them.
- Copy cleanup from the live run: replaced the awkward "Saw the dip..." Dana line, Priya's "lunch workflow" line, Luis's repeated "unavailable" joke, and Marcus's over-written bird-workshop exchange.
- NARC case detail now labels the AI loop explicitly as **workplace signals → NARC inference → company action**, with "What NARC observed" / "What NARC inferred" headings. Incident notifications themselves now also surface the inference and confidence so the AI layer is visible even if the player does not open every NARC case.
- NARC 2.0 now emits a deterministic **Behavioral forecast** (predicted policy-workaround likelihood) based on the player's recent workaround signals, making prediction visible without adding a live model.
- Player termination is now a real ending at 2+ integrity flags.
- The ending action is now **Replay this week**, not "start a new week," because replay intentionally resets to the same Monday orientation so the player can try different choices.
- Coworker reply chips were rewritten to sound like normal Messages replies instead of exposing design labels such as "Sincere tip" and "Polite sabotage."
- NARC now emits one ambient post-upgrade workstyle/baseline notification so it begins to feel like a system observing the player even between explicit cases.

## Case-study capture

A living source document now exists at `docs/CASE_STUDY_NOTES.md`. Update it when a meaningful product decision, playtest finding, failed assumption, research insight, or attribution detail emerges. It is intentionally not polished public copy.

## Suggested playtest questions

1. Did the first 90 seconds (email, Dana, Calendar, reply) teach the workstation without feeling like a tutorial?
2. Did each incident tell you what NARC thought, and give you at least two places to look?
3. Did the tray and "Needs attention" vs "Team alerts" tell you at a glance whether NARC wanted something from you?
4. Did you find at least two "I gamed NARC" moments without help? Was any coworker hint too pushy?
5. Was "see everyone's alerts, act only on your own" funny, or confusing?
6. Did the coworker reply choices feel like normal conversation rather than game-menu labels, and did the aftermath make the cause clear?
7. Did Focus time vs the mouse helper read as two different exploits?
8. Roughly how long did a first run take?
