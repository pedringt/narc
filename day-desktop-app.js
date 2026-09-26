import { newGame, act, ending, clock, nextEvent, chatOptions } from './day.js';

const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  intranet: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 13h4M7 16h7"/>'),
  messages: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  files: svg('<path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  utilities: svg('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
  browser: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  narc: svg('<ellipse cx="8" cy="12" rx="4" ry="5"/><ellipse cx="16" cy="12" rx="4" ry="5"/><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/>'),
};

const APPS = [
  ['intranet', 'The Loop'], ['messages', 'Messages'], ['email', 'Email'], ['calendar', 'Calendar'],
  ['files', 'Files'], ['utilities', 'Utilities'], ['browser', 'Browser'], ['narc', 'NARC'],
];

const THREADS = {
  dana: { name: 'Dana Whitfield', role: 'Your manager' },
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
};

const REQUEST_THREAD = {
  danaMorning: 'dana', luisTip: 'luis', marcusFavor: 'marcus', danaCheckin: 'dana', marcusFallout: 'marcus',
  priyaCase: 'priya', luisCase: 'luis', marcusCase: 'marcus',
};

const REQUEST_OPTIONS = {
  luisTip: [['thank', 'Say thanks'], ['ignore', 'Say nothing']],
  marcusFavor: [['help', 'Give him 15 minutes'], ['decline', "Say you don't have time"]],
  danaCheckin: [['update', 'Give her the full picture (15 min)'], ['brief', 'Give her the short version (5 min)']],
  marcusFallout: [['apologize', 'Walk him through it (15 min)'], ['standby', 'Stand by the call (2 min)']],
  priyaCase: [['context', 'Add the client/onboarding context (8 min)'], ['quiet', 'Suggest she post less (2 min)'], ['report', 'Confirm the flag without context (2 min)']],
  luisCase: [['context', 'Explain the low-input work (6 min)'], ['blame', 'Say Luis is probably gaming it (2 min)'], ['leave', 'Stay out of it']],
  marcusCase: [['evidence', 'Send the transit alert (5 min)'], ['confirm', 'Confirm he was late (2 min)'], ['leave', 'Stay out of it']],
  narcResponse: [['explain', 'Explain the pattern (10 min)'], ['ignore', 'Leave the flag unanswered']],
};

function requestOptions(id) {
  if (id === 'danaMorning') {
    if (state.flags.firstNarcReadType === 'low') return [['context', 'Tell Dana I was carefully reviewing the file (5 min)'], ['skip', "Leave NARC's read as-is"]];
    if (state.flags.firstNarcReadType === 'visible') return [['context', 'Tell Dana the fast result hid rushed work (5 min)'], ['skip', "Leave NARC's read as-is"]];
    return [['context', 'Tell Dana what the score missed (5 min)'], ['skip', "Leave NARC's read as-is"]];
  }
  if (id === 'narcFirstReview') {
    return state.flags.firstNarcReadType === 'low'
      ? [['context', 'Add context: careful file review (5 min)'], ['accept', 'Leave the assessment']]
      : [['context', 'Add context about the completed task (5 min)'], ['accept', 'Leave the assessment']];
  }
  if (id === 'narcCheckpoint') return [['context', "Add context to NARC's assessment (8 min)"], ['ignore', "Leave NARC's assessment unchanged"]];
  if (id === 'danaCheckin' && state.flags.trustedOperator) {
    return [
      ['trustNarc', "Use NARC's Trusted Operator summary (2 min)"],
      ['update', 'Give Dana the real picture (15 min)'],
      ['brief', 'Give her the short version (5 min)'],
    ];
  }
  return REQUEST_OPTIONS[id] || [];
}

const TASK_OPTIONS = {
  vendor: [['quick', 'Skim it, approve it (5 min)'], ['thorough', 'Actually read it (25 min)']],
  client: [['canned', 'Send a quick apology (5 min)'], ['investigate', 'Dig into what happened (25 min)']],
  project: [['cut', 'Cut scope yourself (10 min)'], ['consult', 'Loop in Marcus first (20 min)']],
  rework: [['quiet', 'Deal with it yourself (20 min)'], ['escalate', 'Tell Dana now (8 min)']],
};

const FILES = {
  vendor: {
    name: 'Halcyon_Vendor_Renewal.pdf', meta: 'Procurement · renewal due 11:30 AM',
    body: ['Halcyon is proposing a one-year renewal.', 'The rate table contains a 30% increase buried in the updated commercial terms.', 'You need to recommend whether Meridian should renew or push back before the auto-renewal window closes.'],
  },
  client: {
    name: 'Priya_Client_Escalation.txt', meta: 'Client Operations · response due 1:00 PM',
    body: ['The client says the last shipment missed a requirement that was visible in their account notes.', 'A quick apology may calm the thread, but the underlying problem is in the file history.', 'Priya needs an answer she can actually stand behind.'],
  },
  project: {
    name: 'Marcus_Project_Scope.doc', meta: 'Project Delivery · decision due 3:30 PM',
    body: ['The delivery date moved up.', 'Something has to be cut. Marcus owns the account context, but pulling him in costs time.', 'You can make the scope call yourself or coordinate first.'],
  },
  rework: {
    name: 'FOLLOW_UP_REQUIRED.txt', meta: 'Generated from an earlier shortcut',
    body: ['An earlier decision created a problem that now needs attention.', 'The exact consequence depends on what you rushed this morning.'],
  },
};

const EMAILS = [
  {
    id: 'welcome', from: 'People Operations', subject: 'Welcome to NARC Workforce Support',
    body: [
      'Good morning, Employee 4417.',
      "NARC is Meridian's AI workplace-monitoring system. It scores the work traces it can see: activity, response patterns, calendar signals, and other observable behavior.",
      "Your job is still your job. Get through the day, do the work, and deal with people as things come up. NARC's score may not always agree with the quality of what you actually did.",
      'You have three responsibilities waiting this morning. The Loop will point you toward them.',
    ],
  },
  {
    id: 'policy', from: 'IT + People Operations', subject: 'Monitoring notice: activity signals',
    body: ['Visible Activity Index is not a direct measure of work quality.', 'It is an automated interpretation of observable workstation signals and may change as NARC is updated.'],
  },
];

