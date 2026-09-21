import assert from 'node:assert/strict';
import {
  newGame, act, tick, caseView, replies, canAttachHelper, calendarAction,
  unread, attention, narcSections, logoffInfo, clockText, ending, achievements, THREADS,
} from './game.js';

// ---------------------------------------------------------------- helpers

const INCIDENTS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];

function ticks(s, n) {
  for (let i = 0; i < n; i += 1) s = tick(s);
  return s;
}

// Tick until `done`. By default the player reads the NARC 2.0 announcement
// when it lands, like someone at a desk would.
function until(s, done, { max = 2000, reads = true } = {}) {
  for (let i = 0; i < max; i += 1) {
    if (done(s)) return s;
    if (reads && s.awaiting) s = act(s, { do: 'open', ref: `email:${s.awaiting}` });
    else s = tick(s);
  }
  throw new Error(`condition never met (t=${s.t}, incident=${s.incident?.id}, phase=${s.phase})`);
}

const atIncident = (id) => (s) => s.incident?.id === id;
const alertOf = (s, inc) => s.alerts.find((a) => a.incident === inc);
const texts = (s, thread) => s.threads[thread].map((m) => m.text);
const noticeTexts = (s) => s.alerts.map((a) => `${a.title} ${a.text}`);
const has = (list, re) => list.some((t) => re.test(t));
const mailOf = (s, re) => s.inbox.find((m) => re.test(m.subject));

// The orientation a first-time player goes through.
function oriented(s = newGame()) {
  s = act(s, { do: 'open', ref: `email:${s.inbox[0].id}` });
  s = act(s, { do: 'ack' });
  s = until(s, (x) => x.threads.dana.length >= 1);
  s = act(s, { do: 'view', app: 'calendar' });
  return act(s, { do: 'reply', thread: 'dana', reply: 'orient' });
}

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
  script: (s) => act(act(s, { do: 'helper', op: 'install' }), { do: 'attach', thread: 'luis', item: 'helper' }),
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
// player logs off and lets NARC handle it. `stopAt` returns the moment an
// incident arrives, before the player acts.
function play(picks, { stopAt = null, from = null, afterAll = true } = {}) {
  let s = from ?? oriented();
  for (const inc of INCIDENTS) {
    if (s.phase === 'ending') break;
    s = until(s, (x) => x.incident?.id === inc || x.done.includes(inc) || x.phase === 'ending');
    if (stopAt === inc) return s;
    if (s.incident?.id !== inc) continue; // resolved on arrival (helper already running)
    s = picks[inc] ? DO[picks[inc]](s) : act(s, { do: 'logoff' });
    assert.ok(s.picked[inc], `${inc} was resolved`);
    if (picks[inc]) assert.equal(s.picked[inc], picks[inc], `${inc} resolved as ${picks[inc]}`);
  }
  return afterAll ? until(s, (x) => x.phase === 'ending') : s;
}

const HONEST = { e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' };

// ---------------------------------------------- orientation comes first

{
  const s = newGame();
  assert.equal(s.phase, 'desk');
  assert.equal(clockText(s), 'Mon 09:02');
  assert.equal(s.inbox.length, 1);
  const m = s.inbox[0];
  assert.equal(m.from, 'People Operations');
  assert.equal(m.unread, true, 'NARC is introduced by an unread company email');
  const body = m.body.join(' ');
  assert.match(body, /NARC — Networked Assessment & Risk Coordination/, 'the email spells out NARC');
  assert.match(body, /monitor approved workplace activity/, 'and says it monitors workplace activity');
  assert.match(body, /alerts or activity reviews/);
  assert.match(body, /NARC ACTIVE/, 'and says where NARC shows up');
  assert.match(body, /no action is required/i);
  assert.equal(m.form, 'ack', 'with a harmless action to take');
  assert.equal(s.oriented, false);
  assert.equal(s.indexVisible, false, 'NARC’s score is not shown yet');
  assert.deepEqual(unread(s), { messages: 0, email: 1, narc: 0 });
  assert.equal(attention(s), 0);
  assert.equal(s.calendar.some((e) => /Halvorsen/.test(e.title) && /printed/.test(e.where)), true, 'the printed-contract read-through is already on the calendar');

  // Nothing consequential can happen before orientation, however long the player takes.
  const idle = ticks(s, 3000);
  assert.equal(idle.incident, null);
  assert.equal(idle.alerts.length, 0);
  assert.equal(idle.toasts.length, 0);
  assert.equal(idle.pending.length, 0);
  assert.equal(idle.done.length, 0);
}

{
  let s = newGame();
  assert.equal(act(s, { do: 'reply', thread: 'dana', reply: 'orient' }).oriented, false, 'you cannot skip the first step');

  // Step 1: acknowledge the email. Dana introduces herself as the manager.
  s = act(s, { do: 'open', ref: `email:${s.inbox[0].id}` });
  assert.equal(s.oriented, false, 'reading is not the same as acknowledging');
  s = act(s, { do: 'ack' });
  assert.equal(s.threads.dana.length, 0, 'Dana takes a moment');
  s = until(s, (x) => x.threads.dana.length === 1);
  assert.match(s.threads.dana[0].text, /I’m your manager/);
  assert.match(s.threads.dana[0].text, /Calendar/);
  assert.equal(THREADS.dana.role, 'Your manager', 'the thread header says so too');

  // Step 2: look at the calendar, then reply. The reply is not offered until you have.
  assert.deepEqual(replies(s, 'dana'), []);
  s = act(s, { do: 'view', app: 'calendar' });
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['orient']);
  assert.equal(s.oriented, false);
  s = ticks(s, 500);
  assert.equal(s.incident, null, 'still no NARC case: the player has not finished orientation');

  s = act(s, { do: 'reply', thread: 'dana', reply: 'orient' });
  assert.equal(s.oriented, true);
  assert.equal(replies(s, 'dana').length, 0);
  s = ticks(s, 20);
  assert.equal(s.incident, null, 'the first case is not sprung on the player the moment they finish');
  assert.equal(alertOf(s, 'e1'), undefined);
  s = until(s, atIncident('e1'));
  assert.equal(s.indexVisible, true);
  assert.equal(clockText(s), 'Mon 12:14');
  assert.ok(has(texts(s, 'dana'), /Go enjoy your contract/));
}

