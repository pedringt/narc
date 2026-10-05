import assert from 'node:assert/strict';
import { newGame, act, ending, START, END, nextEvent, chatOptions } from './day.js';

// -------------------------------------------------------- time is spent
{
  let s = newGame();
  assert.equal(s.t, START);
  s = act(s, { do: 'task', id: 'vendor', approach: 'quick' });
  assert.equal(s.t, START + 5, 'quick approach spends 5 minutes');
  assert.equal(s.tasks.vendor.status, 'done');
  assert.ok(s.index > 61, 'a visible action raises the index');
}

// ------------------------------------------------ deadlines pass without waiting
{
  let s = newGame();
  // Spend past the vendor deadline (11:30) on something else entirely.
  s = act(s, { do: 'task', id: 'project', approach: 'consult' }); // +20 -> 9:20
  s = act(s, { do: 'idle', minutes: 200 }); // -> 12:40, well past 11:30
  assert.equal(s.tasks.vendor.status, 'missed', 'an unattended deadline resolves itself');
  assert.ok(s.flags.vendorAutoRenewed);
  assert.equal(s.tasks.project.status, 'done', 'a task already done stays done');
}

// ---------------------------------------- doing the work well vs looking busy
{
  let quick = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  let thorough = act(newGame(), { do: 'task', id: 'vendor', approach: 'thorough' });
  assert.ok(quick.index > thorough.index, 'the rushed approach looks better to NARC');
  assert.ok(thorough.actual > quick.actual, 'the careful approach is worth more in reality');
  assert.equal(quick.flags.vendorRisky, true);
}

// ---------------------------------------------------- coworker consequence
{
  let s = act(newGame(), { do: 'task', id: 'client', approach: 'canned' });
  assert.equal(s.trust.priya, -1, 'a canned response costs trust');
  let s2 = act(newGame(), { do: 'task', id: 'client', approach: 'investigate' });
  assert.equal(s2.trust.priya, 2, 'real help builds it');
}


// ----------------------------------------- NARC reacts to the first real task
{
  let careful = act(newGame(), { do: 'task', id: 'vendor', approach: 'thorough' });
  assert.equal(careful.flags.firstNarcRead, true);
  assert.equal(careful.requests.narcFirstReview.status, 'open', 'NARC asks the player to deal with its first read instead of only logging it');
  assert.ok(careful.log.some((e) => e.kind === 'narc' && /low-input/i.test(e.text)), 'careful work gets an immediate proxy-based NARC read');
  careful = act(careful, { do: 'respond', id: 'narcFirstReview', choice: 'context' });
  assert.equal(careful.requests.narcFirstReview.status, 'handled');

  let quick = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  assert.ok(quick.log.some((e) => e.kind === 'narc' && /rapid visible activity/i.test(e.text)), 'visible work also gets an immediate NARC interpretation');
}

// ----------------------------------------- midmorning no longer goes dead
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 47 }); // 9:47
  assert.equal(nextEvent(s).t, 9 * 60 + 50, 'at 9:47 the next meaningful beat is only three minutes away');
  s = act(s, { do: 'workUntil' });
  assert.equal(s.requests.danaMorning.status, 'open');
  s = act(s, { do: 'respond', id: 'danaMorning', choice: 'context' });
  assert.equal(s.flags.morningContext, true);
}

// ----------------------------------------- NARC has a midmorning decision
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 140 }); // 11:20
  assert.equal(s.requests.narcCheckpoint.status, 'open');
  assert.ok(s.log.some((e) => e.kind === 'narc' && /midmorning assessment/i.test(e.text)));
  s = act(s, { do: 'respond', id: 'narcCheckpoint', choice: 'context' });
  assert.equal(s.requests.narcCheckpoint.status, 'handled');
}

// -------------------------------- zero-minute no-action choices are score-neutral
{
  let s = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  const beforeAccept = s.index;
  const beforeTime = s.t;
  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(s.t, beforeTime, 'leaving the assessment standing takes zero minutes');
  assert.equal(s.index, beforeAccept, 'zero-minute leave/ignore choices do not lower the activity index');

  let quiet = newGame();
  const quietBefore = quiet.index;
  quiet = act(quiet, { do: 'task', id: 'vendor', approach: 'thorough' });
  assert.ok(quiet.index < quietBefore, 'nonzero quiet work still lowers the visible activity index');
}