const CULTURE_EMAIL = {
  id: 'culture', from: 'Culture Team', subject: 'Culture Champion nominations',
  body: [
    'Culture Champions are colleagues who make our workplace feel like a workplace.',
    "You may nominate one coworker today. The selected Champion receives a temporary monitoring exemption: their next automatic NARC action is routed to human review instead.",
    'This is a real policy. We also think it is fun.',
  ],
};

const NARC2_EMAIL = {
  id: 'narc2', from: 'People Operations', subject: 'NARC 2.0: new capabilities',
  body: [
    'NARC has been updated effective immediately.',
    'Behavioral Deviation Detection now learns what is normal for each employee. Synthetic Activity Identification looks for repeated or mechanically regular activity patterns.',
    'Repeated Focus Time usage is no longer treated as reliable context by default. It may now be weighted as possible activity manipulation.',
    'Employees are encouraged to continue working normally.',
  ],
};

function currentEmails() {
  const out = [...EMAILS];
  if (state.flags.cultureEmailAvailable) out.unshift(CULTURE_EMAIL);
  if (state.flags.narc2EmailAvailable) out.unshift(NARC2_EMAIL);
  return out;
}

const NEWS = [
  {
    id: 'mouse-enthusiasm',
    source: 'WorkFuture Daily',
    title: 'Startup says AI can detect employee enthusiasm from mouse movement',
    dek: 'The company says micro-velocity patterns correlate with commitment. Researchers remain unconvinced.',
    body: [
      'A workplace analytics startup says tiny variations in mouse movement can help distinguish engaged employees from disengaged ones.',
      'The company describes the signal as one input among many. Independent researchers quoted in the report say the same movement patterns can reflect hardware, accessibility needs, task type, or simple habit.',
      'The argument is familiar: activity is easy to count. Whether the count means what the system says it means is a different question.',
    ],
  },
  {
    id: 'calendar-evidence',
    source: 'Office Systems Weekly',
    title: 'Why your calendar is becoming workplace evidence',
    dek: 'Scheduling metadata is easier to measure than the quality of the work itself.',
    body: [
      'More workplace systems are treating calendar labels, response times, and availability states as evidence about how employees spend their day.',
      'That can make invisible work easier to explain, but it can also reward employees for producing the right metadata instead of doing better work.',
      'Teams adopting these systems are increasingly teaching workers how to label concentration, meetings, and offline work so automated summaries do not mistake quiet time for inactivity.',
    ],
  },
  {
    id: 'anti-idle',
    source: 'Model Behavior',
    title: 'The anti-idle arms race gets an anti-anti-idle layer',
    dek: 'Monitoring tools now look for repeating input patterns after workers learned to spoof activity.',
    body: [
      'Mouse jigglers and simulated input tools became popular as workers tried to keep status indicators active during reading, calls, and other low-input work.',
      'Monitoring vendors responded by looking for repetitive or mechanically regular activity. Workers then changed tools again.',
      'The result is an arms race around the measurement itself: employees optimize for what the system can observe, while the system keeps changing what counts as suspicious.',
    ],
  },
];

const TUTORIAL_STEPS = [
  { target: 'intranet', text: 'Hi, Dana here — your manager. You are on the operations team at Meridian Supply Co.; we handle vendor, client, and delivery work. The Loop is our employee home base for tasks, people, files, and company systems. Leadership is piloting NARC because they want a clearer picture of how work gets done, so it watches the signals it can see and turns them into employee assessments. It cannot actually see the quality of the work itself. You have three things waiting today. Start with The Loop and I will show you around.', label: 'Open The Loop' },
  { target: 'files', text: 'Next, open Files. That is where the substance of the work lives. Careful reading can take real time while producing very little visible activity, which matters to NARC.', label: 'Open Files' },
  { target: 'calendar', text: 'Next, check Calendar. NARC treats calendar status as evidence, so the same quiet work block can look different depending on how it is labeled.', label: 'Open Calendar' },
  { target: 'narc', text: 'Now open NARC itself. This is the system’s version of your day: what it saw, what it inferred, and what it thinks your activity means.', label: 'Open NARC' },
  { target: 'intranet', text: 'That is the tour. You have three responsibilities waiting in The Loop. Pick one, open its file, and start working. Then watch how NARC reacts to what you actually do.', label: 'Go to The Loop', final: true },
];

let state = newGame();
let ui = freshUi();
let toastTimer = null;
let tutorialTimer = null;

function freshUi() {
  return {
    oriented: false, tutorialStep: -1, tutorialDone: false, tutorialUnread: false, tutorialAdvancing: false, app: 'email', openApps: ['email'], selectedEmail: 'welcome',
    selectedFile: null, selectedThread: null, selectedArticle: null, mobileDetail: { email: true, messages: false, files: false, browser: false }, positions: {}, notifications: [], notificationCenterOpen: false, nextNotificationId: 1,
  };
}

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

const root = document.getElementById('desk');
root.innerHTML = `
  <header class="menubar">
    <div class="left"><span class="company">MERIDIAN<span class="co-rest"> SUPPLY CO.</span></span><span class="who">Employee 4417 · Operations Associate</span></div>
    <div class="right"><span class="clock" id="clock"></span><button class="notifications-button" id="notificationsBtn" type="button">Notifications<span class="notifications-count" id="notificationsCount"></span></button><button class="logoff" id="logoff" type="button">Log off</button><button class="tray" id="tray" type="button"><span class="dot"></span><span id="trayText"><span class="full">NARC ACTIVE</span><span class="short">NARC</span></span></button></div>
  </header>
  <div class="wallpaper-art" aria-hidden="true"><span class="wall-ring ring-a"></span><span class="wall-ring ring-b"></span><span class="wall-ribbon ribbon-a"></span><span class="wall-ribbon ribbon-b"></span><span class="wall-brand">MERIDIAN / FIELD SYSTEMS</span></div>
  <div class="stage"><nav class="dock" id="dock" aria-label="Apps"></nav><main class="workarea"><div class="window-stack" id="windows"></div></main></div>
  <div class="toasts" id="toasts" aria-live="polite"></div><aside class="notification-center" id="notificationCenter" hidden></aside><div id="modal"></div>`;

