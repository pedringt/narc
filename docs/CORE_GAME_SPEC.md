# NARC Core Game Spec

**Status:** Working source of truth for the next prototype pass  
**Project:** NARC — Networked Assessment & Risk Coordination

## Purpose

Build a very small, funny portfolio game that demonstrates applied understanding of AI product limitations without requiring a live model.

The player is a human employee inside a workplace monitored by NARC. NARC observes partial work traces, converts them into proxy metrics and risk classifications, and receives increasing authority from the company.

The player succeeds by learning what NARC actually measures, where its inference is weak, and how to exploit that gap.

## One-line premise

**A human learns to game an AI workplace-monitoring system by understanding the difference between what the AI sees and what is actually true.**

## Portfolio experience target

- first-time player understands the premise within ~30 seconds
- one normal first run should land around 5–15 minutes, with ~8–10 minutes as the healthy target
- one short “work week”
- around 8 short encounters
- five recurring funny coworkers available in the cast
- only 3–4 coworkers need to be central in a typical run
- some coworkers reappear after the player has affected them
- one decision step appears at a time
- 1–2 NARC capability updates
- ending shows coworker outcomes, player outcome, and achievements
- replay is encouraged but not required; replay means trying the same authored week with different choices, not advancing to a literal Week 2

## Core loop

1. **Signal**  
   NARC flags a person or behavior.

2. **Understand the proxy**  
   The player gets enough evidence to infer what NARC is really measuring.

3. **Respond / exploit**  
   The player can comply, ignore, create a misleading trace, help a coworker, or take another risky workaround.

4. **Result**  
   NARC changes a metric, classification, or intervention.

5. **Human reaction**  
   The coworker reacts, adapts, or changes behavior.

6. **Carry-over**  
   A later encounter may use the new behavior or record as evidence.

## Main design idea

NARC should not be omniscient.

It should be good at observing narrow traces and bad at turning those traces into full human understanding.

Examples:

- Slack activity is not the same thing as collaboration.
- calendar density is not the same thing as productivity.
- AI-tool usage is not the same thing as useful AI adoption.
- inactivity is not the same thing as disengagement.
- sentiment classification is not the same thing as understanding sarcasm.
- a historical flag may reflect a previous bad interpretation rather than objective truth.

## Realism standard

For every major mechanic:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

V1 should draw from recognizable monitoring concepts such as:

- time / idle activity
- app or tool usage
- Slack / message volume
- meeting load
- badge / device / location traces
- after-hours work
- AI-tool adoption
- behavior deviation
- unusual access patterns

The game must not imply that every employer or product uses all of these in the same way.

Any future public case study should distinguish documented real-world capabilities from NARC's invented extensions.

## Satirical escalation

### Early
Mostly defensible or boring workplace monitoring.

Examples:
- idle time
- message volume
- after-hours work
- AI-tool use
- attendance traces

### Middle
NARC turns the data into questionable human judgments.

Examples:
- collaboration
- engagement
- communication load
- rest deficit
- adoption resistance
- attendance credibility

### Late
The company grants NARC absurd authority based on those inferences.

Examples:
- rest resistance
- alignment risk
- sarcasm probability
- informal influence network
- preemptive restrictions
- anti-gaming detection

Only 1–2 escalation steps are required in V1.


## Player-learning goal

NARC is also a funny way to learn how AI and algorithmic systems can fail.

The game should not explain AI concepts as lessons. Instead, the player should learn them by **outsmarting the system**.

A strong scenario lets the player experience one or more of these ideas:

- a proxy is not the same thing as the real goal
- a confident inference can still be wrong
- context can live outside the data a model sees
- people change behavior when they know what is measured
- optimizing a metric can make the metric less meaningful
- more data does not automatically fix a bad objective
- different institutional metrics can contradict each other
- model outputs become more consequential when software is granted more authority
- anti-gaming systems create an arms race with the people being measured
- predictions can create feedback loops or self-fulfilling outcomes
- human review matters because an inference is not the same thing as truth

Internal scenario test:

> **What AI/product idea does the player discover by exploiting, evading, challenging, or watching NARC in this situation?**

If a mechanic is funny but reveals nothing interesting about the system, it may be expendable. If it teaches something but feels like a lesson, hide the concept more deeply inside the comedy and interaction.

## Pressure and counterplay

The clearer game structure is:

> **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**

NARC should primarily intrude through notifications, alerts, demands, recommendations, and status changes.

Coworkers, Messages, Calendar, Files, Email, and Utilities should help the player understand missing context, discover loopholes, and manipulate what NARC sees.

The repeatable gameplay loop is:

