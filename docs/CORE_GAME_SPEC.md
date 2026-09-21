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
- one run lasts about 5–8 minutes
- one short “work week”
- around 8 short encounters
- five recurring funny coworkers available in the cast
- only 3–4 coworkers need to be central in a typical run
- some coworkers reappear after the player has affected them
- one decision step appears at a time
- 1–2 NARC capability updates
- ending shows coworker outcomes, player outcome, and achievements
- replay is encouraged but not required

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

- Do not show every mechanic at once.
- Reveal one action step at a time.
- The first screen should be extremely simple.
- New tools/metrics can unlock as NARC evolves.
- Terminal/internal-tool feel is welcome, but it must be readable and approachable.
- Avoid dense enterprise-dashboard layouts.

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

The current `prototype-v1` deployment uses the earlier structure where the player acts as NARC reviewing employees.

That build is a mechanical proof only. Its structure is superseded by this spec.

The next implementation pass should reuse code only where useful and should not preserve the old loop merely to avoid rewriting it.
