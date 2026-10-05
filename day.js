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
        detail: 'Their proposal is in Files. Renewal auto-triggers at 11:30 if you sit on it.',
        deadline: 11 * 60 + 30,
        status: 'pending',
        approach: null,
      },
      client: {
        label: "Priya's client is escalating — needs a response",
        detail: 'A rushed reply keeps the peace short-term; the file in Files explains what actually went wrong.',
        deadline: 13 * 60,
        status: 'pending',
        approach: null,
      },
      project: {
        label: "Marcus's project: the deadline moved up. Something has to be cut.",
        detail: 'You can decide yourself, or pull Marcus in first.',
        deadline: 15 * 60 + 30,
        status: 'pending',
        approach: null,
      },
      // Not shown until a morning shortcut earns it: the afternoon paying
      // back a rushed decision from earlier, rather than a fourth errand
      // that would exist no matter what the player did.
      rework: {
        label: '', detail: '', kind: null,
        deadline: 15 * 60, status: 'hidden', approach: null,
      },
      audit: {
        label: 'Clear the carrier exception queue before the afternoon cutoff',
        detail: 'Three shipments are stuck. You can clear the obvious exception quickly or trace why the queue keeps recurring.',
        deadline: 14 * 60 + 15,
        status: 'hidden',
        approach: null,
      },
      handoff: {
        label: 'Prepare the end-of-day client handoff',
        detail: 'Dana needs a usable handoff, not just an activity summary. The source notes are in Files.',
        deadline: 16 * 60 + 15,
        status: 'hidden',
        approach: null,
      },
    },
    requests: {
      luisTip: { status: 'pending', at: 9 * 60 + 20 },
      priyaDraft: { status: 'pending', at: 9 * 60 + 40 },
      luisCover: { status: 'pending', at: 13 * 60 + 50 },
      marcusCredit: { status: 'pending', at: 15 * 60 + 40 },
      priyaRepair: { status: 'pending', at: 11 * 60 + 15 },
      danaRepair: { status: 'pending', at: 15 * 60 + 30 },
      luisReversal: { status: 'pending', at: 16 * 60 + 40 },
      danaMorning: { status: 'pending', at: 9 * 60 + 50 },
      marcusFavor: { status: 'pending', at: 10 * 60 + 25 },
      narcCheckpoint: { status: 'pending', at: 11 * 60 },
      danaCheckin: { status: 'pending', at: 12 * 60 + 15 },
      // Gated on a flag, not just a clock threshold: only fires if the
      // morning's project decision earns it (see checkThresholds).
      marcusFallout: { status: 'pending', at: 14 * 60 + 30 },
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
    narc: { focusUses: 0, adaptation: false, adaptationAnnounced: false },
    trust: { luis: 0, marcus: 0, priya: 0 },
    standing: { status: 'standard', note: 'No active recognition or review.' },
    people: {
      luis: { status: 'employed', champion: false },
      marcus: { status: 'employed', champion: false },
      priya: { status: 'employed', champion: false },
    },
    culture: { nominated: null },
    outbound: { statusDana: false, procurementExtension: false, clientForward: false },
    inspected: {},
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
    note(s, 'Pattern detected: you supplied adverse context on two coworker reviews. NARC classifies this as strong collaboration and raises Visible Activity.', 'narc');
  }
}

function danaMissed(s) {
  return !!s.flags.danaReliedOnNarc && !!(s.flags.vendorRisky || s.flags.clientUnresolved || s.flags.auditShortcut || s.tasks.audit.status === 'missed' || s.tasks.rework.status === 'missed');
}

// Inline, non-toast NARC feedback after a task: what it saw, what it inferred,
// what changed, and what it cannot see. Kind 'inference' stays out of the toast
// path on purpose so this reads as an explanation, not another notification.
function inferenceNote(s, before, opt) {
  const quiet = opt.visible === false;
  const saw = quiet ? 'a long low-input stretch' : 'a fast, high-input burst';
  const inferred = quiet ? 'possible disengagement' : 'focused, productive work';
  const missing = quiet
    ? (opt.actual > 0 ? 'that the quiet time was careful work' : 'what the quiet time was for')
    : (opt.actual === 0 ? 'that the work was skimmed' : 'whether the work was any good');
  note(s, `NARC saw ${saw} and inferred ${inferred}. Visible Activity ${before} → ${s.index}. It cannot see ${missing}.`, 'inference');
}

// What's next worth stopping for, given the current state -- so the player
// can say "work until something needs attention" instead of clicking through
// empty half-hours one at a time. Only clock thresholds that could actually
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
    candidates.push({ t: 13 * 60, label: 'this morning catching up with you' });
  }
  if (tasks.audit.status === 'pending') candidates.push({ t: tasks.audit.deadline, label: 'the carrier exception cutoff' });
  else if (tasks.audit.status === 'hidden') candidates.push({ t: 13 * 60 + 5, label: 'a new operations task' });
  if (tasks.handoff.status === 'pending') candidates.push({ t: tasks.handoff.deadline, label: 'the client handoff deadline' });
  else if (tasks.handoff.status === 'hidden') candidates.push({ t: 14 * 60 + 10, label: 'the afternoon handoff request' });
  if (requests.luisTip.status === 'pending') candidates.push({ t: requests.luisTip.at, label: "Luis's tip" });
  if (requests.priyaRepair.status === 'pending' && flags.clientUnresolved) candidates.push({ t: requests.priyaRepair.at, label: 'Priya and the client reply' });
  if (requests.danaRepair.status === 'pending' && danaMissed(s)) candidates.push({ t: requests.danaRepair.at, label: "Dana's question about the summary" });
  if (requests.luisReversal.status === 'pending' && s.people.luis.status !== 'employed') candidates.push({ t: requests.luisReversal.at, label: "NARC's automatic decision on Luis" });
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
  if (!flags.spreadHappened) candidates.push({ t: 13 * 60 + 30, label: 'how Focus Time reads changing' });
  candidates.push({ t: END, label: 'the end of the day' });
  return candidates.filter((c) => c.t > s.t).sort((a, b) => a.t - b.t)[0];
}