// ---------------------------- NARC sees signals; the human context is elsewhere

{
  const s = play({}, { stopAt: 'e1' });
  const c = caseView(s, alertOf(s, 'e1'));
  assert.ok(c.observed.some((o) => /keyboard and mouse activity/i.test(o)));
  assert.equal(c.model.confidence, 64);
  assert.match(c.model.label, /Engagement concern/);
  assert.ok(!/contract|Halvorsen|paper|pricing|\$40,000/i.test(JSON.stringify(c)), 'NARC’s page does not know what you were really doing');
  const file = s.files.find((f) => /Halvorsen/.test(f.name) && /\$40,000/.test(f.body.join(' ')));
  assert.ok(file, 'Files has the completed work');
  const edited = /edited today (\d\d):(\d\d)/.exec(file.meta);
  assert.ok(Number(edited[1]) * 60 + Number(edited[2]) < 12 * 60 + 14, 'the file was edited before NARC’s 12:14 alert, not after');
  // NARC can also be right: Priya’s flag lines up with a real missed escalation.
  const p = play(HONEST, { stopAt: 'e4' });
  assert.ok(p.files.some((f) => /ESC-204/.test(f.name) && /3 h 10 min/.test(f.body.join(' '))));
}

// ------------------------- no scenario-game language, and one product name

{
  const banned = /Encounter \d|Look closer|What do you do|Afterward|NARC updates|What you know|Continue|Slack/;
  for (const picks of [HONEST, { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' }, { e1: 'wait', e2: 'confirm', e3: 'truth', e4: 'champion', e5: 'output', e6: 'vouch_trace' }]) {
    const s = play(picks);
    const everything = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, f: s.files });
    assert.ok(!banned.test(everything), `game text is free of scenario-card framing and stray product names: ${everything.match(banned)}`);
  }
}

// ------------------------------------ NARC talks; closing a toast decides nothing

{
  let s = play({}, { stopAt: 'e1' });
  const t = s.toasts.find((x) => x.app === 'narc' && x.incident);
  assert.ok(t, 'a NARC notification appears with the alert');
  assert.equal(t.at, s.t);
  assert.equal(attention(s), 1);

  // Persistent: nothing removes it but the player.
  s = ticks(s, 400);
  assert.equal(s.toasts.find((x) => x.id === t.id).gone, false, 'important NARC notifications do not expire');

  // Closing the toast only hides it.
  s = act(s, { do: 'gone', id: t.id });
  assert.equal(s.toasts.find((x) => x.id === t.id).gone, true);
  assert.equal(s.incident.id, 'e1', 'closing a toast leaves the case open');
  assert.equal(s.picked.e1, undefined);
  assert.equal(alertOf(s, 'e1').closed, false);
  assert.equal(attention(s), 1, 'and NARC still needs you');
  assert.equal(unread(s).narc, 1);

  // "Clear all" is the same: hides notifications, decides nothing.
  const cleared = act(s, { do: 'clear' });
  assert.ok(cleared.toasts.every((x) => x.gone));
  assert.equal(cleared.picked.e1, undefined);
  assert.equal(cleared.incident.id, 'e1');
}

// ------------------------- active cases are separate from NARC's history

