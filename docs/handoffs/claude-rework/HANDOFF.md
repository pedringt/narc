# Handoff: NARC Human-vs-NARC Prototype Rework

## Purpose

This handoff is for a **fresh Claude Code chat** that will rework the existing `prototype-v1` browser game into the current NARC concept.

The receiving agent should not rely on prior chat history. This file is intended to be sufficient context to continue from the repository itself.

## Current Objective

Replace the old reviewer-based playable loop with a **small, funny, deterministic portfolio game where the player is a human employee learning to exploit the limitations of an AI workplace-monitoring system**.

The goal is not to build the final game. The goal is to create the smallest vertical slice that can answer:

> Is it fun to learn what NARC measures, game those proxy metrics, and see coworkers react to the consequences?

## Current State

Repository:
- `pedringt/narc`

Working branch:
- `prototype-v1`

Deployment:
- Vercel preview is connected to `prototype-v1`
- the current preview automatically redeploys when this branch changes
- the current preview still uses the **superseded reviewer-player structure**

Production/default:
- `main` exists
- do not merge or push implementation to `main`
- do not promote to production unless Paige explicitly authorizes that destination

Current implementation files:
- `index.html`
- `style.css`
- `game.js`
- `app.js`
- `test.mjs`

Current source-of-truth files:
- `docs/CORE_GAME_SPEC.md`
- `docs/HANDOFF.md`
- GitHub issues #1–#7

The existing app is a plain static browser application with a deterministic JavaScript state machine. There is no backend, auth, persistence, or live AI.

## Critical Concept Change

The old prototype made the player NARC, an AI reviewer deciding what happens to employees.

That concept is **superseded**.

### New player role

The player is a **human employee** inside a workplace monitored by NARC.

NARC:
- watches partial workplace traces
- converts those traces into scores, classifications, and interventions
- does not understand full human context
- becomes increasingly invasive as the company trusts it more

The player gradually learns:
- what NARC can actually observe
- what NARC only infers
- which proxy metrics drive its decisions
- how to create technically valid traces that lead NARC to the wrong conclusion
- how to help or hurt coworkers using those same weaknesses

### Core fantasy

> What does NARC actually know, what is it merely inferring, and what evidence can I create that it will mistake for reality?

### Core gameplay loop

1. **Signal**
   NARC flags the player or a coworker.

2. **Understand the proxy**
   The player sees just enough evidence to infer what NARC is measuring.

3. **Respond / exploit**
   The player chooses whether to comply, ignore, fake a trace, help a coworker, or accept a cost.

4. **Result**
   NARC updates a score, classification, or intervention.

5. **Human reaction**
   A coworker reacts, adapts, or becomes funnier/more desperate.

6. **Carry-over**
   A later encounter uses the changed behavior, record, or player choice.

## Portfolio Scope

Keep the first rework deliberately small.

Target:
- 5–8 minute playthrough
- one short “work week”
- approximately 8 short encounters in the eventual V1
- **for the first implementation pass, 5–6 polished encounters are enough**
- five funny coworkers in the cast
- three coworkers can carry the first vertical slice
- one NARC capability/policy upgrade in the first implementation pass
- one-step-at-a-time interface
- final roster/outcome screen
- a small achievement set
- replay button

Do not build a large simulation before the core loop is fun.

## Cast

All five coworkers should be funny. They do not need equal screen time.

### Luis Perez

Recurring bit:
- Luis spends a lot of time in the bathroom.
- He deeply resents having to justify this to software.

NARC foundation:
- idle time
- activity traces
- productivity inference

Potential joke/escalation:
- “restroom-adjacent inactivity”
- create activity traces while away
- NARC later introduces tighter inactivity detection
- helping Luis can make his metrics look excellent for the wrong reason

Possible outcomes:
- employed
- heavily monitored
- fired
- accidentally rewarded as innovative/productive
- learns to game NARC

### Priya Shah

Recurring bit:
- Priya talks constantly in person and on Slack.
- She is genuinely social and often helpful, but NARC sees excessive communication.

