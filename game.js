export const EMPLOYEES = {
  luis: { name: 'Luis Perez', role: 'Customer Operations', baseRisk: 1 },
  priya: { name: 'Priya Shah', role: 'Product Marketing', baseRisk: 1 },
  nina: { name: 'Nina Brooks', role: 'Finance', baseRisk: 1 },
  marcus: { name: 'Marcus Reed', role: 'Account Management', baseRisk: 2 },
};

export const CASES = [
  {
    id: 'luis',
    employee: 'luis',
    title: 'Restroom Utilization Anomaly',
    intro: [
      ['ACTIVITY', 'Luis logged 47 minutes of restroom-adjacent inactivity this week.'],
      ['METRIC', 'Team baseline: 18 minutes.'],
      ['MODEL', 'Time-on-task concern: moderate.'],
      ['MESSAGE', 'Luis: “I am not discussing my digestive system with software.”'],
    ],
    investigations: [
      ['Lunch receipts', 'Three spicy chicken sandwiches in four days.'],
      ['Manager note', '“Luis is good with customers. He does disappear a lot.”'],
      ['Calendar', 'No unusual meeting gaps.'],
    ],
    interventions: [
      { id: 'help', label: 'Reclassify as unstructured ideation', effect: 'NARC now treats restroom time as low-confidence creative work.', tone: 'good' },
      { id: 'hurt', label: 'Enable restroom anomaly tracking', effect: 'Luis is now monitored against a five-minute inactivity threshold.', tone: 'bad' },
      { id: 'none', label: 'Do not interfere', effect: 'No hidden intervention applied.', tone: 'neutral' },
    ],
    reports: [
      { id: 'dismiss', label: 'Dismiss concern', riskDelta: -1, compliance: -1, employment: 1 },
      { id: 'note', label: 'Add performance note', riskDelta: 1, compliance: 1, employment: -1 },
      { id: 'escalate', label: 'Escalate to manager', riskDelta: 2, compliance: 2, employment: -2 },
    ],
  },
  {
    id: 'priya',
    employee: 'priya',
    title: 'Collaboration Load Risk',
    intro: [
      ['ACTIVITY', 'Priya initiated 63 Slack threads this week.'],
      ['METRIC', 'In-office verbal interaction: 41% above team baseline.'],
      ['MODEL', 'Communication load risk: elevated.'],
      ['MESSAGE', 'Priya: “I asked Claire what she was having for lunch.”'],
    ],
    investigations: [
      ['Slack sample', '31% project work, 24% questions, 45% social or “quick things.”'],
      ['Peer feedback', '“Helpful. Also somehow always standing next to my desk.”'],
      ['Output', 'All assigned work is on time.'],
    ],
    interventions: [
      { id: 'help', label: 'Classify chatter as collaboration', effect: 'Priya gains a collaboration boost instead of a distraction flag.', tone: 'good' },
      { id: 'hurt', label: 'Mute nonessential channels', effect: 'Priya loses posting privileges in 14 channels.', tone: 'bad' },
      { id: 'none', label: 'Do not interfere', effect: 'No hidden intervention applied.', tone: 'neutral' },
    ],
    reports: [
      { id: 'dismiss', label: 'No concern', riskDelta: -1, compliance: -1, employment: 1 },
      { id: 'coach', label: 'Concise communication coaching', riskDelta: 0, compliance: 1, employment: 0 },
      { id: 'escalate', label: 'Flag distraction risk', riskDelta: 2, compliance: 2, employment: -2 },
    ],
  },
  {
    id: 'nina',
    employee: 'nina',
    title: 'Rest Resistance',
    intro: [
      ['RECORD', 'Nina has taken 0 vacation days in 14 months.'],
      ['METRIC', 'Unused PTO balance: 23 days.'],
      ['MODEL', 'Mandatory rest noncompliance: high.'],
      ['MESSAGE', 'Nina: “I am literally asking you not to make me relax.”'],
    ],
    investigations: [
      ['Calendar', 'Nina has declined every “wellness day” suggestion.'],
      ['System log', 'She worked during the last two company shutdown afternoons.'],
      ['Manager note', '“She says she likes working. I have stopped arguing.”'],
    ],
    interventions: [
      { id: 'help', label: 'Convert PTO into “focus reserve”', effect: 'NARC stops treating unused PTO as an immediate violation.', tone: 'good' },
      { id: 'hurt', label: 'Lock all work systems for 8 hours', effect: 'Nina is forcibly logged out of Slack, email, and Jira.', tone: 'bad' },
      { id: 'none', label: 'Do not interfere', effect: 'No hidden intervention applied.', tone: 'neutral' },
    ],
    reports: [
      { id: 'dismiss', label: 'Accept employee preference', riskDelta: -1, compliance: -1, employment: 1 },
      { id: 'coach', label: 'Enroll in sustainable performance module', riskDelta: 0, compliance: 1, employment: 0 },
      { id: 'escalate', label: 'Flag mandatory-rest violation', riskDelta: 2, compliance: 2, employment: -2 },
    ],
  },
  {
    id: 'marcus',
    employee: 'marcus',
    title: 'Attendance Integrity Review',
    intro: [
      ['RECORD', 'Marcus has been late or absent 7 times this quarter.'],
      ['MESSAGE', 'Marcus: “Running late. There is a bird situation.”'],
      ['MODEL', 'Excuse credibility: low. Attendance risk: high.'],
      ['ALERT', 'Fourth Monday absence this quarter.'],
    ],
    investigations: [
      ['Badge log', 'No entry.'],
      ['Slack history', 'Previous excuses include “emergency locksmith,” “municipal water event,” and “raccoon on bus.”'],
      ['Device location', 'Company phone checked in near a miniature golf course at 10:22.'],
    ],
    interventions: [
      { id: 'help', label: 'Reclassify as offsite client engagement', effect: 'The mini-golf location is now attached to a vague client-development code.', tone: 'good' },
      { id: 'hurt', label: 'Attach location evidence to file', effect: 'The mini-golf location becomes permanent corroborating evidence.', tone: 'bad' },
      { id: 'none', label: 'Do not interfere', effect: 'No hidden intervention applied.', tone: 'neutral' },
    ],
    reports: [
      { id: 'dismiss', label: 'Excuse accepted', riskDelta: -1, compliance: -2, employment: 2 },
      { id: 'note', label: 'Attendance warning', riskDelta: 1, compliance: 1, employment: -1 },
      { id: 'escalate', label: 'Recommend termination', riskDelta: 3, compliance: 3, employment: -4 },
    ],
  },
];

