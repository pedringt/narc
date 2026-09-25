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
    flags: {}, // small named facts consequences key off later
    log: [
      { t: START, kind: 'system', text: 'You log in. Three things are already on your plate.' },
      { t: START, kind: 'narc', text: 'Monitoring active. Baseline Visible Activity Index: 61. Workstation signals are being assessed.' },
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
    },
    requests: {
      luisTip: { status: 'pending', at: 9 * 60 + 20 },
      danaMorning: { status: 'pending', at: 10 * 60 + 15 },
      marcusFavor: { status: 'pending', at: 10 * 60 + 45 },
      narcCheckpoint: { status: 'pending', at: 11 * 60 + 20 },
      danaCheckin: { status: 'pending', at: 12 * 60 + 15 },
      // Gated on a flag, not just a clock threshold: only fires if the
      // morning's project decision earns it (see checkThresholds).
      marcusFallout: { status: 'pending', at: 14 * 60 + 30 },
      // Opened programmatically the moment NARC adapts, not on a timer --
      // this is what makes the adaptation an actual decision rather than a
      // line of text the player just reads.
      narcFirstReview: { status: 'pending', at: null },
      narcResponse: { status: 'pending', at: null },
    },
    calendar: [],
    narc: { focusUses: 0, adaptation: false, adaptationAnnounced: false },
    trust: { luis: 0, marcus: 0, priya: 0 },
    standing: { status: 'standard', note: 'No active recognition or review.' },
    threads: { luis: [], marcus: [], priya: [], dana: [] },
  };
}

function say(s, thread, text) {
  s.threads[thread].push({ t: s.t, text });
  s.log.push({ t: s.t, kind: 'message', who: thread, text });
}

function note(s, text, kind = 'narc') {
  s.log.push({ t: s.t, kind, text });
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
  if (requests.luisTip.status === 'pending') candidates.push({ t: requests.luisTip.at, label: "Luis's tip" });
  if (requests.danaMorning.status === 'pending') candidates.push({ t: requests.danaMorning.at, label: "Dana's first-hour check" });
  if (requests.marcusFavor.status === 'pending') candidates.push({ t: requests.marcusFavor.at, label: "Marcus's favor" });
  if (requests.narcCheckpoint.status === 'pending') candidates.push({ t: requests.narcCheckpoint.at, label: "NARC's midmorning check" });
  if (requests.danaCheckin.status === 'pending') candidates.push({ t: requests.danaCheckin.at, label: "Dana's check-in" });
  if (requests.marcusFallout.status === 'pending' && flags.cutWithoutMarcus) {
    candidates.push({ t: requests.marcusFallout.at, label: 'Marcus finding out' });
  }
  if (!flags.spreadHappened) candidates.push({ t: 13 * 60 + 30, label: 'how Focus Time reads changing' });
  candidates.push({ t: END, label: 'the end of the day' });
  return candidates.filter((c) => c.t > s.t).sort((a, b) => a.t - b.t)[0];
}