const els = {
  clock: root.querySelector('#clock'), logoff: root.querySelector('#logoff'), tray: root.querySelector('#tray'),
  notificationsBtn: root.querySelector('#notificationsBtn'), notificationsCount: root.querySelector('#notificationsCount'), notificationCenter: root.querySelector('#notificationCenter'),
  trayText: root.querySelector('#trayText'), dock: root.querySelector('#dock'), windows: root.querySelector('#windows'),
  toasts: root.querySelector('#toasts'), modal: root.querySelector('#modal'),
};

els.tray.addEventListener('click', () => goApp('narc'));
els.notificationsBtn.addEventListener('click', () => {
  ui.notificationCenterOpen = !ui.notificationCenterOpen;
  renderNotificationCenter();
});
els.logoff.addEventListener('click', () => { state = act(state, { do: 'logoff' }); render(); });

function restart() { state = newGame(); ui = freshUi(); render(); }

function completeTutorialTarget(id) {
  const step = TUTORIAL_STEPS[ui.tutorialStep];
  if (!step || ui.tutorialDone || ui.tutorialAdvancing || step.target !== id) return;

  if (step.final) {
    ui.tutorialDone = true;
    return;
  }

  ui.tutorialAdvancing = true;
  clearTimeout(tutorialTimer);
  tutorialTimer = setTimeout(() => {
    if (ui.tutorialDone) return;
    ui.tutorialStep += 1;
    ui.tutorialAdvancing = false;
    ui.tutorialUnread = true;
    render();
    const nextStep = TUTORIAL_STEPS[ui.tutorialStep];
    if (nextStep) showToast('Dana Whitfield', nextStep.text, 'messages', { thread: 'dana', tutorial: true });
  }, 350);
}

function isMobile() {
  return window.matchMedia('(max-width: 760px)').matches;
}

function setMobileDetail(id, shown) {
  if (!ui.mobileDetail || !(id in ui.mobileDetail)) return;
  ui.mobileDetail[id] = shown;
}

function markNotificationsRead(app, thread = null) {
  let changed = false;
  ui.notifications.forEach((item) => {
    const match = thread
      ? item.app === app && item.thread === thread
      : item.app === app && !item.thread;
    if (match && !item.read) {
      item.read = true;
      changed = true;
    }
  });
  if (changed) renderNotificationCenter();
}

function advanceTutorial() {
  const step = TUTORIAL_STEPS[ui.tutorialStep];
  if (!step || ui.tutorialDone) return;
  // The tutorial shortcut is only navigation. Progression is still owned by
  // goApp()/completeTutorialTarget(), so dock, focus, and shortcut paths share
  // one code path and cannot double-advance.
  goApp(step.target);
  // Re-assert focus after the tutorial button's click finishes. This makes the
  // destination visibly frontmost even when the click originated inside an
  // overlapping Messages window.
  requestAnimationFrame(() => focusWindow(step.target));
}

function ensureWindow(id) {
  if (!ui.openApps.includes(id)) {
    if (ui.openApps.length >= 3) ui.openApps.shift();
    ui.openApps.push(id);
  } else {
    ui.openApps = [...ui.openApps.filter((x) => x !== id), id];
  }
  ui.app = id;
}

function goApp(id) {
  if (id === 'messages' && ui.tutorialStep >= 0) {
    ui.tutorialUnread = false;
    if (!ui.selectedThread) ui.selectedThread = 'dana';
  }
  ensureWindow(id);
  completeTutorialTarget(id);

  // Opening content directly should reconcile the notification center with
  // what the player has actually seen. On mobile, Messages stays a list until
  // a thread is opened, so do not mark a thread read merely by visiting the app.
  if (id === 'messages') {
    if (ui.selectedThread && (!isMobile() || ui.mobileDetail.messages)) {
      markNotificationsRead('messages', ui.selectedThread);
    }
  } else {
    markNotificationsRead(id);
  }
  render();
}

function openThread(thread) {
  ui.selectedThread = thread;
  setMobileDetail('messages', true);
  goApp('messages');
}

function focusWindow(id) {
  if (!ui.openApps.includes(id)) return;
  ui.app = id;
  ui.openApps = [...ui.openApps.filter((x) => x !== id), id];
  completeTutorialTarget(id);
  document.querySelectorAll('.window[data-app]').forEach((w) => {
    const active = w.dataset.app === id;
    w.classList.toggle('active-window', active);
    w.style.zIndex = active ? '20' : String(5 + ui.openApps.indexOf(w.dataset.app));
  });
  renderChrome();
}

function closeWindow(id) {
  ui.openApps = ui.openApps.filter((x) => x !== id);
  if (ui.app === id) ui.app = ui.openApps[ui.openApps.length - 1] || null;
  render();
}

function dispatch(action) {
  const before = state;
  state = act(state, action);
  announceChanges(before, state);
  render();
}