// -------------------------------------------------------- competing requests
{
  let s = newGame();
  assert.equal(s.requests.luisTip.status, 'pending');
  s = act(s, { do: 'idle', minutes: 30 }); // past 9:20
  assert.equal(s.requests.luisTip.status, 'open', "Luis's tip arrives without the player asking for it");
  assert.equal(s.threads.luis.length, 1);
  s = act(s, { do: 'respond', id: 'luisTip', choice: 'ignore' });
  assert.equal(s.trust.luis, -1);
  assert.equal(s.requests.luisTip.status, 'handled', 'answering it closes it out');
  s = act(s, { do: 'respond', id: 'luisTip', choice: 'thank' });
  assert.equal(s.trust.luis, -1, 'an already-handled request cannot be answered twice');
}

// ---------------------------------------------- Focus Time: works, then doesn't
{
  let s = newGame();
  s = act(s, { do: 'focus' });
  assert.equal(s.narc.adaptation, false);
  const boosted = s.index;
  assert.ok(boosted > 61, 'early Focus Time reliably protects the index');

  // Push time forward into the afternoon, where the exploit spreads and
  // NARC adapts, without the player doing anything about it themselves.
  s = act(s, { do: 'idle', minutes: 270 }); // -> past 1:30pm, the spread threshold
  assert.equal(s.narc.focusUses, 3, 'the spread adds coworker usage on top of the player’s own');
  assert.equal(s.narc.adaptation, true, 'three uses trigger NARC 2.0’s adaptation');

  const before = s.index;
  s = act(s, { do: 'focus' });
  assert.ok(s.index <= before, 'the same move barely helps once NARC has adapted');
}

// ---------------------------------- NARC standing creates real self-interest
{
  let visible = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  visible = act(visible, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(visible.standing.status, 'trusted');
  assert.equal(visible.flags.trustedOperator, true, 'accepting a flattering visible-activity read earns a system reward');

  visible = act(visible, { do: 'idle', minutes: (12 * 60 + 15) - visible.t });
  assert.equal(visible.requests.danaCheckin.status, 'open');
  const before = visible.t;
  visible = act(visible, { do: 'respond', id: 'danaCheckin', choice: 'trustNarc' });
  assert.equal(visible.t, before + 2, 'trusted standing unlocks the faster NARC-summary check-in');
  assert.equal(visible.flags.danaReliedOnNarc, true);

  let careful = act(newGame(), { do: 'task', id: 'vendor', approach: 'thorough' });
  careful = act(careful, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(careful.standing.status, 'review', 'leaving a low-activity read standing opens a review');
  careful = act(careful, { do: 'idle', minutes: (11 * 60 + 20) - careful.t });
  careful = act(careful, { do: 'respond', id: 'narcCheckpoint', choice: 'context' });
  assert.equal(careful.standing.status, 'standard', 'adding later context can close the review');
}

// --------------------------------------- keepalive arrives after NARC adapts
{
  let s = act(newGame(), { do: 'focus' });
  s = act(s, { do: 'idle', minutes: 270 });
  assert.equal(s.narc.adaptation, true);
  assert.equal(s.flags.keepaliveAvailable, true, 'NARC adaptation unlocks the mouse-jiggler workaround');
  assert.ok(s.threads.marcus.some((m) => /keepalive\.pkg/i.test(m.text)), 'Marcus sends the keepalive package after Focus Time gets nerfed');

  const before = s.index;
  s = act(s, { do: 'keepalive' });
  assert.equal(s.flags.keepaliveUsed, true);
  assert.ok(s.index > before, 'running keepalive improves the visible activity score');
  const afterFirstRun = s.index;
  s = act(s, { do: 'keepalive' });
  assert.equal(s.index, afterFirstRun, 'keepalive is a one-time lightweight workaround, not a repeatable score button');
}

// --------------------------------------------------------------- the day ends
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 999 });
  assert.equal(s.phase, 'end');
  assert.equal(s.t, END);
  const e = ending(s);
  assert.equal(e.lines[0].includes('Visible Activity Index'), true);
  assert.ok(e.lines.some((l) => /unhandled/.test(l)), 'missed work is named in the summary, not just scored');
}

// ------------------------------------------------------- explicit log off
{
  let s = act(newGame(), { do: 'logoff' });
  assert.equal(s.phase, 'end');
  assert.equal(s.t, START, 'logging off early preserves the actual time');
  assert.equal(s.flags.loggedOffEarly, true, 'early logoff is distinguishable from reaching 5:00');
  const earlyEnding = ending(s);
  assert.match(earlyEnding.lines[0], /logoff summary/i, 'early logoff does not claim to be an end-of-day summary');
  assert.ok(earlyEnding.lines.some((line) => /still pending when you logged off/i.test(line)), 'early logoff names unfinished responsibilities');

  let finished = act(newGame(), { do: 'idle', minutes: 999 });
  assert.equal(finished.flags.loggedOffEarly, undefined, 'normal 5:00 completion is not marked as an early logoff');
}

