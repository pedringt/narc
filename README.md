# NARC

**Networked Assessment & Risk Coordination**

NARC is a short satirical workplace-surveillance game for Paige Edrington's AI product portfolio.

The player is an AI system reviewing employees through incomplete workplace telemetry. The company gradually gives NARC more invasive powers. The player can investigate, help, interfere with, report, or protect employees, and the game tracks the consequences for both the workers and NARC itself.

## Current prototype

This branch contains a deterministic first slice designed to answer one question: **is it fun to have absurdly disproportionate algorithmic power over ridiculous workplace behavior?**

The first slice is deliberately small:

- four employee cases
- limited investigation
- one optional intervention per case
- permanent-record decisions
- employee-specific outcomes
- a mid-run NARC policy escalation
- a final model performance review
- replayable "save everyone" and "fire almost everyone" paths

The current characters include:

- Luis, whose restroom time becomes a productivity concern
- Priya, who is too chatty in person and on Slack
- Nina, who refuses to take vacation
- Marcus, whose increasingly ridiculous attendance excuses may or may not survive scrutiny

## AI plan

The first prototype is deterministic. Live AI is intentionally deferred until the game loop is fun.

Later, a constrained model may play employee responses while the deterministic game engine continues to own truth, policy, state, consequences, and endings.

## Project rule

The institution is ridiculous. The consequences are real.