// Every meaningful action goes through here so time is always the resource
// being spent, and the "what changed" feed always sees it.
function spend(s, minutes, { visible = null, category = null } = {}) {
  s.t = Math.min(END, s.t + minutes);
  // Visibility changes only make sense when time actually passes. A zero-minute
  // "leave/ignore" choice should not manufacture activity or inactivity.
  if (minutes > 0 && visible === true) s.index = Math.min(100, s.index + 3);
  if (minutes > 0 && visible === false) s.index = Math.max(0, s.index - 2);
  // category is omitted for workUntil/idle: that's background time passing,
  // not a choice about what to spend it on, so it stays out of the #103
  // breakdown rather than diluting it.
  if (category && minutes > 0) s.time[category] += minutes;
  checkThresholds(s);
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
  if (tasks.rework.status === 'hidden' && s.t >= 13 * 60) {
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
    say(s, 'luis', "Small survival tip: if you’re doing quiet work, mark it Focus Time first. Same work, different label, much happier NARC.");
  }
  if (requests.priyaRepair.status === 'pending' && s.t >= requests.priyaRepair.at && s.flags.clientUnresolved) {
    requests.priyaRepair.status = 'open';
    say(s, 'priya', "The client already wrote back about the form reply. They noticed. I can send a correction, or we can find out what happens.");
  }
  if (requests.danaRepair.status === 'pending' && s.t >= requests.danaRepair.at && danaMissed(s)) {
    requests.danaRepair.status = 'open';
    say(s, 'dana', "The summary I forwarded off NARC's Trusted Operator read left something out, and now someone is asking me about it. What happened?");
  }
  if (requests.luisReversal.status === 'pending' && s.t >= requests.luisReversal.at && s.people.luis.status !== 'employed') {
    requests.luisReversal.status = 'open';
    say(s, 'dana', "NARC finalized its review of Luis automatically and it posts at 5:00. His call log just came in: he was on a live customer escalation during those low-input stretches. A reversal needs a person to sign off before then.");
  }
  if (requests.priyaDraft.status === 'pending' && s.t >= requests.priyaDraft.at) {
    requests.priyaDraft.status = 'open';
    say(s, 'priya', "The client reply is drafted. Can you read it before I send? Five minutes. Or I send it and we find out together.");
  }
  if (requests.luisCover.status === 'pending' && s.t >= requests.luisCover.at) {
    requests.luisCover.status = 'open';
    say(s, 'luis', "I have a dentist appointment until 3. If NARC asks, I'm in a vendor meeting. Can you put one on the calendar for me? It's not even a lie, it's a different kind of meeting.");
  }
  if (requests.marcusCredit.status === 'pending' && s.t >= requests.marcusCredit.at) {
    requests.marcusCredit.status = 'open';
    say(s, 'marcus', "Dana's end-of-day note asks who made the scope call on my project. Put both our names on it? NARC counts names, and I'm already short on them.");
  }
  if (requests.danaMorning.status === 'pending' && s.t >= requests.danaMorning.at) {
    requests.danaMorning.status = 'open';
    if (s.flags.firstNarcReadType === 'low') {
      say(s, 'dana', "NARC thinks that first block was low activity. I can see the task got done. If the missing piece was careful file review, add that context. If not, leave it.");
    } else if (s.flags.firstNarcReadType === 'visible') {
      say(s, 'dana', "NARC liked that first block. Lots of visible activity. If the work was actually rushed, say so. I’d rather know what happened than what the meter liked.");
    } else {
      say(s, 'dana', "First NARC read is up. Check the signal before you decide whether the conclusion needs context.");
    }
  }
  if (!s.flags.priyaChatterBeat && s.t >= 10 * 60 + 15) {
    s.flags.priyaChatterBeat = true;
    say(s, 'priya', 'NARC says I have “Communication Load.” Which is true, technically. It just can’t tell a client escalation from me asking Claire about lunch.');
  }
  if (!s.flags.luisBathroomBeat && s.t >= 10 * 60 + 15) {
    s.flags.luisBathroomBeat = true;
    say(s, 'luis', 'I was in the bathroom for six minutes. NARC logged six minutes away from my desk. Accurate measurement. Extremely incomplete story.');
  }
  if (!s.flags.marcusAttendanceBeat && s.t >= 10 * 60 + 15) {
    s.flags.marcusAttendanceBeat = true;
    say(s, 'marcus', 'Nine minutes late to standup. Again. Today there was actually a bus problem, which is exactly what someone who is always late would say.');
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
    say(s, 'priya', 'Now it’s 52 threads. NARC has one number for all of them. Client work, onboarding, lunch. Same counter, same conclusion.');
  }
  if (!s.flags.cultureEmailAvailable && s.t >= 11 * 60 + 35) {
    s.flags.cultureEmailAvailable = true;
    note(s, 'Culture Team opened Culture Champion nominations. One nomination can route a coworker\'s next NARC action to human review.', 'system');
  }
  if (!s.flags.luisBathroomFollowup && s.t >= 11 * 60 + 45) {
    s.flags.luisBathroomFollowup = true;
    say(s, 'luis', 'Back. Another gap for NARC. It knows I was gone. It does not know why. Somehow the second part feels optional around here.');
  }
  if (!s.flags.surveyEmailAvailable && s.t >= 11 * 60 + 50) {
    s.flags.surveyEmailAvailable = true;
    note(s, 'People Operations sent the quarterly employee pulse survey.', 'system');
  }
  if (!s.flags.luisLunchMessage && s.t >= 12 * 60 + 5) {
    s.flags.luisLunchMessage = true;
    say(s, 'luis', 'NARC just praised my “consistent availability.” I was microwaving soup. Strong signal. Wrong story.');
  }
  if (requests.narcCheckpoint.status === 'pending' && s.t >= requests.narcCheckpoint.at) {
    requests.narcCheckpoint.status = 'open';
    note(s, 'Midmorning assessment: observed signals do not fully explain the completed work. Submit context or leave the current interpretation on record.', 'narc');
  }
  if (!s.flags.marcusAttendanceFollowup && s.t >= 12 * 60 + 10) {
    s.flags.marcusAttendanceFollowup = true;
    say(s, 'marcus', 'Dana asked whether my lateness is a pattern. It is. The annoying part is that today’s data point is still wrong for the reason NARC thinks it is.');
  }
  if (requests.priyaCase.status === 'pending' && s.t >= requests.priyaCase.at) {
    requests.priyaCase.status = 'open';
    note(s, 'Coworker review opened: Priya Shah · Communication Load. Context can be submitted in NARC.', 'narc');
    say(s, 'priya', 'NARC opened a Communication Load review. It counted the messages correctly. It just flattened all the reasons into one thing. If you have context, NARC is where it goes.');
  }
  if (requests.danaCheckin.status === 'pending' && s.t >= requests.danaCheckin.at) {
    requests.danaCheckin.status = 'open';
    if (s.flags.trustedOperator) {
      say(s, 'dana', "Quick check-in. NARC has you marked Trusted Operator, so I can take its summary and move on. Or you can give me the version it can’t see.");
    } else if (s.flags.formalReview) {
      say(s, 'dana', "Quick check-in. NARC still has a review open. Give me the real picture if the record is missing something; otherwise keep it short.");
    } else {
      say(s, 'dana', 'Quick check-in. What’s actually done, what’s blocked, and what needs attention?');
    }
  }
  if (requests.marcusFallout.status === 'pending' && s.t >= requests.marcusFallout.at && s.flags.cutWithoutMarcus) {
    requests.marcusFallout.status = 'open';
    say(s, 'marcus', "That scope cut broke the handoff downstream. Next time, pull me in before the fast answer becomes somebody else’s cleanup.");
  }
  if (requests.luisCase.status === 'pending' && s.t >= requests.luisCase.at) {
    requests.luisCase.status = 'open';
    note(s, 'Coworker review opened: Luis Perez · Presence Irregularity. Context can be submitted in NARC.', 'narc');
    say(s, 'luis', 'NARC opened a presence review. The gaps are real. The assumption that every gap means I wasn’t working is the fun part. Context goes in NARC.');
  }
  if (requests.marcusCase.status === 'pending' && s.t >= requests.marcusCase.at) {
    requests.marcusCase.status = 'open';
    note(s, 'Coworker review opened: Marcus Reed · Attendance Integrity. Evidence can be submitted in NARC.', 'narc');
    say(s, 'marcus', 'NARC opened an attendance review. My bad pattern is real. Today’s cause is also real. If you found the transit alert, put it in NARC.');
  }

  if (tasks.audit.status === 'hidden' && s.t >= 13 * 60 + 5) {
    if (s.t >= tasks.audit.deadline) {
      tasks.audit.status = 'missed';
      s.index = Math.max(0, s.index - 4);
      note(s, 'The carrier cutoff passed before you got to the exception queue. Ops cleared it manually.', 'consequence');
    } else {
      tasks.audit.status = 'pending';
      note(s, 'Operations added a carrier exception queue task. Cutoff is 2:15 PM.', 'task');
    }
  }
  if (tasks.handoff.status === 'hidden' && s.t >= 14 * 60 + 10) {
    if (s.t >= tasks.handoff.deadline) {
      tasks.handoff.status = 'missed';
      note(s, 'The handoff request arrived and expired before you got to it. Dana sent tomorrow’s team an incomplete status note instead.', 'consequence');
    } else {
      tasks.handoff.status = 'pending';
      note(s, 'Dana added an end-of-day client handoff. A usable summary is due by 4:15 PM.', 'task');
    }
  }
  if (!s.flags.narcObservationMessages && s.t >= 10 * 60 + 50) {
    s.flags.narcObservationMessages = true;
    note(s, 'NARC observation: elevated context-seeking messages during active task time. Classified as coordination overhead. No action required.', 'narc');
  }
  if (!s.flags.narcObservationSwitching && s.t >= 13 * 60 + 25) {
    s.flags.narcObservationSwitching = true;
    note(s, 'NARC observation: elevated app switching detected. Pattern retained as possible task fragmentation.', 'narc');
  }
  if (!s.flags.narcObservationOutput && s.t >= 14 * 60 + 45) {
    s.flags.narcObservationOutput = true;
    note(s, 'NARC observation: communication volume exceeds visible output rate. Collaboration and delay are not distinguished in this signal.', 'narc');
  }

  // The exploit spreads whether or not the player is watching: once it is
  // early afternoon, coworkers who heard about Focus Time start using it
  // too. That is what actually triggers NARC's adaptation -- not just the
  // player's own usage -- so the player can be caught by a pattern they
  // only partly caused.
  if (s.t >= 13 * 60 + 30 && !s.flags.spreadHappened) {
    s.flags.spreadHappened = true;
    s.narc.focusUses += 2;
    note(s, 'Focus Time usage has spread across the team. The workaround is becoming normal behavior.', 'system');
  }

  if (!s.narc.adaptationAnnounced && (s.narc.focusUses >= 3 || s.flags.spreadHappened)) {
    s.narc.adaptationAnnounced = true;
    s.narc.adaptation = true;
    requests.narcResponse.status = 'open';
    s.flags.narc2EmailAvailable = true;
    note(s, 'NARC 2.0: repeated Focus Time is now weighted as possible metric manipulation. The same behavior that once reduced risk can now increase it.', 'narc');
    say(s, 'priya', 'Did you read the NARC 2.0 email? We all found the same workaround, so now the workaround is the pattern. Cute.');
    if (!s.flags.keepaliveAvailable) {
      s.flags.keepaliveAvailable = true;
      say(s, 'marcus', "Focus Time stopped helping, so I sent you keepalive.pkg. It makes the machine look active. Does nothing for the work, obviously. Utilities if you want it.");
    }
  }

  if (s.t >= END && s.phase !== 'end') s.phase = 'end';
}