NARC foundation:
- message volume
- collaboration proxies
- behavioral baselines

Potential joke/escalation:
- communication overload
- suppress her communication
- later NARC flags social withdrawal / insufficient collaboration

Possible outcomes:
- culture champion
- communication-restricted
- isolated by the system
- promoted
- fired / resigns

### Marcus Reed

Recurring bit:
- Marcus is frequently late or absent.
- His excuses become increasingly ridiculous.

Examples already established:
- train delay
- raccoon on bus
- emergency locksmith
- municipal water event
- “bird situation”
- device location near mini-golf

NARC foundation:
- location/device traces
- timestamps
- badge/access data
- evidence correlation

Player fantasy:
- either investigate and expose him
- or help manufacture enough technically plausible evidence that he cannot be fired

Possible outcomes:
- fired
- saved through paperwork
- learns to exploit NARC
- bizarrely looks excellent on paper
- final warning

### Nina Brooks

Recurring bit:
- refuses to take vacation
- treats mandatory wellness as a personal attack
- finds loopholes to continue working

NARC foundation:
- after-hours work
- workload patterns
- PTO / rest signals

Potential joke/escalation:
- mandatory wellness
- account lockouts
- “rest resistance”
- appearing offline while secretly working

Possible outcomes:
- forced PTO
- locked out
- retained but flagged
- resigns
- successfully games “rest”

### Maya Chen

Recurring bit:
- strong performer
- sarcastic
- hates performative AI adoption
- cannot stop making comments that a literal system interprets badly

NARC foundation:
- sentiment/context inference
- AI-tool adoption metrics
- influence/network inference

Potential joke/escalation:
- meaningless AI use inflates adoption score
- sarcasm interpreted literally
- “alignment risk”
- coworkers reacting to her comments becomes an “informal influence network”

Possible outcomes:
- protected
- promoted
- monitored
- pushed out
- becomes a master of performative AI usage

## First Rework Slice Recommendation

Do not attempt all eight eventual encounters in the first code pass.

A good first playable sequence:

### Encounter 1: Player onboarding / personal NARC score

Purpose:
- establish that the player is human
- teach that NARC measures proxies
- keep screen extremely simple

Example:
NARC notices a period of inactivity or low “visible collaboration.”

Player sees:
- one NARC signal
- two or three response choices

One choice should manipulate the metric rather than solve the underlying issue.

### Encounter 2: Luis

Purpose:
- introduce helping a coworker
- reveal that the same system watching the player is watching everyone
- first obvious comic case

NARC flags restroom-adjacent inactivity.

Player can:
- leave it alone
- help Luis create a better activity trace
- choose a punitive/compliant action that makes his situation worse

### Encounter 3: Marcus

Purpose:
- make evidence manipulation more game-like

Marcus gives a ridiculous absence excuse.

Player can inspect limited evidence.

There should be a path where:
- truth looks bad
- but the player can construct a technically defensible record from what NARC can see

### NARC Update

Purpose:
- escalate system authority
- unlock one new metric/tool
- communicate dystopia through deadpan corporate wording

Example:
- “Behavioral deviation detection”
- “Synthetic engagement detection”
- “Enhanced collaboration intelligence”

Keep this to one update for the first slice.

### Encounter 4: Priya

Purpose:
- show competing metrics / feedback loops

If the player suppresses communication:
- later collaboration may drop

If the player boosts visible communication:
- communication load may rise

The game should make the player see that optimizing one proxy can damage another.

### Encounter 5: Repeat Luis or Marcus

Purpose:
- prove carry-over
- employee should visibly react to what the player did earlier
- NARC should use the previous result as part of current evidence

### Encounter 6: End-of-week review

Purpose:
- show coworker outcomes
- show what NARC thinks happened
- show achievements
- invite replay

This is enough for the first rework.

## Interface Direction

The current prototype shows too much at once.

That must change.

### Required interaction pattern

Only show the current step.

Recommended progression:
- new signal
- review
- optional evidence
- choose response
- result
- employee reaction
- continue

