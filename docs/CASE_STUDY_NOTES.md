# NARC Case Study Notes

**Status:** Working source notes for a future portfolio case study. Not polished public copy.  
**Project:** NARC — Networked Assessment & Risk Coordination  
**Repo:** pedringt/narc  
**Current product goal:** a short, funny 5–15 minute portfolio game that teaches AI/product ideas through play.

## One-sentence concept

NARC is a deterministic workplace-satire game where the player learns how an AI-like monitoring system works by reverse-engineering its signals, exploiting its blind spots, and deciding whether to protect or expose coworkers.

## Core thesis

The game should not teach AI by stopping to explain AI.

The player should experience ideas such as proxy metrics, missing context, confidence vs truth, Goodhart-style metric gaming, feedback loops, anti-gaming arms races, and automated authority by **outsmarting NARC**.

A useful internal framing:

> **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**

And:

> **Hide the branching structure, not the available affordances.**

## Why this became a portfolio project

The project was intentionally scoped as something a portfolio reviewer could understand and enjoy in a few minutes rather than a large game.

Target experience:
- fast player: roughly 5–7 minutes
- normal first run: roughly 8–10 minutes
- curious/exploratory run: up to ~15 minutes
- replay is optional, for trying different choices/outcomes

The project is meant to demonstrate:
- AI product judgment without requiring a live model
- human-in-the-loop thinking
- understanding of model limitations and proxy metrics
- interaction design
- deterministic state design
- QA / branch testing
- scope discipline
- ability to turn research into product behavior rather than a written explainer

## Origin / evolution

The project grew out of an earlier AI-game exploration under the working title **Tell Me What You Remember**. That prototype focused on an AI system, hidden state, memory, contradiction, and replay.

The concept then shifted toward a more immediately legible workplace setting and was renamed **NARC — Networked Assessment & Risk Coordination**.

The workplace version created a clearer comic/gameplay loop:
1. NARC observes partial work traces.
2. NARC makes an inference.
3. The workplace gives the inference authority.
4. The player finds the missing human context.
5. The player can comply, challenge, exploit, or manipulate the system.
6. NARC adapts.

The workplace-monitoring setting also allowed real current practices to blend naturally into speculative dystopian escalation.

## Key design decision: deterministic, not live AI

A live LLM is **not required** for V1.

That was a deliberate product decision, not a technical limitation.

Why:
- NARC's lesson is about the relationship between signals, inference, authority, and human behavior.
- Those relationships can be modeled clearly with deterministic state.
- Deterministic logic keeps consequences, evidence, permissions, and endings coherent.
- It makes exhaustive branch testing practical.
- It avoids a live model making the game's canon or rules unstable.
- The absence of a live model reinforces an important point: many systems people experience as "AI management" may combine simple rules, scores, predictions, and automated decisions rather than a conversational model.

The AI/product idea is therefore expressed in the **system behavior**, not in a chatbot.

## Research foundation

Research notes live in:
- `docs/RESEARCH_ALGORITHMIC_MANAGEMENT.md`

Research areas used to ground the game:
- algorithmic management
- employee/workplace monitoring
- proxy productivity metrics
- location/activity tracking
- worker resistance and evasion
- metric gaming
- algorithmic evaluation and managerial decision support

Design abstraction derived from the research:

> Once people know what is measured, they optimize for the measurement.

The game begins with recognizable current monitoring ideas, then can move into explicitly fictional extrapolations.

### Escalation ladder

1. **What you did**  
   Activity, messages, apps, attendance, location.

2. **What NARC thinks it means**  
   Engagement, collaboration, credibility, productivity.

3. **Who NARC thinks you are**  
   Resistant, influential, poorly aligned, likely to leave.

4. **What NARC thinks you will do**  
   Quit, disengage, resist a change, burn out.

5. **NARC acts before you do**  
   Restrictions, mandatory coaching, lockouts, preemptive action.

V1 only uses a small subset of this. The rest remains a future scenario bank.

## Major interaction-design evolution

### Early approach

The early prototype behaved too much like a traditional branching text game:
- scenario card appears
- player reads setup
- player chooses an explicit option
- result appears
- continue

This made the mechanics obvious but undermined the goal of making the player feel like they were using a real work computer.

### Desktop-as-game-board decision

The interface was rebuilt as a fictional workplace desktop.

Current surfaces:
- Email
- Messages
- Calendar
- Files
- Utilities
- NARC

The player makes decisions through ordinary workstation actions:
- read/open
- reply
- edit/add calendar records
- inspect files
- install/toggle a utility
- attach/send evidence
- dismiss or ignore
- log off

This makes the branching structure less visible and allows discoveries to feel like workarounds rather than menu choices.

### Progressive disclosure

A later playtest found that exposing every app at once made the player unsure what to do.

The new rule:

> Do not expose a workstation surface before the player has a reason to understand or use it.