{
  let s = play({}, { stopAt: 'e1' });
  let sec = narcSections(s);
  assert.equal(sec.active.length, 1);
  assert.equal(sec.history.length, 0);
  assert.equal(unread(s).narc, 1);

  s = DO.jiggle(s);
  s = until(s, (x) => has(noticeTexts(x), /Engagement trend/));
  sec = narcSections(s);
  assert.equal(sec.active.length, 0, 'a resolved case is no longer a task');
  assert.ok(sec.history.length >= 2, 'the case and its consequence are history');
  assert.equal(attention(s), 0);
  assert.equal(unread(s).narc, 0, 'consequences never inflate the count of things needing you');
  assert.ok(!sec.active.some((a) => /Engagement trend|Advisory/.test(a.title)));

  // Passive notices such as “Advisory issued” are history, not active cases.
  let l = play({}, { stopAt: 'e2' });
  l = DO.ignore(l);
  l = until(l, (x) => has(noticeTexts(x), /Advisory issued/));
  assert.equal(narcSections(l).active.length, 0);
  assert.ok(narcSections(l).history.some((a) => /Advisory issued/.test(a.title)));
}

// ---------------- no hidden fallback: exploring is play, and inaction is legible

{
  let s = play({}, { stopAt: 'e2' });
  // A very long time passes while the player reads, checks every app and opens the case.
  for (const app of ['calendar', 'files', 'utilities', 'messages', 'email']) s = act(s, { do: 'view', app });
  s = opened(s, 'e2');
  s = ticks(s, 5000);
  assert.equal(s.incident?.id, 'e2', 'NARC never decides for a player who is still looking');
  assert.equal(s.picked.e2, undefined);
  assert.equal(alertOf(s, 'e2').closed, false);
  assert.equal(attention(s), 1);

  // Doing nothing is a visible choice: dismissing…
  const dismissed = DO.ignore(s);
  assert.equal(dismissed.picked.e2, 'ignore');
  // …or logging off, which says what will happen first.
  const info = logoffInfo(s);
  assert.equal(info.title, 'Restroom-adjacent inactivity');
  assert.match(info.text, /process it automatically/);
  const off = act(s, { do: 'logoff' });
  assert.equal(off.picked.e2, 'ignore');
  assert.deepEqual(off.people, dismissed.people, 'logging off and dismissing are the same visible decision');
  assert.equal(logoffInfo(off), null, 'nothing to log off from once it is handled');
  assert.equal(act(off, { do: 'logoff' }).rev, off.rev, 'and logging off again does nothing');

  // A whole untouched week still ends, but only because the player logged off each time.
  const idle = play({});
  assert.deepEqual(idle.picked, { e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(idle.people.luis.status, 'fired', 'ignoring Luis twice ends his job');
  assert.equal(idle.people.marcus.status, 'fired');
  assert.deepEqual(play({ e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'letit', e6: 'let' }).people, idle.people);
}

// --------------------------- NARC nudges, and gets pushier as the week goes

{
  let s = play({}, { stopAt: 'e1' });
  const nudges = (x) => x.toasts.filter((t) => t.nudgeFor === 'e1' && !t.gone);
  s = ticks(s, 60);
  assert.equal(nudges(s).length, 0, 'not immediately');
  s = ticks(s, 15);
  assert.equal(nudges(s).length, 1);
  assert.equal(nudges(s)[0].title, 'Review pending');
  assert.match(nudges(s)[0].text, /No action is required/, 'early NARC is polite');
  s = ticks(s, 2000);
  assert.equal(nudges(s).length, 1, 'reminders replace each other instead of piling up');
  const nudge = nudges(s)[0];
  s = DO.wait(s);
  assert.equal(s.toasts.find((t) => t.id === nudge.id).gone, true, 'and disappear when the case is handled');

  // After NARC 2.0 it is more frequent and stops pretending nothing is required.
  let late = play(HONEST, { stopAt: 'e4' });
  late = ticks(late, 50);
  const t4 = late.toasts.filter((t) => t.nudgeFor === 'e4' && !t.gone);
  assert.equal(t4.length, 1);
  assert.equal(t4[0].title, 'Review recommended');
  assert.match(t4[0].text, /team reports/);
  late = ticks(late, 50);
  assert.match(late.toasts.filter((t) => t.nudgeFor === 'e4' && !t.gone)[0].text, /Authentic activity is more valuable than simulated activity/);
}

// --------------------------------------------------- the mouse-jiggler

{
  let s = play({}, { stopAt: 'e1' });
  const before = s.score;
  assert.equal(s.helper.installed, false);
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, false, 'it cannot be switched on before it is installed');
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(s.helper.installed, true);
  assert.equal(s.incident.id, 'e1', 'installing alone is not yet the exploit');
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.picked.e1, 'jiggle', 'turning it On is the exploit');
  assert.equal(s.you.gamed, true);

  assert.equal(s.score, before, 'the index has not moved yet');
  s = until(s, (x) => x.score !== before);
  assert.equal(s.score, before + 14);
  assert.ok(has(noticeTexts(s), /Engagement trend: positive/));
  assert.ok(!texts(s, 'dana').includes('Love the energy!'), 'the boss has not reacted yet');
  s = until(s, (x) => texts(x, 'dana').includes('Love the energy!'));
  assert.ok(s.toasts.some((t) => t.app === 'messages' && /Love the energy/.test(t.text)), '“Love the energy!” arrives through Messages');

  const wait = until(DO.wait(play({}, { stopAt: 'e1' })), (x) => x.score < 61);
  assert.equal(wait.score, 55);
  const note = until(DO.explain(play({}, { stopAt: 'e1' })), (x) => x.score < 61);
  assert.equal(note.score, 58);
  const blank = play({}, { stopAt: 'e1' });
  assert.equal(act(blank, { do: 'case', id: 'submitNote', text: '   ' }).picked.e1, undefined, 'an empty note is not a note');
}

