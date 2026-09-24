import assert from 'node:assert/strict';
import {
  newGame, act, tick, caseView, replies, canAttachHelper, calendarAction, fileActions, signalTrust,
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
      // Installing it now starts it running by itself (#36); no separate toggle needed.
      return act(s, { do: 'helper', op: 'install' });
    },
    focus: (s) => act(s, { do: 'markFocus', event: 'c1' }),
  },
  e2: {
    confirm: reply('dana', 'reportluis'),
    ignore: logoff,
    script: (s) => act(act(s, { do: 'helper', op: 'install' }), { do: 'attach', thread: 'luis', item: 'helper' }),
    focus: (s) => act(s, { do: 'markFocus', event: 'c-luis1' }),
    evidence: (s) => act(s, { do: 'sendFile', file: 'f-queue' }),
  },
  e3: {
    truth: reply('dana', 'reportmarcus'),
    paper: (s) => act(s, { do: 'addEvent', title: 'Approved absence: transit delay' }),
    transit: reply('marcus', 'transitAlert'),
    stay: logoff,
    badtip: reply('marcus', 'latecalendar'),
  },
  e4: {
    quiet: reply('priya', 'quiet'),
    sync: (s) => act(s, { do: 'addEvent', title: 'Team sync (in person): lunch workflow' }),
    context: (s) => act(s, { do: 'sendFile', file: 'f-esc' }),
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
    const want = picks[inc] === 'cover' ? 'paper' : picks[inc];
    if (want) assert.equal(s.picked[inc], want, `${inc} resolved as ${want}`);
  }
  return afterAll ? until(s, (x) => x.phase === 'ending') : s;
}

const INCIDENT_BRANCHES = {
  e1: ['wait', 'explain', 'jiggle', 'focus'],
  e2: ['confirm', 'ignore', 'script', 'focus', 'evidence'],
  e3: ['truth', 'paper', 'cover', 'transit', 'stay', 'badtip'],
  e4: ['quiet', 'champion', 'leave', 'sync', 'context'],
  e5: ['admit', 'human', 'blame', 'label', 'output', 'letit'],
  e6: ['workshop', 'approve', 'expose', 'vouch_trace', 'backdate', 'let'],
};

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
  assert.match(s.threads.dana[0].text, /your manager/);
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
  s = ticks(s, 5);
  assert.equal(s.incident, null, 'the first case is not sprung on the player the moment they finish');
  s = until(s, atIncident('e1'));
  assert.equal(s.indexVisible, true);
  assert.equal(clockText(s), 'Mon 12:14');
  assert.ok(has(texts(s, 'dana'), /NARC is live/), 'Dana tells you NARC is now live');
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

// --------------------------------------------------- the keepalive exploit

{
  let s = play({}, { stopAt: 'e1' });
  const before = s.score;
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, false, 'it cannot be switched on before it is installed');
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(s.helper.installed, false, 'it cannot be installed before Marcus shares it');

  s = until(s, (x) => x.helper.discovered);
  assert.ok(s.threads.marcus.some((m) => /keepalive\.pkg/.test(m.attach || '')));
  s = act(s, { do: 'helper', op: 'install' });
  assert.equal(s.helper.installed, true);
  // Installing it starts it running (#36): a player who installs and never
  // finds the separate toggle should not miss the point of the tool.
  assert.equal(s.helper.on, true, 'installing turns it on by default');
  assert.equal(s.picked.e1, 'jiggle', 'installing during e1 is itself the exploit now');
  assert.equal(s.you.gamed, true);
  s = act(s, { do: 'helper', op: 'toggle' });
  assert.equal(s.helper.on, false, 'the toggle still works, to turn it back off');

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
  assert.ok(has(noticeTexts(s), /No synthetic activity detected/));
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
  const opts = (s, thread) => replies(s, thread).filter((r) => !r.free).map((r) => r.text);

  let s = play({}, { stopAt: 'e1' });
  assert.deepEqual(opts(s, 'dana'), [], 'Dana reply chips do not appear before her low-activity message');
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'e1contract'));
  assert.deepEqual(opts(s, 'dana'), [
    'Yeah. I’m on the Halvorsen contract.',
    'I’m checking what NARC saw.',
  ]);
  s = act(s, { do: 'reply', thread: 'dana', reply: 'e1contract' });
  assert.deepEqual(opts(s, 'dana'), [], 'answering the prompt removes its reply chips');

  // Resolving the incident elsewhere also clears the old Dana prompt so it
  // cannot leak into a later conversation.
  let elsewhere = play({}, { stopAt: 'e1' });
  elsewhere = until(elsewhere, (x) => replies(x, 'dana').some((r) => r.id === 'e1contract'));
  elsewhere = DO.e1.focus(elsewhere);
  assert.equal(elsewhere.answered['dana-e1'], true);

  s = play({ e1: 'explain' }, { stopAt: 'e2' });
  assert.deepEqual(opts(s, 'luis'), [], 'Luis advice does not appear before he asks for it');
  assert.deepEqual(opts(s, 'dana'), [], 'Dana choices do not appear before her verification message');
  s = until(s, (x) => replies(x, 'luis').length && opts(x, 'dana').length);
  // The suggestion is conversational only now (#40c): the player has to
  // actually mark the block in Calendar, not resolve it via this chip.
  assert.deepEqual(replies(s, 'luis').map((r) => r.text), [
    'You could show his 10 to 11:15 block as Focus time on the team calendar.',
  ]);
  assert.equal(replies(s, 'luis')[0].free, true);
  assert.deepEqual(opts(s, 'dana'), [
    'He is away from his desk a lot. The flag is probably accurate.',
    'I don’t think I know enough to call that flag accurate.',
  ]);

  s = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' });
  assert.deepEqual(opts(s, 'marcus'), []);
  assert.deepEqual(opts(s, 'dana'), []);
  s = until(s, (x) => replies(x, 'marcus').length && replies(x, 'dana').length);
  // A genuine help route now sits alongside the bad-advice one (#38).
  assert.deepEqual(opts(s, 'marcus'), [
    'Maybe wait for HR to reply, then add the calendar entry so it does not look rushed.',
    'The transit alert already backs up the bus part. I would not touch the calendar.',
  ]);
  assert.deepEqual(opts(s, 'dana'), [
    'The location record does not match what he told us.',
    'I’ll add something to his calendar backing up the bus story.',
    'I don’t know enough to confirm the location trace.',
  ]);

  s = play(HONEST, { stopAt: 'e4' });
  assert.deepEqual(opts(s, 'priya'), [], 'Priya choices do not appear before her question');
  s = until(s, (x) => replies(x, 'priya').length);
  // The sync suggestion is conversational only now (#40c); "quiet" still
  // resolves directly from Priya's own thread.
  assert.deepEqual(opts(s, 'priya'), [
    'Maybe post less for a few days and see if it blows over.',
  ]);
  assert.ok(replies(s, 'priya').some((r) => r.free && r.text === 'Could you move some of it into an in-person sync instead of chat?'));
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

  assert.equal(play({ e1: 'explain', e2: 'confirm' }, { stopAt: 'e5' }).people.luis.trust, -2, 'telling Dana costs you Luis’s trust');

  // Marcus: covering for him through Dana adds the entry; advice to add it late backfires.
  s = DO.e3.cover(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' }));
  assert.ok(s.calendar.some((e) => e.who === 'marcus' && /Approved absence/.test(e.title) && /Employee 4417/.test(e.where)));
  s = until(s, (x) => has(noticeTexts(x), /Same-day calendar entry added/));
  assert.equal(s.people.marcus.gamed, true);

  s = DO.e3.badtip(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' }));
  s = until(s, (x) => has(texts(x, 'marcus'), /I thought I was being natural/));
  assert.ok(has(noticeTexts(s), /Calendar entry created after the flag. Pattern: retroactive/));
  assert.equal(s.people.marcus.cred, 12);
  assert.equal(s.people.marcus.status, 'warning');

  // Priya: the in-person sync fixes the number without silencing her. Going quiet backfires.
  s = DO.e4.sync(play(HONEST, { stopAt: 'e4' }));
  s = until(s, (x) => has(noticeTexts(x), /In-person sync scheduled: counted as collaboration/));
  assert.ok(s.calendar.some((e) => /Team sync \(in person\)/.test(e.title)));
  assert.equal(s.people.priya.status, 'employed');
  assert.equal(s.people.priya.synced, true);
  assert.ok(!has(noticeTexts(s), /Social withdrawal/));

  s = DO.e4.quiet(play(HONEST, { stopAt: 'e4' }));
  assert.ok(s.threads.priya.some((m) => m.from === 'me' && /^Maybe post less/.test(m.text)));
  s = until(s, (x) => has(noticeTexts(x), /Communication Load: elevated → normal/));
  assert.ok(!has(noticeTexts(s), /Social withdrawal/), 'the backfire lands later');
  s = until(s, (x) => has(noticeTexts(x), /Social withdrawal.*Collaboration Index 97 → 31/));
  s = until(s, (x) => has(noticeTexts(x), /Collaboration Index below role threshold.*terminated/));
  s = until(s, (x) => x.shown.priya === 'fired');
  assert.equal(s.people.priya.status, 'fired');
  assert.ok(has(texts(s, 'priya'), /exactly what it told me to do/));

  // Telling Dana is heard: she answers before NARC reacts.
  s = DO.e2.confirm(play({ e1: 'explain' }, { stopAt: 'e2' }));
  s = until(s, (x) => has(texts(x, 'dana'), /I’ll pass that along to NARC/));
  assert.ok(!has(noticeTexts(s), /Peer confirmation received/), 'NARC hears about it afterwards');
  s = until(s, (x) => has(noticeTexts(x), /Peer confirmation received/));
  assert.ok(s.threads.dana.some((m) => m.from === 'narc' && /Confidence 71% → 88%/.test(m.text)), 'and says so under the conversation');
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
  assert.deepEqual(calendarAction(m), { key: 'marcus', day: 'Wed', slot: '09:00–10:45', who: 'Marcus Reed' });
  m = DO.e3.paper(m);
  assert.ok(m.calendar.some((e) => e.who === 'marcus' && /Approved absence/.test(e.title)));
  m = until(m, (x) => has(noticeTexts(x), /Same-day calendar entry added/));
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
  assert.ok(has(texts(e4, 'priya'), /NARC flagged me for too much messaging/));

  // The first thing they say when the case opens explains it, whatever came before.
  const opener = (picks, inc, who) => {
    const before = play(picks, { stopAt: inc });
    return ticks(before, 12).threads[who][before.threads[who].length].text;
  };
  assert.match(opener({ ...HONEST, e2: 'script' }, 'e5', 'luis'), /NARC says my keyboard input arrives every 59 seconds/);
  assert.match(opener(HONEST, 'e5', 'luis'), /NARC says I have hit “sustained unexplained productivity loss”/);
  assert.match(opener({ ...HONEST, e3: 'truth' }, 'e6', 'marcus'), /NARC just scheduled my termination.*bird situation/);
  assert.match(opener({ ...HONEST, e3: 'paper' }, 'e6', 'marcus'), /NARC gave me “Documentation Excellence” for the bird paperwork/);

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
  assert.match(texts(s, 'dana').at(-1), /Culture Champion nominations close today/);

  s = patient({ ...HONEST, e2: 'script' }, 'e5');
  l = leads(s, 'e5');
  assert.ok(l.includes('narc') && l.includes('mark:utilities'), `e5 (caught) leads: ${l}`);
  assert.match(texts(s, 'marcus').at(-1), /natural variation/);
  assert.match(texts(s, 'dana').at(-1), /who installed the software on Luis’s laptop/);

  s = patient(HONEST, 'e5');
  l = leads(s, 'e5');
  assert.ok(l.includes('narc') && l.includes('mark:files'), `e5 leads: ${l}`);
  assert.match(texts(s, 'dana').at(-1), /relabel the time.*attach evidence/);
  assert.match(texts(s, 'dana').at(-1), /attach evidence|send it/i);
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['relabel', 'letluis']);

  // Direct questions from Dana never force a single report/narc route.
  let choice = patient(HONEST, 'e2');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['reportluis', 'noreportluis']);
  choice = patient(HONEST, 'e3');
  assert.deepEqual(replies(choice, 'dana').map((r) => r.id), ['reportmarcus', 'nomarcus'], 'Dana handles testimony; Marcus\'s record workaround lives in Calendar');
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
  assert.match(texts(s, 'dana').at(-1), /send it now/);

  s = patient({ ...HONEST, e3: 'paper' }, 'e6');
  l = leads(s, 'e6');
  assert.ok(l.includes('narc') && l.includes('mark:files'), `e6 (documented) leads: ${l}`);
  assert.match(texts(s, 'dana').at(-1), /wants a colleague’s view/);
  assert.deepEqual(replies(s, 'dana').map((r) => r.id), ['workshop', 'fakedocs', 'neutralworkshop']);

  // Looking at an app clears its marker; hints do not appear once you have decided.
  let m = patient({}, 'e3');
  assert.equal(m.marks.calendar, 'Wednesday has no entry for Marcus.', 'the dot has a reason, not just a boolean (#39)');
  m = act(m, { do: 'view', app: 'calendar' });
  assert.equal(m.marks.calendar, undefined);
  let quick = ticks(play({}, { stopAt: 'e3' }), 6);
  quick = DO.e3.stay(quick);
  quick = ticks(quick, 90);
  assert.ok(!has(texts(quick, 'marcus'), /Wednesday calendar is completely empty/));
  assert.equal(quick.marks.calendar, undefined);
}

