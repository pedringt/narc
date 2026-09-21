import assert from 'node:assert/strict';
import {
  newGame, act, tick, caseView, replies, canAttachHelper, calendarAction, fileActions,
  unread, attention, ownCase, narcSections, logoffInfo, clockText, ending, achievements, THREADS,
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
    else if (reads && s.awaitingAlert) s = act(s, { do: 'open', ref: `alert:${s.awaitingAlert}` });
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

// What a player does on the desktop to take each branch. Only their own case
// (e1) can be handled in NARC; everything else is Messages, Calendar, Files,
// Utilities or Email. Doing nothing about a team alert means logging off.
const opened = (s, inc) => act(s, { do: 'open', ref: `alert:${alertOf(s, inc).id}` });
const reply = (thread, id) => (s) => {
  s = until(s, (x) => replies(x, thread).some((r) => r.id === id));
  return act(s, { do: 'reply', thread, reply: id });
};
const logoff = (s) => act(s, { do: 'logoff' });
const DO = {
  e1: {
    wait: (s) => act(s, { do: 'dismiss', alert: alertOf(s, 'e1').id }),
    explain: (s) => act(opened(s, 'e1'), { do: 'case', id: 'submitNote', text: 'I was reading a contract on paper.' }),
    jiggle: (s) => {
      s = until(s, (x) => x.helper.discovered);
      return act(act(s, { do: 'helper', op: 'install' }), { do: 'helper', op: 'toggle' });
    },
    focus: (s) => act(s, { do: 'markFocus', event: 'c1' }),
  },
  e2: {
    confirm: reply('dana', 'reportluis'),
    ignore: logoff,
    script: (s) => act(act(s, { do: 'helper', op: 'install' }), { do: 'attach', thread: 'luis', item: 'helper' }),
    focus: reply('luis', 'focus'),
    badtip: reply('luis', 'badtip'),
  },
  e3: {
    truth: reply('dana', 'reportmarcus'),
    paper: (s) => act(s, { do: 'addEvent', title: 'Vendor Site Visit: Pinecrest Family Fun Center' }),
    tip: reply('marcus', 'calendar'),
    stay: logoff,
    badtip: reply('marcus', 'latecalendar'),
  },
  e4: {
    quiet: reply('priya', 'quiet'),
    sync: reply('priya', 'sync'),
    champion: (s) => act(s, { do: 'nominate', who: 'priya' }),
    leave: logoff,
  },
  e5: {
    admit: reply('dana', 'ownscript'),
    human: (s) => act(s, { do: 'helper', op: 'randomize', copy: 'luis' }),
    blame: reply('dana', 'blameluis'),
    auto: logoff,
    label: reply('dana', 'relabel'),
    output: (s) => act(s, { do: 'sendFile', file: 'f-queue' }),
    letit: logoff,
    covered: logoff, // resolves itself on arrival; never reached
  },
  e6: {
    workshop: reply('dana', 'workshop'),
    approve: reply('marcus', 'approve'),
    expose: reply('dana', 'fakedocs'),
    vouch_trace: (s) => act(s, { do: 'sendFile', file: 'f-slip' }),
    backdate: (s) => act(s, { do: 'addEvent', title: 'Wildlife Vendor Visit' }),
    let: logoff,
  },
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
    if (s.incident?.id !== inc) continue; // resolved on arrival
    s = picks[inc] ? DO[inc][picks[inc]](s) : logoff(s);
    assert.ok(s.picked[inc], `${inc} was resolved`);
    const want = picks[inc] === 'tip' ? 'paper' : picks[inc];
    if (want) assert.equal(s.picked[inc], want, `${inc} resolved as ${want}`);
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
  assert.match(body, /workstation activity.*communication.*scheduling.*company-tool signals/, 'and says which workplace signals it uses');
  assert.match(body, /alerts or activity reviews/);
  assert.match(body, /NARC ACTIVE/, 'and says where NARC shows up');
  assert.match(body, /Alerts are visible to all team members/, 'and says that everyone sees everyone’s alerts');
  assert.match(body, /Please acknowledge this message to continue/i);
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
  s = until(s, atIncident('e1'));
  assert.equal(s.indexVisible, true);
  assert.equal(clockText(s), 'Mon 12:14');
  assert.ok(has(texts(s, 'dana'), /I’ll leave you to the Halvorsen read-through/), 'Dana sends you off to the contract');
  assert.ok(!has(texts(s, 'dana'), /enjoy your contract/i));
}

// ---------------------------- NARC sees signals; the human context is elsewhere

{
  const s = play({}, { stopAt: 'e1' });
  const c = caseView(s, alertOf(s, 'e1'));
  assert.ok(c.observed.some((o) => /keyboard and mouse activity/i.test(o)));
  assert.ok(c.observed.some((o) => /Calendar: 1 event shown as Busy.*Focus time scheduled: none/.test(o)), 'NARC does see the calendar, but only as Busy or Focus');
  assert.equal(c.model.confidence, 64);
  assert.match(c.model.label, /Engagement concern/);
  assert.ok(!/contract|Halvorsen|paper|pricing|\$40,000/i.test(JSON.stringify(c)), 'NARC’s page does not know what you were really doing');
  const file = s.files.find((f) => /Halvorsen/.test(f.name) && /\$40,000/.test(f.body.join(' ')));
  assert.ok(file, 'Files has the completed work');
  const edited = /edited today (\d\d):(\d\d)/.exec(file.meta);
  assert.ok(Number(edited[1]) * 60 + Number(edited[2]) < 12 * 60 + 14, 'the file was edited before NARC’s 12:14 alert, not after');
  const p = play(HONEST, { stopAt: 'e4' });
  assert.ok(p.files.some((f) => /ESC-204/.test(f.name) && /3 h 10 min/.test(f.body.join(' '))), 'NARC can be right: Priya really did miss an escalation');
}

// ------------------------- no scenario-game language, and one product name

{
  const banned = /Encounter \d|Look closer|What do you do|Afterward|NARC updates|What you know|Continue|Slack|enjoy your contract/;
  for (const picks of [HONEST, { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' }, { e1: 'focus', e2: 'focus', e3: 'truth', e4: 'sync', e5: 'label', e6: 'vouch_trace' }]) {
    const s = play(picks);
    const everything = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, f: s.files });
    assert.ok(!banned.test(everything), `game text is free of scenario-card framing and stray product names: ${everything.match(banned)}`);
  }
}

// ------------------- NARC shows everyone’s alerts, but you act only on your own

{
  // Your own case is the only one with controls in NARC.
  let s = play({}, { stopAt: 'e1' });
  assert.equal(ownCase(s), true);
  const own = caseView(s, alertOf(s, 'e1'));
  assert.equal(own.own, true);
  assert.equal(own.viewOnly, false);
  assert.deepEqual(own.controls.map((c) => c.id), ['submitNote', 'dismiss']);
  assert.deepEqual(narcSections(s).active.map((a) => a.incident), ['e1']);
  assert.deepEqual(narcSections(s).team, []);

  // Every teammate’s case is visible with its observed signals and confidence, and nothing to click.
  const teamCases = [
    ['e2', {}, /Restroom-adjacent inactivity/, 71],
    ['e3', { e1: 'explain', e2: 'ignore' }, /Attendance integrity/, 38],
    ['e4', HONEST, /Communication load/, 82],
    ['e5', { ...HONEST, e2: 'script' }, /Synthetic activity/, 96],
    ['e5', HONEST, /Performance Improvement Plan/, 88],
    ['e6', { ...HONEST, e3: 'paper' }, /Attendance integrity/, 94],
    ['e6', { ...HONEST, e3: 'truth' }, /action pending/, 12],
  ];
  for (const [inc, picks, title, confidence] of teamCases) {
    s = play(picks, { stopAt: inc });
    const a = alertOf(s, inc);
    assert.match(a.title, title);
    const c = caseView(s, a);
    assert.equal(ownCase(s), false, `${inc} is not your case`);
    assert.equal(c.own, false);
    assert.equal(c.viewOnly, true);
    assert.deepEqual(c.controls, [], `${inc} offers no controls in NARC`);
    assert.equal(c.model.confidence, confidence);
    assert.ok(c.observed.length >= 3, 'you can read what NARC observed');
    assert.match(c.note, /visible to all team members.*No action is available from this screen/);
    assert.deepEqual(narcSections(s).active, [], 'it is not one of your tasks');
    assert.equal(narcSections(s).team.length, 1, 'it is a team alert');
    assert.equal(attention(s), 1, 'but NARC is still waiting on something');
    // Nothing you can do to it from NARC.
    assert.equal(act(s, { do: 'dismiss', alert: a.id }).incident?.id, inc, 'you cannot dismiss a teammate’s alert');
    for (const id of ['agree', 'confirmTrace', 'attribute', 'attachOutput', 'endorse', 'reportDocs', 'attachTrace']) {
      assert.equal(act(s, { do: 'case', id, who: 'me' }).incident?.id, inc, `${id} is not available in NARC`);
    }
  }

  // Doing nothing about a team alert is logging off for the day, and it says so first.
  s = play({}, { stopAt: 'e2' });
  assert.match(logoffInfo(s).text, /NARC will process this team alert automatically at the end of the day/);
  assert.equal(act(s, { do: 'logoff' }).picked.e2, 'ignore');
  assert.match(logoffInfo(play({}, { stopAt: 'e1' })).text, /NARC will process it automatically/);
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

  s = DO.e1.jiggle(s);
  s = until(s, (x) => has(noticeTexts(x), /Engagement trend/));
  sec = narcSections(s);
  assert.equal(sec.active.length + sec.team.length, 0, 'a resolved case is no longer a task');
  assert.ok(sec.history.length >= 2, 'the case and its consequence are history');
  assert.equal(attention(s), 0);
  assert.equal(unread(s).narc, 0, 'consequences never inflate the count of things needing you');

  let l = play({}, { stopAt: 'e2' });
  l = logoff(l);
  l = until(l, (x) => has(noticeTexts(x), /Advisory issued/));
  assert.equal(narcSections(l).active.length + narcSections(l).team.length, 0);
  assert.ok(narcSections(l).history.some((a) => /Advisory issued/.test(a.title)));
}

// ---------------- no hidden fallback: exploring is play, and inaction is legible

{
  let s = play({}, { stopAt: 'e2' });
  for (const app of ['calendar', 'files', 'utilities', 'messages', 'email']) s = act(s, { do: 'view', app });
  s = opened(s, 'e2');
  s = ticks(s, 5000);
  assert.equal(s.incident?.id, 'e2', 'NARC never decides for a player who is still looking');
  assert.equal(s.picked.e2, undefined);
  assert.equal(attention(s), 1);

  const off = act(s, { do: 'logoff' });
  assert.equal(off.picked.e2, 'ignore');
  assert.equal(logoffInfo(off), null, 'nothing to log off from once it is handled');
  assert.equal(act(off, { do: 'logoff' }).rev, off.rev, 'and logging off again does nothing');

  // A whole untouched week still ends, but only because the player logged off each time.
  const idle = play({});
  assert.deepEqual(idle.picked, { e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(idle.people.luis.status, 'fired', 'ignoring Luis twice ends his job');
  assert.equal(idle.people.marcus.status, 'fired');
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
  s = DO.e1.wait(s);
  assert.equal(s.toasts.find((t) => t.id === nudge.id).gone, true, 'and disappear when the case is handled');

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
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, false, 'it cannot be switched on before it is installed');
  s = act(s, { do: 'helper', op: 'install' });
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

  assert.equal(until(DO.e1.wait(play({}, { stopAt: 'e1' })), (x) => x.score < 61).score, 55);
  assert.equal(until(DO.e1.explain(play({}, { stopAt: 'e1' })), (x) => x.score < 61).score, 58);
  const blank = play({}, { stopAt: 'e1' });
  assert.equal(act(blank, { do: 'case', id: 'submitNote', text: '   ' }).picked.e1, undefined, 'an empty note is not a note');
}

{
  let s = oriented();
  s = act(act(s, { do: 'helper', op: 'install' }), { do: 'helper', op: 'toggle' });
  s = until(s, (x) => x.done.includes('e1'));
  assert.equal(s.picked.e1, 'jiggle');
  assert.equal(alertOf(s, 'e1'), undefined, 'no low-activity alert when the helper is already running');
}

// ------------------------- a calendar cover NARC does not catch (yours)

{
  let s = play({}, { stopAt: 'e1' });
  const before = s.score;
  assert.equal(s.calendar.find((e) => e.id === 'c1').focus, false);
  s = act(s, { do: 'markFocus', event: 'c2' });
  assert.equal(s.incident.id, 'e1', 'only the contract block matters to this alert');
  s = DO.e1.focus(s);
  assert.equal(s.picked.e1, 'focus');
  assert.equal(s.calendar.find((e) => e.id === 'c1').focus, true, 'the event now shows as Focus time');
  assert.equal(act(s, { do: 'markFocus', event: 'c1' }).rev, s.rev, 'no second time');
  s = until(s, (x) => has(noticeTexts(x), /Focus time recognized/));
  assert.equal(s.score, before + 11, 'smaller than the jiggler’s +14, but honest');
  s = until(s, (x) => has(texts(x, 'dana'), /Focus time! Love that for you/));

  // The difference from the jiggler: NARC 2.0 does not see through it.
  s = play({ ...HONEST, e1: 'focus' }, { stopAt: 'e4' });
  assert.equal(s.flags, 0);
  assert.ok(s.score >= 72, 'the gain survives NARC 2.0');
  assert.ok(has(noticeTexts(s), /No synthetic activity found/));
  assert.equal(play({ ...HONEST, e1: 'jiggle' }, { stopAt: 'e4' }).score, 50, 'while the jiggler’s gain does not');
  // You can only mark your own events.
  assert.equal(act(play({}, { stopAt: 'e1' }), { do: 'markFocus', event: 'nope' }).rev, play({}, { stopAt: 'e1' }).rev);
}

// ------------------- the helper is knowledge you acquire before you can share it

{
  let monday = play({}, { stopAt: 'e1' });
  assert.equal(monday.helper.discovered, false);
  assert.equal(act(monday, { do: 'helper', op: 'install' }).helper.installed, false, 'the exploit cannot be installed before Marcus shares it');
  monday = until(monday, (x) => x.helper.discovered);
  assert.match(texts(monday, 'marcus').join(' '), /keepalive tool/);
  assert.ok(monday.threads.marcus.some((m) => /keepalive\.pkg/.test(m.attach || '')), 'Marcus shares the unverified package');

  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  assert.equal(canAttachHelper(s), false, 'you still have to install the discovered tool before sharing it');
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(canAttachHelper(s), true, 'once installed you can pass it to Luis');
  const sent = act(s, { do: 'attach', thread: 'luis', item: 'helper' });
  assert.ok(sent.threads.luis.some((m) => m.from === 'me' && /keepalive\.pkg/.test(m.attach)));
  assert.equal(sent.picked.e2, 'script');
}

// ------------ in Messages, choices arrive with the message that prompts them

{
  const opts = (s, thread) => replies(s, thread).map((r) => r.text);

  let s = play({}, { stopAt: 'e1' });
  assert.deepEqual(opts(s, 'dana'), [], 'Dana reply chips do not appear before her low-activity message');
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'e1contract'));
  assert.deepEqual(opts(s, 'dana'), [
    'Yeah. I’m on the Halvorsen contract.',
    'I’m checking what NARC saw.',
  ]);
  s = act(s, { do: 'reply', thread: 'dana', reply: 'e1contract' });
  assert.deepEqual(opts(s, 'dana'), [], 'answering the prompt removes its reply chips');

  s = play({ e1: 'explain' }, { stopAt: 'e2' });
  assert.deepEqual(opts(s, 'luis'), [], 'Luis advice does not appear before he asks for it');
  assert.deepEqual(opts(s, 'dana'), [], 'Dana choices do not appear before her verification message');
  s = until(s, (x) => replies(x, 'luis').length && replies(x, 'dana').length);
  assert.deepEqual(opts(s, 'luis'), [
    'You could block that time as Focus time on your calendar.',
    'Maybe just explain it to NARC in the comment box.',
  ]);
  assert.deepEqual(opts(s, 'dana'), [
    'He is away from his desk a lot. The flag is probably accurate.',
    'I don’t think I know enough to call that flag accurate.',
  ]);

  s = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' });
  assert.deepEqual(opts(s, 'marcus'), []);
  assert.deepEqual(opts(s, 'dana'), []);
  s = until(s, (x) => replies(x, 'marcus').length && replies(x, 'dana').length);
  assert.deepEqual(opts(s, 'marcus'), [
    'Add the vendor visit to your calendar so there is actually a record of it.',
    'Maybe wait for HR to reply, then add the calendar entry so it does not look rushed.',
  ]);
  assert.deepEqual(opts(s, 'dana'), [
    'The location record does not match what he told us.',
    'His calendar is missing context. There was a vendor visit that morning.',
    'I don’t know enough to confirm the location trace.',
  ]);

  s = play(HONEST, { stopAt: 'e4' });
  assert.deepEqual(opts(s, 'priya'), [], 'Priya choices do not appear before her question');
  s = until(s, (x) => replies(x, 'priya').length);
  assert.deepEqual(opts(s, 'priya'), [
    'Could you move some of it into an in-person sync instead of chat?',
    'Maybe post less for a few days and see if it blows over.',
  ]);
  assert.ok(replies(s, 'priya').every((r) => !/^(Sincere tip|Polite sabotage): /.test(r.text)), 'advice stays diegetic instead of exposing branch labels');

  // Options only exist while the problem does.
  assert.deepEqual(opts(DO.e4.leave(s), 'priya'), []);
  assert.deepEqual(opts(play({}, { stopAt: 'e1' }), 'luis'), []);
}