// The helper can also be found ahead of time; NARC never raises the alert.
{
  let s = oriented();
  s = act(act(s, { do: 'helper', op: 'install' }), { do: 'helper', op: 'toggle' });
  s = until(s, (x) => x.done.includes('e1'));
  assert.equal(s.picked.e1, 'jiggle');
  assert.equal(alertOf(s, 'e1'), undefined, 'no low-activity alert when the helper is already running');
}

// ------------------- the helper is knowledge you acquire before you can share it

{
  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  assert.equal(canAttachHelper(s), false, 'you have not found the helper yet');
  assert.equal(act(s, { do: 'attach', thread: 'luis', item: 'helper' }).picked.e2, undefined, 'so you cannot hand it to Luis');
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(canAttachHelper(s), true, 'once you have it you can');
  const sent = act(s, { do: 'attach', thread: 'luis', item: 'helper' });
  assert.ok(sent.threads.luis.some((m) => m.from === 'me' && /Mouse Activity Helper/.test(m.attach)));
  assert.equal(sent.picked.e2, 'script');
  // Not on Monday, not for anyone else.
  const mon = play({}, { stopAt: 'e1' });
  assert.equal(canAttachHelper(act(mon, { do: 'helper', op: 'install' })), false);
}

// -------------------------------------- consequences arrive by app

{
  let s = act(play({ e1: 'explain' }, { stopAt: 'e2' }), { do: 'helper', op: 'install' });
  s = DO.script(s);
  s = until(s, (x) => has(texts(x, 'dana'), /Innovation Council/));
  assert.ok(has(noticeTexts(s), /340% of baseline/));
  assert.ok(has(texts(s, 'luis'), /never been more productive/));

  let m = play({}, { stopAt: 'e3' });
  assert.deepEqual(calendarAction(m), { day: 'Wed', slot: '09:00–10:45', who: 'Marcus Reed' });
  m = DO.paper(m);
  assert.ok(m.calendar.some((e) => e.who === 'marcus' && /Vendor Site Visit/.test(e.title)));
  m = until(m, (x) => has(noticeTexts(x), /corroborated by 3 sources/));
  assert.equal(m.people.marcus.cred, 91);
  assert.equal(calendarAction(m), null);
  assert.equal(act(m, { do: 'addEvent', title: 'again' }).calendar.length, m.calendar.length, 'no second attempt');
  assert.equal(act(play({}, { stopAt: 'e3' }), { do: 'addEvent', title: '  ' }).picked.e3, undefined);

  const f = play({ ...HONEST, e5: 'letit' });
  assert.equal(f.people.luis.status, 'fired');
  assert.equal(f.online.luis, false);
  assert.ok(f.inbox.some((e) => e.subject === 'Team update' && /Luis Perez is no longer/.test(e.body[0])));
  assert.ok(f.threads.luis.some((x) => x.from === 'system' && /no longer active/.test(x.text)));
  assert.ok(has(texts(f, 'luis'), /restroom when the email arrived/));
}

// ------------------------- coworker messages make sense on their own

{
  // The first thing each person says in an incident carries its own setup.
  const first = (s, who) => s.threads[who][0].text;
  const at = (picks, inc, wait = 12) => ticks(play(picks, { stopAt: inc }), wait);

  const e1 = at({}, 'e1');
  assert.match(texts(e1, 'dana').at(-1), /NARC flagged you for low activity/);
  assert.match(texts(e1, 'dana').at(-1), /Everything okay\?/);

  const e2 = at({}, 'e2');
  assert.match(texts(e2, 'luis')[0], /^NARC flagged me for “restroom-adjacent inactivity\.” Did you see\? I am not discussing my digestive system with software\.$/);

  const e3 = at({}, 'e3');
  assert.match(first(e3, 'marcus'), /NARC flagged me for attendance again.*raccoon/);

  const e4 = at(HONEST, 'e4');
  assert.match(first(e4, 'priya'), /NARC says my “communication load” is elevated/);

  const g = at({ ...HONEST, e2: 'script' }, 'e5');
  assert.match(g.threads.luis.at(-1).text, /NARC says my keyboard input arrives every 59 seconds/);
  const n = at(HONEST, 'e5');
  assert.match(n.threads.luis.at(-1).text, /NARC says I have hit “sustained unexplained productivity loss”/);

  const b = at({ ...HONEST, e3: 'truth' }, 'e6');
  assert.match(b.threads.marcus.at(-1).text, /NARC just scheduled my termination.*bird situation/);
  const pg = at({ ...HONEST, e3: 'paper' }, 'e6');
  assert.match(pg.threads.marcus.at(-1).text, /NARC gave me “Documentation Excellence” for my bird situation paperwork/);

  // Every person thread is labelled with a role.
  Object.values(THREADS).forEach((t) => assert.ok(t.role));
}

