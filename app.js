// The desktop. This file only draws the engine's state and turns clicks into
// actions; every rule lives in game.js.

import {
  newGame, tick, act, unread, attention, ownCase, narcSections, logoffInfo, clockText, caseView,
  replies, canAttachHelper, calendarAction, fileActions, ending, THREADS, PEOPLE,
} from './game.js';

const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  messages: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  files: svg('<path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  utilities: svg('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
  narc: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/>'),
};

const APPS = [
  { id: 'messages', label: 'Messages' },
  { id: 'email', label: 'Email' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'files', label: 'Files' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'narc', label: 'NARC' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

let state;
let ui;
let logoffOpen = false;
const shownToasts = new Set();

function freshUi() {
  return {
    app: 'email',
    detail: true, // the welcome email is already open
    sel: { email: null, messages: null, files: null, narc: null },
    day: 'Mon',
    dayTouched: false,
    team: false,
    draft: { note: '', title: '', attribute: '', nominee: '' },
  };
}

// A fresh week: the People Operations email is already open in front of you.
function begin() {
  state = newGame();
  ui = freshUi();
  ui.sel.email = state.inbox[0].id;
  state = act(state, { do: 'open', ref: `email:${ui.sel.email}` });
  state = act(state, { do: 'view', app: 'email' });
  logoffOpen = false;
  shownToasts.clear();
}
begin();

// ----------------------------------------------------------------- helpers

const h = (tag, cls, ...kids) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  kids.flat().forEach((k) => {
    if (k === null || k === undefined || k === false) return;
    n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  });
  return n;
};
const btn = (label, cls, fn, attrs = {}) => {
  const b = h('button', cls, label);
  b.type = 'button';
  Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
  b.addEventListener('click', fn);
  return b;
};

function dispatch(action) {
  state = act(state, action);
  render();
}

function openRef(ref) {
  const [kind, id] = ref.split(':');
  if (kind === 'email') { ui.app = 'email'; ui.sel.email = id; ui.detail = true; }
  if (kind === 'thread') { ui.app = 'messages'; ui.sel.messages = id; ui.detail = true; }
  if (kind === 'alert') { ui.app = 'narc'; ui.sel.narc = id; ui.detail = true; }
  state = act(state, { do: 'view', app: ui.app });
  dispatch({ do: 'open', ref });
}

function goApp(id) {
  ui.app = id;
  ui.detail = false;
  if (!ui.dayTouched) ui.day = state.clock.day;
  dispatch({ do: 'view', app: id });
}

// -------------------------------------------------------------- skeleton

const root = document.getElementById('desk');
root.innerHTML = `
  <header class="menubar">
    <div class="left"><span class="company">MERIDIAN<span class="co-rest"> SUPPLY CO.</span></span><span class="who">Employee 4417 · Operations Associate</span></div>
    <div class="right">
      <span class="clock" id="clock"></span>
      <button class="logoff" id="logoff" type="button">Log off</button>
      <button class="tray" id="tray" type="button"><span class="dot"></span><span id="trayText"><span class="full"></span><span class="short"></span></span></button>
    </div>
  </header>
  <div class="stage">
    <nav class="dock" id="dock" aria-label="Apps"></nav>
    <main class="workarea"><section class="window" id="win"></section></main>
  </div>
  <div class="toasts" id="toasts" aria-live="polite"></div>
  <div id="modal"></div>
  <div id="overlay"></div>`;
const els = {
  clock: root.querySelector('#clock'),
  tray: root.querySelector('#tray'),
  trayText: root.querySelector('#trayText'),
  logoff: root.querySelector('#logoff'),
  dock: root.querySelector('#dock'),
  win: root.querySelector('#win'),
  toasts: root.querySelector('#toasts'),
  modal: root.querySelector('#modal'),
  overlay: root.querySelector('#overlay'),
};
els.tray.addEventListener('click', () => goApp('narc'));
els.logoff.addEventListener('click', () => { logoffOpen = true; render(); });

// -------------------------------------------------------------- menu & dock

function trayLabel() {
  if (attention(state)) {
    return ownCase(state) ? ['NARC · ACTION REQUIRED', 'NARC · ACTION'] : ['NARC · TEAM ALERT', 'NARC · TEAM'];
  }
  return state.level >= 2 ? ['NARC · ENHANCED', 'NARC · 2.0'] : ['NARC ACTIVE', 'NARC ACTIVE'];
}

// Progressive disclosure: the workstation only reveals apps once the workday
// has given the player a reason to understand them. Email is the starting
// surface. Messages + Calendar arrive with Dana's orientation. NARC appears
// with the first NARC case. Files/Utilities appear when evidence or a tool is
// actually introduced. Keep the current app visible so notification deep-links
// never strand the player.
function visibleApps() {
  const ids = new Set(['email', ui.app]);
  if (state.threads.dana.length || state.seen.messages) {
    ids.add('messages');
    ids.add('calendar');
  }
  if (state.alerts.length || state.seen.narc || state.level >= 2) ids.add('narc');
  if (state.marks.files || state.seen.files || state.files.some((f) => f.id.startsWith('f-') && !['f1', 'f2'].includes(f.id))) ids.add('files');
  if (state.marks.utilities || state.seen.utilities || state.helper.installed) ids.add('utilities');
  return ids;
}

function renderChrome() {
  els.clock.textContent = clockText(state);
  const u = unread(state);
  const need = attention(state) > 0 && ownCase(state);
  const team = attention(state) > 0 && !ownCase(state);
  const [fullLabel, shortLabel] = trayLabel();
  els.trayText.querySelector('.full').textContent = fullLabel;
  els.trayText.querySelector('.short').textContent = shortLabel;
  els.tray.classList.toggle('enhanced', state.level >= 2);
  els.tray.classList.toggle('action', need);
  els.tray.classList.toggle('teamalert', team);
  els.tray.setAttribute('aria-label', need ? 'NARC has a case that needs your attention. Open NARC.' : team ? 'NARC is showing a team alert. Open NARC.' : `${fullLabel}. Open NARC.`);

  const info = logoffInfo(state);
  els.logoff.disabled = !info;
  els.logoff.title = info ? 'Log off for the day. NARC will process whatever is still open.' : 'Nothing is waiting on you.';

  const visible = visibleApps();
  els.dock.replaceChildren(...APPS.filter((a) => visible.has(a.id)).map((a) => {
    const count = u[a.id] || 0;
    const b = h('button', a.id === 'narc' ? 'narc' : '', h('span'), a.label);
    b.firstChild.innerHTML = ICON[a.id];
    b.type = 'button';
    b.setAttribute('aria-current', String(ui.app === a.id));
    if (count) b.append(h('span', a.id === 'narc' ? `badge ${ownCase(state) ? 'action' : 'team'}` : 'badge', count));
    else if (state.marks[a.id]) b.append(h('span', 'mark', ''));
    b.setAttribute('aria-label', count ? `${a.label}, ${count} ${a.id === 'narc' ? (ownCase(state) ? 'needs attention' : 'team alert') : 'unread'}` : state.marks[a.id] ? `${a.label}, something new` : a.label);
    b.addEventListener('click', () => goApp(a.id));
    return b;
  }));
}

// ----------------------------------------------------------------- windows

function windowShell(title, ...body) {
  const bar = h('div', 'titlebar', h('span', 'lights', h('i'), h('i'), h('i')));
  const back = btn('‹ Back', 'back', () => { ui.detail = false; render(); });
  bar.append(back, title);
  return [bar, ...body];
}

function renderWindow() {
  const scrolls = {};
  els.win.querySelectorAll('[data-scroll]').forEach((n) => { scrolls[n.dataset.scroll] = [n.scrollTop, n.scrollTop + n.clientHeight >= n.scrollHeight - 40]; });

  const views = {
    email: renderEmail, messages: renderMessages, calendar: renderCalendar,
    files: renderFiles, utilities: renderUtilities, narc: renderNarc,
  };
  const nodes = views[ui.app]();
  els.win.className = `window${ui.app === 'narc' ? ' narc' : ''}${ui.detail ? ' show-detail' : ''}`;
  els.win.replaceChildren(...nodes);

  els.win.querySelectorAll('[data-scroll]').forEach((n) => {
    const prev = scrolls[n.dataset.scroll];
    if (n.dataset.stick && (!prev || prev[1])) n.scrollTop = n.scrollHeight;
    else if (prev) n.scrollTop = prev[0];
  });
}

// ------------------------------------------------------------------- email

function renderEmail() {
  const list = h('div', 'list');
  if (!state.inbox.length) list.append(h('div', 'empty', 'Inbox zero.'));
  state.inbox.forEach((m) => {
    const row = h('button', `row${m.unread ? ' unread' : ''}`, h('div', 'top', h('span', 'name', m.from), m.unread ? h('span', 'pill', '●') : null), h('div', 'sub sub-b', m.subject));
    row.type = 'button';
    row.setAttribute('aria-current', String(ui.sel.email === m.id));
    row.addEventListener('click', () => openRef(`email:${m.id}`));
    list.append(row);
  });

  const detail = h('div', 'detail mail');
  const m = state.inbox.find((x) => x.id === ui.sel.email);
  if (!m) {
    detail.append(h('div', 'empty', 'Select a message.'));
  } else {
    detail.append(h('h2', null, m.subject), h('div', 'from', `From: ${m.from}`));
    m.body.forEach((p) => detail.append(h('p', null, p)));
    if (m.form === 'ack') detail.append(ackForm());
    if (m.form === 'nominate') detail.append(nominateForm());
  }
  return windowShell('Email', h('div', 'body', list, detail));
}

function ackForm() {
  const box = h('div', 'form');
  if (state.orient.ack) {
    box.append(h('div', 'acked', 'Acknowledged. Thank you for your participation.'));
  } else {
    box.append(btn('Acknowledge receipt', 'btn primary', () => dispatch({ do: 'ack' })));
  }
  return box;
}

function nominateForm() {
  const box = h('div', 'form');
  const open = state.incident?.id === 'e4';
  if (!open) {
    box.append(h('div', null, state.picked.e4 ? 'Nominations are now closed.' : 'Nominations open Thursday at 09:00.'));
    return box;
  }
  Object.entries(PEOPLE).forEach(([id, p]) => {
    const input = h('input');
    input.type = 'radio';
    input.name = 'nominee';
    input.value = id;
    input.checked = ui.draft.nominee === id;
    input.addEventListener('change', () => { ui.draft.nominee = id; render(); });
    box.append(h('label', null, input, `${p.name} · ${p.role}`));
  });
  const send = btn('Submit nomination', 'btn primary', () => dispatch({ do: 'nominate', who: ui.draft.nominee }));
  send.disabled = !ui.draft.nominee;
  send.style.marginTop = '10px';
  box.append(send);
  return box;
}

// ---------------------------------------------------------------- messages

function renderMessages() {
  const list = h('div', 'list');
  Object.entries(THREADS).forEach(([id, t]) => {
    const msgs = state.threads[id];
    const last = msgs[msgs.length - 1];
    const n = msgs.filter((m) => m.unread).length;
    const off = id !== 'dana' && state.online[id] === false;
    const row = h('button', `row${n ? ' unread' : ''}`,
      h('div', 'top', h('span', 'name', h('span', `dotpres${off ? ' off' : ''}`), t.name), n ? h('span', 'pill', n) : null),
      h('div', 'sub sub-b', last ? (last.from === 'me' ? `You: ${last.text}` : last.text) : t.role));
    row.type = 'button';
    row.setAttribute('aria-current', String(ui.sel.messages === id));
    row.addEventListener('click', () => openRef(`thread:${id}`));
    list.append(row);
  });

  const detail = h('div', 'detail flush');
  const id = ui.sel.messages;
  if (!id) {
    detail.append(h('div', 'empty', 'Select a conversation.'));
  } else {
    const t = THREADS[id];
    const wrap = h('div', 'thread');
    wrap.append(h('header', null, h('b', null, t.name), h('span', null, t.role)));
    const scroll = h('div', 'scroll');
    scroll.dataset.scroll = `thread-${id}`;
    scroll.dataset.stick = '1';
    if (!state.threads[id].length) scroll.append(h('div', 'empty', 'No messages yet.'));
    state.threads[id].forEach((m) => {
      const b = h('div', `bubble ${m.from === 'me' ? 'me' : m.from === 'system' ? 'system' : ''}`, m.text);
      if (m.attach) b.append(h('span', 'attach', m.attach));
      scroll.append(b);
    });
    wrap.append(scroll);

    const compose = h('div', 'compose');
    const chips = h('div', 'chips');
    replies(state, id).forEach((r) => chips.append(btn(r.text, 'chip', () => dispatch({ do: 'reply', thread: id, reply: r.id }))));
    if (id === 'luis' && canAttachHelper(state)) {
      chips.append(btn('Attach: Mouse Activity Helper.pkg', 'chip', () => dispatch({ do: 'attach', thread: 'luis', item: 'helper' })));
    }
    if (chips.childNodes.length) compose.append(chips);
    const input = h('input');
    input.placeholder = state.online[id] === false ? 'This account is no longer active' : 'Message';
    input.disabled = true;
    input.setAttribute('aria-label', 'Message');
    compose.append(input);
    wrap.append(compose);
    detail.append(wrap);
  }
  return windowShell('Messages', h('div', 'body', list, detail));
}

// ---------------------------------------------------------------- calendar

function eventRow(e, team) {
  const body = h('div', null, h('div', null, e.title), h('div', 'where', e.where));
  if (!team && e.who === 'me') {
    const shown = h('span', `showas${e.focus ? ' is-focus' : ''}`, e.focus ? 'Focus time' : 'Busy');
    const toggle = e.focus ? null : btn('Show as Focus time', 'showbtn', () => dispatch({ do: 'markFocus', event: e.id }));
    body.append(h('div', 'showrow', h('span', 'small', 'Show as: '), shown, toggle));
  }
  return h('div', `event${team ? ' team' : ''}${e.focus ? ' focus' : ''}`, h('div', 'time', `${e.start}–${e.end}`), body);
}

function renderCalendar() {
  const pane = h('div', 'pane');
  const head = h('div', 'cal-head');
  const tabs = h('div', 'tabs');
  DAYS.forEach((d) => {
    tabs.append(btn(d, `tab${d === state.clock.day ? ' today' : ''}`, () => { ui.day = d; ui.dayTouched = true; render(); }, { 'aria-pressed': String(ui.day === d) }));
  });
  const slot = calendarAction(state);
  const teamTab = btn('Team calendar', 'tab', () => { ui.team = true; render(); }, { 'aria-pressed': String(ui.team) });
  if (slot && !ui.team) teamTab.append(h('span', 'tabdot', ''));
  const which = h('div', 'tabs',
    btn('My calendar', 'tab', () => { ui.team = false; render(); }, { 'aria-pressed': String(!ui.team) }),
    teamTab);
  head.append(tabs, which);
  pane.append(head);

  const byStart = (a, b) => a.start.localeCompare(b.start);
  if (!ui.team) {
    const mine = state.calendar.filter((e) => e.who === 'me' && e.day === ui.day).sort(byStart);
    if (!mine.length) pane.append(h('div', 'empty', 'Nothing scheduled.'));
    mine.forEach((e) => pane.append(eventRow(e, false)));
  } else {
    ['marcus', 'team'].forEach((who) => {
      const evs = state.calendar.filter((e) => e.who === who && e.day === ui.day).sort(byStart);
      if (who === 'marcus') {
        pane.append(h('div', 'who-h', 'Marcus Reed'));
        evs.forEach((e) => pane.append(eventRow(e, true)));
        if (slot && slot.day === ui.day) pane.append(slotForm(slot));
        else if (!evs.length) pane.append(h('div', 'empty', 'No events.'));
      } else {
        pane.append(h('div', 'who-h', 'Everyone'));
        if (!evs.length) pane.append(h('div', 'empty', 'No events.'));
        evs.forEach((e) => pane.append(eventRow(e, true)));
      }
    });
  }
  return windowShell('Calendar', h('div', 'body', pane));
}

function slotForm(slot) {
  const box = h('div', 'slot');
  box.append(h('div', null, `${slot.day} ${slot.slot} · no events`));
  const input = h('input');
  input.type = 'text';
  input.placeholder = 'Event title';
  input.value = ui.draft.title;
  input.dataset.key = 'title';
  input.setAttribute('aria-label', 'Event title');
  input.addEventListener('input', () => { ui.draft.title = input.value; save.disabled = !input.value.trim(); });
  const save = btn('Save event', 'btn primary', () => { const title = ui.draft.title; ui.draft.title = ''; dispatch({ do: 'addEvent', title }); });
  save.disabled = !ui.draft.title.trim();
  box.append(input, save, h('p', 'note', 'Matching transit alerts and facilities tickets are linked automatically.'));
  return box;
}

// ------------------------------------------------------------------- files

function renderFiles() {
  const list = h('div', 'list');
  state.files.forEach((f) => {
    const row = h('button', 'row', h('div', 'name', f.name), h('div', 'sub', f.meta));
    row.type = 'button';
    row.setAttribute('aria-current', String(ui.sel.files === f.id));
    row.addEventListener('click', () => { ui.sel.files = f.id; ui.detail = true; render(); });
    list.append(row);
  });
  const detail = h('div', 'detail file-body');
  const f = state.files.find((x) => x.id === ui.sel.files);
  if (!f) detail.append(h('div', 'empty', 'Select a file.'));
  else {
    detail.append(h('h2', null, f.name), h('div', 'meta', f.meta));
    f.body.forEach((p) => detail.append(h('p', null, p)));
    const fa = fileActions(state)[f.id];
    if (fa) detail.append(btn(fa.label, 'btn primary', () => dispatch({ do: 'sendFile', file: fa.file })));
  }
  return windowShell('Files', h('div', 'body', list, detail));
}

// --------------------------------------------------------------- utilities

function renderUtilities() {
  const cards = h('div', 'cards');
  const hp = state.helper;

  const helper = h('div', 'card');
  helper.append(h('h3', null, 'Mouse Activity Helper'), h('p', null, 'Keeps workstation active during long tasks.'));
  if (!hp.installed) {
    helper.append(btn('Install', 'btn primary', () => dispatch({ do: 'helper', op: 'install' })));
  } else {
    const sw = h('button', 'switch');
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', String(hp.on));
    sw.setAttribute('aria-label', 'Mouse Activity Helper on or off');
    sw.addEventListener('click', () => dispatch({ do: 'helper', op: 'toggle' }));
    helper.append(h('div', 'line', h('span', null, 'This workstation'), h('span', hp.on ? 'status-on' : '', hp.on ? 'Running' : 'Stopped'), sw));
    if (hp.luis) {
      const r = hp.luis;
      const rowL = h('div', 'line', h('span', null, 'Luis Perez · ', r.randomized ? 'interval: random' : 'interval: fixed (59 s)'));
      if (state.level >= 2 && !r.randomized) rowL.append(btn('Randomize interval', 'btn', () => dispatch({ do: 'helper', op: 'randomize', copy: 'luis' })));
      helper.append(rowL);
    }
  }
  cards.append(helper);

  const feed = h('div', 'card feed');
  feed.append(h('h3', null, 'Transit Alerts'), h('p', null, 'City transit feed, this week.'));
  [
    ['Wed 08:14', 'Route 14 · Animal-related delay, 11 min'],
    ['Tue 07:40', 'Route 3 · Signal fault, 6 min'],
    ['Mon 08:05', 'Route 22 · Service resumed'],
  ].forEach(([when, what]) => feed.append(h('div', 'line', h('span', null, when), h('span', null, what))));
  cards.append(feed);
  return windowShell('Utilities', h('div', 'body', cards));
}

// -------------------------------------------------------------------- NARC

function alertRow(a) {
  const open = a.incident && !a.closed;
  const mine = open && caseView(state, a).own;
  const row = h('button', `row${mine ? ' active' : ''}${open && !mine ? ' teamrow' : ''}${a.closed ? ' closed' : ''}`,
    h('div', 'top', h('span', 'name', a.title), mine ? h('span', 'pill', 'Action') : open ? h('span', 'pill team', 'Team') : null),
    h('div', 'sub', a.text));
  row.type = 'button';
  row.setAttribute('aria-current', String(ui.sel.narc === a.id));
  row.addEventListener('click', () => openRef(`alert:${a.id}`));
  return row;
}

function renderNarc() {
  const top = h('div', 'narc-top', h('span', 'brand', 'NARC'));
  if (state.indexVisible) top.append(h('span', null, 'Visible Activity Index ', h('b', null, state.score)));
  if (state.level >= 2) top.append(h('span', 'flag', 'Integrity flags ', h('b', null, state.flags)));

  const { active, team, history } = narcSections(state);
  const list = h('div', 'list');
  list.append(h('div', 'sect-h need', 'Needs attention'));
  if (!active.length) list.append(h('div', 'none', 'Nothing needs your attention.'));
  active.forEach((a) => list.append(alertRow(a)));
  if (team.length) {
    list.append(h('div', 'sect-h', 'Team alerts'));
    team.forEach((a) => list.append(alertRow(a)));
  }
  list.append(h('div', 'sect-h', 'Recent activity'));
  if (!history.length) list.append(h('div', 'none', 'No activity yet.'));
  history.forEach((a) => list.append(alertRow(a)));
  if (state.level >= 2) {
    const team = h('div', 'team', h('div', 'sect', 'Team status'));
    Object.entries(PEOPLE).forEach(([id, p]) => {
      const s = state.shown[id];
      team.append(h('div', 't-row', h('span', null, p.name), h('span', `s ${s}`, s === 'employed' ? '' : { warning: 'WARNING', monitored: 'MONITORED', promoted: 'CHAMPION', rewarded: 'REWARDED', fired: 'OFFBOARDED' }[s])));
    });
    list.append(team);
  }

  const detail = h('div', 'detail');
  const a = state.alerts.find((x) => x.id === ui.sel.narc);
  if (!a) {
    detail.append(h('div', 'about', 'NARC Workforce Support is active on this workstation. Approved activity signals are analyzed to help you succeed. No action is required.'));
  } else {
    detail.append(caseNode(a));
  }
  return windowShell('NARC · Workforce Support', h('div', 'body', top, h('div', 'narc-main', list, detail)));
}

function caseNode(a) {
  const c = caseView(state, a);
  const box = h('div', 'case');
  box.append(h('h2', null, c.title));
  if (c.notice) {
    box.append(h('p', null, c.text));
    return box;
  }
  box.append(h('div', 'subject', c.subject));
  box.append(h('div', 'model-flow', 'WORKPLACE SIGNALS  →  NARC INFERENCE  →  COMPANY ACTION'));
  box.append(h('div', 'sect observed', 'What NARC observed'), h('ul', null, c.observed.map((o) => h('li', null, o))));
  box.append(h('div', 'sect model', 'What NARC inferred'), h('div', 'model-box', h('div', null, c.model.label), h('div', 'conf', `Model confidence: ${c.model.confidence}%`)));
  if (c.metrics.length) box.append(h('div', 'metrics', c.metrics.map(([k, v]) => h('div', null, `${k}: `, h('b', null, v)))));
  if (c.prompt) box.append(h('div', 'prompt', c.prompt));
  if (c.note) box.append(h('div', 'viewonly', c.note));
  if (c.closed) {
    box.append(h('div', 'closed-line', 'Status: closed.'));
    return box;
  }
  const ctl = h('div', 'ctl');
  c.controls.forEach((k) => {
    if (k.type === 'button') {
      const dismiss = k.id === 'dismiss';
      ctl.append(btn(k.label, `nbtn${dismiss ? ' dismiss' : ''}`, () => dispatch(dismiss ? { do: 'dismiss', alert: a.id } : { do: 'case', id: k.id })));
    } else if (k.type === 'note') {
      const ta = h('textarea');
      ta.placeholder = k.label;
      ta.value = ui.draft.note;
      ta.dataset.key = 'note';
      ta.setAttribute('aria-label', k.label);
      const send = btn(k.button, 'nbtn', () => { const text = ui.draft.note; ui.draft.note = ''; dispatch({ do: 'case', id: k.id, text }); });
      send.disabled = !ui.draft.note.trim();
      ta.addEventListener('input', () => { ui.draft.note = ta.value; send.disabled = !ta.value.trim(); });
      ctl.append(ta, send);
    } else if (k.type === 'choice') {
      const group = h('div', 'radio');
      k.options.forEach((o) => {
        const input = h('input');
        input.type = 'radio';
        input.name = 'attribute';
        input.value = o.v;
        input.checked = ui.draft.attribute === o.v;
        input.addEventListener('change', () => { ui.draft.attribute = o.v; render(); });
        group.append(h('label', null, input, o.label));
      });
      const send = btn(k.button, 'nbtn', () => dispatch({ do: 'case', id: k.id, who: ui.draft.attribute }));
      send.disabled = !ui.draft.attribute;
      ctl.append(group, send);
    }
  });
  box.append(ctl);
  return box;
}

// ------------------------------------------------------------------ toasts

// NARC talks until someone listens. Notifications stay until they are opened
// or closed; closing one only hides it. A few show at a time and the rest wait
// in the app badges and NARC's history.
function renderToasts() {
  const live = state.phase === 'ending' ? [] : state.toasts.filter((t) => !t.gone);
  const max = matchMedia('(max-width: 760px)').matches ? 2 : 3;
  const shown = live.slice(-max);
  const more = live.length - shown.length;
  els.toasts.replaceChildren();
  if (more > 0) {
    els.toasts.append(h('div', 'more',
      h('span', null, `${more} earlier notification${more === 1 ? '' : 's'}`),
      btn('Clear all', 'clear', () => dispatch({ do: 'clear' }))));
  }
  shown.forEach((t) => {
    const label = { narc: 'NARC', messages: 'Messages', email: 'Email' }[t.app];
    const fresh = !shownToasts.has(t.id);
    shownToasts.add(t.id);
    const el = h('div', `toast ${t.app === 'narc' ? 'narc' : ''}${t.app === 'narc' && state.level >= 2 ? ' enhanced' : ''}${fresh ? ' enter' : ''}`);
    const body = h('button', 'open', h('span', 'app', label), h('b', null, t.title), h('span', 'text', t.text),
      t.app === 'narc' ? h('span', 'cta', 'Open in NARC ›') : null);
    body.type = 'button';
    body.addEventListener('click', () => openRef(t.open));
    const x = btn('×', 'x', () => dispatch({ do: 'gone', id: t.id }), { 'aria-label': 'Close notification' });
    el.append(body, x);
    els.toasts.append(el);
  });
}

// ------------------------------------------------------------- log off, ending

function renderModal() {
  els.modal.replaceChildren();
  const info = logoffInfo(state);
  if (!logoffOpen || !info) { logoffOpen = false; return; }
  const box = h('div', 'dialog',
    h('h2', null, 'Log off for the day?'),
    h('p', null, `Still open in NARC: ${info.title}.`),
    h('p', null, `If you log off, ${info.text}`));
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  const actions = h('div', 'ctl');
  const stay = btn('Keep working', 'nbtn', () => { logoffOpen = false; render(); });
  const go = btn('Log off', 'nbtn dismiss', () => { logoffOpen = false; dispatch({ do: 'logoff' }); });
  actions.append(stay, go);
  box.append(actions);
  els.modal.append(h('div', 'overlay', box));
  stay.focus({ preventScroll: true });
}

function renderOverlay() {
  els.overlay.replaceChildren();
  if (state.phase !== 'ending') return;
  const e = ending(state);
  const r = h('div', 'report');
  r.append(h('div', 'eyebrow', 'NARC · Weekly report · Friday, 17:00'), h('h1', null, 'End of week review'));

  r.append(h('div', 'sect', 'Your team'));
  e.roster.forEach((p) => r.append(h('div', 'person',
    h('div', 'head', h('div', null, h('h3', null, p.name), h('div', 'small', p.role)), h('div', `status ${p.status}`, p.label)),
    h('p', null, p.text))));

  r.append(h('div', 'sect', 'You'));
  r.append(h('div', 'person', h('div', 'head', h('h3', null, 'Employee 4417'), h('div', 'status', e.you.label)), h('p', null, e.you.text)));

  r.append(h('div', 'sect', 'NARC summary'));
  e.company.forEach((t) => r.append(h('div', 'sig', h('div', 'tag', 'NARC'), h('div', null, t))));

  const { earned, locked } = e.achievements;
  r.append(h('div', 'sect', `Achievements · ${earned.length} of ${earned.length + locked.length}`));
  const ach = h('div', 'ach');
  earned.forEach((a) => ach.append(h('div', 'ach-item earned', h('div', 'name', a.name), h('div', 'desc', a.desc))));
  locked.forEach((a) => ach.append(h('div', 'ach-item locked', h('div', 'name', '???'), h('div', 'desc', a.hint))));
  r.append(ach);

  const again = btn('Log off and start a new week', 'nbtn primary', restart);
  again.style.marginTop = '20px';
  r.append(again);
  const layer = h('div', 'overlay', r);
  els.overlay.append(layer);
  layer.scrollTop = 0;
  again.focus({ preventScroll: true });
}

function restart() {
  begin();
  render();
}

// ------------------------------------------------------------------ render

function captureFocus() {
  const a = document.activeElement;
  if (!a || !a.dataset || !a.dataset.key) return null;
  return { key: a.dataset.key, start: a.selectionStart, end: a.selectionEnd };
}

function restoreFocus(f) {
  if (!f) return;
  const n = els.win.querySelector(`[data-key="${f.key}"]`);
  if (!n) return;
  n.focus();
  try { n.setSelectionRange(f.start, f.end); } catch { /* not a text field */ }
}

function render() {
  const f = captureFocus();
  renderChrome();
  renderWindow();
  renderToasts();
  renderModal();
  renderOverlay();
  restoreFocus(f);
}

// Time passes on its own, one game second per second. `?tick=150` speeds it up for QA.
const TICK_MS = Number(new URLSearchParams(location.search).get('tick')) || 1000;

// Only redraw when something the player can see changed.
setInterval(() => {
  const next = tick(state);
  const changed = next.rev !== state.rev;
  state = next;
  if (changed) {
    render();
    // A message that lands in the conversation you are reading is already read.
    const open = ui.app === 'messages' && ui.sel.messages;
    if (open && state.threads[open].some((m) => m.unread)) dispatch({ do: 'open', ref: `thread:${open}` });
    // Something new in the app you are already looking at is not "new" to you.
    if (state.marks[ui.app]) dispatch({ do: 'view', app: ui.app });
  } else {
    els.clock.textContent = clockText(state);
  }
}, TICK_MS);

render();