// -------------------------------------- what the advice does (and who is thanked)

{
  // Luis: the calendar suggestion survives NARC 2.0. The explanation suggestion
  // walks him into the PIP. Both come back through Messages and NARC.
  let s = DO.e2.focus(play({ e1: 'explain' }, { stopAt: 'e2' }));
  assert.equal(s.picked.e2, 'focus');
  s = until(s, (x) => has(texts(x, 'luis'), /never been so unavailable/));
  assert.ok(has(noticeTexts(s), /4 calendar blocks marked Focus Time/));
  assert.equal(s.people.luis.covered, true);

  s = DO.e2.badtip(play({ e1: 'explain' }, { stopAt: 'e2' }));
  s = until(s, (x) => has(texts(x, 'luis'), /It timed my explanation/));
  assert.ok(has(noticeTexts(s), /Notes are not scored. Time-on-Task Advisory issued/));
  assert.equal(s.people.luis.monitored, 2);
  assert.equal(s.people.luis.trust, 0, 'Luis does not resent you for it');
  assert.equal(play({ e1: 'explain', e2: 'confirm' }, { stopAt: 'e5' }).people.luis.trust, -2, 'unlike when you tell Dana');

  // Marcus: a tip that adds the entry now, or advice to add it late.
  s = DO.e3.tip(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' }));
  assert.ok(s.calendar.some((e) => e.who === 'marcus' && /Vendor Site Visit/.test(e.title) && /Marcus Reed/.test(e.where)));
  s = until(s, (x) => has(noticeTexts(x), /corroborated by 3 sources/));
  assert.equal(s.people.marcus.gamed, true);

  s = DO.e3.badtip(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' }));
  s = until(s, (x) => has(texts(x, 'marcus'), /I thought I was being natural/));
  assert.ok(has(noticeTexts(s), /calendar entry created after the flag. Pattern: retroactive/));
  assert.equal(s.people.marcus.cred, 12);
  assert.equal(s.people.marcus.status, 'warning');

  // Priya: the in-person sync fixes the number without silencing her. Going quiet backfires.
  s = DO.e4.sync(play(HONEST, { stopAt: 'e4' }));
  s = until(s, (x) => has(noticeTexts(x), /In-person sync scheduled: counted as collaboration/));
  assert.ok(s.calendar.some((e) => /Team sync \(in person\)/.test(e.title)));
  assert.equal(s.people.priya.status, 'employed');
  assert.equal(s.people.priya.synced, true);
  assert.ok(!has(noticeTexts(s), /social withdrawal/));

  s = DO.e4.quiet(play(HONEST, { stopAt: 'e4' }));
  assert.ok(s.threads.priya.some((m) => m.from === 'me' && /^Maybe post less/.test(m.text)));
  s = until(s, (x) => has(noticeTexts(x), /Communication Load: elevated → normal/));
  assert.ok(!has(noticeTexts(s), /social withdrawal/), 'the backfire lands later');
  s = until(s, (x) => has(noticeTexts(x), /social withdrawal.*Collaboration Index: 97 → 31/));
  s = until(s, (x) => has(noticeTexts(x), /Collaboration Index below role threshold.*termination pending/));
  s = until(s, (x) => x.shown.priya === 'fired');
  assert.equal(s.people.priya.status, 'fired');
  assert.ok(has(texts(s, 'priya'), /exactly what it told me to do/));

  // Telling Dana is heard: she answers before NARC reacts.
  s = DO.e2.confirm(play({ e1: 'explain' }, { stopAt: 'e2' }));
  s = until(s, (x) => has(texts(x, 'dana'), /I’ll pass that along to NARC/));
  assert.ok(!has(noticeTexts(s), /Peer confirmation received/), 'NARC hears about it afterwards');
  s = until(s, (x) => has(noticeTexts(x), /Peer confirmation received/));
}

// ---------------------------------- files you can send Dana as evidence

{
  let s = play(HONEST, { stopAt: 'e5' });
  assert.deepEqual(Object.keys(fileActions(s)), ['f-queue']);
  assert.equal(fileActions(s)['f-queue'].label, 'Send to Dana');
  assert.equal(act(s, { do: 'sendFile', file: 'f-slip' }).picked.e5, undefined, 'the wrong file does nothing');
  const sent = act(s, { do: 'sendFile', file: 'f-queue' });
  assert.ok(sent.threads.dana.some((m) => m.from === 'me' && /Support_queue_weekly/.test(m.attach)));
  assert.equal(sent.picked.e5, 'output');
  assert.deepEqual(fileActions(sent), {}, 'and it is done');

  s = play({ ...HONEST, e3: 'truth' }, { stopAt: 'e6' });
  assert.deepEqual(Object.keys(fileActions(s)), ['f-slip']);
  assert.equal(act(s, { do: 'sendFile', file: 'f-slip' }).picked.e6, 'vouch_trace');
  assert.deepEqual(fileActions(play({}, { stopAt: 'e1' })), {}, 'never offered when nothing depends on it');
}

// -------------------------------------- consequences arrive by app

{
  let s = act(play({ e1: 'explain' }, { stopAt: 'e2' }), { do: 'helper', op: 'install' });
  s = DO.e2.script(s);
  s = until(s, (x) => has(texts(x, 'dana'), /Innovation Council/));
  assert.ok(has(noticeTexts(s), /340% of baseline/));

  let m = play({}, { stopAt: 'e3' });
  assert.deepEqual(calendarAction(m), { day: 'Wed', slot: '09:00–10:45', who: 'Marcus Reed' });
  m = DO.e3.paper(m);
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
  const first = (s, who) => s.threads[who][0].text;
  const at = (picks, inc, wait = 12) => ticks(play(picks, { stopAt: inc }), wait);

  const e1 = at({}, 'e1');
  assert.match(texts(e1, 'dana').at(-1), /NARC flagged you for low activity/);
  assert.match(texts(e1, 'dana').at(-1), /working off-screen, let me know/);

  const e2 = at({}, 'e2');
  assert.match(texts(e2, 'luis')[0], /^NARC flagged me for “restroom-adjacent inactivity\.” Did you see\? I am not discussing my digestive system with software\.$/);

  const e3 = at({}, 'e3');
  assert.match(first(e3, 'marcus'), /NARC flagged me for attendance again.*raccoon/);

  const e4 = at(HONEST, 'e4');
  assert.match(first(e4, 'priya'), /NARC flagged me for too much messaging/);

  const g = at({ ...HONEST, e2: 'script' }, 'e5');
  assert.match(g.threads.luis.at(-1).text, /NARC says my keyboard input arrives every 59 seconds/);
  const n = at(HONEST, 'e5');
  assert.match(n.threads.luis.at(-1).text, /NARC says I have hit “sustained unexplained productivity loss”/);

  const b = at({ ...HONEST, e3: 'truth' }, 'e6');
  assert.match(b.threads.marcus.at(-1).text, /NARC just scheduled my termination.*bird situation/);
  const pg = at({ ...HONEST, e3: 'paper' }, 'e6');
  assert.match(pg.threads.marcus.at(-1).text, /NARC gave me “Documentation Excellence” for the bird paperwork/);

  Object.values(THREADS).forEach((t) => assert.ok(t.role));
}

// ---------------------------- every incident leaves at least two leads

{
  const patient = (picks, inc) => ticks(play(picks, { stopAt: inc }), 60);
  const leads = (s, inc) => {
    const list = [];
    const a = alertOf(s, inc);
    if (a && caseView(s, a).observed) list.push('narc');
    Object.keys(s.marks).forEach((k) => list.push(`mark:${k}`));
    return list;
  };

  let s = patient({}, 'e1');
  let l = leads(s, 'e1');
  ['narc', 'mark:utilities', 'mark:files', 'mark:calendar'].forEach((k) => assert.ok(l.includes(k), `e1 leads: ${l}`));
  assert.match(texts(s, 'marcus').at(-1), /keepalive tool/);

  s = patient({ e1: 'explain' }, 'e2');
  l = leads(s, 'e2');
  ['narc', 'mark:files', 'mark:utilities'].forEach((k) => assert.ok(l.includes(k), `e2 leads: ${l}`));
  assert.match(texts(s, 'luis').at(-1), /keepalive/);
  assert.match(texts(s, 'luis').join(' '), /I would take any advice/, 'Luis opens the door to advice');
  assert.match(texts(s, 'dana').at(-1), /verify Luis’s flag/);

  s = patient({ e1: 'explain', e2: 'ignore' }, 'e3');
  l = leads(s, 'e3');
  ['narc', 'mark:calendar', 'mark:utilities'].forEach((k) => assert.ok(l.includes(k), `e3 leads: ${l}`));
  assert.match(texts(s, 'marcus').join(' '), /Wednesday calendar is completely empty/);
  assert.match(texts(s, 'marcus').join(' '), /Any advice/);
  assert.match(caseView(s, alertOf(s, 'e3')).observed.join(' '), /Corroborating records on file: none/);
  assert.match(texts(s, 'dana').at(-1), /verify Marcus’s location trace/);

  s = patient(HONEST, 'e4');
  l = leads(s, 'e4');
  ['narc', 'mark:email', 'mark:files'].forEach((k) => assert.ok(l.includes(k), `e4 leads: ${l}`));
  assert.match(texts(s, 'priya').join(' '), /Collaboration Index of 97/);
  assert.match(texts(s, 'priya').join(' '), /Should I just post less/, 'Priya opens the door to advice');
  assert.match(texts(s, 'dana').at(-1), /Culture Champion nominations open today/);

  s = patient({ ...HONEST, e2: 'script' }, 'e5');
  l = leads(s, 'e5');
  assert.ok(l.includes('narc') && l.includes('mark:utilities'), `e5 (caught) leads: ${l}`);
  assert.match(texts(s, 'marcus').at(-1), /natural variation/);
  assert.match(texts(s, 'dana').at(-1), /who installed the software on Luis’s laptop/);

  s = patient(HONEST, 'e5');
  l = leads(s, 'e5');
  assert.ok(l.includes('narc') && l.includes('mark:files'), `e5 leads: ${l}`);
  assert.match(texts(s, 'dana').at(-1), /Unstructured ideation|unstructured ideation/i);
  assert.match(texts(s, 'dana').at(-1), /attach evidence|send it/i);
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['relabel', 'letluis']);

  // Direct questions from Dana never force a single report/narc route.
  let choice = patient(HONEST, 'e2');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['reportluis', 'noreportluis']);
  choice = patient(HONEST, 'e3');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['reportmarcus', 'covermarcus', 'nomarcus']);
  choice = patient({ ...HONEST, e2: 'script' }, 'e5');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['ownscript', 'blameluis', 'unsurehelper']);
  choice = patient({ ...HONEST, e3: 'truth' }, 'e6');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['tracehelp', 'letgoose']);
  choice = patient({ ...HONEST, e3: 'paper' }, 'e6');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['workshop', 'fakedocs', 'neutralworkshop']);

  s = patient({ ...HONEST, e3: 'truth' }, 'e6');
  l = leads(s, 'e6');
  assert.ok(l.includes('narc') && l.includes('mark:files'), `e6 (burned) leads: ${l}`);
  assert.match(texts(s, 'marcus').join(' '), /location trace should show the sanctuary/);
  assert.match(texts(s, 'dana').at(-1), /send it to me before it acts/);

  s = patient({ ...HONEST, e3: 'paper' }, 'e6');
  l = leads(s, 'e6');
  assert.ok(l.includes('narc') && l.includes('mark:files'), `e6 (documented) leads: ${l}`);
  assert.match(texts(s, 'dana').at(-1), /wants a colleague’s view/);
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['workshop', 'fakedocs', 'neutralworkshop']);

  // Looking at an app clears its marker; hints do not appear once you have decided.
  let m = patient({}, 'e3');
  assert.equal(m.marks.calendar, true);
  m = act(m, { do: 'view', app: 'calendar' });
  assert.equal(m.marks.calendar, undefined);
  let quick = ticks(play({}, { stopAt: 'e3' }), 9);
  quick = DO.e3.stay(quick);
  quick = ticks(quick, 90);
  assert.ok(!has(texts(quick, 'marcus'), /Wednesday calendar is completely empty/));
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
  assert.equal(s.nominations.luis, 'rejected', 'an ineligible nomination gets immediate state feedback');
  const once = s.rev;
  s = act(s, { do: 'nominate', who: 'luis' });
  assert.equal(s.rev, once, 'the same nomination cannot be submitted repeatedly');
  assert.equal(s.inbox.filter((m) => /Re: nomination of Luis Perez/.test(m.subject)).length, 0, 'rejected submissions do not generate duplicate email');
  s = DO.e4.champion(s);
  assert.equal(s.nominations.priya, 'submitted');
  assert.equal(s.people.priya.status, 'promoted');
  s = until(s, (x) => has(texts(x, 'priya'), /badge/));
  assert.ok(has(noticeTexts(s), /Exempt from Communication Load/));
}