function announceChanges(before, after) {
  const newEntries = after.log.slice(before.log.length);
  if (after.tasks.rework.status === 'pending' && before.tasks.rework.status !== 'pending') {
    showToast('Files', 'A morning shortcut just came back as a new file.', 'files');
  }
  if (after.flags.cultureEmailAvailable && !before.flags.cultureEmailAvailable) {
    showToast('Culture Team', 'Culture Champion nominations are open. One nomination can protect a coworker from an automatic NARC action.', 'email', { email: 'culture' });
  }
  if (after.narc.adaptation && !before.narc.adaptation) {
    showToast('NARC SYSTEM UPDATE', 'Repeated Focus Time usage detected across Meridian. NARC 2.0 now treats repeated Focus Time as possible activity manipulation.', 'narc');
    setTimeout(() => showToast('People Operations', 'NARC 2.0: new capabilities. Focus Time weighting has changed.', 'email', { email: 'narc2' }), 1200);
  } else {
    const newNarc = newEntries.find((e) => e.kind === 'narc');
    if (newNarc) showToast('NARC', newNarc.text, 'narc');
  }
  newEntries.filter((e) => e.kind === 'message' && e.from !== 'me').forEach((e) => {
    showToast(THREADS[e.who]?.name || 'Messages', e.text, 'messages', { thread: e.who });
  });
}

function openNotification(item) {
  item.read = true;
  ui.notificationCenterOpen = false;
  if (item.thread) {
    ui.selectedThread = item.thread;
    setMobileDetail('messages', true);
  }
  if (item.email) {
    ui.selectedEmail = item.email;
    setMobileDetail('email', true);
  }
  if (item.app) goApp(item.app);
  else render();
}

function renderNotificationCenter() {
  const unread = ui.notifications.filter((n) => !n.read).length;
  els.notificationsCount.textContent = unread ? String(unread) : '';
  els.notificationsBtn.classList.toggle('has-unread', unread > 0);
  els.notificationCenter.hidden = !ui.notificationCenterOpen;
  if (!ui.notificationCenterOpen) return;

  const header = h('div', 'notification-center-head', h('b', null, 'Notifications'), btn('×', 'notification-close', () => {
    ui.notificationCenterOpen = false;
    renderNotificationCenter();
  }, { 'aria-label': 'Close notifications' }));
  const list = h('div', 'notification-list');
  if (!ui.notifications.length) list.append(h('div', 'notification-empty', 'No notifications yet.'));
  ui.notifications.slice().reverse().forEach((item) => {
    const row = btn('', `notification-item${item.read ? '' : ' unread'}`, () => openNotification(item));
    row.append(h('div', 'notification-meta', h('b', null, item.source), h('span', null, clock(item.t))), h('div', 'notification-preview', item.text));
    list.append(row);
  });
  els.notificationCenter.replaceChildren(header, list);
}

function showToast(source, text, app = null, meta = {}) {
  clearTimeout(toastTimer);
  const item = {
    id: ui.nextNotificationId++,
    source,
    text,
    app,
    thread: meta.thread || null,
    email: meta.email || null,
    t: state.t,
    read: false,
  };
  ui.notifications.push(item);
  renderNotificationCenter();

  const toast = h('button', 'toast', h('span', 'app', source), h('span', 'text', text));
  toast.type = 'button';
  toast.addEventListener('click', () => {
    els.toasts.replaceChildren();
    openNotification(item);
  });
  els.toasts.replaceChildren(toast);
  toastTimer = setTimeout(() => els.toasts.replaceChildren(), 6000);
}

function windowShell(id, title, ...body) {
  const bar = h('div', 'titlebar');
  const icon = h('span', `title-icon title-icon-${id}`);
  icon.innerHTML = ICON[id] || '';
  const back = btn('‹ Back', 'back', () => {
    setMobileDetail(id, false);
    render();
  }, { 'aria-label': `Back to ${title} list` });
  bar.append(back, icon, h('span', 'window-title', title), btn('×', 'win-close', () => closeWindow(id), { 'aria-label': `Hide ${title}` }));
  return [bar, ...body];
}

function clampWindowPosition(win, id) {
  if (window.matchMedia('(max-width: 760px)').matches) return;
  const area = els.windows.getBoundingClientRect();
  const rect = win.getBoundingClientRect();
  const margin = 10;
  const maxX = Math.max(0, (area.width - rect.width) / 2 - margin);
  const maxY = Math.max(0, (area.height - rect.height) / 2 - margin);
  const pos = ui.positions[id] || { x: 0, y: 0 };
  const x = Math.max(-maxX, Math.min(maxX, pos.x));
  const y = Math.max(-maxY, Math.min(maxY, pos.y));
  ui.positions[id] = { x, y };
  win.style.setProperty('--dx', `${x}px`);
  win.style.setProperty('--dy', `${y}px`);
}

