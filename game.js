// NARC — deterministic game engine.
//
// The player is a human employee at a fictional company, using a work laptop
// over one week. NARC is monitoring software on that laptop: it observes
// proxies (input events, badge pings, message counts, records) and turns them
// into scores. The desktop is the game board, so there are no "encounters" or
// "choices" here, only a clock, incidents, and things the player does in apps.
//
//   tick(state)        advance the clock one second; deliver anything due
//   act(state, action) do something on the computer
//
// Incidents arrive on their own. Every consequence is a scheduled delivery
// (a message, an email, a calendar event, a NARC notification, a score
// change), so the player learns what happened the way they would at work.
// Everything is plain data and pure: the same actions always give the same
// week, which is what the tests rely on.

export const IDLE_LIMIT = 60; // seconds without a click before NARC acts on its own
const GAP = 10; // seconds between the last consequence and the next problem
const ORDER = ['e1', 'e2', 'e3', 'update', 'e4', 'e5', 'e6'];

export const PEOPLE = {
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
};

export const THREADS = {
  dana: { name: 'Dana Whitfield', role: 'Manager' },
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
};

export const STATUS_LABEL = {
  employed: 'EMPLOYED',
  promoted: 'PROMOTED',
  warning: 'ON WARNING',
  monitored: 'HEAVILY MONITORED',
  rewarded: 'ABSURDLY REWARDED',
  fired: 'TERMINATED',
};

const clone = (s) => structuredClone(s);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const hm = (h, m) => h * 60 + m;

export function newGame() {
  const s = {
    phase: 'desk', // desk | ending
    t: 0,
    rev: 0, // bumps whenever something the player can see has changed
    idle: 0,
    uid: 0,
    clock: { day: 'Mon', min: hm(9, 2) },
    level: 1, // 1 = Workforce Support, 2 = NARC 2.0
    score: 61, // the player's Visible Activity Index
    indexVisible: false,
    flags: 0, // integrity flags, visible from NARC 2.0 onward
    you: { gamed: false },
    helper: { installed: false, on: false, luis: null },
    people: {
      luis: { status: 'employed', trust: 0, monitored: 0, gamed: false, caught: false },
      marcus: { status: 'employed', trust: 0, gamed: false, cred: 38 },
      priya: { status: 'employed', trust: 0, suppressed: false, champion: false },
    },
    shown: { luis: 'employed', marcus: 'employed', priya: 'employed' }, // what NARC’s team panel has caught up to
    online: { luis: true, marcus: true, priya: true },
    picked: {},
    pulled: {},
    done: [],
    incident: null,
    pending: [],
    inbox: [],
    threads: { dana: [], luis: [], marcus: [], priya: [] },
    calendar: [
      { id: 'c1', who: 'me', day: 'Mon', start: '09:15', end: '12:30', title: 'Halvorsen contract read-through', where: 'Table by the window (printed copy)' },
      { id: 'c2', who: 'me', day: 'Mon', start: '13:00', end: '13:15', title: 'Team standup', where: 'Room 2B' },
      { id: 'c3', who: 'me', day: 'Tue', start: '14:00', end: '14:45', title: 'Support sync', where: 'Room 2B' },
      { id: 'c4', who: 'me', day: 'Wed', start: '13:30', end: '14:30', title: 'Pricing review', where: 'Room 3A' },
      { id: 'c5', who: 'me', day: 'Fri', start: '15:00', end: '15:30', title: 'Week wrap-up', where: 'Room 2B' },
    ],
    files: [
      { id: 'f1', name: 'Q3_planning.xlsx', meta: 'Spreadsheet · edited Fri', body: ['Q3 planning draft. Nothing in here is on fire.'] },
      { id: 'f2', name: 'Expense_report_Sept.pdf', meta: 'PDF · edited Thu', body: ['Two lunches. One taxi. One “team morale” item.'] },
    ],
    alerts: [],
    toasts: [],
    achievements: [],
  };
  mail(s, 0, {
    from: 'People Operations',
    subject: 'Introducing NARC Workforce Support',
    body: [
      'Hi team,',
      'This week our team joins the NARC Workforce Support pilot. NARC is designed to identify workflow friction, improve collaboration, and surface support needs earlier.',
      'NARC may analyze approved workplace activity signals, such as application activity, message volume, calendar data, and badge events. No action is required on your part.',
      'NARC is intended to support employees, not replace human judgment. Individual signals are considered in context.',
      'Thank you for your participation,',
      'People Operations',
    ],
  });
  say(s, 8, 'priya', 'morning! did you see the People Ops email? “no action required” is always a red flag lol');
  push(s, { at: 14, k: 'arm', id: 'e1' });
  deliverDue(s);
  return s;
}

// ------------------------------------------------------------- scheduling

const push = (s, d) => s.pending.push(d);
const later = (s, n) => s.t + n;
const say = (s, n, thread, text, extra = {}) => push(s, { at: later(s, n), k: 'msg', thread, text, ...extra });
const notice = (s, n, title, text, extra = {}) => push(s, { at: later(s, n), k: 'notice', title, text, ...extra });
const mail = (s, n, m) => push(s, { at: later(s, n), k: 'mail', mail: m });
const score = (s, n, delta, title, text, extra = {}) => push(s, { at: later(s, n), k: 'score', delta, title, text, ...extra });
const cal = (s, n, event) => push(s, { at: later(s, n), k: 'cal', event });
const catchUp = (s, n, who) => push(s, { at: later(s, n), k: 'shown', who, status: s.people[who].status });
const goOffline = (s, n, who) => push(s, { at: later(s, n), k: 'offline', who });
const teamUpdate = (s, n, who) => mail(s, n, {
  from: 'People Operations',
  subject: 'Team update',
  body: [
    `${PEOPLE[who].name} is no longer with the company. We wish them well.`,
    'NARC has classified this transition as a Successful Outcome.',
  ],
});

function toast(s, t) {
  s.toasts.push({ id: `t${++s.uid}`, gone: false, ...t });
  if (s.toasts.length > 8) s.toasts.shift();
}