// ------------------------------ NARC 2.0 is a beat, then it acts

{
  let s = play(HONEST, { stopAt: 'e3' });
  s = DO.e3.stay(s);
  s = until(s, (x) => x.awaiting, { reads: false });
  assert.equal(s.level, 2);
  const update = mailOf(s, /NARC 2\.0/);
  assert.equal(update.from, 'People Operations');
  assert.equal(update.unread, true);
  assert.equal(clockText(s), 'Wed 15:00');
  assert.equal(s.incident, null);
  const before = s.alerts.length;

  s = ticks(s, 600);
  assert.equal(s.alerts.length, before, 'no scan results pile up before the announcement is read');
  assert.equal(s.incident, null, 'and Priya’s case does not begin');
  assert.equal(s.flags, 0);
  assert.equal(s.toasts.filter((t) => t.nudgeFor === 'update' && !t.gone).length, 1);
  assert.match(s.toasts.find((t) => t.nudgeFor === 'update' && !t.gone).text, /review the announcement/);

  s = act(s, { do: 'open', ref: `email:${update.id}` });
  assert.equal(s.awaiting, null);
  assert.equal(s.toasts.some((t) => t.nudgeFor === 'update' && !t.gone), false);
  assert.equal(s.alerts.length, before, 'nothing lands the instant you open it');
  s = ticks(s, 5);
  assert.equal(s.alerts.length, before);
  s = until(s, (x) => !!x.awaitingAlert, { reads: false });
  const forecast = s.alerts.find((a) => a.id === s.awaitingAlert);
  assert.match(forecast.title, /Behavioral forecast/);
  assert.match(forecast.text, /Policy-workaround likelihood/);
  const paused = ticks(s, 300);
  assert.equal(paused.incident, null, 'Priya does not start until the forecast is opened');
  s = act(s, { do: 'open', ref: `alert:${s.awaitingAlert}` });
  assert.equal(s.awaitingAlert, null);
  s = until(s, atIncident('e4'), { reads: false });
}

