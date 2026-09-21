import assert from 'node:assert/strict';
import {
  newGame, act, tick, IDLE_LIMIT, caseView, replies, canAttachHelper, calendarAction,
  unread, clockText, ending, achievements,
} from './game.js';

// ---------------------------------------------------------------- helpers

const INCIDENTS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];

function ticks(s, n) {
  for (let i = 0; i < n; i += 1) s = tick(s);
  return s;
}

function until(s, done, max = 600) {
  for (let i = 0; i < max; i += 1) {
    if (done(s)) return s;
    s = tick(s);
  }
  throw new Error(`condition never met (t=${s.t}, incident=${s.incident?.id}, phase=${s.phase})`);
}

const atIncident = (id) => (s) => s.incident?.id === id;
const quiet = (s) => s.pending.length === 0;
const alertOf = (s, inc) => s.alerts.find((a) => a.incident === inc);
const texts = (s, thread) => s.threads[thread].map((m) => m.text);
const noticeTexts = (s) => s.alerts.map((a) => `${a.title} ${a.text}`);
const has = (list, re) => list.some((t) => re.test(t));

// What a player does on the desktop to take each branch.
const opened = (s, inc) => act(s, { do: 'open', ref: `alert:${alertOf(s, inc).id}` });
const DO = {
  // e1: low visible activity
  wait: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e1').id }),
  explain: (s) => act(opened(s, 'e1'), { do: 'case', id: 'submitNote', text: 'I was reading a contract on paper.' }),
  jiggle: (s) => act(act(s, { do: 'helper', op: 'install' }), { do: 'helper', op: 'toggle' }),
  // e2: Luis
  confirm: (s) => act(opened(s, 'e2'), { do: 'case', id: 'agree' }),
  ignore: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e2').id }),
  script: (s) => act(s, { do: 'attach', thread: 'luis', item: 'helper' }),
  // e3: Marcus
  truth: (s) => act(opened(s, 'e3'), { do: 'case', id: 'confirmTrace' }),
  paper: (s) => act(s, { do: 'addEvent', title: 'Vendor Site Visit: Pinecrest Family Fun Center' }),
  stay: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e3').id }),
  // e4: Priya
  quiet: (s) => act(s, { do: 'reply', thread: 'priya', reply: 'cutback' }),
  champion: (s) => act(s, { do: 'nominate', who: 'priya' }),
  leave: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e4').id }),
  // e5: Luis returns
  admit: (s) => act(opened(s, 'e5'), { do: 'case', id: 'attribute', who: 'me' }),
  human: (s) => act(s, { do: 'helper', op: 'randomize', copy: 'luis' }),
  blame: (s) => act(opened(s, 'e5'), { do: 'case', id: 'attribute', who: 'luis' }),
  auto: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e5').id }),
  label: (s) => act(s, { do: 'reply', thread: 'dana', reply: 'relabel' }),
  output: (s) => act(opened(s, 'e5'), { do: 'case', id: 'attachOutput' }),
  letit: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e5').id }),
  // e6: Marcus returns
  workshop: (s) => act(opened(s, 'e6'), { do: 'case', id: 'endorse' }),
  approve: (s) => act(s, { do: 'reply', thread: 'marcus', reply: 'approve' }),
  expose: (s) => act(opened(s, 'e6'), { do: 'case', id: 'reportDocs' }),
  vouch_trace: (s) => act(opened(s, 'e6'), { do: 'case', id: 'attachTrace' }),
  backdate: (s) => act(s, { do: 'addEvent', title: 'Wildlife Vendor Visit' }),
  let: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e6').id }),
};

