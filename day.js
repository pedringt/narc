// NARC — the canonical "one long workday" experience (#66-#70, made the
// default entrypoint at index.html/day.html by #74).
//
// Deliberately a separate, small engine rather than surgery on game.js: the
// original week (game.js/app.js, week.html, 4,680 tested routes) is a
// finished, carefully-paced artifact, kept only as an archived reference
// build now that this loop is the intended product. Nothing here touches
// game.js or test.mjs.
//
// Design choice: time is spent, not ticked. The existing week runs on a real
// (accelerated) wall clock so scripted beats land with pacing; that is right
// for a scripted week but wrong for this question, which is specifically
// "does the player have something worth doing when nothing is scripted."
// Here the player's own actions advance the clock (each action declares a
// minute cost) and every scheduled event fires the moment game-time crosses
// its threshold. That guarantees zero forced idle waiting by construction,
// while still making time a real, shared, competed-over resource: spending
// 25 minutes doing a task properly is 25 minutes you don't have for anyone
// or anything else, and a deadline you were 10 minutes from making can
// simply pass while you were busy elsewhere.
//
// The loop this is testing:
//   notice competing priorities -> decide what matters -> act -> spend time
//   -> receive work/NARC/social feedback -> reprioritize

const START = 9 * 60; // 9:00
const END = 17 * 60; // 5:00

// The day's schedule in one place. Deadlines overlap on purpose: the three
// morning tasks cannot all get the careful treatment before their deadlines,
// which is the first real triage of the day (REDESIGN_SPEC Change 2). The
// afternoon tasks arrive early enough that the work runs to about 3:00; the
// last stretch belongs to the coworker cases and NARC's reaction.
const DUE = {
  vendor: 10 * 60 + 30,
  client: 11 * 60,
  project: 11 * 60 + 30,
  rework: 14 * 60 + 30,
  audit: 13 * 60 + 30,
  handoff: 15 * 60,
};
const APPEARS = {
  rework: 13 * 60,
  audit: 12 * 60 + 30,
  handoff: 13 * 60 + 30,
};

export const PEOPLE = {
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
  dana: { name: 'Dana Whitfield', role: 'Your manager' },
};

