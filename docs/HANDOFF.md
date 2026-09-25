# NARC Handoff

## Current status (2026-09-25)

**The single-workday build is now the canonical NARC experience (#74).** `index.html` and `day.html` both open it (same content, `day.js`/`day-app.js`/`day.css`). The original one-week prototype (`game.js`/`app.js`) is archived at `week.html` only — not linked from the canonical build, kept for reference. `main` is the only branch. `node test.mjs` and `node test-day.mjs` are both green.

**What ships and what's archived:**

- **Canonical (`/`, `/day.html`)**: the single-workday core loop — issues #66–#69. Time is spent, not ticked; 3 real-work tasks with a visible-vs-actual tension; a Focus Time exploit that NARC adapts to mid-afternoon; afternoon obligations gated on morning choices (rushed calls come back due); a single contextual "Work until..." action replacing repeated filler clicks. See `day.js`'s own header comment for the full design rationale.
- **Archived (`week.html` only)**: the original one-week build. Desktop-reworked before being superseded: multiwindow desktop with a compact bottom dock, a Browser app, The Loop as home, a peer-reporting/social-consequence system (Trusted Reviewer status, a paranoia counter, collective-resistance/paranoid-collapse endings, a resignation beat), Culture Champion, an eyes mark. A GitHub issue audit (2026-09-24) closed 11 issues confirmed already implemented there (#51–#56, #58, #59, #61–#65) before it was archived — see their closing comments if you need to verify any of it. It is not being developed further; treat it as reference only.

**What's genuinely next, in order:**

- **#75** — pre-deploy regression/smoke gate for the canonical build, now that #74's integration is done.
- **#70** — a fresh-player playtest of the canonical experience, specifically for whether "what should I do next?" stays interesting. Needs a real playtester, not more code.
- **#42** — Employee 4417's personal-stakes arc (was scoped to the old week; needs re-scoping to the day build if pursued). Not a deploy blocker.
- **#57** — Messages/dialogue audit (was scoped to the old week, now archived — lower priority than before). Not a deploy blocker.
- **#60** — cross-app evidence chains (same caveat as #42/#57 — scoped to the archived week).
- **#45** (promotion/replay/settings satire layer) and **#48** (invasive personalization) stay explicitly parked/deferred — do not build without Paige asking.

Do not start more feature work on the canonical build ahead of #70 or #75 — both are real gates, not soft suggestions. Per Paige's own sequencing: #75 verify → deploy to a named preview/staging environment → #70 playtest.

## Branch history (2026-09-24 reconciliation)

`main`, `prototype-v1`, and 6 other feature branches had diverged in parallel without cross-merging for about a day. Investigation found: `prototype-v1`'s remaining unique work (#42 Trusted Reviewer, #30, #33, #34, #17) had already been copied onto `main` verbatim by an earlier `promote-narc-latest` merge and then built on further — so nothing was actually lost. `qa-feedback-sept24c` (reversible Focus Time, keepalive gating, browser polish, pacing) had real unmerged work and was merged cleanly. The day-prototype's 5 files were cherry-picked directly onto `main` rather than merging their whole branch, since that branch's `prototype-v1` base no longer matched `main`. All 9 stale branches were then deleted. `node test.mjs` was also fixed — it had been red since the desktop rework landed and nobody had run the full suite against the merged result (mostly stale assertions; two real, narrow pacing bugs were also caught and fixed). The next day (2026-09-25), #74 made the single-workday build canonical: `index.html`/`day.html` now serve it, and the original week moved to `week.html` as an archived reference build.

Before starting anything, read `docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md`: it is a code-accurate description of the **original week's** engine (`game.js`/`app.js`) — now archived. It does not describe the canonical single-workday build; read `day.js`'s own header comment for that instead.

## Archived: original one-week build (superseded 2026-09-25, #74)

Everything below this point (Current premise, Scope, Cast, Design principles, etc.) describes the **original one-week prototype**, now archived at `week.html` and not under active development. It's kept for historical/reference value, not as a description of the current product. Do not treat anything below as current without checking the status line above first.

## Current premise

**NARC — Networked Assessment & Risk Coordination**

The player is a human employee inside a workplace monitored by an AI system.

The human gradually learns:
- what NARC can actually observe
- what NARC merely infers
- which proxy metrics drive decisions
- how to create traces that make the model believe something different from reality

Core line:

> A human learns to exploit AI limitations by understanding the gap between what the system sees and what is true.

## Scope

Keep the first portfolio version small:

- about a 5–10 minute run (5–15 overall, 8–10 healthy)
- one short work week
- five funny recurring coworkers
- roughly eight encounters
- three to four coworkers central in a typical run
- repeated coworkers
- progressive one-step-at-a-time UI
- one or two NARC updates
- branching coworker outcomes
- final roster/outcome screen
- small achievement set
- deterministic first
- no live AI required

## Cast

- Luis Perez — bathroom/productivity anomaly
- Priya Shah — too chatty / communication metrics
- Marcus Reed — late/absent with escalating ridiculous excuses
- Nina Brooks — refuses vacation / “rest resistance”
- Maya Chen — sarcastic high performer / AI adoption and alignment risk

All five should be funny.

## Design principles

- NARC sees proxies, not reality.
- Monitoring data can be accurate while interpretation is wrong.
- People change behavior when they know what the system rewards.
- Earlier records can become evidence in later judgments.
- Some NARC signals should be useful; “AI is always wrong” is too easy.
- Corporate language stays sincere.
- Humor comes from human absurdity + institutional overreach.
- Do not add generative AI unless it clearly improves gameplay.

## Realism standard

For each mechanic:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

Before public portfolio publication, verify real-world monitoring claims with current sources and clearly distinguish real capabilities from invented NARC extensions.

## Source of truth

1. `docs/CORE_GAME_SPEC.md`
2. GitHub issues #1–#7
3. this handoff
4. README for project-level summary

If these conflict with the current deployed prototype, the docs/issues win.

## Current implementation

**Start with [`docs/handoffs/claude-rework/IMPLEMENTATION_STATE.md`](handoffs/claude-rework/IMPLEMENTATION_STATE.md)**: a code-accurate description of what is built, the week's incidents and routes, decisions the implementer made, and known gaps. Where it disagrees with an older handoff, it describes the code and the older docs describe intent.

Branch:
- `main` — do not modify or promote without Paige explicitly naming `main`
- `prototype-v1` — current working/prototype branch

Current implementation (desktop rework + playtest clarity pass, on `prototype-v1`):
- the game is a persistent fictional work laptop: menu bar with clock, a Log off button and the NARC tray indicator, a dock, and Messages / Email / Calendar / Files / Utilities / NARC windows; it stacks into a tab bar on phones
- **orientation gate:** the People Operations email is open on load, spells out NARC — Networked Assessment & Risk Coordination, says it monitors activity, and asks for an acknowledgment. Dana (your manager) then asks you to check the Calendar and reply. Only after that is the first NARC case scheduled; nothing consequential runs before it
- the same human-vs-NARC week (Luis, Marcus, Priya; six incidents plus a NARC 2.0 beat; carry-over; endings; achievements) runs on a workday clock. Problems arrive as NARC notifications, messages, email and calendar changes; consequences are scheduled deliveries, spaced so nothing lands on top of anything else
- **NARC is the pressure:** notifications persist until opened or closed (closing one only hides it), at most 3 show at once (2 on phones), NARC nudges about an unresolved case, and nudges more pointedly after NARC 2.0. The tray reads `NARC · ACTION REQUIRED` only when a case really needs the player; NARC's window separates "Needs attention" from "Recent activity"
- **no hidden timers:** exploring is never treated as inaction. Doing nothing is legible: "Dismiss alert", or "Log off", which says NARC will process the open case before it does
- **you see everyone's NARC alerts but act only on your own.** Teammates' cases are view-only ("Team alerts", tray `NARC · TEAM ALERT`); helping or hurting a coworker happens through natural-language Messages replies, Dana, or actions in Files, Calendar and Utilities. Calendar-based covers (Focus time) survive NARC 2.0; keystroke fakery does not
- **counterplay is discoverable:** every first-contact coworker message carries its own setup, each incident leaves at least two leads (NARC's case, a coworker line, a "new" dot on an app), and follow-up hints disappear once you have decided
- NARC's window shows only observed signals plus its inference and confidence; the human context lives in Calendar, Files, Messages and Utilities
- the mouse-jiggler is a Utilities install with an On/Off switch, NARC 2.0 only catches it while it is On, and it can only be shared with Luis after you have installed it. The Culture Champion email arrives before Priya's flag and nominations open with it; nominating Priya early pre-empts her flag entirely. NARC 2.0's scan waits until you have read the announcement
- deterministic engine in `game.js` (`tick(state)` / `act(state, action)`), renderer in `app.js`; `node test.mjs` covers orientation, pacing and run length, persistent notifications, active-versus-history, no auto-fallback, the NARC 2.0 beat, leads and first-contact context, carry-over, exploits, save/fire paths, achievements, ending, restart, and all 2,400 routes
- run length (game clock, no exploring): a brisk player about 5.3 minutes, a player who reads every hint first about 7.1; exploring adds to that
- QA aid: `?tick=N` in the URL sets **milliseconds per game second** (so `?tick=200` is 5x speed, and the default is 1000). It is not a multiplier: `?tick=2` runs about 500x and skips past everything
- Vercel preview redeploys from `prototype-v1`; the public production site only changes when `prototype-v1` is merged to `main`

Deferred: Nina and Maya, the remaining encounters, free-text Messages replies, sound, a formal NARC score for the player beyond the Visible Activity Index, final achievement set, real-world monitoring citations.

Limited multi-window behavior is no longer deferred. The current testing branch intentionally supports up to three overlapping desktop windows, with dock raise/reopen and close-as-hide behavior.


## Settled principles (from the feedback rounds; all now implemented)

These came out of the round where the primary problem was "the player often does not know what to do". That pass, and the pacing pass after it, are complete — the list is kept because the principles still govern new work, not as a to-do list.

- **Hide the branching structure, not the available affordances.**
- **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**
- NARC should primarily talk at the player through notifications/status interruptions.
- Coworkers should provide character + missing context + diegetic clues for evasion.
- Important notifications must persist until handled/closed; closing a toast is not the same as dismissing the case.
- The opening needs a gated orientation before consequential events begin.
- The People Ops email should spell out **Networked Assessment & Risk Coordination** and plainly-but-corporately state that workplace activity is monitored.
- First-contact coworker messages must make sense without assuming the player already opened a NARC alert.
- No hidden auto-fallback: exploring is never treated as inaction (the old 60-second fallback is gone, and a test holds that line).
- Active NARC cases must be distinguished from passive NARC history/notices.
- The AI-learning goal is experiential: the player learns about proxies, inference, gaming, context loss, feedback loops, and authority by outsmarting NARC rather than reading explanations.

Research grounding and speculative escalation notes:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Detailed implementation notes:
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## Next recommended implementation action

**Finish verification on `testing-fixes-sept24`, then continue the live playtest before any promotion.**

The current prototype-v1 branch now includes the latest board work:
- #17 route-specific closure copy for superseded questions, so the in-world cause is named instead of generic "never mind" language
- #33 optional employee-authored NARC_notes.txt, framed as imperfect workplace folklore rather than an answer key
- #30 removal of Dana's remaining direct Calendar shortcut for Marcus; testimony stays in Messages, record manipulation stays in Calendar
- #34 Employee 4417's final review names the concrete signals/actions behind integrity or predictive review
- #42 first-pass Trusted Reviewer mechanic: repeated company-friendly peer reporting can earn high-reliability status, and that status can change the weight/outcome of later evidence

Several older board items (#27, #28, #31, #40, #41, #43, #44 and #35) have been reconciled/closed because the current build already satisfies their intended first-run scope.

The immediate next step is **not more feature expansion**:
1. run node test.mjs on the latest prototype-v1 when an environment with repo access is available
2. fix only real regressions from that suite
3. do an uncoached fresh-player run for #29
4. use that playtest to decide whether #42 needs adjustment and whether any new first-run issue is justified

Vercel preview verification for the latest branch work is currently constrained by the Hobby build-rate limit. Do not interpret that quota failure as a code/build failure.

Keep #45 (replay authority/settings), #48 (benignly invasive personalization), Nina/Maya expansion, and broader scenario growth out of the first-run release unless #29 identifies a concrete need.

### How to work on this repo

- Feature work on `prototype-v1`; `main` is production and only Paige authorizes a merge, each time.
- `node test.mjs` (about 16 s) must be green before pushing. Mutation-check new rules by breaking them deliberately and confirming a test fails.
- Serve over http, not `file://`. `?tick=N` in the URL is **milliseconds per game second** (`?tick=200` is 5x), not a multiplier.
- The static preview server serves `style.css` from cache: force a fresh fetch before trusting any CSS check.
- Vercel is on the shared Hobby budget, so batch work and avoid unnecessary production builds.

Detailed UX source of truth: `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`

## AI stance

The game can demonstrate AI product learning without containing a live model.

Portfolio value can come from:
- proxy metrics
- false positives
- Goodhart-style metric gaming
- feedback loops
- behavioral adaptation
- human oversight problems
- overconfident automation
- escalating authority
- deliberate choice not to use an LLM where deterministic software is better

## Separate project boundary

NARC is separate from `pedringt/tell-me-what-you-remember`.

Carry forward only broad design ideas:
- partial traces vs reality
- AI inference is not truth
- recurring humans
- actions affect future evidence
- consequences without one universal correct answer

Do not import Evelyn-specific canon, elder-care material, or that prototype's structure.

## Authority boundaries

- Review/feedback does not authorize edits.
- Paige must explicitly authorize implementation after a feedback round.
- Do not push/merge to `main` unless Paige explicitly names `main`.
- Do not deploy to production unless Paige explicitly names production/public release.
- Preview deployment is separate from production promotion.


## Claude Code rework bundle

For a fresh Claude Code implementation chat, use:
- `docs/handoffs/claude-rework/HANDOFF.md`
- `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`
- `docs/handoffs/claude-rework/AGENT_PROMPT.md`
- `docs/handoffs/claude-rework/ACCEPTANCE_CRITERIA.md`

This bundle is intentionally more implementation-detailed than this project-level handoff and should be treated as the starting context for the next prototype rewrite.


## Current product direction: fun first, simple, visibly AI-driven

Latest direction from Paige:

- The game still needs to feel more fun/interesting and less passive.
- Do **not** solve that by adding more notifications, more prose, more meters, or a complicated simulation.
- Keep the core interaction extremely simple: **NARC judges → player changes something → NARC visibly updates → consequence follows.**
- The player should feel like they are reverse-engineering and exploiting an AI system, not reading a branching story.
- Every major incident should ideally include at least one satisfying action that changes what NARC believes.
- AI concepts should surface through the mechanic, not educational copy.

Preferred AI arc across the week:

1. NARC watches.
2. NARC infers.
3. NARC adapts to a workaround.
4. NARC predicts future behavior.
5. NARC gains authority and acts.

Keep the vocabulary light: **confidence, prediction, pattern detected, assessment updated** are enough. Avoid turning the NARC window into an ML dashboard.

Per incident, aim for one judgment, a small amount of context, 2–3 actions, one visible model reaction, and one consequence.

The Stanley Parable is a useful tonal/design reference for the feeling that the system notices what the player is doing and confidently reinterprets it. Do not copy the narrator structure. Use the principle: **the system watches the player's choices and keeps trying to explain them back to the player.**

<!-- Vercel production retry marker: 2026-09-23 19:37 PT -->


## Current social-system pass (2026-09-24)

Authorized implementation work for issues #52-#56 is on `social-loop-and-desktop-pass`.

New direction:
- desktop navigation moves from a tall left rail to a compact bottom dock
- normal apps use content-sized windows so Messages and Calendar do not sit inside large empty canvases
- NARC remains visually separated from normal productivity apps
- peer reporting is reciprocal: Employee 4417 can supply peer context, and a coworker under pressure can supply context about Employee 4417
- repeated reporting contributes to a paranoid-office outcome
- low-report, protective play can produce collective non-cooperation where NARC loses confidence because employees stop feeding it unnecessary peer verification
- a high-report office can trigger a Priya resignation beat even while NARC's concern remains low, showing harm from anticipated judgment rather than direct automated punishment

Case-study framing:
> NARC turns the people into narcs.

The broader question is how an AI system changes human behavior around it, not simply whether the model is right or wrong. The State comparison remains a supporting insight about evidence, interpretation, authorization, and accepted operational truth.

Do not expand these ideas into a procedural social simulator. The implementation should remain authored, deterministic, and within the short portfolio-playthrough target.


## Sept 24 connected-workstation pass

Current implementation branch: `testing-fixes-sept24`.

This pass responds to live playtest feedback that the week still felt too simple and that several apps existed beside one another instead of feeling connected.

Current direction:
- the week should feel like one connected workplace system: **notice → investigate across apps → infer what NARC values → act → see the social consequence**
- earlier choices now echo into later coworker messages so Luis, Marcus, and Priya react to what happened before
- direct coworker conversations remain answerable after the formal case is resolved; Dana/NARC review prompts may close, but people do not disappear because a branch ended
- Monday onboarding now requires checking the Halvorsen MSA in Files and the scheduled read-through in Calendar
- Halvorsen is real evidence for the player's Monday false positive instead of opening-screen scenery
- decorative initial files were removed
- Calendar's role is **time becomes evidence**: scheduling, timing, and retroactive edits can change what NARC believes
- Messages should be funny **and** useful; flavor-only lines should be cut or made to teach, warn, implicate, unlock, or set up a callback
- desktop supports up to three overlapping windows on desktop; dock clicks raise/reopen; close hides without resetting app state; narrow layouts keep a one-window fallback
- a small authored Browser app adds optional dumb news plus workplace-AI stories that foreshadow NARC mechanics
- the workstation visual direction is richer corporate color and personality, not beige office software
- NARC's visual identity is a friendly pair of eyes: approachable company branding for a system that is always watching
- NARC itself is simplified into **My NARC / Company / History**, with person names and current standing more prominent than assessment metadata

Do not interpret this branch as production. `main` remains unchanged until Paige explicitly authorizes a merge.


## Final Sept 24 feedback pass

Active implementation branch: `feedback-pass-sept24b`.

This pass exists because live testing showed several earlier decisions had landed only partially. Treat the following as the current source of truth:

- Dana is now the diegetic workstation tutorial. After the People Ops email, she walks Employee 4417 through **The Loop → Files/Halvorsen → Calendar → Utilities → NARC → Browser → Messages** before the first incident can begin.
- The tutorial teaches what each app is for, not just where it is. The core onboarding lesson is: **reality is spread across the work apps; NARC sees selected traces and turns them into a judgment.**
- Completing onboarding lands the player on The Loop, which is the normal company home surface.
- The Loop includes a dynamic **Workplace pulse** so later peer reporting, Trusted Reviewer status, integrity flags, and coworker status changes visibly echo outside NARC.
- Desktop windows are clamped to the usable workspace after every render so title bars cannot drift above the screen. The Loop and Utilities also have explicit desktop heights.
- The wallpaper is now a deliberately authored Meridian design, not only a dark green or gradient wash: geometric rings, ribbons, dot texture, and company branding sit behind the windows.
- Normal apps have stronger visual identities: Messages is blue/chat-like with avatars; Email is coral/inbox-like; Calendar is purple; Files is amber with file-type badges; Utilities is slate/diagnostic; Browser is plum; The Loop remains Meridian green.
- NARC is intentionally simpler than the surrounding software. It now has only **Current / History**. Current is a four-person list (Employee 4417, Luis, Marcus, Priya). Selecting a person shows the judgment, confidence, at most two strongest reasons, and company response. The friendly eyes remain the visual identity.
- Notification summaries are inspectable. “N earlier notifications” expands the older notifications so each can be read/opened; Clear all is no longer the only option.
- The authored Browser, purposeful Files, Calendar evidence mechanics, cross-day callbacks, reciprocal peer context, social endings, Priya resignation beat, Trusted Reviewer path, and post-resolution coworker replies remain part of the current design.

Verification caveat: this environment can inspect/write the GitHub repository but cannot execute the repository locally, so `node test.mjs` and a real browser smoke test still need to run before promotion. Do not merge this branch to `main` without Paige explicitly naming `main`.

### Remaining release work

- Run the full automated suite and desktop/narrow browser smoke test in an environment that can execute the repo.
- Do #29 with at least one genuinely uncoached fresh player.
- Keep #45 (later replay/authority/settings) and #48 (later benign personalization) deferred unless a future playtest identifies a concrete first-run need.


## Sept 24 QA feedback pass C

Active implementation branch: `qa-feedback-sept24c`.

Live playtest feedback after the previous main promotion produced a focused usability/pacing pass:

- Dana now explicitly explains the Calendar rule: **Busy** only records occupied time, while **Focus Time** tells NARC that low-input time is intentional work and should be weighed differently.
- Calendar labels are reversible. The player can switch **Busy ↔ Focus Time** instead of Focus Time being a one-way action.
- `keepalive.pkg` is absent from Utilities until Marcus actually sends the attachment.
- Marcus sends `keepalive.pkg` after onboarding on every route, independent of whether Employee 4417 receives the Monday inactivity flag.
- Receiving the attachment is what marks the helper as discovered; it is then installable in Utilities and can be run on Employee 4417's own workstation.
- Luis's peer-report reactions have been rewritten so the player can understand what happened without decoding the joke.
- Browser keeps its article-list scroll position and now has a lightweight browser toolbar with home/back, refresh, and a fake Meridian address bar.
- Decorative three-dot window controls were removed. The single functional X remains the only window-close affordance.
- Pacing is tighter after onboarding: routine message delays are compressed and the gap between completed consequences and the next problem is shorter.
- The intent is **fewer dead patches, not more content**. The player should spend more of the run discovering, deciding, or seeing consequences.

Verification limitation: this environment still cannot clone the repo because GitHub DNS resolution fails, and the current Vercel preview is blocked by the shared build-rate limit. Automated/browser verification remains pending. Do not promote this branch to `main` without Paige explicitly authorizing `main`.


## Handoff checkpoint after Sept 24 QA pass C

Current working branch: `qa-feedback-sept24c`  
Branch head: `7b7150b536fe48408f057618aba5b9b59b0ee293`  
Current `main`: `3cf89374995089d1e588ca71db89677ad508a048`

The working branch is 8 commits ahead of `main` and 0 behind. `main` has **not** been changed by this pass.

### What the next session should do first

1. Treat `qa-feedback-sept24c` as the current source of truth for the latest playtest fixes.
2. Do not add more product scope before verifying this pass unless Paige supplies new feedback.
3. Run `node test.mjs` in an environment that can execute the repo.
4. Smoke-test the actual browser build, especially:
   - Busy ↔ Focus Time in both directions
   - Focus Time before Monday's inactivity check
   - Marcus sending keepalive on both flagged and unflagged Monday routes
   - keepalive absent before delivery, then installable/toggleable after delivery
   - Browser article-list scroll persistence
   - Browser toolbar layout and narrow-screen behavior
   - no decorative three-dot window controls
   - mid/late-game pacing and whether any dead stretches remain
5. If verification exposes regressions, fix only those regressions on this branch.
6. Do **not** merge or push to `main` until Paige explicitly says to push/merge to main.

### Current verification state

- GitHub branch/compare state verified: 8 ahead, 0 behind.
- Automated test suite was not executable from the prior environment.
- Vercel status for the branch is currently a build-rate-limit failure, not an application/build-code failure:
  `https://vercel.com/cairn10?upgradeToPro=build-rate-limit`
- A real browser smoke test of pass C is still required.

### Product judgment to preserve

The newest playtest did **not** suggest the game needs more raw content. The main issue was momentum. Preserve the current direction: reduce dead time, make causality legible, and give Employee 4417 enough self-directed interaction without turning NARC into a larger management sim.