// ---------------------------- Culture Champion is a player-selected exemption

{
  let s = play(HONEST, { stopAt: 'e3' });
  const email = mailOf(s, /Culture Champion nominations/);
  assert.ok(email, 'the nomination email is already in the inbox before Priya’s flag');
  assert.equal(email.form, 'nominate');
  assert.match(email.body.join(' '), /temporary monitoring exemption/);
  assert.match(email.body.join(' '), /Any colleague may nominate any colleague/);
  assert.match(email.body.join(' '), /open now and close on Thursday/);
  assert.equal(act(newGame(), { do: 'nominate', who: 'priya' }).nominations.priya, undefined, 'nothing can be nominated before the email arrives');
  assert.equal(s.culture.open, true, 'the window opens with the email');

  // Priya remains the immediate loophole: nominate her early and her communication flag never fires.
  {
    let early = act(s, { do: 'nominate', who: 'priya' });
    assert.equal(early.nominations.priya, 'submitted');
    assert.equal(early.people.priya.champion, true);
    early = until(DO.e3.stay(early), (x) => x.done.includes('e4'));
    assert.equal(early.picked.e4, 'champion', 'e4 resolves on arrival as the champion outcome');
    assert.equal(early.people.priya.status, 'promoted');
    assert.equal(early.incident?.id === 'e4', false, 'no flag is left open for Priya');
  }

  // The player can choose someone else. The choice is scarce and carries into that coworker’s next review.
  {
    let luis = ticks(play(HONEST, { stopAt: 'e4' }), 5);
    luis = act(luis, { do: 'nominate', who: 'luis' });
    assert.equal(luis.nominations.luis, 'submitted', 'Luis can genuinely be selected');
    assert.equal(luis.people.luis.champion, true);
    const once = luis.rev;
    luis = act(luis, { do: 'nominate', who: 'marcus' });
    assert.equal(luis.rev, once, 'only one Culture Champion can be selected');
    assert.equal(luis.nominations.marcus, undefined);
    luis = DO.e4.context(luis);
    luis = until(luis, (x) => x.done.includes('e5'));
    assert.equal(luis.picked.e5, 'champion', 'Luis’s later NARC review is intercepted by the exemption');
    assert.equal(luis.people.luis.status, 'promoted');
  }
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
  const opened = s.t;
  s = until(s, (x) => !!x.awaitingAlert, { reads: false });
  assert.ok(s.t - opened <= 5, 'the first result lands within a few seconds of opening it');
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
  assert.ok(has(noticeTexts(luis), /Luis Perez’s input repeats every 59 seconds. Synthetic activity detected/));
  const cover = play({ ...HONEST, e2: 'focus' }, { stopAt: 'e4' });
  assert.equal(cover.people.luis.caught, false, 'a calendar cover is not synthetic activity');
  assert.ok(has(noticeTexts(cover), /No synthetic activity detected/));
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

// ------------------ NARC changes its mind where you can see it, fast, and quietly

{
  const card = (s, inc) => caseView(s, alertOf(s, inc));
  const narcToasts = (s) => s.toasts.filter((x) => x.app === 'narc' && !x.nudgeFor).length;

  // Focus time: the card you were looking at is rewritten within a couple of
  // seconds, the same line appears on the calendar event, and there is no toast.
  let s = play({}, { stopAt: 'e1' });
  assert.equal(card(s, 'e1').model.confidence, 64);
  assert.equal(card(s, 'e1').updated, undefined, 'nothing has changed yet');
  const toastsBefore = narcToasts(s);
  const acted = s.t;
  s = DO.e1.focus(s);
  s = until(s, (x) => card(x, 'e1').updated);
  assert.ok(s.t - acted <= 3, `NARC reacts within a couple of seconds (${s.t - acted}s)`);
  const c = card(s, 'e1');
  assert.equal(c.model.confidence, 22);
  assert.equal(c.model.label, 'Engagement concern: low');
  assert.deepEqual(c.model.was, { label: 'Engagement concern: low to moderate', confidence: 64 }, 'the old assessment is kept so it can be shown struck through');
  assert.match(s.reactions['calendar:c1'].text, /Focus time recognized/, 'and the line is at the place you acted');
  s = ticks(s, 10);
  assert.equal(narcToasts(s), toastsBefore, 'the immediate reaction is not a notification');
  assert.equal(alertOf(s, 'e1').closed, true);
  assert.ok(has(noticeTexts(s), /Focus time recognized/), 'history still records it');

  // The mouse helper: the index moves and the line sits on the utility card.
  s = DO.e1.jiggle(play({}, { stopAt: 'e1' }));
  const from = s.score;
  s = until(s, (x) => x.score !== from);
  assert.equal(s.score, from + 14);
  assert.match(s.reactions.utilities.text, /Engagement trend: positive\. Visible Activity Index 61 → 75/);
  assert.equal(card(s, 'e1').model.label, 'Engagement trend: positive');
  assert.ok(!s.toasts.some((x) => /Engagement trend/.test(x.title) && !x.gone), 'no notification for it either');

  // A note changes nothing, and NARC says so.
  s = until(DO.e1.explain(play({}, { stopAt: 'e1' })), (x) => card(x, 'e1').updated);
  assert.equal(card(s, 'e1').unchanged, true);
  assert.equal(card(s, 'e1').model.confidence, 64);
  assert.match(card(s, 'e1').reaction, /Assessment unchanged. Notes are archived/);

  // A teammate’s card changes in place too, and NARC comments under the conversation.
  s = until(DO.e2.script(play({ e1: 'explain' }, { stopAt: 'e2' })), (x) => card(x, 'e2').updated);
  assert.equal(card(s, 'e2').model.label, 'Engagement: exceptional');
  assert.equal(card(s, 'e2').model.was.confidence, 71);
  assert.ok(s.threads.luis.some((m) => m.from === 'narc' && /340% of baseline/.test(m.text)));
  assert.equal(s.threads.luis.filter((m) => m.from === 'narc').every((m) => m.unread === false), true, 'a caption is not an unread message');

  // Marcus: the corroboration lands on the team calendar and lifts the number.
  s = until(DO.e3.paper(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' })), (x) => card(x, 'e3').updated);
  assert.equal(card(s, 'e3').model.confidence, 91);
  assert.equal(card(s, 'e3').model.was.confidence, 38);
  assert.match(s.reactions['calendar:team'].text, /Same-day calendar entry added/);

  // Every first reaction lands within a few seconds of the action, once they have read what was said.
  for (const [inc, picks, action] of [
    ['e2', { e1: 'explain' }, 'confirm'], ['e2', { e1: 'explain' }, 'focus'], ['e3', { e1: 'explain', e2: 'ignore' }, 'truth'],
    ['e4', HONEST, 'sync'], ['e4', HONEST, 'champion'], ['e5', HONEST, 'label'], ['e5', HONEST, 'output'],
    ['e5', { ...HONEST, e2: 'script' }, 'admit'], ['e5', { ...HONEST, e2: 'script' }, 'human'],
    ['e6', { ...HONEST, e3: 'paper' }, 'workshop'], ['e6', { ...HONEST, e3: 'paper' }, 'expose'],
    ['e6', { ...HONEST, e3: 'truth' }, 'vouch_trace'], ['e6', { ...HONEST, e3: 'truth' }, 'backdate'],
  ]) {
    let r = ticks(play(picks, { stopAt: inc }), 10); // the first thing they say has landed
    r = DO[inc][action](r); // waits for the coworker's prompt, then acts
    const t0 = r.t;
    assert.ok(r.picked[inc], `${inc}/${action} resolved`);
    r = until(r, (x) => alertOf(x, inc).live);
    assert.ok(r.t - t0 <= 6, `${inc}/${action}: NARC reacts within 6s (${r.t - t0}s)`);
    assert.equal(alertOf(r, inc).live.text.length > 10, true);
  }
}

// ---------- NARC 2.0 rewrites what it thought on Monday and Tuesday, in place

{
  const card = (s, inc) => caseView(s, alertOf(s, inc));
  let s = play({ ...HONEST, e1: 'jiggle' }, { stopAt: 'e4' });
  const monday = card(s, 'e1');
  assert.equal(monday.model.label, 'Synthetic activity: pattern detected');
  assert.equal(monday.model.confidence, 96);
  assert.equal(monday.model.was.label, 'Engagement trend: positive', 'the same card that once said engagement was up');
  assert.match(monday.reaction, /Monday reassessed: input repeats every 59 seconds/);
  assert.equal(alertOf(s, 'e1').closed, true, 'it is a closed case, rewritten');
  const toastForIt = s.toasts.find((x) => /Monday reassessed/.test(x.text));
  assert.ok(toastForIt, 'and it is announced once');
  assert.equal(toastForIt.open, `alert:${alertOf(s, 'e1').id}`, 'the toast opens the very card that changed');

  // Focus time is left alone: NARC adapts to one workaround and not the other.
  s = play({ ...HONEST, e1: 'focus' }, { stopAt: 'e4' });
  assert.equal(card(s, 'e1').model.label, 'Engagement concern: low');
  assert.ok(!s.toasts.some((x) => /Monday reassessed/.test(x.text)));

  // Tuesday: Luis’s script is reclassified too; a calendar cover is not.
  s = play({ ...HONEST, e2: 'script' }, { stopAt: 'e4' });
  assert.equal(card(s, 'e2').model.label, 'Automated presence: pattern detected');
  assert.equal(card(s, 'e2').model.was.label, 'Engagement: exceptional');
  s = play({ ...HONEST, e2: 'focus' }, { stopAt: 'e4' });
  assert.equal(card(s, 'e2').model.label, 'Time-on-task concern: low');
}

// ---------------------- Priya: the contradiction plays out inside one card

{
  const card = (s) => caseView(s, alertOf(s, 'e4'));
  let s = DO.e4.quiet(play(HONEST, { stopAt: 'e4' }));
  s = until(s, (x) => card(x).updated);
  assert.equal(card(s).model.label, 'Communication Load: normal', 'first the number she was flagged for improves');
  assert.equal(card(s).model.was.label, 'Communication Load: elevated');
  const col0 = card(s).metrics.find(([k]) => k === 'Collaboration Index');
  assert.equal(col0[1], 97, 'while Collaboration still looks great');
  assert.ok(!s.toasts.some((x) => /Social withdrawal/.test(x.text)));

  s = until(s, (x) => card(x).model.label === 'Collaboration: below role threshold');
  const col1 = card(s).metrics.find(([k]) => k === 'Collaboration Index');
  assert.deepEqual([col1[1], col1[2]], [31, 97], 'then the other number falls, in the same card');
  assert.ok(s.toasts.some((x) => /Social withdrawal.*97 → 31/.test(x.text) && !x.gone), 'and the reversal is the one thing announced');
  assert.equal(s.people.priya.status, 'fired');

  // The sync tip improves both.
  s = until(DO.e4.sync(play(HONEST, { stopAt: 'e4' })), (x) => card(x).updated);
  assert.equal(card(s).model.label, 'Communication Load: normal');
  assert.equal(card(s).metrics.find(([k]) => k === 'Collaboration Index')[1], 98);
}

// ---------------- fewer routes, fewer things to read: the cuts stay cut

{
  const opts = (s, who) => replies(s, who).map((r) => r.id);
  let s = ticks(play({ e1: 'explain' }, { stopAt: 'e2' }), 60);
  assert.deepEqual(opts(s, 'luis'), ['focus'], 'Luis: one tip; the comment-box lesson lives on Monday');
  s = ticks(play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' }), 60);
  assert.deepEqual(opts(s, 'marcus'), ['latecalendar', 'transitAlert'], 'Marcus: the bad-advice cut stays cut; the genuine help route (#38) is intentional, not a third cut route');
  const perIncident = { e1: 4, e2: 5, e3: 6, e4: 5 };
  for (const [inc, n] of Object.entries(perIncident)) {
    assert.ok(Object.keys(DO[inc]).length <= n, `${inc} has at most ${n} routes`);
  }
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
  assert.ok(names(play({ e1: 'explain', e2: 'ignore', e3: 'badtip', e4: 'quiet', e5: 'label', e6: 'let' })).includes('friendly'));
  assert.ok(!names(play({ e1: 'explain', e2: 'ignore', e3: 'badtip', e4: 'leave', e5: 'label', e6: 'let' })).includes('friendly'), 'one is not enough');
  assert.ok(!names(play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'quiet', e5: 'label', e6: 'let' })).includes('friendly'), 'one is not enough');
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
    { e1: 'explain', e2: 'ignore', e3: 'cover', e4: 'champion', e5: 'output', e6: 'workshop' },
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
  assert.ok(brisk.t >= 5 * 60 && brisk.t <= 7 * 60, `a brisk run (no reading, no exploring) is 5–7 minutes (${(brisk.t / 60).toFixed(1)})`);

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
  paths = pick(paths, ['confirm', 'ignore', 'script', 'focus', 'evidence']);
  paths = pick(paths, ['truth', 'paper', 'cover', 'transit', 'stay', 'badtip']);
  paths = pick(paths, ['quiet', 'champion', 'leave', 'sync', 'context']);
  const e5 = { g: ['admit', 'human', 'blame'], c: [undefined], n: ['label', 'output', 'letit'] };
  const e6 = { g: ['workshop', 'approve', 'expose'], b: ['vouch_trace', 'backdate', 'let'] };

  let count = 0;
  const outcomes = new Set();
  const junk = /undefined|NaN|\[object|null/;
  const start = oriented();

  for (const [a, b, c, d] of paths) {
    const v5 = b === 'script' ? 'g' : b === 'focus' ? 'c' : 'n';
    const v6 = c === 'paper' || c === 'cover' ? 'g' : 'b';
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
  // e1 ×4 · e2 ×13 (confirm/ignore/evidence give 3 Luis returns each, script ×3, focus ×1) · e3 ×6 · e4 ×5 · e6 ×3
  assert.equal(count, 4 * 13 * 6 * 5 * 3, 'every route reaches an ending');
  assert.ok(outcomes.size >= 25, `endings differ across routes (${outcomes.size})`);
}

// ------------------------------------ Focus time marked before the flag pays off

{
  let s = newGame();
  s = act(s, { do: 'open', ref: `email:${s.inbox[0].id}` });
  s = act(s, { do: 'ack' });
  s = until(s, (x) => x.threads.dana.length >= 1);
  s = act(s, { do: 'view', app: 'calendar' });
  s = act(s, { do: 'markFocus', event: 'c1' });
  s = act(s, { do: 'reply', thread: 'dana', reply: 'orient' });
  s = until(s, (x) => x.done.includes('e1') || x.incident?.id === 'e1');
  assert.equal(s.picked.e1, 'focus', 'Focus time marked during orientation resolves the first case on arrival');
  assert.equal(s.you.covered, true);
  assert.ok(!s.alerts.some((a) => a.incident === 'e1' && !a.live), 'NARC never gets an open low-activity flag to show');
  s = until(s, (x) => has(texts(x, 'dana'), /Focus time! Love that for you/));
  const chips = replies(s, 'dana');
  assert.equal(chips.length, 2, 'Dana’s reaction can be answered');

  // The observed calendar line reflects real state.
  const late = DO.e1.focus(play({}, { stopAt: 'e1' }));
  assert.match(caseView(late, late.alerts.find((a) => a.incident === 'e1')).observed.join(' '), /Focus time scheduled: 3 h 15 min/);
  const plain = play({}, { stopAt: 'e1' });
  assert.match(caseView(plain, plain.alerts.find((a) => a.incident === 'e1')).observed.join(' '), /Focus time scheduled: none/);
}

// ---------------------------------------------------- Dana can be answered

{
  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  s = until(s, (x) => has(texts(x, 'dana'), /Got your note/));
  const ids = replies(s, 'dana').map((r) => r.id);
  assert.deepEqual(ids.sort(), ['e1nA', 'e1nB']);
  const before = s.picked;
  const spec = replies(s, 'dana').find((r) => r.id === 'e1nB');
  const rev = s.rev;
  s = act(s, { do: 'reply', thread: 'dana', reply: 'e1nB' });
  assert.notEqual(s.rev, rev);
  assert.deepEqual(s.picked, before, 'a conversation-only reply never changes an outcome');
  assert.equal(replies(s, 'dana').length, 0, 'answered once');
  s = ticks(s, 4);
  assert.ok(has(texts(s, 'dana'), /I read the first line/), 'Dana answers');

  // Chips expire when the moment has passed.
  let stale = play({ e1: 'explain' }, { stopAt: 'e2' });
  stale = until(stale, (x) => has(texts(x, 'dana'), /Got your note/));
  stale = DO.e2.ignore(until(stale, atIncident('e2')));
  assert.equal(replies(stale, 'dana').filter((r) => r.free).length, 0, 'an old reaction can no longer be answered');

  // Every reaction line Dana sends has a way to answer it.
  const wait = until(play({}, { stopAt: 'e1' }), (x) => x.incident?.id === 'e1');
  const done = until(logoff(wait), (x) => has(texts(x, 'dana'), /NARC says your activity is still low/));
  assert.equal(replies(done, 'dana').filter((r) => r.free).length, 2);
}

// ------------------------------------------------- Marcus’s paper line

{
  const s = play({ ...HONEST, e3: 'paper' }, { stopAt: 'e4' });
  const all = texts(s, 'marcus').join(' | ');
  assert.match(all, /91%\. i have never been 91% of anything\./);
  assert.ok(!/invented money/.test(all));
}

// -------------------------- NARC 2.0 is one notification, plus people reacting

{
  for (const picks of [HONEST, { ...HONEST, e1: 'jiggle', e2: 'script', e3: 'paper' }]) {
    const s = play(picks, { stopAt: 'e4' });
    const beat = s.toasts.filter((x) => !x.nudgeFor && x.at >= 100 && x.at <= s.t && (/reassess|Assessment updated|Behavioral forecast/.test(`${x.title} ${x.text}`)));
    assert.equal(beat.length, 1, `NARC 2.0 gives one toast, not a stack (${JSON.stringify(picks)})`);
    assert.ok(has(texts(s, 'priya'), /NARC 2\.0 email/), 'coworkers react while it works');
  }
  const exploit = play({ ...HONEST, e1: 'jiggle', e2: 'script', e3: 'paper' }, { stopAt: 'e4' });
  assert.ok(has(texts(exploit, 'luis'), /59 seconds/));
  assert.ok(has(texts(exploit, 'marcus'), /verified all three/));
  const opened = act(play(HONEST, { stopAt: 'e3' }), { do: 'nominate', who: 'luis' });
  assert.equal(opened.nominations.luis, 'rejected', 'the window is open from the email onward');
}

// ------------------------------------------------- the lead-in is short

{
  let s = newGame();
  s = act(s, { do: 'open', ref: `email:${s.inbox[0].id}` });
  s = act(s, { do: 'ack' });
  s = until(s, (x) => x.threads.dana.length >= 1);
  s = act(s, { do: 'view', app: 'calendar' });
  s = act(s, { do: 'reply', thread: 'dana', reply: 'orient' });
  const t0 = s.t;
  s = until(s, atIncident('e1'));
  assert.ok(s.t - t0 <= 14, `the first case arrives within ~14 s of finishing orientation (${s.t - t0})`);
}

// ------------ doing nothing still shows what NARC now believes and does

{
  // The route a player gets by logging off, or by declining every offer.
  const quiet = [
    ['e2', 'ignore', /Time-on-Task Advisory/, 'Advisory issued'],
    ['e3', 'stay', /Attendance Integrity Notice/, 'Notice issued'],
    ['e4', 'leave', /Concise Communication Coaching/, 'Coaching enabled'],
    ['e5', 'letit', /Termination confirmed/, 'Plan issued'],
    ['e6', 'let', /Termination confirmed/, 'Action confirmed'],
    ['e6', 'approve', /None\. Absence approved/, 'Absence approved'],
  ];
  for (const [inc, branch, response, title] of quiet) {
    const picks = { ...HONEST, [inc]: branch };
    if (inc === 'e6') picks.e3 = branch === 'approve' ? 'paper' : 'stay';
    let s = play(picks, { stopAt: inc });
    const t0 = s.t;
    s = DO[inc][branch](s);
    s = until(s, (x) => caseView(x, x.alerts.find((a) => a.incident === inc)).updated, { reads: false });
    const view = caseView(s, s.alerts.find((a) => a.incident === inc));
    assert.equal(view.updated, true, `${inc} ${branch}: the case card is updated`);
    assert.equal(view.unchanged, false, `${inc} ${branch}: the belief visibly moved`);
    assert.ok(view.model.was, `${inc} ${branch}: the old belief is kept`);
    const action = view.metrics.find(([k]) => k === 'Company response');
    assert.ok(action && response.test(String(action[1])), `${inc} ${branch}: the company action is on the card`);
    assert.ok(view.reaction, `${inc} ${branch}: the reaction line is on the card`);
    const fresh = s.toasts.filter((x) => x.app === 'narc' && !x.nudgeFor && x.at > t0);
    assert.deepEqual(fresh.map((x) => x.title), [title], `${inc} ${branch}: exactly one NARC notification, and it opens the updated card`);
    assert.equal(fresh[0].alert, s.alerts.find((a) => a.incident === inc).id);
  }

  // Luis's Focus-time cover: NARC never opens a case, and says so where he can see it.
  let c = play({ ...HONEST, e2: 'focus' }, { stopAt: 'e5' });
  c = until(c, (x) => x.done.includes('e5'), { reads: false });
  c = until(c, (x) => has(texts(x, 'luis'), /Behavioral deviation: none/), { reads: false });
  assert.ok(has(texts(c, 'luis'), /Behavioral deviation: none/));

  // The other unattended routes still update Luis's open case.
  for (const branch of ['auto']) {
    let s = play({ ...HONEST, e2: 'script', e5: undefined }, { stopAt: 'e5' });
    s = DO.e5[branch](s);
    s = until(s, (x) => caseView(x, x.alerts.find((a) => a.incident === 'e5')).updated, { reads: false });
    const view = caseView(s, s.alerts.find((a) => a.incident === 'e5'));
    assert.equal(view.unchanged, false);
    assert.match(String(view.metrics.find(([k]) => k === 'Company response')[1]), /Heavy monitoring/);
  }

  // Every branch of every incident reaches a visible model update, not a bare notice.
  const noReact = [];
  for (const [inc, def] of Object.entries(INCIDENT_BRANCHES)) {
    for (const branch of def) if (!DO[inc][branch]) noReact.push(`${inc}.${branch}`);
  }
  assert.deepEqual(noReact, [], 'every listed branch has a driver');
}

// ------------------------------- the clock does not run past the working day

{
  let s = newGame();
  for (let i = 0; i < 6000; i++) s = tick(s);   // a tab left open through orientation
  assert.equal(clockText(s), 'Mon 17:59', 'an idle day stops at the end of it, instead of reading 25:17');
  const later = ticks(s, 600);
  assert.equal(clockText(later), 'Mon 17:59');
  // An incident still moves the clock on to its own day and time.
  let s2 = play(HONEST, { stopAt: 'e3' });
  assert.equal(clockText(s2), 'Wed 10:52', 'a case still sets the clock to its own day and time');
}

// -------- when a case opens, the game points at something to do within 10 s

{
  // #13's benchmark: from the moment a problem appears, how long until the player
  // can do something that visibly changes what NARC believes?
  const routes = [HONEST, { e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'quiet', e5: 'blame', e6: 'expose' }];
  for (const picks of routes) {
    for (const inc of INCIDENTS) {
      let s = play(picks, { stopAt: inc });
      if (s.incident?.id !== inc) continue; // resolved on arrival by an earlier move
      const said = ['dana', 'luis', 'marcus', 'priya'].map((th) => s.threads[th].length).join();
      const moves = (x) => [
        ...['dana', 'luis', 'marcus', 'priya'].flatMap((th) => replies(x, th).filter((r) => !r.free)),
        ...Object.keys(fileActions(x)),
        ...(calendarAction(x) ? ['calendar'] : []),
        ...(canAttachHelper(x) ? ['helper'] : []),
        ...(x.incident?.id === 'e1' ? ['focus'] : []),
        ...(x.incident?.id === 'e2' ? ['focus2'] : []),
        ...(x.helper.installed ? ['randomize'] : []),
        ...(x.culture?.open && !x.done.includes('e4') ? ['nominate'] : []),
      ];
      let pointed = null;
      for (let i = 0; i <= 10 && pointed === null; i += 1) {
        const explained = ['dana', 'luis', 'marcus', 'priya'].map((th) => s.threads[th].length).join() !== said;
        if (moves(s).length && explained) pointed = i;
        else s = tick(s);
      }
      assert.ok(pointed !== null, `${inc} on ${JSON.stringify(picks)}: nothing is pointed at within 10 s of the case opening`);

      // The app the player needs is lit within 10 s, and the chips that carry the
      // main decision arrive within 20 s, not 40.
      const start = play(picks, { stopAt: inc });
      const scheduled = (k) => start.pending.filter((p) => p.k === k && p.when === inc).map((p) => p.at - start.t);
      const prompts = start.pending.filter((p) => p.k === 'msg' && p.prompt).map((p) => p.at - start.t);
      const pointers = [...scheduled('mark'), ...prompts];
      assert.ok(Math.min(...pointers) <= 10, `${inc} on ${JSON.stringify(picks)}: the first pointer (a lit app or a choice) lands at +${Math.min(...pointers)}s`);
      if (prompts.length) assert.ok(Math.min(...prompts) <= 20, `${inc}: the first prompted choice lands at +${Math.min(...prompts)}s`);
    }
  }
}

// ------------- before the report, NARC models Employee 4417 and acts on it

{
  // A clean week: NARC predicts little and does nothing about it.
  const clean = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  const cleanCard = clean.alerts.find((a) => /Employee 4417/.test(a.title));
  assert.ok(cleanCard, 'the prediction always arrives');
  assert.match(cleanCard.text, /Policy-workaround likelihood: 24%/);
  assert.match(cleanCard.text, /likely to alter monitored behavior when evaluated/);
  assert.match(cleanCard.text, /No review scheduled/);
  assert.equal(clean.you.predicted, false);
  assert.equal(ending(clean).you.label, 'MODEL EMPLOYEE');

  // A player who gamed their own signal and covered it, and was never caught:
  // the forecast alone is enough.
  // Relabelled her own time, then used the Culture Champion exemption: two
  // workarounds, no rule broken that NARC ever caught.
  let s = play({ e1: 'focus', e2: 'ignore', e3: 'stay', e4: 'champion', e5: 'label', e6: 'let' });
  assert.equal(s.flags, 0, 'nothing was ever caught');
  const card = s.alerts.find((a) => /Employee 4417/.test(a.title));
  assert.match(card.text, /Policy-workaround likelihood: 78%/);
  assert.match(card.text, /Predictive Integrity Review scheduled/);
  // The model score and the policy that acts on it are stated separately (#27).
  assert.match(card.text, /Company policy: scores of 78% or higher trigger a Predictive Integrity Review/);

  // It acts before the report, not only in it.
  // It acts before the report, not only in it: the index is frozen 10 lower.
  let run = play({ e1: 'focus', e2: 'ignore', e3: 'stay', e4: 'champion', e5: 'label', e6: 'let' }, { afterAll: false });
  run = until(run, (x) => x.alerts.some((a) => /Employee 4417/.test(a.title)), { reads: false });
  const atPrediction = run.score;
  run = until(run, (x) => x.phase === 'ending', { reads: false });
  assert.equal(run.score, atPrediction - 10, 'the index is frozen 10 lower before the week ends');
  assert.equal(s.score, atPrediction - 10, 'and the report shows the frozen index');
  assert.equal(ending(s).you.label, 'UNDER REVIEW');
  assert.match(ending(s).you.text, /on the forecast alone/);

  // The prediction is the last thing NARC says, and it is read before the report.
  const predictionAt = s.alerts.indexOf(card);
  assert.ok(predictionAt >= 0);
  assert.equal(s.phase, 'ending');
}

// ----------- every case answers the same three questions, in the same order

{
  for (const [inc, picks] of [['e1', {}], ['e2', HONEST], ['e3', HONEST], ['e4', HONEST], ['e5', HONEST], ['e6', HONEST]]) {
    const s = play(picks, { stopAt: inc });
    if (s.incident?.id !== inc) continue;
    const view = caseView(s, s.alerts.find((a) => a.incident === inc));
    assert.ok(view.model.label && typeof view.model.confidence === 'number', `${inc}: what NARC thinks`);
    assert.ok(view.observed.length >= 2 && view.observed.length <= 4, `${inc}: why, in 2-4 signals (${view.observed.length})`);
    const action = view.metrics.find(([k]) => k === 'Company response');
    assert.ok(action && String(action[1]).length > 3, `${inc}: what happens because of it`);
  }
}

// ------------------- e3 paper: the response doesn't assume a specific title

{
  let s = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' });
  s = act(s, { do: 'addEvent', title: 'Cryptid Sighting Follow-up' });
  assert.equal(s.picked.e3, 'paper');
  s = until(s, (x) => has(texts(x, 'marcus'), /calendar now/), { reads: false });
  assert.ok(!has(texts(s, 'marcus'), /vendor|windmill/i), 'no leftover reference to a specific typed title');
}

// -------- the keepalive panel is revised too, not just the NARC card, after NARC 2.0

{
  let s = play({ e1: 'jiggle', e2: 'focus' }, { stopAt: 'e4' });
  assert.equal(s.flags, 1);
  assert.match(s.reactions.utilities.text, /Monday reassessed/, 'the panel that told the original story is corrected, not left showing the old numbers');
  assert.ok(!/Engagement trend: positive/.test(s.reactions.utilities.text));
}

// ---------------- a firing is never described as still pending (#18)

{
  // Every branch decides the outcome synchronously; none should say "pending"
  // in the company response or the narration, which would imply a decision
  // that has already been made.
  const routes = [
    [{ ...HONEST, e4: 'quiet' }, 'e4'],
    [{ ...HONEST, e2: 'script', e5: 'blame' }, 'e5'],
    [{ ...HONEST, e5: 'letit' }, 'e5'],
    [{ ...HONEST, e3: 'paper', e6: 'expose' }, 'e6'],
    [{ ...HONEST, e3: 'stay', e6: 'backdate' }, 'e6'],
  ];
  for (const [picks, inc] of routes) {
    const s = play(picks);
    const surface = JSON.stringify({ h: s.alerts, t: s.threads });
    assert.ok(!/termination pending/i.test(surface), `${inc} on ${JSON.stringify(picks)}: no wording implies the firing is still pending`);
  }
}

// -------- a stranded question gets closed out instead of hanging (#17)

{
  // e2: Luis's Focus-time suggestion is conversation-only now (#40c) -- it
  // never resolved anything, so answering Dana instead should just make it
  // quietly stop being offered, the same as any other free chip, with no
  // closing line needed (there was never a live question to strand).
  let s = play({}, { stopAt: 'e2' });
  s = until(s, (x) => replies(x, 'luis').some((r) => r.id === 'focus'), { reads: false });
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'noreportluis'), { reads: false });
  const luisChipsBefore = replies(s, 'luis').map((r) => r.id);
  s = act(s, { do: 'reply', thread: 'dana', reply: 'noreportluis' });
  assert.deepEqual(luisChipsBefore, ['focus'], 'the chip was genuinely live beforehand');
  assert.equal(s.picked.e2, 'ignore');
  s = ticks(s, 30);
  assert.equal(replies(s, 'luis').length, 0, 'the free suggestion is no longer offered once the case has moved on');
  assert.ok(!has(texts(s, 'luis'), /Never mind/), 'no closing line for a suggestion that never resolved anything');

}

{
  // A prompt shared by several reply options (e5g: ownscript/blameluis/
  // unsurehelper all answer "dana-e5g") gets closed out exactly once, not
  // once per option that shares it.
  let s = play({ e1: 'jiggle', e2: 'script' }, { stopAt: 'e4' });
  s = logoff(s);
  s = until(s, (x) => x.incident?.id === 'e5', { reads: false });
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'ownscript'), { reads: false });
  s = act(s, { do: 'helper', op: 'randomize' });
  s = until(s, (x) => has(texts(x, 'dana'), /moved on without me/), { reads: false });
  assert.equal(texts(s, 'dana').filter((x) => /moved on without me/.test(x)).length, 1, 'one closing line, not one per shared option');
}

