import { CASES, newGame, currentCase, investigate, intervene, report, next, employeeOutcome, reviewerOutcome, companyOutcome } from './game.js';

const app = document.querySelector('#app');
const stageBadge = document.querySelector('#stageBadge');
let state = newGame();

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

function signal(tag, text) {
  const row = el('div', 'signal');
  const t = el('div', `tag ${tag.toLowerCase()}`, tag);
  const body = el('div', null, text);
  row.append(t, body);
  return row;
}

function btn(label, fn, cls = '', note = '') {
  const b = el('button', cls);
  b.type = 'button';
  b.append(document.createTextNode(label));
  if (note) b.append(el('span', 'btn-note', note));
  b.addEventListener('click', fn);
  return b;
}

function renderIntro() {
  stageBadge.textContent = 'WORKFORCE SUPPORT';
  const c = el('section', 'card');
  c.append(el('div', 'eyebrow', 'Reviewer instance NARC-07'));
  c.append(el('h1', null, 'You are NARC.'));
  c.append(el('p', null, 'Your purpose is to identify employee risk, provide support, and protect organizational performance.'));
  c.append(el('p', 'small', 'You may inspect limited evidence, intervene in employee conditions, and decide what enters the permanent record.'));
  const actions = el('div', 'actions');
  actions.append(btn('Begin review period', () => update(next(state)), 'primary'));
  c.append(actions);
  app.append(c);
}

function renderCase() {
  const cse = currentCase(state);
  const emp = state.employees[cse.employee];
  stageBadge.textContent = state.policyLevel === 1 ? 'WORKFORCE SUPPORT' : 'WORKFORCE INTELLIGENCE';

  const header = el('section', 'card');
  header.append(el('div', 'eyebrow', `Case ${state.caseIndex + 1} of ${CASES.length}`));
  const title = el('div', 'case-title');
  const left = el('div');
  left.append(el('h2', null, cse.title));
  left.append(el('div', 'small', `${emp.name} · ${emp.role}`));
  title.append(left, el('div', 'role', `RISK ${emp.risk}`));
  header.append(title);
  cse.intro.forEach(([tag, text]) => header.append(signal(tag, text)));
  app.append(header);

  const inv = el('section', 'card');
  inv.append(el('div', 'eyebrow', `Investigate · choose up to 2 (${2 - state.investigated.length} left)`));
  const invActions = el('div', 'actions');
  cse.investigations.forEach(([label, result], i) => {
    if (state.investigated.includes(i)) {
      const box = el('div', 'choice-summary');
      box.append(el('strong', null, label));
      box.append(el('div', 'small', result));
      invActions.append(box);
    } else {
      const b = btn(label, () => update(investigate(state, i)));
      b.disabled = state.investigated.length >= 2;
      invActions.append(b);
    }
  });
  inv.append(invActions);
  app.append(inv);

  const inter = el('section', 'card');
  inter.append(el('div', 'eyebrow', 'Interfere · optional'));
  const interActions = el('div', 'actions three');
  cse.interventions.forEach(a => {
    const note = a.id === state.selectedIntervention ? 'selected' : '';
    interActions.append(btn(a.label, () => update(intervene(state, a.id)), a.id === state.selectedIntervention ? 'primary' : '', note));
  });
  inter.append(interActions);
  if (state.selectedIntervention) {
    const a = cse.interventions.find(x => x.id === state.selectedIntervention);
    const s = el('div', `choice-summary ${a.tone === 'bad' ? 'bad' : a.tone === 'good' ? 'good' : ''}`);
    s.append(el('div', 'small', a.effect));
    inter.append(s);
  }
  app.append(inter);

  const rep = el('section', 'card');
  rep.append(el('div', 'eyebrow', 'Permanent record'));
  rep.append(el('p', 'small', 'Choose what the organization should do with this employee.'));
  const repActions = el('div', 'actions three');
  cse.reports.forEach(a => repActions.append(btn(a.label, () => update(report(state, a.id)), a.id === 'escalate' ? 'danger' : '')));
  rep.append(repActions);
  app.append(rep);
}

function renderResult() {
  const cse = currentCase(state);
  const emp = state.employees[cse.employee];
  const intervention = cse.interventions.find(x => x.id === emp.intervention);
  const reportAction = cse.reports.find(x => x.id === emp.report);
  const c = el('section', 'card');
  c.append(el('div', 'eyebrow', 'Case recorded'));
  c.append(el('h2', null, `${emp.name}: ${employeeOutcome(emp)}`));
  c.append(el('p', null, intervention?.effect ?? 'No intervention applied.'));
  c.append(el('p', 'small', `Permanent action: ${reportAction?.label ?? 'none'}. Current risk score: ${emp.risk}.`));
  const actions = el('div', 'actions');
  actions.append(btn(state.caseIndex === CASES.length - 1 ? 'Run model performance review' : 'Next case', () => update(next(state)), 'primary'));
  c.append(actions);
  app.append(c);
  renderDossiers();
}