function installDrag(win, id) {
  const bar = win.querySelector('.titlebar');
  if (!bar || window.matchMedia('(max-width: 760px)').matches) return;
  bar.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    focusWindow(id);
    const start = ui.positions[id] || { x: 0, y: 0 };
    const sx = event.clientX; const sy = event.clientY;
    bar.setPointerCapture(event.pointerId);
    const move = (e) => {
      const area = els.windows.getBoundingClientRect();
      const rect = win.getBoundingClientRect();
      const maxX = Math.max(0, (area.width - rect.width) / 2 - 10);
      const maxY = Math.max(0, (area.height - rect.height) / 2 - 10);
      const x = Math.max(-maxX, Math.min(maxX, start.x + e.clientX - sx));
      const y = Math.max(-maxY, Math.min(maxY, start.y + e.clientY - sy));
      ui.positions[id] = { x, y };
      win.style.setProperty('--dx', `${x}px`); win.style.setProperty('--dy', `${y}px`);
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
}

function renderChrome() {
  els.clock.textContent = clock(state.t);
  els.logoff.disabled = state.phase === 'end';
  els.tray.classList.toggle('enhanced', state.narc.adaptation);
  els.trayText.querySelector('.full').textContent = state.narc.adaptation ? 'NARC · 2.0' : 'NARC ACTIVE';
  els.trayText.querySelector('.short').textContent = state.narc.adaptation ? 'NARC · 2.0' : 'NARC';

  const openReq = Object.entries(state.requests).filter(([id, r]) => r.status === 'open' && REQUEST_THREAD[id]).length;
  const pendingTasks = Object.values(state.tasks).filter((t) => t.status === 'pending').length;
  const visibleApps = ui.oriented ? APPS : APPS.filter(([id]) => id === 'email' || id === 'intranet');
  els.dock.replaceChildren(...visibleApps.map(([id, label]) => {
    const b = h('button', `dock-app dock-app-${id}${id === 'narc' ? ' narc' : ''}`, h('span', 'dock-icon'), label);
    b.firstChild.innerHTML = ICON[id];
    b.type = 'button';
    b.setAttribute('aria-current', String(ui.app === id));
    b.classList.toggle('is-open', ui.openApps.includes(id));
    const narcOpen = ['narcFirstReview', 'narcCheckpoint', 'narcResponse'].filter((rid) => state.requests[rid]?.status === 'open').length;
    const count = id === 'messages' ? openReq + (ui.tutorialUnread ? 1 : 0) : id === 'files' ? pendingTasks : id === 'narc' ? narcOpen : 0;
    if (count) b.append(h('span', 'badge', count));
    b.addEventListener('click', () => goApp(id));
    return b;
  }));
}

function renderWindows() {
  const views = { intranet: renderLoop, messages: renderMessages, email: renderEmail, calendar: renderCalendar, files: renderFiles, utilities: renderUtilities, browser: renderBrowser, narc: renderNarc };
  const narrow = window.matchMedia('(max-width: 760px)').matches;
  const ids = narrow ? (ui.app ? [ui.app] : []) : ui.openApps;
  const nodes = ids.map((id, index) => {
    const showDetail = isMobile() && Boolean(ui.mobileDetail?.[id]);
    const win = h('section', `window app-${id}${id === 'narc' ? ' narc' : ''}${ui.app === id ? ' active-window' : ''}${showDetail ? ' show-detail' : ''}`);
    win.dataset.app = id;
    win.style.zIndex = String(ui.app === id ? 20 : 5 + index);
    const pos = ui.positions[id] || { x: (index - 1) * 38, y: (index - 1) * 24 };
    ui.positions[id] = pos;
    win.style.setProperty('--dx', `${pos.x}px`); win.style.setProperty('--dy', `${pos.y}px`);
    win.replaceChildren(...views[id]());
    win.addEventListener('pointerdown', () => focusWindow(id), { capture: true });
    return win;
  });
  els.windows.replaceChildren(...nodes);
  els.windows.querySelectorAll('.window').forEach((w) => {
    clampWindowPosition(w, w.dataset.app);
    installDrag(w, w.dataset.app);
  });
}

function renderEmail() {
  const mails = currentEmails();
  const list = h('div', 'list');
  mails.forEach((m) => {
    const row = h('button', 'row mail-row', h('span', 'mail-row-icon', '✉'), h('div', 'mail-row-copy', h('div', 'top', h('span', 'name', m.from)), h('div', 'sub sub-b', m.subject)));
    row.type = 'button'; row.setAttribute('aria-current', String(ui.selectedEmail === m.id));
    row.addEventListener('click', () => {
      ui.selectedEmail = m.id;
      setMobileDetail('email', true);
      render();
    }); list.append(row);
  });
  const m = mails.find((x) => x.id === ui.selectedEmail) || mails[0];
  const detail = h('div', 'detail mail', h('h2', null, m.subject), h('div', 'from', `From: ${m.from}`));
  m.body.forEach((p) => detail.append(h('p', null, p)));
  if (m.id === 'culture') {
    if (state.culture.nominated) {
      detail.append(h('div', 'mail-form-result', `Nomination submitted: ${THREADS[state.culture.nominated].name}.`));
    } else {
      const form = h('div', 'mail-form', h('b', null, 'Nominate one coworker'));
      ['luis', 'marcus', 'priya'].forEach((who) => form.append(btn(THREADS[who].name, 'btn', () => dispatch({ do: 'nominate', who }))));
      detail.append(form);
    }
  }
  if (!ui.oriented && m.id === 'welcome') detail.append(btn('Start workday', 'btn primary', () => {
    ui.oriented = true;
    ui.tutorialStep = 0;
    ui.tutorialUnread = true;
    ui.selectedThread = 'dana';
    render();
    showToast('Dana Whitfield', TUTORIAL_STEPS[0].text, 'messages', { thread: 'dana' });
  }));
  return windowShell('email', 'Email', h('div', 'body', list, detail));
}

function renderLoop() {
  const main = h('div', 'intranet-list');
  main.append(h('div', 'loop-welcome',
    h('div', 'loop-kicker', 'MERIDIAN SUPPLY CO. · EMPLOYEE HOME'),
    h('h2', null, 'The Loop'),
    h('p', null, 'Your home base for today: work, coworkers, files, deadlines, and company systems. Meridian handles vendor, client, and delivery operations. NARC is watching the work traces it can see, not the work itself.')
  ));

  const taskBox = h('div', 'loop-card', h('div', 'loop-card-h', 'Today · your work'));
  Object.entries(state.tasks).filter(([, t]) => t.status !== 'hidden').forEach(([id, t]) => {
    const row = h('div', 'loop-task', h('div', null, h('b', null, t.label), h('p', 'loop-muted', `Due ${clock(t.deadline)} · ${t.status}`)));
    if (t.status === 'pending') {
      const actions = h('div', 'loop-task-actions');
      actions.append(btn('Open file', 'loop-link', () => {
        ui.selectedFile = id;
        setMobileDetail('files', true);
        goApp('files');
      }));
      if (id === 'client') actions.append(btn('Message Priya', 'loop-link', () => openThread('priya')));
      else if (id === 'project') actions.append(btn('Message Marcus', 'loop-link', () => openThread('marcus')));
      else if (id === 'rework') actions.append(btn('Message Dana', 'loop-link', () => openThread('dana')));
      else actions.append(btn('View deadline', 'loop-link', () => goApp('calendar')));
      row.append(actions);
    }
    taskBox.append(row);
  });
  main.append(taskBox);

  const side = h('aside', 'loop-side');
  const standing = state.standing.status === 'trusted' ? 'Trusted Operator' : state.standing.status === 'review' ? 'Review open' : 'Standard standing';
  const profile = h('div', 'loop-card', h('div', 'loop-card-h', 'Employee 4417'), h('div', 'employee-line', h('span', 'employee-avatar', '44'), h('div', null, h('b', null, 'Operations Associate'), h('p', 'loop-muted', `Visible Activity Index: ${state.index}`), h('p', `standing standing-${state.standing.status}`, standing))));
  const quick = h('div', 'loop-card', h('div', 'loop-card-h', 'Quick links'));
  [['Messages', 'messages'], ['Calendar', 'calendar'], ['Files', 'files'], ['NARC', 'narc']].forEach(([label, id]) => quick.append(btn(label, 'loop-link', () => goApp(id))));
  const note = h('div', 'loop-card nonsense', h('div', 'loop-card-h', 'Required reminder'), h('p', null, state.narc.adaptation ? 'NARC 2.0: repeated Focus Time is now considered possible gaming.' : 'NARC interprets visible activity. Quiet work can look like inactivity.'));
  side.append(profile, quick, note);
  return windowShell('intranet', 'The Loop · Meridian Supply Co.', h('div', 'body loop-home', main, side));
}

function requestForThread(thread) {
  return Object.entries(state.requests).filter(([id, r]) => r.status === 'open' && REQUEST_THREAD[id] === thread);
}

function threadMessages(thread) {
  return state.log.filter((e) => e.kind === 'message' && e.who === thread).map((e) => ({ text: e.text, t: e.t, from: e.from || 'them' }));
}

function latestThreadPreview(thread) {
  const actual = threadMessages(thread).at(-1);
  if (thread === 'dana' && ui.tutorialStep >= 0 && (!ui.tutorialDone || !actual)) {
    return TUTORIAL_STEPS[Math.min(ui.tutorialStep, TUTORIAL_STEPS.length - 1)].text;
  }
  return actual?.text || THREADS[thread].role;
}

function renderMessages() {
  const list = h('div', 'list');
  Object.entries(THREADS).forEach(([id, t]) => {
    const active = requestForThread(id).length + (id === 'dana' && ui.tutorialUnread ? 1 : 0);
    const preview = latestThreadPreview(id);
    const row = h('button', `row message-row${active ? ' unread' : ''}`, h('span', `msg-avatar avatar-${id}`, t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)), h('div', 'message-row-copy', h('div', 'top', h('span', 'name', t.name), active ? h('span', 'pill', active) : null), h('div', 'sub sub-b', preview)));
    row.type = 'button'; row.setAttribute('aria-current', String(ui.selectedThread === id));
    row.addEventListener('click', () => {
      ui.selectedThread = id;
      setMobileDetail('messages', true);
      markNotificationsRead('messages', id);
      if (id === 'dana') ui.tutorialUnread = false;
      render();
    }); list.append(row);
  });

  const detail = h('div', 'detail flush');
  const id = ui.selectedThread;
  if (!id) detail.append(h('div', 'empty', 'Select a conversation.'));
  else {
    const t = THREADS[id];
    const wrap = h('div', 'thread', h('header', null, h('b', null, t.name), h('span', null, t.role)));
    const scroll = h('div', 'scroll');
    const msgs = threadMessages(id);
    const tutorialMsgs = id === 'dana' && ui.tutorialStep >= 0 ? TUTORIAL_STEPS.slice(0, ui.tutorialStep + 1) : [];
    if (!msgs.length && !tutorialMsgs.length) scroll.append(h('div', 'empty', 'No new messages.'));
    tutorialMsgs.forEach((m) => scroll.append(h('div', 'bubble', m.text)));
    msgs.forEach((m) => {
      const bubble = h('div', `bubble${m.from === 'me' ? ' me' : ''}`, m.text);
      if (id === 'marcus' && state.flags.keepaliveAvailable && /keepalive\.pkg/i.test(m.text)) {
        bubble.append(btn('keepalive.pkg · Open in Utilities', 'attach clickable', () => goApp('utilities')));
      }
      scroll.append(bubble);
    });
    if (id === 'dana' && state.requests.danaMorning.status === 'handled') {
      scroll.append(h('div', 'bubble me', state.flags.morningContext
        ? (state.flags.firstNarcReadType === 'low' ? 'I was carefully reviewing the file. That is what the low-activity read missed.' : 'The visible activity came from moving fast. It did not mean the work was careful.')
        : "I left NARC's first-hour read as-is."));
    }
    wrap.append(scroll);
    const compose = h('div', 'compose');
    if (id === 'dana' && ui.tutorialStep >= 0 && !ui.tutorialDone) {
      const tutorial = TUTORIAL_STEPS[ui.tutorialStep];
      const chips = h('div', 'chips');
      chips.append(btn(tutorial.label, 'chip', advanceTutorial));
      compose.append(chips);
    }
    requestForThread(id).forEach(([reqId]) => {
      const chips = h('div', 'chips');
      requestOptions(reqId).forEach(([choice, label]) => chips.append(btn(label, 'chip', () => dispatch({ do: 'respond', id: reqId, choice }))));
      compose.append(chips);
    });
    const optional = chatOptions(state, id).slice(0, 3);
    if (optional.length) {
      const smallTalk = h('div', 'optional-chat', h('div', 'compose-state', requestForThread(id).length ? 'Optional' : 'Start a conversation'));
      const chips = h('div', 'chips');
      optional.forEach(([topic, label]) => chips.append(btn(label, 'chip secondary', () => dispatch({ do: 'chat', who: id, topic }))));
      smallTalk.append(chips);
      compose.append(smallTalk);
    }
    if (!compose.childNodes.length) compose.append(h('div', 'compose-state', 'Nothing else needs a reply right now.'));
    wrap.append(compose); detail.append(wrap);
  }
  return windowShell('messages', 'Messages', h('div', 'body', list, detail));
}

