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

- **The desktop is the game board.** Apps: Messages, Email, Calendar, Files, Utilities, NARC. No scenario cards, no "What do you do?", no encounter numbers, no Continue buttons.
- **Hide the branching structure, not the affordances.** Every incident leaves at least two leads (NARC's case, a coworker message, a "new" dot on an app).
- **NARC is the pressure; coworkers and the desktop are the counterplay.**
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
- **NARC 2.0 is a beat:** the announcement lands (`state.awaiting`), NARC nudges about it, and the scan only runs after the player opens the email.
- **Marks** (`state.marks`) are the small blue "new" dots on the dock (Files, Calendar, Utilities, Email). Viewing the app clears it.
- **Action vocabulary** (`act` `do:` values): `view`, `open`, `gone` (close a toast; decides nothing), `clear`, `ack`, `dismiss` (own alert only), `logoff`, `case` (only the note on your own case), `reply` (a Messages chip), `attach` (helper to Luis), `sendFile` (file to Dana), `markFocus`, `helper` (`install` / `toggle` / `randomize`), `nominate`, `addEvent`, `restart`. Invalid actions return the state unchanged.
- **Removed on purpose:** the old idle-timeout fallback, "Look closer", result/afterward screens, the "what you know about NARC" list.

## The week

Times are the in-game clock; real time is roughly one game second per second.

| # | When | Case | NARC's alert (visible to all) | Player's routes |
|---|---|---|---|---|
| orient | Mon 09:02 | (none) | People Ops email, Dana | acknowledge, check Calendar, reply to Dana |
| e1 | Mon 12:14 | **You**: low visible activity | "Visible activity below team baseline" | dismiss (`wait`) · type a note in NARC (`explain`) · install and switch on the Mouse Activity Helper (`jiggle`) · mark the contract block as Focus time in Calendar (`focus`) |
| e2 | Tue 10:14 | **Luis**: restroom inactivity | view-only | tell Dana he's away a lot (`confirm`) · log off (`ignore`) · attach the helper in Luis's thread, needs it installed (`script`) · Sincere tip: focus time (`focus`) · Polite sabotage: explain to NARC (`badtip`) |
| e3 | Wed 10:52 | **Marcus**: attendance | view-only | tell Dana the truth (`truth`) · log off (`stay`) · add a calendar entry on the team calendar (`paper`) · Sincere tip: add the entry (`paper`) · Polite sabotage: add it late (`badtip`) |
| update | Wed 15:00 | NARC 2.0 | People Ops email | read it; scan follows |
| e4 | Thu 09:30 | **Priya**: communication load | view-only | Polite sabotage: post less (`quiet`) · Sincere tip: in-person sync (`sync`) · nominate her from the Culture email (`champion`) · log off (`leave`) |
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

Coworker statuses: employed / promoted / warning / heavily monitored / absurdly rewarded / terminated. The player's own result: model employee / still employed / on watchlist / under review (from the Visible Activity Index and integrity flags). Seven achievements: Nobody Gets Fired Today, Two Fewer Problems, Technically Compliant, The Boy Who Cried Bird, Do Not Ask (never open the restroom alerts), Culture Champion, **Friendly Fire** (two bad tips that backfire).

## Pacing (asserted by tests)

- A brisk player who clears everything immediately: about 5-6 minutes.
- A player who reads every coworker hint before deciding: about 8 minutes (asserted 7-10).
- Exploring and experimenting add to that. Stated target: about 8-10 minutes healthy, 5-15 overall.
- No two notifications land within 3 seconds of each other (asserted across several routes).

## Tests

`node test.mjs` covers: orientation and the gate, the welcome email's four jobs, view-only team cases, persistent toasts and "closing a toast decides nothing", NARC nudges that escalate after NARC 2.0, active vs history in NARC, no hidden fallback, the helper (install then on, off means not caught), Focus-time cover surviving NARC 2.0, labelled advice, what each tip does, Send to Dana, first-contact messages standing alone, at least two leads per incident, the Culture email arriving before Priya's flag, the NARC 2.0 beat, save and fire paths, all seven achievements, ending, restart, purity, invalid actions, cadence, run length, and **all 3,120 routes reaching an ending** with no junk text ("undefined", "NaN").

I mutation-checked the important rules by deliberately breaking them and confirming the tests fail. Do the same when you change a rule.

## Decisions made by the implementer (change freely, but check with Paige)

- Dana's line after orientation: "I'll leave you to the Halvorsen read-through."
- Focus time can be toggled on any of your own calendar events; only the Monday contract block matters to the game.
- Bad advice does not cost Luis's or Marcus's trust; reporting them does (deniable harm).
- Dana relays most official input, which gives her thread up to two chips at a time.
- The NARC 2.0 announcement nags until it is read (there is no way to skip it).
- Log off is only enabled while something is open; otherwise nothing is waiting on you.

## Known gaps and open questions

- **Nina and Maya are not in the slice**, and no new scenarios are planned until playtesting judges the desktop model.
- Messages has no free-text replies, only chips. There is one window at a time, no sound, no keyboard shortcuts.
- **Real-world monitoring claims are not cited inside the game.** `RESEARCH_ALGORITHMIC_MANAGEMENT.md` distinguishes real capabilities from fictional escalation; verify against current sources before any portfolio case study.
- Dana's chip load may still feel menu-like. Watch for that in playtests.
- Accessibility has had only basic attention (button semantics, labels, focus restoration). It has not been audited.
- Mobile layout was checked at 375 px in a browser pane, not on a real phone.
- The test suite takes about 18 s because of the exhaustive routes; sample them if that becomes a problem.
- Issue #5 tracks the rework and holds the latest playtest questions.

## Suggested playtest questions

1. Did the first 90 seconds (email, Dana, Calendar, reply) teach the workstation without feeling like a tutorial?
2. Did each incident tell you what NARC thought, and give you at least two places to look?
3. Did the tray and "Needs attention" vs "Team alerts" tell you at a glance whether NARC wanted something from you?
4. Did you find at least two "I gamed NARC" moments without help? Was any coworker hint too pushy?
5. Was "see everyone's alerts, act only on your own" funny, or confusing?
6. Did the advice labels (Sincere tip / Polite sabotage) feel right, and did the aftermath make the cause clear?
7. Did Focus time vs the mouse helper read as two different exploits?
8. Roughly how long did a first run take?