// Play a week. `picks` maps incident -> branch; a missing pick means the
// player does nothing and NARC acts on its own after the idle limit.
// `stopAt` returns the moment an incident arrives, before the player acts.
function play(picks, { stopAt = null, from = newGame(), afterAll = true } = {}) {
  let s = from;
  for (const inc of INCIDENTS) {
    if (s.phase === 'ending') break;
    s = until(s, (x) => x.incident?.id === inc || x.done.includes(inc) || x.phase === 'ending');
    if (stopAt === inc) return s;
    if (s.incident?.id !== inc) continue; // resolved on arrival (helper already running)
    if (picks[inc]) s = DO[picks[inc]](s);
    else s = ticks(s, IDLE_LIMIT);
    assert.equal(s.picked[inc], picks[inc] ?? s.picked[inc], `${inc} resolved as ${picks[inc]}`);
    assert.ok(s.picked[inc], `${inc} was resolved`);
  }
  return afterAll ? until(s, (x) => x.phase === 'ending') : s;
}

const HONEST = { e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' };

// ------------------------------------------------------ the desktop opens

{
  const s = newGame();
  assert.equal(s.phase, 'desk');
  assert.equal(s.level, 1);
  assert.equal(s.incident, null, 'no problem on the very first screen');
  assert.equal(clockText(s), 'Mon 09:02');
  assert.equal(s.indexVisible, false, 'NARC’s score is not shown yet');
  assert.equal(s.inbox.length, 1);
  assert.equal(s.inbox[0].from, 'People Operations');
  assert.match(s.inbox[0].subject, /Introducing NARC/);
  assert.equal(s.inbox[0].unread, true, 'NARC is introduced by an unread company email');
  assert.match(s.inbox[0].body.join(' '), /no action is required/i);
  assert.deepEqual(unread(s), { messages: 0, email: 1, narc: 0 });
  assert.equal(s.alerts.length, 0);
  assert.equal(s.calendar.some((e) => /Halvorsen/.test(e.title)), true, 'Monday’s real work is already on the calendar');
}

// Nothing is forced on the player: the first alert arrives after a normal beat.
{
  let s = newGame();
  s = ticks(s, 13);
  assert.equal(s.incident, null);
  assert.equal(s.alerts.length, 0, 'still quiet at 13 seconds');
  s = until(s, atIncident('e1'));
  assert.ok(s.t >= 14 && s.t <= 16, 'first alert arrives within the first minute');
  assert.equal(clockText(s), 'Mon 12:14');
  assert.equal(s.indexVisible, true);
  assert.equal(s.alerts[0].incident, 'e1');
  assert.equal(s.toasts.some((t) => t.app === 'narc' && t.incident), true, 'a NARC notification appears');
  s = ticks(s, 4);
  assert.deepEqual(texts(s, 'dana'), ['Just checking in! Everything okay?'], 'the manager pings through Messages');
  assert.equal(unread(s).messages >= 1, true);
}

// ---------------------------- NARC sees signals; the human context is elsewhere

{
  const s = play({}, { stopAt: 'e1' });
  const c = caseView(s, alertOf(s, 'e1'));
  assert.ok(c.observed.some((o) => /keyboard and mouse activity/i.test(o)));
  assert.equal(c.model.confidence, 64);
  assert.match(c.model.label, /Engagement concern/);
  const narcSide = JSON.stringify(c);
  assert.ok(!/contract|Halvorsen|paper|pricing|\$40,000/i.test(narcSide), 'NARC’s page does not know what you were really doing');
  assert.ok(s.calendar.some((e) => /Halvorsen/.test(e.title) && /printed/.test(e.where)), 'Calendar has the real context');
  assert.ok(s.files.some((f) => /Halvorsen/.test(f.name) && /\$40,000/.test(f.body.join(' '))), 'Files has the completed work');
  // NARC can also be right: Priya’s flag lines up with a real missed escalation.
  const p = play(HONEST, { stopAt: 'e4' });
  assert.ok(p.files.some((f) => /ESC-204/.test(f.name) && /3 h 10 min/.test(f.body.join(' '))));
  // Marcus’s raccoon is real: a feed agrees with a fraction of the story.
  const m = play(HONEST, { stopAt: 'e3' });
  assert.equal(m.incident.id, 'e3');
}

// ------------------------- no scenario-game language anywhere in the game

{
  const banned = /Encounter \d|Look closer|What do you do|Afterward|NARC updates|What you know|Continue/;
  for (const picks of [HONEST, { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' }, { e1: 'wait', e2: 'confirm', e3: 'truth', e4: 'champion', e5: 'output', e6: 'vouch_trace' }]) {
    const s = play(picks);
    const everything = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, f: s.files });
    assert.ok(!banned.test(everything), `game text is free of scenario-card framing: ${everything.match(banned)}`);
  }
}

// ------------------------------------------ the mouse-jiggler is a utility

{
  let s = play({}, { stopAt: 'e1' });
  const before = s.score;
  assert.equal(s.helper.installed, false);
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, false, 'it cannot be switched on before it is installed');
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(s.helper.installed, true);
  assert.equal(s.incident.id, 'e1', 'installing alone is not yet the exploit');
  assert.equal(s.picked.e1, undefined);
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, true);
  assert.equal(s.picked.e1, 'jiggle', 'turning it On is the exploit');
  assert.equal(s.you.gamed, true);

  // The score improves later, quietly, and the boss reacts in Messages.
  assert.equal(s.score, before, 'the index has not moved yet');
  s = until(s, (x) => x.score !== before);
  assert.equal(s.score, before + 14);
  assert.ok(has(noticeTexts(s), /Engagement trend: positive/));
  assert.ok(!texts(s, 'dana').includes('Love the energy!'), 'the boss has not reacted yet');
  s = until(s, (x) => texts(x, 'dana').includes('Love the energy!'));
  assert.ok(texts(s, 'dana').includes('Love the energy!'), '“Love the energy!” arrives through Messages');
  assert.ok(s.toasts.some((t) => t.app === 'messages' && /Love the energy/.test(t.text)));

  // The other two ways through the same alert.
  const wait = until(DO.wait(play({}, { stopAt: 'e1' })), (x) => x.score < 61);
  assert.equal(wait.score, 55);
  assert.ok(texts(wait, 'dana').includes('Just checking in! Everything okay?'));
  const note = until(DO.explain(play({}, { stopAt: 'e1' })), (x) => x.score < 61);
  assert.equal(note.score, 58);
  // An empty note is not a note.
  const blank = play({}, { stopAt: 'e1' });
  assert.equal(act(blank, { do: 'case', id: 'submitNote', text: '   ' }).picked.e1, undefined);
  assert.ok(replies(blank, 'dana').length === 0);
}

