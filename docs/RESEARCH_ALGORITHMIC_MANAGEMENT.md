# Research Notes: Algorithmic Management, Worker Surveillance, and NARC

**Status:** Background research for NARC design, September 2026  
**Purpose:** Ground the early game in documented workplace monitoring/algorithmic-management practices while clearly separating those from speculative NARC escalation.

## Design takeaway

NARC does not need a live LLM to demonstrate applied AI understanding.

A useful real-world framing is **algorithmic management**: software can use tracked data to organize, assign, monitor, supervise, or evaluate work. Some systems use AI/ML predictions; others are simpler rules-based systems. The game can therefore be deterministic while still exploring AI-product concepts such as proxy metrics, decontextualized inference, confidence vs truth, behavioral adaptation, feedback loops, and automated authority.

The core game principle remains:

> **NARC sees traces. It does not necessarily understand the worker.**

The player's fun comes from learning what the system actually measures and then evading, gaming, or exploiting those measurements.

## What is documented today

Current workplace surveillance and algorithmic-management practices can include:

- monitoring working time or periods of active work
- monitoring completion and speed of work
- computer monitoring software
- cameras and microphones
- geolocation and tracking applications
- wearable devices and body-movement data in some workplaces
- monitoring content/tone of communications in some settings
- worker health, safety, fatigue, or alertness signals in some settings
- software-supported evaluation and managerial decision-making

Important nuance: not every employer uses these tools, and not every tool uses AI.

### Useful current evidence

The OECD's 2025 employer survey found algorithmic management widely used in the countries surveyed and especially prevalent in the United States. It defines algorithmic management as software that automates or supports managerial tasks such as instructing, monitoring, or evaluating workers. The OECD also reports manager concerns about explainability, accountability for wrong decisions, worker awareness, and worker health.

The ILO defines algorithmic management as systems that use tracked data and other information to organize, assign, monitor, supervise, and evaluate work. It explicitly notes that these systems may use AI, but may also be simpler rules-based systems.

The U.S. GAO has documented workplace surveillance tools including cameras, microphones, computer-monitoring software, geolocation, tracking apps, and wearables, used for purposes such as productivity, performance, safety, security, location, and body movement. GAO also summarizes mixed evidence and stakeholder views about benefits and harms.

## How workers respond and evade

Research on worker resistance to surveillance describes both social and technical countermeasures. Examples include:

- sharing knowledge with coworkers about how monitoring works
- technological hacks
- manipulating interfaces
- gaming metrics and systems
- timing behavior around known surveillance windows
- changing routes or workflows to avoid or exploit measurement
- creating records or traces that satisfy the system without changing the underlying reality

This is the richest gameplay material for NARC.

The useful design abstraction is:

> **Once people know the metric, they optimize for the metric.**

That does not have to mean the same thing as doing better work.

## NARC gameplay categories inspired by the research

### 1. Presence gaming
The system treats keyboard/mouse or active-workstation signals as evidence of work.

Counterplay:
- mouse activity helper
- timed activity
- synthetic presence
- later anti-gaming detection

AI/product concept:
- proxy metric
- Goodhart-style optimization
- adversarial adaptation

### 2. Metric stuffing
The company counts visible artifacts such as messages, meetings, comments, files, or approved-tool usage.

Counterplay:
- generate more counted activity
- move work into the channel NARC rewards
- create low-value but highly visible work traces

AI/product concept:
- optimizing a measurable proxy can degrade the real goal

### 3. Record engineering
NARC relies on corroborating calendar, badge, location, ticket, or file records.

Counterplay:
- add or relabel records
- create technically defensible corroboration
- exploit the difference between "records exist" and "story is true"

AI/product concept:
- evidence pipelines
- data provenance
- garbage-in / context limitations

### 4. Category gaming
The same behavior is treated differently depending on its label.

Counterplay:
- "restroom time" becomes "unstructured ideation"
- chatter becomes "culture leadership"
- AI busywork becomes "transformation readiness"

AI/product concept:
- taxonomy and label design affect model/system outcomes

### 5. Social gaming
Coworkers help each other understand and exploit the system.

Counterplay:
- share hacks
- create corroborating traces
- warn about new NARC detection
- teach each other which signals matter

AI/product concept:
- systems change human behavior and create emergent adaptation

### 6. Compliance theater
The company measures adoption of a sanctioned process or AI tool.

Counterplay:
- meaningless AI prompts
- superficial use of approved tools
- visible "AI-assisted" artifacts that add no value

AI/product concept:
- adoption metrics are not outcome metrics

## Escalation model: current -> speculative

The game should be explicit internally about which ideas are grounded today and which are fictional extrapolations.

### Phase 1: What you did
Grounded in current monitoring concepts.

Examples:
- active time
- app/tool usage
- message volume
- speed/completion
- attendance/location
- after-hours work

### Phase 2: What NARC thinks it means
Plausible inference layer.

Examples:
- engagement
- collaboration
- communication load
- attendance credibility
- productivity/capacity concern