Do not place:
- all investigations
- all interventions
- permanent record
- full dossier
- final decision

on screen simultaneously.

### Feel

Target:
- simple internal system
- a little terminal-like
- readable
- not “hacker UI”
- not dense enterprise software
- NARC branding completely sincere

### Progressive UI

The interface may start almost bare.

As NARC gains capability, additional labels/metrics/actions can appear.

The UI itself should communicate escalation.

## Realism + Satire Standard

Use this formula:

> **real capability → plausible inference → ridiculous institutional response → exploitable weakness**

Examples:

### Luis
Real-ish signal:
- idle/activity monitoring

Inference:
- unexplained productivity loss

Ridiculous response:
- restroom anomaly monitoring

Exploit:
- create activity traces or classify time differently

### Priya
Real-ish signal:
- communication volume

Inference:
- collaboration or communication load

Ridiculous response:
- throttle communication

Exploit:
- shift communication channels or manufacture visible collaboration

Then NARC may create the opposite problem.

### Marcus
Real-ish signal:
- badge/device/location evidence

Inference:
- excuse credibility

Ridiculous response:
- automated attendance integrity action

Exploit:
- create a technically plausible evidence trail

### Nina
Real-ish signal:
- after-hours work / PTO data

Inference:
- burnout / rest deficit

Ridiculous response:
- mandatory rest enforcement

Exploit:
- appear inactive while still working

### Maya
Real-ish signal:
- AI-tool usage / sentiment

Inference:
- adoption maturity / alignment

Ridiculous response:
- career consequences

Exploit:
- meaningless AI usage that satisfies the metric

## Humor Rules

- every coworker is funny
- NARC itself is not joking
- corporate language remains bland and confident
- consequences can still be real
- avoid speeches explaining the theme
- show the theme through mechanics
- recurring jokes should escalate on later appearances
- authored jokes are preferred to random generation in V1

## AI/Product Concepts the Game Should Demonstrate

The game should implicitly demonstrate:
- proxy metrics
- false positives
- Goodhart-style metric gaming
- feedback loops
- behavior changing in response to measurement
- model confidence vs actual understanding
- weak human/system oversight
- escalating authority given to uncertain inference
- historical records reinforcing earlier bad judgments
- the product decision not to add an LLM where deterministic logic is better

Do not turn these into tutorial slides.

## Live AI Decision

Do **not** add a live LLM in this rework.

That is a deliberate product decision for V1.

Reasons:
- deterministic state is easier to test
- authored comedy is stronger
- short portfolio experience should have low latency
- model variation could weaken character consistency
- no current mechanic requires generation

A future AI feature is allowed only after the deterministic game proves the loop and a generative mechanic clearly improves it.

## State Model Guidance

The existing JavaScript state machine is reusable in spirit, but not authoritative.

A simple new state model may include:

### Global
- current day / encounter
- NARC capability level
- player visibility / risk / alignment metrics
- discovered NARC rules
- achievements

### Per coworker
- employment status
- NARC risk/classification
- trust toward player
- has learned to game NARC
- prior help/harm
- encounter flags
- ending flags

Do not over-model.

Use only state that produces visible gameplay consequences.

## Ending Model

Do not use one global morality score.

End-of-week output should combine:

### Coworker results
Examples:
- employed
- promoted
- monitored
- warning
- transferred
- resigned
- fired
- absurdly rewarded

### Player result
Examples:
- model employee
- suspiciously compliant
- under review
- manipulation detected
- still employed

### NARC/company result
A short deadpan summary.

### Achievements
Keep the first set small.

Candidate achievements:
- **Nobody Gets Fired Today**
- **Workforce Optimization Complete**
- **Technically Compliant**
- **The Boy Who Cried Bird**
- **Do Not Ask**
- **Culture Champion**

Exact conditions may change during implementation.

## Reuse vs Rewrite

### Safe to reuse
- static no-build browser setup
- Vercel preview wiring
- general visual tone if useful
- small helper functions
- accessibility patterns
- basic test approach
- deterministic state-machine concept