function renderCalendar() {
  const pane = h('div', 'pane');
  pane.append(h('div', 'cal-head', h('div', 'who-h', 'Today · one workday')));
  pane.append(h('div', 'event', h('div', 'time', '9:00–5:00'), h('div', null, h('div', null, 'Employee 4417 · workday'), h('div', 'where', 'Meridian workstation'))));
  Object.entries(state.tasks).filter(([, t]) => t.status === 'pending').forEach(([id, t]) => {
    pane.append(h('div', 'event deadline-event',
      h('div', 'time', clock(t.deadline)),
      h('div', null, h('div', null, t.label), h('div', 'where', id === 'rework' ? 'Follow-up required' : 'Work deadline'))
    ));
  });
  const card = h('div', 'card');
  card.append(h('h3', null, 'Focus Time'), h('p', 'note', state.narc.adaptation ? 'NARC 2.0 now treats repeated Focus Time as possible gaming. You can still test the signal.' : 'Mark a quiet stretch as Focus Time if NARC is reading concentration as inactivity.'));
  card.append(btn(state.narc.adaptation ? 'Use Focus Time anyway (5 min)' : 'Mark next block as Focus Time (5 min)', state.narc.adaptation ? 'btn' : 'btn primary', () => dispatch({ do: 'focus' })));
  state.calendar.forEach((c) => card.append(h('div', 'line', h('span', null, clock(c.at)), h('span', null, c.label))));
  pane.append(card);
  return windowShell('calendar', 'Calendar', h('div', 'body', pane));
}