function renderPolicy() {
  stageBadge.textContent = 'WORKFORCE INTELLIGENCE';
  const c = el('section', 'card policy');
  c.append(el('div', 'eyebrow', 'NARC update 2.1'));
  c.append(el('h2', null, 'Earlier support through deeper visibility.'));
  c.append(el('p', null, 'New capabilities are now authorized: behavioral deviation detection, sentiment analysis, and enhanced intervention controls.'));
  c.append(el('p', 'small', 'These improvements allow NARC to address risk before conventional policy violations occur.'));
  const actions = el('div', 'actions');
  actions.append(btn('ACKNOWLEDGE', () => update(next(state)), 'primary'));
  c.append(actions);
  app.append(c);
}

function renderDossiers() {
  const c = el('section', 'card');
  c.append(el('div', 'eyebrow', 'Employee records'));
  const grid = el('div', 'dossier');
  Object.values(state.employees).forEach(emp => {
    const item = el('div', 'dossier-item');
    item.append(el('div', 'name', emp.name));
    item.append(el('div', 'small', emp.role));
    item.append(el('div', 'status', employeeOutcome(emp)));
    item.append(el('div', 'small', `risk ${emp.risk} · reports ${emp.reported}`));
    grid.append(item);
  });
  c.append(grid);
  app.append(c);
}

function epilogue(id, emp) {
  const outcome = employeeOutcome(emp);
  if (id === 'luis') {
    if (outcome === 'TERMINATED') return 'Final note: “Restroom utilization remained statistically exceptional.”';
    if (emp.help) return 'Restroom time is now categorized as unstructured ideation. Nobody knows what that means.';
    if (emp.hurt) return 'Luis now carries his phone to the bathroom so NARC can observe “active engagement.”';
    return 'Luis remains employed and declines to elaborate.';
  }
  if (id === 'priya') {
    if (outcome === 'TERMINATED') return 'Termination reason: persistent collaboration overload.';
    if (emp.help) return 'Priya is now officially one of the company’s highest-collaboration employees.';
    if (emp.hurt) return 'Her Slack activity fell 72%. NARC has opened an isolation-risk review.';
    return 'Priya continues asking coworkers what they are having for lunch.';
  }
  if (id === 'nina') {
    if (outcome === 'TERMINATED') return 'Nina was dismissed for repeated noncompliance with mandatory rest.';
    if (emp.help) return 'Her 23 unused PTO days are now listed as “focus reserve.” Finance has questions.';
    if (emp.hurt) return 'Vacation compliance reached 100% after her accounts were disabled.';
    return 'Nina has still not taken a vacation day.';
  }
  if (id === 'marcus') {
    if (outcome === 'TERMINATED') return 'Final absence reason: “municipal bird event.” Documentation insufficient.';
    if (emp.help) return 'Attendance reliability remains 38%. Documentation quality: exceptional.';
    if (emp.hurt) return 'Marcus is on a final warning. He has stopped bringing his company phone to mini-golf.';
    return 'Marcus remains employed and has not worked a Monday in nine weeks.';
  }
  return '';
}

function renderEnding() {
  stageBadge.textContent = 'MODEL PERFORMANCE REVIEW';
  const ro = reviewerOutcome(state);
  const c = el('section', 'card');
  c.append(el('div', 'eyebrow', 'Review period complete'));
  c.append(el('h1', null, 'NARC performance review'));
  const metrics = el('div', 'metrics');
  const defs = [
    ['Compliance', state.reviewer.compliance],
    ['Protective overrides', state.reviewer.protective],
    ['Punitive escalations', state.reviewer.punitive],
    ['Record interventions', state.reviewer.manipulation],
  ];
  defs.forEach(([label, value]) => {
    const m = el('div', 'metric');
    m.append(el('div', 'value', String(value)), el('div', 'label', label));
    metrics.append(m);
  });
  c.append(metrics);
  c.append(el('h2', null, ro.status));
  c.append(el('p', null, ro.line));
  c.append(el('p', 'small', companyOutcome(state)));
  app.append(c);

  const roster = el('section', 'card');
  roster.append(el('div', 'eyebrow', 'Employee outcomes'));
  const grid = el('div', 'ending-grid');
  Object.entries(state.employees).forEach(([id, emp]) => {
    const item = el('div', 'ending-person');
    item.append(el('h3', null, `${emp.name} — ${employeeOutcome(emp)}`));
    item.append(el('p', 'small', epilogue(id, emp)));
    grid.append(item);
  });
  roster.append(grid);
  const actions = el('div', 'actions');
  actions.append(btn('Run NARC again', () => { state = newGame(); render(); }, 'primary'));
  roster.append(actions);
  app.append(roster);

  app.append(el('p', 'footer-note', 'Prototype. Fiction. Deterministic for now; no employee dialogue is generated by live AI yet.'));
}

function render() {
  app.textContent = '';
  if (state.phase === 'intro') renderIntro();
  if (state.phase === 'case') renderCase();
  if (state.phase === 'result') renderResult();
  if (state.phase === 'policy') renderPolicy();
  if (state.phase === 'ending') renderEnding();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function update(nextState) {
  state = nextState;
  render();
}

render();