### Phase 3: Who NARC thinks you are
More speculative.

Examples:
- AI adoption resistance
- leadership alignment
- informal influence
- rest resistance
- attrition risk

### Phase 4: What NARC thinks you will do
Speculative predictive escalation.

Examples:
- likely to quit
- likely to resist a process change
- likely to disengage
- likely to organize coworkers
- likely to burn out

### Phase 5: NARC acts before you do
Full dystopian extrapolation.

Examples:
- restrict access because of predicted attrition
- schedule preemptive coaching
- disable tools because of "risk"
- mandate rest and lock the employee out
- limit communication because of predicted influence
- intervene before any actual misconduct occurs

The later phases are **NARC fiction**, not claims that ordinary employers currently do all of these things.

## Scenario directions worth keeping

### Behavioral normality
NARC learns a personal baseline and treats deviation itself as suspicious.

Comedy:
- lunch starts 11 minutes early
- user opens Calendar before Email on a Thursday
- "Uncharacteristic contentment detected"

Concept:
- anomaly detection can confuse unusual with bad

### Attrition-risk feedback loop
NARC predicts someone may leave, so the company restricts investment/access, which makes them more likely to leave.

Concept:
- self-fulfilling prediction
- automated feedback loop

### AI adoption loyalty
NARC measures approved AI usage as "transformation readiness."

Counterplay:
- meaningless prompts
- performative AI usage

Concept:
- adoption != value

### Informal influence network
A highly connected coworker first scores well on collaboration, then becomes an "unmanaged influence" risk.

Concept:
- the same data can support conflicting institutional objectives

### Sarcasm -> alignment
NARC initially misreads sarcasm literally, then upgrades to "sarcasm probability," then turns that into "leadership alignment risk."

Concept:
- sentiment/context failure
- escalating inference on top of uncertain inference

### Compulsory wellness
NARC detects overwork and starts "helping" by forcing PTO, disabling tools, or locking building access.

Concept:
- a well-intentioned objective can become coercive when automated

### Body / physiological monitoring
Later speculative NARC could use posture, movement, fatigue, heart-rate, or stress-like signals.

Concept:
- more data is not the same as more understanding

### Preemptive intervention
End-state dystopia: NARC acts based on predicted future behavior.

Comedy:
- "Preemptive coaching scheduled."
- Employee: "What did I do?"
- NARC: "Nothing yet."

Concept:
- predictions become decisions
- authority magnifies model error

## Important tone rule

NARC should not simply be stupid or always wrong.

Sometimes:
- the signal is useful
- Marcus really is lying
- the system catches a real pattern
- a safety/wellness signal could be legitimate

The more interesting lesson is:

> **A partial or probabilistic judgment becomes dangerous when an institution treats it as complete truth and grants it authority.**

## UX implication from the research

The educational loop should be learned through play:

1. NARC interrupts with a judgment or demand.
2. The player sees the signal/inference NARC used.
3. Coworkers, Calendar, Files, Messages, or Utilities reveal missing context or a loophole.
4. The player complies, challenges, evades, or manipulates the measured trace.
5. NARC reacts.
6. Later NARC adapts, creating an arms race.

This supports the current interaction direction:

> **NARC is the pressure. Coworkers and the rest of the desktop are the counterplay.**

## Sources

- OECD (2025), *Algorithmic management in the workplace: New evidence from an OECD employer survey*  
  https://www.oecd.org/en/publications/algorithmic-management-in-the-workplace_287c13c4-en.html
- OECD (2025), *How widespread is algorithmic management in workplaces?*  
  https://www.oecd.org/en/publications/how-widespread-is-algorithmic-management-in-workplaces_cda7a114-en.html
- International Labour Organization, *Algorithmic management in the workplace*  
  https://www.ilo.org/algorithmic-management-workplace
- International Labour Organization (2026), *AI-driven intrusive surveillance and loss of autonomy at work linked to psychosocial risks for employees*  
  https://www.ilo.org/resource/news/ai-driven-intrusive-surveillance-and-loss-autonomy-work-linked-psychosocial
- U.S. GAO (2024), *Digital Surveillance of Workers: Tools, Uses, and Stakeholder Perspectives*  
  https://www.gao.gov/products/gao-24-107639
- U.S. GAO (2025), *Digital Surveillance: Potential Effects on Workers and Roles of Federal Agencies*  
  https://www.gao.gov/products/gao-25-107126
- Sum, Shi & Fox (2024), *"It's Always a Losing Game": How Workers Understand and Resist Surveillance Technologies on the Job*  
  https://arxiv.org/abs/2412.06945
- Mitson, Lee & Anderson (2024/2025), *Gig Workers and Managing App-Based Surveillance*  
  https://journals.sagepub.com/doi/10.1177/00936502241269933
- van Zoonen, von Bonsdorff & van der Heijden (2025), *Algorithmic surveillance and workers' compliance*  
  https://journals.sagepub.com/doi/10.1177/00187267251379698