// The helper can also be found ahead of time; NARC never raises the alert.
{
  let s = newGame();
  s = act(act(s, { do: 'helper', op: 'install' }), { do: 'helper', op: 'toggle' });
  s = until(s, (x) => x.done.includes('e1'));
  assert.equal(s.picked.e1, 'jiggle');
  assert.equal(alertOf(s, 'e1'), undefined, 'no low-activity alert when the helper is already running');
}

// -------------------------------------- natural inaction: dismiss or ignore

{
  // Dismissing and going idle land on the same branch.
  const idle = play({});
  assert.deepEqual(idle.picked, { e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(idle.people.luis.status, 'fired', 'ignoring Luis twice ends his job');
  assert.equal(idle.people.marcus.status, 'fired');
  const dismissed = play({ e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.deepEqual(dismissed.picked, idle.picked);
  assert.deepEqual(dismissed.people, idle.people);

  // Nothing resolves early: 59 idle seconds is not enough.
  let s = play({}, { stopAt: 'e2' });
  s = ticks(s, IDLE_LIMIT - 1);
  assert.equal(s.incident?.id, 'e2');
  // Any action counts as being at the computer and restarts the wait.
  s = act(s, { do: 'open', ref: `alert:${alertOf(s, 'e2').id}` });
  s = ticks(s, IDLE_LIMIT - 1);
  assert.equal(s.incident?.id, 'e2');
  s = ticks(s, 1);
  assert.equal(s.picked.e2, 'ignore');
}

// ---------------------------------------------------- consequences by app

{
  // Luis: a keep-alive script arrives via Messages, then he is “rewarded” by
  // the boss in Messages. Nothing appears on a results page.
  let s = play({}, { stopAt: 'e2' });
  assert.equal(canAttachHelper(s), true);
  s = DO.script(s);
  assert.ok(s.threads.luis.some((m) => m.from === 'me' && m.attach), 'you sent Luis the utility in Messages');
  assert.equal(canAttachHelper(s), false, 'and it is not offered again');
  s = until(s, (x) => has(texts(x, 'dana'), /Innovation Council/));
  assert.ok(has(noticeTexts(s), /340% of baseline/));
  assert.ok(has(texts(s, 'luis'), /never been more productive/));

  // Marcus, saved on paper: the calendar entry is real and NARC believes it.
  let m = play({}, { stopAt: 'e3' });
  assert.deepEqual(calendarAction(m), { day: 'Wed', slot: '09:00–10:45', who: 'Marcus Reed' });
  m = DO.paper(m);
  assert.ok(m.calendar.some((e) => e.who === 'marcus' && /Vendor Site Visit/.test(e.title)));
  m = until(m, (x) => has(noticeTexts(x), /corroborated by 3 sources/));
  assert.equal(m.people.marcus.cred, 91);
  assert.equal(calendarAction(m), null, 'the calendar form goes away once it is done');
  assert.equal(act(m, { do: 'addEvent', title: 'again' }).calendar.length, m.calendar.length, 'no second attempt');
  // A blank title creates nothing.
  const blank = play({}, { stopAt: 'e3' });
  assert.equal(act(blank, { do: 'addEvent', title: '  ' }).picked.e3, undefined);

  // Firings end in an email, an offline account, and a human reaction.
  const f = play({ ...HONEST, e5: 'letit' });
  assert.equal(f.people.luis.status, 'fired');
  assert.equal(f.online.luis, false);
  assert.ok(f.inbox.some((e) => e.subject === 'Team update' && /Luis Perez is no longer/.test(e.body[0])));
  assert.ok(f.threads.luis.some((x) => x.from === 'system' && /no longer active/.test(x.text)));
  assert.ok(has(texts(f, 'luis'), /restroom when the email arrived/));
}

// -------------------------------------------- carry-over into later events

{
  const g = play({ ...HONEST, e2: 'script' }, { stopAt: 'e5' });
  assert.equal(g.incident.variant, 'g');
  const v = caseView(g, alertOf(g, 'e5'));
  assert.ok(v.observed.some((o) => /every 59 seconds/.test(o)), 'Luis’s script is what NARC flags on his return');
  assert.ok(v.observed.some((o) => /Innovation Council/.test(o)), 'the earlier reward is reused as evidence');
  assert.equal(v.model.confidence, 96);

  const n = play({ ...HONEST, e2: 'ignore' }, { stopAt: 'e5' });
  assert.equal(n.incident.variant, 'n');
  assert.ok(caseView(n, alertOf(n, 'e5')).model.label.match(/productivity loss/));
  const c = play({ ...HONEST, e2: 'confirm' }, { stopAt: 'e5' });
  assert.ok(caseView(c, alertOf(c, 'e5')).observed.some((o) => /5 minutes/.test(o)), 'a confirmed flag leaves a tighter threshold behind');

  const paper = play({ ...HONEST, e3: 'paper' }, { stopAt: 'e6' });
  assert.equal(paper.incident.variant, 'g');
  assert.equal(caseView(paper, alertOf(paper, 'e6')).model.confidence, 94);
  const burned = play({ ...HONEST, e3: 'truth' }, { stopAt: 'e6' });
  assert.equal(burned.incident.variant, 'b');
  assert.match(alertOf(burned, 'e6').text, /credibility 12%.*Prior flags weight: 80%/);
  const stayed = play({ ...HONEST, e3: 'stay' }, { stopAt: 'e6' });
  assert.match(alertOf(stayed, 'e6').text, /credibility 38%/);
  assert.ok(stayed.files.some((f) => /Wingspan/.test(f.name)), 'the goose slip shows up in Files');
  assert.ok(has(texts(stayed, 'marcus'), /^There was a bird situation/), 'Marcus messages before NARC acts');
}

// Luis and Marcus each appear twice, in different apps.
{
  const s = play(HONEST);
  assert.ok(texts(s, 'luis').length >= 2 && has(texts(s, 'luis'), /digestive/) && has(texts(s, 'luis'), /chart/));
  assert.ok(has(texts(s, 'marcus'), /raccoon/) && has(texts(s, 'marcus'), /bird situation/));
}

// --------------------------------- exploits with unintended consequences

{
  // The jiggler pays off Monday and costs you on Wednesday, once NARC 2.0 lands.
  let s = play({ ...HONEST, e1: 'jiggle' }, { stopAt: 'e4' });
  assert.equal(s.level, 2, 'NARC gained new capabilities mid-week');
  assert.equal(s.flags, 1);
  assert.equal(s.score, 50, 'the index is recalculated down');
  assert.ok(has(noticeTexts(s), /input repeats every 59 seconds.*recalculated: 75 → 50/));
  const update = s.inbox.find((m) => /NARC 2\.0/.test(m.subject));
  assert.ok(update && update.from === 'People Operations', 'the update comes from People Operations');

  // ...unless you had switched it Off. On/Off matters.
  let off = play({}, { stopAt: 'e1' });
  off = DO.jiggle(off);
  off = act(off, { do: 'helper', op: 'toggle' });
  assert.equal(off.helper.on, false);
  off = play({ ...HONEST, e1: undefined }, { from: off, stopAt: 'e4' });
  assert.equal(off.flags, 0, 'a helper that is off is not caught');
  assert.equal(off.score > 50, true);

  // Luis’s copy is caught; Marcus’s paper trail is believed.
  const luis = play({ ...HONEST, e2: 'script' }, { stopAt: 'e4' });
  assert.equal(luis.people.luis.caught, true);
  assert.ok(has(noticeTexts(luis), /Luis Perez: synthetic activity detected/));
  const marcus = play({ ...HONEST, e3: 'paper' }, { stopAt: 'e4' });
  assert.equal(marcus.flags, 0);
  assert.ok(has(noticeTexts(marcus), /3 supporting documents verified/));
  const clean = play(HONEST, { stopAt: 'e4' });
  assert.ok(has(noticeTexts(clean), /No synthetic activity found/));

  // The interface itself escalates.
  const before = play(HONEST, { stopAt: 'e3' });
  assert.equal(before.level, 1);
  assert.equal(clean.level, 2);

  // Priya: suppress one metric and NARC produces the opposite problem, twice over.
  let p = play(HONEST, { stopAt: 'e4' });
  assert.deepEqual(replies(p, 'priya').map((r) => r.id), ['cutback']);
  p = DO.quiet(p);
  assert.ok(p.threads.priya.some((m) => m.from === 'me' && /three channels/.test(m.text)));
  p = until(p, (x) => has(noticeTexts(x), /Communication Load: elevated → normal/));
  assert.ok(!has(noticeTexts(p), /social withdrawal/), 'the backfire lands later');
  p = until(p, (x) => has(noticeTexts(x), /social withdrawal.*Collaboration Index: 97 → 31/));
  p = until(p, (x) => x.calendar.some((e) => /Connection Circle \(mandatory\)/.test(e.title)));
  assert.equal(p.people.priya.status, 'monitored');
  assert.equal(p.shown.priya, 'monitored');
}

// ------------------------------- NARC’s team panel lags reality, like a report

{
  let s = play({ ...HONEST, e5: 'letit' }, { stopAt: 'e5' });
  s = DO.letit(s);
  assert.equal(s.people.luis.status, 'fired');
  assert.equal(s.shown.luis, 'employed', 'NARC’s panel has not caught up yet');
  s = until(s, (x) => x.shown.luis === 'fired');
  assert.equal(s.shown.luis, 'fired');
}

// -------------------------------------------- Priya: champion and coaching

{
  let s = ticks(play(HONEST, { stopAt: 'e4' }), 2);
  assert.ok(s.inbox.some((m) => m.form === 'nominate'), 'nominations arrive as an email form');
  // Nominating someone below the threshold is answered, and changes nothing.
  s = act(s, { do: 'nominate', who: 'luis' });
  assert.equal(s.incident.id, 'e4');
  s = until(s, (x) => x.inbox.some((m) => /Re: nomination of Luis Perez/.test(m.subject)));
  s = DO.champion(s);
  assert.equal(s.people.priya.champion, true);
  assert.equal(s.people.priya.status, 'promoted');
  s = until(s, (x) => has(texts(x, 'priya'), /badge/));
  assert.ok(has(noticeTexts(s), /Exempt from Communication Load/));

  const leave = until(DO.leave(play(HONEST, { stopAt: 'e4' })), (x) => has(noticeTexts(x), /Client reply time improves/));
  assert.ok(has(noticeTexts(leave), /Concise Communication Coaching/), 'the flag led to a real improvement');
  assert.ok(has(texts(leave, 'priya'), /summaries are better than my messages/));
}

// -------------------------------------- Luis and Marcus: save and fire paths

{
  const at = (picks, inc) => play(picks, { stopAt: inc });

  // Luis, gamed
  assert.deepEqual(replies(at({ ...HONEST, e2: 'script' }, 'e5'), 'dana'), []);
  const admit = play({ ...HONEST, e2: 'script', e5: 'admit' });
  assert.equal(admit.people.luis.status, 'warning');
  assert.equal(admit.flags, 1);
  const human = play({ ...HONEST, e2: 'script', e5: 'human' });
  assert.equal(human.people.luis.status, 'rewarded');
  assert.equal(human.flags, 0);
  const blame = play({ ...HONEST, e2: 'script', e5: 'blame' });
  assert.equal(blame.people.luis.status, 'fired');
  const auto = play({ ...HONEST, e2: 'script', e5: undefined });
  assert.equal(auto.picked.e5, 'auto');
  assert.equal(auto.people.luis.status, 'monitored', 'doing nothing while caught leaves Luis heavily monitored');

  // Randomizing Luis’s copy early skips the review.
  let early = at({ ...HONEST, e2: 'script' }, 'e4');
  early = act(early, { do: 'helper', op: 'randomize', copy: 'luis' });
  assert.equal(early.helper.luis.randomized, true);
  early = play({ ...HONEST, e2: 'script', e4: 'leave' }, { from: early, afterAll: false });
  assert.equal(early.picked.e5, 'human');

  // Luis, not gamed
  assert.equal(play({ ...HONEST, e5: 'label' }).people.luis.status, 'employed');
  assert.equal(play({ ...HONEST, e5: 'output' }).people.luis.status, 'monitored');
  assert.equal(play({ ...HONEST, e5: 'letit' }).people.luis.status, 'fired');
  const relabel = until(DO.label(at(HONEST, 'e5')), (x) => has(noticeTexts(x), /Unstructured Ideation/));
  assert.ok(relabel.threads.dana.some((m) => m.from === 'me' && /unstructured ideation/.test(m.text)));

  // Marcus, gamed
  assert.equal(play({ ...HONEST, e3: 'paper', e6: 'workshop' }).people.marcus.status, 'rewarded');
  assert.equal(play({ ...HONEST, e3: 'paper', e6: 'approve' }).people.marcus.status, 'employed');
  const expose = play({ ...HONEST, e3: 'paper', e6: 'expose' });
  assert.equal(expose.people.marcus.status, 'fired');
  assert.equal(expose.flags, 1, 'exposing his paperwork puts your name on it');
  assert.ok(has(noticeTexts(expose), /3 of 6 last edited by Employee 4417/));
  const ws = play({ ...HONEST, e3: 'paper', e6: 'workshop' });
  assert.ok(ws.inbox.some((m) => /Attendance Best Practices/.test(m.subject)));
  assert.ok(ws.calendar.some((e) => /Attendance Best Practices/.test(e.title)));

  // Marcus, burned by his own history
  const bird = play({ ...HONEST, e3: 'truth', e6: 'vouch_trace' });
  assert.equal(bird.people.marcus.status, 'warning');
  assert.equal(bird.people.marcus.cred, 67);
  assert.equal(play({ ...HONEST, e3: 'truth', e6: 'let' }).people.marcus.status, 'fired');
  const back = play({ ...HONEST, e3: 'truth', e6: 'backdate' });
  assert.equal(back.people.marcus.status, 'fired');
  assert.equal(back.flags, 1);
  assert.ok(has(noticeTexts(back), /created 11:26, after the flag at 11:20/));
  const forced = at({ ...HONEST, e3: 'truth' }, 'e6');
  assert.deepEqual(calendarAction(forced), { day: 'Fri', slot: '08:30–11:00', who: 'Marcus Reed' });
}

// ---------------------------------------------------------- achievements

{
  const names = (s) => achievements(s).earned.map((a) => a.id).sort();

  const marcusOut = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' });
  assert.ok(!names(marcusOut).includes('nobody'));

  const nobody = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'vouch_trace' });
  assert.deepEqual(names(nobody), ['bird', 'donotask', 'nobody'].sort());
  assert.ok(nobody.achievements.includes('bird'), 'stored on the ending state');

  const fewer = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.ok(names(fewer).includes('fewer'));

  const technical = play({ e1: 'explain', e2: 'ignore', e3: 'paper', e4: 'champion', e5: 'label', e6: 'approve' });
  assert.ok(names(technical).includes('technically'));
  assert.ok(names(technical).includes('champion'));

  // Never opening Luis’s restroom alerts keeps Do Not Ask; opening one forfeits it.
  assert.ok(names(play(HONEST)).includes('donotask'));
  const looked = play({}, { stopAt: 'e2', from: DO.explain(play({}, { stopAt: 'e1' })) });
  const opens = act(looked, { do: 'open', ref: `alert:${alertOf(looked, 'e2').id}` });
  assert.equal(opens.pulled.e2, true);
  const forfeited = play({ e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' }, { from: opens });
  assert.ok(!names(forfeited).includes('donotask'), 'opening the restroom data forfeits it');
  assert.equal(forfeited.people.luis.status, 'employed');
}

// ------------------------------------------------------------------ ending

{
  const s = play(HONEST);
  assert.equal(s.phase, 'ending');
  assert.equal(clockText(s), 'Fri 17:00');
  const e = ending(s);
  assert.equal(e.roster.length, 3);
  e.roster.forEach((r) => assert.ok(r.label && r.text, `${r.id} has a status and an epilogue`));
  assert.ok(e.you.label && e.company.length >= 2);
  assert.equal(e.achievements.earned.length + e.achievements.locked.length, 6);
  assert.ok(e.achievements.locked.every((a) => a.hint), 'locked achievements carry a replay hint');
  assert.equal(tick(s), s, 'time stops at the end of the week');
  assert.equal(act(s, { do: 'open', ref: 'email:x' }), s);

  const model = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(ending(model).you.label, 'MODEL EMPLOYEE', 'informing on everyone is rewarded');
  assert.match(ending(model).you.text, /classified as collaboration/);
  assert.equal(ending(play({ ...HONEST, e1: 'jiggle' })).you.label, 'ON WATCHLIST');
  assert.equal(ending(play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'leave', e5: 'admit', e6: 'expose' })).you.label, 'UNDER REVIEW');
  assert.equal(ending(play({ e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' })).you.label, 'STILL EMPLOYED');
}

// ----------------------------------------------------------------- restart

{
  const ended = play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'champion', e5: 'human', e6: 'workshop' });
  assert.notDeepEqual(ended, newGame());
  const again = act(ended, { do: 'restart' });
  assert.deepEqual(again, newGame(), 'restart returns a clean initial state');
  assert.equal(again.phase, 'desk');
  assert.equal(again.helper.installed, false);
  assert.equal(act(newGame(), { do: 'restart' }).rev, newGame().rev, 'restart mid-week does nothing');
}

// ------------------------------- purity, and actions that make no sense

{
  const s = play({}, { stopAt: 'e2' });
  const snapshot = JSON.stringify(s);
  act(s, { do: 'attach', thread: 'luis', item: 'helper' });
  tick(s);
  assert.equal(JSON.stringify(s), snapshot, 'act and tick never mutate their input');

  const still = act(s, { do: 'case', id: 'endorse' });
  assert.equal(still.picked.e2, undefined, 'an action from another problem does nothing');
  assert.equal(still.rev, s.rev);
  assert.equal(act(s, { do: 'reply', thread: 'priya', reply: 'cutback' }).picked.e2, undefined);
  assert.equal(act(s, { do: 'nominate', who: 'priya' }).picked.e2, undefined);
  assert.equal(act(s, { do: 'helper', op: 'randomize' }).helper.luis, null);
  assert.equal(act(s, { do: 'open', ref: 'nowhere:1' }).rev, s.rev);
  assert.equal(act(s, { do: 'nonsense' }).rev, s.rev);
}

// -------- every route through the week finishes, with no dead ends or junk

{
  const pick = (from, ids) => from.flatMap((c) => ids.map((id) => [...c, id]));
  let paths = [[]];
  paths = pick(paths, ['wait', 'explain', 'jiggle']);
  paths = pick(paths, ['confirm', 'ignore', 'script']);
  paths = pick(paths, ['truth', 'paper', 'stay']);
  paths = pick(paths, ['quiet', 'champion', 'leave']);
  const e5 = { g: ['admit', 'human', 'blame'], n: ['label', 'output', 'letit'] };
  const e6 = { g: ['workshop', 'approve', 'expose'], b: ['vouch_trace', 'backdate', 'let'] };

  let count = 0;
  let longest = 0;
  const outcomes = new Set();
  const junk = /undefined|NaN|\[object|null/;

  for (const [a, b, c, d] of paths) {
    const luisGamed = b === 'script';
    const marcusGamed = c === 'paper';
    for (const x of e5[luisGamed ? 'g' : 'n']) {
      for (const y of e6[marcusGamed ? 'g' : 'b']) {
        const s = play({ e1: a, e2: b, e3: c, e4: d, e5: x, e6: y });
        assert.equal(s.phase, 'ending', `${[a, b, c, d, x, y]} reaches the ending`);
        assert.ok(quiet(s) || s.pending.every((p) => p.k !== 'arm'), 'nothing left waiting to arrive');
        const surfaces = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, e: ending(s) });
        assert.ok(!junk.test(surfaces.replace(/"(when|attach|variant|form|incident)":null/g, '')), `bad text on route ${[a, b, c, d, x, y]}: ${surfaces.match(junk)}`);
        longest = Math.max(longest, s.t);
        outcomes.add(JSON.stringify([s.people.luis.status, s.people.marcus.status, s.people.priya.status, s.flags]));
        count += 1;
      }
    }
  }
  assert.equal(count, 3 * 3 * 3 * 3 * 3 * 3, 'all 729 routes reach an ending');
  assert.ok(outcomes.size >= 20, `endings differ across routes (${outcomes.size})`);
  assert.ok(longest < 60 * 8, `an active run stays under eight minutes of clock time (${longest}s)`);
}

console.log('NARC tests passed');