1. NARC interrupts with a judgment, demand, or threat.
2. The player can inspect the signals/inference NARC used.
3. Coworkers or other work surfaces reveal context, a contradiction, or a loophole.
4. The player complies, challenges, evades, or manipulates the measured trace.
5. NARC reacts as though its own data is authoritative.
6. Later NARC may adapt, creating a new arms race.

Coworker messages should therefore do more than deliver jokes. They can simultaneously provide:
- character
- human context
- hints about what NARC does not know
- clues about possible exploits

Do not make coworkers speak like tutorial NPCs. Hints should sound like people trying to survive an annoying workplace system.

## Grounded beginning, speculative escalation

NARC may move beyond what typical workplace systems do today.

The early game should be recognizable and grounded in documented workplace surveillance / algorithmic-management ideas. Later scenarios may extrapolate into increasingly dystopian or absurd monitoring.

Useful escalation ladder:

1. **What you did** — activity, messages, apps, attendance, location, after-hours work.
2. **What NARC thinks it means** — engagement, collaboration, productivity, credibility.
3. **Who NARC thinks you are** — resistant, influential, poorly aligned, likely to leave.
4. **What NARC thinks you will do** — quit, disengage, resist a change, burn out.
5. **NARC acts before you do** — restrictions, mandatory coaching, lockouts, preemptive intervention.

Later stages are fictional NARC extrapolation, not claims about ordinary employers today.

Potential future concepts:
- personal-baseline anomaly detection
- attrition-risk restrictions that create self-fulfilling predictions
- AI Adoption / Transformation Readiness scores
- informal influence-network risk
- sarcasm probability becoming alignment risk
- compulsory wellness / rest resistance
- physiological or body-signal monitoring
- preemptive action based on predicted future behavior

Research notes and sources live in:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

## Cast

### Luis Perez
Recurring bit: Luis spends a lot of time in the bathroom and refuses to discuss it with software.

AI/product theme:
- idle/activity proxies
- missing context
- productivity inference

Possible paths:
- create activity traces while away
- accept increasingly invasive monitoring
- reclassify behavior
- keep job but become heavily monitored
- get fired
- accidentally become a “high innovation” employee due to a bad classification

### Priya Shah
Recurring bit: Priya talks constantly in person and on Slack.

AI/product theme:
- communication volume as collaboration proxy
- competing metrics

Possible paths:
- boost collaboration score
- trigger communication-overload flag
- suppress communication, then trigger isolation risk
- become culture champion
- leave or get fired

### Marcus Reed
Recurring bit: Marcus is frequently late or absent and gives increasingly ridiculous excuses.

AI/product theme:
- evidence traces
- location/timestamps
- model confidence vs context

Possible paths:
- investigate and expose him
- create just enough evidence to technically support his excuse
- teach him to game NARC
- fire him
- preserve his job through absurd documentation
- accidentally make him look excellent on paper

### Nina Brooks
Recurring bit: Nina refuses to take vacation and keeps finding ways to work.

AI/product theme:
- after-hours/work-pattern analytics
- “wellness” optimization
- system goals vs human preference

Possible paths:
- forced PTO
- lockout
- loopholes that make her appear offline while working
- rest-resistance flag
- retained / punished / leaves

### Maya Chen
Recurring bit: Maya is a strong employee with a sarcastic streak and low patience for performative AI adoption.

AI/product theme:
- sentiment/context failure
- AI-adoption metrics
- influence-network inference
- performative usage

Possible paths:
- use meaningless AI prompts to inflate adoption
- have sarcasm misread literally
- be protected as a high performer
- become an “alignment risk”
- be monitored or pushed out

## Humor rules

- Every coworker should be funny.
- The system itself should not wink at the player.
- Corporate wording should remain bland, confident, and sincere.
- Humor should come from the mismatch between human behavior and reductive measurement.
- Consequences can still matter.
- The game should not become a lecture.

## Interface rules

### Desktop is the game board

The player should feel like they are using a normal work laptop, not operating NARC as a standalone game interface.

Use a persistent fictional work desktop/workspace with a small set of fake work apps such as:
- Messages
- Email
- Calendar
- Work / Files
- Browser / Utilities
- NARC

NARC should begin as one monitored system/service inside the employee's computer and gradually become more intrusive.

A small persistent status indicator should make it clear that NARC is active without dominating the screen, for example:
- `NARC ACTIVE`
- `NARC · MONITORING`
- later: `NARC · REVIEWING` or `ELEVATED ATTENTION`

### Natural-action rule

**Model choices as ordinary workplace-computer actions whenever possible.**

The player should rarely see a generic `What do you do?` screen with abstract story choices.