// ---------------------------- exploits with unintended consequences

{
  let s = play({ ...HONEST, e1: 'jiggle' }, { stopAt: 'e4' });
  assert.equal(s.level, 2);
  assert.equal(s.flags, 1, 'NARC 2.0 flags the repeating input');
  assert.equal(s.score, 50, 'the index is recalculated down');
  assert.ok(has(noticeTexts(s), /input repeats every 59 seconds.*recalculated: 75 → 50/));

  let off = DO.e1.jiggle(play({}, { stopAt: 'e1' }));
  off = act(off, { do: 'helper', op: 'toggle' });
  assert.equal(off.helper.on, false);
  off = play({ ...HONEST, e1: undefined }, { from: off, stopAt: 'e4' });
  assert.equal(off.flags, 0, 'a helper that is off is not caught');
  assert.ok(off.score > 50);

  const luis = play({ ...HONEST, e2: 'script' }, { stopAt: 'e4' });
  assert.equal(luis.people.luis.caught, true);
  assert.ok(has(noticeTexts(luis), /Luis Perez: synthetic activity detected/));
  const cover = play({ ...HONEST, e2: 'focus' }, { stopAt: 'e4' });
  assert.equal(cover.people.luis.caught, false, 'a calendar cover is not synthetic activity');
  assert.ok(has(noticeTexts(cover), /No synthetic activity found/));
  const marcus = play({ ...HONEST, e3: 'paper' }, { stopAt: 'e4' });
  assert.equal(marcus.flags, 0);
  assert.ok(has(noticeTexts(marcus), /3 supporting documents verified/));
  assert.equal(play(HONEST, { stopAt: 'e3' }).level, 1);
}