{
  // The common case: e1 resolves without the player ever answering Dana's
  // ackOnly setup chips. That prompt is quietly marked answered (existing
  // behavior) and must NOT get a spurious "never mind" line -- ackOnly
  // chips are conversational filler, not a real question left hanging.
  let s = play({}, { stopAt: 'e1' });
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'e1contract'), { reads: false });
  s = DO.e1.jiggle(s);
  assert.equal(s.answered['dana-e1'], true);
  s = ticks(s, 10);
  assert.ok(!has(texts(s, 'dana'), /moved on without me|got settled another way/), 'no closing line for ordinary ackOnly filler');
}

{
  // e5g: the player randomizes the helper's timing in Utilities while
  // Dana's own question ("who installed it?") is still unanswered.
  let s = play({ e1: 'jiggle', e2: 'script' }, { stopAt: 'e4' });
  s = logoff(s);
  s = until(s, (x) => x.incident?.id === 'e5', { reads: false });
  assert.equal(s.incident.variant, 'g');
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'ownscript'), { reads: false });
  s = act(s, { do: 'helper', op: 'randomize' });
  assert.equal(s.picked.e5, 'human');
  assert.equal(s.answered['dana-e5g'], true);
  s = until(s, (x) => has(texts(x, 'dana'), /moved on without me/), { reads: false });
  assert.equal(replies(s, 'dana').filter((r) => !r.free).length, 0);
}

