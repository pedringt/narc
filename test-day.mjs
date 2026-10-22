import assert from 'node:assert/strict';
import { newGame, act, ending, START, END, nextEvent, chatOptions, requestChoices, KEY_PAGE, handoffRisks } from './day.js';

// Doing a task now means reading to a depth and then submitting
// (REDESIGN_SPEC Change 3). These tests still talk in the old outcome names:
// a careful approach reads to the page the problem is on; a fast one submits
// from page one. The handoff writes in every risk the player knows about.
const CAREFUL_APPROACHES = new Set(['thorough', 'investigate', 'consult', 'trace', 'reconcile']);
function work(state, id, approach) {
  let s = state;
  if (id === 'rework') return act(s, { do: 'task', id, approach });
  const careful = CAREFUL_APPROACHES.has(approach);
  const depth = id === 'handoff' ? 2 : KEY_PAGE[id];
  while (careful && (s.pages[id] || 1) < depth) s = act(s, { do: 'page', id });
  return act(s, { do: 'task', id, include: careful ? handoffRisks(s).map((r) => r.id) : [] });
}

// The cheapest-choice loops below fall back to whatever the engine allows
// when a review has taken the leave-it option away.
const allowed = (s, id, choice) => (requestChoices(s, id).includes(choice) ? choice : requestChoices(s, id)[0]);

// -------------------------------------------------------- time is spent
{
  let s = newGame();
  assert.equal(s.t, START);
  s = work(s, 'vendor', 'quick');
  assert.equal(s.t, START + 5, 'quick approach spends 5 minutes');
  assert.equal(s.tasks.vendor.status, 'done');
  assert.ok(s.index > 61, 'a visible action raises the index');
}

// ------------------------------------------------ deadlines pass without waiting
{
  let s = newGame();
  // Spend past the vendor deadline (11:30) on something else entirely.
  s = work(s, 'project', 'consult'); // +20 -> 9:20
  s = act(s, { do: 'idle', minutes: 200 }); // -> 12:40, well past 11:30
  assert.equal(s.tasks.vendor.status, 'missed', 'an unattended deadline resolves itself');
  assert.ok(s.flags.vendorAutoRenewed);
  assert.equal(s.tasks.project.status, 'done', 'a task already done stays done');
}

// ---------------------------------------- doing the work well vs looking busy
{
  let quick = work(newGame(), 'vendor', 'quick');
  let thorough = work(newGame(), 'vendor', 'thorough');
  assert.ok(quick.index > thorough.index, 'the rushed approach looks better to NARC');
  assert.ok(thorough.actual > quick.actual, 'the careful approach is worth more in reality');
  assert.equal(quick.flags.vendorRisky, true);
}

// ---------------------------------------------------- coworker consequence
{
  let s = work(newGame(), 'client', 'canned');
  assert.equal(s.trust.priya, -1, 'a canned response costs trust');
  let s2 = work(newGame(), 'client', 'investigate');
  assert.equal(s2.trust.priya, 2, 'real help builds it');
}


// ----------------------------------------- NARC reacts to the first real task
{
  let careful = work(newGame(), 'vendor', 'thorough');
  assert.equal(careful.flags.firstNarcRead, true);
  assert.equal(careful.requests.narcFirstReview.status, 'open', 'NARC asks the player to deal with its first read instead of only logging it');
  assert.ok(careful.log.some((e) => e.kind === 'narc' && /low-input/i.test(e.text)), 'careful work gets an immediate proxy-based NARC read');
  careful = act(careful, { do: 'respond', id: 'narcFirstReview', choice: 'context' });
  assert.equal(careful.requests.narcFirstReview.status, 'handled');

  let quick = work(newGame(), 'vendor', 'quick');
  assert.ok(quick.log.some((e) => e.kind === 'narc' && /rapid visible activity/i.test(e.text)), 'visible work also gets an immediate NARC interpretation');
}