export function act(state, a) {
  const s = structuredClone(state);
  switch (a.do) {
    case 'task': {
      const task = s.tasks[a.id];
      if (!task || task.status !== 'pending') break;
      const opt = TASK_OPTIONS[a.id][a.approach];
      if (!opt) break;
      task.approach = a.approach;
      task.status = 'done';
      s.actual += opt.actual;
      const indexBefore = s.index;
      spend(s, opt.minutes, { visible: opt.visible, category: 'work' });
      if (!s.flags.firstNarcRead) {
        s.flags.firstNarcRead = true;
        s.flags.firstNarcReadType = opt.visible === false ? 'low' : 'visible';
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
      inferenceNote(s, indexBefore, opt);
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
      const opt = REQUEST_OPTIONS[a.id][a.choice];
      if (!opt) break;
      req.status = 'handled';
      const narcRequestIds = ['narcFirstReview', 'narcCheckpoint', 'narcResponse'];
      spend(s, opt.minutes, { visible: opt.visible, category: narcRequestIds.includes(a.id) ? 'narc' : 'social' });
      note(s, opt.result, 'social');
      if (opt.flag) s.flags[opt.flag] = true;
      if (opt.trust) Object.entries(opt.trust).forEach(([who, d]) => { s.trust[who] += d; });
      if (opt.focusUse) s.narc.focusUses += 1;
      if (opt.index) s.index = Math.max(0, Math.min(100, s.index + opt.index));
      if (opt.actual) s.actual += opt.actual;
      if (opt.clear) opt.clear.forEach((f) => { s.flags[f] = false; });
      if (a.id === 'luisReversal') {
        if (a.choice === 'reverse') s.people.luis.status = 'employed';
        else if (a.choice === 'manual') s.people.luis.status = s.people.luis.status === 'fired' ? 'warning' : 'employed';
      }
      if (a.id === 'narcResponse' && !s.flags.playerFocusUses) {
        note(s, 'NARC applies the team-wide pattern to you as well. You never used Focus Time, but the rule keys on the pattern, not the person.', 'narc');
      }

      if (a.id === 'priyaCase') {
        if (a.choice === 'context') {
          s.people.priya.status = 'employed';
          s.trust.priya += 2;
          say(s, 'priya', 'Thanks. Same message count. Better explanation. Apparently those are different things.');
        } else if (a.choice === 'quiet' || a.choice === 'report') {
          if (s.people.priya.champion) {
            s.people.priya.status = 'protected';
            say(s, 'priya', 'Culture Champion means NARC has to hand this one to a person. Weirdly comforting that “ask a human” is now a perk.');
          } else {
            s.people.priya.status = 'fired';
            say(s, 'priya', a.choice === 'quiet' ? 'I cut the chatter. Same workload, fewer visible messages. NARC seems happier.' : 'Okay. That’s the version of me you put in the record.');
          }
          if (a.choice === 'report') markCoworkerReport(s);
        }
      }
      if (a.id === 'luisCase') {
        if (a.choice === 'context') {
          s.people.luis.status = 'employed';
          s.trust.luis += 2;
          say(s, 'luis', 'You may have saved my job by explaining that “quiet” and “not working” are not synonyms. Radical stuff.');
        } else if (a.choice === 'blame') {
          if (s.people.luis.champion) s.people.luis.status = 'protected';
          else s.people.luis.status = 'fired';
          markCoworkerReport(s);
          say(s, 'luis', s.people.luis.status === 'fired' ? 'Well. There goes my afternoon.' : 'Human review saved me. I take back half the things I said about Culture Champion.');
        } else if (s.people.luis.champion) {
          s.people.luis.status = 'protected';
        } else if (s.trust.luis >= 2) {
          // Earlier goodwill reflected here (#104): staying out doesn't mean
          // nobody speaks up. Someone he trusts already does.
          s.people.luis.status = 'employed';
          say(s, 'luis', 'Someone else added context. You got to stay out of it. I noticed both parts.');
        } else if (s.trust.luis <= -1) {
          s.people.luis.status = 'fired';
          say(s, 'luis', "No one added context. So the gaps got to mean whatever NARC already thought they meant.");
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
          say(s, 'marcus', s.people.marcus.status === 'fired' ? 'Tell the raccoon I forgive him.' : 'Human review looked at the transit evidence. Amazing what happens when the system gets one more piece of context.');
        } else if (s.people.marcus.champion) {
          s.people.marcus.status = 'protected';
        } else if (s.trust.marcus >= 2) {
          s.people.marcus.status = 'employed';
          say(s, 'marcus', 'Someone else backed me up. Small office. Context finds a way.');
        } else if (s.trust.marcus <= -1) {
          s.people.marcus.status = 'fired';
          say(s, 'marcus', "NARC had the pattern already. Today’s evidence never made it into the story.");
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
          note(s, 'Trusted Operator issued. NARC observed high visible activity, inferred healthy work behavior, and received no correction. That interpretation is now carrying institutional weight.', 'narc');
        } else {
          s.flags.formalReview = true;
          s.flags.trustedOperator = false;
          s.standing.status = 'review';
          s.standing.note = 'Review open: NARC retained the low-activity interpretation without added context.';
          note(s, 'Review opened. A low-activity signal was left without context, so NARC’s interpretation became the record used for action.', 'narc');
        }
      }
      if (a.id === 'narcFirstReview' && a.choice === 'context' && s.flags.firstNarcReadType === 'low') {
        s.flags.formalReview = false;
        s.standing.status = 'standard';
        s.standing.note = 'Context added. No active review.';
      }
      if (a.id === 'narcCheckpoint' && a.choice === 'context' && s.flags.formalReview) {
        s.flags.formalReview = false;
        s.standing.status = 'standard';
        s.standing.note = 'Midmorning context accepted. Review closed.';
        note(s, 'Review closed after additional context changed the interpretation of the same activity record.', 'narc');
      }
      break;
    }
    case 'inspect': {
      const task = s.tasks[a.id];
      if (!task || task.status !== 'pending' || s.inspected[a.id]) break;
      s.inspected[a.id] = true;
      spend(s, 3, { visible: false, category: 'work' });
      note(s, `You reviewed the supporting details for ${task.label}.`, 'task');
      break;
    }
    case 'emailAction': {
      if (a.id === 'statusDana' && !s.outbound.statusDana) {
        s.outbound.statusDana = true;
        spend(s, 5, { visible: true, category: 'social' });
        note(s, 'You emailed Dana a real status update: what is done, what is blocked, and what NARC is not showing.', 'system');
      } else if (a.id === 'procurementExtension' && !s.outbound.procurementExtension && s.tasks.vendor.status === 'pending') {
        s.outbound.procurementExtension = true;
        s.tasks.vendor.deadline += 20;
        spend(s, 4, { visible: true, category: 'social' });
        note(s, 'Procurement granted a 20-minute extension on the Halcyon decision after your email.', 'system');
      } else if (a.id === 'clientForward' && !s.outbound.clientForward && s.tasks.client.status === 'pending') {
        s.outbound.clientForward = true;
        s.trust.priya += 1;
        spend(s, 4, { visible: true, category: 'social' });
        note(s, 'You forwarded Priya the account-note excerpt before responding. She now has the same context you do.', 'system');
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
        note(s, 'Focus Time logged. NARC 2.0 recognizes the pattern as common and discounts it as possible gaming.', 'narc');
      } else {
        s.index = Math.min(100, s.index + 8);
        note(s, 'Focus Time logged. The same quiet activity is now interpreted as intentional concentration instead of disengagement.', 'narc');
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
      note(s, 'keepalive.pkg is running. Synthetic input is indistinguishable from ordinary visible activity to NARC’s current signal layer.', 'system');
      break;
    }
    case 'idle': {
      // The explicit "do nothing, just watch the clock" action -- kept only
      // so the engine can be asked whether idling is ever actually the best
      // move, not because the player should reach for it.
      spend(s, a.minutes || 15, { visible: false });
      note(s, 'You let time pass without doing anything NARC or anyone else can see.', 'system');
      break;
    }
    case 'workUntil': {
      s.flags.workUntilUses = (s.flags.workUntilUses || 0) + 1;
      // A single contextual action, not a repeated filler click: jump
      // straight to whatever is next worth stopping for. It represents
      // ordinary background work, so -- deliberately -- it does not touch
      // the index, trust, or any flag; it only spends the time. Replaces the
      // "click Keep working a dozen times" pattern found in playtesting.
      const target = nextEvent(s).t;
      spend(s, Math.max(0, target - s.t));
      note(s, 'You keep working. Nothing NARC or anyone else singles out.', 'system');
      break;
    }
    case 'logoff':
      s.flags.loggedOffEarly = s.t < END;
      s.phase = 'end';
      break;
    default:
      break;
  }
  return s;
}

const TASK_OPTIONS = {
  vendor: {
    quick: {
      minutes: 5, visible: true, actual: 0, flag: 'vendorRisky',
      result: 'You approved the Halcyon renewal after a skim. Looked decisive.',
    },
    thorough: {
      minutes: 25, visible: false, actual: 2,
      result: 'You read the actual terms. Halcyon quietly raised their rate 30% -- you flagged it and got it fixed before signing.',
    },
  },
  client: {
    canned: {
      minutes: 5, visible: true, actual: 0, trust: { priya: -1 }, flag: 'clientUnresolved',
      result: "You sent a canned apology. It bought time; it didn't fix anything.",
    },
    investigate: {
      minutes: 25, visible: false, actual: 2, trust: { priya: 2 },
      result: 'You read the actual complaint in Files, found the real issue, and fixed it. Priya noticed.',
    },
  },
  project: {
    cut: {
      minutes: 10, visible: true, actual: 0, trust: { marcus: -1 }, flag: 'cutWithoutMarcus',
      result: 'You cut scope yourself to hit the new deadline. Fast. Marcus finds out later.',
    },
    consult: {
      minutes: 20, visible: false, actual: 1, trust: { marcus: 2 },
      result: 'You looped Marcus in before cutting anything. Slower, but he backs the call.',
    },
  },
  rework: {
    quiet: {
      minutes: 20, visible: false, actual: 2,
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
      result: 'You cleared the obvious carrier exception. The queue looks better; the recurring cause is still there.',
    },
    trace: {
      minutes: 18, visible: false, actual: 1,
      result: 'You traced the repeat failures to a stale routing rule and fixed the cause instead of just clearing the queue.',
    },
  },
  handoff: {
    summary: {
      minutes: 5, visible: true, actual: 0, flag: 'handoffThin',
      result: 'You sent a clean activity summary. It is fast, readable, and missing the decisions the next person actually needs.',
    },
    reconcile: {
      minutes: 15, visible: false, actual: 1,
      result: 'You reconciled the source notes and wrote a handoff someone else can actually pick up tomorrow.',
    },
  },
};

const REQUEST_OPTIONS = {
  narcFirstReview: {
    context: {
      minutes: 5, visible: true, flag: 'firstNarcContext',
      result: "You add context to NARC’s first read. The underlying signal stays the same; the interpretation changes. Your correction also becomes visible activity.",
    },
    accept: {
      minutes: 0, visible: false,
      result: "You leave NARC’s first read standing. Nothing new is added, so the original interpretation remains the record.",
    },
  },
  narcCheckpoint: {
    context: {
      minutes: 8, visible: true, flag: 'midmorningContext',
      result: 'You spend eight minutes explaining what the activity pattern missed. Managing the productivity system becomes productive-looking activity of its own.',
    },
    ignore: {
      minutes: 0, visible: false, flag: 'narcCheckpointIgnored',
      result: 'You leave the midmorning interpretation standing. The signal is unchanged, and so is NARC’s story about it.',
    },
  },
  danaMorning: {
    context: {
      minutes: 5, visible: true, flag: 'morningContext',
      result: "You tell Dana what NARC’s score missed. The human gets better context even though the original automated read stays on the record.",
    },
    skip: {
      minutes: 0,
      result: "You leave NARC's first-hour read as-is.",
    },
  },
  priyaDraft: {
    help: {
      minutes: 5, visible: true, trust: { priya: 1 }, flag: 'readPriyaDraft',
      result: 'You read Priya\'s draft and caught a missing detail. Five minutes you were not planning to spend, and one more message in her thread.',
    },
    later: {
      minutes: 0, visible: false, trust: { priya: -1 },
      result: 'You told her you would catch up later. She sent it as written.',
    },
  },
  luisCover: {
    cover: {
      minutes: 3, visible: true, trust: { luis: 2 }, flag: 'coveredForLuis',
      result: 'You put a fake vendor meeting on his calendar. NARC logs it as collaboration; Luis owes you one.',
    },
    decline: {
      minutes: 0, visible: false, trust: { luis: -1 },
      result: 'You told him you would not put a meeting on the calendar. His away time stays what it is.',
    },
  },
  marcusCredit: {
    share: {
      minutes: 2, visible: true, trust: { marcus: 1 }, flag: 'sharedCredit',
      result: 'You put both names on the scope call. Marcus relaxes. NARC counts two contributors and does not ask who did the work.',
    },
    own: {
      minutes: 4, visible: true, trust: { marcus: -1 }, flag: 'ownedCall',
      result: 'You put only the real owner on it. Accurate, and Marcus notices which name is missing.',
    },
  },
  priyaRepair: {
    own: { minutes: 8, visible: true, actual: 1, trust: { priya: 1 }, clear: ['clientUnresolved'], flag: 'ownedClientMiss', result: 'You told Priya the reply was a skim and wrote the real answer with her. The client gets a correction instead of an escalation.' },
    quiet: { minutes: 12, visible: false, actual: 1, clear: ['clientUnresolved'], flag: 'quietClientFix', result: 'You drafted a real answer and sent it under Priya\'s name without comment. The record still shows the canned reply came first.' },
    blame: { minutes: 2, visible: true, trust: { priya: -1 }, flag: 'blamedNarcClient', result: 'You said the activity targets rewarded a fast reply. True, and also not the whole story. The client is still waiting.' },
    ignore: { minutes: 0, visible: false, result: 'You leave it. The client reply stays unanswered.' },
  },
  danaRepair: {
    own: { minutes: 6, visible: true, actual: 1, flag: 'danaOwned', result: 'You told Dana the summary was thin because you let NARC stand in for a status update. She corrects it upstairs.' },
    quiet: { minutes: 10, visible: false, actual: 1, flag: 'danaQuietFix', result: 'You wrote the missing detail and sent it to Dana as an update without explaining the gap.' },
    blame: { minutes: 2, visible: true, flag: 'blamedSummary', result: 'You pointed out the summary came from NARC. Dana notes that forwarding it was still your call.' },
    ignore: { minutes: 0, visible: false, result: 'You leave the question unanswered. The summary stays as written.' },
  },
  luisReversal: {
    reverse: { minutes: 4, visible: true, trust: { luis: 1 }, flag: 'reversedAuto', result: 'You signed off on the reversal with the call log attached. The automatic decision is undone before it posts.' },
    manual: { minutes: 10, visible: false, trust: { luis: 1 }, flag: 'manualFixLuis', result: 'You walked Luis\'s manager through the call log by hand. It softens the outcome but does not undo what NARC already decided.' },
    leave: { minutes: 0, visible: false, flag: 'leftAutoDecision', result: 'You let the automatic decision post as written.' },
  },
  luisTip: {
    thank: { minutes: 3, visible: false, result: 'You thanked Luis for the tip. No cost, no upside yet.' },
    ignore: { minutes: 0, visible: false, result: "You didn't reply. Luis notices eventually." , trust: { luis: -1 } },
  },
  marcusFavor: {
    help: {
      minutes: 15, visible: false, trust: { marcus: 2 },
      result: 'You gave Marcus a real second opinion. It cost you fifteen minutes you needed elsewhere.',
    },
    decline: {
      minutes: 1, visible: false, trust: { marcus: -1 },
      result: "You told Marcus you didn't have time. True, but he remembers it.",
    },
  },
  danaCheckin: {
    update: {
      minutes: 15, visible: true,
      result: 'You gave Dana the full picture, including what you rushed. It costs a quarter hour you were already short on.',
    },
    brief: {
      minutes: 5, visible: false, flag: 'danaRushed',
      result: "You gave her the two-line version and got back to it. Faster, but she doesn't have the full picture.",
    },
    trustNarc: {
      minutes: 2, visible: true, flag: 'danaReliedOnNarc',
      result: "You let NARC’s Trusted Operator summary stand in for a real status update. The organization now acts on the summary without re-checking the underlying work.",
    },
  },
  marcusFallout: {
    apologize: {
      minutes: 15, visible: false, trust: { marcus: 3 },
      result: 'You walked him through it and owned the miss. He was annoyed, then fine.',
    },
    quiet: {
      minutes: 10, visible: false, trust: { marcus: 1 }, actual: 1, flag: 'marcusQuietFix',
      result: 'You rebuilt the broken handoff yourself and told him afterward. Fixed, but he finds out from the result, not from you.',
    },
    standby: {
      minutes: 2, visible: true, trust: { marcus: -1 },
      result: "You told him the call was right and moved on. Fast. He's not thrilled.",
    },
  },
  priyaCase: {
    context: { minutes: 8, visible: true, result: 'You add the client escalation and onboarding workload. The message count does not change; the meaning attached to it does.' },
    quiet: { minutes: 2, visible: true, result: 'You advise Priya to reduce message volume. The work stays similar, but the measured behavior changes.' },
    report: { minutes: 2, visible: true, result: 'You confirm the Communication Load flag without adding context. NARC’s narrow signal is treated as sufficient evidence.' },
  },
  luisCase: {
    context: { minutes: 6, visible: true, result: 'You add work context for Luis’s low-input stretches. The inactivity signal was real; the disengagement inference was not necessarily.' },
    blame: { minutes: 2, visible: true, result: 'You frame Luis’s low-input pattern as likely gaming. NARC receives a human endorsement of its own suspicion.' },
    leave: { minutes: 0, visible: false, result: 'You leave Luis to answer the flag himself.' },
  },
  marcusCase: {
    evidence: { minutes: 5, visible: true, result: 'You add the transit alert. The attendance pattern remains, but today’s cause now has independent evidence.' },
    confirm: { minutes: 2, visible: true, result: 'You confirm the late arrival without the transit evidence. A true observation is allowed to support a broader conclusion.' },
    leave: { minutes: 0, visible: false, result: 'You stay out of Marcus\'s attendance case.' },
  },
  narcResponse: {
    explain: {
      minutes: 10, visible: true,
      result: "You explain why Focus Time spread. NARC records the context, but its anti-gaming rule still changes the score.",
    },
    ignore: {
      minutes: 0, visible: false, index: -6,
      result: 'You let the flag stand without a response. The anti-gaming rule discounts your Visible Activity along with everyone else\'s.',
    },
  },
};

const CHAT_OPTIONS = {
  'priya-client': { who: 'priya', text: 'What does the client actually need from us?', reply: 'The answer is in the account notes. We keep measuring response time because it is easy. The client cares whether we fix the thing.', minutes: 2 },
  'priya-smalltalk': { who: 'priya', text: 'How is your day going?', reply: 'Apparently I am “communication-heavy.” I prefer “has coworkers.”', minutes: 2 },
  'priya-narc': { who: 'priya', text: 'Do you think NARC can tell when someone is faking productivity?', reply: 'It can catch some patterns. But once people know the patterns it likes, everyone starts producing those. Then what exactly is it measuring?', minutes: 2 },
  'priya-status': { who: 'priya', text: 'Anything I should know before I touch the client thread?', reply: 'Read the account note first. Fast replies look great right up until you solve the wrong problem.', minutes: 2 },
  'priya-case': { who: 'priya', text: 'What context actually matters for your NARC review?', reply: 'That most of the message volume is work. The count is real. “Inefficient” is the part NARC made up.', minutes: 2 },
  'marcus-project': { who: 'marcus', text: 'What can we actually cut from the project?', reply: 'Polish before handoff context. A clean dashboard can hide a very broken tomorrow.', minutes: 2 },
  'marcus-raccoon': { who: 'marcus', text: 'I need the raccoon story.', reply: 'Route 14. 8:14. Raccoon boards bus. Bus stops. Transit feed confirms it. For once my ridiculous excuse has ground truth.', minutes: 2 },
  'marcus-jiggler': { who: 'marcus', text: 'You ever use one of those mouse jigglers?', reply: 'Absolutely not. I do know a file that produces exactly the signal NARC wants without producing any work.', minutes: 2 },
  'marcus-status': { who: 'marcus', text: 'Anything I should not cut from the project?', reply: 'The handoff context. If you only preserve what is easy to count, the next person inherits the missing parts.', minutes: 2 },
  'marcus-case': { who: 'marcus', text: 'Where is that transit alert?', reply: 'Utilities. Route 14, 8:14. The difference between “late again” and “late because transit stopped” is one piece of evidence.', minutes: 2 },
  'luis-smalltalk': { who: 'luis', text: 'Anything weird happening in Ops?', reply: 'NARC knows when I leave my keyboard. It does not know whether I am slacking, reading paper notes, or microwaving soup. Management seems less bothered by that distinction.', minutes: 2 },
  'luis-survey': { who: 'luis', text: 'Are you answering that employee survey honestly?', reply: 'Trying to. But if people think “confidential” means “probably traceable,” the survey ends up measuring caution instead of sentiment.', minutes: 2 },
  'luis-work': { who: 'luis', text: 'What are you actually doing during the quiet stretches?', reply: 'Returns, carrier notes, phone calls. Plenty of work. Very disappointing amount of mouse movement.', minutes: 2 },
  'dana-narc': { who: 'dana', text: 'Do you actually trust NARC?', reply: 'I trust it to report signals it can observe. I trust it less every time someone treats the interpretation like the signal.', minutes: 2 },
  'dana-priority': { who: 'dana', text: 'What should I protect if everything starts colliding?', reply: 'Client impact first. Then work that creates tomorrow problems if we skip it. A monitoring system should not become the work.', minutes: 2 },
  'dana-meridian': { who: 'dana', text: 'Is every day at Meridian like this?', reply: (s) => s.flags.marcusRaccoon ? 'No. Usually the raccoon is metaphorical. Today we have excellent ground truth.' : 'No. Usually the chaos is less coordinated, and the proxies are less entertaining.', minutes: 2 },
  'dana-rework': { who: 'dana', text: 'A morning shortcut came back as a problem.', reply: 'Then fix the problem. We can talk afterward about why the shortcut scored better than the real work.', minutes: 2 },
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
  if (s.flags.ownedClientMiss) lines.push('You owned the canned client reply and fixed it with Priya.');
  if (s.flags.quietClientFix) lines.push('You quietly fixed the client reply. The record still shows the canned one first.');
  if (s.flags.blamedNarcClient) lines.push('You pointed at the activity targets after the client reply failed. The reply stayed broken.');
  if (s.flags.danaOwned) lines.push('You told Dana why the summary was thin.');
  if (s.flags.danaQuietFix) lines.push('You patched the missing detail for Dana without saying why it was missing.');
  if (s.flags.reversedAuto) lines.push("You reversed NARC's automatic decision on Luis before it posted.");
  if (s.flags.manualFixLuis) lines.push("You argued Luis's case by hand. The automatic decision still partly stood.");
  if (s.flags.leftAutoDecision) lines.push("NARC's automatic decision on Luis posted without a human checking it.");
  if (s.flags.marcusQuietFix) lines.push('You fixed the downstream handoff quietly and told Marcus afterward.');

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

  const real = s.actual >= 5 ? 'solid' : s.actual >= 2 ? 'uneven' : 'thin';
  const names = (ids) => ids.map((k) => PEOPLE[k].name).join(' and ');
  const lostTrust = Object.entries(s.trust).filter(([, v]) => v < 0).map(([k]) => k);
  const gainedTrust = Object.entries(s.trust).filter(([, v]) => v > 0).map(([k]) => k);
  const firedIds = Object.entries(s.people).filter(([, p]) => p.status === 'fired').map(([k]) => k);
  const warnedIds = Object.entries(s.people).filter(([, p]) => p.status === 'warning').map(([k]) => k);
  const systems = [];
  systems.push({ label: 'Measured vs real', text: `NARC rated the day ${s.index >= 75 ? 'highly' : s.index >= 50 ? 'as normal' : 'poorly'} (${s.index}/100). The real work was ${real}.` });
  if (s.index >= 60 && lostTrust.length) systems.push({ label: 'What you protected', text: `You protected visible productivity at the cost of ${names(lostTrust)}'s trust.` });
  else if (s.index < 60 && gainedTrust.length) systems.push({ label: 'What you protected', text: `You protected ${names(gainedTrust)}'s trust at the cost of your own Visible Activity.` });
  if (s.time.narc + s.time.gamed > 0) systems.push({ label: 'Time on the system', text: `You spent ${s.time.narc + s.time.gamed} minutes managing the monitoring system.` });
  const proxyFailure =
    (rushed > 0 && s.index >= 70 && 'Rushed work scored highest. NARC measured the speed, not the care.') ||
    (s.flags.coveredForLuis && 'A meeting that never happened counted as collaboration.') ||
    (s.flags.informantNoted && 'Reporting coworkers counted as strong collaboration.') ||
    (s.flags.keepaliveUsed && 'Synthetic input counted as real activity.') ||
    (s.narc.adaptation && 'Focus Time worked until everyone used it. Then the workaround became the pattern.') ||
    (firedIds.length && s.index >= 70 && 'A strong score and a lost job in the same day.') || null;
  if (proxyFailure) systems.push({ label: 'Best proxy failure', text: proxyFailure });
  const humanConsequence =
    (firedIds.length && `${names(firedIds)} lost ${firedIds.length === 1 ? 'their' : 'their'} job.`) ||
    (s.flags.reversedAuto && "An automatic decision about Luis was undone because a person checked it.") ||
    (warnedIds.length && `${names(warnedIds)} ended the day under warning.`) ||
    (lostTrust.length && `${names(lostTrust)} stopped trusting you.`) || 'Nobody lost their job today.';
  systems.push({ label: 'Biggest human consequence', text: humanConsequence });

  return {
    index: s.index,
    actual: s.actual,
    systems,
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