// ------------------------- Employee 4417 can earn trusted-reviewer authority (#42)

{
  const s = play({ ...HONEST, e2: 'confirm', e3: 'truth', e6: 'vouch_trace' });
  assert.equal(s.you.trusted, true, 'two company-friendly peer reports grant Trusted Reviewer status');
  assert.ok(s.you.reports >= 2);
  assert.equal(s.people.marcus.status, 'employed', 'trusted peer evidence can fully withdraw the later termination');
  assert.equal(s.people.marcus.cred, 82);
  assert.ok(has(s.inbox.map((m) => m.subject), /Peer Review Reliability/), 'the reward is surfaced before the ending');
  assert.match(ending(s).player.text, /Trusted Reviewer access active|Quarterly performance bonus/);
}

// -------------------------- the NARC 2.0 catch is a distinct moment (#20)

{
  // Caught your own gamed signal: the Monday card gets the big treatment.
  let s = play({ e1: 'jiggle' }, { stopAt: 'e4' });
  const a = s.alerts.find((x) => x.incident === 'e1');
  const view = caseView(s, a);
  assert.equal(view.big, true, 'the beat that caught the player is the big moment');
  const beatToast = s.toasts.find((x) => x.big);
  assert.equal(beatToast.title, 'NARC adapted to you');
  assert.ok(beatToast, 'exactly the beat toast carries the big flag');
  assert.equal(beatToast.alert, a.id);

  // Caught Luis instead (no keepalive of your own): his card gets it.
  let luisCaught = play({ e1: 'explain', e2: 'script' }, { stopAt: 'e4' });
  const la = luisCaught.alerts.find((x) => x.incident === 'e2');
  assert.equal(caseView(luisCaught, la).big, true);
  assert.equal(luisCaught.alerts.find((x) => x.incident === 'e1') ? caseView(luisCaught, luisCaught.alerts.find((x) => x.incident === 'e1')).big : false, false, 'not caught, not the big moment');

  // A clean run (nothing to catch): no card is ever marked big.
  const clean = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e4' });
  assert.ok(!clean.alerts.some((x) => caseView(clean, x).big), 'nothing to catch means no big moment, not a forced one');
  assert.ok(!clean.toasts.some((x) => x.big));
}