// Every meaningful action goes through here so time is always the resource
// being spent, and the "what changed" feed always sees it.
function spend(s, minutes, { visible = null } = {}) {
  s.t = Math.min(END, s.t + minutes);
  if (visible === true) s.index = Math.min(100, s.index + 3);
  if (visible === false) s.index = Math.max(0, s.index - 2);
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
    s.trust.marcus -= 1;
    note(s, 'Marcus made the cut himself, guessing at what you would have picked.', 'consequence');
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

  if (requests.luisTip.status === 'pending' && s.t >= requests.luisTip.at) {
    requests.luisTip.status = 'open';
    say(s, 'luis', "Hey -- if NARC flags you for going quiet, block the time as Focus Time on Calendar first. Worked for me.");
  }
  if (requests.danaMorning.status === 'pending' && s.t >= requests.danaMorning.at) {
    requests.danaMorning.status = 'open';
    if (s.flags.firstNarcReadType === 'low') {
      say(s, 'dana', "NARC marked your first work block as low activity even though you completed the task. If that was careful file review, tell me that directly; otherwise leave the read as-is.");
    } else if (s.flags.firstNarcReadType === 'visible') {
      say(s, 'dana', "NARC rewarded the visible activity from your first task. If that score is hiding rushed work, tell me that directly; otherwise leave the read as-is.");
    } else {
      say(s, 'dana', "NARC's first-hour read is live. Check what it actually recorded before deciding whether it needs context.");
    }
  }
  if (requests.marcusFavor.status === 'pending' && s.t >= requests.marcusFavor.at) {
    requests.marcusFavor.status = 'open';
    say(s, 'marcus', 'Got five minutes? I want a second opinion before I send something to a client.');
  }
  if (requests.narcCheckpoint.status === 'pending' && s.t >= requests.narcCheckpoint.at) {
    requests.narcCheckpoint.status = 'open';
    note(s, 'Midmorning pattern check: mixed work signals detected. Add context to the record or leave the automated interpretation standing.', 'narc');
  }
  if (requests.danaCheckin.status === 'pending' && s.t >= requests.danaCheckin.at) {
    requests.danaCheckin.status = 'open';
    if (s.flags.trustedOperator) {
      say(s, 'dana', "Quick check-in. NARC has you marked as a Trusted Operator, so I can use its summary if you want to keep this short. Or give me the real picture.");
    } else if (s.flags.formalReview) {
      say(s, 'dana', "Quick check-in. NARC still has a review open on you. Give me the real picture, or keep it brief and get back to work.");
    } else {
      say(s, 'dana', 'Quick check-in: where are we with everything on your plate?');
    }
  }
  if (requests.marcusFallout.status === 'pending' && s.t >= requests.marcusFallout.at && s.flags.cutWithoutMarcus) {
    requests.marcusFallout.status = 'open';
    say(s, 'marcus', "The cut you made without me broke something downstream. I need to know you'll loop me in next time.");
  }

  // The exploit spreads whether or not the player is watching: once it is
  // early afternoon, coworkers who heard about Focus Time start using it
  // too. That is what actually triggers NARC's adaptation -- not just the
  // player's own usage -- so the player can be caught by a pattern they
  // only partly caused.
  if (s.t >= 13 * 60 + 30 && !s.flags.spreadHappened) {
    s.flags.spreadHappened = true;
    s.narc.focusUses += 2;
    note(s, 'Luis and Marcus have both started marking blocks as Focus Time this week. It caught on.', 'system');
  }

  if (!s.narc.adaptationAnnounced && s.narc.focusUses >= 3) {
    s.narc.adaptationAnnounced = true;
    s.narc.adaptation = true;
    requests.narcResponse.status = 'open';
    note(s, 'NARC 2.0: recent, frequent Focus Time markings are now weighted as possible gaming rather than protection. It wants a response.', 'narc');
    if (!s.flags.keepaliveAvailable) {
      s.flags.keepaliveAvailable = true;
      say(s, 'marcus', "Looks like Focus Time got nerfed. I sent you keepalive.pkg. It just nudges the machine so you don't look idle. Utilities if you want it.");
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
      spend(s, opt.minutes, { visible: opt.visible });
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
      spend(s, opt.minutes, { visible: opt.visible });
      note(s, opt.result, 'social');
      if (opt.flag) s.flags[opt.flag] = true;
      if (opt.trust) Object.entries(opt.trust).forEach(([who, d]) => { s.trust[who] += d; });
      if (opt.focusUse) s.narc.focusUses += 1;

      if (a.id === 'narcFirstReview' && a.choice === 'accept') {
        if (s.flags.firstNarcReadType === 'visible') {
          s.flags.trustedOperator = true;
          s.flags.formalReview = false;
          s.standing.status = 'trusted';
          s.standing.note = 'Trusted Operator: NARC considers your visible work pattern a model adoption signal.';
          note(s, 'Recognition issued: Trusted Operator. Your visible work pattern is now considered a healthy NARC-adoption example.', 'narc');
        } else {
          s.flags.formalReview = true;
          s.flags.trustedOperator = false;
          s.standing.status = 'review';
          s.standing.note = 'Review open: NARC retained the low-activity interpretation without added context.';
          note(s, 'Standing updated: review opened after the low-activity interpretation was left unchallenged.', 'narc');
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
        note(s, 'Review closed after additional context was added to the activity record.', 'narc');
      }
      break;
    }
    case 'focus': {
      // Blocking real time as Focus Time: early, this reliably protects the
      // index; after NARC 2.0 adapts, it barely moves it, and the player has
      // to notice that on their own the way they noticed it worked.
      s.calendar.push({ id: `c${s.calendar.length + 1}`, at: s.t, label: a.label || 'Focus time' });
      s.narc.focusUses += 1;
      spend(s, 5);
      if (s.narc.adaptation) {
        s.index = Math.max(0, s.index - 1);
        note(s, 'Focus Time logged. NARC 2.0 flags it as recent and frequent -- barely counted.', 'narc');
      } else {
        s.index = Math.min(100, s.index + 8);
        note(s, 'Focus Time logged. NARC stops reading the quiet stretch as a concern.', 'narc');
      }
      break;
    }
    case 'keepalive': {
      if (!s.flags.keepaliveAvailable || s.flags.keepaliveUsed) break;
      s.flags.keepaliveUsed = true;
      spend(s, 5, { visible: true });
      s.index = Math.min(100, s.index + 7);
      note(s, 'keepalive.pkg is running. Simulated input is now being counted as visible workstation activity.', 'system');
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
};

const REQUEST_OPTIONS = {
  narcFirstReview: {
    context: {
      minutes: 5, visible: true, flag: 'firstNarcContext',
      result: "You add context to NARC's first read. The correction becomes visible activity too.",
    },
    accept: {
      minutes: 0, visible: false,
      result: "You leave NARC's first automated read standing.",
    },
  },
  narcCheckpoint: {
    context: {
      minutes: 8, visible: true, flag: 'midmorningContext',
      result: 'You spend eight minutes explaining what the activity pattern missed. NARC records the explanation as another visible signal.',
    },
    ignore: {
      minutes: 0, visible: false, flag: 'narcCheckpointIgnored',
      result: 'You leave the midmorning interpretation standing without context.',
    },
  },
  danaMorning: {
    context: {
      minutes: 5, visible: true, flag: 'morningContext',
      result: "You tell Dana exactly what NARC's score missed. The message itself counts as visible activity; the model's first read stays on the record.",
    },
    skip: {
      minutes: 0,
      result: "You leave NARC's first-hour read as-is.",
    },
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
      result: "You let NARC's Trusted Operator summary stand in for a real status update. Efficient, flattering, and not necessarily accurate.",
    },
  },
  marcusFallout: {
    apologize: {
      minutes: 15, visible: false, trust: { marcus: 3 },
      result: 'You walked him through it and owned the miss. He was annoyed, then fine.',
    },
    standby: {
      minutes: 2, visible: true, trust: { marcus: -1 },
      result: "You told him the call was right and moved on. Fast. He's not thrilled.",
    },
  },
  narcResponse: {
    explain: {
      minutes: 10, visible: true,
      result: "You added a note explaining the pattern. NARC logs it, but doesn't fully back off.",
    },
    ignore: {
      minutes: 0, visible: false,
      result: 'You let the flag stand without a response.',
    },
  },
};

export function ending(s) {
  const lines = [];
  const missed = Object.entries(s.tasks).filter(([, t]) => t.status === 'missed').length;
  const done = Object.entries(s.tasks).filter(([, t]) => t.status === 'done');
  const rushed = done.filter(([id, t]) => TASK_OPTIONS[id][t.approach]?.actual === 0).length;

  lines.push(
    s.index >= 75
      ? `NARC's end-of-day summary: Visible Activity Index ${s.index}. Exemplary engagement.`
      : s.index >= 50
      ? `NARC's end-of-day summary: Visible Activity Index ${s.index}. Within normal range.`
      : `NARC's end-of-day summary: Visible Activity Index ${s.index}. Flagged for review.`
  );

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

  return { index: s.index, actual: s.actual, lines };
}

export { clock, START, END, nextEvent };