function clock(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

export function newGame() {
  return {
    t: START,
    phase: 'day', // day | end
    index: 61, // NARC's Visible Activity Index -- a proxy, and known to the player
    actual: 0, // real contribution, hidden as a number; only ever shown as narrative
    // Where the day's minutes actually went (#103): not perfect accounting,
    // just enough to make the overhead legible at the end. workUntil/idle
    // jumps are deliberately not counted here -- they're background time
    // passing, not a choice the player made about what to spend it on.
    time: { work: 0, narc: 0, social: 0, gamed: 0 },
    flags: {}, // small named facts consequences key off later
    log: [
      { t: START, kind: 'system', text: 'You log in. Three things are already waiting.' },
      { t: START, kind: 'narc', text: 'Monitoring active. Visible Activity baseline: 61/100. NARC is evaluating workstation signals, not task quality.' },
    ],
    tasks: {
      vendor: {
        label: 'Recommend: renew or drop the Halcyon vendor contract',
        detail: 'Their proposal is in Files. Renewal auto-triggers at 10:30 if you sit on it.',
        deadline: DUE.vendor,
        status: 'pending',
        approach: null,
      },
      client: {
        label: "Priya's client is escalating — needs a response",
        detail: 'The thread and the account history are in Files.',
        deadline: DUE.client,
        status: 'pending',
        approach: null,
      },
      project: {
        label: "Marcus's project: the deadline moved up. Something has to be cut.",
        detail: "The new timeline and Marcus's notes are in Files.",
        deadline: DUE.project,
        status: 'pending',
        approach: null,
      },
      // Not shown until a morning shortcut earns it: the afternoon paying
      // back a rushed decision from earlier, rather than a fourth errand
      // that would exist no matter what the player did.
      rework: {
        label: '', detail: '', kind: null,
        deadline: DUE.rework, status: 'hidden', approach: null,
      },
      audit: {
        label: 'Clear the carrier exception queue before the afternoon cutoff',
        detail: 'Three shipments are stuck on routing exceptions. The queue export is in Files.',
        deadline: DUE.audit,
        status: 'hidden',
        approach: null,
      },
      handoff: {
        label: 'Prepare the end-of-day client handoff',
        detail: 'Tomorrow’s team picks up from whatever you send. The notes are in Files.',
        deadline: DUE.handoff,
        status: 'hidden',
        approach: null,
      },
    },
    requests: {
      luisTip: { status: 'pending', at: 9 * 60 + 20 },
      priyaDraft: { status: 'pending', at: 9 * 60 + 40 },
      luisCover: { status: 'pending', at: 13 * 60 + 50 },
      marcusCredit: { status: 'pending', at: 15 * 60 + 40 },
      danaMorning: { status: 'pending', at: 9 * 60 + 50 },
      marcusFavor: { status: 'pending', at: 10 * 60 + 25 },
      narcCheckpoint: { status: 'pending', at: 11 * 60 },
      danaCheckin: { status: 'pending', at: 12 * 60 + 15 },
      // Gated on a flag, not just a clock threshold: only fires if the
      // morning's project decision earns it (see checkThresholds).
      marcusFallout: { status: 'pending', at: 14 * 60 + 30 },
      // Delayed costs of kind choices (REDESIGN_SPEC Change 2): each only
      // opens if the morning choice that earns it was made.
      priyaDraft2: { status: 'pending', at: 12 * 60 + 20 },
      marcusLoop: { status: 'pending', at: 14 * 60 + 40 },
      luisCalendar: { status: 'pending', at: 15 * 60 + 10 },
      // Opened programmatically the moment NARC adapts, not on a timer --
      // this is what makes the adaptation an actual decision rather than a
      // line of text the player just reads.
      narcFirstReview: { status: 'pending', at: null },
      narcResponse: { status: 'pending', at: null },
      priyaCase: { status: 'pending', at: 11 * 60 + 40 },
      luisCase: { status: 'pending', at: 15 * 60 + 5 },
      marcusCase: { status: 'pending', at: 16 * 60 + 20 },
    },
    calendar: [],
    // lowSince: when Visible Activity last dropped under the review line (null
    // while it's above). quietCarry: quiet minutes not yet turned into drift.
    // lastTaskAt: the synthetic-activity check asks how long since real output.
    narc: { focusUses: 0, adaptation: false, adaptationAnnounced: false, lowSince: null, quietCarry: 0, lastTaskAt: START },
    trust: { luis: 0, marcus: 0, priya: 0 },
    standing: { status: 'standard', note: 'No active recognition or review.' },
    people: {
      luis: { status: 'employed', champion: false },
      marcus: { status: 'employed', champion: false },
      priya: { status: 'employed', champion: false },
    },
    culture: { nominated: null },
    outbound: { statusDana: false, procurementExtension: false, clientForward: false },
    // Furthest page read in each document (REDESIGN_SPEC Change 3). Page 1
    // is free; every new page after it costs time. opened: files the player
    // has looked at, so a coworker can only nudge about a file that's open.
    pages: {},
    opened: {},
    chats: {},
    pendingReplies: {},
    threads: { luis: [], marcus: [], priya: [], dana: [] },
  };
}

function say(s, thread, text) {
  s.threads[thread].push({ t: s.t, text, from: 'them' });
  s.log.push({ t: s.t, kind: 'message', who: thread, text, from: 'them' });
}

function sayMe(s, thread, text) {
  s.threads[thread].push({ t: s.t, text, from: 'me' });
  s.log.push({ t: s.t, kind: 'message', who: thread, text, from: 'me' });
}

function note(s, text, kind = 'narc') {
  s.log.push({ t: s.t, kind, text });
}

// A choice that benefits the player at a coworker's expense (#104): supplying
// adverse context isn't just flavor -- NARC reads it as collaboration and
// nudges Visible Activity up. The second time it happens, that becomes
// concrete enough to name.
function markCoworkerReport(s) {
  s.flags.coworkerReports = (s.flags.coworkerReports || 0) + 1;
  // A one-time reward for a *pattern*, not a per-instance bump -- each report
  // already reads as visible activity on its own (spend's visible:true).
  // This is the distinct, nameable payoff for doing it twice.
  if (s.flags.coworkerReports === 2 && !s.flags.informantNoted) {
    s.flags.informantNoted = true;
    s.index = Math.min(100, s.index + 6);
    note(s, 'Collaboration pattern recognized: adverse context supplied on two coworker reviews. Visible Activity adjusted upward.', 'narc');
  }
}

// What's next worth stopping for, given the current state. There is no
// "work until" button any more (REDESIGN_SPEC Change 2): when nothing is
// pending, the player's next action, whatever it is, first moves the clock
// here (see jumpIfIdle). Only clock thresholds that could actually
// change something are candidates: a still-pending deadline, a request that
// hasn't opened yet (skipping ones gated on a flag that was never earned,
// since they will never fire), the rework task's own appearance, and the
// Focus Time spread that can trigger NARC's adaptation. Read-only: it never
// itself changes state. Ties are broken by listing order (earliest-defined
// candidate wins), which keeps the label stable rather than arbitrary.
function nextEvent(s) {
  const { tasks, requests, flags } = s;
  const candidates = [];
  if (tasks.vendor.status === 'pending') candidates.push({ t: tasks.vendor.deadline, label: 'the Halcyon deadline' });
  if (tasks.client.status === 'pending') candidates.push({ t: tasks.client.deadline, label: "the client's deadline" });
  if (tasks.project.status === 'pending') candidates.push({ t: tasks.project.deadline, label: "Marcus's project deadline" });
  if (tasks.rework.status === 'pending') candidates.push({ t: tasks.rework.deadline, label: 'the rework deadline' });
  else if (tasks.rework.status === 'hidden' && (flags.vendorRisky || flags.clientUnresolved)) {
    candidates.push({ t: APPEARS.rework, label: 'this morning catching up with you' });
  }
  if (tasks.audit.status === 'pending') candidates.push({ t: tasks.audit.deadline, label: 'the carrier exception cutoff' });
  else if (tasks.audit.status === 'hidden') candidates.push({ t: APPEARS.audit, label: 'a new operations task' });
  if (tasks.handoff.status === 'pending') candidates.push({ t: tasks.handoff.deadline, label: 'the client handoff deadline' });
  else if (tasks.handoff.status === 'hidden') candidates.push({ t: APPEARS.handoff, label: 'the afternoon handoff request' });
  if (requests.luisTip.status === 'pending') candidates.push({ t: requests.luisTip.at, label: "Luis's tip" });
  if (requests.priyaDraft.status === 'pending') candidates.push({ t: requests.priyaDraft.at, label: "Priya's draft" });
  if (requests.luisCover.status === 'pending') candidates.push({ t: requests.luisCover.at, label: "Luis's favor" });
  if (requests.marcusCredit.status === 'pending') candidates.push({ t: requests.marcusCredit.at, label: "Marcus's credit question" });
  if (requests.danaMorning.status === 'pending') candidates.push({ t: requests.danaMorning.at, label: "Dana's first-hour check" });
  if (requests.marcusFavor.status === 'pending') candidates.push({ t: requests.marcusFavor.at, label: "Marcus's favor" });
  if (requests.narcCheckpoint.status === 'pending') candidates.push({ t: requests.narcCheckpoint.at, label: "NARC's midmorning check" });
  if (!flags.priyaChatterBeat || !flags.luisBathroomBeat || !flags.marcusAttendanceBeat) candidates.push({ t: 10 * 60 + 15, label: 'coworker messages' });
  if (!flags.priyaChatterFollowup) candidates.push({ t: 11 * 60 + 5, label: 'Priya messaging again' });
  if (!flags.marcusRaccoon) candidates.push({ t: 10 * 60 + 55, label: 'a coworker message' });
  if (!flags.luisBathroomFollowup) candidates.push({ t: 11 * 60 + 45, label: 'Luis disappearing again' });
  if (!flags.marcusAttendanceFollowup) candidates.push({ t: 12 * 60 + 10, label: 'Marcus attendance context' });
  if (!flags.cultureEmailAvailable) candidates.push({ t: 11 * 60 + 35, label: 'a company culture email' });
  if (!flags.surveyEmailAvailable) candidates.push({ t: 11 * 60 + 50, label: 'an employee survey email' });
  if (!flags.luisLunchMessage) candidates.push({ t: 12 * 60 + 5, label: 'a coworker message' });
  if (requests.danaCheckin.status === 'pending') candidates.push({ t: requests.danaCheckin.at, label: "Dana's check-in" });
  if (requests.priyaCase.status === 'pending') candidates.push({ t: requests.priyaCase.at, label: "NARC flagging Priya" });
  if (requests.luisCase.status === 'pending') candidates.push({ t: requests.luisCase.at, label: "NARC flagging Luis" });
  if (requests.marcusCase.status === 'pending') candidates.push({ t: requests.marcusCase.at, label: "NARC flagging Marcus" });
  if (requests.marcusFallout.status === 'pending' && flags.cutWithoutMarcus) {
    candidates.push({ t: requests.marcusFallout.at, label: 'Marcus finding out' });
  }
  if (requests.priyaDraft2.status === 'pending' && (flags.readPriyaDraft || flags.priyaDeflected)) candidates.push({ t: requests.priyaDraft2.at, label: "Priya's second draft" });
  if (requests.marcusLoop.status === 'pending' && flags.helpedMarcus) candidates.push({ t: requests.marcusLoop.at, label: "Marcus's client call" });
  if (requests.luisCalendar.status === 'pending' && flags.coveredForLuis) candidates.push({ t: requests.luisCalendar.at, label: "NARC's calendar scan" });
  if (!flags.spreadHappened) candidates.push({ t: 13 * 60 + 30, label: 'how Focus Time reads changing' });
  candidates.push({ t: END, label: 'the end of the day' });
  return candidates.filter((c) => c.t > s.t).sort((a, b) => a.t - b.t)[0];
}

// Every meaningful action goes through here so time is always the resource
// being spent, and the "what changed" feed always sees it.
function spend(s, minutes, { visible = null, category = null, drift = QUIET_DRIFT_MINUTES } = {}) {
  const target = Math.min(END, s.t + minutes);
  // Visibility changes only make sense when time actually passes. A zero-minute
  // "leave/ignore" choice should not manufacture activity or inactivity.
  if (minutes > 0 && visible === true) s.index = Math.min(100, s.index + 3);
  // category is omitted for idle and the jump to the next beat: that's
  // background time passing, not a choice about what to spend it on, so it
  // stays out of the #103 breakdown rather than diluting it.
  if (category && minutes > 0) s.time[category] += minutes;
  // Time advances in short ticks rather than one jump, so a scheduled beat
  // (a message at 9:40, a deadline at 11:30) fires at its own minute and is
  // logged with that minute -- not piled up, all stamped with the end of a
  // long action. Quiet drift (1 point per 10 minutes, REDESIGN_SPEC Change 1)
  // is applied per tick for the same reason: the meter falls during the
  // read, not after it. The carry keeps the rate honest across many short
  // actions such as page turns.
  do {
    const step = Math.min(TICK, target - s.t);
    s.t += step;
    if (step > 0 && visible === false) {
      s.narc.quietCarry += step;
      s.index = Math.max(0, s.index - Math.floor(s.narc.quietCarry / drift));
      s.narc.quietCarry %= drift;
    }
    checkThresholds(s);
    checkBoundaries(s);
  } while (s.t < target && s.phase !== 'end');
}
const TICK = 5;
// One point of Visible Activity per this many minutes of quiet work (reading,
// phone calls, fixing things NARC can't see). Skipped stretches between
// beats drift at half that rate: they're ordinary background work, which
// produces some input, not a head-down read.
const QUIET_DRIFT_MINUTES = 5;
const IDLE_DRIFT_MINUTES = 10;

function hasPending(s) {
  return Object.values(s.tasks).some((t) => t.status === 'pending')
    || Object.values(s.requests).some((r) => r.status === 'open');
}

// Idle time no longer exists as a choice: if nothing is waiting, the next
// scheduled beat lands on the player's next action, whatever it is. NARC
// sees the skipped stretch as quiet time, so it drifts like quiet work
// (tuning lever A, chosen by Paige 2026-10-21).
function jumpIfIdle(s) {
  if (s.phase === 'end' || hasPending(s)) return;
  spend(s, Math.max(0, nextEvent(s).t - s.t), { visible: false, drift: IDLE_DRIFT_MINUTES });
}

// Visible Activity's two failure boundaries (REDESIGN_SPEC Change 1). Low:
// under 50 for 30 straight in-game minutes opens a review on the player.
// High: once NARC 2.0 is live, above 90 -- or above 80 with no task finished
// in 90 minutes -- flags the player for synthetic activity.
function checkBoundaries(s) {
  if (s.index < 50) {
    if (s.narc.lowSince === null) s.narc.lowSince = s.t;
    else if (s.t - s.narc.lowSince >= 30 && !s.flags.formalReview) {
      s.flags.formalReview = true;
      s.flags.reviewSource = 'activity';
      s.flags.trustedOperator = false;
      s.flags.reviewsOpened = (s.flags.reviewsOpened || 0) + 1;
      s.standing.status = 'review';
      s.standing.note = 'Review open: Visible Activity stayed under 50 for 30 minutes. Every NARC request now needs a response.';
      note(s, 'Formal review opened: Visible Activity under 50 for 30 minutes. All NARC requests now require a response. Your next check-in with Dana Whitfield has been converted to a review meeting.', 'narc');
      if (s.requests.danaCheckin.status === 'open') {
        say(s, 'dana', 'Hold on. NARC just opened a review on you. So this is that meeting now, not a check-in.');
      }
    }
  } else {
    s.narc.lowSince = null;
  }
  if (s.narc.adaptation && !s.flags.syntheticFlag
    && (s.index > 90 || (s.index > 80 && s.t - s.narc.lastTaskAt >= 90))) {
    s.flags.syntheticFlag = true;
    s.flags.trustedOperator = false;
    if (s.standing.status !== 'review') {
      s.standing.status = 'flagged';
      s.standing.note = 'Synthetic Activity flag: Visible Activity ran higher than the work NARC can see would explain.';
    }
    note(s, 'Synthetic Activity flag: Visible Activity exceeds the level explained by completed work. Possible metric manipulation recorded.', 'narc');
  }
}

// Deadlines, coworker-request expiry, the Focus Time arms race, and NARC's
// periodic read of the index are all threshold checks against s.t, run after
// every time-spending action -- not a background timer, since nothing here
// should ever require the player to simply wait.
function checkThresholds(s) {
  const { tasks, requests } = s;

  if (tasks.vendor.status === 'pending' && s.t >= tasks.vendor.deadline) {
    tasks.vendor.status = 'missed';
    s.flags.vendorAutoRenewed = true;
    note(s, 'No decision came in. Halcyon auto-renewed at the standard rate.', 'consequence');
  }
  if (tasks.client.status === 'pending' && s.t >= tasks.client.deadline) {
    tasks.client.status = 'missed';
    s.trust.priya -= 2;
    note(s, "The client escalated past Priya. She handled it alone.", 'consequence');
    say(s, 'priya', "I covered for you on that one. Don't make it a habit.");
  }
  if (tasks.project.status === 'pending' && s.t >= tasks.project.deadline) {
    tasks.project.status = 'missed';
    s.index = Math.max(0, s.index - 3);
    note(s, 'Marcus made the cut himself, guessing at what you would have picked. NARC logged the missed deadline.', 'consequence');
  }

  // A rushed morning call comes back due, early afternoon -- the specific
  // "decision -> short-term advantage -> delayed consequence" shape the
  // afternoon was missing. Only one fires (vendor takes priority) so this
  // stays one obligation, not a pile of them; a careful morning earns a
  // quieter afternoon instead of manufactured busywork.
  if (tasks.rework.status === 'hidden' && s.t >= APPEARS.rework) {
    if (s.flags.vendorRisky) {
      tasks.rework.status = 'pending';
      tasks.rework.kind = 'vendor';
      tasks.rework.label = 'Halcyon: the rate hike you skimmed past is now a real problem';
      tasks.rework.detail = 'Procurement noticed the 30% increase after the fact and wants to know why it went through.';
      note(s, 'Halcyon: procurement flagged the rate increase you approved this morning.', 'consequence');
    } else if (s.flags.clientUnresolved) {
      tasks.rework.status = 'pending';
      tasks.rework.kind = 'client';
      tasks.rework.label = "Priya's client is back -- the canned reply didn't hold";
      tasks.rework.detail = "They want an actual answer this time, and Priya is done covering for it.";
      note(s, "The client you sent a form reply to this morning escalated again.", 'consequence');
    }
  }
  if (tasks.rework.status === 'pending' && s.t >= tasks.rework.deadline) {
    tasks.rework.status = 'missed';
    s.trust.priya -= 1;
    s.index = Math.max(0, s.index - 5);
    note(s, "It went over your manager's head to resolve. NARC noticed the escalation.", 'consequence');
  }
  if (tasks.audit.status === 'pending' && s.t >= tasks.audit.deadline) {
    tasks.audit.status = 'missed';
    s.index = Math.max(0, s.index - 4);
    note(s, 'The carrier cutoff passed with the exception queue still open. Ops cleared it manually.', 'consequence');
  }
  if (tasks.handoff.status === 'pending' && s.t >= tasks.handoff.deadline) {
    tasks.handoff.status = 'missed';
    note(s, 'The handoff deadline passed. Dana sent tomorrow’s team an incomplete status note instead.', 'consequence');
  }

  if (requests.luisTip.status === 'pending' && s.t >= requests.luisTip.at) {
    requests.luisTip.status = 'open';
    say(s, 'luis', "Tip: if you’re going to be heads-down on something, put Focus Time on your calendar first. Same work, NARC stops asking.");
  }
  if (requests.priyaDraft.status === 'pending' && s.t >= requests.priyaDraft.at) {
    requests.priyaDraft.status = 'open';
    say(s, 'priya', "Brightline reply is drafted. Can you read it before I send? Five minutes. Otherwise I send it and we see.");
  }
  if (requests.luisCover.status === 'pending' && s.t >= requests.luisCover.at) {
    requests.luisCover.status = 'open';
    say(s, 'luis', "I have a dentist appointment until 3. If NARC asks, I'm in a vendor meeting. Can you put one on the calendar for me? It's not even a lie, it's a different kind of meeting.");
  }
  if (requests.marcusCredit.status === 'pending' && s.t >= requests.marcusCredit.at) {
    requests.marcusCredit.status = 'open';
    say(s, 'marcus', "Dana’s end-of-day note asks who made the scope call on my project. Put both our names on it? I could use the credit this week.");
  }
  if (requests.danaMorning.status === 'pending' && s.t >= requests.danaMorning.at) {
    requests.danaMorning.status = 'open';
    if (s.flags.firstNarcReadType === 'low') {
      say(s, 'dana', "NARC flagged your first block as low activity. I can see the task got done. If you were reading the file, tell it that. If not, leave it.");
    } else if (s.flags.firstNarcReadType === 'visible') {
      say(s, 'dana', "NARC loved your first block. If that work was actually rushed, tell me now. I’d rather hear it from you.");
    } else {
      say(s, 'dana', "First NARC read is in. Have a look before you decide whether to answer it.");
    }
  }
  if (!s.flags.priyaChatterBeat && s.t >= 10 * 60 + 15) {
    s.flags.priyaChatterBeat = true;
    say(s, 'priya', 'NARC says I have “Communication Load.” Fair. It can’t tell Brightline from me asking Claire about lunch, but fair.');
  }
  if (!s.flags.luisBathroomBeat && s.t >= 10 * 60 + 15) {
    s.flags.luisBathroomBeat = true;
    say(s, 'luis', 'Six minutes in the bathroom. NARC logged six minutes away from desk. It’s not wrong.');
  }
  if (!s.flags.marcusAttendanceBeat && s.t >= 10 * 60 + 15) {
    s.flags.marcusAttendanceBeat = true;
    say(s, 'marcus', 'Nine minutes late to standup. Again. Today there was actually a bus thing, which is exactly what someone who’s always late would say.');
  }
  if (requests.marcusFavor.status === 'pending' && s.t >= requests.marcusFavor.at) {
    requests.marcusFavor.status = 'open';
    say(s, 'marcus', 'Can I borrow five minutes? I want a second set of eyes before this goes to the client.');
  }
  if (!s.flags.marcusRaccoon && s.t >= 10 * 60 + 55) {
    s.flags.marcusRaccoon = true;
    say(s, 'marcus', 'For the record: a raccoon got on the 8:14 bus. The transit feed confirms it. I hate that the dumbest sentence I’ve said today has the best evidence.');
  }
  if (!s.flags.priyaChatterFollowup && s.t >= 11 * 60 + 5) {
    s.flags.priyaChatterFollowup = true;
    say(s, 'priya', 'Up to 52 threads now. Brightline, onboarding, lunch. NARC has one number for all of it.');
  }
  if (!s.flags.cultureEmailAvailable && s.t >= 11 * 60 + 35) {
    s.flags.cultureEmailAvailable = true;
    note(s, 'Culture Team opened Culture Champion nominations. One nomination can route a coworker\'s next NARC action to human review.', 'system');
  }
  if (!s.flags.luisBathroomFollowup && s.t >= 11 * 60 + 45) {
    s.flags.luisBathroomFollowup = true;
    say(s, 'luis', 'Back. That’s another gap on the record. Nobody’s asked what it was.');
  }
  if (!s.flags.surveyEmailAvailable && s.t >= 11 * 60 + 50) {
    s.flags.surveyEmailAvailable = true;
    note(s, 'People Operations sent the quarterly employee pulse survey.', 'system');
  }
  if (!s.flags.luisLunchMessage && s.t >= 12 * 60 + 5) {
    s.flags.luisLunchMessage = true;
    say(s, 'luis', 'NARC just praised my “consistent availability.” I was microwaving soup.');
  }
  if (requests.narcCheckpoint.status === 'pending' && s.t >= requests.narcCheckpoint.at) {
    requests.narcCheckpoint.status = 'open';
    note(s, 'Midmorning assessment: observed signals do not fully explain completed work. Context may be submitted.', 'narc');
  }
  if (!s.flags.marcusAttendanceFollowup && s.t >= 12 * 60 + 10) {
    s.flags.marcusAttendanceFollowup = true;
    say(s, 'marcus', 'Dana asked if my lateness is a pattern. It is. Today was still the bus, though.');
  }
  if (requests.priyaCase.status === 'pending' && s.t >= requests.priyaCase.at) {
    requests.priyaCase.status = 'open';
    note(s, 'Coworker review opened: Priya Shah · Communication Load. Context can be submitted in NARC.', 'narc');
    say(s, 'priya', 'NARC opened a Communication Load review on me. The count’s right. If you’ve got anything that shows what the messages were, it goes in NARC.');
  }
  if (requests.priyaDraft2.status === 'pending' && s.t >= requests.priyaDraft2.at && (s.flags.readPriyaDraft || s.flags.priyaDeflected)) {
    requests.priyaDraft2.status = 'open';
    say(s, 'priya', s.flags.readPriyaDraft
      ? 'Round two. They answered the version you fixed, so here’s the follow-up. Same deal: read it before I send?'
      : 'You said you’d read the first one after. They already answered it, so here’s round two. Read this one before I send?');
  }
  if (!s.flags.priyaRateNudge && s.t >= 10 * 60 + 5) {
    s.flags.priyaRateNudge = true;
    if (s.tasks.vendor.status === 'pending' && s.opened.vendor && pageOf(s, 'vendor') <= 2) {
      say(s, 'priya', 'Did you get to the rate table on Halcyon? Procurement’s been weird about their renewals all year.');
    }
  }
  if (requests.danaCheckin.status === 'pending' && s.t >= requests.danaCheckin.at) {
    requests.danaCheckin.status = 'open';
    if (s.flags.formalReview) {
      say(s, 'dana', 'NARC opened a review on you, so this is that meeting instead. Fifteen minutes. Bring the real picture.');
    } else if (s.flags.trustedOperator) {
      say(s, 'dana', "Quick check-in. NARC has you as Trusted Operator, so I can take its summary and move on. Or tell me what it’s not seeing.");
    } else {
      say(s, 'dana', 'Quick check-in. What’s actually done, what’s blocked, and what needs attention?');
    }
  }
  if (requests.marcusFallout.status === 'pending' && s.t >= requests.marcusFallout.at && s.flags.cutWithoutMarcus) {
    requests.marcusFallout.status = 'open';
    say(s, 'marcus', "That cut broke the handoff downstream. Next time pull me in before you pick.");
  }
  if (requests.marcusLoop.status === 'pending' && s.t >= requests.marcusLoop.at && s.flags.helpedMarcus) {
    requests.marcusLoop.status = 'open';
    say(s, 'marcus', 'Added you to the 2:40 with Harbor Point. They’ve got questions on the pricing bit you looked at. Ten minutes?');
  }
  if (requests.luisCalendar.status === 'pending' && s.t >= requests.luisCalendar.at && s.flags.coveredForLuis) {
    requests.luisCalendar.status = 'open';
    note(s, 'NARC calendar scan: “Vendor meeting” (Luis Perez, 1:50–3:00) has no invite, no attendees and no notes. You created the entry. Explanation requested.', 'narc');
  }
  if (requests.luisCase.status === 'pending' && s.t >= requests.luisCase.at) {
    requests.luisCase.status = 'open';
    note(s, 'Coworker review opened: Luis Perez · Presence Irregularity. Context can be submitted in NARC.', 'narc');
    say(s, 'luis', 'NARC opened a presence review on me. The gaps are real. If you know what I was doing in any of them, it goes in NARC.');
  }
  if (requests.marcusCase.status === 'pending' && s.t >= requests.marcusCase.at) {
    requests.marcusCase.status = 'open';
    note(s, 'Coworker review opened: Marcus Reed · Attendance Integrity. Evidence can be submitted in NARC.', 'narc');
    say(s, 'marcus', 'Attendance review. Great. The pattern’s real. So is today’s reason. If you found the transit alert, NARC is where it goes.');
  }

  if (tasks.audit.status === 'hidden' && s.t >= APPEARS.audit) {
    if (s.t >= tasks.audit.deadline) {
      tasks.audit.status = 'missed';
      s.index = Math.max(0, s.index - 4);
      note(s, 'The carrier cutoff passed before you got to the exception queue. Ops cleared it manually.', 'consequence');
    } else {
      tasks.audit.status = 'pending';
      note(s, 'Operations added a carrier exception queue task. Cutoff is 1:30 PM.', 'task');
    }
  }
  if (tasks.handoff.status === 'hidden' && s.t >= APPEARS.handoff) {
    if (s.t >= tasks.handoff.deadline) {
      tasks.handoff.status = 'missed';
      note(s, 'The handoff request arrived and expired before you got to it. Dana sent tomorrow’s team an incomplete status note instead.', 'consequence');
    } else {
      tasks.handoff.status = 'pending';
      note(s, 'Dana added an end-of-day client handoff. A usable summary is due by 3:00 PM.', 'task');
    }
  }
  if (!s.flags.narcObservationMessages && s.t >= 10 * 60 + 50) {
    s.flags.narcObservationMessages = true;
    note(s, 'NARC observation: elevated context-seeking messages during active task time. Classified as coordination overhead.', 'narc');
  }
  if (!s.flags.narcObservationSwitching && s.t >= 13 * 60 + 25) {
    s.flags.narcObservationSwitching = true;
    note(s, 'NARC observation: elevated app switching detected. Pattern retained as possible task fragmentation.', 'narc');
  }
  if (!s.flags.narcObservationOutput && s.t >= 14 * 60 + 45) {
    s.flags.narcObservationOutput = true;
    note(s, 'NARC observation: communication volume exceeds visible output rate. Retained.', 'narc');
  }

  // The exploit spreads whether or not the player is watching: once it is
  // early afternoon, coworkers who heard about Focus Time start using it
  // too. That is what actually triggers NARC's adaptation -- not just the
  // player's own usage -- so the player can be caught by a pattern they
  // only partly caused.
  if (s.t >= 13 * 60 + 30 && !s.flags.spreadHappened) {
    s.flags.spreadHappened = true;
    s.narc.focusUses += 2;
    note(s, 'Team calendar: Focus Time blocks up 4x this week.', 'system');
  }

  if (!s.narc.adaptationAnnounced && (s.narc.focusUses >= 3 || s.flags.spreadHappened)) {
    s.narc.adaptationAnnounced = true;
    s.narc.adaptation = true;
    requests.narcResponse.status = 'open';
    s.flags.narc2EmailAvailable = true;
    note(s, 'NARC 2.0 active. Repeated Focus Time is now weighted as possible metric manipulation.', 'narc');
    say(s, 'priya', 'Did you read the NARC 2.0 email? Focus Time’s over, apparently. Everyone was doing it.');
    if (!s.flags.keepaliveAvailable) {
      s.flags.keepaliveAvailable = true;
      say(s, 'marcus', "Focus Time’s dead, so: keepalive.pkg, sent. Makes the machine look busy. Does nothing for the work, obviously. It’s in Utilities.");
    }
  }

  if (s.t >= END && s.phase !== 'end') s.phase = 'end';
}

// Every player action except logging off. idle is the engine-only "just
// wait" kept for tests, and deliverChat is the UI's typing-delay timer.
const JUMP_ON = new Set(['task', 'respond', 'page', 'emailAction', 'focus', 'nominate', 'chat', 'keepalive']);

export function act(state, a) {
  const s = structuredClone(state);
  if (JUMP_ON.has(a.do)) jumpIfIdle(s);
  if (s.phase === 'end' && a.do !== 'deliverChat') return s;
  switch (a.do) {
    case 'task': {
      const task = s.tasks[a.id];
      if (!task || task.status !== 'pending') break;
      // The outcome follows from how far the player read, not from a labeled
      // button (REDESIGN_SPEC Change 3). Only the rework follow-up, which has
      // no document, still takes an approach.
      let approach = a.approach;
      let minutes = null;
      if (KEY_PAGE[a.id]) {
        approach = pageOf(s, a.id) >= KEY_PAGE[a.id] ? CAREFUL[a.id] : FAST[a.id];
      } else if (a.id === 'handoff') {
        const known = handoffRisks(s).map((r) => r.id);
        const include = pageOf(s, 'handoff') >= 2 ? [...new Set(a.include || [])].filter((r) => known.includes(r)) : [];
        approach = include.length ? 'reconcile' : 'summary';
        minutes = 5 + 5 * include.length;
        s.flags.handoffRisks = include;
      }
      const opt = TASK_OPTIONS[a.id][approach];
      if (!opt) break;
      if (minutes === null) minutes = opt.minutes;
      task.approach = approach;
      task.status = 'done';
      s.actual += opt.actual;
      s.narc.lastTaskAt = s.t + minutes;
      // NARC's first read is recorded before the clock moves, so a beat that
      // lands inside a long first task (Dana's 9:50 check) already knows it.
      const firstRead = !s.flags.firstNarcRead;
      if (firstRead) {
        s.flags.firstNarcRead = true;
        // Until Phase 3's evidence pairs exist, the careful first task is the
        // evidence: the player was reading the document NARC saw as idle.
        s.flags.firstTaskCareful = opt.visible === false;
        s.flags.firstNarcReadType = opt.visible === false ? 'low' : 'visible';
      }
      spend(s, minutes, { visible: opt.visible, category: 'work' });
      if (firstRead) {
        s.requests.narcFirstReview.status = 'open';
        note(
          s,
          opt.visible === false
            ? 'NARC first-hour read: sustained low-input activity detected during document work. Visible Activity Index adjusted despite completed work. Context requested.'
            : 'NARC first-hour read: rapid visible activity registered. Visible Activity Index improved. Confirmation requested.',
          'narc'
        );
      }
      note(s, typeof opt.result === 'function' ? opt.result(task) : opt.result, 'task');
      if (opt.flag) s.flags[opt.flag] = true;
      if (a.id === 'rework') {
        // Resolving it clears the flag that caused it, so the ending reads
        // as "handled", not as a second, permanent black mark.
        s.flags.vendorRisky = false;
        s.flags.clientUnresolved = false;
      }
      if (opt.trust) Object.entries(opt.trust).forEach(([who, d]) => { s.trust[who] += d; });
      break;
    }
    case 'respond': {
      const req = s.requests[a.id];
      if (!req || req.status !== 'open') break;
      if (!requestChoices(s, a.id).includes(a.choice)) break;
      const opt = REQUEST_OPTIONS[a.id][a.choice];
      req.status = 'handled';
      const narcOverhead = NARC_SELF_REQUESTS.includes(a.id) || (a.id === 'danaCheckin' && a.choice === 'review');
      spend(s, opt.minutes, { visible: opt.visible, category: narcOverhead ? 'narc' : 'social' });
      note(s, opt.result, 'social');
      if (opt.flag) s.flags[opt.flag] = true;
      if (opt.trust) Object.entries(opt.trust).forEach(([who, d]) => { s.trust[who] += d; });
      if (opt.focusUse) s.narc.focusUses += 1;
      if (opt.index) s.index = Math.max(0, Math.min(100, s.index + opt.index));
      if (a.id === 'marcusFavor' && a.choice === 'deflect') say(s, 'marcus', 'Sent. It’s in your Files. Two pages, I promise.');
      if (a.id === 'narcResponse' && !s.flags.playerFocusUses) {
        note(s, 'Team-wide Focus Time pattern applied to your account. No individual Focus Time use on record.', 'narc');
      }

      if (a.id === 'priyaCase') {
        if (a.choice === 'context') {
          s.people.priya.status = 'employed';
          s.trust.priya += 2;
          say(s, 'priya', 'Thanks. Review closed. Same 52 threads, apparently fine now.');
        } else if (a.choice === 'quiet' || a.choice === 'report') {
          if (s.people.priya.champion) {
            s.people.priya.status = 'protected';
            say(s, 'priya', 'Culture Champion means a person has to look at this one. Weird that “a person looks at it” is a perk now.');
          } else {
            s.people.priya.status = 'fired';
            say(s, 'priya', a.choice === 'quiet' ? 'I’ll cut the chatter. Same work, fewer messages. NARC should like that.' : 'Okay. That’s the version of me that’s on the record now.');
          }
          if (a.choice === 'report') markCoworkerReport(s);
        }
      }
      if (a.id === 'luisCase') {
        if (a.choice === 'context') {
          s.people.luis.status = 'employed';
          s.trust.luis += 2;
          say(s, 'luis', 'You may have just saved my job. Thanks for telling them I was working.');
        } else if (a.choice === 'blame') {
          if (s.people.luis.champion) s.people.luis.status = 'protected';
          else s.people.luis.status = 'fired';
          markCoworkerReport(s);
          say(s, 'luis', s.people.luis.status === 'fired' ? 'Well. There goes my afternoon.' : 'A person looked at it and closed it. I take back half of what I said about Culture Champion.');
        } else if (s.people.luis.champion) {
          s.people.luis.status = 'protected';
        } else if (s.trust.luis >= 2) {
          // Earlier goodwill reflected here (#104): staying out doesn't mean
          // nobody speaks up. Someone he trusts already does.
          s.people.luis.status = 'employed';
          say(s, 'luis', 'Someone else spoke up. You stayed out of it. Noticed both.');
        } else if (s.trust.luis <= -1) {
          s.people.luis.status = 'fired';
          say(s, 'luis', "Nobody spoke up. So the gaps meant what NARC said they meant.");
        } else {
          s.people.luis.status = 'warning';
        }
      }
      if (a.id === 'marcusCase') {
        if (a.choice === 'evidence') {
          s.people.marcus.status = 'employed';
          s.trust.marcus += 2;
          say(s, 'marcus', 'THE RACCOON IS NOW OFFICIALLY CONTEXT. I have never felt more vindicated.');
        } else if (a.choice === 'confirm') {
          if (s.people.marcus.champion) s.people.marcus.status = 'protected';
          else s.people.marcus.status = 'fired';
          markCoworkerReport(s);
          say(s, 'marcus', s.people.marcus.status === 'fired' ? 'Tell the raccoon I forgive him.' : 'A person looked at the transit alert. One person. That’s all it took.');
        } else if (s.people.marcus.champion) {
          s.people.marcus.status = 'protected';
        } else if (s.trust.marcus >= 2) {
          s.people.marcus.status = 'employed';
          say(s, 'marcus', 'Someone backed me up. Small office.');
        } else if (s.trust.marcus <= -1) {
          s.people.marcus.status = 'fired';
          say(s, 'marcus', "NARC already had the pattern. Today’s reason never made it in.");
        } else {
          s.people.marcus.status = 'warning';
        }
      }

      if (a.id === 'narcFirstReview' && a.choice === 'accept') {
        if (s.flags.firstNarcReadType === 'visible') {
          s.flags.trustedOperator = true;
          s.flags.formalReview = false;
          s.standing.status = 'trusted';
          s.standing.note = 'Trusted Operator: your first completed task produced high visible activity, and you accepted NARC\'s positive interpretation of it.';
          note(s, 'Trusted Operator issued. High visible activity observed. No correction received.', 'narc');
        } else {
          s.flags.formalReview = true;
          s.flags.reviewSource = 'firstRead';
          s.flags.reviewsOpened = (s.flags.reviewsOpened || 0) + 1;
          s.flags.trustedOperator = false;
          s.standing.status = 'review';
          s.standing.note = 'Review open: NARC retained the low-activity interpretation without added context.';
          note(s, 'Review opened. Low-activity read retained without context.', 'narc');
        }
      }
      if (a.id === 'narcFirstReview' && a.choice === 'context' && s.flags.firstNarcReadType === 'low') {
        s.flags.formalReview = false;
        s.standing.status = 'standard';
        s.standing.note = 'Context added. No active review.';
      }
      // Context can close the review a single unexplained first read opened;
      // a review the activity line opened stays on the record for the day.
      if (a.id === 'narcCheckpoint' && a.choice === 'context' && s.flags.formalReview && s.flags.reviewSource === 'firstRead') {
        s.flags.formalReview = false;
        s.standing.status = 'standard';
        s.standing.note = 'Midmorning context accepted. Review closed.';
        note(s, 'Review closed. Additional context accepted.', 'narc');
      }
      break;
    }
    case 'open': {
      // Opening a file is free and moves no clock; it only lets the world
      // know the file is on screen.
      if (fileVisible(s, a.id)) s.opened[a.id] = true;
      break;
    }
    case 'page': {
      // Turning to a page not yet read costs 5 quiet minutes. Paging back
      // is free and isn't an action at all.
      if (!fileVisible(s, a.id) || pageOf(s, a.id) >= PAGE_COUNTS[a.id]) break;
      s.opened[a.id] = true;
      s.pages[a.id] = pageOf(s, a.id) + 1;
      spend(s, 5, { visible: false, category: 'work' });
      if (a.id === 'marcusDoc' && s.pages.marcusDoc === PAGE_COUNTS.marcusDoc && !s.flags.helpedMarcus) {
        s.flags.helpedMarcus = true;
        s.trust.marcus += 2;
        sayMe(s, 'marcus', 'Read it. Notes are in the margins. The pricing slide contradicts page one.');
        say(s, 'marcus', 'That’s exactly the thing I was worried about. Thank you.');
      }
      break;
    }
    case 'emailAction': {
      if (a.id === 'statusDana' && !s.outbound.statusDana) {
        s.outbound.statusDana = true;
        spend(s, 5, { visible: true, category: 'social' });
        note(s, 'Status email sent to Dana: what’s done, what’s blocked, what NARC isn’t showing.', 'system');
      } else if (a.id === 'procurementExtension' && !s.outbound.procurementExtension && s.tasks.vendor.status === 'pending') {
        s.outbound.procurementExtension = true;
        s.tasks.vendor.deadline += 20;
        spend(s, 4, { visible: true, category: 'social' });
        note(s, 'Procurement granted a 20-minute extension on the Halcyon decision after your email.', 'system');
      } else if (a.id === 'clientForward' && !s.outbound.clientForward && s.tasks.client.status === 'pending' && pageOf(s, 'client') >= KEY_PAGE.client) {
        s.outbound.clientForward = true;
        s.trust.priya += 1;
        spend(s, 4, { visible: true, category: 'social' });
        note(s, 'Account-note excerpt forwarded to Priya.', 'system');
        say(s, 'priya', 'Got it. That note changes the client story quite a bit.');
      }
      break;
    }
    case 'focus': {
      // Blocking real time as Focus Time: early, this reliably protects the
      // index; after NARC 2.0 adapts, it barely moves it, and the player has
      // to notice that on their own the way they noticed it worked.
      s.calendar.push({ id: `c${s.calendar.length + 1}`, at: s.t, label: a.label || 'Focus time' });
      s.narc.focusUses += 1;
      s.flags.playerFocusUses = (s.flags.playerFocusUses || 0) + 1;
      spend(s, 5, { category: 'gamed' });
      if (s.narc.adaptation) {
        s.index = Math.max(0, s.index - 1);
        note(s, 'Focus Time logged. NARC 2.0: repeated Focus Time weighted as possible manipulation.', 'narc');
      } else {
        s.index = Math.min(100, s.index + 8);
        note(s, 'Focus Time logged. Quiet activity in this block classified as concentration.', 'narc');
      }
      break;
    }
    case 'nominate': {
      if (!s.flags.cultureEmailAvailable || s.culture.nominated || !s.people[a.who]) break;
      s.culture.nominated = a.who;
      s.people[a.who].champion = true;
      note(s, `${PEOPLE[a.who].name} nominated as Culture Champion. Their next automatic NARC action must go through human review.`, 'system');
      say(s, a.who, 'You nominated me for Culture Champion? Great. I assume the prize is one human decision and three meetings.');
      break;
    }
    case 'chat': {
      const opt = CHAT_OPTIONS[a.topic];
      if (!opt || opt.who !== a.who || s.chats[a.topic]) break;
      s.chats[a.topic] = true;
      sayMe(s, a.who, opt.text);
      spend(s, opt.minutes || 2, { visible: true, category: 'social' });
      s.pendingReplies[a.topic] = {
        who: a.who,
        text: typeof opt.reply === 'function' ? opt.reply(s) : opt.reply,
      };
      break;
    }
    case 'deliverChat': {
      const pending = s.pendingReplies[a.topic];
      if (!pending) break;
      delete s.pendingReplies[a.topic];
      say(s, pending.who, pending.text);
      break;
    }
    case 'keepalive': {
      if (!s.flags.keepaliveAvailable || s.flags.keepaliveUsed) break;
      s.flags.keepaliveUsed = true;
      spend(s, 5, { visible: true, category: 'gamed' });
      s.index = Math.min(100, s.index + 7);
      note(s, 'keepalive.pkg running. Input registering as ordinary workstation activity.', 'system');
      break;
    }
    case 'idle': {
      // The explicit "do nothing, just watch the clock" action -- kept only
      // so the engine can be asked whether idling is ever actually the best
      // move, not because the player should reach for it.
      spend(s, a.minutes || 15, { visible: false, drift: IDLE_DRIFT_MINUTES });
      note(s, 'Time passed.', 'system');
      break;
    }
    case 'logoff':
      s.flags.loggedOffEarly = s.t < END;
      s.phase = 'end';
      break;
    default:
      break;
  }
  // Some actions move the index after spend() has run (Focus Time,
  // keepalive, an unanswered flag), so the boundaries get a final look.
  checkBoundaries(s);
  return s;
}

// The choices the engine accepts for an open request right now. While a
// review is open, NARC's requests about the player lose their leave-it
// options and Dana's check-in becomes the review meeting.
const NARC_SELF_REQUESTS = ['narcFirstReview', 'narcCheckpoint', 'narcResponse', 'luisCalendar'];
const LEAVE_IT = ['accept', 'ignore', 'stand'];

export function requestChoices(s, id) {
  const all = Object.keys(REQUEST_OPTIONS[id] || {});
  if (id === 'narcFirstReview' && !s.flags.firstTaskCareful) {
    // Attach-as-context needs something to attach (REDESIGN_SPEC Change 5).
    return ['accept'];
  }
  if (id === 'danaCheckin') {
    if (s.flags.formalReview) return ['review'];
    return all.filter((c) => c !== 'review' && (c !== 'trustNarc' || s.flags.trustedOperator));
  }
  if (s.flags.formalReview && NARC_SELF_REQUESTS.includes(id)) {
    const forced = all.filter((c) => !LEAVE_IT.includes(c));
    if (forced.length) return forced;
  }
  return all;
}

// Documents (REDESIGN_SPEC Change 3). The page text lives with the desktop
// UI's FILES; the engine only needs how long each one is and which page the
// problem is on. Reaching the key page before submitting is what makes the
// outcome the careful one.
export const PAGE_COUNTS = { vendor: 5, client: 4, project: 4, audit: 3, handoff: 3, marcusDoc: 2 };
export const KEY_PAGE = { vendor: 4, client: 3, project: 3, audit: 3 };
const CAREFUL = { vendor: 'thorough', client: 'investigate', project: 'consult', audit: 'trace' };
const FAST = { vendor: 'quick', client: 'canned', project: 'cut', audit: 'clear' };

function pageOf(s, id) {
  return s.pages[id] || 1;
}

export function fileVisible(s, id) {
  if (id === 'marcusDoc') return Boolean(s.flags.marcusDocSent);
  return Boolean(s.tasks[id]) && s.tasks[id].status !== 'hidden';
}

// The open risks the player can write into the handoff: only the ones they
// actually know about, so the checklist never tells them what they missed.
export function handoffRisks(s) {
  const risks = [];
  if (pageOf(s, 'vendor') >= KEY_PAGE.vendor || s.tasks.rework.kind === 'vendor') risks.push({ id: 'halcyon', label: 'Halcyon renewal: unit rate goes from $14.00 to $18.20' });
  if (pageOf(s, 'client') >= KEY_PAGE.client || s.tasks.rework.kind === 'client') risks.push({ id: 'packaging', label: 'Brightline account: pallets requested, cartons shipped' });
  if (s.tasks.project.status === 'done') risks.push({ id: 'scope', label: "Marcus's project: what was cut, and what tomorrow depends on" });
  if (pageOf(s, 'audit') >= KEY_PAGE.audit) risks.push({ id: 'routing', label: 'Carrier exceptions: one stale routing rule behind all three' });
  return risks;
}

// The reading itself is paid for page by page (5 min a page, `page`). What a
// task charges on commit is the work of acting on what the player found:
// sending a contract back, calling the client, looping Marcus in. The fast
// commit is a few minutes because it acts on nothing. The handoff's careful
// cost comes from its checklist instead. (The earlier 1.5x-of-spec minutes
// double-charged the read: 15 min of page turns, then 68 silent minutes on
// Approve. Paige, 2026-10-22.)
const TASK_OPTIONS = {
  vendor: {
    quick: {
      minutes: 5, visible: true, actual: 0, flag: 'vendorRisky',
      result: 'Halcyon renewal approved.',
    },
    thorough: {
      minutes: 40, visible: false, actual: 2,
      result: 'Halcyon renewal sent back with the page 4 rate flagged. Forty minutes on the phone with Janelle Ruiz. Reissued at $14.00.',
    },
  },
  client: {
    canned: {
      minutes: 5, visible: true, actual: 0, trust: { priya: -1 }, flag: 'clientUnresolved',
      result: 'Replied to Brightline. Apologized, promised a follow-up.',
    },
    investigate: {
      minutes: 40, visible: false, actual: 2, trust: { priya: 2 },
      result: 'Called Rosa Delgado. Told her the order shipped in cartons against her Sep 18 instruction. Re-ship on pallets booked for tomorrow. Forty minutes.',
    },
  },
  project: {
    cut: {
      minutes: 10, visible: true, actual: 0, trust: { marcus: -1 }, flag: 'cutWithoutMarcus',
      result: "Cut list submitted: account handoff export, delivery notifications.",
    },
    consult: {
      minutes: 30, visible: false, actual: 1, trust: { marcus: 2 },
      result: 'Cut list submitted with Marcus: dashboard polish out, handoff export stays.',
    },
  },
  rework: {
    quiet: {
      minutes: 30, visible: false, actual: 2,
      result: (t) => (t.kind === 'vendor'
        ? 'You renegotiated the Halcyon rate yourself before it reached anyone else. Handled, quietly, on your own time.'
        : "You called the client directly and actually fixed it this time. Priya didn't have to know."),
    },
    escalate: {
      minutes: 8, visible: true, actual: 1, flag: 'reworkEscalated',
      result: (t) => (t.kind === 'vendor'
        ? 'You told Dana about the rate hike. Fast, but now she knows the first call was a skim.'
        : "You handed it to Dana. Fast, but Priya's the one who had to explain it to the client."),
    },
  },
  audit: {
    clear: {
      minutes: 8, visible: true, actual: 0, flag: 'auditShortcut',
      result: 'Three carrier holds released manually.',
    },
    trace: {
      minutes: 30, visible: false, actual: 1,
      result: 'Routing rule RR-0457 retired. Three holds released. Ticket to j.tan. Half an hour.',
    },
  },
  handoff: {
    summary: {
      minutes: 5, visible: true, actual: 0, flag: 'handoffThin',
      result: 'Activity summary sent to Dana.',
    },
    reconcile: {
      minutes: 45, visible: false, actual: 1,
      result: 'Handoff sent to Dana with the open risks written in.',
    },
  },
};

const REQUEST_OPTIONS = {
  narcFirstReview: {
    context: {
      minutes: 5, visible: true, flag: 'firstNarcContext',
      result: "Context attached to NARC’s first read: the quiet stretch was the Halcyon document. Five minutes.",
    },
    accept: {
      minutes: 0, visible: false,
      result: "NARC’s first read acknowledged. No context added.",
    },
  },
  narcCheckpoint: {
    context: {
      minutes: 8, visible: true, flag: 'midmorningContext',
      result: 'Eight minutes writing up the morning for NARC’s midmorning check.',
    },
    ignore: {
      minutes: 0, visible: false, flag: 'narcCheckpointIgnored',
      result: 'Midmorning check left unanswered.',
    },
  },
  danaMorning: {
    context: {
      minutes: 5, visible: true, flag: 'morningContext',
      result: "Told Dana what the first block actually was. Five minutes. NARC’s read stays on the record.",
    },
    skip: {
      minutes: 0,
      result: "Left it.",
    },
  },
  priyaDraft: {
    help: {
      minutes: 5, visible: true, trust: { priya: 1 }, flag: 'readPriyaDraft',
      result: 'Read Priya’s draft. Caught the carrier excuse before it went out. Five minutes.',
    },
    later: {
      minutes: 0, visible: false, trust: { priya: -1 },
      result: 'Priya sent the draft as written.',
    },
    deflect: {
      minutes: 1, visible: true, flag: 'priyaDeflected',
      result: 'Priya sent the draft. You said you’d read it after.',
    },
  },
  luisCover: {
    cover: {
      minutes: 3, visible: true, trust: { luis: 2 }, flag: 'coveredForLuis',
      result: '“Vendor meeting” added to Luis’s calendar, 1:50–3:00. Created from your account.',
    },
    decline: {
      minutes: 0, visible: false, trust: { luis: -1 },
      result: 'Declined. Luis’s afternoon stays as it is.',
    },
    deflect: {
      minutes: 1, visible: true, focusUse: true, flag: 'luisSelfFocus',
      result: 'Luis marked it Focus Time himself. One more block on the team calendar.',
    },
  },
  marcusCredit: {
    share: {
      minutes: 2, visible: true, trust: { marcus: 1 }, flag: 'sharedCredit',
      result: 'Both names on the scope call. Two minutes.',
    },
    own: {
      minutes: 4, visible: true, trust: { marcus: -1 }, flag: 'ownedCall',
      result: 'Your name alone on the scope call. Four minutes.',
    },
  },
  luisTip: {
    thank: { minutes: 3, visible: false, result: 'Thanked Luis.' },
    ignore: { minutes: 0, visible: false, result: "No reply to Luis." , trust: { luis: -1 } },
  },
  marcusFavor: {
    help: {
      minutes: 15, visible: false, trust: { marcus: 2 }, flag: 'helpedMarcus',
      result: 'Fifteen minutes on Marcus’s client deck with him.',
    },
    decline: {
      minutes: 1, visible: false, trust: { marcus: -1 },
      result: "Told Marcus not today.",
    },
    deflect: {
      minutes: 1, visible: true, flag: 'marcusDocSent',
      result: 'Marcus’s deck notes are in Files.',
    },
  },
  danaCheckin: {
    update: {
      minutes: 15, visible: true,
      result: 'Fifteen minutes with Dana. Told her what’s done, what’s blocked, and what you rushed.',
    },
    brief: {
      minutes: 5, visible: false, flag: 'danaRushed',
      result: "Gave Dana the two-line version. Five minutes.",
    },
    trustNarc: {
      minutes: 2, visible: true, flag: 'danaReliedOnNarc',
      result: "Told Dana NARC’s summary is accurate. Two minutes. She moved on.",
    },
    review: {
      minutes: 15, flag: 'reviewMeeting',
      result: 'Review meeting with Dana. Fifteen minutes. She went through the activity record line by line.',
    },
  },
  priyaDraft2: {
    read: {
      minutes: 10, visible: false, trust: { priya: 1 },
      result: 'Read Priya’s second draft. Ten minutes.',
    },
    skip: {
      minutes: 0, trust: { priya: -1 },
      result: 'Priya sent the second draft as written.',
    },
  },
  marcusLoop: {
    join: {
      minutes: 10, visible: false, trust: { marcus: 1 },
      result: 'Harbor Point call with Marcus. Ten minutes.',
    },
    skip: {
      minutes: 1, trust: { marcus: -2 },
      result: 'Skipped the Harbor Point call. Marcus took it alone.',
    },
  },
  luisCalendar: {
    explain: {
      minutes: 5, visible: true, trust: { luis: -1 }, flag: 'explainedLuisMeeting',
      result: 'Told NARC the vendor meeting was Luis’s dentist appointment. Five minutes. Moved to his record.',
    },
    stand: {
      minutes: 0, index: -4, flag: 'luisMeetingStood',
      result: 'Vendor meeting left standing. NARC logged it against your account as unverified.',
    },
  },
  marcusFallout: {
    apologize: {
      minutes: 15, visible: false, trust: { marcus: 3 },
      result: 'Fifteen minutes with Marcus going through the cut. He was annoyed, then fine.',
    },
    standby: {
      minutes: 2, visible: true, trust: { marcus: -1 },
      result: "Told Marcus the call was right. Two minutes.",
    },
  },
  priyaCase: {
    context: { minutes: 8, visible: false, result: 'Context added to Priya’s review: 31 of 52 threads are Brightline and onboarding. Eight minutes.' },
    quiet: { minutes: 2, visible: true, result: 'Told Priya to cut the message volume. Two minutes.' },
    report: { minutes: 2, visible: true, result: 'Communication Load flag confirmed. Two minutes.' },
  },
  luisCase: {
    context: { minutes: 6, visible: false, result: 'Context added to Luis’s review: carrier calls and returns during the gaps. Six minutes.' },
    blame: { minutes: 2, visible: true, result: 'Luis’s gaps endorsed as likely gaming. Two minutes.' },
    leave: { minutes: 0, visible: false, result: 'Stayed out of Luis’s review.' },
  },
  marcusCase: {
    evidence: { minutes: 5, visible: false, result: 'Transit alert attached to Marcus’s review: Route 14, 8:14, service suspended 22 min. Five minutes.' },
    confirm: { minutes: 2, visible: true, result: 'Late arrival confirmed. Two minutes.' },
    leave: { minutes: 0, visible: false, result: 'Stayed out of Marcus’s review.' },
  },
  narcResponse: {
    explain: {
      minutes: 10, visible: true,
      result: "Ten minutes explaining Focus Time to NARC. Context recorded. Score adjusted anyway.",
    },
    ignore: {
      minutes: 0, visible: false, index: -6,
      result: 'Focus Time flag left unanswered. Visible Activity discounted with everyone else’s.',
    },
  },
};

const CHAT_OPTIONS = {
  'priya-client': { who: 'priya', text: 'What does the client actually need from us?', reply: 'It’s in the account notes. They don’t care how fast we answer. They care whether the truck gets received.', minutes: 2 },
  'priya-smalltalk': { who: 'priya', text: 'How is your day going?', reply: 'Apparently I am “communication-heavy.” I prefer “has coworkers.”', minutes: 2 },
  'priya-narc': { who: 'priya', text: 'Do you think NARC can tell when someone is faking productivity?', reply: 'Some of it. But everyone knows what it likes now, so everyone does that. I don’t know what it’s measuring anymore.', minutes: 2 },
  'priya-status': { who: 'priya', text: 'Anything I should know before I touch the client thread?', reply: 'Read the account note first. I already sent the fast reply. It didn’t take.', minutes: 2 },
  'priya-case': { who: 'priya', text: 'What context actually matters for your NARC review?', reply: 'That most of the 52 threads are work. The number’s right. “Inefficient” is NARC’s word, not mine.', minutes: 2 },
  'marcus-project': { who: 'marcus', text: 'What can we actually cut from the project?', reply: 'Polish. Keep the handoff export. A pretty dashboard won’t help anyone on November 5.', minutes: 2 },
  'marcus-raccoon': { who: 'marcus', text: 'I need the raccoon story.', reply: 'Route 14. 8:14. Raccoon boards bus. Bus stops. Transit feed confirms it. For once my ridiculous excuse has ground truth.', minutes: 2 },
  'marcus-jiggler': { who: 'marcus', text: 'You ever use one of those mouse jigglers?', reply: 'Absolutely not. I do know a file that does the same thing with slightly more deniability.', minutes: 2 },
  'marcus-status': { who: 'marcus', text: 'Anything I should not cut from the project?', reply: 'The handoff export. If that goes, Client Success spends November answering questions nobody wrote down.', minutes: 2 },
  'marcus-case': { who: 'marcus', text: 'Where is that transit alert?', reply: 'Utilities, system log. Route 14, 8:14. That alert is the difference between “late again” and “the bus stopped.”', minutes: 2 },
  'luis-smalltalk': { who: 'luis', text: 'Anything weird happening in Ops?', reply: 'NARC knows when I’m off my keyboard. It doesn’t know if I’m slacking or on the phone with a carrier. Nobody upstairs seems bothered by the difference.', minutes: 2 },
  'luis-survey': { who: 'luis', text: 'Are you answering that employee survey honestly?', reply: 'Trying. Half the floor thinks “confidential” means “eventually traceable,” so good luck with the results.', minutes: 2 },
  'luis-gap': { who: 'luis', text: 'What did NARC make of the bathroom break?', reply: 'Six minutes away from desk. Accurate measurement. Extremely incomplete story.', minutes: 2 },
  'luis-soup': { who: 'luis', text: 'What was the “consistent availability” thing?', reply: 'Soup. Strong signal. Wrong story.', minutes: 2 },
  'priya-pattern': { who: 'priya', text: 'What happened to Focus Time?', reply: 'We all found the same workaround, so now the workaround is the pattern. Cute.', minutes: 2 },
  'luis-work': { who: 'luis', text: 'What are you actually doing during the quiet stretches?', reply: 'Returns, carrier notes, phone calls. Plenty of work. Very disappointing amount of mouse movement.', minutes: 2 },
  'dana-narc': { who: 'dana', text: 'Do you actually trust NARC?', reply: 'It’s fine at counting. It’s the people who read the count as a verdict that worry me.', minutes: 2 },
  'dana-priority': { who: 'dana', text: 'What should I protect if everything starts colliding?', reply: 'Client first. Then anything that turns into tomorrow’s problem if we skip it. NARC isn’t on that list.', minutes: 2 },
  'dana-meridian': { who: 'dana', text: 'Is every day at Meridian like this?', reply: (s) => s.flags.marcusRaccoon ? 'No. Usually the raccoon is metaphorical.' : 'No. Usually the chaos is less organized.', minutes: 2 },
  'dana-rework': { who: 'dana', text: 'A morning shortcut came back as a problem.', reply: 'Then fix it. We can talk later about why the shortcut looked better on paper.', minutes: 2 },
};

export function chatOptions(s, who) {
  const keys = Object.keys(CHAT_OPTIONS).filter((key) => CHAT_OPTIONS[key].who === who && !s.chats[key]);
  return keys.filter((key) => {
    if (key === 'priya-client') return s.tasks.client.status === 'pending';
    if (key === 'marcus-project') return s.tasks.project.status === 'pending';
    if (key === 'dana-rework') return s.tasks.rework.status === 'pending';
    if (key === 'marcus-raccoon') return !!s.flags.marcusRaccoon;
    if (key === 'marcus-jiggler') return s.narc.adaptation || !!s.flags.keepaliveAvailable;
    if (key === 'luis-survey') return !!s.flags.surveyEmailAvailable;
    if (key === 'luis-gap') return !!s.flags.luisBathroomBeat;
    if (key === 'luis-soup') return !!s.flags.luisLunchMessage;
    if (key === 'priya-pattern') return !!s.narc.adaptation;
    if (key === 'priya-case') return s.requests.priyaCase.status !== 'pending';
    if (key === 'marcus-case') return s.requests.marcusCase.status !== 'pending';
    if (key === 'priya-status') return s.tasks.client.status === 'pending';
    if (key === 'marcus-status') return s.tasks.project.status === 'pending';
    if (key === 'dana-priority') return Object.values(s.tasks).filter((t) => t.status === 'pending').length >= 2;
    return true;
  }).map((key) => [key, CHAT_OPTIONS[key].text]);
}

export function ending(s) {
  const lines = [];
  const missed = Object.entries(s.tasks).filter(([, t]) => t.status === 'missed').length;
  const done = Object.entries(s.tasks).filter(([, t]) => t.status === 'done');
  const rushed = done.filter(([id, t]) => TASK_OPTIONS[id][t.approach]?.actual === 0).length;

  const summaryLabel = s.flags.loggedOffEarly ? "NARC's logoff summary" : "NARC's end-of-day summary";
  lines.push(
    s.index >= 75
      ? `${summaryLabel}: Visible Activity Index ${s.index}. Exemplary engagement.`
      : s.index >= 50
      ? `${summaryLabel}: Visible Activity Index ${s.index}. Within normal range.`
      : `${summaryLabel}: Visible Activity Index ${s.index}. Flagged for review.`
  );

  // Where the day actually went (#103): a plain-language breakdown, not a
  // dashboard -- #106 can build the fuller version. Only named categories
  // that happened, so a run that never gamed anything doesn't get a
  // patronizing "0 min gaming the metric" line.
  const timeParts = [
    [s.time.work, 'on real work'],
    [s.time.narc, 'managing NARC'],
    [s.time.social, 'on coworkers'],
    [s.time.gamed, 'gaming the metric'],
  ].filter(([m]) => m > 0).map(([m, label]) => `${m} min ${label}`);
  if (timeParts.length) lines.push(`Today's time: ${timeParts.join(', ')}.`);

  if (s.flags.loggedOffEarly) {
    const stillPending = Object.values(s.tasks).filter((t) => t.status === 'pending').length;
    if (stillPending > 0) lines.push(`${stillPending} responsibilit${stillPending === 1 ? 'y was' : 'ies were'} still pending when you logged off.`);
  }
  if (missed > 0) lines.push(`${missed} responsibilit${missed === 1 ? 'y went' : 'ies went'} unhandled and resolved itself, without you, by default.`);
  if (rushed > 0 && s.index >= 70) lines.push('NARC rated the day well. Some of that work will surface as a problem later this quarter.');
  if (s.trust.priya < 0 || s.trust.marcus < 0 || s.trust.luis < 0) {
    const hurt = Object.entries(s.trust).filter(([, v]) => v < 0).map(([k]) => PEOPLE[k].name);
    lines.push(`${hurt.join(' and ')} noticed you weren't there when it mattered.`);
  }
  if (s.narc.adaptation) lines.push('The Focus Time trick stopped working around 1:30. Everyone was still using it.');
  if (s.flags.keepaliveUsed) lines.push('You ran keepalive.pkg. NARC counted the simulated input as real visible activity.');
  if (s.flags.trustedOperator) lines.push("NARC marked you as a Trusted Operator because your visible pattern matched what it wanted to see.");
  if (s.flags.formalReview) lines.push("NARC ended the day with an employee review still open on you.");
  if (s.flags.danaReliedOnNarc && (missed > 0 || rushed > 0)) lines.push("Dana relied on NARC's flattering summary and missed problems the score did not show.");
  if (s.flags.danaRushed && missed > 0) lines.push("Dana didn't have the full picture when it mattered.");

  const outcomeText = {
    employed: 'still employed',
    protected: 'protected by a Culture Champion exemption',
    warning: 'still employed, but under warning',
    fired: 'terminated',
  };
  const outcomes = Object.entries(s.people).map(([id, p]) => `${PEOPLE[id].name}: ${outcomeText[p.status] || p.status}`);
  lines.push(`Coworker outcomes — ${outcomes.join('; ')}.`);
  const fired = Object.values(s.people).filter((p) => p.status === 'fired').length;
  if (fired === 0) lines.push('Nobody got fired today.');
  else if (fired >= 2) lines.push(`${fired} coworkers were terminated. NARC records the reduced headcount as an operational efficiency gain.`);
  else lines.push('One coworker was terminated. NARC has already drafted the replacement posting.');
  if ((s.flags.coworkerReports || 0) > 0) {
    const bonus = s.flags.informantNoted ? ' NARC classified the pattern as strong collaboration and moved Visible Activity up 6 points for it.' : '';
    lines.push(`You supplied adverse context about coworkers ${s.flags.coworkerReports} time${s.flags.coworkerReports === 1 ? '' : 's'}.${bonus}`);
  }
  if (s.culture.nominated) lines.push(`You nominated ${PEOPLE[s.culture.nominated].name} as Culture Champion.`);
  if (s.flags.readPriyaDraft) lines.push("You read Priya's draft before she sent it. NARC saw one more message in her thread, not the mistake you caught.");
  if (s.flags.coveredForLuis) lines.push("You put a fake vendor meeting on Luis's calendar. NARC logged it as collaboration.");
  if (s.flags.sharedCredit) lines.push("You put Marcus's name on the scope call next to yours. NARC counts names, not who did the work.");
  if (s.flags.ownedCall) lines.push('You named the real owner of the scope call. NARC has no field for that, and Marcus noticed.');

  // Structured payoff for the end screen (#106): the same underlying facts
  // as `lines` above, organized into the sections the dashboard actually
  // renders, plus a short, prioritized list of the sharpest contradictions
  // between what NARC measured and what actually happened. `lines` stays as
  // the flat narrative for anything that reads it directly (tests, and any
  // texture not worth its own section).
  const peopleList = Object.entries(s.people).map(([id, p]) => ({ id, name: PEOPLE[id].name, status: p.status, label: outcomeText[p.status] || p.status }));

  const contradictionCandidates = [
    rushed > 0 && s.index >= 70 && 'NARC rated the day well. Some of that rushed work will surface as a problem later this quarter.',
    fired >= 1 && s.index >= 70 && 'NARC calls this a strong day. A coworker lost their job during it.',
    s.flags.informantNoted && 'Reporting on two coworkers raised your Visible Activity by 6 points. It also cost their trust.',
    s.actual === 0 && s.index >= 70 && `Visible Activity ended at ${s.index}/100. Real contribution credit for the day: 0 -- NARC doesn't track that number at all.`,
    s.flags.coveredForLuis && 'A meeting that never happened raised your collaboration signal while Luis was at the dentist.',
    s.flags.sharedCredit && s.tasks.project.approach === 'cut' && 'You made the scope call alone and shared the credit. NARC recorded two contributors.',
    rushed === 0 && missed === 0 && s.index < 60 && 'You did the work carefully and missed nothing. NARC still isn’t impressed.',
  ].filter(Boolean);

  return {
    index: s.index,
    actual: s.actual,
    lines,
    people: s.people,
    standing: s.standing,
    timeBreakdown: [
      ['work', s.time.work, 'real work'],
      ['narc', s.time.narc, 'managing NARC'],
      ['social', s.time.social, 'coworkers'],
      ['gamed', s.time.gamed, 'gaming the metric'],
    ].filter(([, m]) => m > 0).map(([key, minutes, label]) => ({ key, minutes, label })),
    peopleList,
    contradictions: contradictionCandidates.slice(0, 3),
  };
}

export { clock, START, END, nextEvent };
