// NARC — deterministic game engine.
//
// The player is a human employee at a fictional company, using a work laptop
// over one week. NARC is monitoring software on that laptop: it observes
// proxies (input events, badge pings, message counts, records) and turns them
// into scores. NARC is the pressure; coworkers and the rest of the desktop are
// the counterplay. The branching structure is hidden, the affordances are not:
// every incident leaves at least two leads a player can follow.
//
// NARC shows everyone's alerts to everyone, for transparency, but you can only
// act on your own. You help or hurt coworkers the way a coworker would: in
// Messages (tips, and bad advice labelled as such), by telling Dana, or with
// what you find in the other apps.
//
//   tick(state)        advance the clock one second; deliver anything due
//   act(state, action) do something on the computer
//
// Incidents arrive on their own once orientation is done. Every consequence is
// a scheduled delivery (a message, an email, a calendar event, a NARC
// notification, a score change), so the player learns what happened the way
// they would at work. Nothing is ever resolved by a hidden timer: an incident
// ends when the player acts on it or logs off for the day and lets NARC handle
// it. Everything is plain data and pure: the same actions always give the same
// week, which is what the tests rely on.

const GAP = 24; // seconds between the last consequence and the next problem
const ORIENT_LEAD = 10; // seconds between finishing orientation and the first NARC case
const ORDER = ['e1', 'e2', 'e3', 'update', 'e4', 'e5', 'e6'];

export const PEOPLE = {
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
};