Current direction:
- Email starts visible
- Messages + Calendar arrive through Dana's orientation
- NARC becomes a visible surface when the first NARC case exists
- Files/Utilities appear when relevant evidence or tools are introduced

This is meant to reduce cognitive load while keeping the fake-desktop illusion.

## Major playtest finding: the player did not know what to do

The desktop rework solved one problem but created another: it hid the game structure so successfully that the player's available actions became unclear.

The response was **not** to return to giant A/B/C story buttons.

Instead, the design rule became:

> **Hide the branching structure, not the available affordances.**

Each incident should surface at least two plausible leads through:
- NARC explaining what it observed or what evidence is missing
- coworker messages
- a new/changed app marker
- existing policy/email
- relevant files/calendar/utilities

The player should not need to click every app randomly.

## Orientation

The first run now starts with the People Operations email already open.

The email:
- expands NARC as **Networked Assessment & Risk Coordination**
- states that workplace activity is monitored
- explains that alerts/reviews may appear
- identifies the NARC status area

Then Dana introduces herself as the player's manager and asks the player to check Calendar and reply in Messages.

No consequential incident starts until this orientation is completed.

This was added after early playtesting showed that notifications and coworkers were arriving before the player understood the workstation.

## NARC as a character/system

NARC is not intended to be a chatbot.

Its personality comes from:
- notifications
- status changes
- confidence scores
- corporate wording
- repeated reassurance
- recommendations
- automated consequences
- increasingly intrusive monitoring

Its comedy works best when the institution is completely serious.

Tone principle:

> **The institution is ridiculous; the consequences are real.**

NARC should also not simply be "stupid."

Sometimes:
- the signal is useful
- NARC catches real behavior
- a coworker really is lying
- a workplace problem really exists

The deeper failure is treating partial/probabilistic evidence as complete truth once the system has institutional authority.

## Making the AI layer legible

A later playtest reached the end and found that the experience still did not feel strongly enough like AI.

That prompted a more explicit presentation of:

**workplace signals → NARC inference → company action**

Case views now distinguish:
- **What NARC observed**
- **What NARC inferred**
- model confidence
- resulting workplace action

Incident notifications also include inference/confidence so the AI idea is visible even if the player does not open every NARC case.

NARC 2.0 now generates a deterministic forward-looking **behavioral forecast** for the player, moving the arc from:
- observation
- inference
- adaptation
- prediction

The purpose is not to add technical jargon. It is to let the player see that the software is moving from records to interpretation and then to authority.

## Current scenario-to-concept mapping

### Employee 4417 / printed contract
NARC sees low keyboard/mouse activity while the player is reading a printed contract.

Files later show the player found a $40,000 pricing discrepancy.

Concepts:
- proxy metric vs actual value
- missing context
- visible activity is not productivity

### Luis / restroom-adjacent inactivity
NARC measures away-from-desk/restroom-adjacent time while support output shows Luis above the team median.

Possible player responses include:
- report him
- decline to confirm
- create a calendar cover
- install/share a mouse activity helper
- send output evidence
- relabel the time

Concepts:
- proxy metrics
- category/taxonomy gaming
- synthetic activity
- anti-gaming arms race
- evidence the model has no field for

### Marcus / attendance and corroboration
Marcus gives increasingly questionable excuses. Calendar, transit data, location traces, and records can support or undermine them.

Concepts:
- corroboration pipelines
- record engineering
- history outweighing new evidence
- confidence vs truth
- sometimes the ridiculous excuse is actually true

### Priya / communication load
NARC simultaneously rewards Priya's collaboration and penalizes her communication volume.

If the player tells her to post less, the Communication Load metric improves, then her Collaboration Index collapses and NARC can terminate her.

Concepts:
- conflicting objectives
- feedback loops
- optimizing one metric damages another
- a worker can follow the system's advice and still be punished

### NARC 2.0
The upgrade detects fixed synthetic input patterns and generates a behavioral forecast.

Concepts:
- anti-gaming arms race
- anomaly detection
- prediction
- increasing automated authority

## Agency and endings

A key playtest/design correction was that the player should not be forced into "narc on coworker" routes.

When Dana asks a direct question, the player should usually retain meaningful choices such as:
- protect/help
- report/expose
- manipulate the evidence/system
- decline / stay out of it

The outcome should be compositional rather than one good/bad ending.

Possible ending shapes include:
- everyone remains employed
- one or more coworkers are terminated
- the player is terminated
- player survives while coworkers are fired
- player is fired while coworkers survive
- NARC absurdly rewards someone for gaming the metric
- everyone technically survives through manipulated records

The player can now be terminated after accumulating enough integrity flags.

Priya also has a termination path, increasing the possible combinations of who survives the week.

## Replay

The ending originally said **"Log off and start a new week."**

That implied a literal Week 2 even though the code actually reset to the same authored week.

It was changed to:

**Replay this week**