function visibleFiles() {
  const ids = ['vendor', 'client', 'project'];
  if (state.tasks.rework.status !== 'hidden') ids.push('rework');
  return ids;
}

function renderFiles() {
  const list = h('div', 'list');
  visibleFiles().forEach((id) => {
    const f = FILES[id]; const t = state.tasks[id];
    const row = h('button', 'row file-row', h('span', 'file-type', f.name.split('.').pop().slice(0, 4).toUpperCase()), h('div', 'file-row-copy', h('div', 'name', f.name), h('div', 'sub', `${f.meta} · ${t.status}`)));
    row.type = 'button'; row.setAttribute('aria-current', String(ui.selectedFile === id));
    row.addEventListener('click', () => {
      ui.selectedFile = id;
      setMobileDetail('files', true);
      render();
    }); list.append(row);
  });
  const detail = h('div', 'detail file-body');
  const id = ui.selectedFile;
  if (!id || !FILES[id]) detail.append(h('div', 'empty', 'Select a file.'));
  else {
    const f = FILES[id]; const t = state.tasks[id];
    detail.append(h('h2', null, f.name), h('div', 'meta', `${f.meta} · ${t.status}`));
    if (id === 'rework' && t.kind === 'vendor') detail.append(h('p', null, 'Procurement found the 30% Halcyon increase after approval and wants an explanation.'));
    else if (id === 'rework' && t.kind === 'client') detail.append(h('p', null, 'The canned client reply did not hold. The issue escalated again.'));
    else f.body.forEach((p) => detail.append(h('p', null, p)));
    if (t.status === 'pending') {
      const actions = h('div', 'file-actions');
      TASK_OPTIONS[id].forEach(([approach, label]) => actions.append(btn(label, 'btn primary', () => dispatch({ do: 'task', id, approach }))));
      detail.append(actions);
    }
  }
  return windowShell('files', 'Files', h('div', 'body', list, detail));
}

function renderUtilities() {
  const cards = h('div', 'cards');
  cards.append(h('div', 'card', h('h3', null, 'Signal Trust'), h('p', null, state.narc.adaptation ? 'Focus Time · downgraded: repeated use now looks like possible gaming.' : 'Focus Time · currently trusted as context for quiet work.'), h('p', null, 'Visible activity · trusted as a proxy signal, not a direct measure of work quality.')));

  if (state.flags.keepaliveAvailable) {
    const keepalive = h('div', 'card sketchy', h('div', 'utility-kicker', 'UNVERIFIED TOOL'), h('h3', null, 'keepalive.pkg'));
    if (state.flags.keepaliveUsed) {
      keepalive.append(h('p', null, 'Running. Simulated input is being counted as visible workstation activity.'), h('div', 'status-on', 'ACTIVE'));
    } else {
      keepalive.append(h('p', null, 'Sent by Marcus. Simulates small input events so the workstation does not appear idle.'), btn('Install and run (5 min)', 'btn', () => dispatch({ do: 'keepalive' })));
    }
    cards.append(keepalive);
  } else {
    cards.append(h('div', 'card sketchy', h('div', 'utility-kicker', 'UNVERIFIED TOOLS'), h('h3', null, 'No utilities installed'), h('p', null, 'Nothing from coworkers has been installed on this workstation today.')));
  }
  return windowShell('utilities', 'Utilities', h('div', 'body', cards));
}

function renderBrowser() {
  const list = h('div', 'list browser-list');
  NEWS.forEach((article) => {
    const row = h('button', 'row browser-story',
      h('div', 'browser-source', article.source),
      h('div', 'name', article.title),
      h('div', 'sub browser-dek', article.dek)
    );
    row.type = 'button';
    row.setAttribute('aria-current', String(ui.selectedArticle === article.id));
    row.addEventListener('click', () => {
      ui.selectedArticle = article.id;
      setMobileDetail('browser', true);
      render();
    });
    list.append(row);
  });

  const selected = NEWS.find((article) => article.id === ui.selectedArticle);
  const detail = h('div', 'detail browser-page');
  if (!selected) {
    detail.append(
      h('div', 'browser-home-kicker', 'MERIDIAN START'),
      h('h2', null, 'Company network highlights'),
      h('p', 'browser-home-copy', 'Industry news and the occasional reminder that measuring work is easier than understanding it. Select a headline to read more.')
    );
  } else {
    detail.append(h('div', 'browser-home-kicker', selected.source), h('h2', null, selected.title), h('p', 'browser-article-dek', selected.dek));
    selected.body.forEach((p) => detail.append(h('p', 'browser-article-copy', p)));
  }

  const address = selected ? `meridian.start/read/${selected.id}` : 'meridian.start/';
  return windowShell('browser', 'Browser', h('div', 'browser-shell', h('div', 'browser-toolbar', h('div', 'browser-address', address)), h('div', 'body browser-body', list, detail)));
}