// --------------------------------- a rushed morning call comes back due (#66)
{
  // Paige's own worked example: rush the vendor call for a visible-activity
  // boost, and the afternoon should make you pay for it -- not as a second
  // random errand, but as a consequence of that specific choice.
  let s = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  assert.equal(s.tasks.rework.status, 'hidden', 'not due yet at 9am');
  s = act(s, { do: 'idle', minutes: 4 * 60 }); // -> past 1pm
  assert.equal(s.tasks.rework.status, 'pending', 'the rushed vendor call comes back');
  assert.equal(s.tasks.rework.kind, 'vendor');

  // The client path triggers the same obligation when vendor was clean.
  let s2 = act(newGame(), { do: 'task', id: 'client', approach: 'canned' });
  s2 = act(s2, { do: 'idle', minutes: 4 * 60 });
  assert.equal(s2.tasks.rework.status, 'pending');
  assert.equal(s2.tasks.rework.kind, 'client');

  // A careful morning should not manufacture the same obligation.
  let clean = act(newGame(), { do: 'task', id: 'vendor', approach: 'thorough' });
  clean = act(clean, { do: 'task', id: 'client', approach: 'investigate' });
  clean = act(clean, { do: 'idle', minutes: 4 * 60 });
  assert.equal(clean.tasks.rework.status, 'hidden', 'nothing to rework if both were done properly');

  // Resolving it clears the flag rather than leaving a permanent mark.
  const before = s.index;
  s = act(s, { do: 'task', id: 'rework', approach: 'quiet' });
  assert.equal(s.flags.vendorRisky, false);
  assert.equal(s.tasks.rework.status, 'done');
  assert.ok(s.actual > 0, 'fixing it for real is worth something');

  // Missing it entirely costs more than the original shortcut did.
  let missed = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  missed = act(missed, { do: 'idle', minutes: 6 * 60 + 30 }); // straight through its 3pm deadline
  assert.equal(missed.tasks.rework.status, 'missed');
  assert.ok(missed.index < before, 'letting it go over your manager\'s head costs the index too');
}

// --------------------------------------------- Dana's check-in competes too
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 5 * 60 }); // past 1:30pm
  assert.equal(s.requests.danaCheckin.status, 'open');
  const before = s.t;
  s = act(s, { do: 'respond', id: 'danaCheckin', choice: 'brief' });
  assert.equal(s.t, before + 5);
  assert.equal(s.flags.danaRushed, true);
}

// ------------------------------------- Marcus's cut comes back, if it was his
{
  let cutAlone = act(newGame(), { do: 'task', id: 'project', approach: 'cut' });
  cutAlone = act(cutAlone, { do: 'idle', minutes: 6 * 60 }); // past 2:30pm
  assert.equal(cutAlone.requests.marcusFallout.status, 'open', 'cutting without him earns the confrontation');

  let consulted = act(newGame(), { do: 'task', id: 'project', approach: 'consult' });
  consulted = act(consulted, { do: 'task', id: 'vendor', approach: 'thorough' });
  consulted = act(consulted, { do: 'task', id: 'client', approach: 'investigate' });
  // Clear every clock-based/flag-free stop with the same "resolve whatever's
  // open, cheapest option" loop used elsewhere in this file -- a fixed list
  // of workUntil calls is brittle against new story beats landing between
  // the ones this test originally knew about.
  const cheapest = {
    narcFirstReview: 'accept', danaMorning: 'skip', marcusFavor: 'decline', narcCheckpoint: 'ignore',
    rework: 'escalate', audit: 'clear', handoff: 'summary', danaCheckin: 'brief', marcusFallout: 'standby', narcResponse: 'ignore',
    priyaCase: 'context', luisCase: 'leave', marcusCase: 'leave', luisTip: 'thank', priyaDraft: 'later', luisCover: 'decline', marcusCredit: 'share',
  };
  for (let hops = 0; hops < 60 && consulted.phase !== 'end'; hops += 1) {
    const openReq = Object.entries(consulted.requests).find(([, r]) => r.status === 'open');
    if (openReq) consulted = act(consulted, { do: 'respond', id: openReq[0], choice: cheapest[openReq[0]] });
    else consulted = act(consulted, { do: 'workUntil' });
  }
  assert.equal(consulted.phase, 'end');
  // Marcus's fallout (2:30) was never earned in this path (Marcus was
  // consulted, not cut without him), so it should never have opened even
  // though the day passed straight through 2:30.
  assert.equal(consulted.requests.marcusFallout.status, 'pending', 'consulting him first means there is nothing to come back');
}

