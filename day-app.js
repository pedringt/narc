import { newGame, act, ending, clock, PEOPLE, END, nextEvent } from './day.js';

let state = newGame();
const root = document.getElementById('day');

function h(tag, cls, ...kids) {
  const el = document.createElement(tag.split('.')[0]);
  if (cls) el.className = cls;
  kids.flat().forEach((k) => { if (k != null) el.append(k.nodeType ? k : document.createTextNode(k)); });
  return el;
}

function dispatch(a) {
  state = act(state, a);
  render();
}

function btn(label, cls, onClick, disabled = false) {
  const b = h('button', cls);
  b.textContent = label;
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

function taskCard(id, t) {
  const card = h('div', `card task ${t.status}`);
  card.append(h('h3', null, t.label));
  card.append(h('p', 'muted', t.detail));
  card.append(h('p', 'meta', `Due ${clock(t.deadline)} · ${t.status === 'pending' ? 'open' : t.status}`));
  if (t.status === 'pending') {
    const opts = OPTION_COPY[id];
    const row = h('div', 'row');
    opts.forEach((o) => row.append(btn(o.label, 'btn', () => dispatch({ do: 'task', id, approach: o.key }))));
    card.append(row);
  }
  return card;
}

const OPTION_COPY = {
  vendor: [
    { key: 'quick', label: 'Skim it, approve it (5 min)' },
    { key: 'thorough', label: 'Actually read it (25 min)' },
  ],
  client: [
    { key: 'canned', label: 'Send a quick apology (5 min)' },
    { key: 'investigate', label: 'Dig into what happened (25 min)' },
  ],
  project: [
    { key: 'cut', label: 'Cut scope yourself (10 min)' },
    { key: 'consult', label: 'Loop in Marcus first (20 min)' },
  ],
  rework: [
    { key: 'quiet', label: 'Deal with it yourself (20 min)' },
    { key: 'escalate', label: 'Tell Dana now (8 min)' },
  ],
};

const REQUEST_TITLES = {
  luisTip: 'Luis pinged you',
  marcusFavor: 'Marcus needs a second opinion',
  danaCheckin: 'Dana wants a status check',
  marcusFallout: 'Marcus is upset',
  narcResponse: 'NARC wants a response',
};

function requestCard(id, r) {
  if (r.status !== 'open') return null;
  const copy = {
    luisTip: ['thank', 'ignore'], marcusFavor: ['help', 'decline'], danaCheckin: ['update', 'brief'],
    marcusFallout: ['apologize', 'standby'], narcResponse: ['explain', 'ignore'],
  }[id];
  const labels = {
    thank: 'Say thanks', ignore: 'Say nothing',
    help: 'Give him 15 minutes', decline: "Say you don't have time",
    update: 'Give her the full picture (15 min)', brief: 'Give her the short version (5 min)',
    apologize: 'Walk him through it (15 min)', standby: 'Stand by the call (2 min)',
    explain: 'Explain the pattern (10 min)',
  };
  const card = h('div', 'card request');
  card.append(h('h3', null, REQUEST_TITLES[id]));
  const row = h('div', 'row');
  copy.forEach((k) => row.append(btn(labels[k], 'btn', () => dispatch({ do: 'respond', id, choice: k }))));
  card.append(row);
  return card;
}

function render() {
  root.innerHTML = '';
  const bar = h('div', 'daybar');
  bar.append(
    h('span', 'clockread', clock(state.t)),
    h('span', null, `Visible Activity Index ${state.index}`),
    btn('Log off', 'btn ghost', () => dispatch({ do: 'logoff' })),
  );
  root.append(bar);

  if (state.phase === 'end') {
    const e = ending(state);
    const box = h('div', 'card end');
    box.append(h('h2', null, 'End of day'));
    e.lines.forEach((l) => box.append(h('p', null, l)));
    root.append(box);
    return;
  }

  const main = h('div', 'daygrid');

  const left = h('div', 'col');
  left.append(h('h2', null, 'Today'));
  Object.entries(state.tasks).forEach(([id, t]) => { if (t.status !== 'hidden') left.append(taskCard(id, t)); });

  const mid = h('div', 'col');
  mid.append(h('h2', null, 'People'));
  const reqCards = Object.entries(state.requests).map(([id, r]) => requestCard(id, r)).filter(Boolean);
  if (reqCards.length) reqCards.forEach((c) => mid.append(c));
  else mid.append(h('p', 'muted', 'Nothing waiting on you right now.'));

  const nothingOpen = Object.values(state.tasks).every((t) => t.status !== 'pending')
    && Object.values(state.requests).every((r) => r.status !== 'open');
  if (nothingOpen && state.phase === 'day') {
    const next = nextEvent(state);
    const wait = h('div', 'card');
    wait.append(h('h3', null, 'Nothing urgent right now'));
    wait.append(btn(`Work until ${clock(next.t)} (${next.label})`, 'btn ghost dark', () => dispatch({ do: 'workUntil' })));
    left.append(wait);
  }

  const focusCard = h('div', 'card');
  focusCard.append(h('h3', null, 'Calendar'));
  focusCard.append(h('p', 'muted', 'Block the next stretch as Focus Time if NARC is reading a quiet patch as a problem.'));
  focusCard.append(btn('Mark next block as Focus Time (5 min)', 'btn', () => dispatch({ do: 'focus' })));
  state.calendar.forEach((c) => focusCard.append(h('p', 'meta', `${clock(c.at)} — ${c.label}`)));
  mid.append(focusCard);

  const right = h('div', 'col');
  right.append(h('h2', null, 'Feed'));
  const feed = h('div', 'feed');
  state.log.slice().reverse().slice(0, 30).forEach((e) => {
    feed.append(h('div', `feedrow ${e.kind}`, h('span', 'feedtime', clock(e.t)), h('span', null, e.text)));
  });
  right.append(feed);

  main.append(left, mid, right);
  root.append(main);
}

render();