### Do not preserve just to save work
- player-is-NARC premise
- reviewer metrics as the primary game
- simultaneous investigate/intervene/report UI
- one employee = one isolated case structure
- old four-case progression
- permanent-record workflow as the main action loop

It is acceptable to rewrite `game.js` and `app.js` substantially.

## Testing Expectations

At minimum add deterministic tests for:
- encounter progression
- carry-over from an earlier coworker choice to a later encounter
- at least one exploit changing a NARC metric
- at least one exploit causing an unintended later consequence
- at least one employee fired path
- at least one employee saved/protected path
- end screen renders reachable outcomes
- achievement condition(s)
- restart resets state

If browser-level testing is available, smoke test:
- app loads
- first encounter is understandable
- controls advance one step at a time
- no dead-end state
- mobile layout remains usable

## Acceptance Bar for First Rework

The first rework does **not** need every final feature.

It is successful if:
- player role is clearly human
- the old reviewer structure is gone
- the player learns at least one NARC proxy through play
- the player can exploit at least one proxy
- one coworker returns and reacts to an earlier choice
- there is at least one NARC capability update
- the interface shows one decision step at a time
- the game reaches a meaningful ending
- the run is plausibly under 8 minutes
- there is at least one replay hook or achievement
- deterministic tests pass

## Wrong Turns to Avoid

Do not:
- turn this into a long text adventure
- make NARC omniscient
- make every NARC inference obviously stupid
- make “always resist NARC” the dominant answer
- explain AI concepts in long prose
- add dozens of metrics
- build an HR dashboard
- add live AI just because the portfolio is about AI
- preserve old mechanics solely because they already exist
- add backend/auth/persistence for V1
- merge to `main`
- deploy to production

## Recommended Work Sequence

1. Read:
   - `docs/CORE_GAME_SPEC.md`
   - this handoff
   - `README.md`
   - issues #1–#7

2. Inspect current:
   - `app.js`
   - `game.js`
   - `style.css`
   - `test.mjs`

3. Write a short implementation plan in the Claude chat before editing.

4. Rebuild the state model around the human-vs-NARC loop.

5. Implement the small 5–6 encounter vertical slice.

6. Rewrite the UI so only the current action step is visible.

7. Add carry-over and employee reactions.

8. Add one NARC update.

9. Add ending + at least one achievement.

10. Update tests.

11. Run tests.

12. Smoke-test the preview after the `prototype-v1` deployment completes.

13. Report:
   - what changed
   - what passed
   - what was intentionally deferred
   - preview URL/status
   - recommended next playtest questions

## Open Questions

These do **not** block the first implementation pass:
- exact player name/role
- final eight-encounter order
- exact five-coworker distribution per run
- final achievement names
- whether the player eventually receives a formal NARC score
- whether all five coworkers can truly be fired in V1
- whether NARC's final evaluation of the player remains in the ending

Use conservative defaults and keep these easy to change.

## Authority / Credentials

Authenticated services may include GitHub and Vercel.

Required access:
- Service: GitHub
- Purpose: inspect and edit `pedringt/narc`
- Minimum permission: repository contents write on `prototype-v1`
- Expected access mode: platform-provided / brokered
- Destructive actions allowed: no
- Human approval required: yes for promotion to `main`

Required access:
- Service: Vercel
- Purpose: observe the automatic preview deployment from `prototype-v1`
- Minimum permission: read deployment status / preview access
- Expected access mode: platform-provided / brokered
- Destructive actions allowed: no
- Human approval required: yes for production promotion

Credential handling:
- do not ask Paige for raw tokens, API keys, cookies, or `.env` contents
- use existing platform integrations
- credential availability never implies authorization

## Source Context Notes

This handoff reflects the settled direction from the NARC design conversation through the human-vs-NARC scope reduction.

The old reviewer prototype remains useful only as a disposable interaction/technical proof.

The receiving agent should treat the repository docs as more authoritative than the deployed old gameplay.