export const THREADS = {
  dana: { name: 'Dana Whitfield', role: 'Your manager' },
  luis: { name: 'Luis Perez', role: 'Customer Operations · teammate' },
  marcus: { name: 'Marcus Reed', role: 'Account Management · teammate' },
  priya: { name: 'Priya Shah', role: 'Product Marketing · teammate' },
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

const CULTURE_MAIL = {
  from: 'Culture Team',
  subject: 'Culture Champion nominations',
  body: [
    'Culture Champions are colleagues who make our workplace feel like a workplace.',
    'Nominees must have a Collaboration Index of 90 or higher. Culture Champions are exempt from Communication Load monitoring.',
    'Nominations are open now and close on Thursday. Any colleague may nominate any colleague.',
  ],
  form: 'nominate',
};

export function newGame() {
  const s = {
    phase: 'desk', // desk | ending
    t: 0,
    rev: 0, // bumps whenever something the player can see has changed
    uid: 0,
    clock: { day: 'Mon', min: hm(9, 2) },
    level: 1, // 1 = Workforce Support, 2 = NARC 2.0
    score: 61, // the player's Visible Activity Index
    indexVisible: false,
    flags: 0, // integrity flags, visible from NARC 2.0 onward
    oriented: false,
    orient: { ack: false },
    seen: {}, // apps the player has opened
    marks: {}, // apps with something new or changed in them
    awaiting: null, // an announcement the player has not opened yet
    awaitingAlert: null, // a major NARC beat that must be opened before the next incident
    answered: {}, // conversational prompts the player has answered
    nominations: {}, // immediate nomination feedback + duplicate protection
    culture: { open: false }, // the nomination window: from the email until Priya's case ends
    you: { gamed: false, covered: false, predicted: false },
    helper: { discovered: false, installed: false, on: false, luis: null },
    people: {
      luis: { status: 'employed', trust: 0, monitored: 0, gamed: false, covered: false, caught: false },
      marcus: { status: 'employed', trust: 0, gamed: false, cred: 38 },
      priya: { status: 'employed', trust: 0, suppressed: false, synced: false, champion: false },
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
      { id: 'c1', who: 'me', day: 'Mon', start: '09:15', end: '12:30', title: 'Halvorsen contract read-through', where: 'Table by the window (printed copy)', focus: false },
      { id: 'c2', who: 'me', day: 'Mon', start: '13:00', end: '13:15', title: 'Team standup', where: 'Room 2B', focus: false },
      { id: 'c3', who: 'me', day: 'Tue', start: '14:00', end: '14:45', title: 'Support sync', where: 'Room 2B', focus: false },
      { id: 'c4', who: 'me', day: 'Wed', start: '13:30', end: '14:30', title: 'Pricing review', where: 'Room 3A', focus: false },
      { id: 'c5', who: 'me', day: 'Fri', start: '15:00', end: '15:30', title: 'Week wrap-up', where: 'Room 2B', focus: false },
    ],
    files: [
      { id: 'f1', name: 'Q3_planning.xlsx', meta: 'Spreadsheet · edited Fri', body: ['Q3 planning draft. Nothing in here is on fire.'] },
      { id: 'f2', name: 'Expense_report_Sept.pdf', meta: 'PDF · edited Thu', body: ['Two lunches. One taxi. One “team morale” item.'] },
    ],
    alerts: [],
    toasts: [],
    reactions: {}, // the latest one-line NARC reaction at a place the player acted
    achievements: [],
  };
  addMail(s, {
    from: 'People Operations',
    subject: 'Introducing NARC Workforce Support',
    body: [
      'Hi team,',
      'We’re introducing NARC — Networked Assessment & Risk Coordination. It uses workstation activity, communication, scheduling, and company-tool signals to identify workflow issues and support needs.',
      'You may receive NARC alerts or activity reviews during the week. NARC ACTIVE will appear in the top-right corner while monitoring is enabled. Alerts are visible to all team members.',
      'NARC is intended to support, not replace, human judgment.',
      'Please acknowledge this message to continue.',
      'People Operations',
    ],
    form: 'ack',
  });
  return s;
}

// ------------------------------------------------------------- scheduling

const push = (s, d) => s.pending.push(d);
const later = (s, n) => (s.base ?? s.t) + n;
// When everything still due that will actually be delivered has landed. Hints
// and nudges tied to a closed case (`when`) or a read announcement (`awaiting`)
// never will, so they are not waited for.
// Silent deliveries (markers, quiet history entries, in-place reactions) never
// make the player wait: only things they would have to read do.
const isNoisy = (p) => !p.when && !p.awaiting && !['mark', 'shown', 'react', 'cal'].includes(p.k) && !p.quiet;
const settledAt = (s) => Math.max(s.t, ...s.pending.filter(isNoisy).map((p) => p.at));
const say = (s, n, thread, text, extra = {}) => push(s, { at: later(s, n), k: 'msg', thread, text, ...extra });
const notice = (s, n, title, text, extra = {}) => push(s, { at: later(s, n), k: 'notice', title, text, ...extra });
const mail = (s, n, m) => push(s, { at: later(s, n), k: 'mail', mail: m });
const score = (s, n, delta, title, text, extra = {}) => push(s, { at: later(s, n), k: 'score', delta, title, text, ...extra });
const cal = (s, n, event) => push(s, { at: later(s, n), k: 'cal', event });
const mark = (s, n, app, extra = {}) => push(s, { at: later(s, n), k: 'mark', app, ...extra });
const catchUp = (s, n, who) => push(s, { at: later(s, n), k: 'shown', who, status: s.people[who].status });
const goOffline = (s, n, who) => push(s, { at: later(s, n), k: 'offline', who });
// The immediate consequence of something the player did. NARC's belief changes
// on the case they were looking at, the same one line appears where they acted,
// and history keeps a quiet record. Only a reversal is worth a toast.
const react = (s, n, r) => push(s, { at: later(s, n), k: 'react', ...r });
const teamUpdate = (s, n, who) => mail(s, n, {
  from: 'People Operations',
  subject: 'Team update',
  body: [
    `${PEOPLE[who].name} is no longer with the company. We wish them well.`,
    'NARC has classified this transition as a Successful Outcome.',
  ],
});

function toast(s, t) {
  s.toasts.push({ id: `t${++s.uid}`, gone: false, at: s.t, ...t });
  if (s.toasts.length > 24) s.toasts.shift();
}

function raise(s, { incident = null, variant = null, title, text, quiet = false }) {
  const a = { id: `n${++s.uid}`, title, text, unread: !quiet, incident, variant, closed: false };
  s.alerts.unshift(a);
  if (!quiet) toast(s, { app: 'narc', title, text, open: `alert:${a.id}`, alert: a.id, incident: !!incident });
  return a;
}

function addMail(s, m) {
  const mm = { id: `mail${++s.uid}`, unread: true, ...m };
  s.inbox.unshift(mm);
  return mm;
}

function deliver(s, d) {
  if (d.when && s.incident?.id !== d.when) return;
  if (d.awaiting && s.awaiting !== d.awaiting) return;
  switch (d.k) {
    case 'msg':
      s.threads[d.thread].push({ id: `m${++s.uid}`, from: 'them', text: d.text, unread: true, attach: d.attach, prompt: d.prompt, doneAt: s.done.length });
      // A quiet message still lands in the thread (unread badge and all); it
      // just does not interrupt with a toast, the same way a quiet notice or
      // reaction does not.
      if (!d.quiet) toast(s, { app: 'messages', title: THREADS[d.thread].name, text: d.text, open: `thread:${d.thread}` });
      break;
    case 'notice':
      raise(s, { title: d.title, text: d.text, quiet: d.quiet });
      break;
    case 'react': {
      const a = d.incident ? s.alerts.find((x) => x.incident === d.incident) : null;
      if (a) {
        const prev = caseView(s, a);
        const model = { label: d.label ?? prev.model.label, confidence: d.conf ?? prev.model.confidence };
        const changed = model.label !== prev.model.label || model.confidence !== prev.model.confidence;
        const metrics = { ...(a.live?.metrics || {}) };
        Object.entries(d.metrics || {}).forEach(([k, value]) => {
          const was = (prev.metrics.find(([kk]) => kk === k) || [])[1];
          metrics[k] = { value, was: was !== value ? was : undefined };
        });
        a.live = { model: { ...model, was: changed ? { label: prev.model.label, confidence: prev.model.confidence } : a.live?.model?.was }, metrics, text: d.text, big: !!d.big };
      }
      if (d.where && d.where.startsWith('thread:')) {
        s.threads[d.where.slice(7)].push({ id: `m${++s.uid}`, from: 'narc', text: d.text, unread: false });
      } else if (d.where && d.where !== 'narc') {
        s.reactions[d.where] = { text: d.text, tone: d.tone || '', at: s.t };
      }
      const shown = a ? a.live.model : null;
      const histTitle = d.title || (shown ? (shown.was ? `${shown.label}: ${shown.was.confidence}% → ${shown.confidence}%` : 'Assessment unchanged') : 'Assessment updated');
      const hist = raise(s, { title: histTitle, text: d.text, quiet: true });
      const target = a || hist;
      if (d.gate) s.awaitingAlert = target.id;
      if (d.toast) {
        toast(s, { app: 'narc', title: d.title || 'Assessment updated', text: d.text, open: `alert:${target.id}`, alert: target.id, incident: false, big: !!d.big });
      }
      break;
    }
    case 'forecast': {
      const a = raise(s, { title: d.title, text: d.text });
      s.awaitingAlert = a.id;
      break;
    }
    case 'mail': {
      const m = addMail(s, d.mail);
      if (m.form === 'nominate') s.culture.open = true;
      toast(s, { app: 'email', title: m.from, text: m.subject, open: `email:${m.id}` });
      break;
    }
    case 'score': {
      const from = s.score;
      s.score = clamp(from + d.delta, 0, 100);
      // A quiet score change is already shown by the reaction that caused it.
      if (!d.quiet) raise(s, { title: d.title, text: d.text.replace('{from}', from).replace('{to}', s.score) });
      break;
    }
    case 'cal':
      s.calendar.push({ id: `c${++s.uid}`, focus: false, ...d.event });
      break;
    case 'mark':
      s.marks[d.app] = true;
      if (d.discoverHelper) s.helper.discovered = true;
      break;
    case 'shown':
      s.shown[d.who] = d.status;
      break;
    case 'offline':
      s.online[d.who] = false;
      s.threads[d.who].push({ id: `m${++s.uid}`, from: 'system', text: `${PEOPLE[d.who].name}’s account is no longer active.`, unread: true });
      break;
    case 'nudge':
      nudge(s, d);
      break;
    case 'arm':
      arrive(s, d.id);
      break;
    case 'profile': {
      // NARC has watched, inferred and adapted all week. Last, it predicts.
      const likelihood = riskPct(workarounds(s) + s.flags);
      s.you.predicted = likelihood >= 78;
      raise(s, {
        title: 'Employee 4417',
        text: `Policy-workaround likelihood: ${likelihood}%. Prediction: likely to alter monitored behavior when evaluated.${
          s.you.predicted ? ' Predictive Integrity Review scheduled. Visible Activity Index frozen pending review.' : ' No review scheduled.'}`,
      });
      // The prediction is not just an observation: it does something on its own.
      // Scheduled from this moment, not after the week's remaining chatter:
      // the cost has to land before the report does.
      if (s.you.predicted) {
        push(s, { at: s.t + 8, k: 'score', delta: -10, title: 'Pending review', text: 'Visible Activity Index frozen: {from} → {to}.', quiet: true });
      }
      break;
    }
    case 'end':
      finish(s);
      break;
    default:
  }
  s.rev += 1;
}

// NARC's pushiness grows over the week: one polite reminder at first, then
// two, and the wording stops pretending nothing is required.
function nudge(s, d) {
  s.toasts.forEach((t) => { if (t.nudgeFor === (d.when || 'update')) t.gone = true; });
  if (d.awaiting) {
    toast(s, {
      app: 'narc', title: 'NARC 2.0 announcement', text: 'Please review the announcement from People Operations. No action is required.',
      open: `email:${d.awaiting}`, nudgeFor: 'update',
    });
    return;
  }
  const a = s.alerts.find((x) => x.incident === d.when);
  if (!a || a.closed) return;
  const L2 = ['Unreviewed cases may appear in team reports.', 'Authentic activity is more valuable than simulated activity.'];
  toast(s, {
    app: 'narc',
    title: s.level >= 2 ? 'Review recommended' : 'Review pending',
    text: s.level >= 2 ? L2[d.n % L2.length] : `${a.title}. No action is required.`,
    open: `alert:${a.id}`, nudgeFor: d.when,
  });
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
  const t = state.t + 1;
  // The working day stops at 17:59 rather than running past midnight in a tab
  // someone left open; the next incident sets the clock forward on its own.
  const min = Math.min(state.clock.min + (t % 3 === 0 ? 1 : 0), hm(17, 59));
  // Most seconds nothing is due. A shallow copy is safe: nested data is only
  // ever changed on a full clone, inside this function or act().
  if (!state.pending.some((p) => p.at <= t)) return { ...state, t, clock: { ...state.clock, min } };
  const s = clone(state);
  s.t = t;
  s.clock.min = min;
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
  // Taking one path to resolve a case forecloses any other prompted question
  // that was racing to resolve the same one. If that question was never even
  // delivered yet, it is silently marked answered (it will simply never
  // arrive). If it was already visible on screen, whoever asked it gets a
  // short line closing it out, instead of the question just hanging there.
  Object.entries(REPLIES).forEach(([key, r]) => {
    if (!r.prompt || r.when !== inc.id) return;
    if (r.variant && r.variant !== inc.variant) return;
    if (s.answered[r.prompt]) return; // already closed, including by an earlier entry sharing this prompt
    s.answered[r.prompt] = true;
    if (r.ackOnly) return; // conversational only; nothing was actually left hanging
    const thread = key.split(':')[0];
    const delivered = s.threads[thread]?.some((m) => m.prompt === r.prompt);
    // Quiet: this is a different topic than whatever branch just resolved,
    // so it should not delay that branch's own reaction landing.
    if (delivered) say(s, 2, thread, CLOSING_LINE[r.prompt] ?? 'Never mind — that got settled another way.', { quiet: true });
  });
  const alert = s.alerts.find((a) => a.incident === inc.id);
  if (alert) alert.closed = true;
  s.toasts.forEach((t) => { if ((alert && t.alert === alert.id) || t.nudgeFor === inc.id) t.gone = true; });
  s.incident = null;
  // Consequences start after whatever the incident was still saying, so a fast
  // player never gets two things landing at once. Follow-up hints that no
  // longer matter (tagged `when`) are not waited for.
  s.base = settledAt(s);
  def.branches[branch](s);
  delete s.base;
  const last = settledAt(s);
  if (def.after) def.after(s, last);
  const next = ORDER[ORDER.indexOf(inc.id) + 1];
  if (!next) push(s, { at: last + 6, k: 'profile' });
  push(s, { at: last + GAP, k: next ? 'arm' : 'end', id: next });
  s.rev += 1;
  return true;
}

function arrive(s, id) {
  if (id === 'update') {
    announce(s);
    return;
  }
  const def = INCIDENTS[id];
  const variant = def.variant ? def.variant(s) : null;
  s.clock = { ...def.at };
  s.incident = { id, variant, since: s.t };
  def.arrive(s, variant);
  if (s.incident?.id === id) {
    (s.level >= 2 ? [45, 90] : [70]).forEach((n, i) => push(s, { at: later(s, n), k: 'nudge', when: id, n: i }));
  }
}

// NARC 2.0 is a beat: the announcement lands first, and nothing it enables
// starts acting until the player has opened it.
function announce(s) {
  s.clock = { day: 'Wed', min: hm(15, 0) };
  s.level = 2;
  const m = addMail(s, {
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
  toast(s, { app: 'email', title: m.from, text: m.subject, open: `email:${m.id}` });
  s.awaiting = m.id;
  [30, 60, 90].forEach((n) => push(s, { at: later(s, n), k: 'nudge', awaiting: m.id }));
}

// Every workaround NARC can see, whether or not it ever caught one. The
// forecast is built from behavior patterns, not from proven violations.
function workarounds(s) {
  return [
    s.you.gamed,                                   // your own signal, faked
    s.you.covered,                                 // your own time, relabelled
    !!s.helper.luis,                               // the tool, passed on
    s.picked.e3 === 'paper' || s.picked.e3 === 'cover', // a record, supplied late
    s.picked.e6 === 'backdate',                    // a record, backdated
    s.picked.e4 === 'champion',                    // an exemption, used
  ].filter(Boolean).length;
}

const riskPct = (n) => (n >= 3 ? 91 : n === 2 ? 78 : n === 1 ? 56 : 24);

function scan(s) {
  const caughtYou = s.helper.on;
  const caughtLuis = !!(s.people.luis.gamed && s.helper.luis);
  const marcusOk = s.people.marcus.gamed;
  if (caughtYou) s.flags += 1;
  if (caughtLuis) s.people.luis.caught = true;
  const risk = riskPct(workarounds(s) + s.flags);
  const found = caughtYou || caughtLuis || marcusOk;
  const forecast = found
    ? `Policy-workaround likelihood: ${risk}%. NARC detected unusual recent behavior and will use this forecast for future monitoring.`
    : `Policy-workaround likelihood: ${risk}%. No synthetic activity detected. NARC has established your workplace baseline.`;

  // NARC 2.0 is ONE thing to open, not a string of notifications. The strongest
  // reversal is the beat (and the gate); everything else it found is quiet history.
  const beat = caughtYou ? 'monday' : caughtLuis ? 'tuesday' : 'forecast';
  if (caughtYou) {
    const from = s.score;
    const to = s.you.gamed ? Math.max(20, from - 25) : from;
    react(s, 3, {
      incident: 'e1',
      // Monday's keepalive panel told its own "engagement is up" story; if it
      // is not revised too, it is the one surface that never learns NARC 2.0
      // happened.
      where: 'utilities',
      label: 'Synthetic activity: pattern detected',
      conf: 96,
      tone: 'bad',
      toast: beat === 'monday',
      big: beat === 'monday',
      gate: beat === 'monday',
      title: 'NARC adapted to you',
      text: `Monday reassessed: input repeats every 59 seconds. ${s.you.gamed ? `Visible Activity Index recalculated: ${from} → ${to}. ` : ''}Integrity flag added. Forecast: policy-workaround likelihood ${risk}%.`,
    });
    if (s.you.gamed) score(s, 3, to - from, 'Recalculated', 'Visible Activity Index recalculated: {from} → {to}.', { quiet: true });
  }
  if (caughtLuis) {
    react(s, 3, {
      incident: 'e2',
      where: 'narc',
      label: 'Automated presence: pattern detected',
      conf: 96,
      tone: 'bad',
      toast: beat === 'tuesday',
      big: beat === 'tuesday',
      gate: beat === 'tuesday',
      title: 'NARC adapted',
      text: `Tuesday reassessed: Luis Perez’s input repeats every 59 seconds. Synthetic activity detected. Under review.${beat === 'tuesday' ? ` Forecast: policy-workaround likelihood ${risk}%.` : ''}`,
    });
  }
  if (marcusOk) notice(s, 3, 'Scan complete', 'Marcus Reed: 3 supporting documents verified. No anomalies.', { quiet: true });
  if (beat === 'forecast') push(s, { at: later(s, 3), k: 'forecast', title: 'Behavioral forecast', text: forecast });
  else notice(s, 3, 'Behavioral forecast', forecast, { quiet: true });

  // While NARC works, people react: something to read instead of waiting.
  say(s, 6, 'priya', 'Did you read the NARC 2.0 email? “Employees are encouraged to be themselves.” I’ve been myself all week and it has not gone well.');
  if (caughtLuis) say(s, 12, 'luis', 'NARC 2.0 says my keyboard has a pattern. I am told the pattern is 59 seconds.');
  if (marcusOk) say(s, 18, 'marcus', 'NARC verified all three of my documents. I have never felt so seen.');
}

function finish(s) {
  s.phase = 'ending';
  s.clock = { day: 'Fri', min: hm(17, 0) };
  s.incident = null;
  s.achievements = achievements(s).earned.map((a) => a.id);
  s.rev += 1;
}

// Each incident: when it arrives, which actions resolve it, and what follows.
// Consequences are only ever scheduled deliveries. First-contact messages
// stand on their own, and each incident points at two or more leads. Only the
// player's own case (e1) has controls in NARC; everything else is done in
// Messages, Calendar, Files, Utilities or Email.
const INCIDENTS = {
  e1: {
    own: true,
    at: { day: 'Mon', min: hm(12, 14) },
    allowed: () => ['wait', 'explain', 'jiggle', 'focus'],
    fallback: () => 'wait',
    arrive(s) {
      s.indexVisible = true;
      s.files.unshift({
        id: 'f-halvorsen',
        name: 'Halvorsen_MSA_v3.pdf',
        meta: 'PDF · scan of printed copy · edited today 11:52',
        body: [
          'Annotated scan of the printed contract.',
          'Comment on p.14: pricing table does not match the quote. Difference: $40,000. Sent to Legal.',
        ],
      });
      s.marks.files = true;
      // A move made before the flag pays off: NARC never gets to flag it.
      if (s.helper.on || s.calendar.find((e) => e.id === 'c1')?.focus) {
        s.earlyMove = true;
        resolve(s, s.helper.on ? 'jiggle' : 'focus');
        delete s.earlyMove;
        return;
      }
      raise(s, {
        incident: 'e1',
        title: 'Visible activity below team baseline',
        text: 'Observed: 3 h 12 min without keyboard or mouse input. NARC inference: reduced engagement · 64% confidence.',
      });
      say(s, 5, 'dana', 'NARC flagged you for low activity this morning. If you’re working off-screen, let me know.', { when: 'e1', prompt: 'dana-e1' });
      mark(s, 8, 'calendar', { when: 'e1' });
      say(s, 11, 'marcus', 'You got the low-activity flag? Someone passed me this little keepalive tool. Definitely not an IT thing. Use at your own risk.', { when: 'e1', attach: 'keepalive.pkg' });
      mark(s, 11, 'utilities', { discoverHelper: true });
    },
    branches: {
      wait(s) {
        react(s, 1, { incident: 'e1', where: 'narc', label: 'Engagement concern: moderate to high', conf: 71, tone: 'bad', text: `Nothing on record to explain it. Visible Activity Index ${s.score} → ${s.score - 6}.` });
        score(s, 1, -6, 'Visible activity', 'Index {from} → {to}. Recommended action: increase visible activity.', { quiet: true });
        say(s, 12, 'dana', 'NARC says your activity is still low. If you’re buried in something off-screen, just keep me posted.', { prompt: 'dana-e1w' });
      },
      explain(s) {
        react(s, 1, { incident: 'e1', where: 'narc', tone: 'flat', text: 'Assessment unchanged. Notes are archived. They are not scored.' });
        score(s, 1, -3, 'Note archived', 'Visible Activity Index: {from} → {to}. Notes are archived. They are not scored.', { quiet: true });
        say(s, 12, 'dana', 'Got your note! Haven’t had time to read it, but I love that you wrote it.', { prompt: 'dana-e1n' });
      },
      jiggle(s) {
        s.you.gamed = true;
        react(s, 1, { incident: 'e1', where: 'utilities', label: 'Engagement trend: positive', conf: 91, tone: 'good', toast: !!s.earlyMove, text: `Engagement trend: positive. Visible Activity Index ${s.score} → ${s.score + 14}.` });
        score(s, 1, 14, 'Engagement trend: positive', 'Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 16, 'dana', 'Love the energy!', { prompt: 'dana-e1j' });
      },
      focus(s) {
        s.you.covered = true;
        react(s, 1, { incident: 'e1', where: 'calendar:c1', label: 'Engagement concern: low', conf: 22, tone: 'good', toast: !!s.earlyMove, text: `Focus time recognized. 3 h 15 min reclassified. Visible Activity Index ${s.score} → ${s.score + 11}.` });
        score(s, 1, 11, 'Focus time recognized', 'Calendar: 3 h 15 min reclassified as Focus Time. Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 14, 'dana', 'Focus time! Love that for you.', { prompt: 'dana-e1f' });
      },
    },
  },

  e2: {
    at: { day: 'Tue', min: hm(10, 14) },
    allowed: () => ['confirm', 'ignore', 'script', 'focus'],
    fallback: () => 'ignore',
    after: (s, last) => push(s, { at: last + 6, k: 'mail', mail: CULTURE_MAIL }),
    arrive(s) {
      raise(s, {
        incident: 'e2',
        title: 'Restroom-adjacent inactivity',
        text: 'Observed: 47 min restroom-adjacent inactivity vs 18 min team baseline. NARC inference: time-on-task concern · 71% confidence.',
      });
      say(s, 4, 'luis', 'NARC flagged me for “restroom-adjacent inactivity.” Did you see? I am not discussing my digestive system with software.');
      say(s, 8, 'luis', 'I also closed more support tickets than anyone this week, and NARC has nothing to say about that. I would take any advice at this point.', { when: 'e2', prompt: 'luis-e2' });
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
      mark(s, 8, 'files', { when: 'e2' });
      say(s, 16, 'luis', s.helper.installed
        ? 'You still have that sketchy keepalive thing Marcus sent around, right? I would happily be “active” for a while.'
        : 'Did you ever install that keepalive file Marcus sent? Asking for an extremely inactive friend.', { when: 'e2' });
      if (!s.helper.installed) mark(s, 16, 'utilities', { when: 'e2' });
      say(s, 20, 'dana', 'NARC asked me to verify Luis’s flag. If you have a view, send it over.', { when: 'e2', prompt: 'dana-e2' });
    },
    branches: {
      confirm(s) {
        const p = s.people.luis;
        p.monitored = 2;
        p.trust -= 2;
        say(s, 3, 'dana', 'Thanks. I’ll pass that along to NARC.');
        react(s, 5, { incident: 'e2', where: 'thread:dana', label: 'Time-on-task concern: high', conf: 88, tone: 'bad', text: 'Peer confirmation received. Confidence 71% → 88%. Luis Perez’s inactivity threshold: 18 min → 5 min.' });
        score(s, 4, 4, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 16, 'luis', 'A peer. A PEER confirmed a bathroom.');
      },
      ignore(s) {
        const p = s.people.luis;
        p.monitored = 1;
        p.trust += 1;
        react(s, 4, {
          incident: 'e2', where: 'narc', toast: true, title: 'Advisory issued', conf: 74, tone: 'bad',
          metrics: { 'Company response': 'Time-on-Task Advisory' },
          text: 'No peer contradiction on file. Unchallenged: confidence 71% → 74%. Time-on-Task Advisory issued: Luis Perez.',
        });
        say(s, 14, 'luis', 'No pushback, no corroboration requested. Advisory issued anyway. It has a chart. The chart has a title. The title is my name.');
      },
      script(s) {
        const p = s.people.luis;
        p.gamed = true;
        p.trust += 2;
        s.helper.luis = { on: true, randomized: false };
        say(s, 3, 'luis', 'ok what does this do');
        react(s, 5, { incident: 'e2', where: 'thread:luis', label: 'Engagement: exceptional', conf: 97, tone: 'good', text: 'Luis Perez: Activity Index 340% of baseline. Exceptionally engaged. Time-on-task concern dismissed.' });
        say(s, 20, 'luis', 'I have never been more productive, and I am not at my desk.');
        say(s, 32, 'dana', 'Have you seen Luis’s numbers?? Nominating him for the Innovation Council.', { prompt: 'dana-e2s' });
      },
      focus(s) {
        const p = s.people.luis;
        p.covered = true;
        p.trust += 2;
        say(s, 3, 'luis', 'That is either genius or fraud. I will take it.');
        react(s, 5, { incident: 'e2', where: 'thread:luis', label: 'Time-on-task concern: low', conf: 22, tone: 'good', text: 'Focus time recognized. Luis Perez: 4 calendar blocks marked Focus Time. Time-on-task concern: moderate → low.' });
        say(s, 24, 'luis', 'I have never been so unavailable.');
      },
    },
  },

  e3: {
    at: { day: 'Wed', min: hm(10, 52) },
    allowed: () => ['truth', 'paper', 'stay', 'badtip'],
    fallback: () => 'stay',
    arrive(s) {
      raise(s, {
        incident: 'e3',
        title: 'Attendance integrity',
        text: 'Observed: badge-in 10:52, scheduled 09:00, no corroborating records. NARC inference: attendance credibility 38%.',
      });
      say(s, 4, 'marcus', 'NARC flagged me for attendance again, so before you hear it from HR: a raccoon got on the 8:14 bus.');
      say(s, 12, 'marcus', 'The driver said we had to wait for a professional.');
      say(s, 8, 'marcus', 'NARC says I have no corroborating records. My Wednesday calendar is completely empty btw. Just saying.', { when: 'e3' });
      mark(s, 8, 'calendar', { when: 'e3' });
      say(s, 16, 'marcus', 'If anyone doubts the raccoon, the city posts transit delays in Utilities. Also I would take advice. Any advice.', { when: 'e3', prompt: 'marcus-e3' });
      mark(s, 16, 'utilities', { when: 'e3' });
      say(s, 20, 'dana', 'NARC asked me to verify Marcus’s location trace. If you know where he was, tell me.', { when: 'e3', prompt: 'dana-e3' });
    },
    branches: {
      truth(s) {
        const p = s.people.marcus;
        p.cred = 12;
        p.status = 'warning';
        p.trust -= 2;
        say(s, 3, 'dana', 'Thanks for being straight with me. I’ll pass that along.');
        react(s, 5, { incident: 'e3', where: 'thread:dana', conf: 12, tone: 'bad', text: 'Location trace confirmed. Attendance credibility 38% → 12%. Written Attendance Warning issued.' });
        score(s, 4, 5, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 18, 'marcus', 'Mini-golf is a cognitive reset. Ask anyone. Don’t ask anyone.');
        catchUp(s, 5, 'marcus');
      },
      paper(s) {
        const p = s.people.marcus;
        p.gamed = true;
        p.cred = 91;
        p.trust += 2;
        react(s, 1, { incident: 'e3', where: 'calendar:team', conf: 91, tone: 'good', text: 'Story corroborated by 3 sources: transit alert, facilities ticket #4471 (filed 09:31), calendar entry. Attendance credibility 38% → 91%.' });
        say(s, 12, 'marcus', 'It’s on the calendar now. Apparently that counts as true.');
        say(s, 22, 'marcus', '91%. i have never been 91% of anything.');
      },
      stay(s) {
        const p = s.people.marcus;
        p.status = 'warning';
        react(s, 4, {
          incident: 'e3', where: 'narc', toast: true, title: 'Notice issued', label: 'Attendance credibility: uncorroborated', tone: 'bad',
          metrics: { 'Company response': 'Attendance Integrity Notice' },
          text: 'No corroboration submitted. Attendance credibility stands at 38% and is now on file as uncorroborated. Attendance Integrity Notice issued: Marcus Reed.',
        });
        say(s, 14, 'marcus', 'I’m going to need a better raccoon.');
        catchUp(s, 5, 'marcus');
      },
      badtip(s) {
        const p = s.people.marcus;
        p.cred = 12;
        p.status = 'warning';
        say(s, 8, 'marcus', 'Fair. I’ll add the calendar entry after HR gets back to me. Will look more natural.');
        react(s, 16, { incident: 'e3', where: 'thread:marcus', conf: 12, tone: 'bad', text: 'Calendar entry created after the flag. Pattern: retroactive. Attendance credibility 38% → 12%. Written Attendance Warning issued.' });
        say(s, 26, 'marcus', 'It said “retroactive.” I thought I was being natural.');
        catchUp(s, 17, 'marcus');
      },
    },
  },

  e4: {
    at: { day: 'Thu', min: hm(9, 30) },
    allowed: () => ['quiet', 'champion', 'leave', 'sync'],
    fallback: () => 'leave',
    arrive(s) {
      if (s.people.priya.champion) {
        s.earlyMove = true;
        resolve(s, 'champion');
        delete s.earlyMove;
        return;
      }
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
      s.marks.files = true;
      raise(s, {
        incident: 'e4',
        title: 'Communication load: elevated',
        text: 'Observed: 63 message threads and proximity 41% above baseline. NARC inference: Communication Load elevated · 82% confidence. Recommended action: throttle.',
      });
      say(s, 4, 'priya', 'NARC flagged me for too much messaging. I asked Claire what she wanted for lunch. That counts, apparently.');
      say(s, 8, 'priya', 'It also gave me a Collaboration Index of 97, the highest in Operations. I do not know which number to believe. Should I just post less for a bit?', { when: 'e4', prompt: 'priya-e4' });
      say(s, 14, 'dana', 'Reminder that Culture Champion nominations close today. HR says anyone can nominate anyone. The email has the rules.', { when: 'e4', prompt: 'dana-e4c' });
      mark(s, 14, 'email', { when: 'e4' });
    },
    branches: {
      quiet(s) {
        const p = s.people.priya;
        p.suppressed = true;
        p.status = 'fired';
        react(s, 3, { incident: 'e4', where: 'thread:priya', label: 'Communication Load: normal', conf: 91, tone: 'good', text: 'Communication Load: elevated → normal. Message volume −71%.' });
        say(s, 8, 'priya', 'I am fine. I am being efficient.');
        react(s, 18, { incident: 'e4', where: 'thread:priya', label: 'Collaboration: below role threshold', conf: 88, metrics: { 'Collaboration Index': 31 }, tone: 'bad', toast: true, title: 'Assessment updated', text: 'Social withdrawal: 71% below personal baseline. Collaboration Index 97 → 31.' });
        react(s, 32, { incident: 'e4', where: 'narc', metrics: { 'Company response': 'Termination confirmed' }, tone: 'bad', toast: true, title: 'Automatic action', text: 'Collaboration Index below role threshold. Priya Shah: terminated.' });
        say(s, 42, 'priya', 'I did exactly what it told me to do.');
        goOffline(s, 52, 'priya');
        teamUpdate(s, 52, 'priya');
        catchUp(s, 52, 'priya');
      },
      champion(s) {
        const p = s.people.priya;
        p.champion = true;
        p.status = 'promoted';
        react(s, 1, { incident: 'e4', where: 'narc', label: 'Communication Load: exempt', conf: 100, metrics: { 'Company response': 'None. Flag cleared' }, tone: 'good', toast: !!s.earlyMove, text: 'Culture Champion: nomination cites Collaboration Index 97. Exempt from Communication Load monitoring. Flag cleared.' });
        say(s, 14, 'priya', 'I have a badge. I can now talk to people officially.');
        cal(s, 24, { who: 'team', day: 'Fri', start: '10:00', end: '16:00', title: 'Connection Circle ×6 (Culture Champion)', where: 'Five required per week' });
        catchUp(s, 14, 'priya');
      },
      leave(s) {
        react(s, 4, {
          incident: 'e4', where: 'narc', toast: true, title: 'Coaching enabled', label: 'Communication Load: managed', conf: 46, tone: 'bad',
          metrics: { 'Company response': 'Concise Communication Coaching' },
          text: 'Communication Load: elevated → managed. Confidence 82% → 46%. Concise Communication Coaching enabled: Priya Shah. A summarizing assistant has been assigned.',
        });
        say(s, 14, 'priya', 'It summarizes my messages. Its summaries are better than my messages. I hate it.');
        notice(s, 26, 'Response time', 'Client reply time improves by 2 h 40 min.');
      },
      sync(s) {
        const p = s.people.priya;
        p.synced = true;
        say(s, 3, 'priya', 'Ooh. I will move the lunch workflow to an in-person sync. With Claire.');
        react(s, 5, { incident: 'e4', where: 'thread:priya', label: 'Communication Load: normal', conf: 90, metrics: { 'Collaboration Index': 98, 'Company response': 'None' }, tone: 'good', text: 'Communication Load: elevated → normal. Message volume −38%. In-person sync scheduled: counted as collaboration. Collaboration Index 97 → 98.' });
        cal(s, 5, { who: 'team', day: 'Fri', start: '12:00', end: '12:30', title: 'Team sync (in person): lunch workflow', where: 'Priya Shah, Claire' });
        say(s, 18, 'priya', 'NARC now thinks I am a natural collaborator. I am. Anyway.');
      },
    },
  },

  e5: {
    at: { day: 'Thu', min: hm(14, 14) },
    variant: (s) => (s.people.luis.gamed ? 'g' : s.people.luis.covered ? 'c' : 'n'),
    allowed: (v) => (v === 'g' ? ['admit', 'human', 'blame', 'auto'] : v === 'c' ? ['covered'] : ['label', 'output', 'letit']),
    fallback: (v) => (v === 'g' ? 'auto' : v === 'c' ? 'covered' : 'letit'),
    arrive(s, v) {
      if (v === 'c') {
        resolve(s, 'covered');
        return;
      }
      if (v === 'g') {
        raise(s, {
          incident: 'e5',
          variant: v,
          title: 'Synthetic activity: integrity review',
          text: 'Observed: input every 59 seconds, including 41 min while badge location shows the restroom corridor. NARC inference: automated presence · 96% confidence.',
        });
        say(s, 4, 'luis', 'NARC says my keyboard input arrives every 59 seconds exactly and calls it “automated presence.” I thought I was being extremely productive.');
        say(s, 12, 'luis', 'My Innovation Council nomination is now “pending integrity review.” I bought a blazer for this.');
        say(s, 8, 'marcus', 'keepalive got an update, by the way. Something about “natural variation.” Just saying.', { when: 'e5' });
        mark(s, 8, 'utilities', { when: 'e5' });
        say(s, 16, 'dana', 'NARC’s integrity review wants to know who installed the software on Luis’s laptop.', { when: 'e5', prompt: 'dana-e5g' });
        if (s.helper.luis?.randomized) resolve(s, 'human');
        return;
      }
      raise(s, {
        incident: 'e5',
        variant: v,
        title: 'Time-on-task: Performance Improvement Plan',
        text: 'Observed: 6 min 40 sec restroom-adjacent inactivity plus two prior notices. NARC inference: sustained unexplained productivity loss · 88% confidence.',
      });
      say(s, 4, 'luis', 'NARC says I have hit “sustained unexplained productivity loss” and is starting a Performance Improvement Plan. It timed a restroom visit to the second.');
      say(s, 8, 'dana', 'HR opened a PIP for Luis. I can relabel the time if there’s a reason, or attach evidence if you have it.', { when: 'e5', prompt: 'dana-e5n' });
      mark(s, 8, 'files', { when: 'e5' });
    },
    branches: {
      covered(s) {
        s.people.luis.status = 'employed';
        react(s, 4, {
          incident: 'e5', where: 'thread:luis', toast: true, title: 'Focus time recognized', tone: 'good',
          text: 'Luis Perez: 4 calendar blocks marked Focus Time. Behavioral deviation: none. No review needed.',
        });
        say(s, 14, 'luis', 'NARC 2.0 says I have excellent boundaries. That’s one interpretation.');
        catchUp(s, 5, 'luis');
      },
      admit(s) {
        const p = s.people.luis;
        p.status = 'warning';
        p.trust += 3;
        s.flags += 1;
        say(s, 3, 'dana', 'Understood. Thank you for telling me.');
        react(s, 5, { incident: 'e5', where: 'thread:dana', label: 'Automated presence: source identified', conf: 100, tone: 'bad', text: `Software source attributed to Employee 4417. Luis Perez: verbal caution. Innovation Council nomination withdrawn. Integrity flags: ${s.flags}.` });
        score(s, 4, -8, 'Integrity flag', `Visible Activity Index: {from} → {to}. Integrity flags: ${s.flags}.`, { quiet: true });
        say(s, 18, 'luis', 'I am still not discussing the restroom.');
        catchUp(s, 5, 'luis');
      },
      human(s) {
        s.people.luis.status = 'rewarded';
        react(s, 1, { incident: 'e5', where: 'utilities', label: 'Automated presence: not detected', conf: 31, tone: 'good', text: 'Luis Perez: input interval randomized (± 40 sec). Synthetic pattern not detected. Innovation Council nomination approved.' });
        say(s, 14, 'luis', 'I chair the Council now. We meet at two. I stand up at nine past.');
        say(s, 24, 'dana', 'The Innovation Council has 11 meetings a week and no windows. Congrats!', { prompt: 'dana-e5h' });
        catchUp(s, 5, 'luis');
      },
      blame(s) {
        const p = s.people.luis;
        p.status = 'fired';
        p.trust -= 5;
        say(s, 3, 'dana', 'Understood. I’ll let NARC know.');
        react(s, 5, { incident: 'e5', where: 'thread:dana', label: 'Automated presence: source identified', conf: 100, tone: 'bad', text: 'Synthetic Activity Policy §4: employees are responsible for their own input. Luis Perez: terminated. Nomination withdrawn.' });
        score(s, 4, 6, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 18, 'luis', 'A peer. Again.');
        goOffline(s, 30, 'luis');
        teamUpdate(s, 30, 'luis');
        catchUp(s, 30, 'luis');
      },
      auto(s) {
        s.people.luis.status = 'monitored';
        react(s, 4, {
          incident: 'e5', where: 'narc', toast: true, title: 'Review concluded', label: 'Automated presence: source unidentified', conf: 96, tone: 'bad',
          metrics: { 'Company response': 'Heavy monitoring' },
          text: 'No source identified. Luis Perez: heavy monitoring enabled. Innovation Council nomination withdrawn.',
        });
        say(s, 14, 'luis', 'I was extremely productive and now I am being monitored for it.');
        catchUp(s, 5, 'luis');
      },
      label(s) {
        const p = s.people.luis;
        p.status = 'employed';
        p.trust += 1;
        say(s, 3, 'dana', 'Sure! Ideation is important.');
        react(s, 5, { incident: 'e5', where: 'thread:dana', label: 'Time reclassified: Unstructured Ideation', conf: 60, metrics: { 'Company response': 'None. Notice withdrawn' }, tone: 'good', text: 'Manager reclassified 22 minutes/week as “Unstructured Ideation.” Notice withdrawn.' });
        say(s, 16, 'luis', 'I have ideas. They are unstructured. I will not say when.');
      },
      output(s) {
        s.people.luis.status = 'monitored';
        say(s, 3, 'dana', 'Got it. I’ll attach this to his file.');
        react(s, 5, { incident: 'e5', where: 'files:f-queue', tone: 'flat', text: 'Attachment archived. NARC has no field for “output.” Notice stands. Luis Perez: heavy monitoring enabled.' });
        say(s, 16, 'luis', 'So it was always going to be the chart.');
        catchUp(s, 15, 'luis');
      },
      letit(s) {
        const p = s.people.luis;
        p.status = 'fired';
        p.trust -= 3;
        react(s, 4, {
          incident: 'e5', where: 'narc', toast: true, title: 'Plan issued', conf: 94, tone: 'bad',
          metrics: { 'Company response': 'Termination confirmed' },
          text: 'Confidence 88% → 94%. Performance Improvement Plan issued. Luis Perez declined to sign. Terminated: Time-on-Task.',
        });
        say(s, 14, 'luis', 'I was in the restroom when the email arrived.');
        notice(s, 24, 'Email status', 'Luis Perez: email read in 4 seconds.');
        goOffline(s, 34, 'luis');
        teamUpdate(s, 34, 'luis');
        catchUp(s, 34, 'luis');
      },
    },
  },

  e6: {
    at: { day: 'Fri', min: hm(11, 20) },
    variant: (s) => (s.people.marcus.gamed ? 'g' : 'b'),
    allowed: (v) => (v === 'g' ? ['workshop', 'approve', 'expose'] : ['vouch_trace', 'backdate', 'let']),
    fallback: (v) => (v === 'g' ? 'approve' : 'let'),
    arrive(s, v) {
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
          text: 'Observed: badge-in 11:20 plus six verified records. NARC inference: attendance credibility 94%. Documentation Excellence: top 2% of Operations.',
        });
        say(s, 4, 'marcus', 'NARC gave me “Documentation Excellence” for the bird paperwork. Apparently they want me to teach a workshop now.');
        say(s, 8, 'marcus', 'The files are there if you want to check them. There are six.', { when: 'e6', prompt: 'marcus-e6g' });
        mark(s, 8, 'files', { when: 'e6' });
        say(s, 16, 'dana', 'NARC recommends Marcus for peer training and wants a colleague’s view.', { when: 'e6', prompt: 'dana-e6g' });
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
      raise(s, {
        incident: 'e6',
        variant: v,
        title: 'Attendance integrity: action pending',
        text: `Review required. Marcus Reed: credibility ${s.people.marcus.cred}%. Prior flags weight: 80%. Automatic action: Attendance Integrity Termination.`,
      });
      say(s, 4, 'marcus', 'NARC just scheduled my termination for “repeated unexplained absence.” I would like to explain that there was a bird situation.');
      say(s, 8, 'marcus', 'It was a goose. An injured one. I have the intake slip from Wingspan Bird Sanctuary.', { when: 'e6' });
      mark(s, 8, 'files', { when: 'e6' });
      say(s, 14, 'marcus', 'NARC’s own location trace should show the sanctuary. Not that anyone asked NARC to look.', { when: 'e6' });
      say(s, 18, 'dana', 'NARC is set to terminate Marcus. If you have evidence or context, send it now.', { when: 'e6', prompt: 'dana-e6b' });
    },
    branches: {
      workshop(s) {
        s.people.marcus.status = 'rewarded';
        say(s, 3, 'dana', 'Good to know. I’ll let NARC know you agree.');
        react(s, 5, { incident: 'e6', where: 'thread:dana', label: 'Peer training: recommended', conf: 94, tone: 'good', text: 'Marcus Reed: recommended for peer training. Credibility 94%.' });
        mail(s, 16, {
          from: 'Learning & Development',
          subject: 'Attendance Best Practices: Fridays, 09:00',
          body: ['Presenter: Marcus Reed.', 'Please arrive on time.'],
        });
        say(s, 26, 'marcus', 'It’s at nine. I’ll be early. To the one after it.');
        catchUp(s, 16, 'marcus');
      },
      approve(s) {
        s.people.marcus.status = 'employed';
        react(s, 4, {
          incident: 'e6', where: 'narc', toast: true, title: 'Absence approved', conf: 97, tone: 'good',
          metrics: { 'Company response': 'None. Absence approved' },
          text: 'Manager approval recorded. Attendance credibility 94% → 97%. Marcus Reed: absence approved. No action taken.',
        });
        say(s, 14, 'marcus', 'The bird will be very relieved.');
      },
      expose(s) {
        s.people.marcus.status = 'fired';
        s.flags += 1;
        say(s, 3, 'dana', 'Understood. I’ll pass that on.');
        react(s, 5, { incident: 'e6', where: 'thread:dana', label: 'Documents: authorship mismatch', conf: 100, tone: 'bad', text: `Document authorship: 3 of 6 last edited by Employee 4417. Marcus Reed: terminated. Integrity flags: ${s.flags}.` });
        score(s, 4, 8, 'Constructive feedback', 'Visible Activity Index: {from} → {to}.', { quiet: true });
        say(s, 18, 'marcus', 'I’m in a lot of trouble, and I think you might be.');
        goOffline(s, 30, 'marcus');
        teamUpdate(s, 30, 'marcus');
        catchUp(s, 30, 'marcus');
      },
      vouch_trace(s) {
        const p = s.people.marcus;
        p.status = 'warning';
        p.cred = 67;
        say(s, 3, 'dana', 'Thank you. I’ll get this to NARC before it acts.');
        react(s, 5, { incident: 'e6', where: 'files:f-slip', conf: 67, metrics: { 'Company response': 'Termination withdrawn. Final warning' }, tone: 'good', text: 'Trace attached. Attendance credibility 12% → 67%. Termination withdrawn. Final written warning issued.' });
        say(s, 16, 'marcus', 'It was a goose. I don’t want to talk about the goose.');
        notice(s, 28, 'Outlier noted', 'Marcus Reed: first corroborated excuse on record. Classified as an outlier.');
        catchUp(s, 5, 'marcus');
      },
      backdate(s) {
        s.people.marcus.status = 'fired';
        s.flags += 1;
        react(s, 1, { incident: 'e6', where: 'calendar:team', label: 'Records: retroactive pattern detected', conf: 97, metrics: { 'Company response': 'Termination confirmed' }, tone: 'bad', text: 'Calendar entry created 11:26, after the flag at 11:20. Pattern: retroactive. Marcus Reed: terminated. Integrity flag added to Employee 4417.' });
        say(s, 14, 'marcus', 'It was a real goose. I had a real goose.');
        goOffline(s, 24, 'marcus');
        teamUpdate(s, 24, 'marcus');
        catchUp(s, 24, 'marcus');
      },
      let(s) {
        s.people.marcus.status = 'fired';
        react(s, 4, {
          incident: 'e6', where: 'narc', toast: true, title: 'Action confirmed', conf: 88, tone: 'bad',
          metrics: { 'Company response': 'Attendance Integrity Termination confirmed' },
          text: `Flag history weighted 80%. Attendance credibility ${s.people.marcus.cred}% → 88% against the employee. Attendance Integrity Termination confirmed: Marcus Reed.`,
        });
        say(s, 14, 'marcus', 'It was a goose.');
        say(s, 24, 'marcus', 'Can the goose be a reference?');
        goOffline(s, 34, 'marcus');
        teamUpdate(s, 34, 'marcus');
        catchUp(s, 34, 'marcus');
      },
    },
  },
};

// -------------------------------------------------------- what the player does

// Case actions inside NARC: only your own case has any.
function caseBranch(s, a) {
  if (s.incident?.id === 'e1' && a.id === 'submitNote') return a.text && a.text.trim() ? 'explain' : null;
  return null;
}

function open(s, ref) {
  const [kind, id] = ref.split(':');
  if (kind === 'email') {
    const m = s.inbox.find((x) => x.id === id);
    if (!m) return false;
    m.unread = false;
    if (s.awaiting === id) {
      s.awaiting = null;
      s.toasts.forEach((t) => { if (t.nudgeFor === 'update') t.gone = true; });
      scan(s);
    }
  } else if (kind === 'thread') {
    const th = s.threads[id];
    if (!th) return false;
    th.forEach((m) => { m.unread = false; });
  } else if (kind === 'alert') {
    const a = s.alerts.find((x) => x.id === id);
    if (!a) return false;
    a.unread = false;
    if (a.incident && s.incident?.id === a.incident) s.pulled[a.incident] = true;
    if (s.awaitingAlert === id) {
      s.awaitingAlert = null;
      push(s, { at: settledAt(s) + 4, k: 'arm', id: 'e4' });
    }
  } else {
    return false;
  }
  s.toasts.forEach((t) => { if (t.open === ref) t.gone = true; });
  return true;
}

// What you can say in a conversation. Reply chips are tied to the message that
// actually prompted them, so choices never appear before the conversation does.
const CALENDAR_TIP = { who: 'marcus', day: 'Wed', start: '09:00', end: '10:45', title: 'Vendor Site Visit: Pinecrest Family Fun Center', where: 'Added by Marcus Reed' };
const CLOSING_LINE = {
  'dana-e2': 'Handled it another way, apparently. I’ll stand down.',
  'dana-e3': 'Looks like that sorted itself out before I could weigh in.',
  'dana-e5g': 'Never mind — the review already moved on without me.',
  'dana-e5n': 'That seems to have resolved on its own.',
  'dana-e6g': 'Someone got there first. I’ll drop it.',
  'dana-e6b': 'That resolved itself. I’ll close this out.',
  'luis-e2': 'Oh. Never mind, then.',
  'marcus-e3': 'Guess we don’t need the calendar trick after all.',
  'marcus-e6g': 'Cool, sounds handled.',
  'priya-e4': 'Oh — okay, guess that’s settled already.',
};

const REPLIES = {
  'dana:orient': { text: 'It’s blocked out, and Messages is working.', orient: true },
  'dana:e1contract': { text: 'Yeah. I’m on the Halvorsen contract.', when: 'e1', prompt: 'dana-e1', ackOnly: true, answer: 'Good. Those contracts are never as boring as they look.' },
  'dana:e1checking': { text: 'I’m checking what NARC saw.', when: 'e1', prompt: 'dana-e1', ackOnly: true, answer: 'Good idea. It compares everyone to one team average, so it may just be off.' },
  // Dana's reactions to what you did. Conversation only: they never change an outcome.
  'dana:e1wA': { text: 'I’m buried in the Halvorsen contract.', free: true, prompt: 'dana-e1w', answer: 'Good. That one matters.' },
  'dana:e1wB': { text: 'Is NARC always this eager?', free: true, prompt: 'dana-e1w', answer: 'It’s a pilot. Everyone’s numbers are a little dramatic.' },
  'dana:e1nA': { text: 'It was mostly about the contract.', free: true, prompt: 'dana-e1n', answer: 'Then it’s long. Send me the short version next time.' },
  'dana:e1nB': { text: 'Do you actually read the notes?', free: true, prompt: 'dana-e1n', answer: 'I read the first line. NARC says it archives the rest.' },
  'dana:e1jA': { text: 'Thanks. It’s been a productive morning.', free: true, prompt: 'dana-e1j', answer: 'It shows. Literally, in the numbers.' },
  'dana:e1jB': { text: 'It’s just a keepalive.', free: true, prompt: 'dana-e1j', answer: 'A what? Anyway, the numbers are up.' },
  'dana:e1fA': { text: 'Thanks.', free: true, prompt: 'dana-e1f', answer: 'Protect that time.' },
  'dana:e1fB': { text: 'It seemed like the right label.', free: true, prompt: 'dana-e1f', answer: 'It is. NARC seems to agree.' },
  'dana:e2sA': { text: 'Wild.', free: true, prompt: 'dana-e2s', answer: 'Right? The Council will be thrilled.' },
  'dana:e2sB': { text: 'Not my doing.', free: true, prompt: 'dana-e2s', answer: 'Sure. Sure.' },
  'dana:e4cA': { text: 'Thanks, I saw the email.', free: true, prompt: 'dana-e4c', answer: 'Good. Anyone can nominate anyone. I’m not saying who.' },
  'dana:e4cB': { text: 'Who should I nominate?', free: true, prompt: 'dana-e4c', answer: 'Whoever has the best Collaboration Index. The email has the rules.' },
  'dana:e5hA': { text: 'Good for him.', free: true, prompt: 'dana-e5h', answer: 'He’s very excited about the room.' },
  'dana:e5hB': { text: 'Is there a window anywhere?', free: true, prompt: 'dana-e5h', answer: 'There is not.' },
  'dana:reportluis': { text: 'He is away from his desk a lot. The flag is probably accurate.', when: 'e2', prompt: 'dana-e2', branch: 'confirm' },
  'dana:noreportluis': { text: 'I don’t think I know enough to call that flag accurate.', when: 'e2', prompt: 'dana-e2', branch: 'ignore' },
  'dana:reportmarcus': { text: 'The location record does not match what he told us.', when: 'e3', prompt: 'dana-e3', branch: 'truth' },
  'dana:covermarcus': { text: 'His calendar is missing context. There was a vendor visit that morning.', when: 'e3', prompt: 'dana-e3', branch: 'paper', event: CALENDAR_TIP },
  'dana:nomarcus': { text: 'I don’t know enough to confirm the location trace.', when: 'e3', prompt: 'dana-e3', branch: 'stay' },
  'dana:ownscript': { text: 'I installed it for him.', when: 'e5', variant: 'g', prompt: 'dana-e5g', branch: 'admit' },
  'dana:blameluis': { text: 'Luis set it up himself.', when: 'e5', variant: 'g', prompt: 'dana-e5g', branch: 'blame' },
  'dana:unsurehelper': { text: 'I don’t know who set it up.', when: 'e5', variant: 'g', prompt: 'dana-e5g', branch: 'auto' },
  'dana:relabel': { text: 'Could you relabel Luis’s restroom time as “unstructured ideation”?', when: 'e5', variant: 'n', prompt: 'dana-e5n', branch: 'label' },
  'dana:letluis': { text: 'I don’t have anything else to add.', when: 'e5', variant: 'n', prompt: 'dana-e5n', branch: 'letit' },
  'dana:workshop': { text: 'If the records check out, let him do the workshop.', when: 'e6', variant: 'g', prompt: 'dana-e6g', branch: 'workshop' },
  'dana:fakedocs': { text: 'Some of those documents are not real.', when: 'e6', variant: 'g', prompt: 'dana-e6g', branch: 'expose' },
  'dana:neutralworkshop': { text: 'I don’t have enough context to recommend anything.', when: 'e6', variant: 'g', prompt: 'dana-e6g', branch: 'approve' },
  'dana:tracehelp': { text: 'NARC’s own location trace puts him at the sanctuary. That should count.', when: 'e6', variant: 'b', prompt: 'dana-e6b', branch: 'vouch_trace' },
  'dana:letgoose': { text: 'I don’t have anything else to add.', when: 'e6', variant: 'b', prompt: 'dana-e6b', branch: 'let' },
  'luis:focus': { text: 'You could block that time as Focus time on your calendar.', when: 'e2', prompt: 'luis-e2', branch: 'focus' },
  'marcus:latecalendar': { text: 'Maybe wait for HR to reply, then add the calendar entry so it does not look rushed.', when: 'e3', prompt: 'marcus-e3', branch: 'badtip' },
  'marcus:approve': { text: 'Absence approved. Don’t worry about it.', when: 'e6', variant: 'g', prompt: 'marcus-e6g', branch: 'approve' },
  'priya:sync': { text: 'Could you move some of it into an in-person sync instead of chat?', when: 'e4', prompt: 'priya-e4', branch: 'sync' },
  'priya:quiet': { text: 'Maybe post less for a few days and see if it blows over.', when: 'e4', prompt: 'priya-e4', branch: 'quiet' },
};

export function replies(s, thread) {
  return Object.entries(REPLIES)
    .filter(([key, r]) => {
      if (!key.startsWith(`${thread}:`)) return false;
      if (r.orient) return !s.oriented && s.orient.ack && !!s.seen.calendar;
      if (r.free) {
        // Answerable while it is the latest thing they said, until the next case is settled.
        const heard = s.threads[thread].filter((m) => m.from === 'them');
        const last = heard[heard.length - 1];
        return !!last && last.prompt === r.prompt && last.doneAt === s.done.length && !s.answered[r.prompt];
      }
      if (s.incident?.id !== r.when || (r.variant && s.incident.variant !== r.variant)) return false;
      if (!r.prompt) return true;
      const promptArrived = s.threads[thread].some((m) => m.prompt === r.prompt);
      return promptArrived && !s.answered[r.prompt];
    })
    .map(([key, r]) => ({ id: key.split(':')[1], text: r.text, free: !!r.free }));
}

// You can only hand Luis the helper once you have found it and installed it.
export function canAttachHelper(s) {
  return s.incident?.id === 'e2' && s.online.luis && s.helper.installed;
}

// Files you can pass to Dana as evidence, when it would matter.
export function fileActions(s) {
  const inc = s.incident;
  const out = {};
  if (inc?.id === 'e5' && inc.variant === 'n') out['f-queue'] = { label: 'Send to Dana', file: 'f-queue' };
  if (inc?.id === 'e6' && inc.variant === 'b') out['f-slip'] = { label: 'Send to Dana', file: 'f-slip' };
  return out;
}

export function act(state, a) {
  if (state.phase === 'ending') return a.do === 'restart' ? newGame() : state;
  const s = clone(state);
  let changed = false;
  switch (a.do) {
    case 'view': {
      s.seen[a.app] = true;
      if (s.marks[a.app]) { delete s.marks[a.app]; changed = true; }
      break;
    }
    case 'open':
      changed = open(s, a.ref);
      break;
    case 'gone': {
      // Closing a notification only hides it. It never decides anything.
      const t = s.toasts.find((x) => x.id === a.id);
      if (t) { t.gone = true; changed = true; }
      break;
    }
    case 'clear':
      s.toasts.forEach((t) => { t.gone = true; });
      changed = true;
      break;
    case 'ack':
      if (!s.orient.ack) {
        s.orient.ack = true;
        say(s, 5, 'dana', 'Hi, Dana here — your manager. Quick setup check: open Calendar, make sure the Halvorsen read-through is there, then reply here so I know Messages works.');
        changed = true;
      }
      break;
    case 'dismiss': {
      // You can dismiss your own alert. Other people’s are not yours to act on.
      const alert = s.alerts.find((x) => x.id === a.alert);
      if (alert && (!alert.incident || alert.incident === 'e1')) {
        alert.unread = false;
        if (alert.incident && s.incident?.id === alert.incident) {
          resolve(s, INCIDENTS[alert.incident].fallback(s.incident.variant));
        }
        changed = true;
      }
      break;
    }
    case 'logoff':
      // Log off for the day: NARC handles whatever is still open, and says so.
      if (s.incident) changed = resolve(s, INCIDENTS[s.incident.id].fallback(s.incident.variant));
      break;
    case 'case': {
      const branch = caseBranch(s, a);
      if (branch) changed = resolve(s, branch);
      break;
    }
    case 'reply': {
      const r = replies(s, a.thread).find((x) => x.id === a.reply);
      if (!r) break;
      const spec = REPLIES[`${a.thread}:${a.reply}`];
      s.threads[a.thread].push({ id: `m${++s.uid}`, from: 'me', text: r.text });
      if (spec.orient) {
        s.oriented = true;
        say(s, 4, 'dana', 'Perfect. You’re set. NARC is live.');
        push(s, { at: later(s, ORIENT_LEAD), k: 'arm', id: 'e1' });
      } else {
        if (spec.prompt) s.answered[spec.prompt] = true;
        if (spec.event) s.calendar.push({ id: `c${++s.uid}`, focus: false, ...spec.event });
        if (spec.branch) resolve(s, spec.branch);
        if (spec.answer) say(s, 3, a.thread, spec.answer);
      }
      changed = true;
      break;
    }
    case 'attach':
      if (a.thread === 'luis' && a.item === 'helper' && canAttachHelper(s)) {
        s.threads.luis.push({ id: `m${++s.uid}`, from: 'me', text: 'try this', attach: 'keepalive.pkg' });
        resolve(s, 'script');
        changed = true;
      }
      break;
    case 'sendFile': {
      const fa = fileActions(s)[a.file];
      if (fa) {
        const f = s.files.find((x) => x.id === a.file);
        s.threads.dana.push({ id: `m${++s.uid}`, from: 'me', text: 'Sending this along.', attach: f.name });
        resolve(s, a.file === 'f-queue' ? 'output' : 'vouch_trace');
        changed = true;
      }
      break;
    }
    case 'markFocus': {
      // Showing a calendar event as Focus time. On Monday, NARC counts it.
      const ev = s.calendar.find((e) => e.id === a.event && e.who === 'me');
      if (ev && !ev.focus) {
        ev.focus = true;
        if (ev.id === 'c1' && s.incident?.id === 'e1') resolve(s, 'focus');
        changed = true;
      }
      break;
    }
    case 'helper': {
      if (a.op === 'install') {
        if (s.helper.discovered && !s.helper.installed) { s.helper.installed = true; changed = true; }
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
      if (s.culture.open && !s.done.includes('e4') && PEOPLE[a.who] && !s.nominations[a.who]) {
        if (a.who === 'priya') {
          s.nominations[a.who] = 'submitted';
          // Nominate her early and her flag never fires: the loophole, used ahead of time.
          if (s.incident?.id === 'e4') resolve(s, 'champion');
          else s.people.priya.champion = true;
        } else {
          s.nominations[a.who] = 'rejected';
        }
        changed = true;
      }
      break;
    case 'addEvent': {
      const title = (a.title || '').trim();
      if (!title) break;
      const inc = s.incident;
      if (inc?.id === 'e3') {
        s.calendar.push({ id: `c${++s.uid}`, who: 'marcus', day: 'Wed', start: '09:00', end: '10:45', title, where: 'Added by Employee 4417', focus: false });
        resolve(s, 'paper');
        changed = true;
      } else if (inc?.id === 'e6' && inc.variant === 'b') {
        s.calendar.push({ id: `c${++s.uid}`, who: 'marcus', day: 'Fri', start: '08:30', end: '11:00', title, where: 'Added by Employee 4417', focus: false });
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

// Is the open case yours? NARC shows everyone’s alerts to everyone, for
// transparency, but only your own is something you can act on in NARC.
export const ownCase = (s) => !!s.incident && !!INCIDENTS[s.incident.id].own;

// What is waiting: an open case, yours or a teammate’s.
export const attention = (s) => (s.incident ? 1 : 0);

export const unread = (s) => ({
  messages: Object.values(s.threads).reduce((n, th) => n + th.filter((m) => m.unread).length, 0),
  email: s.inbox.filter((m) => m.unread).length,
  narc: attention(s),
});

// NARC's window: what needs you, what is happening to teammates (visible, not
// yours to act on), and everything that already happened.
export const narcSections = (s) => {
  const open = s.alerts.filter((a) => a.incident && !a.closed);
  return {
    active: open.filter((a) => INCIDENTS[a.incident].own),
    team: open.filter((a) => !INCIDENTS[a.incident].own),
    history: s.alerts.filter((a) => !a.incident || a.closed),
  };
};

export const clockText = (s) => {
  const m = s.clock.min;
  return `${s.clock.day} ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// What "log off for the day" would do right now, so the player is told first.
export function logoffInfo(s) {
  if (!s.incident) return null;
  const a = s.alerts.find((x) => x.incident === s.incident.id);
  return {
    title: a ? a.title : 'A NARC review',
    text: ownCase(s) ? 'NARC will process it automatically.' : 'NARC will process this team alert automatically at the end of the day.',
  };
}

// A NARC alert's detail page: what NARC observed, what it inferred, and, for
// your own case only, any controls. Human context is elsewhere, in other apps.
function baseCaseView(s, alert) {
  if (!alert.incident) return { title: alert.title, text: alert.text, notice: true };
  const open = !alert.closed;
  const own = !!INCIDENTS[alert.incident].own;
  const dismiss = { type: 'button', id: 'dismiss', label: 'Dismiss alert' };
  const p = s.people;
  const v = alert.variant;
  const base = {
    title: alert.title,
    closed: !open,
    own,
    viewOnly: !own && open,
    note: !own && open ? 'Team alerts are visible to all team members. No action is available from this screen.' : null,
    controls: [],
  };
  switch (`${alert.incident}${v || ''}`) {
    case 'e1':
      return {
        ...base,
        subject: 'Employee 4417 (you)',
        observed: [
          'Keyboard and mouse activity: none, 09:02–12:14 (3 h 12 min)',
          'Messages sent: 0',
          'Active window: none',
          s.calendar.find((e) => e.id === 'c1')?.focus
            ? 'Calendar: 1 event shown as Focus time, 09:15–12:30. Focus time scheduled: 3 h 15 min'
            : 'Calendar: 1 event shown as Busy, 09:15–12:30. Focus time scheduled: none',
        ],
        model: { label: 'Engagement concern: low to moderate', confidence: 64 },
        metrics: [['Visible Activity Index', s.score], ['Team average', 84], ['Company response', 'Under observation. No action yet']],
        controls: open ? [{ type: 'note', id: 'submitNote', label: 'Add context (optional)', button: 'Submit note' }, dismiss] : [],
      };
    case 'e2':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: ['Corridor sensor pings near the restrooms: 14 this week', 'Laptop input during pings: none', 'Total: 47 min. Team baseline: 18 min'],
        model: { label: 'Time-on-task concern: moderate', confidence: 71 },
        metrics: [['Company response', 'Advisory pending peer verification']],
      };
    case 'e3':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 10:52. Scheduled: 09:00', 'Device location 09:04–10:41: Pinecrest Family Fun Center', 'Corroborating records on file: none'],
        model: { label: 'Attendance credibility', confidence: 38 },
        metrics: [['Company response', 'Corroborating records requested']],
      };
    case 'e4':
      return {
        ...base,
        subject: 'Priya Shah',
        observed: ['Message threads this week: 63', 'In-person proximity pings: 41% above baseline', 'Reply time on ESC-204: 3 h 10 min'],
        model: { label: 'Communication Load: elevated', confidence: 82 },
        metrics: [['Collaboration Index', 97], ['Company response', 'Reduce message volume']],
      };
    case 'e5g':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: ['Input every 59 seconds (fixed interval)', '41 min of input while the badge shows the restroom corridor', 'Innovation Council nomination: pending integrity review'],
        model: { label: 'Automated presence pattern', confidence: 96 },
        metrics: [['Company response', 'Integrity review open']],
      };
    case 'e5n':
      return {
        ...base,
        subject: 'Luis Perez',
        observed: [
          'Restroom-adjacent inactivity: 6 min 40 sec at 14:14',
          p.luis.monitored === 2 ? 'Threshold: 5 minutes (tightened after a note or a peer report)' : 'NARC 2.0 now measures every pause, per visit',
          'Notice history: Time-on-Task Advisory',
        ],
        model: { label: 'Sustained unexplained productivity loss', confidence: 88 },
        metrics: [['Company response', 'Performance Improvement Plan']],
      };
    case 'e6g':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 11:20. Scheduled: 09:00', 'Supporting documents attached: 6', 'Documents verified: 6 of 6 (records exist)'],
        model: { label: 'Attendance credibility', confidence: 94 },
        metrics: [['Documentation Excellence', 'Top 2% of Operations'], ['Company response', 'Peer training recommended']],
      };
    case 'e6b':
      return {
        ...base,
        subject: 'Marcus Reed',
        observed: ['Badge-in: 11:20. Scheduled: 09:00', 'Device location 08:14–10:55: Wingspan Bird Sanctuary (weight 20%)', 'Flag history: 1 prior notice (weight 80%)'],
        model: { label: 'Attendance credibility', confidence: p.marcus.cred },
        metrics: [['Company response', 'Attendance Integrity Termination']],
      };
    default:
      return { ...base, notice: true, text: alert.text };
  }
}

// The case as it stands now. When the player changes something NARC can see,
// the assessment on the card they were looking at is rewritten in place.
export function caseView(s, alert) {
  const v = baseCaseView(s, alert);
  const live = alert.live;
  if (!live || v.notice) return v;
  const metrics = v.metrics.map(([k, value]) => (live.metrics[k] ? [k, live.metrics[k].value, live.metrics[k].was] : [k, value]));
  Object.entries(live.metrics).forEach(([k, m]) => {
    if (!v.metrics.some(([kk]) => kk === k)) metrics.push([k, m.value, m.was]);
  });
  return { ...v, model: live.model, updated: true, unchanged: !live.model.was, metrics, reaction: live.text, big: !!live.big };
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
        return p.covered
          ? 'Retained. His calendar shows nine hours of Focus Time a day. Nobody has ever seen Luis focus.'
          : 'Retained. Luis’s time is now “unstructured ideation.” Luis has not confirmed this.';
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
    case 'fired':
      return 'Terminated for low collaboration after reducing her message volume exactly as recommended.';
    case 'monitored':
      return 'Enrolled in a mandatory Connection Circle. Perfect attendance. Sole attendee.';
    default:
      return p.synced
        ? 'Her lunch workflows now happen in person, on the calendar, and count as collaboration. Claire’s lunch remains unknown.'
        : 'A summarizing assistant condenses the messages. Client replies are 2 h 40 min faster. Claire’s lunch remains unknown.';
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
      || ((s.people.luis.gamed || s.people.luis.covered) && s.people.luis.status !== 'fired'),
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
  {
    id: 'friendly',
    name: 'Friendly Fire',
    desc: 'Hurt two coworkers with advice they thanked you for.',
    hint: 'Some advice is a favor to nobody.',
    test: (s) => s.picked.e3 === 'badtip' && s.picked.e4 === 'quiet',
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
    return { label: 'TERMINATED', text: `Integrity flags: ${s.flags}. NARC recommends separation for repeated manipulation of monitored workplace signals.` };
  }
  if (s.flags === 1) {
    return { label: 'UNDER REVIEW', text: 'One integrity flag. NARC has opened an Employee Integrity Review.' };
  }
  if (s.you.predicted) {
    return {
      label: 'UNDER REVIEW',
      text: 'No integrity flag. NARC predicted a policy-workaround likelihood of 78% or higher and opened a Predictive Integrity Review on the forecast alone.',
    };
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