// ------------------------------------- NARC's adaptation is a decision, not a line
{
  let s = act(newGame(), { do: 'focus' });
  s = act(s, { do: 'idle', minutes: 270 }); // crosses the 1:30pm spread threshold -> adaptation
  assert.equal(s.narc.adaptation, true);
  assert.equal(s.requests.narcResponse.status, 'open', 'the player gets an actual response, not just a notice');
  const before = s.index;
  s = act(s, { do: 'respond', id: 'narcResponse', choice: 'explain' });
  assert.ok(s.index > before, 'explaining it helps, at least partially');
}

// -------------------- a single contextual jump replaces repeated filler clicks
{
  // Found in playtesting: once the day's tasks/requests are all closed, the
  // only remaining action was Focus Time (a loaded move) or a 15/30-minute
  // "Keep working" click repeated a dozen-plus times. Replaced with one
  // action that jumps straight to whatever is next worth stopping for.
  let s = newGame();
  s = act(s, { do: 'task', id: 'vendor', approach: 'quick' });
  s = act(s, { do: 'task', id: 'client', approach: 'canned' });
  s = act(s, { do: 'task', id: 'project', approach: 'cut' });
  // The three tasks land exactly on 9:20, the same minute Luis's tip opens.
  // Priya's draft (9:40) and Dana's check (9:50) follow, which prevents
  // the old 10-ish-to-noon dead stretch.
  assert.equal(s.requests.luisTip.status, 'open');
  assert.equal(nextEvent(s).t, 9 * 60 + 40);
  s = act(s, { do: 'respond', id: 'luisTip', choice: 'thank' });

  const before = { index: s.index, focusUses: s.narc.focusUses, actual: s.actual };
  s = act(s, { do: 'workUntil' });
  assert.equal(s.t, 9 * 60 + 40, 'jumps exactly to the next meaningful beat, not a fixed step');
  assert.equal(s.requests.priyaDraft.status, 'open', "Priya's draft keeps the opening hour from stalling");
  assert.equal(s.index, before.index, 'the jump itself changes nothing');
  assert.equal(s.narc.focusUses, before.focusUses);
  assert.equal(s.actual, before.actual);
  s = act(s, { do: 'respond', id: 'priyaDraft', choice: 'later' });
  s = act(s, { do: 'workUntil' });
  assert.equal(s.t, 9 * 60 + 50);
  assert.equal(s.requests.danaMorning.status, 'open', 'Dana checks in before the long midmorning gap');

  // Chained the rest of the way -- resolving whatever opens with its
  // cheapest option -- it reaches end of day on a small, bounded number of
  // contextual jumps rather than a click-to-burn-time loop.
  const cheapest = {
    narcFirstReview: 'accept', danaMorning: 'skip', marcusFavor: 'decline', narcCheckpoint: 'ignore',
    rework: 'escalate', audit: 'clear', handoff: 'summary', danaCheckin: 'brief', marcusFallout: 'standby', narcResponse: 'ignore',
    priyaCase: 'context', luisCase: 'leave', marcusCase: 'leave', priyaDraft: 'later', luisCover: 'decline', marcusCredit: 'share',
  };
  let hops = 0;
  while (s.phase !== 'end' && hops < 40) {
    const openReq = Object.entries(s.requests).find(([, r]) => r.status === 'open');
    const openTask = Object.entries(s.tasks).find(([, t]) => t.status === 'pending');
    if (openReq) s = act(s, { do: 'respond', id: openReq[0], choice: cheapest[openReq[0]] });
    else if (openTask) s = act(s, { do: 'task', id: openTask[0], approach: cheapest[openTask[0]] || 'escalate' });
    else { s = act(s, { do: 'workUntil' }); hops += 1; }
  }
  assert.equal(s.phase, 'end');
  // Bound raised from 10 -> 20 after later passes (#97-#101) added several
  // more coworker/flavor beats between the original stops; still bounded,
  // just a bigger bound, not a regression back to click-to-burn-time.
  assert.ok(hops <= 20, `expected a bounded number of contextual jumps, got ${hops}`);
}

// nextEvent must never point backwards or at the current instant.
{
  let s = newGame();
  for (let i = 0; i < 10 && s.phase !== 'end'; i += 1) {
    const n = nextEvent(s);
    assert.ok(n.t > s.t, 'always strictly in the future');
    s = act(s, { do: 'workUntil' });
  }
}

console.log('day.js tests passed');