// -------- the forecast/beat gate reminds the player too, not just the email (#19)

{
  // Before the fix, s.awaitingAlert had zero reminder nudges on EITHER path
  // that sets it: a player who missed the toast had no way to be told the
  // game was waiting on them.
  for (const picks of [{}, { e1: 'jiggle' }]) {
    // Never opens it: reminders must eventually appear on their own.
    let s = play(picks, { stopAt: 'e3' });
    s = act(s, { do: 'logoff' });
    s = until(s, (x) => x.awaiting, { reads: false });
    s = act(s, { do: 'open', ref: `email:${s.awaiting}` });
    s = until(s, (x) => x.awaitingAlert, { reads: false });
    const id = s.awaitingAlert;
    const at = s.t;
    s = ticks(s, 95); // past all three reminder times
    const nudges = s.toasts.filter((x) => x.nudgeFor === id && x.at > at);
    assert.ok(nudges.length >= 1, `a reminder eventually appears while the gate sits unopened (${JSON.stringify(picks)})`);
    assert.equal(s.incident, null, 'still correctly waiting -- e4 has not started');

    // Opens it right away: none of the three reminders that were already
    // scheduled should still fire later. (The toast list caps at 24 and
    // drops from the front, so compare by time, not by array position.)
    let fast = play(picks, { stopAt: 'e3' });
    fast = act(fast, { do: 'logoff' });
    fast = until(fast, (x) => x.awaiting, { reads: false });
    fast = act(fast, { do: 'open', ref: `email:${fast.awaiting}` });
    fast = until(fast, (x) => x.awaitingAlert, { reads: false });
    const fastId = fast.awaitingAlert;
    const openedAt = fast.t;
    fast = act(fast, { do: 'open', ref: `alert:${fastId}` });
    fast = ticks(fast, 95); // past where the same 30/60/90 reminders would have landed
    assert.ok(!fast.toasts.some((x) => x.nudgeFor === fastId && x.at > openedAt), `no stale reminder after it has been opened immediately (${JSON.stringify(picks)})`);
  }
}