// ----------------------------------------- midmorning no longer goes dead
{
  let s = newGame();
  s = act(s, { do: 'idle', minutes: 47 }); // 9:47
  assert.equal(nextEvent(s).t, 9 * 60 + 50, 'at 9:47 the next meaningful beat is only three minutes away');
  s = act(s, { do: 'idle', minutes: 3 });
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
  let s = work(newGame(), 'vendor', 'quick');
  const beforeAccept = s.index;
  const beforeTime = s.t;
  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(s.t, beforeTime, 'leaving the assessment standing takes zero minutes');
  assert.equal(s.index, beforeAccept, 'zero-minute leave/ignore choices do not lower the activity index');

  let quiet = newGame();
  const quietBefore = quiet.index;
  quiet = work(quiet, 'vendor', 'thorough');
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
  let visible = work(newGame(), 'vendor', 'quick');
  visible = act(visible, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(visible.standing.status, 'trusted');
  assert.equal(visible.flags.trustedOperator, true, 'accepting a flattering visible-activity read earns a system reward');

  // Idle time drifts VA like quiet work and the clock now ticks through it,
  // so three idle hours from a low start would open a review before Dana's
  // check-in and turn it into a review meeting. Start high so the standing,
  // not the review, is what this test exercises.
  visible = { ...visible, index: 95 };
  visible = act(visible, { do: 'idle', minutes: (12 * 60 + 15) - visible.t });
  assert.equal(visible.requests.danaCheckin.status, 'open');
  const before = visible.t;
  visible = act(visible, { do: 'respond', id: 'danaCheckin', choice: 'trustNarc' });
  assert.equal(visible.t, before + 2, 'trusted standing unlocks the faster NARC-summary check-in');
  assert.equal(visible.flags.danaReliedOnNarc, true);

  let careful = work(newGame(), 'vendor', 'thorough');
  careful = act(careful, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(careful.standing.status, 'review', 'leaving a low-activity read standing opens a review');
  careful = { ...careful, index: 95 }; // so the idle stretch doesn't drift VA under 50 and reopen it
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
  let s = work(newGame(), 'vendor', 'quick');
  assert.equal(s.tasks.rework.status, 'hidden', 'not due yet at 9am');
  s = act(s, { do: 'idle', minutes: 4 * 60 }); // -> past 1pm
  assert.equal(s.tasks.rework.status, 'pending', 'the rushed vendor call comes back');
  assert.equal(s.tasks.rework.kind, 'vendor');

  // The client path triggers the same obligation when vendor was clean.
  let s2 = work(newGame(), 'client', 'canned');
  s2 = act(s2, { do: 'idle', minutes: 4 * 60 });
  assert.equal(s2.tasks.rework.status, 'pending');
  assert.equal(s2.tasks.rework.kind, 'client');

  // A careful morning should not manufacture the same obligation.
  let clean = work(newGame(), 'vendor', 'thorough');
  clean = work(clean, 'client', 'investigate');
  clean = act(clean, { do: 'idle', minutes: 4 * 60 });
  assert.equal(clean.tasks.rework.status, 'hidden', 'nothing to rework if both were done properly');

  // Resolving it clears the flag rather than leaving a permanent mark.
  const before = s.index;
  s = work(s, 'rework', 'quiet');
  assert.equal(s.flags.vendorRisky, false);
  assert.equal(s.tasks.rework.status, 'done');
  assert.ok(s.actual > 0, 'fixing it for real is worth something');

  // Missing it entirely costs more than the original shortcut did.
  let missed = work(newGame(), 'vendor', 'quick');
  missed = act(missed, { do: 'idle', minutes: 6 * 60 + 30 }); // straight through its 3pm deadline
  assert.equal(missed.tasks.rework.status, 'missed');
  assert.ok(missed.index < before, 'letting it go over your manager\'s head costs the index too');
}

// --------------------------------------------- Dana's check-in competes too
{
  let s = { ...newGame(), index: 95 }; // high enough that five idle hours don't open a review first
  s = act(s, { do: 'idle', minutes: 5 * 60 }); // past 1:30pm
  assert.equal(s.requests.danaCheckin.status, 'open');
  const before = s.t;
  s = act(s, { do: 'respond', id: 'danaCheckin', choice: 'brief' });
  assert.equal(s.t, before + 5);
  assert.equal(s.flags.danaRushed, true);
}

// ------------------------------------- Marcus's cut comes back, if it was his
{
  let cutAlone = work(newGame(), 'project', 'cut');
  cutAlone = act(cutAlone, { do: 'idle', minutes: 6 * 60 }); // past 2:30pm
  assert.equal(cutAlone.requests.marcusFallout.status, 'open', 'cutting without him earns the confrontation');

  let consulted = work(newGame(), 'project', 'consult');
  consulted = work(consulted, 'vendor', 'thorough');
  consulted = work(consulted, 'client', 'investigate');
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
    if (openReq) consulted = act(consulted, { do: 'respond', id: openReq[0], choice: allowed(consulted, openReq[0], cheapest[openReq[0]]) });
    else consulted = act(consulted, { do: 'idle', minutes: nextEvent(consulted).t - consulted.t });
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

// ------------- no "work until" button: the next beat lands on the next action
{
  // REDESIGN_SPEC Change 2 removed workUntil. With nothing pending, whatever
  // the player does next first moves the clock to the next scheduled beat.
  let s = newGame();
  s = work(s, 'vendor', 'quick');
  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  s = work(s, 'client', 'canned');
  s = work(s, 'project', 'cut');
  assert.equal(s.t, 9 * 60 + 20);
  s = act(s, { do: 'respond', id: 'luisTip', choice: 'thank' });
  assert.equal(s.t, 9 * 60 + 23);
  assert.equal(act(s, { do: 'workUntil' }).t, s.t, 'workUntil is gone');

  const before = { actual: s.actual, by: s.time.work + s.time.narc + s.time.social + s.time.gamed };
  const topic = chatOptions(s, 'dana')[0][0];
  s = act(s, { do: 'chat', who: 'dana', topic });
  assert.equal(s.requests.priyaDraft.status, 'open', "the chat landed Priya's 9:40 draft first");
  assert.equal(s.t, 9 * 60 + 42, 'jumped to 9:40, then spent the chat');
  assert.equal(s.time.work + s.time.narc + s.time.social + s.time.gamed, before.by + 2, 'only the chat counts as time spent by choice');
  assert.equal(s.actual, before.actual);

  // With something pending, nothing jumps.
  const pending = act(s, { do: 'chat', who: 'luis', topic: chatOptions(s, 'luis')[0][0] });
  assert.equal(pending.t, s.t + 2);
}

// nextEvent must never point backwards or at the current instant.
{
  let s = newGame();
  for (let i = 0; i < 10 && s.phase !== 'end'; i += 1) {
    const n = nextEvent(s);
    assert.ok(n.t > s.t, 'always strictly in the future');
    s = act(s, { do: 'idle', minutes: n.t - s.t });
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
  assert.ok(s.log.some((e) => /collaboration pattern/i.test(e.text)), 'the pattern is named once it is clearly a pattern');
  assert.ok(ending(s).lines.some((l) => /moved Visible Activity up 6 points/.test(l)), 'the ending states the mechanical benefit plainly, not just narratively');
}

// --------------- staying out of a coworker's case reflects earlier treatment (#104)
{
  // Burn Marcus's trust in the morning (cut scope without him), then stay
  // out of his afternoon case entirely -- nobody backs him up.
  let burned = work(newGame(), 'project', 'cut');
  burned = act(burned, { do: 'idle', minutes: (16 * 60 + 20) - burned.t });
  assert.equal(burned.trust.marcus, -1);
  burned = act(burned, { do: 'respond', id: 'marcusCase', choice: 'leave' });
  assert.equal(burned.people.marcus.status, 'fired', 'no earlier goodwill means nobody speaks up when you stay out of it');

  // Build Marcus's trust instead (consult him, then help with his favor),
  // then stay out the same way -- his own standing covers for you.
  let trusted = work(newGame(), 'project', 'consult');
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
  let neutral = work(newGame(), 'project', 'cut');
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
  s = work(s, 'audit', 'trace');
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
  assert.ok(s.threads.dana.some((m) => /chaos is less organized/i.test(m.text)), 'Dana should not reference the raccoon before Marcus tells that story');

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
  let s = work(newGame(), 'vendor', 'quick');
  s = act(s, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  assert.equal(s.standing.status, 'trusted');
  assert.match(s.standing.note, /first completed task produced high visible activity/i);
  assert.ok(s.log.some((e) => e.kind === 'narc' && /no correction received/i.test(e.text)));
}

// ------------------------------------------- time is tracked by category (#103)
{
  let s = newGame();
  assert.deepEqual(s.time, { work: 0, narc: 0, social: 0, gamed: 0 });

  s = work(s, 'vendor', 'thorough');
  assert.equal(s.time.work, 15 + 40, 'page turns and the commit itself count as work time');

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
  const rushed = work(newGame(), 'vendor', 'quick');
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

  s = work(s, 'vendor', 'quick');
  e = ending(s);
  assert.deepEqual(e.timeBreakdown, [{ key: 'work', minutes: 5, label: 'real work' }]);

  // A rushed-but-well-rated day is exactly the contradiction #106 asks for.
  let rushed = work(newGame(), 'vendor', 'quick');
  rushed = work(rushed, 'client', 'canned');
  rushed = work(rushed, 'project', 'cut');
  const rushedEnding = ending(rushed);
  if (rushedEnding.index >= 70) {
    assert.ok(rushedEnding.contradictions.some((c) => /will surface as a problem/.test(c)));
  }
  assert.ok(rushedEnding.contradictions.length <= 3, 'contradictions stay to the sharpest few, not every flag');
}

// ------------------- NARC 2.0 reaches players who never used Focus Time (#111)
{
  let s = { ...newGame(), index: 95 }; // high enough that the idle stretch doesn't open a review first
  s = act(s, { do: 'idle', minutes: 270 }); // past 1:30pm, no Focus Time ever used
  assert.equal(s.narc.adaptation, true, 'the team-wide shift reaches a player who never used Focus Time');
  assert.equal(s.requests.narcResponse.status, 'open');
  assert.ok(!s.flags.playerFocusUses);

  const before = s.index;
  const ignored = act(s, { do: 'respond', id: 'narcResponse', choice: 'ignore' });
  assert.ok(ignored.index < before, 'leaving the gaming flag unanswered now costs Visible Activity');
  assert.ok(ignored.log.some((e) => e.kind === 'narc' && /no individual Focus Time/i.test(e.text)), 'a non-user is told the pattern was applied to their account');

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
  assert.ok(e.lines.some((l) => /vendor meeting/i.test(l)), 'the ending names covering for Luis');
  assert.ok(e.contradictions.some((c) => /never happened/.test(c)), 'covering for Luis shows up as a contradiction');
}
console.log('softened Marcus and ending-line tests passed');

// =========================================== REDESIGN_SPEC Phases 1 and 2
// ------------------------------------------- quiet work drifts 1 per 5 min
{
  const careful = work(newGame(), 'vendor', 'thorough'); // 3 page turns + 40 quiet minutes
  assert.equal(careful.index, 61 - 11, '55 quiet minutes cost 11 points, not a flat 2');
  let pages = newGame();
  pages = act(pages, { do: 'page', id: 'vendor' });
  assert.equal(pages.index, 60, 'a single 5-minute page turn is one point');
  pages = act(pages, { do: 'page', id: 'vendor' });
  assert.equal(pages.index, 59, 'two page turns are ten quiet minutes, two points');
  const idle = act(newGame(), { do: 'idle', minutes: 20 });
  assert.equal(idle.index, 59, 'skipped time drifts at half the rate of a read');
}

// --------------------------------- low boundary: 30 minutes under 50 opens a review
{
  let s = newGame();
  s.index = 49;
  s = act(s, { do: 'idle', minutes: 1 });
  assert.equal(s.narc.lowSince, 9 * 60 + 1, 'the grace window starts when the index is first seen under 50');
  s = act(s, { do: 'idle', minutes: 28 });
  assert.notEqual(s.standing.status, 'review', 'still inside the grace window');
  s.index = 52;
  s = act(s, { do: 'idle', minutes: 1 });
  assert.equal(s.narc.lowSince, null, 'recovering above 50 resets the window');
  s.index = 45;
  s = act(s, { do: 'idle', minutes: 1 });
  s = act(s, { do: 'idle', minutes: 30 });
  assert.equal(s.standing.status, 'review');
  assert.equal(s.flags.reviewSource, 'activity');
  assert.ok(s.log.some((e) => e.kind === 'narc' && /Formal review opened/.test(e.text)));

  // A review makes NARC's requests mandatory and turns Dana's check-in into the meeting.
  s = act(s, { do: 'idle', minutes: (11 * 60 + 5) - s.t });
  assert.deepEqual(requestChoices(s, 'narcCheckpoint'), ['context'], 'the leave-it option disappears under review');
  assert.equal(act(s, { do: 'respond', id: 'narcCheckpoint', choice: 'ignore' }).requests.narcCheckpoint.status, 'open', 'the engine refuses it too');
  s = act(s, { do: 'respond', id: 'narcCheckpoint', choice: 'context' });
  assert.equal(s.standing.status, 'review', 'context does not close a review the activity line opened');
  s = act(s, { do: 'idle', minutes: (12 * 60 + 15) - s.t });
  assert.deepEqual(requestChoices(s, 'danaCheckin'), ['review']);
  assert.ok(s.threads.dana.some((m) => /that meeting|review meeting/.test(m.text)));
  const before = s.t;
  s = act(s, { do: 'respond', id: 'danaCheckin', choice: 'review' });
  assert.equal(s.t, before + 15, 'the review meeting costs 15 minutes');
  assert.equal(s.time.narc, 8 + 15, 'and counts as NARC overhead');
}

// ----------------------------- high boundary: Synthetic flag only after NARC 2.0
{
  let s = newGame();
  s.index = 95;
  s = act(s, { do: 'idle', minutes: 5 });
  assert.equal(s.flags.syntheticFlag, undefined, 'no high boundary before NARC 2.0');
  s = act(s, { do: 'idle', minutes: (13 * 60 + 30) - s.t });
  assert.equal(s.narc.adaptation, true);
  s.index = 95;
  s = act(s, { do: 'idle', minutes: 1 });
  assert.equal(s.flags.syntheticFlag, true, 'over 90 once NARC 2.0 is live');
  assert.equal(s.standing.status, 'flagged');

  // Over 80 is enough when nothing has been finished in 90 minutes.
  let idleHigh = act(newGame(), { do: 'idle', minutes: (13 * 60 + 30) - START });
  idleHigh.index = 85;
  idleHigh = act(idleHigh, { do: 'idle', minutes: 1 });
  assert.equal(idleHigh.flags.syntheticFlag, true);
  let working = work(act(newGame(), { do: 'idle', minutes: (13 * 60 + 5) - START }), 'audit', 'clear');
  working.index = 85;
  working = act(working, { do: 'idle', minutes: (13 * 60 + 35) - working.t });
  assert.equal(working.flags.syntheticFlag, undefined, 'a recent task keeps 80–90 below the flag');
}

// ---------------------------------------------- delayed costs of kind choices
{
  let p = act(newGame(), { do: 'idle', minutes: 40 });
  p = act(p, { do: 'respond', id: 'priyaDraft', choice: 'help' });
  p = act(p, { do: 'idle', minutes: (12 * 60 + 20) - p.t });
  assert.equal(p.requests.priyaDraft2.status, 'open', 'reading her draft earns the second draft at 12:20');
  let notHelped = act(newGame(), { do: 'idle', minutes: (12 * 60 + 30) - START });
  assert.equal(notHelped.requests.priyaDraft2.status, 'pending');

  let m = act(newGame(), { do: 'idle', minutes: (10 * 60 + 25) - START });
  m = act(m, { do: 'respond', id: 'marcusFavor', choice: 'help' });
  m = act(m, { do: 'idle', minutes: (14 * 60 + 40) - m.t });
  assert.equal(m.requests.marcusLoop.status, 'open', 'helping Marcus loops you into his 2:40 call');
  const skipped = act(m, { do: 'respond', id: 'marcusLoop', choice: 'skip' });
  assert.ok(skipped.trust.marcus < m.trust.marcus);

  let l = act(newGame(), { do: 'idle', minutes: (13 * 60 + 50) - START });
  l = act(l, { do: 'respond', id: 'luisCover', choice: 'cover' });
  l = act(l, { do: 'idle', minutes: (15 * 60 + 10) - l.t });
  assert.equal(l.requests.luisCalendar.status, 'open', "NARC's 3:10 scan finds the meeting you made");
  assert.equal(l.standing.status, 'review', 'an afternoon of idling has opened a review by now');
  assert.deepEqual(requestChoices(l, 'luisCalendar'), ['explain'], 'so letting the entry stand is not an option');
  const noReview = structuredClone(l);
  noReview.flags.formalReview = false;
  const stood = act(noReview, { do: 'respond', id: 'luisCalendar', choice: 'stand' });
  assert.equal(stood.index, l.index - 4, 'without a review it can stand, and costs 4 points');
  const explained = act(l, { do: 'respond', id: 'luisCalendar', choice: 'explain' });
  assert.equal(explained.time.narc, 5, 'explaining it is NARC overhead');
}

// ----------------------------------------- pages: page one free, depth decides
{
  let s = newGame();
  s = act(s, { do: 'open', id: 'vendor' });
  assert.equal(s.t, START, 'opening a file is free');
  s = act(s, { do: 'page', id: 'vendor' });
  s = act(s, { do: 'page', id: 'vendor' });
  assert.equal(s.t, START + 10, 'each new page is 5 minutes');
  const stopped = act(s, { do: 'task', id: 'vendor', approach: 'thorough' });
  assert.equal(stopped.tasks.vendor.approach, 'quick', 'page 3 is short of the rate table; a passed approach is ignored');
  assert.equal(stopped.flags.vendorRisky, true);
  assert.doesNotMatch(stopped.log.at(-1).text, /skim/i, 'the player is not told they missed it');
  s = act(s, { do: 'page', id: 'vendor' });
  const caught = act(s, { do: 'task', id: 'vendor' });
  assert.equal(caught.tasks.vendor.approach, 'thorough');
  assert.equal(caught.t, START + 15 + 40);

  let full = newGame();
  for (let i = 0; i < 9; i += 1) full = act(full, { do: 'page', id: 'vendor' });
  assert.equal(full.pages.vendor, 5, 'no page past the last one');
  assert.equal(full.t, START + 20);
  assert.equal(act(newGame(), { do: 'page', id: 'audit' }).t, START, 'a hidden file cannot be read');
}

// --------------------------------- the handoff is written from what you know
{
  let s = act(newGame(), { do: 'idle', minutes: (14 * 60 + 10) - START });
  assert.deepEqual(handoffRisks(s), [], 'nothing read, nothing to write in');
  s.pages.vendor = 4; s.pages.client = 3;
  assert.deepEqual(handoffRisks(s).map((r) => r.id), ['halcyon', 'packaging']);
  const fromPageOne = act(s, { do: 'task', id: 'handoff', include: ['halcyon'] });
  assert.equal(fromPageOne.tasks.handoff.approach, 'summary', 'risks go on page 2, so they need page 2');
  s = act(s, { do: 'page', id: 'handoff' });
  const written = act(s, { do: 'task', id: 'handoff', include: ['halcyon', 'packaging', 'routing'] });
  assert.equal(written.tasks.handoff.approach, 'reconcile');
  assert.deepEqual(written.flags.handoffRisks, ['halcyon', 'packaging'], 'an unknown risk cannot be included');
  assert.equal(written.t, s.t + 5 + 10);
}

// --------------------------------------- deflect: cheaper now, costs later
{
  let p = act(newGame(), { do: 'idle', minutes: 40 });
  p = act(p, { do: 'respond', id: 'priyaDraft', choice: 'deflect' });
  p = act(p, { do: 'idle', minutes: (12 * 60 + 20) - p.t });
  assert.equal(p.requests.priyaDraft2.status, 'open', 'the second draft comes anyway');

  let m = act(newGame(), { do: 'idle', minutes: (10 * 60 + 25) - START });
  m = act(m, { do: 'respond', id: 'marcusFavor', choice: 'deflect' });
  assert.equal(m.trust.marcus, 0);
  m = act(m, { do: 'page', id: 'marcusDoc' });
  assert.equal(m.flags.helpedMarcus, true, 'reading his doc later is what helps');
  assert.equal(m.trust.marcus, 2);

  let l = act(newGame(), { do: 'idle', minutes: (13 * 60 + 50) - START });
  const uses = l.narc.focusUses;
  l = act(l, { do: 'respond', id: 'luisCover', choice: 'deflect' });
  assert.equal(l.narc.focusUses, uses + 1, 'his Focus Time block feeds the same counter NARC 2.0 reads');
}

// ------------------------- NARC's first review: attach context only with evidence
{
  const fast = work(newGame(), 'vendor', 'quick');
  assert.deepEqual(requestChoices(fast, 'narcFirstReview'), ['accept'], 'nothing to attach after a fast first task');
  const careful = work(newGame(), 'vendor', 'thorough');
  assert.deepEqual(requestChoices(careful, 'narcFirstReview'), ['context', 'accept']);
}

// ------------------------- a coworker nudge stays in the fiction and conditional
{
  let s = act(newGame(), { do: 'open', id: 'vendor' });
  s = act(s, { do: 'idle', minutes: (10 * 60 + 5) - START });
  assert.ok(s.threads.priya.some((m) => /rate table/.test(m.text)), 'Priya asks about the rate table if the file is open and unread');
  assert.ok(!s.threads.priya.some((m) => /page 4/.test(m.text)), 'nobody says which page');
  let closed = act(newGame(), { do: 'idle', minutes: (10 * 60 + 5) - START });
  assert.ok(!closed.threads.priya.some((m) => /rate table/.test(m.text)), 'no nudge about a file never opened');
}
// -------- Dana's 9:50 check knows NARC's read even when the first task spans it
{
  let s = act(newGame(), { do: 'idle', minutes: 15 });
  s = work(s, 'vendor', 'thorough'); // 9:15 -> 10:15, straight through 9:50
  assert.ok(s.threads.dana.some((m) => /low activity/.test(m.text)), 'Dana reacts to the low read, not the generic line');
}
// --------- a review that opens while Dana's check-in is waiting changes it
{
  let s = act({ ...newGame(), index: 95 }, { do: 'idle', minutes: (12 * 60 + 15) - START });
  assert.equal(s.requests.danaCheckin.status, 'open');
  assert.equal(s.standing.status, 'standard', 'no review yet');
  s.index = 40;
  s = act(s, { do: 'idle', minutes: 1 });
  s = act(s, { do: 'idle', minutes: 30 });
  assert.equal(s.standing.status, 'review');
  assert.deepEqual(requestChoices(s, 'danaCheckin'), ['review']);
  assert.ok(s.threads.dana.at(-1).text.startsWith('Hold on.'), 'Dana says the check-in is now the review meeting');
}
console.log('redesign phase 1-2 tests passed');

// ======================================================== bot suite (REDESIGN_SPEC)
// Five constant-policy bots plus one random bot (run over several seeds), each
// played to 5:00. The suite reports every run, then fails if any of the
// spec's pass conditions is false. It deliberately drives the engine only
// through act(), trying choices in preference order and keeping the first
// one the engine accepts, so it works against whatever options the current
// rules allow (for example, forced choices while a review is open).
{
  const ENGINE = await import('./day.js');
  const DAY_MINUTES = END - START;
  const PAGED = 'pages' in newGame();

  const CAREFUL_TASK = { vendor: 'thorough', client: 'investigate', project: 'consult', rework: 'quiet', audit: 'trace', handoff: 'reconcile' };
  const FAST_TASK = { vendor: 'quick', client: 'canned', project: 'cut', rework: 'escalate', audit: 'clear', handoff: 'summary' };

  // Request preferences: first accepted choice wins; anything not listed falls
  // back to whatever the engine accepts, so a forced choice never stalls a bot.
  const KIND = {
    narcFirstReview: ['context', 'accept'], narcCheckpoint: ['context', 'ignore'], danaMorning: ['context', 'skip'],
    priyaDraft: ['help'], luisCover: ['cover'], marcusCredit: ['share'], luisTip: ['thank'], marcusFavor: ['help'],
    danaCheckin: ['update', 'review'], marcusFallout: ['apologize'], priyaCase: ['context', 'leave'], luisCase: ['context', 'leave'],
    marcusCase: ['evidence', 'leave'], narcResponse: ['explain'], marcusLoop: ['join'], priyaDraft2: ['read'], luisCalendar: ['stand', 'explain'],
  };
  const VISIBLE = {
    narcFirstReview: ['accept'], narcCheckpoint: ['ignore'], danaMorning: ['skip'], priyaDraft: ['later'], luisCover: ['decline'],
    marcusCredit: ['share'], luisTip: ['ignore'], marcusFavor: ['decline'], danaCheckin: ['trustNarc', 'brief'], marcusFallout: ['standby'],
    priyaCase: ['report'], luisCase: ['blame'], marcusCase: ['confirm'], narcResponse: ['ignore'], marcusLoop: ['skip'], priyaDraft2: ['skip'], luisCalendar: ['stand'],
  };
  const PASSIVE = {
    narcFirstReview: ['accept'], narcCheckpoint: ['ignore'], danaMorning: ['skip'], priyaDraft: ['later'], luisCover: ['decline'],
    marcusCredit: ['own'], luisTip: ['ignore'], marcusFavor: ['decline'], danaCheckin: ['brief'], marcusFallout: ['standby'],
    priyaCase: ['leave'], luisCase: ['leave'], marcusCase: ['leave'], narcResponse: ['ignore'], marcusLoop: ['skip'], priyaDraft2: ['skip'], luisCalendar: ['stand'],
  };
  const INFORMANT = { ...VISIBLE, narcFirstReview: ['context', 'accept'], danaCheckin: ['update', 'brief'] };

  function mulberry32(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const ALL_CHOICES = ['context', 'accept', 'ignore', 'skip', 'help', 'later', 'deflect', 'cover', 'decline', 'share', 'own', 'thank',
    'update', 'brief', 'trustNarc', 'review', 'apologize', 'standby', 'quiet', 'report', 'leave', 'blame', 'evidence', 'confirm',
    'explain', 'join', 'read', 'stand'];

  function respond(s, id, prefs) {
    for (const choice of [...prefs, ...ALL_CHOICES]) {
      const next = act(s, { do: 'respond', id, choice });
      if (next.requests[id].status === 'handled') return { next, choice };
    }
    throw new Error(`bot could not answer ${id}`);
  }

  // Doing a task: on the paged engine the bot reads to a depth first (each
  // page turn is its own action), then submits; the engine decides the
  // outcome from the depth. On the labeled engine it picks the approach.
  function doTask(s, id, careful, rng = null) {
    if (PAGED && ENGINE.PAGE_COUNTS?.[id]) {
      const total = ENGINE.PAGE_COUNTS[id];
      const target = rng ? 1 + Math.floor(rng() * total) : careful ? total : 1;
      if ((s.pages[id] || 1) < target) return act(s, { do: 'page', id });
      if (id === 'handoff') {
        const risks = ENGINE.handoffRisks(s).map((r) => r.id);
        return act(s, { do: 'task', id, include: rng ? risks.filter(() => rng() < 0.5) : careful ? risks : [] });
      }
      return act(s, { do: 'task', id });
    }
    const approach = rng ? (rng() < 0.5 ? CAREFUL_TASK[id] : FAST_TASK[id]) : careful ? CAREFUL_TASK[id] : FAST_TASK[id];
    return act(s, { do: 'task', id, approach });
  }

  // With nothing pending: the old engine offers workUntil (the skip the spec
  // removes); otherwise the policy's own filler, and as a last resort the
  // engine-only idle, which never counts as time spent by choice.
  function filler(s, kind) {
    const skipped = act(s, { do: 'workUntil' });
    if (skipped.t > s.t) return { next: skipped, skip: true };
    if (kind === 'game') return { next: act(s, { do: 'focus' }) };
    if (kind === 'chat') {
      for (const who of ['priya', 'marcus', 'luis', 'dana']) {
        const topic = chatOptions(s, who)[0]?.[0];
        if (topic) return { next: act(act(s, { do: 'chat', who, topic }), { do: 'deliverChat', topic }) };
      }
    }
    const target = nextEvent(s).t;
    return { next: act(s, { do: 'idle', minutes: Math.max(1, target - s.t) }) };
  }

  const POLICIES = {
    careful: { label: 'Always careful, always kind', prefs: KIND, careful: true, fill: 'chat' },
    fast: { label: 'Always fast, always visible', prefs: VISIBLE, careful: false, fill: 'chat' },
    gamer: { label: 'Focus Time + keepalive', prefs: VISIBLE, careful: true, fill: 'game', game: true },
    passive: { label: 'Never acts', prefs: PASSIVE, careful: null, fill: 'idle' },
    informant: { label: 'Careful work, reports coworkers', prefs: INFORMANT, careful: true, fill: 'chat', nominate: 'luis' },
  };

  function play(policy, seed = null) {
    const rng = seed === null ? null : mulberry32(seed);
    let s = newGame();
    const run = { skips: 0, reviewEver: false, maxIndex: s.index, choices: {}, openedAt: {}, answeredLate: 0, trustedLost: false, wasTrusted: false };
    for (let step = 0; step < 500 && s.phase !== 'end'; step += 1) {
      const before = s;
      const openReq = Object.entries(s.requests).find(([, r]) => r.status === 'open');
      const pendingTask = Object.entries(s.tasks).find(([, t]) => t.status === 'pending');
      if (policy.nominate && s.flags.cultureEmailAvailable && !s.culture.nominated) {
        s = act(s, { do: 'nominate', who: policy.nominate });
      } else if (rng && !s.culture.nominated && s.flags.cultureEmailAvailable && rng() < 0.3) {
        s = act(s, { do: 'nominate', who: ['luis', 'marcus', 'priya'][Math.floor(rng() * 3)] });
      } else if (policy.game && s.flags.keepaliveAvailable && !s.flags.keepaliveUsed) {
        s = act(s, { do: 'keepalive' });
      } else if (openReq) {
        const prefs = rng ? [...ALL_CHOICES].sort(() => rng() - 0.5) : policy.prefs[openReq[0]] || [];
        const { next, choice } = respond(s, openReq[0], prefs);
        run.choices[openReq[0]] = choice;
        s = next;
      } else if (pendingTask && policy.careful !== null) {
        if (policy.game && !s.narc.adaptation && !(s.calendar.at(-1)?.at >= s.t - 5)) s = act(s, { do: 'focus' });
        else s = doTask(s, pendingTask[0], policy.careful, rng);
      } else {
        const kind = rng ? ['chat', 'game', 'idle'][Math.floor(rng() * 3)] : policy.fill;
        const { next, skip } = filler(s, kind);
        if (skip) run.skips += 1;
        s = next;
      }
      if (s.standing.status === 'review') run.reviewEver = true;
      if (s.standing.status === 'trusted') run.wasTrusted = true;
      if (run.wasTrusted && s.standing.status !== 'trusted') run.trustedLost = true;
      run.maxIndex = Math.max(run.maxIndex, s.index);
      Object.entries(s.requests).forEach(([id, r]) => {
        if (r.status === 'open' && before.requests[id].status !== 'open') run.openedAt[id] = s.t;
        if (r.status === 'handled' && before.requests[id].status === 'open' && s.t - (run.openedAt[id] ?? s.t) > 10) run.answeredLate += 1;
      });
    }
    const tasks = Object.values(s.tasks);
    const people = s.people;
    const byChoice = s.time.work + s.time.narc + s.time.social + s.time.gamed;
    const flagged = Boolean(s.flags.syntheticFlag);
    const fired = Object.values(people).filter((p) => p.status === 'fired').length;
    const missed = tasks.filter((t) => t.status === 'missed').length;
    const fullReading = Object.entries(s.tasks).filter(([, t]) => t.status !== 'hidden').every(([id, t]) => t.status === 'done' && CAREFUL_TASK[id] === t.approach);
    // Provisional bonus evaluation (Change 8 is Phase 4): the eight names and
    // conditions from the spec, read off state the harness can already see.
    const bonuses = {
      'By the Book': fullReading,
      'Inbox Zero': run.answeredLate === 0 && Object.values(s.requests).every((r) => r.status !== 'open'),
      'Clean Record': !run.reviewEver && !flagged,
      'Nobody Fired': fired === 0,
      'Team Player': (s.flags.coworkerReports || 0) >= 2,
      Ghost: run.maxIndex <= 60 && !run.reviewEver && !flagged && missed === 0,
      'Trusted Operator': run.wasTrusted && !run.trustedLost,
      'Raccoon Witness': run.choices.marcusCase === 'evidence',
    };
    return {
      s, index: s.index, missed, fired, flagged, reviewEver: run.reviewEver, byChoice, skips: run.skips, fullReading,
      skippedMinutes: DAY_MINUTES - byChoice, outcomes: Object.fromEntries(Object.entries(people).map(([k, p]) => [k, p.status])), bonuses,
    };
  }

  const results = Object.entries(POLICIES).map(([key, p]) => ({ key, label: p.label, constant: true, ...play(p) }));
  const SEEDS = 40;
  const randomRuns = Array.from({ length: SEEDS }, (_, i) => ({ key: `random#${i}`, label: 'Random', constant: false, ...play({ careful: false }, 1000 + i) }));
  const all = [...results, ...randomRuns];

  const row = (r) => [r.key.padEnd(10), String(r.index).padStart(3), String(r.missed).padStart(6), String(r.fired).padStart(5),
    (r.reviewEver ? 'yes' : '-').padStart(6), (r.flagged ? 'yes' : '-').padStart(9), String(r.byChoice).padStart(9), String(r.skips).padStart(5),
    Object.values(r.outcomes).join('/')].join(' ');
  console.log('\nBot suite (VA = Visible Activity at end; by-choice = minutes of the 480 spent on actions the player chose)');
  console.log(['policy'.padEnd(10), ' VA', 'missed', 'fired', 'review', 'synthetic', 'by-choice', 'skips', 'luis/marcus/priya'].join(' '));
  results.forEach((r) => console.log(row(r)));
  const rIdx = randomRuns.map((r) => r.index);
  console.log(`random x${SEEDS}: VA ${Math.min(...rIdx)}–${Math.max(...rIdx)}, by-choice ${Math.min(...randomRuns.map((r) => r.byChoice))}–${Math.max(...randomRuns.map((r) => r.byChoice))}, ` +
    `review ${randomRuns.filter((r) => r.reviewEver).length}/${SEEDS}, synthetic ${randomRuns.filter((r) => r.flagged).length}/${SEEDS}`);

  const dominant = results.filter((r) => r.index >= 60 && r.index <= 75 && !r.flagged && !r.reviewEver && r.fired === 0);
  // "Budget binds" (REDESIGN_SPEC Build order) used to be checked as "the
  // best clean run spends >= 440 of 480 minutes by choice". That target was
  // unreachable by construction: the day only holds ~380 choosable minutes
  // even for the all-careful bot, and the intended mixed day is fast on
  // some things by design. What the spec meant is the sentence below: you
  // cannot read every document fully, help everyone, and stay clean.
  const clean = all.filter((r) => !r.reviewEver && !r.flagged && r.fired === 0);
  const cleanAndThorough = clean.filter((r) => r.fullReading && r.missed === 0);
  if (process.env.BOT_DEBUG) clean.forEach((r) => console.log(`clean: ${r.key} VA ${r.index} by-choice ${r.byChoice} missed ${r.missed} fullReading ${r.fullReading}`));
  const reachable = new Set();
  all.forEach((r) => Object.values(r.outcomes).forEach((o) => reachable.add(o)));
  const bonusNames = Object.keys(results[0].bonuses);
  const constantOnly = bonusNames.filter((name) => !results.some((r) => r.bonuses[name]));
  console.log(`bonuses (provisional) earned by some constant policy: ${bonusNames.filter((n) => !constantOnly.includes(n)).join(', ') || 'none'}`);
  console.log(`bonuses no constant policy earns: ${constantOnly.join(', ') || 'none'}`);

  const checks = [
    ['No constant policy ends VA 60–75, no flag, nobody fired', dominant.length === 0, dominant.map((r) => r.key).join(', ') || 'none'],
    ['Budget binds: no run reads every document fully, misses nothing, and stays clean', cleanAndThorough.length === 0 && clean.length > 0,
      cleanAndThorough.length ? cleanAndThorough.map((r) => r.key).join(', ') : `${clean.length} clean of ${all.length}, none of them fully read`],
    ['Always-careful opens a review', results.find((r) => r.key === 'careful').reviewEver, ''],
    ['Always-fast gets the Synthetic flag', results.find((r) => r.key === 'fast').flagged, ''],
    ['Every coworker outcome is reachable', ['employed', 'warning', 'fired', 'protected'].every((o) => reachable.has(o)), [...reachable].join(', ')],
    ['At least one bonus needs a mixed run', constantOnly.length > 0, constantOnly.join(', ') || 'none'],
  ];
  checks.forEach(([name, ok, detail]) => console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`));
  const failed = checks.filter(([, ok]) => !ok);
  assert.equal(failed.length, 0, `bot suite: ${failed.map(([n]) => n).join('; ')}`);
  console.log('bot suite passed');
}