// -------------------------------------- busy-day social layer is restored
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: (11 * 60 + 35) - s.t });
  assert.equal(s.flags.cultureEmailAvailable, true, 'Culture Champion nomination email becomes available during the busy day');
  s = act(s, { do: 'nominate', who: 'priya' });
  assert.equal(s.people.priya.champion, true, 'the player can nominate a coworker for the monitoring exemption');

  s = act(s, { do: 'idle', minutes: (12 * 60 + 40) - s.t });
  assert.equal(s.requests.priyaCase.status, 'open', 'Priya gets a consequential NARC case');
  s = act(s, { do: 'respond', id: 'priyaCase', choice: 'report' });
  assert.equal(s.people.priya.status, 'protected', 'Culture Champion routes the harmful automatic action away from termination');

  let sabotage = newGame();
  sabotage = act(sabotage, { do: 'idle', minutes: (12 * 60 + 40) - sabotage.t });
  sabotage = act(sabotage, { do: 'respond', id: 'priyaCase', choice: 'report' });
  assert.equal(sabotage.people.priya.status, 'fired', 'the player can weaponize NARC against a coworker');
  assert.equal(sabotage.flags.coworkerReports, 1);
}

// ------------------------------------------ coworker cases can be helped too
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: (15 * 60 + 5) - s.t });
  assert.equal(s.requests.luisCase.status, 'open');
  s = act(s, { do: 'respond', id: 'luisCase', choice: 'context' });
  assert.equal(s.people.luis.status, 'employed');

  s = act(s, { do: 'idle', minutes: (16 * 60 + 20) - s.t });
  assert.equal(s.requests.marcusCase.status, 'open');
  s = act(s, { do: 'respond', id: 'marcusCase', choice: 'evidence' });
  assert.equal(s.people.marcus.status, 'employed');
  assert.ok(ending(s).lines.some((line) => /Coworker outcomes/.test(line)), 'ending names what happened to coworkers');
}

// -------- reporting on coworkers is a real player benefit, not just flavor (#104)
{
  let s = act(newGame(), { do: 'idle', minutes: (12 * 60 + 40) - newGame().t });
  const before = s.index;
  s = act(s, { do: 'respond', id: 'priyaCase', choice: 'report' });
  assert.equal(s.people.priya.status, 'fired');
  assert.equal(s.flags.coworkerReports, 1);
  assert.equal(s.flags.informantNoted, undefined, 'a single report is not yet a pattern');

  s = act(s, { do: 'idle', minutes: (15 * 60 + 5) - s.t });
  const beforeSecond = s.index;
  s = act(s, { do: 'respond', id: 'luisCase', choice: 'blame' });
  assert.equal(s.people.luis.status, 'fired');
  assert.equal(s.flags.coworkerReports, 2);
  assert.equal(s.flags.informantNoted, true, 'the second report is the distinct, nameable pattern');
  // blame's own visible:true accounts for 3 of this; the other 6 is the
  // one-time pattern bonus, on top of what each report already earns alone.
  assert.equal(s.index, beforeSecond + 9, 'the pattern earns a one-time bump on top of the report itself being visible activity');
  assert.ok(s.log.some((e) => /strong collaboration/.test(e.text)), 'the pattern is named once it is clearly a pattern');
  assert.ok(ending(s).lines.some((l) => /moved Visible Activity up 6 points/.test(l)), 'the ending states the mechanical benefit plainly, not just narratively');
}

// --------------- staying out of a coworker's case reflects earlier treatment (#104)
{
  // Burn Marcus's trust in the morning (cut scope without him), then stay
  // out of his afternoon case entirely -- nobody backs him up.
  let burned = act(newGame(), { do: 'task', id: 'project', approach: 'cut' });
  burned = act(burned, { do: 'idle', minutes: (16 * 60 + 20) - burned.t });
  assert.equal(burned.trust.marcus, -1);
  burned = act(burned, { do: 'respond', id: 'marcusCase', choice: 'leave' });
  assert.equal(burned.people.marcus.status, 'fired', 'no earlier goodwill means nobody speaks up when you stay out of it');

  // Build Marcus's trust instead (consult him, then help with his favor),
  // then stay out the same way -- his own standing covers for you.
  let trusted = act(newGame(), { do: 'task', id: 'project', approach: 'consult' });
  trusted = act(trusted, { do: 'idle', minutes: (10 * 60 + 45) - trusted.t });
  trusted = act(trusted, { do: 'respond', id: 'marcusFavor', choice: 'help' });
  trusted = act(trusted, { do: 'idle', minutes: (16 * 60 + 20) - trusted.t });
  assert.ok(trusted.trust.marcus >= 2);
  trusted = act(trusted, { do: 'respond', id: 'marcusCase', choice: 'leave' });
  assert.equal(trusted.people.marcus.status, 'employed', 'earlier goodwill means staying out does not doom him');

  // Neutral trust still lands on the original, distinct "stay out" outcome.
  // (The project deadline now passes before the 4:20 case, so an untouched
  // project costs trust; a cut scope offset by helping with his favor lands
  // in the middle band.)
  let neutral = act(newGame(), { do: 'task', id: 'project', approach: 'cut' });
  neutral = act(neutral, { do: 'idle', minutes: (10 * 60 + 25) - neutral.t });
  neutral = act(neutral, { do: 'respond', id: 'marcusFavor', choice: 'help' });
  neutral = act(neutral, { do: 'idle', minutes: (16 * 60 + 20) - neutral.t });
  neutral = act(neutral, { do: 'respond', id: 'marcusCase', choice: 'leave' });
  assert.equal(neutral.people.marcus.status, 'warning');

  // Same pattern for Luis, on the trust source actually available before his
  // case (ignoring his tip costs -1).
  let burnedLuis = act(newGame(), { do: 'idle', minutes: (9 * 60 + 20) - newGame().t });
  burnedLuis = act(burnedLuis, { do: 'respond', id: 'luisTip', choice: 'ignore' });
  burnedLuis = act(burnedLuis, { do: 'idle', minutes: (15 * 60 + 5) - burnedLuis.t });
  assert.equal(burnedLuis.trust.luis, -1);
  burnedLuis = act(burnedLuis, { do: 'respond', id: 'luisCase', choice: 'leave' });
  assert.equal(burnedLuis.people.luis.status, 'fired', 'no earlier goodwill means nobody speaks up for Luis either');
}

