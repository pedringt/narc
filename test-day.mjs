import assert from 'node:assert/strict';
import { newGame, act, ending, START, END, nextEvent } from './day.js';

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
  s = act(s, { do: 'idle', minutes: 72 }); // 10:12
  assert.equal(nextEvent(s).t, 10 * 60 + 15, 'at 10:12 the next meaningful beat is only three minutes away');
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
  assert.ok(s.log.some((e) => e.kind === 'narc' && /midmorning pattern check/i.test(e.text)));
  s = act(s, { do: 'respond', id: 'narcCheckpoint', choice: 'context' });
  assert.equal(s.requests.narcCheckpoint.status, 'handled');
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
  consulted = act(consulted, { do: 'respond', id: 'narcFirstReview', choice: 'accept' });
  consulted = act(consulted, { do: 'respond', id: 'luisTip', choice: 'thank' });
  consulted = act(consulted, { do: 'workUntil' }); // -> Dana's first-hour check at 10:15
  consulted = act(consulted, { do: 'respond', id: 'danaMorning', choice: 'skip' });
  consulted = act(consulted, { do: 'workUntil' }); // -> Marcus's favor at 10:45
  consulted = act(consulted, { do: 'respond', id: 'marcusFavor', choice: 'decline' });
  consulted = act(consulted, { do: 'workUntil' }); // -> NARC's midmorning check at 11:20
  consulted = act(consulted, { do: 'respond', id: 'narcCheckpoint', choice: 'ignore' });
  consulted = act(consulted, { do: 'workUntil' }); // -> Dana's check-in at 12:15
  consulted = act(consulted, { do: 'respond', id: 'danaCheckin', choice: 'brief' });
  consulted = act(consulted, { do: 'workUntil' }); // -> 1:30 Focus Time spread / system update
  // Everything clock-based and flag-free is now resolved; with no flag ever
  // earned, Marcus's fallout (2:30) must not be the next stop -- it should
  // skip straight to end of day.
  assert.equal(nextEvent(consulted).t, END, "workUntil should never stop at Marcus's fallout time when it was never earned");
  consulted = act(consulted, { do: 'idle', minutes: 6 * 60 });
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
  // The next stop is now Dana's first-hour check at 10:15, which prevents
  // the old 10-ish-to-noon dead stretch.
  assert.equal(s.requests.luisTip.status, 'open');
  assert.equal(nextEvent(s).t, 10 * 60 + 15);
  s = act(s, { do: 'respond', id: 'luisTip', choice: 'thank' });

  const before = { index: s.index, focusUses: s.narc.focusUses, actual: s.actual };
  s = act(s, { do: 'workUntil' });
  assert.equal(s.t, 10 * 60 + 15, 'jumps exactly to the next meaningful beat, not a fixed step');
  assert.equal(s.requests.danaMorning.status, 'open', 'Dana checks in before the long midmorning gap');
  assert.equal(s.index, before.index, 'the jump itself changes nothing');
  assert.equal(s.narc.focusUses, before.focusUses);
  assert.equal(s.actual, before.actual);

  // Chained the rest of the way -- resolving whatever opens with its
  // cheapest option -- it reaches end of day on a small, bounded number of
  // contextual jumps rather than a click-to-burn-time loop.
  const cheapest = { narcFirstReview: 'accept', danaMorning: 'skip', marcusFavor: 'decline', narcCheckpoint: 'ignore', rework: 'escalate', danaCheckin: 'brief', marcusFallout: 'standby', narcResponse: 'ignore' };
  let hops = 0;
  while (s.phase !== 'end' && hops < 40) {
    const openReq = Object.entries(s.requests).find(([, r]) => r.status === 'open');
    const openTask = Object.entries(s.tasks).find(([, t]) => t.status === 'pending');
    if (openReq) s = act(s, { do: 'respond', id: openReq[0], choice: cheapest[openReq[0]] });
    else if (openTask) s = act(s, { do: 'task', id: openTask[0], approach: cheapest[openTask[0]] || 'escalate' });
    else { s = act(s, { do: 'workUntil' }); hops += 1; }
  }
  assert.equal(s.phase, 'end');
  assert.ok(hops <= 7, `expected a handful of contextual jumps, got ${hops}`);
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