Replay is now framed honestly as trying the same scenario again with different decisions.

## Copy / tone lessons from playtesting

Several lines were revised because they sounded like "written comedy" or tutorial copy rather than coworkers speaking naturally.

Examples of feedback:
- Dana: "Saw the dip! No pressure. Maybe a little more… on Messages?" felt like mechanic-delivery copy.
- Priya: "I asked Claire what she was having for lunch, and it was a workflow" felt over-written.
- Luis repeated the same "unavailable" joke twice.
- Marcus's "bird's work" joke over-explained itself.

Tone direction:
- coworkers should sound like people
- NARC / HR should carry most of the unnatural corporate language
- comedy should come from the situation and consequence, not every line trying to land a joke

Coworker reply chips were also revised to remove explicit design labels like **Sincere tip** and **Polite sabotage**, because those exposed the branch structure.

## Scope decisions

Things intentionally deferred:
- Nina and Maya
- more coworkers
- larger story/world
- live LLM behavior
- broad future-dystopian scenario expansion
- full physiological monitoring
- attrition-risk systems
- AI-adoption loyalty scoring
- influence-network inference
- sarcasm/alignment inference
- preemptive intervention

The current goal is to make the existing slice:
- clear
- funny
- replayable
- recognizably AI-informed
- complete in under ~15 minutes

More content should only be added after the core loop is working.

## Engineering / QA approach

Current implementation:
- static front-end
- deterministic state machine
- `game.js` owns state/rules/consequences
- `app.js` renders workstation state
- branch consequences are scheduled through deterministic deliveries
- no hidden idle fallback
- notification close does not equal choosing "ignore"

The project includes a large route test suite intended to verify that all branch combinations reach an ending without broken state.

This is particularly aligned with the creator's QA background: changes are evaluated both as product behavior and as state/branch integrity.

## What Paige did vs AI tools

This attribution should remain explicit in the public case study.

### Paige
- originated and shaped the product concept
- chose the workplace-monitoring direction
- chose the NARC name/acronym
- set the tone: funny, dystopian, institutionally serious
- defined the portfolio scope and target play length
- repeatedly playtested the live prototype
- identified confusing interactions and awkward copy
- made product calls on agency, pacing, progressive disclosure, NARC's role, and replay
- decided that players should be able to help or hurt coworkers and that any combination of people may survive/be fired
- connected the game to AI concepts she wanted to demonstrate
- decided V1 should stay deterministic rather than adding live AI for its own sake
- reviewed and accepted/rejected implementation ideas as they emerged

### ChatGPT / Claude Code / AI tools
- helped brainstorm scenarios and interaction patterns
- researched workplace monitoring, algorithmic management, worker resistance/evasion, and speculative escalation
- translated feedback into implementation requirements
- drafted/refined copy options
- implemented code changes through GitHub
- maintained handoff/spec/acceptance-criteria documentation
- expanded automated tests
- helped synthesize the AI concepts represented by each scenario

Important public framing:

> AI tools accelerated research, ideation, implementation, and iteration. Product direction, scope, taste, playtest judgment, and final decisions remained human-owned.

## Useful case-study story arc

A strong eventual case study can be structured around **product iteration**, not around listing every feature.

Possible narrative:

1. **Goal** — Can a short game teach AI-system limitations without becoming an educational explainer?
2. **First hypothesis** — Use deterministic scenarios to make model/proxy failures playable.
3. **First prototype problem** — Explicit scenario cards made it feel like a branching text game.
4. **Interaction redesign** — Turn the work desktop into the game board.
5. **Second problem** — Hiding the branches also hid what the player could do.
6. **Discoverability redesign** — Progressive disclosure + contextual leads.
7. **Third problem** — It still felt more like surveillance software than AI.
8. **AI-system redesign** — Surface signals, inference, confidence, adaptation, and prediction.
9. **Agency problem** — Some routes accidentally forced the player to report coworkers.
10. **Outcome redesign** — Preserve protect/report/neutral/gaming choices and make employment outcomes compositional.
11. **Scope discipline** — Keep the playable slice short instead of expanding the scenario bank.
12. **Result** — A compact deterministic game that communicates AI-product lessons through consequences and counterplay.

## Evidence to capture during future playtests

For the eventual public case study, record:
- first-run completion time
- where the player hesitates
- whether they understand why NARC made a judgment
- whether they discover at least two ways to game NARC without help
- whether they understand that confidence is not truth
- whether NARC 2.0 feels like escalation/adaptation
- whether the player understands why someone was fired or rewarded
- whether the player wants to replay
- screenshots of major iteration stages if available

## Current public-case-study caution

Do not imply that all NARC behavior represents current real-world employer capabilities.

Use explicit language:
- **grounded in documented current monitoring/algorithmic-management practices**
- **speculative extension**
- **satirical extrapolation**

Research citations should be added when the public case study is written.