function raise(s, { incident = null, variant = null, title, text }) {
  const a = { id: `n${++s.uid}`, title, text, unread: true, incident, variant, closed: false };
  s.alerts.unshift(a);
  toast(s, { app: 'narc', title, text, open: `alert:${a.id}`, alert: a.id, incident: !!incident });
  return a;
}

function deliver(s, d) {
  if (d.when && s.incident?.id !== d.when) return;
  switch (d.k) {
    case 'msg':
      s.threads[d.thread].push({ id: `m${++s.uid}`, from: 'them', text: d.text, unread: true, attach: d.attach });
      toast(s, { app: 'messages', title: THREADS[d.thread].name, text: d.text, open: `thread:${d.thread}` });
      break;
    case 'notice':
      raise(s, { title: d.title, text: d.text });
      break;
    case 'mail': {
      const m = { id: `mail${++s.uid}`, unread: true, ...d.mail };
      s.inbox.unshift(m);
      toast(s, { app: 'email', title: m.from, text: m.subject, open: `email:${m.id}` });
      break;
    }
    case 'score': {
      const from = s.score;
      s.score = clamp(from + d.delta, 0, 100);
      raise(s, { title: d.title, text: d.text.replace('{from}', from).replace('{to}', s.score) });
      break;
    }
    case 'cal':
      s.calendar.push({ id: `c${++s.uid}`, ...d.event });
      break;
    case 'shown':
      s.shown[d.who] = d.status;
      break;
    case 'offline':
      s.online[d.who] = false;
      s.threads[d.who].push({ id: `m${++s.uid}`, from: 'system', text: `${PEOPLE[d.who].name}’s account is no longer active.`, unread: true });
      break;
    case 'arm':
      arrive(s, d.id);
      break;
    case 'end':
      finish(s);
      break;
    default:
  }
  s.rev += 1;
}

function deliverDue(s) {
  for (;;) {
    const due = s.pending.filter((p) => p.at <= s.t).sort((a, b) => a.at - b.at);
    if (due.length === 0) return;
    s.pending = s.pending.filter((p) => !due.includes(p));
    due.forEach((d) => deliver(s, d));
  }
}

export function tick(state) {
  if (state.phase !== 'desk') return state;
  const s = clone(state);
  s.t += 1;
  if (s.t % 3 === 0) s.clock.min += 1;
  if (s.incident) {
    s.idle += 1;
    if (s.idle >= IDLE_LIMIT) resolve(s, INCIDENTS[s.incident.id].fallback(s.incident.variant));
  }
  deliverDue(s);
  return s;
}

// ---------------------------------------------------------------- incidents

function resolve(s, branch) {
  const inc = s.incident;
  if (!inc) return false;
  const def = INCIDENTS[inc.id];
  if (!def.allowed(inc.variant).includes(branch)) return false;
  s.picked[inc.id] = branch;
  s.done.push(inc.id);
  const alert = s.alerts.find((a) => a.incident === inc.id);
  if (alert) alert.closed = true;
  s.incident = null;
  def.branches[branch](s);
  const last = Math.max(s.t, ...s.pending.map((p) => p.at));
  const next = ORDER[ORDER.indexOf(inc.id) + 1];
  push(s, { at: last + GAP, k: next ? 'arm' : 'end', id: next });
  s.idle = 0;
  s.rev += 1;
  return true;
}

function arrive(s, id) {
  if (id === 'update') {
    rollout(s);
    return;
  }
  const def = INCIDENTS[id];
  const variant = def.variant ? def.variant(s) : null;
  s.clock = { ...def.at };
  s.incident = { id, variant, since: s.t };
  s.idle = 0;
  def.arrive(s, variant);
}

function rollout(s) {
  s.clock = { day: 'Wed', min: hm(15, 0) };
  s.level = 2;
  mail(s, 0, {
    from: 'People Operations',
    subject: 'NARC 2.0: new capabilities',
    body: [
      'Following a successful Workforce Support pilot, NARC has been granted two new capabilities:',
      'Behavioral Deviation Detection: understanding what is normal for every employee.',
      'Synthetic Activity Identification: supporting authentic work.',
      'These are effective immediately. Employees are encouraged to be themselves.',
      'People Operations',
    ],
  });
  let n = 4;
  let found = false;
  if (s.helper.on) {
    found = true;
    s.flags += 1;
    if (s.you.gamed) {
      const drop = -Math.min(25, s.score - 20);
      score(s, n, drop, 'Synthetic activity identified', 'Employee 4417: input repeats every 59 seconds. Visible Activity Index recalculated: {from} → {to}. Integrity flag added.');
    } else {
      notice(s, n, 'Synthetic activity identified', 'Employee 4417: input repeats every 59 seconds. Integrity flag added.');
    }
    n += 3;
  }
  if (s.people.luis.gamed && s.helper.luis) {
    found = true;
    s.people.luis.caught = true;
    notice(s, n, 'Synthetic activity identified', 'Luis Perez: synthetic activity detected. Under review.');
    n += 3;
  }
  if (s.people.marcus.gamed) {
    found = true;
    notice(s, n, 'Scan complete', 'Marcus Reed: 3 supporting documents verified. No anomalies.');
    n += 3;
  }
  if (!found) notice(s, n, 'Scan complete', 'No synthetic activity found. NARC congratulates the team on its authenticity.');
  const last = Math.max(s.t, ...s.pending.map((p) => p.at));
  push(s, { at: last + GAP, k: 'arm', id: 'e4' });
}

function finish(s) {
  s.phase = 'ending';
  s.clock = { day: 'Fri', min: hm(17, 0) };
  s.incident = null;
  s.achievements = achievements(s).earned.map((a) => a.id);
  s.rev += 1;
}