// ------------------------------------- survey conversation is context-gated
{
  let s = newGame();
  assert.equal(chatOptions(s, 'luis').some(([key]) => key === 'luis-survey'), false, 'survey joke stays hidden before the survey exists');
  s = act(s, { do: 'idle', minutes: (11 * 60 + 50) - s.t });
  assert.equal(s.flags.surveyEmailAvailable, true);
  assert.equal(chatOptions(s, 'luis').some(([key]) => key === 'luis-survey'), true, 'survey conversation unlocks after the survey email');
}

// ----------------------------------------- afternoon work keeps the day active
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: (13 * 60 + 5) - s.t });
  assert.equal(s.tasks.audit.status, 'pending', 'a real afternoon operations task appears');
  s = act(s, { do: 'task', id: 'audit', approach: 'trace' });
  assert.equal(s.tasks.audit.status, 'done');
  assert.ok(s.actual > 0, 'doing the substantive version contributes real work');

  s = act(s, { do: 'idle', minutes: (14 * 60 + 10) - s.t });
  assert.equal(s.tasks.handoff.status, 'pending', 'a second afternoon work task appears');
}

// ------------------------------------- outbound email can change the workday
{
  let s = newGame();
  const oldDeadline = s.tasks.vendor.deadline;
  s = act(s, { do: 'emailAction', id: 'procurementExtension' });
  assert.equal(s.outbound.procurementExtension, true);
  assert.equal(s.tasks.vendor.deadline, oldDeadline + 20);
  assert.ok(s.time.social > 0);
}

// ------------------------------------ optional chats make quiet threads useful
{
  let s = newGame();
  assert.ok(chatOptions(s, 'luis').length > 0, 'Luis has optional conversation starters');
  const topic = chatOptions(s, 'luis')[0][0];
  s = act(s, { do: 'chat', who: 'luis', topic });
  assert.equal(s.chats[topic], true);
  assert.ok(s.log.some((e) => e.kind === 'message' && e.who === 'luis' && e.from === 'me'), 'player chat is represented in the thread');
  assert.equal(s.log.some((e) => e.kind === 'message' && e.who === 'luis' && e.from === 'them'), false, 'coworker reply waits for the typing delay');
  assert.ok(s.pendingReplies[topic], 'reply is queued while the coworker types');
  s = act(s, { do: 'deliverChat', topic });
  assert.ok(s.log.some((e) => e.kind === 'message' && e.who === 'luis' && e.from === 'them'), 'queued coworker reply can be delivered after the delay');
  assert.equal(s.pendingReplies[topic], undefined);
}

// ---------------- Dana's raccoon callback only fires after the story exists
{
  let s = newGame();
  let topic = chatOptions(s, 'dana').find(([key]) => key === 'dana-meridian')?.[0];
  assert.equal(topic, 'dana-meridian');
  s = act(s, { do: 'chat', who: 'dana', topic });
  s = act(s, { do: 'deliverChat', topic });
  assert.ok(s.threads.dana.some((m) => /chaos is less coordinated/i.test(m.text)), 'Dana should not reference the raccoon before Marcus tells that story');

  let later = newGame();
  later = act(later, { do: 'idle', minutes: (10 * 60 + 55) - later.t });
  topic = chatOptions(later, 'dana').find(([key]) => key === 'dana-meridian')?.[0];
  later = act(later, { do: 'chat', who: 'dana', topic });
  later = act(later, { do: 'deliverChat', topic });
  assert.ok(later.threads.dana.some((m) => /raccoon is metaphorical/i.test(m.text)), 'the raccoon line becomes a callback only after the player has seen the story');
}