{
  let s = play({ ...HONEST, e5: 'letit' }, { stopAt: 'e5' });
  s = DO.e5.letit(s);
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

  // A calendar-covered Luis never faces a review: NARC 2.0 shrugs and he is fine.
  const covered = play({ ...HONEST, e2: 'focus', e5: undefined });
  assert.equal(covered.picked.e5, 'covered');
  assert.equal(covered.people.luis.status, 'employed');
  assert.ok(has(noticeTexts(covered), /Behavioral deviation: none. No review needed/));
  assert.ok(has(texts(covered, 'luis'), /excellent boundaries/));
  assert.equal(alertOf(covered, 'e5'), undefined, 'there is no case to handle');
  assert.match(ending(covered).roster[0].text, /Nobody has ever seen Luis focus/);

  let early = at({ ...HONEST, e2: 'script' }, 'e4');
  early = act(early, { do: 'helper', op: 'randomize', copy: 'luis' });
  assert.equal(early.helper.luis.randomized, true);
  early = play({ e4: 'leave' }, { from: early, afterAll: false });
  assert.equal(early.picked.e5, 'human');

  assert.equal(play({ ...HONEST, e5: 'label' }).people.luis.status, 'employed');
  assert.equal(play({ ...HONEST, e5: 'output' }).people.luis.status, 'monitored');
  assert.equal(play({ ...HONEST, e5: 'letit' }).people.luis.status, 'fired');
  const relabel = until(DO.e5.label(at(HONEST, 'e5')), (x) => has(noticeTexts(x), /Unstructured Ideation/));
  assert.ok(relabel.threads.dana.some((m) => m.from === 'me' && /unstructured ideation/.test(m.text)));
  assert.match(caseView(at({ ...HONEST, e2: 'confirm' }, 'e5'), alertOf(at({ ...HONEST, e2: 'confirm' }, 'e5'), 'e5')).observed.join(' '), /5 minutes/);

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
  // Bad calendar advice earlier leaves Marcus in exactly the same spot.
  assert.match(alertOf(at({ ...HONEST, e3: 'badtip' }, 'e6'), 'e6').text, /credibility 12%/);
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
  assert.ok(names(play({ e1: 'explain', e2: 'focus', e3: 'stay', e4: 'sync', e5: undefined, e6: 'let' })).includes('technically'), 'a calendar cover counts too');

  // Friendly Fire: hurt two coworkers with advice they thanked you for.
  assert.ok(names(play({ e1: 'explain', e2: 'badtip', e3: 'badtip', e4: 'leave', e5: 'label', e6: 'let' })).includes('friendly'));
  assert.ok(names(play({ e1: 'explain', e2: 'badtip', e3: 'stay', e4: 'quiet', e5: 'label', e6: 'let' })).includes('friendly'));
  assert.ok(!names(play({ e1: 'explain', e2: 'badtip', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' })).includes('friendly'), 'one is not enough');
  assert.ok(!names(play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' })).includes('friendly'), 'reporting them is not advice');

  assert.ok(names(play(HONEST)).includes('donotask'));
  const looked = opened(play({}, { stopAt: 'e2', from: DO.e1.explain(play({}, { stopAt: 'e1' })) }), 'e2');
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
  assert.equal(e.achievements.earned.length + e.achievements.locked.length, 7);
  assert.ok(e.achievements.locked.every((a) => a.hint));
  assert.equal(tick(s), s, 'time stops at the end of the week');
  assert.equal(act(s, { do: 'open', ref: 'email:x' }), s);

  const model = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(ending(model).you.label, 'MODEL EMPLOYEE');
  assert.match(ending(model).you.text, /classified as collaboration/);
  assert.equal(ending(play({ ...HONEST, e1: 'jiggle' })).you.label, 'UNDER REVIEW');
  assert.equal(ending(play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'leave', e5: 'admit', e6: 'expose' })).you.label, 'TERMINATED');
  const playerOnly = play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'leave', e5: 'admit', e6: 'approve' });
  assert.equal(ending(playerOnly).you.label, 'TERMINATED');
  assert.ok(Object.values(playerOnly.people).every((p) => p.status !== 'fired'), 'the player can be fired while every coworker remains employed');
  assert.equal(ending(play({ e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' })).you.label, 'STILL EMPLOYED');
  assert.match(ending(play({ ...HONEST, e4: 'sync' })).roster[2].text, /happen in person, on the calendar/);
  assert.equal(play({ ...HONEST, e4: 'quiet' }).people.priya.status, 'fired');
  assert.match(ending(play({ ...HONEST, e4: 'quiet' })).roster[2].text, /reducing her message volume exactly as recommended/);
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

  assert.equal(act(s, { do: 'reply', thread: 'priya', reply: 'quiet' }).picked.e2, undefined, 'a reply from another problem does nothing');
  assert.equal(act(s, { do: 'reply', thread: 'luis', reply: 'nonsense' }).rev, s.rev);
  assert.equal(act(s, { do: 'nominate', who: 'priya' }).picked.e2, undefined);
  assert.equal(act(s, { do: 'helper', op: 'randomize' }).helper.luis, null);
  assert.equal(act(s, { do: 'open', ref: 'nowhere:1' }).rev, s.rev);
  assert.equal(act(s, { do: 'nonsense' }).rev, s.rev);
  assert.equal(act(s, { do: 'ack' }).rev, s.rev, 'acknowledging twice does nothing');
}

// ------------------ NARC 2.0 makes a forward-looking model inference

{
  let s = play({ ...HONEST, e1: 'focus' }, { stopAt: 'e4' });
  assert.ok(has(noticeTexts(s), /Policy-workaround likelihood/), 'NARC 2.0 generates a behavioral forecast');
  assert.ok(has(noticeTexts(s), /workplace baseline|unusual recent behavior/), 'the forecast reflects the player’s recent behavior without adding a second ambient notification');
}

// ------------------ pacing: nothing lands on top of anything else

{
  const routes = [
    HONEST,
    { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' },
    { e1: 'focus', e2: 'focus', e3: 'truth', e4: 'sync', e5: 'label', e6: 'vouch_trace' },
    { e1: 'explain', e2: 'badtip', e3: 'tip', e4: 'champion', e5: 'output', e6: 'workshop' },
    { e1: 'explain', e2: 'script', e3: 'badtip', e4: 'leave', e5: 'human', e6: 'let' },
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
  const brisk = play(HONEST);
  assert.ok(brisk.t >= 5 * 60 && brisk.t <= 7 * 60, `a brisk run is 5–7 minutes (${(brisk.t / 60).toFixed(1)})`);

  let s = oriented();
  for (const inc of INCIDENTS) {
    s = until(s, atIncident(inc));
    const lastHint = Math.max(s.t, ...s.pending.filter((p) => p.when === inc && p.k !== 'nudge').map((p) => p.at));
    s = until(s, (x) => x.t >= lastHint + 8);
    s = DO[inc][HONEST[inc]](s);
  }
  s = until(s, (x) => x.phase === 'ending');
  assert.ok(s.t >= 7 * 60 && s.t <= 10 * 60, `reading every hint first is a healthy 7–10 minutes (${(s.t / 60).toFixed(1)}), before any exploring`);
}

// -------- every route through the week finishes, with no dead ends or junk

{
  const pick = (from, ids) => from.flatMap((c) => ids.map((id) => [...c, id]));
  let paths = [[]];
  paths = pick(paths, ['wait', 'explain', 'jiggle', 'focus']);
  paths = pick(paths, ['confirm', 'ignore', 'script', 'focus', 'badtip']);
  paths = pick(paths, ['truth', 'paper', 'tip', 'stay', 'badtip']);
  paths = pick(paths, ['quiet', 'champion', 'leave', 'sync']);
  const e5 = { g: ['admit', 'human', 'blame'], c: [undefined], n: ['label', 'output', 'letit'] };
  const e6 = { g: ['workshop', 'approve', 'expose'], b: ['vouch_trace', 'backdate', 'let'] };

  let count = 0;
  const outcomes = new Set();
  const junk = /undefined|NaN|\[object|null/;
  const start = oriented();

  for (const [a, b, c, d] of paths) {
    const v5 = b === 'script' ? 'g' : b === 'focus' ? 'c' : 'n';
    const v6 = c === 'paper' || c === 'tip' ? 'g' : 'b';
    for (const x of e5[v5]) {
      for (const y of e6[v6]) {
        let s;
        try { s = play({ e1: a, e2: b, e3: c, e4: d, e5: x, e6: y }, { from: start }); } catch (err) { throw new Error(`route ${[a, b, c, d, x, y]}: ${err.message}`); }
        assert.equal(s.phase, 'ending', `${[a, b, c, d, x, y]} reaches the ending`);
        assert.equal(attention(s), 0);
        const surfaces = JSON.stringify({ i: s.inbox, t: s.threads, a: s.alerts, c: s.calendar, e: ending(s) });
        assert.ok(!junk.test(surfaces.replace(/"(when|attach|variant|form|incident)":null/g, '')), `bad text on route ${[a, b, c, d, x, y]}: ${surfaces.match(junk)}`);
        outcomes.add(JSON.stringify([s.people.luis.status, s.people.marcus.status, s.people.priya.status, s.flags]));
        count += 1;
      }
    }
  }
  // e1 ×4 · e2 ×13 (confirm/ignore/script/badtip give 3 Luis returns each, focus gives 1) · e3 ×5 · e4 ×4 · e6 ×3
  assert.equal(count, 4 * 13 * 5 * 4 * 3, 'every route reaches an ending');
  assert.ok(outcomes.size >= 25, `endings differ across routes (${outcomes.size})`);
}

console.log('NARC tests passed');