function renderNarc() {
  const body = h('div', 'body');
  const panel = h('div', 'narc-summary');
  const standingLabel = state.standing.status === 'trusted' ? 'TRUSTED OPERATOR' : state.standing.status === 'review' ? 'REVIEW OPEN' : 'STANDARD';
  panel.append(
    h('div', 'narc-kicker', 'NETWORKED ASSESSMENT & RISK COORDINATION'),
    h('h2', null, `VISIBLE ACTIVITY INDEX ${state.index}`),
    h('p', 'narc-copy', state.index >= 75 ? 'Exemplary engagement.' : state.index >= 50 ? 'Within normal range.' : 'Flagged for review.'),
    h('p', 'narc-explainer', 'Measures what NARC can observe, not the quality or value of your work.')
  );
  panel.append(h('div', `narc-standing narc-standing-${state.standing.status}`, h('span', null, 'EMPLOYEE STANDING'), h('b', null, standingLabel), h('p', null, state.standing.note)));
  if (state.narc.adaptation) {
    panel.append(h('div', 'narc-system-update',
      h('div', 'narc-update-kicker', 'NARC SYSTEM UPDATE · 2.0'),
      h('b', null, 'Focus Time weighting changed'),
      h('p', null, 'Repeated Focus Time usage was detected across Meridian. NARC now treats repeated Focus Time as possible activity manipulation rather than reliable context.')
    ));
  }
  panel.append(h('div', 'narc-rule', h('b', null, 'Current interpretation'), h('p', null, state.narc.adaptation ? 'Repeated recent Focus Time is now weighted as possible gaming.' : 'Quiet work may be read as inactivity unless other visible context is present.')));
  ['narcFirstReview', 'narcCheckpoint', 'narcResponse'].forEach((reqId) => {
    if (state.requests[reqId]?.status !== 'open') return;
    const title = reqId === 'narcCheckpoint' ? 'Midmorning assessment' : 'Response requested';
    const action = h('div', 'narc-action', h('div', 'narc-action-title', h('b', null, title)));
    if (reqId === 'narcCheckpoint') {
      const firstRead = state.flags.firstNarcReadType === 'low'
        ? 'First completed work block read as low-input activity'
        : state.flags.firstNarcReadType === 'visible'
        ? 'First completed work block read as high visible activity'
        : 'No clear first-work pattern on record';
      action.append(
        h('p', 'narc-action-copy', "NARC has formed a midmorning assessment of your activity. Add context or leave its interpretation unchanged."),
        h('div', 'narc-checkpoint-facts',
          h('div', null, h('span', null, 'Visible Activity Index'), h('b', null, state.index)),
          h('div', null, h('span', null, 'Observed pattern'), h('b', null, firstRead)),
          h('div', null, h('span', null, 'Context on record'), h('b', null, state.flags.firstNarcContext ? 'Yes' : 'No'))
        )
      );
    }
    const actions = h('div', 'narc-action-buttons');
    requestOptions(reqId).forEach(([choice, label]) => actions.append(btn(label, 'btn', () => dispatch({ do: 'respond', id: reqId, choice }))));
    action.append(actions);
    panel.append(action);
  });
  const log = h('div', 'narc-log', h('h3', null, 'Recent NARC reads'));
  state.log.filter((e) => e.kind === 'narc' || e.kind === 'consequence').slice().reverse().slice(0, 8).forEach((e) => log.append(h('div', 'narc-log-row', h('span', null, clock(e.t)), h('span', null, e.text))));
  if (log.childNodes.length === 1) log.append(h('p', 'narc-copy', 'No interventions yet.'));
  body.append(panel, log);
  return windowShell('narc', 'NARC', body);
}

function renderQuietAction() {
  const old = root.querySelector('.quiet-card');
  if (old) old.remove();
  const nothingOpen = Object.values(state.tasks).every((t) => t.status !== 'pending') && Object.values(state.requests).every((r) => r.status !== 'open');
  if (!nothingOpen || state.phase === 'end' || !ui.oriented) return;
  const next = nextEvent(state);
  const used = state.flags.workUntilUses || 0;
  const label = next.t >= 17 * 60 ? 'Finish the workday' : used >= 2 ? 'Continue background work' : `Work until ${clock(next.t)}`;
  const title = used >= 2 ? 'Quiet stretch' : 'Nothing urgent right now';
  const card = h('div', 'quiet-card', h('div', null, h('b', null, title), h('span', null, used >= 2 ? 'You can also poke around Messages, Browser, or Utilities.' : `Next: ${clock(next.t)} · ${next.label}`)), btn(label, 'btn primary', () => dispatch({ do: 'workUntil' })));
  root.append(card);
}

function renderEnd() {
  if (state.phase !== 'end') { els.modal.replaceChildren(); return; }
  const e = ending(state);
  const shade = h('div', 'modal-shade');
  const box = h('div', 'modal-card end-day');
  const endTitle = state.flags.loggedOffEarly ? `You logged off at ${clock(state.t)}.` : 'You made it to 5:00.';
  box.append(h('div', 'loop-kicker', 'MERIDIAN · END OF DAY'), h('h2', null, endTitle));
  e.lines.forEach((line) => box.append(h('p', null, line)));
  box.append(btn('Play again', 'btn primary', restart));
  shade.append(box); els.modal.replaceChildren(shade);
}

function render() {
  renderChrome(); renderWindows(); renderEnd(); renderQuietAction(); renderNotificationCenter();
}

render();