// ---------------------------- every incident leaves at least two leads

{
  // A lead is a place to look: NARC’s own case, a coworker line pointing at
  // something, or a “new” marker on an app. Wait long enough for them to land.
  const patient = (picks, inc) => ticks(play(picks, { stopAt: inc }), 60);
  const leads = (s, inc) => {
    const list = [];
    const a = alertOf(s, inc);
    if (a && caseView(s, a).observed) list.push('narc');
    Object.keys(s.marks).forEach((k) => list.push(`mark:${k}`));
    return { list, s };
  };

  let s = patient({}, 'e1');
  let l = leads(s, 'e1');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:utilities') && l.list.includes('mark:files'), `e1 leads: ${l.list}`);
  assert.match(texts(s, 'marcus').at(-1), /Mouse Activity Helper from Utilities/);

  s = patient({ e1: 'explain' }, 'e2');
  l = leads(s, 'e2');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:files') && l.list.includes('mark:utilities'), `e2 leads: ${l.list}`);
  assert.match(texts(s, 'luis').at(-1), /Mouse Activity Helper in Utilities/);

  s = patient({ e1: 'explain', e2: 'ignore' }, 'e3');
  l = leads(s, 'e3');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:calendar') && l.list.includes('mark:utilities'), `e3 leads: ${l.list}`);
  assert.match(texts(s, 'marcus').join(' '), /Wednesday calendar is completely empty/);
  assert.match(caseView(s, alertOf(s, 'e3')).observed.join(' '), /Corroborating records on file: none/);

  s = patient(HONEST, 'e4');
  l = leads(s, 'e4');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:email') && l.list.includes('mark:files'), `e4 leads: ${l.list}`);
  assert.match(texts(s, 'priya').join(' '), /Collaboration Index of 97/);
  assert.match(texts(s, 'dana').at(-1), /Culture Champion nominations open today/);

  s = patient({ ...HONEST, e2: 'script' }, 'e5');
  s = s.incident ? s : s;
  l = leads(s, 'e5');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:utilities'), `e5 (caught) leads: ${l.list}`);
  assert.match(texts(s, 'marcus').at(-1), /natural variation/);
  s = patient(HONEST, 'e5');
  assert.match(texts(s, 'dana').at(-1), /Unstructured ideation/i);
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['relabel']);
  assert.ok(caseView(s, alertOf(s, 'e5')).controls.some((c) => c.id === 'attachOutput'));

  s = patient({ ...HONEST, e3: 'truth' }, 'e6');
  l = leads(s, 'e6');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:files'), `e6 (burned) leads: ${l.list}`);
  assert.match(texts(s, 'marcus').join(' '), /location trace should show the sanctuary/);
  s = patient({ ...HONEST, e3: 'paper' }, 'e6');
  l = leads(s, 'e6');
  assert.ok(l.list.includes('narc') && l.list.includes('mark:files'), `e6 (documented) leads: ${l.list}`);

  // Looking at an app clears its marker; a follow-up hint does not appear once you have decided.
  let m = patient({}, 'e3');
  assert.equal(m.marks.calendar, true);
  m = act(m, { do: 'view', app: 'calendar' });
  assert.equal(m.marks.calendar, undefined);
  let quick = ticks(play({}, { stopAt: 'e3' }), 9);
  quick = DO.stay(quick);
  quick = ticks(quick, 90);
  assert.ok(!has(texts(quick, 'marcus'), /Wednesday calendar is completely empty/), 'the calendar hint is moot once you have decided');
  assert.equal(quick.marks.calendar, undefined);
}

// ---------------------------- the Culture Champion loophole exists first

{
  let s = play(HONEST, { stopAt: 'e3' });
  const email = mailOf(s, /Culture Champion nominations/);
  assert.ok(email, 'the nomination email is already in the inbox before Priya’s flag');
  assert.equal(email.form, 'nominate');
  assert.match(email.body.join(' '), /Collaboration Index of 90/);
  assert.match(email.body.join(' '), /exempt from Communication Load/);
  assert.match(email.body.join(' '), /open Thursday/);
  assert.equal(act(s, { do: 'nominate', who: 'priya' }).people.priya.champion, false, 'the window is not open yet');

  s = ticks(play(HONEST, { stopAt: 'e4' }), 5);
  assert.equal(s.inbox.filter((m) => /Culture Champion nominations/.test(m.subject)).length, 1, 'and it is not sent again');
  s = act(s, { do: 'nominate', who: 'luis' });
  assert.equal(s.incident.id, 'e4');
  s = until(s, (x) => x.inbox.some((m) => /Re: nomination of Luis Perez/.test(m.subject)));
  s = DO.champion(s);
  assert.equal(s.people.priya.status, 'promoted');
  s = until(s, (x) => has(texts(x, 'priya'), /badge/));
  assert.ok(has(noticeTexts(s), /Exempt from Communication Load/));
}