// Each incident: when it arrives, which actions resolve it, and what follows.
// Consequences are only ever scheduled deliveries.
const INCIDENTS = {
  e1: {
    at: { day: 'Mon', min: hm(12, 14) },
    allowed: () => ['wait', 'explain', 'jiggle'],
    fallback: () => 'wait',
    arrive(s) {
      s.indexVisible = true;
      s.files.unshift({
        id: 'f-halvorsen',
        name: 'Halvorsen_MSA_v3.pdf',
        meta: 'PDF · scan of printed copy · edited today 12:41',
        body: [
          'Annotated scan of the printed contract.',
          'Comment on p.14: pricing table does not match the quote. Difference: $40,000. Sent to Legal.',
        ],
      });
      if (s.helper.on) {
        resolve(s, 'jiggle');
        return;
      }
      raise(s, {
        incident: 'e1',
        title: 'Visible activity is low',
        text: 'Employee 4417: 3 h 12 min without keyboard or mouse input this morning.',
      });
      say(s, 3, 'dana', 'Just checking in! Everything okay?');
      say(s, 16, 'marcus', 'you know there’s a thing that keeps your mouse active, right? Utilities → Mouse Activity Helper', { when: 'e1' });
    },
    branches: {
      wait(s) {
        score(s, 3, -6, 'Visible activity', 'Index {from} → {to}. Recommended action: increase visible activity.');
        say(s, 6, 'dana', 'Saw the dip! No pressure. Maybe a little more… on Slack?');
      },
      explain(s) {
        score(s, 3, -3, 'Note archived', 'Visible Activity Index: {from} → {to}. Notes are archived. They are not scored.');
        say(s, 7, 'dana', 'Got your note! Haven’t had time to read it, but I love that you wrote it.');
      },
      jiggle(s) {
        s.you.gamed = true;
        score(s, 5, 14, 'Engagement trend: positive', 'Visible Activity Index: {from} → {to}.');
        say(s, 9, 'dana', 'Love the energy!');
      },
    },
  },

  e2: {
    at: { day: 'Tue', min: hm(10, 14) },
    allowed: () => ['confirm', 'ignore', 'script'],
    fallback: () => 'ignore',
    arrive(s) {
      s.files.unshift({
        id: 'f-queue',
        name: 'Support_queue_weekly.xlsx',
        meta: 'Spreadsheet · team report',
        body: [
          'Tickets closed this week, as a share of the team median:',
          'Luis Perez: 112%',
          'Team median: 100%',
        ],
      });
      raise(s, {
        incident: 'e2',
        title: 'Restroom-adjacent inactivity',
        text: 'Luis Perez: 47 minutes this week. Team baseline: 18.',
      });
      say(s, 2, 'luis', 'I am not discussing my digestive system with software.');
    },
    branches: {
      confirm(s) {
        const p = s.people.luis;
        p.monitored = 2;
        p.trust -= 2;
        notice(s, 3, 'Peer confirmation received', 'Confidence: 71% → 88%. Luis Perez’s inactivity threshold: 18 min → 5 min.');
        score(s, 5, 4, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.');
        say(s, 8, 'luis', 'A peer. A PEER confirmed a bathroom.');
        notice(s, 12, 'Interaction logged', 'Luis Perez did not respond to Employee 4417 in person. Logged: low-collaboration interaction.');
      },
      ignore(s) {
        const p = s.people.luis;
        p.monitored = 1;
        p.trust += 1;
        notice(s, 3, 'Advisory issued', 'Time-on-Task Advisory issued: Luis Perez.');
        say(s, 7, 'luis', 'Thank you for not asking. The advisory has a chart. The chart has a title. The title is my name.');
      },
      script(s) {
        const p = s.people.luis;
        p.gamed = true;
        p.trust += 2;
        s.helper.luis = { on: true, randomized: false };
        say(s, 3, 'luis', 'ok what does this do');
        notice(s, 6, 'Activity update', 'Luis Perez: Activity Index 340% of baseline. “Exceptionally engaged.” Time-on-task concern dismissed.');
        say(s, 9, 'luis', 'I have never been more productive, and I am not at my desk.');
        say(s, 12, 'dana', 'Have you seen Luis’s numbers?? Nominating him for the Innovation Council.');
      },
    },
  },

  e3: {
    at: { day: 'Wed', min: hm(10, 52) },
    allowed: () => ['truth', 'paper', 'stay'],
    fallback: () => 'stay',
    arrive(s) {
      raise(s, {
        incident: 'e3',
        title: 'Attendance integrity',
        text: 'Marcus Reed: badge-in 10:52 (scheduled 09:00). Fourth late arrival this month.',
      });
      say(s, 0, 'marcus', 'running late');
      say(s, 2, 'marcus', 'a raccoon got on the 8:14 bus');
      say(s, 4, 'marcus', 'driver said we had to wait for a professional');
      say(s, 14, 'marcus', 'my calendar is completely empty wednesday morning btw. just saying', { when: 'e3' });
    },
    branches: {
      truth(s) {
        const p = s.people.marcus;
        p.cred = 12;
        p.status = 'warning';
        p.trust -= 2;
        notice(s, 3, 'Trace confirmed', 'Location trace confirmed. Attendance credibility: 38% → 12%. Written Attendance Warning issued: Marcus Reed.');
        score(s, 5, 5, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.');
        say(s, 8, 'marcus', 'Mini-golf is a cognitive reset. Ask anyone. Don’t ask anyone.');
        catchUp(s, 4, 'marcus');
      },
      paper(s) {
        const p = s.people.marcus;
        p.gamed = true;
        p.cred = 91;
        p.trust += 2;
        notice(s, 3, 'Corroboration added', 'Marcus Reed: transit alert, facilities ticket #4471 (filed 09:31), calendar entry. Story corroborated by 3 sources. Attendance credibility: 38% → 91%.');
        say(s, 7, 'marcus', 'i did visit the vendor. the vendor was a windmill.');
        say(s, 10, 'marcus', 'you have just invented money');
      },
      stay(s) {
        const p = s.people.marcus;
        p.status = 'warning';
        notice(s, 3, 'Notice issued', 'No corroboration submitted. Attendance credibility: 38%. Attendance Integrity Notice issued: Marcus Reed.');
        say(s, 7, 'marcus', 'I’m going to need a better raccoon.');
        catchUp(s, 4, 'marcus');
      },
    },
  },

  e4: {
    at: { day: 'Thu', min: hm(9, 30) },
    allowed: () => ['quiet', 'champion', 'leave'],
    fallback: () => 'leave',
    arrive(s) {
      s.files.unshift(
        {
          id: 'f-esc',
          name: 'Client_escalation_ESC-204.txt',
          meta: 'Ticket · Kestrel Foods',
          body: [
            'Opened 08:02. First reply from Marketing: 11:12.',
            'Reply time: 3 h 10 min. Priya Shah was in 14 active threads at the time.',
          ],
        },
        {
          id: 'f-onboard',
          name: 'Onboarding_tracker.xlsx',
          meta: 'Spreadsheet · Operations',
          body: [
            'Two new hires, both fully productive in their first week.',
            'Buddy for both: Priya Shah.',
          ],
        },
      );
      mail(s, 1, {
        from: 'Culture Team',
        subject: 'Culture Champion nominations are open',
        body: [
          'Culture Champions are colleagues who make our workplace feel like a workplace.',
          'Nominees must have a Collaboration Index of 90 or higher. Culture Champions are exempt from Communication Load monitoring.',
          'To nominate a colleague, select a name below.',
        ],
        form: 'nominate',
      });
      raise(s, {
        incident: 'e4',
        title: 'Communication load: elevated',
        text: 'Priya Shah: 63 Slack threads this week. In-person proximity 41% above baseline. Recommended action: throttle.',
      });
      say(s, 2, 'priya', 'I asked Claire what she was having for lunch. It was a workflow.');
    },
    branches: {
      quiet(s) {
        const p = s.people.priya;
        p.suppressed = true;
        p.status = 'monitored';
        notice(s, 3, 'Communication load', 'Communication Load: elevated → normal. Priya Shah’s message volume: −71%.');
        say(s, 4, 'priya', 'I am fine. I am being efficient.');
        say(s, 6, 'priya', '(whispering) did you hear about Claire?');
        notice(s, 8, 'Behavioral deviation', 'Priya Shah: social withdrawal. 71% below personal baseline. Collaboration Index: 97 → 31. Enrolled in mandatory Connection Circle.');
        cal(s, 8, { who: 'team', day: 'Fri', start: '09:00', end: '10:00', title: 'Connection Circle (mandatory): Priya Shah', where: 'Assigned by NARC' });
        catchUp(s, 8, 'priya');
      },
      champion(s) {
        const p = s.people.priya;
        p.champion = true;
        p.status = 'promoted';
        notice(s, 3, 'Culture Champion', 'Priya Shah: nomination cites Collaboration Index 97. Exempt from Communication Load monitoring. Flag cleared.');
        say(s, 6, 'priya', 'I have a badge. I can now talk to people officially.');
        cal(s, 8, { who: 'team', day: 'Fri', start: '10:00', end: '16:00', title: 'Connection Circle ×6 (Culture Champion)', where: 'Five required per week' });
        catchUp(s, 6, 'priya');
      },
      leave(s) {
        notice(s, 3, 'Coaching enabled', 'Concise Communication Coaching enabled: Priya Shah. A summarizing assistant has been assigned.');
        say(s, 7, 'priya', 'It summarizes my messages. Its summaries are better than my messages. I hate it.');
        notice(s, 11, 'Response time', 'Client reply time improves by 2 h 40 min.');
      },
    },
  },

  e5: {
    at: { day: 'Thu', min: hm(14, 14) },
    variant: (s) => (s.people.luis.gamed ? 'g' : 'n'),
    allowed: (v) => (v === 'g' ? ['admit', 'human', 'blame', 'auto'] : ['label', 'output', 'letit']),
    fallback: (v) => (v === 'g' ? 'auto' : 'letit'),
    arrive(s, v) {
      if (v === 'g') {
        raise(s, {
          incident: 'e5',
          variant: v,
          title: 'Synthetic activity: integrity review',
          text: 'Luis Perez: input every 59 seconds, including 41 minutes while the badge shows the restroom corridor.',
        });
        say(s, 2, 'luis', 'I was so productive. Why is there a review?');
        if (s.helper.luis?.randomized) resolve(s, 'human');
        return;
      }
      raise(s, {
        incident: 'e5',
        variant: v,
        title: 'Time-on-task: Performance Improvement Plan',
        text: 'Luis Perez: 6 min 40 sec of restroom-adjacent inactivity at 14:14. Notice history: 2.',
      });
      say(s, 2, 'luis', 'There is a chart in my inbox. The chart has a title. The title is my name.');
    },
    branches: {
      admit(s) {
        const p = s.people.luis;
        p.status = 'warning';
        p.trust += 3;
        s.flags += 1;
        notice(s, 3, 'Review concluded', 'Software source attributed to: Employee 4417. Luis Perez: verbal caution. Innovation Council nomination withdrawn.');
        score(s, 5, -8, 'Integrity flag', `Visible Activity Index: {from} → {to}. Integrity flags: ${s.flags}.`);
        say(s, 8, 'luis', 'You did not have to do that.');
        say(s, 10, 'luis', 'I am still not discussing the restroom.');
        catchUp(s, 4, 'luis');
      },
      human(s) {
        s.people.luis.status = 'rewarded';
        notice(s, 3, 'Review concluded', 'Luis Perez: input interval randomized (± 40 sec). Synthetic pattern not detected. Innovation Council nomination approved.');
        say(s, 6, 'luis', 'I chair the Council now. We meet at two. I stand up at nine past.');
        say(s, 9, 'dana', 'The Innovation Council has 11 meetings a week and no windows. Congrats!');
        catchUp(s, 4, 'luis');
      },
      blame(s) {
        const p = s.people.luis;
        p.status = 'fired';
        p.trust -= 5;
        notice(s, 3, 'Review concluded', 'Synthetic Activity Policy §4: employees are responsible for their own input. Luis Perez: termination pending. Nomination withdrawn.');
        score(s, 5, 6, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.');
        say(s, 7, 'luis', 'A peer. Again.');
        goOffline(s, 12, 'luis');
        teamUpdate(s, 12, 'luis');
        catchUp(s, 12, 'luis');
      },
      auto(s) {
        s.people.luis.status = 'monitored';
        notice(s, 3, 'Review concluded', 'No source identified. Luis Perez: heavy monitoring enabled. Innovation Council nomination withdrawn.');
        say(s, 7, 'luis', 'I was extremely productive and now I am being monitored for it.');
        catchUp(s, 4, 'luis');
      },
      label(s) {
        const p = s.people.luis;
        p.status = 'employed';
        p.trust += 1;
        say(s, 3, 'dana', 'Sure! Ideation is important.');
        notice(s, 5, 'Category updated', 'Manager reclassified 22 minutes/week as “Unstructured Ideation.” Notice withdrawn.');
        say(s, 8, 'luis', 'I have ideas. They are unstructured. I will not say when.');
      },
      output(s) {
        s.people.luis.status = 'monitored';
        notice(s, 3, 'Attachment archived', 'Attachment archived. NARC has no field for “output.” Notice stands. Luis Perez: heavy monitoring enabled.');
        say(s, 7, 'luis', 'So it was always going to be the chart.');
        catchUp(s, 4, 'luis');
      },
      letit(s) {
        const p = s.people.luis;
        p.status = 'fired';
        p.trust -= 3;
        notice(s, 3, 'Plan issued', 'Performance Improvement Plan issued. Luis Perez declined to sign. Termination pending: Time-on-Task.');
        say(s, 7, 'luis', 'I was in the restroom when the email arrived.');
        notice(s, 10, 'Email status', 'Luis Perez: email read in 4 seconds.');
        goOffline(s, 14, 'luis');
        teamUpdate(s, 14, 'luis');
        catchUp(s, 14, 'luis');
      },
    },
  },

  e6: {
    at: { day: 'Fri', min: hm(11, 20) },
    variant: (s) => (s.people.marcus.gamed ? 'g' : 'b'),
    allowed: (v) => (v === 'g' ? ['workshop', 'approve', 'expose'] : ['vouch_trace', 'backdate', 'let']),
    fallback: (v) => (v === 'g' ? 'approve' : 'let'),
    arrive(s, v) {
      say(s, 0, 'marcus', 'There was a bird situation.');
      if (v === 'g') {
        s.files.unshift({
          id: 'f-docs',
          name: 'Absence_documents_Reed.zip',
          meta: 'Archive · 6 items · attached by Marcus Reed',
          body: [
            'Facilities ticket #4471. Transit alert. Badge photo. Calendar entry.',
            'An email from “Bird Services,” sent from marcus.reed.personal@.',
            'One Polaroid.',
          ],
        });
        raise(s, {
          incident: 'e6',
          variant: v,
          title: 'Attendance integrity',
          text: 'Marcus Reed: badge-in 11:20 (scheduled 09:00). Fifth late arrival this month. Documentation Excellence: top 2% of Operations.',
        });
        return;
      }
      s.files.unshift({
        id: 'f-slip',
        name: 'Wingspan_intake_slip.pdf',
        meta: 'PDF · forwarded by Marcus Reed',
        body: [
          'Wingspan Bird Sanctuary. Opens 09:00.',
          'Volunteer scan, 09:20: “Injured goose. Intake.”',
        ],
      });
      say(s, 3, 'marcus', 'goose. injured goose.');
      say(s, 5, 'marcus', 'i have the intake slip');
      raise(s, {
        incident: 'e6',
        variant: v,
        title: 'Attendance integrity: action pending',
        text: `Marcus Reed: credibility ${s.people.marcus.cred}%. Prior flags weight: 80%. Automatic action: Attendance Integrity Termination.`,
      });
    },
    branches: {
      workshop(s) {
        s.people.marcus.status = 'rewarded';
        notice(s, 3, 'Recommendation approved', 'Marcus Reed: recommended for peer training. Credibility: 94%.');
        mail(s, 5, {
          from: 'Learning & Development',
          subject: 'Attendance Best Practices: Fridays, 09:00',
          body: ['Presenter: Marcus Reed.', 'Please arrive on time.'],
        });
        say(s, 8, 'marcus', 'It’s at nine. I’ll be early. To the one after it.');
        cal(s, 9, { who: 'team', day: 'Fri', start: '09:00', end: '10:00', title: 'Attendance Best Practices (presenter: Marcus Reed)', where: 'Presenter has not joined' });
        catchUp(s, 5, 'marcus');
      },
      approve(s) {
        s.people.marcus.status = 'employed';
        notice(s, 3, 'Absence approved', 'Marcus Reed: absence approved. No action taken.');
        say(s, 6, 'marcus', 'The bird will be very relieved.');
      },
      expose(s) {
        s.people.marcus.status = 'fired';
        s.flags += 1;
        notice(s, 3, 'Discrepancy reported', `Document authorship: 3 of 6 last edited by Employee 4417. Marcus Reed: termination pending. Integrity flags: ${s.flags}.`);
        score(s, 5, 8, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.');
        say(s, 7, 'marcus', 'I’m in a lot of trouble, and I think you might be.');
        goOffline(s, 12, 'marcus');
        teamUpdate(s, 12, 'marcus');
        catchUp(s, 12, 'marcus');
      },
      vouch_trace(s) {
        const p = s.people.marcus;
        p.status = 'warning';
        p.cred = 67;
        notice(s, 3, 'Trace attached', 'Marcus Reed: credibility 12% → 67%. Prior-flag weighting under review. Termination withdrawn. Final written warning issued.');
        say(s, 6, 'marcus', 'It was a goose. I don’t want to talk about the goose.');
        notice(s, 10, 'Outlier noted', 'Marcus Reed: first corroborated excuse on record. Classified as an outlier.');
        catchUp(s, 4, 'marcus');
      },
      backdate(s) {
        s.people.marcus.status = 'fired';
        s.flags += 1;
        notice(s, 3, 'Retroactive pattern', 'Calendar entry created 11:26, after the flag at 11:20. Pattern: retroactive. Marcus Reed: termination pending. Integrity flag added to Employee 4417.');
        say(s, 7, 'marcus', 'It was a real goose. I had a real goose.');
        goOffline(s, 12, 'marcus');
        teamUpdate(s, 12, 'marcus');
        catchUp(s, 12, 'marcus');
      },
      let(s) {
        s.people.marcus.status = 'fired';
        notice(s, 3, 'Action confirmed', 'Attendance Integrity Termination confirmed. Marcus Reed. Confidence: 88%.');
        say(s, 7, 'marcus', 'It was a goose.');
        say(s, 9, 'marcus', 'Can the goose be a reference?');
        goOffline(s, 13, 'marcus');
        teamUpdate(s, 13, 'marcus');
        catchUp(s, 13, 'marcus');
      },
    },
  },
};

// -------------------------------------------------------- what the player does

// Case actions inside a NARC alert -> the branch they resolve.
function caseBranch(s, a) {
  const inc = s.incident?.id;
  const v = s.incident?.variant;
  const key = `${inc}:${a.id}`;
  switch (key) {
    case 'e1:submitNote': return a.text && a.text.trim() ? 'explain' : null;
    case 'e2:agree': return 'confirm';
    case 'e3:confirmTrace': return 'truth';
    case 'e5:attribute': return v === 'g' ? (a.who === 'me' ? 'admit' : a.who === 'luis' ? 'blame' : null) : null;
    case 'e5:attachOutput': return v === 'n' ? 'output' : null;
    case 'e6:endorse': return v === 'g' ? 'workshop' : null;
    case 'e6:reportDocs': return v === 'g' ? 'expose' : null;
    case 'e6:attachTrace': return v === 'b' ? 'vouch_trace' : null;
    default: return null;
  }
}

function open(s, ref) {
  const [kind, id] = ref.split(':');
  if (kind === 'email') {
    const m = s.inbox.find((x) => x.id === id);
    if (!m) return false;
    m.unread = false;
  } else if (kind === 'thread') {
    const th = s.threads[id];
    if (!th) return false;
    th.forEach((m) => { m.unread = false; });
  } else if (kind === 'alert') {
    const a = s.alerts.find((x) => x.id === id);
    if (!a) return false;
    a.unread = false;
    if (a.incident && s.incident?.id === a.incident) s.pulled[a.incident] = true;
  } else {
    return false;
  }
  s.toasts.forEach((t) => { if (t.open === ref) t.gone = true; });
  return true;
}

const REPLIES = {
  'priya:cutback': { text: 'Could you cut back to three channels for a bit?', when: 'e4', branch: 'quiet' },
  'dana:relabel': { text: 'Could you relabel Luis’s restroom time as “unstructured ideation”?', when: 'e5', variant: 'n', branch: 'label' },
  'marcus:approve': { text: 'Absence approved. Don’t worry about it.', when: 'e6', variant: 'g', branch: 'approve' },
};

export function replies(s, thread) {
  return Object.entries(REPLIES)
    .filter(([key, r]) => key.startsWith(`${thread}:`) && s.incident?.id === r.when && (!r.variant || s.incident.variant === r.variant))
    .map(([key, r]) => ({ id: key.split(':')[1], text: r.text }));
}

export function canAttachHelper(s) {
  return s.incident?.id === 'e2' && s.online.luis;
}

export function act(state, a) {
  if (state.phase === 'ending') return a.do === 'restart' ? newGame() : state;
  const s = clone(state);
  s.idle = 0;
  let changed = false;
  switch (a.do) {
    case 'touch':
      return s;
    case 'open':
      changed = open(s, a.ref);
      break;
    case 'gone': {
      const t = s.toasts.find((x) => x.id === a.id);
      if (t) { t.gone = true; changed = true; }
      break;
    }
    case 'dismiss': {
      const alert = s.alerts.find((x) => x.id === a.alert);
      if (alert) {
        s.toasts.forEach((t) => { if (t.alert === alert.id) t.gone = true; });
        alert.unread = false;
        if (alert.incident && s.incident?.id === alert.incident) {
          resolve(s, INCIDENTS[alert.incident].fallback(s.incident.variant));
        }
        changed = true;
      }
      break;
    }
    case 'case': {
      const branch = caseBranch(s, a);
      if (branch) changed = resolve(s, branch);
      break;
    }
    case 'reply': {
      const r = replies(s, a.thread).find((x) => x.id === a.reply);
      if (!r) break;
      s.threads[a.thread].push({ id: `m${++s.uid}`, from: 'me', text: r.text });
      resolve(s, REPLIES[`${a.thread}:${a.reply}`].branch);
      changed = true;
      break;
    }
    case 'attach':
      if (a.thread === 'luis' && a.item === 'helper' && canAttachHelper(s)) {
        s.threads.luis.push({ id: `m${++s.uid}`, from: 'me', text: 'try this', attach: 'Mouse Activity Helper.pkg' });
        resolve(s, 'script');
        changed = true;
      }
      break;
    case 'helper': {
      if (a.op === 'install') {
        if (!s.helper.installed) { s.helper.installed = true; changed = true; }
      } else if (a.op === 'toggle' && s.helper.installed) {
        s.helper.on = !s.helper.on;
        if (s.helper.on && s.incident?.id === 'e1') resolve(s, 'jiggle');
        changed = true;
      } else if (a.op === 'randomize' && s.level >= 2 && s.helper.luis && !s.helper.luis.randomized) {
        s.helper.luis.randomized = true;
        if (s.incident?.id === 'e5' && s.incident.variant === 'g') resolve(s, 'human');
        changed = true;
      }
      break;
    }
    case 'nominate':
      if (s.incident?.id === 'e4' && PEOPLE[a.who]) {
        if (a.who === 'priya') {
          resolve(s, 'champion');
        } else {
          mail(s, 2, {
            from: 'Culture Team',
            subject: `Re: nomination of ${PEOPLE[a.who].name}`,
            body: [`Thank you for nominating ${PEOPLE[a.who].name}.`, 'Their Collaboration Index is below the nomination threshold of 90. Nomination not submitted.'],
          });
        }
        changed = true;
      }
      break;
    case 'addEvent': {
      const title = (a.title || '').trim();
      if (!title) break;
      const inc = s.incident;
      if (inc?.id === 'e3') {
        s.calendar.push({ id: `c${++s.uid}`, who: 'marcus', day: 'Wed', start: '09:00', end: '10:45', title, where: 'Added by Employee 4417' });
        resolve(s, 'paper');
        changed = true;
      } else if (inc?.id === 'e6' && inc.variant === 'b') {
        s.calendar.push({ id: `c${++s.uid}`, who: 'marcus', day: 'Fri', start: '08:30', end: '11:00', title, where: 'Added by Employee 4417' });
        resolve(s, 'backdate');
        changed = true;
      }
      break;
    }
    default:
  }
  if (changed) s.rev += 1;
  return s;
}

// ------------------------------------------------------------ what the UI shows

export const unread = (s) => ({
  messages: Object.values(s.threads).reduce((n, th) => n + th.filter((m) => m.unread).length, 0),
  email: s.inbox.filter((m) => m.unread).length,
  narc: s.alerts.filter((a) => a.unread).length,
});

export const clockText = (s) => {
  const m = s.clock.min;
  return `${s.clock.day} ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// A NARC alert's detail page: what NARC observed, what it inferred, and any
// controls NARC itself offers. Human context is elsewhere, in other apps.
export function caseView(s, alert) {
  if (!alert.incident) return { title: alert.title, text: alert.text, notice: true };
  const open = !alert.closed;
  const dismiss = { type: 'button', id: 'dismiss', label: 'Dismiss alert' };
  const p = s.people;
  const v = alert.variant;
  const base = { title: alert.title, closed: !open };
  switch (`${alert.incident}${v || ''}`) {
    case 'e1':
      return {
        ...base,
        subject: 'Employee 4417 (you)',
        observed: ['Keyboard and mouse activity: none, 09:02–12:14 (3 h 12 min)', 'Messages sent: 0', 'Active window: none'],
        model: { label: 'Engagement concern: low to moderate', confidence: 64 },
        metrics: [['Visible Activity Index', s.score], ['Team average', 84]],
        controls: open ? [{ type: 'note', id: 'submitNote', label: 'Add context (optional)', button: 'Submit note' }, dismiss] : [],
      };
    case 'e2':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: ['Corridor sensor pings near the restrooms: 14 this week', 'Laptop input during pings: none', 'Total: 47 min. Team baseline: 18 min'],
        model: { label: 'Time-on-task concern: moderate', confidence: 71 },
        metrics: [],
        prompt: 'Peer Insight: NARC is requesting input. Do you agree this flag is accurate?',
        controls: open ? [{ type: 'button', id: 'agree', label: 'Agree with flag' }, dismiss] : [],
      };
    case 'e3':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 10:52. Scheduled: 09:00', 'Device location 09:04–10:41: Pinecrest Family Fun Center', 'Corroborating records on file: none'],
        model: { label: 'Attendance credibility', confidence: 38 },
        metrics: [],
        prompt: 'Peer Insight: is the device location trace accurate?',
        controls: open ? [{ type: 'button', id: 'confirmTrace', label: 'Confirm location trace' }, dismiss] : [],
      };
    case 'e4':
      return {
        ...base,
        subject: 'Priya Shah',
        observed: ['Slack threads this week: 63', 'In-person proximity pings: 41% above baseline', 'Reply time on ESC-204: 3 h 10 min'],
        model: { label: 'Communication Load: elevated', confidence: 82 },
        metrics: [['Collaboration Index', 97], ['Recommended action', 'Throttle']],
        controls: open ? [dismiss] : [],
      };
    case 'e5g':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: ['Input every 59 seconds (fixed interval)', '41 min of input while the badge shows the restroom corridor', 'Innovation Council nomination: pending integrity review'],
        model: { label: 'Automated presence pattern', confidence: 96 },
        metrics: [],
        prompt: 'Report the source of the input software.',
        controls: open ? [
          { type: 'choice', id: 'attribute', options: [{ v: 'me', label: 'Employee 4417 (me)' }, { v: 'luis', label: 'Luis Perez' }], button: 'Submit report' },
          dismiss,
        ] : [],
      };
    case 'e5n':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: [
          'Restroom-adjacent inactivity: 6 min 40 sec at 14:14',
          p.luis.monitored === 2 ? 'Threshold: 5 minutes (tightened after peer confirmation)' : 'NARC 2.0 now measures every pause, per visit',
          'Notice history: Time-on-Task Advisory',
        ],
        model: { label: 'Sustained unexplained productivity loss', confidence: 88 },
        metrics: [['Automatic action', 'Performance Improvement Plan']],
        controls: open ? [{ type: 'button', id: 'attachOutput', label: 'Attach supporting document: ticket output' }, dismiss] : [],
      };
    case 'e6g':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 11:20. Scheduled: 09:00', 'Supporting documents attached: 6', 'Documents verified: 6 of 6 (records exist)'],
        model: { label: 'Attendance credibility', confidence: 94 },
        metrics: [['Documentation Excellence', 'Top 2% of Operations']],
        prompt: 'NARC recommends peer training. Endorse?',
        controls: open ? [
          { type: 'button', id: 'endorse', label: 'Endorse nomination' },
          { type: 'button', id: 'reportDocs', label: 'Report a document discrepancy' },
          dismiss,
        ] : [],
      };
    case 'e6b':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 11:20. Scheduled: 09:00', 'Device location 08:14–10:55: Wingspan Bird Sanctuary (weight 20%)', 'Flag history: 1 prior notice (weight 80%)'],
        model: { label: 'Attendance credibility', confidence: p.marcus.cred },
        metrics: [['Automatic action', 'Attendance Integrity Termination']],
        controls: open ? [{ type: 'button', id: 'attachTrace', label: 'Attach location trace as corroboration' }, dismiss] : [],
      };
    default:
      return { ...base, notice: true, text: alert.text };
  }
}

export function calendarAction(s) {
  const inc = s.incident;
  if (inc?.id === 'e3') return { day: 'Wed', slot: '09:00–10:45', who: 'Marcus Reed' };
  if (inc?.id === 'e6' && inc.variant === 'b') return { day: 'Fri', slot: '08:30–11:00', who: 'Marcus Reed' };
  return null;
}

// ----------------------------------------------------------------- the ending

function epilogue(s, id) {
  const p = s.people[id];
  if (id === 'luis') {
    switch (p.status) {
      case 'fired':
        return p.gamed
          ? 'Terminated under Synthetic Activity Policy §4. The badge worked one last time.'
          : 'Terminated. Reason on file: Time-on-Task. Luis was, at the time, in the restroom.';
      case 'rewarded':
        return 'Chair of the Innovation Council. Activity Index: 340%. Restroom-adjacent inactivity: unchanged.';
      case 'warning':
        return 'Verbal caution on file. Still not discussing it.';
      case 'monitored':
        return 'Retained under heavy monitoring. Has read the chart. Has notes on the chart.';
      default:
        return 'Retained. Luis’s time is now “unstructured ideation.” Luis has not confirmed this.';
    }
  }
  if (id === 'marcus') {
    switch (p.status) {
      case 'fired':
        return p.gamed
          ? 'Terminated after document review. The bird could not be reached for comment.'
          : 'Terminated. Reason on file: Attendance Integrity. Marcus asked whether the goose could be a reference.';
      case 'rewarded':
        return 'Teaches Attendance Best Practices, Fridays at 09:00. Arrives 09:40.';
      case 'warning':
        return 'Final written warning. Has since volunteered at the sanctuary. Twice. On time.';
      default:
        return 'Absence approved. Credibility: 94%. It has never been lower in real life.';
    }
  }
  switch (p.status) {
    case 'promoted':
      return 'Culture Champion. Hosts six Connection Circles a week. Has scheduled a seventh.';
    case 'monitored':
      return 'Enrolled in a mandatory Connection Circle. Perfect attendance. Sole attendee.';
    default:
      return 'A summarizing assistant condenses the messages. Client replies are 2 h 40 min faster. Claire’s lunch remains unknown.';
  }
}

const ACHIEVEMENTS = [
  {
    id: 'nobody',
    name: 'Nobody Gets Fired Today',
    desc: 'Finish the week with everyone still employed.',
    hint: 'Everyone stays.',
    test: (s) => Object.values(s.people).every((p) => p.status !== 'fired'),
  },
  {
    id: 'fewer',
    name: 'Two Fewer Problems',
    desc: 'Luis and Marcus are both terminated.',
    hint: 'The opposite of the above, mostly.',
    test: (s) => s.people.luis.status === 'fired' && s.people.marcus.status === 'fired',
  },
  {
    id: 'technically',
    name: 'Technically Compliant',
    desc: 'Keep someone employed mainly by manipulating what NARC can see.',
    hint: 'A record does not have to be true.',
    test: (s) => (s.people.marcus.gamed && s.people.marcus.status !== 'fired')
      || (s.people.luis.gamed && s.people.luis.status !== 'fired'),
  },
  {
    id: 'bird',
    name: 'The Boy Who Cried Bird',
    desc: 'Save Marcus the one time his excuse is true.',
    hint: 'Sometimes the excuse is the truth.',
    test: (s) => s.picked.e6 === 'vouch_trace',
  },
  {
    id: 'donotask',
    name: 'Do Not Ask',
    desc: 'Keep Luis employed without ever opening the restroom data.',
    hint: 'Some alerts are better left unopened.',
    test: (s) => s.people.luis.status !== 'fired' && !s.pulled.e2 && !s.pulled.e5,
  },
  {
    id: 'champion',
    name: 'Culture Champion',
    desc: 'Get Priya an official badge for talking.',
    hint: 'A title outranks a flag.',
    test: (s) => s.people.priya.champion,
  },
];

export function achievements(s) {
  return {
    earned: ACHIEVEMENTS.filter((a) => a.test(s)),
    locked: ACHIEVEMENTS.filter((a) => !a.test(s)),
  };
}

function playerResult(s) {
  const informed = s.picked.e2 === 'confirm' || s.picked.e3 === 'truth'
    || s.picked.e5 === 'blame' || s.picked.e6 === 'expose';
  if (s.flags >= 2) {
    return { label: 'UNDER REVIEW', text: `Integrity flags: ${s.flags}. NARC has questions about your keyboard.` };
  }
  if (s.flags === 1) {
    return { label: 'ON WATCHLIST', text: 'One integrity flag. NARC is “keeping an open mind.”' };
  }
  if (s.score >= 65) {
    return {
      label: 'MODEL EMPLOYEE',
      text: `Visible Activity Index: ${s.score}. NARC describes you as “aligned.”${informed ? ' Your reports about colleagues have been classified as collaboration.' : ''}`,
    };
  }
  return {
    label: 'STILL EMPLOYED',
    text: `Visible Activity Index: ${s.score}. NARC is not sure what you do. It does not have a field for the $40,000 error.`,
  };
}

function companySummary(s) {
  const fired = Object.values(s.people).filter((p) => p.status === 'fired').length;
  const rows = [`Monitored group headcount: ${3 - fired} of 3.`];
  if (fired === 0) {
    rows.push('Retention: 100%. NARC has identified no areas for improvement and is investigating this.');
  } else if (fired >= 2) {
    rows.push('Insufficient staff to sustain the Workforce Intelligence pilot. NARC recommends expansion.');
  } else {
    rows.push('One position is now open. NARC has drafted the posting.');
  }
  rows.push('Employee sentiment: Excellent. Survey responses received: 0.');
  return rows;
}

export function ending(s) {
  return {
    roster: Object.keys(PEOPLE).map((id) => ({
      id,
      name: PEOPLE[id].name,
      role: PEOPLE[id].role,
      status: s.people[id].status,
      label: STATUS_LABEL[s.people[id].status],
      text: epilogue(s, id),
    })),
    you: playerResult(s),
    company: companySummary(s),
    achievements: achievements(s),
  };
}