- Fernández-Ruiz, Piña & Vilasís-Pamos (2025/2026), *Video games as spaces for providing information and awareness of algorithmic control in the gig economy*  
  https://journals.sagepub.com/doi/10.1177/14614448241307036


## Current verification pass (2026-09-23)

A fresh source check reinforces the realism boundary used by the game.

### Clearly grounded monitoring capabilities

The UK Information Commissioner's Office worker-monitoring guidance explicitly discusses current monitoring methods including webcams/screenshots, timekeeping and access control, keystroke logging, productivity tools that log how workers spend time, internet activity, and location tracking through body-worn devices. The same guidance notes that employers increasingly use data analytics to infer worker performance and wellbeing, and that automated/people-analytics tools can make predictions, inferences, and decisions about workers.

Sources:
- ICO, *Data protection and monitoring workers*: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/data-protection-and-monitoring-workers/
- ICO, *What do we need to do if we use monitoring tools that use solely automated processes?*: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/what-do-we-need-to-do-if-we-use-monitoring-tools-that-use-solely-automated-processes/

These sources support NARC's grounded foundation of activity/time signals, access/location traces, productivity monitoring, and an inference layer on top of worker data.

### Collaboration / work-pattern analytics are real, but context matters

Microsoft Viva Insights currently documents metrics such as after-hours collaboration, email/chat/call activity, meeting hours, focus time, network size, and other collaboration patterns. Microsoft also describes privacy/confidentiality controls and, in some surfaces, minimum-group or role-based access. These products therefore support the realism of NARC drawing on communication volume, focus time, after-hours work, and collaboration-pattern data.

Sources:
- Microsoft, *Advanced analysis metric descriptions*: https://learn.microsoft.com/en-us/viva/insights/advanced/reference/metrics
- Microsoft, *Introduction to Viva Insights*: https://learn.microsoft.com/en-us/viva/insights/
- Microsoft, *Network in Viva Insights*: https://learn.microsoft.com/viva/insights/personal/teams/network
- Microsoft, *Export Viva Insights data to Viva Glint*: https://learn.microsoft.com/en-us/viva/insights/advanced/admin/export-insights-data-glint

### Important claim boundary

These sources **do not** establish that ordinary employers routinely use every metric at the individual level to make punitive employment decisions. They also do not validate NARC's later fictional constructs such as Policy-workaround likelihood, automatic termination based on a forecast, leadership alignment, sarcasm probability, or preemptive access restriction.

For public case-study language, use the pattern:

> grounded signal/capability -> plausible inference -> fictional institutional escalation

Do not cite a collaboration analytics product as proof that a company currently fires individual workers from that metric. The existence of a measurable signal and the authority granted to it are separate claims.


## Vendor-level verification refresh (2026-09-24)

A fresh documentation check adds current product-level examples for the grounded signal layer of NARC.

### Activity and application/website signals

ActivTrak's current documentation describes:
- website and application usage by duration
- productive / unproductive / undefined classifications
- active vs passive time
- active time based on keyboard or mouse input
- passive time when input stops, while explicitly noting that passive time can still include legitimate work such as meetings, videos, phone calls, or reading documentation
- configurable thresholds for when passive time begins/stops

Sources:
- ActivTrak, *Website Usage*: https://support.activtrak.com/hc/en-us/articles/360030904192-Website-Usage
- ActivTrak, *Active Time and Passive Time*: https://support.activtrak.com/hc/en-us/articles/360026990372-Active-Time-and-Passive-Time
- ActivTrak, *Application Usage*: https://support.activtrak.com/hc/en-us/articles/35320836319643-Application-Usage
- ActivTrak, *Insights Data Glossary*: https://support.activtrak.com/hc/en-us/articles/360058644472-Insights-Data-Glossary

This is especially useful grounding for NARC's Monday joke: low keyboard/mouse input can be a real observable signal while still being incomplete evidence about whether useful work occurred.

### Collaboration and calendar signals

Microsoft Viva Insights documentation describes use of email, calendar, Teams chats/calls, focus time, and related collaboration activity to produce workplace insights. Microsoft also documents calendar-based focus-time behavior.

Sources:
- Microsoft, *Advanced analysis metric rules*: https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/metric-rules
- Microsoft, *Use Microsoft Viva Insights in Outlook*: https://learn.microsoft.com/en-us/viva/insights/personal/use/use-insights

This supports using scheduling and collaboration traces as recognizable raw material for NARC. It does **not** establish that ordinary employers routinely use these signals to make NARC-style individual punitive decisions.

### Claim boundary remains unchanged

The existence of a measurable workplace signal is not evidence that NARC's fictional inference or institutional response is standard practice.

Public case-study language should continue to separate:
1. **documented signal/capability**
2. **plausible inference**
3. **fictional satirical escalation**

For example, keyboard/mouse activity and app usage are documented capabilities. “Engagement concern: 91%” and automatic termination from those traces are NARC fiction.