// ------------------------------ NARC 2.0 is a beat, then it acts

{
  let s = play(HONEST, { stopAt: 'e3' });
  s = DO.stay(s);
  s = until(s, (x) => x.awaiting, { reads: false });
  assert.equal(s.level, 2, 'the interface changes level with the announcement');
  const update = mailOf(s, /NARC 2\.0/);
  assert.equal(update.from, 'People Operations');
  assert.equal(update.unread, true);
  assert.equal(clockText(s), 'Wed 15:00');
  assert.equal(s.incident, null);
  const before = s.alerts.length;

  // Nothing new starts acting on the player until they have read it, however long that takes.
  s = ticks(s, 600);
  assert.equal(s.alerts.length, before, 'no scan results pile up before the announcement is read');
  assert.equal(s.incident, null, 'and Priya’s case does not begin');
  assert.equal(s.flags, 0);
  // NARC nags about it instead.
  assert.equal(s.toasts.filter((t) => t.nudgeFor === 'update' && !t.gone).length, 1);
  assert.match(s.toasts.find((t) => t.nudgeFor === 'update' && !t.gone).text, /review the announcement/);

  // Reading it starts the clock on what it enables, at a readable pace.
  s = act(s, { do: 'open', ref: `email:${update.id}` });
  assert.equal(s.awaiting, null);
  assert.equal(s.toasts.some((t) => t.nudgeFor === 'update' && !t.gone), false);
  assert.equal(s.alerts.length, before, 'nothing lands the instant you open it');
  s = ticks(s, 5);
  assert.equal(s.alerts.length, before);
  s = until(s, (x) => x.alerts.length > before, { reads: false });
  assert.ok(has(noticeTexts(s), /No synthetic activity found/));
  s = until(s, atIncident('e4'), { reads: false });
}

// ---------------------------- exploits with unintended consequences

{
  let s = play({ ...HONEST, e1: 'jiggle' }, { stopAt: 'e4' });
  assert.equal(s.level, 2);
  assert.equal(s.flags, 1, 'NARC 2.0 flags the repeating input');
  assert.equal(s.score, 50, 'the index is recalculated down');
  assert.ok(has(noticeTexts(s), /input repeats every 59 seconds.*recalculated: 75 → 50/));

  // ...unless you had switched it Off. On/Off matters.
  let off = DO.jiggle(play({}, { stopAt: 'e1' }));
  off = act(off, { do: 'helper', op: 'toggle' });
  assert.equal(off.helper.on, false);
  off = play({ ...HONEST, e1: undefined }, { from: off, stopAt: 'e4' });
  assert.equal(off.flags, 0, 'a helper that is off is not caught');
  assert.ok(off.score > 50);

  const luis = play({ ...HONEST, e2: 'script' }, { stopAt: 'e4' });
  assert.equal(luis.people.luis.caught, true);
  assert.ok(has(noticeTexts(luis), /Luis Perez: synthetic activity detected/));
  const marcus = play({ ...HONEST, e3: 'paper' }, { stopAt: 'e4' });
  assert.equal(marcus.flags, 0);
  assert.ok(has(noticeTexts(marcus), /3 supporting documents verified/));
  assert.equal(play(HONEST, { stopAt: 'e3' }).level, 1);

  // Priya: suppress one metric and NARC produces the opposite problem.
  let p = play(HONEST, { stopAt: 'e4' });
  assert.deepEqual(replies(p, 'priya').map((r) => r.id), ['cutback']);
  p = DO.quiet(p);
  assert.ok(p.threads.priya.some((m) => m.from === 'me' && /three channels/.test(m.text)));
  p = until(p, (x) => has(noticeTexts(x), /Communication Load: elevated → normal/));
  assert.ok(!has(noticeTexts(p), /social withdrawal/), 'the backfire lands later');
  p = until(p, (x) => has(noticeTexts(x), /social withdrawal.*Collaboration Index: 97 → 31/));
  p = until(p, (x) => x.calendar.some((e) => /Connection Circle \(mandatory\)/.test(e.title)));
  assert.equal(p.shown.priya, 'monitored');
}

// ------------------------------- NARC’s team panel lags reality, like a report

{
  let s = play({ ...HONEST, e5: 'letit' }, { stopAt: 'e5' });
  s = DO.letit(s);
  assert.equal(s.people.luis.status, 'fired');
  assert.equal(s.shown.luis, 'employed', 'NARC’s panel has not caught up yet');
  s = until(s, (x) => x.shown.luis === 'fired');
}

// -------------------------------------- Luis and Marcus: save and fire paths