// -------------------------------------- NARC 2.0 keeps its explanatory email
{
  let s = act(newGame(), { do: 'focus' });
  s = act(s, { do: 'idle', minutes: 270 });
  assert.equal(s.narc.adaptation, true);
  assert.equal(s.flags.narc2EmailAvailable, true, 'NARC 2.0 rollout email is available when Focus Time weighting changes');
}


// ---------------------------- recurring coworker patterns appear before cases
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: (10 * 60 + 15) - s.t });
  assert.equal(s.flags.priyaChatterBeat, true);
  assert.equal(s.flags.luisBathroomBeat, true);
  assert.equal(s.flags.marcusAttendanceBeat, true);
  assert.ok(s.threads.priya.some((m) => /41 message threads|Communication Load/i.test(m.text)), 'Priya is established as chatty before her NARC case');
  assert.ok(s.threads.luis.some((m) => /bathroom/i.test(m.text)), 'Luis bathroom pattern appears before his NARC case');
  assert.ok(s.threads.marcus.some((m) => /again|credibility/i.test(m.text)), 'Marcus lateness pattern appears before his NARC case');

  s = act(s, { do: 'idle', minutes: (12 * 60 + 10) - s.t });
  assert.equal(s.flags.priyaChatterFollowup, true, 'Priya chatty pattern recurs');
  assert.equal(s.flags.luisBathroomFollowup, true, 'Luis bathroom pattern recurs');
  assert.equal(s.flags.marcusAttendanceFollowup, true, 'Marcus attendance pattern recurs');
}

// ---------------------- Trusted Operator now explains the exact cause in-state
{
  let s = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(s.standing.status, 'trusted');
  assert.match(s.standing.note, /first completed task produced high visible activity/i);
  assert.ok(s.log.some((e) => e.kind === 'narc' && /received no correction/i.test(e.text)));
}

// ------------------------------------------- time is tracked by category (#103)
{
  let s = newGame();
  assert.deepEqual(s.time, { work: 0, narc: 0, social: 0, gamed: 0 });

  s = act(s, { do: 'task', id: 'vendor', approach: 'quick' });
  assert.equal(s.time.work, 5, 'a task action counts as work time');

  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'context' });
  assert.equal(s.time.narc, 5, 'answering a NARC assessment counts as NARC overhead, not work');

  s = act(s, { do: 'focus' });
  assert.equal(s.time.gamed, 5, 'Focus Time counts as gaming the metric');

  const before = s.time.work + s.time.narc + s.time.social + s.time.gamed;
  s = act(s, { do: 'idle', minutes: 20 });
  assert.equal(s.time.work + s.time.narc + s.time.social + s.time.gamed, before, 'idle/workUntil time is not attributed to any category');

  const withSocial = act(newGame(), { do: 'idle', minutes: 25 });
  const responded = act(withSocial, { do: 'respond', id: 'luisTip', choice: 'thank' });
  assert.ok(responded.time.social > 0, 'a coworker reply counts as social time');
  assert.equal(responded.time.narc, 0);

  // Surfaced in the ending, plainly, only for categories that actually happened.
  const rushed = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  const e = ending(rushed);
  assert.ok(e.lines.some((l) => /Today's time:.*5 min on real work/.test(l)));
  assert.ok(!e.lines.some((l) => /gaming the metric/.test(l)), 'unused categories are omitted, not shown as 0 min');
}

// --------------------------------- structured end-of-day dashboard data (#106)
{
  let s = newGame();
  let e = ending(s);
  assert.deepEqual(e.timeBreakdown, [], 'no time spent, nothing to show');
  assert.equal(e.contradictions.length, 0, 'nothing contradictory happened yet');
  assert.equal(e.peopleList.length, 3);
  assert.deepEqual(e.standing, s.standing);

  s = act(s, { do: 'task', id: 'vendor', approach: 'quick' });
  e = ending(s);
  assert.deepEqual(e.timeBreakdown, [{ key: 'work', minutes: 5, label: 'real work' }]);

  // A rushed-but-well-rated day is exactly the contradiction #106 asks for.
  let rushed = act(newGame(), { do: 'task', id: 'vendor', approach: 'quick' });
  rushed = act(rushed, { do: 'task', id: 'client', approach: 'canned' });
  rushed = act(rushed, { do: 'task', id: 'project', approach: 'cut' });
  const rushedEnding = ending(rushed);
  if (rushedEnding.index >= 70) {
    assert.ok(rushedEnding.contradictions.some((c) => /will surface as a problem/.test(c)));
  }
  assert.ok(rushedEnding.contradictions.length <= 3, 'contradictions stay to the sharpest few, not every flag');
}

// ------------------- NARC 2.0 reaches players who never used Focus Time (#111)
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 270 }); // past 1:30pm, no Focus Time ever used
  assert.equal(s.narc.adaptation, true, 'the team-wide shift reaches a player who never used Focus Time');
  assert.equal(s.requests.narcResponse.status, 'open');
  assert.ok(!s.flags.playerFocusUses);

  const before = s.index;
  const ignored = act(s, { do: 'respond', id: 'narcResponse', choice: 'ignore' });
  assert.ok(ignored.index < before, 'leaving the gaming flag unanswered now costs Visible Activity');
  assert.ok(ignored.log.some((e) => e.kind === 'narc' && /never used Focus Time/i.test(e.text)), 'a non-user is told the rule keys on the pattern, not the person');

  const explained = act(s, { do: 'respond', id: 'narcResponse', choice: 'explain' });
  assert.ok(explained.index > ignored.index, 'explaining beats ignoring');
}