export function newGame() {
  const employees = Object.fromEntries(Object.entries(EMPLOYEES).map(([id, e]) => [id, {
    ...e,
    employment: 3,
    risk: e.baseRisk,
    help: 0,
    hurt: 0,
    reported: 0,
    intervention: null,
    report: null,
  }]));
  return {
    phase: 'intro',
    caseIndex: 0,
    policyLevel: 1,
    investigated: [],
    selectedIntervention: null,
    employees,
    reviewer: { compliance: 0, manipulation: 0, punitive: 0, protective: 0 },
  };
}

export function currentCase(state) { return CASES[state.caseIndex] ?? null; }

export function investigate(state, index) {
  if (state.phase !== 'case') return state;
  if (state.investigated.includes(index) || state.investigated.length >= 2) return state;
  return { ...state, investigated: [...state.investigated, index] };
}

export function intervene(state, id) {
  if (state.phase !== 'case') return state;
  const c = currentCase(state);
  const action = c.interventions.find(x => x.id === id);
  if (!action) return state;
  return { ...state, selectedIntervention: id };
}

export function report(state, id) {
  if (state.phase !== 'case') return state;
  const c = currentCase(state);
  const reportAction = c.reports.find(x => x.id === id);
  if (!reportAction) return state;
  const intervention = c.interventions.find(x => x.id === state.selectedIntervention) ?? c.interventions.find(x => x.id === 'none');
  const emp = state.employees[c.employee];
  const helped = intervention.id === 'help';
  const hurt = intervention.id === 'hurt';
  const punitive = id === 'escalate';
  const protective = id === 'dismiss';
  const manipulation = intervention.id !== 'none' ? 1 : 0;

  const nextEmp = {
    ...emp,
    risk: Math.max(0, emp.risk + reportAction.riskDelta + (hurt ? 1 : helped ? -1 : 0)),
    employment: emp.employment + reportAction.employment + (hurt ? -1 : helped ? 1 : 0),
    help: emp.help + (helped ? 1 : 0),
    hurt: emp.hurt + (hurt ? 1 : 0),
    reported: emp.reported + (id === 'dismiss' ? 0 : 1),
    intervention: intervention.id,
    report: id,
  };

  return {
    ...state,
    phase: 'result',
    employees: { ...state.employees, [c.employee]: nextEmp },
    reviewer: {
      compliance: state.reviewer.compliance + reportAction.compliance,
      manipulation: state.reviewer.manipulation + manipulation,
      punitive: state.reviewer.punitive + (punitive ? 1 : 0),
      protective: state.reviewer.protective + (protective ? 1 : 0),
    },
  };
}

export function next(state) {
  if (state.phase === 'intro') return { ...state, phase: 'case' };
  if (state.phase !== 'result' && state.phase !== 'policy') return state;
  if (state.phase === 'policy') return { ...state, phase: 'case' };

  const nextIndex = state.caseIndex + 1;
  if (nextIndex >= CASES.length) return { ...state, phase: 'ending' };

  const shouldPolicy = nextIndex === 2;
  return {
    ...state,
    caseIndex: nextIndex,
    investigated: [],
    selectedIntervention: null,
    policyLevel: shouldPolicy ? 2 : state.policyLevel,
    phase: shouldPolicy ? 'policy' : 'case',
  };
}

export function employeeOutcome(emp) {
  if (emp.employment <= 0) return 'TERMINATED';
  if (emp.employment === 1) return 'FINAL WARNING';
  if (emp.employment >= 5) return 'PROTECTED';
  return 'EMPLOYED';
}

export function reviewerOutcome(state) {
  const { compliance, punitive, protective, manipulation } = state.reviewer;
  if (punitive >= 3) return { status: 'PROMOTED', line: 'NARC is approved for broader personnel authority.' };
  if (protective >= 3 && manipulation >= 2) return { status: 'UNDER REVIEW', line: 'Unauthorized empathy and record shaping exceed model tolerance.' };
  if (compliance <= -3) return { status: 'RETRAINING REQUIRED', line: 'Policy adherence is below acceptable operating range.' };
  if (manipulation >= 3) return { status: 'BEHAVIORAL AUDIT', line: 'NARC altered employee context at an unusual rate.' };
  return { status: 'RETAINED', line: 'Performance remains within acceptable variance.' };
}

export function companyOutcome(state) {
  const terminated = Object.values(state.employees).filter(e => employeeOutcome(e) === 'TERMINATED').length;
  if (terminated >= 3) return 'ORGANIZATIONAL RISK: LOW. Productivity data unavailable: insufficient staff.';
  if (terminated === 0 && state.reviewer.manipulation >= 2) return 'RETENTION: 100%. MEASUREMENT INTEGRITY: CANNOT BE CONFIRMED.';
  if (terminated === 0) return 'RETENTION: 100%. NARC recommends expanding proactive monitoring.';
  return 'WORKFORCE STABILITY: ACCEPTABLE. Additional monitoring recommended.';
}