Prefer concrete actions such as:
- open an email
- reply in Messages
- dismiss a NARC notification
- open NARC details
- type into a comment/review field
- edit a calendar event
- attach or change a work record
- install or enable a utility
- search/open a browser item
- ignore a message by simply not acting on it

The deterministic branch still exists underneath. The player should not see the branch structure.

Some explicit controls are appropriate when the action itself would naturally require a control. Example: a mouse-jiggler workaround can appear as a utility with an `Install` button and later an `On / Off` control. That is still a choice, but it feels like using software rather than selecting a story branch.

### Problems arrive through the workday

Do not present the experience as:
`Encounter 1 → solve → Encounter 2 → solve`.

Use normal workday time and events instead:
- Monday 9:02 AM
- an HR/People Ops email introduces NARC
- a NARC notification appears
- a manager or coworker sends a message
- a calendar invite changes
- a corporate policy update arrives
- a coworker disappears/goes offline
- a metric quietly updates

Avoid visible labels such as `Encounter 2 of 6` in the final UI.

### NARC sees vs human reality

Preserve the useful distinction between:
- what NARC directly observes
- what NARC infers

But do not turn it into a tutorial card.

Inside NARC, a detail panel may show:
- observed keyboard/mouse activity
- messages sent
- active-window time
- model inference
- confidence

The human context should live in the other work apps.

Example:
- NARC sees three hours of low input and infers disengagement
- Calendar shows the player was doing an in-person warehouse audit

The player should make the connection.

### Consequences also arrive naturally

Avoid dedicated `Afterward`, `NARC updates`, or explanation screens when the same information can arrive through normal computer use.

Examples:
- a NARC notification quietly shows Visible Activity Index 61 → 75
- the boss messages: “Love the energy!”
- HR emails a policy warning
- a coworker reacts in Messages
- a status indicator changes
- a calendar invite is automatically added
- an account becomes unavailable

The player should often infer cause and effect instead of being told what the choice meant.

### Visual direction

- fictional corporate work desktop, not a literal macOS/Windows clone
- current dark/monospace NARC visual language can remain inside NARC panels/windows
- surrounding desktop can feel more ordinary and work-like
- NARC branding stays sincere
- readable and approachable, not hacker-themed
- avoid a dense enterprise dashboard
- do not build a full operating-system simulator; only a few fake apps need to function

## Outcomes

Each coworker can end in several states, not only “saved” or “fired.”

Possible final statuses:
- employed
- promoted
- heavily monitored
- on warning
- transferred
- resigned
- fired
- absurdly rewarded by metric gaming

The final ending should compose:
1. coworker outcomes
2. player outcome
3. company/NARC summary
4. achievements earned

## Achievements

V1 should support a small set, including extreme routes.

Examples:
- **Nobody Gets Fired Today** — finish with everyone still employed
- **Workforce Optimization Complete** — remove/fire everyone if the final branching design supports it
- **Technically Compliant** — save someone mainly through evidence/metric manipulation
- **The Boy Who Cried Bird** — keep Marcus employed through his escalating excuses
- **Do Not Ask** — keep Luis employed without deeply investigating the bathroom issue
- **Unauthorized Empathy** — protect people so aggressively that NARC flags the player's behavior, if the final design keeps player evaluation

Achievement names and exact conditions are provisional until the new loop is implemented.

## AI implementation stance

V1 does not require a live LLM.

Reasons:
- authored comedy is easier to control
- deterministic state is easier to test
- short portfolio play benefits from low latency
- generative dialogue may not materially improve the mechanic
- “use AI because it is an AI portfolio” is not a sufficient reason

A future AI feature is allowed only if it creates a mechanic that is clearly stronger than the deterministic version.

## Non-goals for V1

- open world
- large employee simulation
- long narrative
- dozens of metrics
- realistic HR software replica
- multiplayer
- accounts/login
- backend persistence
- live AI requirement
- complete coverage of workplace-monitoring technology

## Success criteria

A successful V1 should make a portfolio visitor:
- understand the joke quickly
- laugh a few times
- discover at least one model limitation through play
- exploit at least one proxy metric
- see one later consequence caused by an earlier choice
- remember at least a few coworkers
- finish within about 8 minutes
- want to try another route

## Current implementation note

The current `prototype-v1` deployment already uses the human-vs-NARC premise with six deterministic encounters, Luis/Marcus/Priya, carry-over, a NARC update, endings, and achievements.

The current desktop rework has removed most scenario-card framing. The primary mismatch now is **clarity and pacing**: the player can see a believable workstation but often cannot tell what actions are available or why incoming messages matter.

The next implementation pass should preserve the working deterministic state logic where practical and reframe it around the persistent work-desktop model defined above and in `docs/handoffs/claude-rework/DESKTOP_INTERACTION_REWORK.md`.