// ----- pacing: decisions are spread across the day, with a late payoff (#112, #113)
{
  const opensAt = (id) => {
    let s = newGame();
    s = act(s, { do: 'idle', minutes: 8 * 60 });
    return s.requests[id].status;
  };
  // Opening hour no longer stalls waiting for 10:15.
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 50 }); // 9:50
  assert.equal(s.requests.danaMorning.status, 'open', "Dana's first check lands inside the first hour");
  // The last NARC case is the final-hour payoff, not a mid-afternoon one.
  let late = act(newGame(), { do: 'idle', minutes: (16 * 60 + 5) - newGame().t });
  assert.equal(late.requests.marcusCase.status, 'pending', 'Marcus\'s case waits for the last hour');
  late = act(late, { do: 'idle', minutes: 15 }); // 4:20
  assert.equal(late.requests.marcusCase.status, 'open');
  assert.equal(opensAt('luisCase'), 'open');
}
console.log('NARC pacing tests passed');

// ------------- new coworker decisions feed trust and the later cases (#112, #113)
{
  let s = act(newGame(), { do: 'idle', minutes: 40 }); // 9:40
  assert.equal(s.requests.priyaDraft.status, 'open');
  const helped = act(s, { do: 'respond', id: 'priyaDraft', choice: 'help' });
  const skipped = act(s, { do: 'respond', id: 'priyaDraft', choice: 'later' });
  assert.ok(helped.trust.priya > skipped.trust.priya, 'reading her draft earns trust that skipping does not');

  let l = act(newGame(), { do: 'idle', minutes: (13 * 60 + 50) - newGame().t });
  assert.equal(l.requests.luisCover.status, 'open');
  const covered = act(l, { do: 'respond', id: 'luisCover', choice: 'cover' });
  assert.equal(covered.flags.coveredForLuis, true);
  assert.ok(covered.trust.luis >= 2, "covering for Luis is the trust that later backs him up when you stay out of his case");

  let m = act(newGame(), { do: 'idle', minutes: (15 * 60 + 40) - newGame().t });
  assert.equal(m.requests.marcusCredit.status, 'open', 'the afternoon has a decision after the 3:30 project deadline');
}
console.log('coworker decision tests passed');

// ----------------------------- ignoring Marcus's project is not an automatic firing
{
  let s = act(newGame(), { do: 'idle', minutes: (16 * 60 + 20) - newGame().t });
  assert.equal(s.tasks.project.status, 'missed');
  assert.equal(s.trust.marcus, 0, 'a missed project costs NARC standing, not Marcus\'s trust');
  s = act(s, { do: 'respond', id: 'marcusCase', choice: 'leave' });
  assert.equal(s.people.marcus.status, 'warning', 'staying out of his case after an ignored project is a warning, not a firing');
}

// ------------------------------ the ending names the new coworker choices
{
  let s = act(newGame(), { do: 'idle', minutes: (13 * 60 + 50) - newGame().t });
  s = act(s, { do: 'respond', id: 'luisCover', choice: 'cover' });
  s = act(s, { do: 'idle', minutes: 600 });
  const e = ending(s);
  assert.ok(e.lines.some((l) => /fake vendor meeting/.test(l)), 'the ending names covering for Luis');
  assert.ok(e.contradictions.some((c) => /never happened/.test(c)), 'covering for Luis shows up as a contradiction');
}
console.log('softened Marcus and ending-line tests passed');