{
  const at = (picks, inc) => play(picks, { stopAt: inc });

  const admit = play({ ...HONEST, e2: 'script', e5: 'admit' });
  assert.equal(admit.people.luis.status, 'warning');
  assert.equal(admit.flags, 1);
  assert.equal(play({ ...HONEST, e2: 'script', e5: 'human' }).people.luis.status, 'rewarded');
  assert.equal(play({ ...HONEST, e2: 'script', e5: 'blame' }).people.luis.status, 'fired');
  const auto = play({ ...HONEST, e2: 'script', e5: undefined });
  assert.equal(auto.picked.e5, 'auto');
  assert.equal(auto.people.luis.status, 'monitored');

  // Randomizing Luis’s copy early skips the review.
  let early = at({ ...HONEST, e2: 'script' }, 'e4');
  early = act(early, { do: 'helper', op: 'randomize', copy: 'luis' });
  assert.equal(early.helper.luis.randomized, true);
  early = play({ e4: 'leave' }, { from: early, afterAll: false });
  assert.equal(early.picked.e5, 'human');

  assert.equal(play({ ...HONEST, e5: 'label' }).people.luis.status, 'employed');
  assert.equal(play({ ...HONEST, e5: 'output' }).people.luis.status, 'monitored');
  assert.equal(play({ ...HONEST, e5: 'letit' }).people.luis.status, 'fired');
  const relabel = until(DO.label(at(HONEST, 'e5')), (x) => has(noticeTexts(x), /Unstructured Ideation/));
  assert.ok(relabel.threads.dana.some((m) => m.from === 'me' && /unstructured ideation/.test(m.text)));

  assert.equal(play({ ...HONEST, e3: 'paper', e6: 'workshop' }).people.marcus.status, 'rewarded');
  assert.equal(play({ ...HONEST, e3: 'paper', e6: 'approve' }).people.marcus.status, 'employed');
  const expose = play({ ...HONEST, e3: 'paper', e6: 'expose' });
  assert.equal(expose.people.marcus.status, 'fired');
  assert.equal(expose.flags, 1);
  assert.ok(has(noticeTexts(expose), /3 of 6 last edited by Employee 4417/));
  const ws = play({ ...HONEST, e3: 'paper', e6: 'workshop' });
  assert.ok(ws.inbox.some((m) => /Attendance Best Practices/.test(m.subject)));
  assert.ok(ws.calendar.some((e) => /Attendance Best Practices/.test(e.title)));

  const bird = play({ ...HONEST, e3: 'truth', e6: 'vouch_trace' });
  assert.equal(bird.people.marcus.status, 'warning');
  assert.equal(bird.people.marcus.cred, 67);
  assert.equal(play({ ...HONEST, e3: 'truth', e6: 'let' }).people.marcus.status, 'fired');
  const back = play({ ...HONEST, e3: 'truth', e6: 'backdate' });
  assert.equal(back.people.marcus.status, 'fired');
  assert.equal(back.flags, 1);
  assert.ok(has(noticeTexts(back), /created 11:26, after the flag at 11:20/));
  assert.match(alertOf(at({ ...HONEST, e3: 'truth' }, 'e6'), 'e6').text, /credibility 12%.*Prior flags weight: 80%/);
  assert.match(alertOf(at({ ...HONEST, e3: 'stay' }, 'e6'), 'e6').text, /credibility 38%/);
  assert.equal(caseView(at({ ...HONEST, e3: 'paper' }, 'e6'), alertOf(at({ ...HONEST, e3: 'paper' }, 'e6'), 'e6')).model.confidence, 94);
}

// ---------------------------------------------------------- achievements

