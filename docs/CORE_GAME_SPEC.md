# NARC Core Game Spec

**Status:** Active single-workday portfolio build  
**Updated:** 2026-09-25  
**Project:** NARC — Networked Assessment & Risk Coordination

## Purpose

Build a short, funny portfolio game that demonstrates applied understanding of AI/product limitations without requiring a live model.

The player is Employee 4417, a human worker inside a company that has deployed NARC as an AI workplace-monitoring system.

The player succeeds by learning what NARC actually measures, noticing where its interpretation is weak, and deciding when to comply, explain, help someone, or manipulate the trace NARC sees.

## One-line premise

**A human learns to game an AI workplace-monitoring system by understanding the difference between what the system sees and what is actually true.**

## Portfolio experience target

Target real-world playtime: **about 15 minutes**.

Healthy pacing:

- 1–2 minutes onboarding
- 8–10 minutes active decisions and reactions
- 2–3 minutes escalation and ending

The in-game workday spans 9:00–5:00, but gameplay is compressed.

Do not add filler to make the day feel longer.

## Core loop

> **notice competing priorities → decide → act → spend time → receive work/NARC/social feedback → reprioritize**

The player should regularly choose among:

- doing the actual work properly
- protecting visible productivity / personal standing
- helping or preserving trust with coworkers

The game is not working if Messages or scripted events are the only things that give the player something to do.

## Design north star

Keep the system easy to understand in seconds and interesting because the consequences are weird.

Per meaningful beat, prefer:

- one clear situation
- one or two relevant pieces of context
- two or three understandable actions
- an immediate or near-immediate system/human reaction
- a later payoff when useful

A beat probably belongs only if it:

- teaches a NARC rule
- forces a tradeoff
- creates a consequence
- reveals useful character/worldbuilding
- lets the player exploit or challenge the system
- pays off an earlier choice

## AI/product learning through play

The player should experience rather than be lectured about:

- proxies are not the real goal
- partial evidence is not full context
- confident interpretations can still be wrong
- people change behavior when they know what is measured
- optimizing a metric can make the metric less meaningful
- anti-gaming systems create an arms race
- model outputs become more consequential when institutions trust them too much

## Current single-day arc

### Opening

The player starts in a People Operations email explaining that NARC scores visible work traces.

Dana then gives a short workstation tour entirely through Messages.

Each tutorial message explains:

1. what app the player is about to open
2. why it matters
3. then gives the player the action to open it

The tutorial ends by sending the player to The Loop to choose one of three real responsibilities.

### Work choices

**Halcyon vendor renewal**
- quick skim: fast and visible
- careful review: slower, less visible, finds the buried rate increase

**Priya client escalation**
- canned apology: fast and visible
- investigate: slower, less visible, fixes the real problem

**Marcus project scope**
- cut scope yourself: fast and visible
- consult Marcus: slower, less visible, protects trust/context

Morning shortcuts can create afternoon rework.

### NARC reactions

NARC should act like a system with opinions, not passive analytics.

Current beats:

- baseline monitoring on login
- first automated read after first real task
- player can add context or leave the read standing
- midmorning pattern check
- Focus Time exploit
- NARC 2.0 adaptation
- later response to the adaptation

### Personal stakes

Player standing is deliberately simple:

- **Standard**
- **Trusted Operator**
- **Review Open**

A flattering automated read left standing can earn Trusted Operator status.

A low-activity read left standing can open a review.

Later choices can depend on that standing.

Example: a Trusted Operator can let Dana rely on NARC's summary for a faster check-in. This helps the player personally but can hide rushed or bad work.

Do not add a second score bar.

### Counterplay

**Focus Time**
- initially tells NARC that quiet activity is legitimate concentration
- coworkers adopt it
- NARC 2.0 begins treating repeated Focus Time as possible gaming

**keepalive.pkg**
- Marcus sends it after Focus Time is nerfed
- appears through Messages as an actionable attachment
- opens Utilities
- simulates input
- NARC counts the synthetic input as visible activity

The joke should come from the system confidently treating its observable proxy as truth.

## Messages rule

Almost every retained message must do at least one useful job:

- teach a NARC rule
- reveal evidence or a contradiction
- prompt a choice
- warn about a consequence
- implicate/protect someone
- point toward another app
- unlock an action
- set up a later callback

Use personality inside functional dialogue.

Do not add dialogue solely to make the desktop feel busy.

## Notifications rule

Notifications should be recoverable.

Toast:
- source/sender
- actual preview text

Notification center:
- recent history
- read/unread
- time
- click-through to app/thread

Do not rely on transient toasts for information required to continue.

## Desktop rules

The desktop is the game board.

Apps:

- The Loop
- Messages
- Email
- Calendar
- Files
- Utilities
- Browser
- NARC

Normal apps should feel like ordinary workplace software.

NARC keeps its darker monospace/system visual language.

Wide screens may keep up to three windows open. Narrow screens may show one primary window.

## Natural-action rule

Prefer workplace-computer actions over abstract story menus.

Examples:

- open a file
- reply to a coworker
- mark Focus Time
- add context to a NARC assessment
- install a utility
- ignore or leave a read standing

The deterministic branching can exist underneath. The player should feel like they are using the computer, not choosing from a screenplay.

## Realism standard

For every major mechanic:

**real capability → plausible inference → ridiculous institutional response → exploitable weakness**

Grounded monitoring ideas may include:

- active/passive workstation activity
- application usage
- website usage
- screenshots
- calendar/communication metadata
- idle time
- synthetic activity workarounds

NARC's employee classifications, Trusted Operator reward, and other institutional responses are fictional satirical extrapolations.

Do not imply every real employer or monitoring vendor uses these capabilities or makes these judgments.

## Company fiction

Current name: **Meridian Supply Co.**

Possible future rename: **GoodThink**.

GoodThink's proposed fiction is a workplace-tech company dogfooding NARC internally before selling it to clients.

The rename is not approved yet. Keep Meridian until Paige explicitly confirms it.

## Humor rules

- corporate wording stays sincere
- NARC never announces that it is dystopian
- coworkers sound like people trying to get through work, not tutorial NPCs
- humor comes from the mismatch between human reality and reductive measurement
- consequences still matter
- do not turn the game into a lecture

## Implementation stance

V1 is deterministic/authored-first.

A live LLM is not required.

Reasons:

- comedy is easier to control
- state is easier to test
- latency stays low
- portfolio visitors get a reliable short run
- generative dialogue has not yet shown a mechanic worth the added complexity

## Validation gate

Primary playtest question:

> **Did I regularly have an interesting answer to “what should I do next?”**

A successful run should show:

- most time spent deciding, acting, or investigating
- few/no filler beats
- tutorial completed in roughly 1–2 minutes
- total run around 15 minutes
- at least one strategy change
- player understands actual-work vs measured-work tension without coaching
- player discovers or uses at least one workaround
- at least one later consequence clearly connects to an earlier choice

Human/browser validation is still required before calling the current branch finished.

## Deferred

Do not pull these into the current portfolio-ready pass automatically:

- promotion/replay authority and NARC settings
- invasive personalization
- large employee simulation
- live AI requirement
- open world
- multiplayer
- backend persistence
- long narrative
