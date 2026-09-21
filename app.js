import { newGame, act, view, NOTES } from './game.js';

const app = document.querySelector('#app');
const stageBadge = document.querySelector('#stageBadge');
const strip = document.querySelector('#strip');
const notesWrap = document.querySelector('#notes');

let state = newGame();
let lastKey = '';

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

function rows(list) {
  const wrap = el('div');
  list.forEach(([tag, text]) => {
    const row = el('div', 'signal');
    row.append(el('div', `tag ${tag.toLowerCase()}`, tag), el('div', null, text));
    wrap.append(row);
  });
  return wrap;
}

function button(control) {
  const b = el('button', control.primary ? 'primary' : '');
  b.type = 'button';
  b.append(document.createTextNode(control.label));
  if (control.note) b.append(el('span', 'btn-note', control.note));
  b.addEventListener('click', () => {
    state = act(state, control.id);
    render();
  });
  return b;
}

function controls(list) {
  const box = el('div', 'actions');
  list.forEach((c) => box.append(button(c)));
  return box;
}

function heading(v) {
  const head = el('div');
  if (v.progress) head.append(el('div', 'eyebrow', `${v.progress.day} · Encounter ${v.progress.n} of ${v.progress.of}`));
  else if (v.eyebrow) head.append(el('div', 'eyebrow', v.eyebrow));
  head.append(el(v.kind === 'intro' || v.kind === 'update' || v.kind === 'ending' ? 'h1' : 'h2', null, v.title));
  if (v.subtitle) head.append(el('div', 'subhead', v.subtitle));
  return head;
}

function list(title, items, cls) {
  const col = el('div', `col ${cls}`);
  col.append(el('h3', null, title));
  const ul = el('ul');
  items.forEach((i) => ul.append(el('li', null, i)));
  col.append(ul);
  return col;
}

function renderEnding(card, v) {
  const e = v.ending;

  card.append(el('div', 'section-title', 'Your team'));
  const roster = el('div', 'roster');
  e.roster.forEach((r) => {
    const p = el('div', 'person');
    const head = el('div', 'head');
    const who = el('div');
    who.append(el('h3', null, r.name), el('div', 'small', r.role));
    head.append(who, el('div', `status ${r.status}`, r.label));
    p.append(head, el('p', null, r.text));
    roster.append(p);
  });
  card.append(roster);

  card.append(el('div', 'section-title', 'You'));
  const you = el('div', 'person');
  const yh = el('div', 'head');
  yh.append(el('h3', null, 'Employee 4417'), el('div', 'status', e.you.label));
  you.append(yh, el('p', null, e.you.text));
  card.append(you);

  card.append(el('div', 'section-title', 'NARC summary'));
  card.append(rows(e.company.map((t) => ['NARC', t])));

  const { earned, locked } = e.achievements;
  card.append(el('div', 'section-title', `Achievements · ${earned.length} of ${earned.length + locked.length}`));
  const ach = el('div', 'ach');
  earned.forEach((a) => {
    const item = el('div', 'ach-item earned');
    item.append(el('div', 'name', a.name), el('div', 'desc', a.desc));
    ach.append(item);
  });
  locked.forEach((a) => {
    const item = el('div', 'ach-item locked');
    item.append(el('div', 'name', '???'), el('div', 'desc', a.hint));
    ach.append(item);
  });
  card.append(ach);

  card.append(el('p', 'small', `You learned ${e.notes.length} of ${e.noteTotal} things about how NARC sees. Try another week.`));
}

function renderNotes() {
  notesWrap.replaceChildren();
  if (state.notes.length === 0) return;
  const d = el('details');
  d.append(el('summary', null, `What you know about NARC (${state.notes.length})`));
  const ul = el('ul');
  state.notes.forEach((n) => ul.append(el('li', null, NOTES[n])));
  d.append(ul);
  notesWrap.append(d);
}

function renderStrip(v) {
  strip.replaceChildren();
  const { index, flags } = v.strip;
  if (index === null) { strip.hidden = true; return; }
  strip.hidden = false;
  const idx = el('span');
  idx.append('Employee 4417 · Visible Activity Index ', el('b', null, String(index)));
  strip.append(idx);
  if (flags !== null) {
    const f = el('span', 'flag');
    f.append('Integrity flags ', el('b', null, String(flags)));
    strip.append(f);
  }
}

function render() {
  const v = view(state);
  const card = el('section', 'card');
  card.tabIndex = -1;
  if (v.kind === 'update') card.classList.add('announce');

  stageBadge.textContent = v.level >= 2 ? 'WORKFORCE INTELLIGENCE' : 'WORKFORCE SUPPORT';
  stageBadge.classList.toggle('escalated', v.level >= 2);

  card.append(heading(v));

  if (v.kind === 'intro' || v.kind === 'update') {
    v.paragraphs.forEach((p) => card.append(el('p', null, p)));
  }
  if (v.kind === 'update') {
    v.capabilities.forEach(([name, blurb]) => {
      const cap = el('div', 'cap');
      cap.append(el('strong', null, name), el('span', null, `“${blurb}”`));
      card.append(cap);
    });
    card.append(el('p', 'small', v.footer));
    card.append(el('div', 'section-title', 'Scan results'));
  }
  if (v.rows) card.append(rows(v.rows));
  if (v.kind === 'inspect') {
    const cols = el('div', 'two-col');
    cols.append(list('NARC sees', v.sees, 'sees'), list('NARC infers', v.infers, 'infers'));
    card.append(cols);
    if (v.evidence) card.append(el('div', 'evidence', v.evidence));
  }
  if (v.kind === 'choose') card.append(el('p', null, v.prompt));
  if (v.kind === 'ending') renderEnding(card, v);

  card.append(controls(v.controls));

  renderStrip(v);
  renderNotes();
  app.replaceChildren(card);

  // New screen: start at the top and move focus so screen readers announce it.
  const key = `${state.phase}:${state.node}`;
  if (key !== lastKey) {
    window.scrollTo(0, 0);
    card.focus({ preventScroll: true });
    lastKey = key;
  }
}

render();