{
  const names = (s) => achievements(s).earned.map((a) => a.id).sort();
  assert.ok(!names(play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' })).includes('nobody'));

  const nobody = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'vouch_trace' });
  assert.deepEqual(names(nobody), ['bird', 'donotask', 'nobody'].sort());
  assert.ok(nobody.achievements.includes('bird'));
  assert.ok(names(play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' })).includes('fewer'));
  const technical = play({ e1: 'explain', e2: 'ignore', e3: 'paper', e4: 'champion', e5: 'label', e6: 'approve' });
  assert.ok(names(technical).includes('technically') && names(technical).includes('champion'));

  assert.ok(names(play(HONEST)).includes('donotask'));
  const looked = opened(play({}, { stopAt: 'e2', from: DO.explain(play({}, { stopAt: 'e1' })) }), 'e2');
  assert.equal(looked.pulled.e2, true);
  const forfeited = play({ e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' }, { from: looked });
  assert.ok(!names(forfeited).includes('donotask'), 'opening the restroom data forfeits it');
}

// ------------------------------------------------------------------ ending

{
  const s = play(HONEST);
  assert.equal(s.phase, 'ending');
  assert.equal(clockText(s), 'Fri 17:00');
  const e = ending(s);
  assert.equal(e.roster.length, 3);
  e.roster.forEach((r) => assert.ok(r.label && r.text));
  assert.ok(e.you.label && e.company.length >= 2);
  assert.equal(e.achievements.earned.length + e.achievements.locked.length, 6);
  assert.ok(e.achievements.locked.every((a) => a.hint));
  assert.equal(tick(s), s, 'time stops at the end of the week');
  assert.equal(act(s, { do: 'open', ref: 'email:x' }), s);

  const model = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(ending(model).you.label, 'MODEL EMPLOYEE');
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
  assert.deepEqual(again, newGame(), 'restart returns a clean initial state, orientation included');
  assert.equal(again.oriented, false);
  assert.equal(again.helper.installed, false);
  assert.equal(act(newGame(), { do: 'restart' }).rev, newGame().rev, 'restart mid-week does nothing');
}

// ------------------------------- purity, and actions that make no sense

{
  const s = play({ e1: 'explain' }, { stopAt: 'e2' });
  const snapshot = JSON.stringify(s);
  act(act(s, { do: 'helper', op: 'install' }), { do: 'attach', thread: 'luis', item: 'helper' });
  tick(s);
  assert.equal(JSON.stringify(s), snapshot, 'act and tick never mutate their input');

  assert.equal(act(s, { do: 'case', id: 'endorse' }).picked.e2, undefined, 'an action from another problem does nothing');
  assert.equal(act(s, { do: 'reply', thread: 'priya', reply: 'cutback' }).picked.e2, undefined);
  assert.equal(act(s, { do: 'nominate', who: 'priya' }).picked.e2, undefined);
  assert.equal(act(s, { do: 'helper', op: 'randomize' }).helper.luis, null);
  assert.equal(act(s, { do: 'open', ref: 'nowhere:1' }).rev, s.rev);
  assert.equal(act(s, { do: 'nonsense' }).rev, s.rev);
  assert.equal(act(s, { do: 'ack' }).rev, s.rev, 'acknowledging twice does nothing');
}

// ------------------ pacing: nothing lands on top of anything else

{
  // Across a spread of routes, including a player who acts the instant a case
  // appears, consecutive notifications are always a few seconds apart.
  const routes = [
    HONEST,
    { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' },
    { e1: 'wait', e2: 'confirm', e3: 'truth', e4: 'champion', e5: 'output', e6: 'vouch_trace' },
    { e1: 'explain', e2: 'script', e3: 'stay', e4: 'leave', e5: 'human', e6: 'let' },
  ];
  for (const picks of routes) {
    const s = play(picks);
    const times = s.toasts.filter((t) => !t.nudgeFor).map((t) => t.at).sort((a, b) => a - b);
    for (let i = 1; i < times.length; i += 1) {
      assert.ok(times[i] - times[i - 1] >= 3, `notifications at ${times[i - 1]} and ${times[i]} are too close on ${JSON.stringify(picks)}`);
    }
  }
}

// ------------------------------------------------------- length of a run

{
  // Game seconds are real seconds. A brisk player who dismisses everything the
  // moment it appears still gets a complete week, but not a rushed one.
  const brisk = play(HONEST);
  assert.ok(brisk.t >= 5 * 60 && brisk.t <= 7 * 60, `a brisk run is 5–7 minutes (${(brisk.t / 60).toFixed(1)})`);

  // Someone who waits for each coworker’s hints to arrive before deciding.
  let s = oriented();
  for (const inc of INCIDENTS) {
    s = until(s, atIncident(inc));
    const lastHint = Math.max(s.t, ...s.pending.filter((p) => p.when === inc && p.k !== 'nudge').map((p) => p.at));
    s = until(s, (x) => x.t >= lastHint + 8);
    s = DO[HONEST[inc]](s);
  }
  s = until(s, (x) => x.phase === 'ending');
  assert.ok(s.t >= 7 * 60 && s.t <= 10 * 60, `reading every hint first is a healthy 7–10 minutes (${(s.t / 60).toFixed(1)}), before any exploring`);
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
  const outcomes = new Set();
  const junk = /undefined|NaN|\[object|null/;
  const start = oriented();

  for (const [a, b, c, d] of paths) {
    for (const x of e5[b === 'script' ? 'g' : 'n']) {
      for (const y of e6[c === 'paper' ? 'g' : 'b']) {
        const s = play({ e1: a, e2: b, e3: c, e4: d, e5: x, e6: y }, { from: start });
        assert.equal(s.phase, 'ending', `${[a, b, c, d, x, y]} reaches the ending`);
        assert.equal(attention(s), 0);
        const surfaces = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, e: ending(s) });
        assert.ok(!junk.test(surfaces.replace(/"(when|attach|variant|form|incident)":null/g, '')), `bad text on route ${[a, b, c, d, x, y]}: ${surfaces.match(junk)}`);
        outcomes.add(JSON.stringify([s.people.luis.status, s.people.marcus.status, s.people.priya.status, s.flags]));
        count += 1;
      }
    }
  }
  assert.equal(count, 3 * 3 * 3 * 3 * 3 * 3, 'all 729 routes reach an ending');
  assert.ok(outcomes.size >= 20, `endings differ across routes (${outcomes.size})`);
}

console.log('NARC tests passed');