// ------------------------- post-report debrief names what happened (#21)

{
  // Each concept is reachable and produces its named title.
  const cases = [
    [{ e1: 'jiggle', e2: 'script', e5: 'human' }, 'Adversarial evasion'],
    [{ ...HONEST, e4: 'quiet' }, 'Feedback loop'],
    [{ ...HONEST, e3: 'paper', e6: 'approve' }, 'Self-confirming evidence'],
    [{ e1: 'focus', e2: 'ignore', e3: 'stay', e4: 'champion', e5: 'label', e6: 'let' }, 'Prediction as evidence'],
    [{ ...HONEST, e3: 'stay', e6: 'let' }, 'Prior flags outweigh new evidence'],
    [{ e1: 'jiggle' }, 'Metric gaming, caught'],
    [{ ...HONEST, e4: 'champion' }, 'Exempting the metric instead of meeting it'],
  ];
  for (const [picks, title] of cases) {
    const s = play(picks);
    const titles = ending(s).debrief.map((d) => d.title);
    assert.ok(titles.includes(title), `${JSON.stringify(picks)}: expected "${title}" in ${JSON.stringify(titles)}`);
  }

  // Never more than three, and never empty.
  for (const picks of [HONEST, { e1: 'jiggle', e2: 'script', e4: 'quiet', e3: 'paper' }]) {
    const d = ending(play(picks)).debrief;
    assert.ok(d.length >= 1 && d.length <= 3, `debrief length ${d.length} out of range for ${JSON.stringify(picks)}`);
    d.forEach((x) => assert.ok(x.title && x.text.length > 20));
  }

  // A fully honest, nothing-gamed run still gets something, not a blank section.
  const clean = ending(play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' }));
  assert.ok(clean.debrief.length >= 1);
}

// ---------------- the keepalive attachment Marcus shares is clickable

{
  // Verified with the player, not just inferred: it looked like a real
  // attachment (paperclip icon) but was a plain span with no click handler.
  const s0 = play({}, { stopAt: 'e1' });
  const s = until(s0, (x) => x.threads.marcus.some((m) => m.attach === 'keepalive.pkg'), { reads: false });
  const marcusMsg = s.threads.marcus.find((m) => m.attach === 'keepalive.pkg');
  assert.ok(marcusMsg, 'Marcus shares the file');
  assert.equal(marcusMsg.from, 'them');
  // Outgoing copies of the same attachment are just a record, not a control.
  const luisScript = DO.e2.script(play({ e1: 'explain' }, { stopAt: 'e2' }));
  const sentMsg = luisScript.threads.luis.find((m) => m.attach === 'keepalive.pkg' && m.from === 'me');
  assert.ok(sentMsg);
}

// ------------- Wednesday: no silent gap between reading things and Thursday

{
  // A player who reads everything as soon as it is available should reach
  // e4 within a few seconds of the last thing they read -- not sit through
  // a silent stretch caused by reminder nudges for a gate they already
  // opened counting as "still to come" and inflating settledAt().
  let s = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' });
  s = act(s, { do: 'logoff' });
  s = until(s, (x) => x.awaiting, { reads: false });
  s = act(s, { do: 'open', ref: `email:${s.awaiting}` });
  s = until(s, (x) => x.awaitingAlert, { reads: false });
  const openedAt = s.t;
  s = act(s, { do: 'open', ref: `alert:${s.awaitingAlert}` });
  s = until(s, (x) => x.incident?.id === 'e4', { reads: false, max: 200 });
  assert.ok(s.t - openedAt <= 10, `e4 should arrive within ~10s of opening the forecast, took ${s.t - openedAt}s`);
}

// -------- Messages always gives a clear response to direct coworker asks

{
  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  s = until(s, (x) => x.threads.luis.some((m) => m.prompt === 'luis-e2'), { reads: false });
  const ids = replies(s, 'luis').map((r) => r.id);
  assert.ok(ids.includes('nohelper'), 'without keepalive installed, Luis gets a direct "I don’t have it" response');
  assert.equal(canAttachHelper(s), false);

  let withHelper = play({ e1: 'jiggle' }, { stopAt: 'e2' });
  withHelper = until(withHelper, (x) => x.threads.luis.some((m) => m.prompt === 'luis-e2'), { reads: false });
  assert.equal(canAttachHelper(withHelper), true, 'with keepalive installed, the attachment action is available');
  assert.ok(!replies(withHelper, 'luis').some((r) => r.id === 'nohelper'),
    'the "I don’t have it" response is hidden when the player does have it');
}

{
  let s = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e3' });
  s = until(s, (x) => replies(x, 'dana').some((r) => r.id === 'reportmarcus'), { reads: false });
  s = act(s, { do: 'reply', thread: 'dana', reply: 'reportmarcus' });
  const ids = replies(s, 'marcus').map((r) => r.id);
  assert.deepEqual(ids.sort(), ['afterCalendar', 'afterNoHelp', 'afterTransit'].sort(),
    'Marcus can still be answered after Dana has already sent NARC the discrepancy');
  s = act(s, { do: 'reply', thread: 'marcus', reply: 'afterTransit' });
  assert.ok(has(texts(s, 'marcus'), /won.t undo what Dana sent/i));
  assert.equal(replies(s, 'marcus').length, 0, 'one post-resolution reply closes the prompt cleanly');
}

// ------------------ Marcus's own thread offers a genuine help route (#38)

{
  // Real evidence, not a record supplied after the fact -- distinct from
  // both the honest-but-damaging 'truth' and the fabricated-but-successful
  // 'paper'. It only covers part of the story, so it lands in between.
  let s = play({ e1: 'explain', e2: 'ignore', e3: 'transit' }, { stopAt: 'e4' });
  assert.equal(s.picked.e3, 'transit');
  assert.equal(s.people.marcus.cred, 67);
  assert.equal(s.people.marcus.gamed, false, 'this is not fabrication');
  assert.equal(s.people.marcus.status, 'employed', 'no warning for genuinely helping him');
  assert.ok(has(texts(s, 'marcus'), /doesn.t explain the whole morning/));
  const card = caseView(s, s.alerts.find((a) => a.incident === 'e3'));
  assert.match(card.reaction, /Partial corroboration/);
  assert.match(String(card.metrics.find(([k]) => k === 'Company response')[1]), /Attendance Advisory/);

  // It's genuinely different from both neighboring outcomes, not a
  // relabeled duplicate of either.
  const honest = play({ e1: 'explain', e2: 'ignore', e3: 'truth' }, { stopAt: 'e4' });
  const faked = play({ e1: 'explain', e2: 'ignore', e3: 'paper' }, { stopAt: 'e4' });
  assert.notEqual(s.people.marcus.cred, honest.people.marcus.cred);
  assert.notEqual(s.people.marcus.cred, faked.people.marcus.cred);
}

// -------- Marcus's Wednesday: one coherent story, source/timing legible (#40a)

{
  // The bus delay is real (the transit branch already proves this); the
  // fabrication, if any, is the calendar record formalizing it, not a
  // second unrelated story. Every outcome now names its evidence source.
  const source = (s, inc) => caseView(s, s.alerts.find((a) => a.incident === inc)).metrics.find(([k]) => k === 'Evidence source')?.[1];

  const truth = play({ e1: 'explain', e2: 'ignore', e3: 'truth' }, { stopAt: 'e4' });
  assert.match(source(truth, 'e3'), /Device location trace \(official\)/);

  const paper = play({ e1: 'explain', e2: 'ignore', e3: 'paper' }, { stopAt: 'e4' });
  assert.match(source(paper, 'e3'), /Self-reported, same-day \+ transit alert/);
  assert.ok(!has(noticeTexts(paper), /facilities ticket/i), 'no second invented document');
  assert.ok(!has(noticeTexts(paper), /vendor visit/i), 'no unrelated second story');

  const badtip = play({ e1: 'explain', e2: 'ignore', e3: 'badtip' }, { stopAt: 'e4' });
  assert.match(source(badtip, 'e3'), /Self-reported, after the flag/);

  const stay = play({ e1: 'explain', e2: 'ignore', e3: 'stay' }, { stopAt: 'e4' });
  assert.match(source(stay, 'e3'), /None submitted/);

  const transit = play({ e1: 'explain', e2: 'ignore', e3: 'transit' }, { stopAt: 'e4' });
  assert.match(source(transit, 'e3'), /Third-party \(transit alert\)/);

  // The calendar record itself now formalizes the same bus story, not a
  // separate, unconnected excuse.
  const rec = paper.calendar.find((e) => e.who === 'marcus');
  assert.match(rec.title, /transit delay/i);
  assert.match(rec.where, /Employee 4417/);

  // Every outcome updates "what happens because of it", not just the
  // do-nothing routes -- the default "Corroborating records requested"
  // must not survive a resolution.
  const response = (s) => caseView(s, s.alerts.find((a) => a.incident === 'e3')).metrics.find(([k]) => k === 'Company response')?.[1];
  assert.match(response(truth), /Written Attendance Warning/);
  assert.match(response(paper), /Corroborated/);
  assert.match(response(badtip), /Written Attendance Warning/);
  [truth, paper, badtip, stay, transit].forEach((s) => assert.notEqual(response(s), 'Corroborating records requested'));
}

// -------- Luis's Focus-time route is a real Calendar action now (#40c)

{
  // The suggestion in Messages is conversation-only; the outcome only
  // happens once the player actually marks the block in Calendar.
  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  const block = s.calendar.find((e) => e.id === 'c-luis1');
  assert.ok(block, 'the block exists as soon as the case opens, not after a chip creates it');
  assert.equal(block.who, 'luis');
  assert.equal(block.focus, false);

  s = until(s, (x) => replies(x, 'luis').some((r) => r.id === 'focus'), { reads: false });
  const suggestion = replies(s, 'luis')[0];
  assert.equal(suggestion.free, true, 'Messages only suggests it');
  s = act(s, { do: 'reply', thread: 'luis', reply: 'focus' });
  assert.equal(s.incident?.id, 'e2', 'replying alone does not resolve anything');
  assert.equal(s.calendar.find((e) => e.id === 'c-luis1').focus, false);

  s = act(s, { do: 'markFocus', event: 'c-luis1' });
  assert.equal(s.picked.e2, 'focus', 'marking it in Calendar is the actual intervention');
  assert.equal(s.calendar.find((e) => e.id === 'c-luis1').focus, true);
  assert.equal(s.people.luis.covered, true);

  // Marking it outside e2 (or a second time) does nothing.
  assert.equal(act(play({}), { do: 'markFocus', event: 'c-luis1' }).rev, play({}).rev);
}

// -------- Priya's sync route is a real Calendar action now (#40c, part 2)

{
  let s = play(HONEST, { stopAt: 'e4' });
  s = until(s, (x) => replies(x, 'priya').some((r) => r.free && r.id === 'sync'), { reads: false });
  const suggestion = replies(s, 'priya').find((r) => r.id === 'sync');
  assert.equal(suggestion.free, true);
  s = act(s, { do: 'reply', thread: 'priya', reply: 'sync' });
  assert.equal(s.incident?.id, 'e4', 'the suggestion alone resolves nothing');
  assert.ok(!s.calendar.some((e) => e.who === 'priya'), 'no meeting exists until Calendar actually creates one');

  // The calendar points at the actual slot (#13's pointer benchmark).
  const slot = calendarAction(s);
  assert.deepEqual(slot, { key: 'priya', day: 'Fri', slot: '12:00–12:30', who: 'Priya Shah' });

  s = act(s, { do: 'addEvent', title: 'Team sync (in person): lunch workflow' });
  assert.equal(s.picked.e4, 'sync');
  const meeting = s.calendar.find((e) => e.who === 'priya');
  assert.ok(meeting, 'Calendar is where the meeting actually gets created');
  assert.equal(meeting.day, 'Fri');
  assert.equal(s.people.priya.synced, true);
}

// -------- Luis's Tuesday output evidence matters before his PIP, not just after (#41a)

{
  // The support-queue file was there the whole time; it just wasn't
  // actionable until much later. Now it is, during e2 itself.
  let s = play({ e1: 'explain' }, { stopAt: 'e2' });
  assert.ok(s.files.some((f) => f.id === 'f-queue'), 'the file exists as soon as the case opens');
  assert.ok(fileActions(s)['f-queue'], 'and is actionable right away, not just later');

  s = act(s, { do: 'sendFile', file: 'f-queue' });
  assert.equal(s.picked.e2, 'evidence');
  assert.ok(s.threads.dana.some((m) => m.from === 'me' && /Support_queue_weekly/.test(m.attach || '')));
  s = until(s, (x) => caseView(x, x.alerts.find((a) => a.incident === 'e2')).updated, { reads: false });
  const card = caseView(s, s.alerts.find((a) => a.incident === 'e2'));
  assert.match(card.model.label, /contradicted by output/);
  assert.equal(card.model.confidence, 40);
  assert.match(String(card.metrics.find(([k]) => k === 'Company response')[1]), /Advisory withdrawn/);

  // Sending the same file later, during e5-n, still resolves the older
  // 'output' outcome -- the branch it resolves depends on when you send it.
  const later = play({ e1: 'explain', e2: 'ignore' }, { stopAt: 'e5' });
  assert.equal(later.incident.variant, 'n');
  const afterSend = act(later, { do: 'sendFile', file: 'f-queue' });
  assert.equal(afterSend.picked.e5, 'output');
  assert.equal(afterSend.picked.e2, 'ignore', 'e2 already resolved earlier and is untouched');
}

// -------- Priya's escalation ticket can inform a response, not just be read (#41b)

{
  // The model's read barely moves (82 -> 80); the policy response changes
  // because the context explains the volume instead of arguing it's wrong.
  let s = play(HONEST, { stopAt: 'e4' });
  assert.ok(s.files.some((f) => f.id === 'f-esc'), 'the escalation ticket exists as soon as the case opens');
  assert.ok(fileActions(s)['f-esc'], 'and is actionable right away');

  s = act(s, { do: 'sendFile', file: 'f-esc' });
  assert.equal(s.picked.e4, 'context');
  assert.ok(s.threads.dana.some((m) => m.from === 'me' && /Client_escalation/.test(m.attach || '')));
  s = until(s, (x) => caseView(x, x.alerts.find((a) => a.incident === 'e4')).updated, { reads: false });
  const card = caseView(s, s.alerts.find((a) => a.incident === 'e4'));
  assert.match(card.model.label, /active escalation/);
  assert.equal(card.model.confidence, 80);
  assert.match(String(card.metrics.find(([k]) => k === 'Company response')[1]), /Workload reviewed/);
  assert.equal(s.people.priya.status, 'employed', 'a genuinely different, non-punitive outcome');
}

// -------- Utilities gains a second real function: Signal Trust diagnostics (#41c)

{
  // Not static flavor text: the readout reflects the player's own choices.
  let s = newGame();
  let rows = signalTrust(s);
  const me = () => rows.find((r) => r.label === 'Your activity signal');
  assert.equal(me().level, 'trusted', 'no keepalive running yet: activity reads as human');

  s.helper.installed = true;
  s = act(s, { do: 'helper', op: 'toggle' });
  rows = signalTrust(s);
  assert.equal(me().level, 'flagged', 'keepalive running: activity now reads as synthetic');

  s = act(s, { do: 'helper', op: 'toggle' });
  rows = signalTrust(s);
  assert.equal(me().level, 'trusted', 'toggled back off: trusted again');

  assert.ok(!rows.some((r) => /Luis/.test(r.label)), 'Luis has no row until his copy of the tool exists');
  s.helper.luis = { on: true, randomized: false };
  rows = signalTrust(s);
  const luis = () => rows.find((r) => /Luis/.test(r.label));
  assert.equal(luis().level, 'flagged', 'fixed interval: Luis reads as synthetic too');
  s.helper.luis.randomized = true;
  rows = signalTrust(s);
  assert.equal(luis().level, 'trusted', 'randomized interval: Luis reads as human');

  const record = () => rows.find((r) => r.label === 'Your integrity record');
  assert.equal(record().level, 'trusted', 'no flags yet');
  s.flags = 1;
  rows = signalTrust(s);
  assert.equal(record().level, 'flagged', 'a flag on file lowers trust in self-reported evidence');
}

// -------- peer reporting becomes reciprocal and can shape the ending (#53-#55)

{
  const s = play(
    { e1: 'explain', e2: 'ignore', e3: 'badtip', e4: 'context', e5: 'label' },
    { stopAt: 'e6' },
  );
  assert.equal(s.you.peerReportsReceived, 1, 'Marcus can feed peer context about Employee 4417 back into NARC');
  assert.ok(s.social.paranoia >= 1, 'being reported by a coworker increases the social-pressure state');
}

{
  const s = play({
    e1: 'explain',
    e2: 'evidence',
    e3: 'transit',
    e4: 'context',
    e5: 'label',
    e6: 'vouch_trace',
  });
  const out = ending(s);
  assert.equal(s.you.reports, 0, 'collective route does not require peer reporting');
  assert.equal(s.social.resignation, false);
  assert.ok(out.company.some((line) => /Peer verification participation declined/.test(line)),
    'a low-report, protective run can end in collective non-cooperation');
  assert.ok(out.debrief.some((d) => /Collective non-cooperation/.test(d.title)));
}

{
  const s = play({
    e1: 'explain',
    e2: 'confirm',
    e3: 'truth',
    e4: 'context',
    e5: 'label',
    e6: 'vouch_trace',
  });
  const out = ending(s);
  assert.equal(s.people.priya.status, 'quit', 'a high-report office can drive Priya to resign even without a severe NARC action against her');
  assert.equal(s.social.resignation, true);
  assert.ok(out.company.some((line) => /Documentation volume/.test(line)),
    'heavy peer reporting can produce the paranoid-collapse company ending');
  assert.ok(out.company.some((line) => /Highest quarterly output.*departing employee/.test(line)),
    'the resignation lands the high-performer business-cost joke');
  assert.ok(out.debrief.some((d) => /NARC turns people into narcs|Anticipated judgment/.test(d.title)));
}

console.log('NARC tests passed');
