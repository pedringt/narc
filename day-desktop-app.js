import { newGame, act, ending, clock, chatOptions, requestChoices, handoffRisks, fileVisible, PAGE_COUNTS, KEY_PAGE, START } from './day.js';

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
  danaMorning: 'dana', priyaDraft: 'priya', luisCover: 'luis', marcusCredit: 'marcus', luisTip: 'luis', marcusFavor: 'marcus', danaCheckin: 'dana', marcusFallout: 'marcus',
  priyaDraft2: 'priya', marcusLoop: 'marcus',
};

// NARC's own requests, answered in the NARC app rather than in Messages.
const NARC_REQUESTS = ['narcFirstReview', 'narcCheckpoint', 'priyaCase', 'luisCase', 'marcusCase', 'narcResponse', 'luisCalendar'];

// Request choices are the employee's own lines, with no minute costs: the
// clock and the meter say what something cost (REDESIGN_SPEC Change 5).
// The engine decides which of these are available right now.
const REQUEST_OPTIONS = {
  luisTip: [['thank', 'Say thanks'], ['ignore', 'Say nothing']],
  priyaDraft: [['help', 'Send it over.'], ['later', 'Can’t right now, send it as is.'], ['deflect', 'Send it. I’ll read it after.']],
  priyaDraft2: [['read', 'Send it over.'], ['skip', 'Send it, it’s fine.']],
  luisCover: [['cover', 'Done.'], ['decline', 'I’m not putting a fake meeting on the calendar.'], ['deflect', 'Just mark it Focus Time yourself.']],
  marcusCredit: [['share', 'Put both names on it'], ['own', 'Name only the real owner']],
  marcusFavor: [['help', 'Pull it up.'], ['decline', 'Not today.'], ['deflect', 'Send me the doc, I’ll look when I can.']],
  marcusLoop: [['join', 'Joining now.'], ['skip', 'Can’t, I’m buried. You’ve got this.']],
  danaCheckin: [['update', 'Here’s where everything actually is.'], ['brief', 'Mostly on track.'], ['trustNarc', 'NARC’s summary is accurate.'], ['review', 'Okay. Let’s go through it.']],
  marcusFallout: [['apologize', 'Walk him through it'], ['standby', 'Stand by the call']],
  priyaCase: [['context', "Explain Priya's message volume"], ['quiet', 'Suggest she post less'], ['report', 'Confirm the flag without explanation']],
  luisCase: [['context', "Explain Luis's away time"], ['blame', 'Say Luis is probably gaming it'], ['leave', 'Do not intervene']],
  marcusCase: [['evidence', 'Add the transit evidence'], ['confirm', 'Confirm he was late'], ['leave', 'Do not intervene']],
  narcResponse: [['explain', 'Explain why Focus Time spread'], ['ignore', 'Leave the gaming flag unanswered']],
  narcFirstReview: [['context', 'Attach as context'], ['accept', 'Acknowledge']],
  luisCalendar: [['explain', 'Explain the meeting'], ['stand', 'Let the entry stand']],
};

function requestOptions(id) {
  let options = REQUEST_OPTIONS[id] || [];
  if (id === 'danaMorning') {
    if (state.flags.firstNarcReadType === 'low') options = [['context', 'Tell Dana I was carefully reviewing the file'], ['skip', "Leave NARC's read as-is"]];
    else if (state.flags.firstNarcReadType === 'visible') options = [['context', 'Tell Dana the fast result hid rushed work'], ['skip', "Leave NARC's read as-is"]];
    else options = [['context', 'Tell Dana what the score missed'], ['skip', "Leave NARC's read as-is"]];
  }
  if (id === 'narcCheckpoint') {
    options = state.flags.firstNarcReadType === 'low'
      ? [['context', 'Explain the quiet work NARC missed'], ['ignore', "Leave NARC's assessment unchanged"]]
      : [['context', 'Explain what the activity score missed'], ['ignore', "Leave NARC's assessment unchanged"]];
  }
  const allowed = requestChoices(state, id);
  return options.filter(([choice]) => allowed.includes(choice));
}

function standingName(status, fallback) {
  return { trusted: 'Trusted Operator', review: 'Review open', flagged: 'Synthetic activity flag' }[status] || fallback;
}

function activityBand(index = state.index) {
  if (index >= 75) return { key: 'high', label: 'High visible activity', range: '75–100' };
  if (index >= 50) return { key: 'normal', label: 'Normal visible activity', range: '50–74' };
  return { key: 'low', label: 'Low visible activity', range: '0–49' };
}

function narcRisk(s = state) {
  let value = 18;
  if (s.index < 50) value += 18;
  if (s.index < 40) value += 12;
  if (s.standing.status === 'review') value += 35;
  if (s.standing.status === 'flagged') value += 30;
  if (s.standing.status === 'trusted') value -= 8;
  const openNarc = NARC_REQUESTS.filter((id) => s.requests[id]?.status === 'open').length;
  value += openNarc * 18;
  if (s.narc.adaptation) value += 8;
  value = Math.max(5, Math.min(95, value));

  if (value >= 80) return { value, key: 'critical', label: 'CRITICAL', copy: 'Action against your account is pending or in progress.' };
  if (value >= 60) return { value, key: 'risk', label: 'AT RISK', copy: 'An open item could change your standing.' };
  if (value >= 35) return { value, key: 'watching', label: 'WATCHING', copy: 'An item is under evaluation or awaiting your response.' };
  return { value, key: 'normal', label: 'NORMAL', copy: 'No open items.' };
}

function narcAssessment(id) {
  const activity = activityBand();
  if (id === 'narcFirstReview' && state.flags.firstNarcReadType === 'visible') {
    return {
      title: 'First work assessment',
      signal: 'First completed task: high input rate, rapid window switching, task closed within 5 minutes.',
      inference: 'Consistent with engaged work behavior.',
      missing: 'Document contents. Decision quality.',
      consequence: 'Uncorrected, this read is eligible for Trusted Operator recognition.',
      action: 'Correct the read, or acknowledge it.',
    };
  }
  if (id === 'narcFirstReview') {
    return {
      title: 'First work assessment',
      signal: 'First completed task: sustained low input during document work.',
      inference: 'Consistent with disengagement.',
      missing: 'What was on screen. Whether the document was read.',
      consequence: 'Uncorrected, this read opens a review.',
      action: 'Attach what you were reading, or acknowledge the read.',
    };
  }
  if (id === 'luisCalendar') {
    return {
      title: 'Calendar integrity check',
      signal: '“Vendor meeting” for Luis Perez, 1:50–3:00. No invite, no attendees, no notes. Created from your account.',
      inference: 'Consistent with presence padding.',
      missing: 'Why the entry exists.',
      consequence: 'Unexplained, the entry stays on your record as unverified activity.',
      action: 'Explain what the meeting was, or let the entry stand.',
    };
  }
  if (id === 'narcCheckpoint') {
    return {
      title: 'Midmorning assessment',
      signal: state.flags.firstNarcReadType === 'low' ? 'Your first work block was low-input and the current activity record is mixed.' : 'Your first work block was highly visible and the current activity record is mixed.',
      inference: state.flags.firstNarcReadType === 'low' ? 'NARC still treats the activity gap as possible disengagement.' : 'NARC continues to treat visible activity as evidence of healthy work behavior.',
      missing: 'Document contents. Call and meeting content.',
      consequence: state.flags.formalReview ? 'A review is open. Context submitted here is attached to it.' : 'This read stays on the record.',
      action: 'Submit context, or leave the read as is.',
    };
  }
  if (id === 'priyaCase') {
    return {
      title: 'Priya Shah · Communication Load review',
      signal: 'Priya Shah: 52 message threads this week. Team median: 14.',
      inference: 'Consistent with inefficient coordination.',
      missing: 'Thread contents. Which threads are client work.',
      consequence: 'Without context, the count is sufficient for an employment recommendation.',
      action: 'Add context, advise Priya to reduce volume, or confirm the flag.',
    };
  }
  if (id === 'luisCase') {
    return {
      title: 'Luis Perez · Presence Irregularity review',
      signal: 'Luis Perez: 4 low-input gaps today, 6–71 minutes each.',
      inference: 'Consistent with inconsistent presence or activity manipulation.',
      missing: 'Phone activity. Paper work. Where he was.',
      consequence: 'Without context, the review proceeds to warning or termination.',
      action: 'Add context, endorse the gaming read, or stay out.',
    };
  }
  if (id === 'marcusCase') {
    return {
      title: 'Marcus Reed · Attendance Integrity review',
      signal: 'Marcus Reed: late arrival 9:09. Pattern: 4 of the last 5 days.',
      inference: 'Today’s delay is consistent with the pattern.',
      missing: 'Cause of today’s delay.',
      consequence: 'Without new evidence, the pattern is the finding.',
      action: 'Attach evidence, confirm the late arrival, or stay out.',
    };
  }
  if (id === 'narcResponse') {
    return {
      title: 'NARC 2.0 response requested',
      signal: 'Focus Time blocks across the team: up 4x this week.',
      inference: 'Consistent with coordinated metric manipulation.',
      missing: 'What happened during any individual block.',
      consequence: 'Focus Time is no longer accepted as context. Existing blocks are reweighted.',
      action: 'Explain the pattern, or leave the flag unanswered.',
    };
  }
  return {
    title: 'Current assessment',
    signal: `Visible Activity is ${state.index}/100, which NARC classifies as ${activity.label.toLowerCase()}.`,
    inference: state.narc.adaptation ? 'Repeated Focus Time is weighted as possible manipulation.' : 'Within expected range for your role.',
    missing: 'Document contents. Call content. Work quality.',
    consequence: state.standing.status === 'trusted' ? 'Your standing is Trusted Operator.' : state.standing.status === 'review' ? 'An employee review is open.' : 'Your standing is Standard.',
    action: 'No response required.',
  };
}

// The two lines Visible Activity can cross (REDESIGN_SPEC Change 1): a red
// review line at 50, and once NARC 2.0 is live an amber synthetic-activity
// line at 90.
function activityMeter() {
  const track = h('div', 'narc-va-track', h('span', 'narc-va-fill'));
  track.querySelector('.narc-va-fill').style.width = `${state.index}%`;
  const tick = (at, cls, label) => {
    const t = h('span', `narc-va-tick ${cls}`, h('span', 'narc-va-tick-label', label));
    t.style.left = `${at}%`;
    return t;
  };
  track.append(tick(50, 'tick-review', 'Review'));
  if (state.narc.adaptation) track.append(tick(90, 'tick-synthetic', 'Synthetic'));
  return track;
}

function narcEventType(entry) {
  if (/NARC 2\.0|system update|Focus Time/i.test(entry.text)) return 'SYSTEM UPDATE';
  if (/Synthetic Activity flag/i.test(entry.text)) return 'REVIEW';
  if (/Trusted Operator|Recognition/i.test(entry.text)) return 'RECOGNITION';
  if (/review|flagged for review/i.test(entry.text)) return 'REVIEW';
  if (entry.kind === 'consequence') return 'CONSEQUENCE';
  return 'OBSERVATION';
}

// The rework follow-up has no document to read, so it keeps two choices;
// every other task is one unlabeled decision on the document itself.
const REWORK_OPTIONS = [['quiet', 'Fix it yourself'], ['escalate', 'Tell Dana']];

// Task documents (REDESIGN_SPEC Change 3). Each page is { title, lines },
// where a line is a paragraph string or a [label, value] table row. The
// problem in each one sits on a specific page, never page one, and nothing
// on the page points at it. Page counts must match PAGE_COUNTS in day.js.
const FILES = {
  vendor: {
    name: 'Halcyon_Vendor_Renewal.pdf', meta: 'Procurement · renewal due 10:30 AM', decision: 'Approve',
    pages: [
      { title: 'Cover letter', lines: [
        'Halcyon Freight Services · 1180 Commerce Way, Suite 400 · Sparks, NV',
        'To: Procurement, Meridian Supply Co.',
        'Re: Renewal of Master Services Agreement MSA-2291',
        'Thank you for another year of partnership. Your account team has enjoyed supporting Meridian’s growth across the Western region, and we are pleased to enclose the renewal of your Master Services Agreement for the coming term.',
        'This renewal carries forward your current service levels and contacts with no changes to commercial terms. Sections 2 through 4 restate the agreement in our updated template for your records.',
        'Please return the signed signature page by 10:30 AM today. Agreements not returned by the renewal deadline continue automatically on the terms enclosed.',
        'Warm regards,\nJanelle Ruiz, Senior Account Manager',
      ] },
      { title: 'Section 2 · Service summary', lines: [
        ['Facilities', 'Sparks DC (primary), Stockton overflow'],
        ['Services', 'Pallet storage, pick and pack, LTL consolidation, cross-dock'],
        ['Inbound receiving', 'Mon–Sat, 6:00 AM–4:00 PM'],
        ['Outbound cutoff', '2:00 PM local for same-day LTL tender'],
        ['Inventory reporting', 'Daily snapshot by 7:00 AM via client portal'],
        ['Primary contact', 'Janelle Ruiz · escalations to Regional Ops Director'],
        'Volumes assume an average of 1,850 pallet positions per week with seasonal peaks of up to 2,400 between October and December. Peak capacity is reserved on a first-committed basis.',
      ] },
      { title: 'Section 3 · Service levels', lines: [
        ['On-time pickup', '97.0% of scheduled tenders'],
        ['Order accuracy', '99.5% of lines shipped'],
        ['Inventory accuracy', '99.0% at quarterly cycle count'],
        ['Damage claims', 'Acknowledged in 2 business days, resolved in 10'],
        ['Service credit', '2% of monthly storage fees per missed metric, capped at 8%'],
        'Service levels are measured monthly and reported in the client portal. Credits are applied to the following month’s invoice and are the client’s sole remedy for a missed metric.',
      ] },
      { title: 'Section 4 · Commercial terms', lines: [
        ['Unit rate (per pallet position, weekly)', '$18.20 (prior: $14.00)'],
        ['Handling, in and out (per pallet)', '$6.75 (prior: $6.75)'],
        ['Pick and pack (per order line)', '$0.42 (prior: $0.42)'],
        ['Fuel surcharge', 'DOE diesel index, adjusted weekly (unchanged)'],
        ['Minimum monthly billing', '$24,000 (prior: $24,000)'],
        ['Payment terms', 'Net 30 (unchanged)'],
        ['Term', '12 months from signature; renews annually unless either party gives 60 days’ notice'],
        'Rates are fixed for the term except the fuel surcharge. Accessorial charges not listed are billed at Halcyon’s published tariff.',
      ] },
      { title: 'Section 5 · Signature page', lines: [
        'By signing below, Customer accepts the services, service levels and commercial terms set out in Sections 2 through 4, which supersede any prior schedule.',
        ['For Halcyon Freight Services', 'Janelle Ruiz, Senior Account Manager'],
        ['For Meridian Supply Co.', '_________________________ (Procurement approver)'],
        ['Date', '_________________________'],
      ] },
    ],
  },
  client: {
    name: 'Priya_Client_Escalation.txt', meta: 'Client Operations · response due 11:00 AM', decision: 'Reply',
    pages: [
      { title: 'Thread · PO 44817 delivery refused', lines: [
        'Export: Priya Shah · 52 threads this week · 31 tagged client:',
        'From: Rosa Delgado, Receiving Manager, Brightline Home Goods\nTo: Priya Shah\nSubject: RE: RE: PO 44817 delivery refused at dock',
        'Priya, this is the second load this month our team has had to turn away. The truck arrived at 7:40 with the whole order floor-loaded in loose cartons. We can’t receive that. The driver waited an hour and left.',
        'We are now out of stock on two of the SKUs on that PO at three stores. I need to know what happened and what you are going to do differently, not another apology. I have to explain this to our VP of Supply Chain by end of day.',
        'Rosa',
        '> On Tuesday, Priya Shah wrote:\n> Hi Rosa, so sorry about the delay. Looking into it now and will update you shortly.',
      ] },
      { title: 'Shipment record · PO 44817', lines: [
        ['Ship to', 'Brightline Home Goods DC, 4400 Mill Rd, Reno NV'],
        ['Ship date', 'Monday, 3:15 PM'],
        ['Carrier', 'Desert Line LTL · PRO 7731940'],
        ['Contents', '412 cartons, 6 SKUs'],
        ['Packaging', 'Cartons, floor-loaded'],
        ['Special instructions', 'None on ship profile'],
        ['Delivery attempt', 'Wednesday 7:40 AM · refused by consignee'],
        ['Status', 'Returned to origin · re-delivery not scheduled'],
      ] },
      { title: 'Account notes · Brightline Home Goods', lines: [
        ['Oct 2', 'Quarterly review with R. Delgado. Happy with fill rate. Wants earlier ASN emails. (P. Shah)'],
        ['Sep 18', 'Brightline moves receiving to the new Reno DC from Oct 1. New dock takes palletized freight only, no floor-loaded cartons. Asked us to update their ship profile before the first October order. (K. Moore)'],
        ['Sep 18', 'Ship profile change ticket #8812 opened, assigned to Fulfillment Ops queue. (K. Moore)'],
        ['Aug 30', 'Invoice dispute on July freight resolved, credit memo issued. (P. Shah)'],
        ['Aug 4', 'Contact change: Rosa Delgado replaces T. Hall as receiving lead. (P. Shah)'],
      ] },
      { title: 'Draft reply · Priya Shah', lines: [
        'Hi Rosa,',
        'Thank you for your patience, and I’m very sorry for the trouble with PO 44817. It looks like the carrier ran into delays on this lane, and we know how disruptive that is for your stores.',
        'As a gesture of goodwill we’d like to offer a 10% credit on this shipment, and we’ll keep a close eye on Desert Line’s performance going forward.',
        'Please let me know if there is anything else I can do.',
        'Best,\nPriya',
      ] },
    ],
  },
  project: {
    name: 'Marcus_Project_Scope.doc', meta: 'Project Delivery · decision due 11:30 AM', decision: 'Submit',
    pages: [
      { title: 'Harbor Point portal rollout · revised timeline', lines: [
        'Harbor Point Distributors has moved go-live from November 14 to November 4 so the portal is live before their holiday freeze.',
        'At current velocity that leaves about 30% of remaining scope unbuilt. Something comes out of this release; it can go into the December patch.',
        ['Today 11:30 AM', 'Cut list due to engineering'],
        ['Oct 28', 'Code freeze'],
        ['Oct 31', 'Client acceptance testing'],
        ['Nov 4', 'Go-live'],
      ] },
      { title: 'Remaining features', lines: [
        ['Dashboard polish', 'Branded theme, chart animations, export to PDF · 6 days'],
        ['Account handoff export', 'Account history and open issues, sent to Client Success · 5 days'],
        ['Bulk shipment upload', 'CSV import for more than 50 orders · 4 days'],
        ['Delivery notifications', 'Email and SMS on status change · 3 days'],
        'Draft cut list (auto-generated by effort): Account handoff export, Delivery notifications. Saves 8 days.',
      ] },
      { title: 'Dependency map', lines: [
        ['Dashboard polish', 'No downstream dependents'],
        ['Account handoff export', 'Client Success onboarding call (Nov 5), Support macro set, Q1 renewal forecast'],
        ['Bulk shipment upload', 'Harbor Point peak-week ordering (they place ~300 orders on Nov 10)'],
        ['Delivery notifications', 'None in this release'],
        'Items with downstream dependents should not be cut without a replacement plan from the owning team.',
      ] },
      { title: 'Marcus’s notes', lines: [
        'Harbor Point’s ops lead cares about two things: getting peak orders in without retyping them, and not being asked the same questions twice by a new team.',
        'Their CFO saw the polished dashboard mockups in the pitch. Nobody on their ops side has mentioned them since.',
        'I can cover the gap on notifications with a daily email from my side for a month if needed. — M.',
      ] },
    ],
  },
  rework: {
    name: 'FOLLOW_UP_REQUIRED.txt', meta: 'Generated from an earlier decision',
    pages: [{ title: 'Follow-up', lines: [] }],
  },
  audit: {
    name: 'Carrier_Exception_Queue.csv', meta: 'Operations · cutoff 1:30 PM', decision: 'Submit',
    pages: [
      { title: 'Exception 1 of 3', lines: [
        ['shipment_id', 'SHP-220914'],
        ['dest_zip', '97301'],
        ['service', 'LTL'],
        ['status', 'HOLD_MANUAL_REVIEW'],
        ['held_since', 'Today 6:02 AM'],
        ['notes', 'Address validated. Carrier available. No reason code on hold. Release manually.'],
      ] },
      { title: 'Exception 2 of 3', lines: [
        ['shipment_id', 'SHP-220951'],
        ['dest_zip', '97305'],
        ['service', 'LTL'],
        ['status', 'HOLD_MANUAL_REVIEW'],
        ['held_since', 'Today 6:02 AM'],
        ['notes', 'Same as last week’s Salem holds. Released manually Thu and Fri. Customer asking why Salem is always late.'],
      ] },
      { title: 'Exception 3 of 3', lines: [
        ['shipment_id', 'SHP-221006'],
        ['dest_zip', '97317'],
        ['service', 'LTL'],
        ['status', 'HOLD_MANUAL_REVIEW'],
        ['held_since', 'Today 6:02 AM'],
        ['notes', 'Hold source: routing rule RR-0457, created 2025-08-19 by j.tan. Condition: dest_zip 973* AND service = LTL → hold for manual review. Comment on rule: “temporary, Salem terminal closed for remodel.”'],
      ] },
    ],
  },
  handoff: {
    name: 'Client_Handoff_Notes.doc', meta: 'Client Operations · due 3:00 PM', decision: 'Send',
    pages: [
      { title: 'Today’s activity log', lines: [] },
      { title: 'Open risks', lines: [] },
      { title: 'Client context', lines: [
        'Brightline Home Goods is our largest home-goods account in the region and moved receiving to a new Reno DC this month. Rosa Delgado is the day-to-day contact; she prefers phone for anything urgent.',
        'Halcyon Freight Services runs our Sparks storage and LTL consolidation. Procurement owns the contract; Ops owns the relationship.',
        'Harbor Point Distributors goes live on the new carrier portal on November 4. Marcus Reed is account lead.',
        'Tomorrow’s team starts at 8:00 AM and will read this before the 8:30 stand-up.',
      ] },
    ],
  },
  marcusDoc: {
    name: 'Marcus_Client_Deck_Notes.doc', meta: 'From Marcus Reed · no deadline',
    pages: [
      { title: 'Talking points · Harbor Point check-in', lines: [
        'Open with the timeline: we hit November 4, and here is exactly what’s in the release.',
        'Pricing stays where we quoted it in September: flat per-seat, no implementation fee, first 60 days of support included.',
        'Ask about their peak week ordering and who on their side owns the bulk upload.',
      ] },
      { title: 'Slides 6–9', lines: [
        ['Slide 6', 'Release scope and what moves to December'],
        ['Slide 7', 'Pricing: per-seat plus a one-time $4,500 implementation fee'],
        ['Slide 8', 'Support model and escalation path'],
        ['Slide 9', 'Next steps and owners'],
      ] },
    ],
  },
};

const EMAILS = [
  {
    id: 'welcome', from: 'People Operations', subject: 'Welcome to NARC Workforce Support',
    body: [
      'Good morning, Employee 4417.',
      "As of this week, Meridian uses NARC (Networked Assessment & Risk Coordination) to support workforce planning. NARC reviews workstation activity, response patterns, calendar signals, and related metadata.",
      "No action is required on your part. Continue working normally.",
      'You have three responsibilities waiting this morning. The Loop will point you toward them.',
    ],
  },
  {
    id: 'policy', from: 'IT + People Operations', subject: 'Monitoring notice: activity signals',
    body: ['Your Visible Activity Index is available in the NARC app. It is updated every 30 minutes from workstation signals.', 'Assessments may be updated as NARC is improved. Questions should be directed to People Operations.'],
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

const COMPOSE_EMAIL = {
  id: 'compose', from: 'You', subject: 'Compose work email',
  body: ['Send a useful work email. Each option spends in-game time and can change what happens next.'],
};

const SURVEY_EMAIL = {
  id: 'survey', from: 'People Operations', subject: 'Quarterly employee pulse survey',
  body: [
    'The quarterly employee pulse survey is now open.',
    'Responses are described as confidential and will be reviewed in aggregate.',
    'Please submit by end of week. Participation is optional.',
  ],
};

const NARC2_EMAIL = {
  id: 'narc2', from: 'People Operations', subject: 'NARC 2.0: new capabilities',
  body: [
    'NARC has been updated effective immediately.',
    'Behavioral Deviation Detection now compares employees against learned patterns of what is normal for them. Synthetic Activity Identification looks for repeated or mechanically regular input.',
    'Repeated Focus Time is no longer trusted as context by default. A workaround that becomes common can become a new signal for gaming.',
    'Employees are encouraged to continue working normally.',
  ],
};

function currentEmails() {
  const out = [...EMAILS];
  if (ui.oriented) out.unshift(COMPOSE_EMAIL);
  if (state.flags.cultureEmailAvailable) out.unshift(CULTURE_EMAIL);
  if (state.flags.surveyEmailAvailable) out.unshift(SURVEY_EMAIL);
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
  { target: 'intranet', text: 'Dana here. Welcome to ops. The Loop is where your work shows up. Leadership is piloting NARC this quarter; it watches what you do on the laptop and writes it up. Start with The Loop.', label: 'Open The Loop' },
  { target: 'files', text: 'Files next. That’s where the actual work is. Heads up: reading looks like nothing to NARC.', label: 'Open Files' },
  { target: 'calendar', text: 'Calendar. NARC reads it. Luis will tell you what that means.', label: 'Open Calendar' },
  { target: 'narc', text: 'Open NARC and see what it has on you so far. It’s usually not nothing.', label: 'Open NARC' },
  { target: 'intranet', text: 'That’s enough tour. Three things are waiting in The Loop. Pick one.', label: 'Go to The Loop', final: true },
];

let state = newGame();
let ui = freshUi();
let toastTimer = null;
let tutorialTimer = null;

function freshUi() {
  return {
    oriented: false, tutorialStep: -1, tutorialDone: false, tutorialUnread: false, tutorialVisited: {}, app: 'email', openApps: ['email'], selectedEmail: 'welcome',
    selectedFile: null, filePage: {}, handoffChecked: {}, selectedThread: null, selectedArticle: null, mobileDetail: { email: true, messages: false, files: false, browser: false }, positions: {}, notifications: [], notificationCenterOpen: false, nextNotificationId: 1,
    typingThreads: {}, scrollThreadToBottom: null,
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
    <div class="right"><span class="clock" id="clock"></span><button class="notifications-button" id="notificationsBtn" type="button">Notifications<span class="notifications-count" id="notificationsCount"></span></button><button class="logoff" id="logoff" type="button">Log off</button><button class="tray narc-tray-status risk-normal" id="tray" type="button"><span class="dot"></span><span id="trayText"><span class="full">NARC · NORMAL</span><span class="short">NARC</span></span><span class="narc-tray-meter" aria-hidden="true"><span id="narcTrayFill"></span></span></button></div>
  </header>
  <div class="wallpaper-art" aria-hidden="true"><span class="wall-ring ring-a"></span><span class="wall-ring ring-b"></span><span class="wall-ribbon ribbon-a"></span><span class="wall-ribbon ribbon-b"></span><span class="wall-brand">MERIDIAN / FIELD SYSTEMS</span></div>
  <div class="stage"><nav class="dock" id="dock" aria-label="Apps"></nav><main class="workarea"><div class="window-stack" id="windows"></div></main></div>
  <div class="toasts" id="toasts" aria-live="polite"></div><aside class="notification-center" id="notificationCenter" hidden></aside><div id="modal"></div>`;

const els = {
  clock: root.querySelector('#clock'), logoff: root.querySelector('#logoff'), tray: root.querySelector('#tray'),
  notificationsBtn: root.querySelector('#notificationsBtn'), notificationsCount: root.querySelector('#notificationsCount'), notificationCenter: root.querySelector('#notificationCenter'),
  trayText: root.querySelector('#trayText'), narcTrayFill: root.querySelector('#narcTrayFill'), dock: root.querySelector('#dock'), windows: root.querySelector('#windows'),
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
  if (ui.tutorialStep < 0 || ui.tutorialDone) return;
  ui.tutorialVisited[id] = true;

  let advanced = false;
  while (!ui.tutorialDone) {
    const step = TUTORIAL_STEPS[ui.tutorialStep];
    if (!step || !ui.tutorialVisited[step.target]) break;
    if (step.final) {
      ui.tutorialDone = true;
      ui.tutorialUnread = false;
      break;
    }
    ui.tutorialStep += 1;
    advanced = true;
  }

  if (!ui.tutorialDone && advanced) {
    ui.tutorialUnread = true;
    clearTimeout(tutorialTimer);
    tutorialTimer = setTimeout(() => {
      const step = TUTORIAL_STEPS[ui.tutorialStep];
      if (!step || ui.tutorialDone) return;
      render();
      showToast('Dana Whitfield', step.text, 'messages', { thread: 'dana', tutorial: true });
    }, 250);
  }
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
  ui.scrollThreadToBottom = thread;
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
  const thread = action.do === 'respond' ? REQUEST_THREAD[action.id] : null;
  if (thread) ui.scrollThreadToBottom = thread;
  announceChanges(before, state);
  render();
}

function sendChat(who, topic) {
  const before = state;
  state = act(state, { do: 'chat', who, topic });
  const pending = state.pendingReplies[topic];
  ui.typingThreads[who] = true;
  ui.scrollThreadToBottom = who;
  announceChanges(before, state);
  render();

  if (!pending) return;
  const delay = Math.min(2500, 800 + pending.text.length * 10);
  setTimeout(() => {
    const beforeReply = state;
    state = act(state, { do: 'deliverChat', topic });
    delete ui.typingThreads[who];
    ui.scrollThreadToBottom = who;
    announceChanges(beforeReply, state);
    render();
  }, delay);
}

function announceChanges(before, after) {
  const newEntries = after.log.slice(before.log.length);
  if (after.tasks.rework.status === 'pending' && before.tasks.rework.status !== 'pending') {
    showToast('Files', 'A morning shortcut just came back as a new file.', 'files');
  }
  if (after.tasks.audit.status === 'pending' && before.tasks.audit.status !== 'pending') {
    showToast('The Loop', 'New task: clear the carrier exception queue by 1:30 PM.', 'intranet');
  }
  if (after.tasks.handoff.status === 'pending' && before.tasks.handoff.status !== 'pending') {
    showToast('Dana Whitfield', 'New task: prepare the client handoff by 3:00 PM.', 'intranet');
  }
  if (after.flags.surveyEmailAvailable && !before.flags.surveyEmailAvailable) {
    setTimeout(() => showToast('People Operations', 'Quarterly employee pulse survey is open.', 'email', { email: 'survey' }), 500);
  }
  if (after.flags.cultureEmailAvailable && !before.flags.cultureEmailAvailable) {
    setTimeout(() => showToast('Culture Team', 'Culture Champion nominations are open. One nomination can protect a coworker from an automatic NARC action.', 'email', { email: 'culture' }), 700);
  }
  if (after.narc.adaptation && !before.narc.adaptation) {
    showToast('NARC SYSTEM UPDATE', 'Repeated Focus Time usage detected across Meridian. NARC 2.0 now treats repeated Focus Time as possible activity manipulation.', 'narc');
    setTimeout(() => showToast('People Operations', 'NARC 2.0: new capabilities. Focus Time weighting has changed.', 'email', { email: 'narc2' }), 1200);
  } else {
    const newNarc = newEntries.find((e) => e.kind === 'narc');
    if (newNarc) {
      const risk = narcRisk(after);
      const actionRequired = NARC_REQUESTS.some((id) => after.requests[id]?.status === 'open');
      showToast(`NARC · ${risk.label}`, actionRequired ? `Action required. ${newNarc.text}` : newNarc.text, 'narc', { t: newNarc.t });
    }
  }
  newEntries.filter((e) => e.kind === 'message' && e.from !== 'me').forEach((e) => {
    showToast(THREADS[e.who]?.name || 'Messages', e.text, 'messages', { thread: e.who, t: e.t });
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
  // Newest first by the minute each beat happened, not by delivery order.
  ui.notifications.map((item, i) => [item, i]).sort((a, b) => (b[0].t - a[0].t) || (b[1] - a[1])).map(([item]) => item).forEach((item) => {
    const row = btn('', `notification-item${item.read ? '' : ' unread'}`, () => openNotification(item));
    row.append(h('div', 'notification-meta', h('div', 'notification-source', item.read ? null : h('span', 'unread-dot'), h('b', null, item.source)), h('span', null, clock(item.t))), h('div', 'notification-preview', item.text));
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
    // A beat that fired partway through a long action carries its own
    // minute from the engine log; the clock at delivery is only a fallback.
    t: meta.t ?? state.t,
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
  const risk = narcRisk();
  els.tray.classList.toggle('enhanced', state.narc.adaptation);
  ['normal', 'watching', 'risk', 'critical'].forEach((key) => els.tray.classList.toggle(`risk-${key}`, risk.key === key));
  els.trayText.querySelector('.full').textContent = `${state.narc.adaptation ? 'NARC 2.0' : 'NARC'} · ${risk.label}`;
  els.trayText.querySelector('.short').textContent = risk.label;
  els.narcTrayFill.style.width = `${risk.value}%`;
  els.tray.setAttribute('aria-label', `NARC status ${risk.label}. Open details.`);

  const openReq = Object.entries(state.requests).filter(([id, r]) => r.status === 'open' && REQUEST_THREAD[id]).length;
  const unreadMessages = ui.notifications.filter((n) => !n.read && n.app === 'messages').length;
  const pendingTasks = Object.values(state.tasks).filter((t) => t.status === 'pending').length;
  const visibleApps = ui.oriented ? APPS : APPS.filter(([id]) => id === 'email' || id === 'intranet');
  els.dock.replaceChildren(...visibleApps.map(([id, label]) => {
    const b = h('button', `dock-app dock-app-${id}${id === 'narc' ? ' narc' : ''}`, h('span', 'dock-icon'), label);
    b.firstChild.innerHTML = ICON[id];
    b.type = 'button';
    b.setAttribute('aria-current', String(ui.app === id));
    b.classList.toggle('is-open', ui.openApps.includes(id));
    const narcOpen = NARC_REQUESTS.filter((rid) => state.requests[rid]?.status === 'open').length;
    const count = id === 'messages' ? Math.max(openReq, unreadMessages) + (ui.tutorialUnread ? 1 : 0) : id === 'files' ? pendingTasks : id === 'narc' ? narcOpen : 0;
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
  if (m.id === 'compose') {
    const actions = h('div', 'mail-form', h('b', null, 'Choose a message'));
    if (!state.outbound.statusDana) actions.append(btn('Send Dana a real status update (5 min)', 'btn', () => dispatch({ do: 'emailAction', id: 'statusDana' })));
    if (state.tasks.vendor.status === 'pending' && !state.outbound.procurementExtension) actions.append(btn('Ask Procurement for 20 more minutes (4 min)', 'btn', () => dispatch({ do: 'emailAction', id: 'procurementExtension' })));
    if (state.tasks.client.status === 'pending' && !state.outbound.clientForward && (state.pages.client || 1) >= KEY_PAGE.client) actions.append(btn('Forward Priya the account-note excerpt (4 min)', 'btn', () => dispatch({ do: 'emailAction', id: 'clientForward' })));
    if (actions.childNodes.length > 1) detail.append(actions);
    else detail.append(h('div', 'mail-form-result', 'No useful outbound emails are available right now.'));
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
    h('p', null, 'Tasks, people, files, and deadlines for today. Meridian Supply Co. · Operations.')
  ));

  const taskBox = h('div', 'loop-card', h('div', 'loop-card-h', 'Today · your work'));
  Object.entries(state.tasks).filter(([, t]) => t.status !== 'hidden').forEach(([id, t]) => {
    const labelBox = h('div', null, h('b', null, t.label), h('p', 'loop-muted', `Due ${clock(t.deadline)} · ${t.status}`));
    const row = h('div', 'loop-task', labelBox);
    if (t.status === 'pending') {
      // In-game-clock urgency (#102): drains only as game time passes, never
      // for real-world reading/thinking time. Window is START -> deadline,
      // since that's the whole stretch the player actually had for it.
      const remaining = Math.max(0, t.deadline - state.t);
      const fraction = Math.max(0, Math.min(1, remaining / (t.deadline - START)));
      const urgencyKey = fraction <= 0.15 ? 'critical' : fraction <= 0.4 ? 'soon' : 'normal';
      const track = h('div', `loop-urgency-track urgency-${urgencyKey}`, h('span', 'loop-urgency-fill'));
      track.querySelector('.loop-urgency-fill').style.width = `${Math.round(fraction * 100)}%`;
      labelBox.append(h('p', 'loop-urgency-label', `${remaining} min left`), track);
      const actions = h('div', 'loop-task-actions');
      actions.append(btn('Open file', 'loop-link', () => {
        openFile(id);
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
  const standing = standingName(state.standing.status, 'Standard standing');
  const risk = narcRisk();
  const activity = activityBand();
  const profile = h('div', 'loop-card', h('div', 'loop-card-h', 'Employee 4417'), h('div', 'employee-line', h('span', 'employee-avatar', '44'), h('div', null, h('b', null, 'Operations Associate'), h('p', `narc-inline-status risk-${risk.key}`, `NARC status: ${risk.label}`), h('p', 'loop-muted', `Visible activity: ${state.index}/100 · ${activity.label}`), h('p', `standing standing-${state.standing.status}`, standing))));
  const quick = h('div', 'loop-card', h('div', 'loop-card-h', 'Quick links'));
  [['Messages', 'messages'], ['Calendar', 'calendar'], ['Files', 'files'], ['NARC', 'narc']].forEach(([label, id]) => quick.append(btn(label, 'loop-link', () => goApp(id))));
  const note = h('div', 'loop-card nonsense', h('div', 'loop-card-h', 'Required reminder'), h('p', null, state.narc.adaptation ? 'NARC 2.0: repeated Focus Time is now considered possible gaming.' : 'Please keep workstation activity consistent throughout the day. Thank you for your engagement.'));
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
    const unread = ui.notifications.filter((n) => !n.read && n.app === 'messages' && n.thread === id).length;
    const active = Math.max(requestForThread(id).length, unread) + (id === 'dana' && ui.tutorialUnread ? 1 : 0);
    const preview = latestThreadPreview(id);
    const row = h('button', `row message-row${active ? ' unread' : ''}`, h('span', `msg-avatar avatar-${id}`, t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)), h('div', 'message-row-copy', h('div', 'top', h('span', 'name', t.name), active ? h('span', 'pill', active) : null), h('div', 'sub sub-b', preview)));
    row.type = 'button'; row.setAttribute('aria-current', String(ui.selectedThread === id));
    row.addEventListener('click', () => {
      ui.selectedThread = id;
      ui.scrollThreadToBottom = id;
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
    if (ui.typingThreads[id]) {
      scroll.append(h('div', 'typing', h('span', null, `${t.name.split(' ')[0]} is typing`), h('span', 'typing-dots', '•••')));
    }
    if (id === 'dana' && state.requests.danaMorning.status === 'handled') {
      scroll.append(h('div', 'bubble me', state.flags.morningContext
        ? (state.flags.firstNarcReadType === 'low' ? 'I was carefully reviewing the file. That is what the low-activity read missed.' : 'The visible activity came from moving fast. It did not mean the work was careful.')
        : "I left NARC's first-hour read as-is."));
    }
    wrap.append(scroll);
    const compose = h('div', 'compose');
    const tutorialRequired = id === 'dana' && ui.tutorialStep >= 0 && !ui.tutorialDone;
    const requiredRequests = requestForThread(id);
    if (tutorialRequired) {
      const tutorial = TUTORIAL_STEPS[ui.tutorialStep];
      const chips = h('div', 'chips');
      chips.append(btn(tutorial.label, 'chip', advanceTutorial));
      compose.append(chips);
    }
    requiredRequests.forEach(([reqId]) => {
      const chips = h('div', 'chips');
      requestOptions(reqId).forEach(([choice, label]) => chips.append(btn(label, 'chip', () => dispatch({ do: 'respond', id: reqId, choice }))));
      compose.append(chips);
    });
    const hasRequiredAction = tutorialRequired || requiredRequests.length > 0;
    const optional = hasRequiredAction ? [] : chatOptions(state, id).slice(0, 3);
    if (optional.length) {
      const typing = Boolean(ui.typingThreads[id]);
      const smallTalk = h('div', `optional-chat${typing ? ' is-waiting' : ''}`, h('div', 'compose-state', typing ? `${t.name.split(' ')[0]} is replying…` : 'Start a conversation'));
      const chips = h('div', 'chips');
      optional.forEach(([topic, label]) => {
        const action = typing ? () => {} : () => sendChat(id, topic);
        chips.append(btn(label, 'chip secondary', action, typing ? { disabled: '', 'aria-disabled': 'true' } : {}));
      });
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
  if (state.flags.coveredForLuis) {
    pane.append(h('div', 'event', h('div', 'time', '1:50–3:00'), h('div', null, h('div', null, 'Vendor meeting · Luis Perez'), h('div', 'where', 'No location · created by you'))));
  }
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
  return ['vendor', 'client', 'project', 'rework', 'audit', 'handoff', 'marcusDoc'].filter((id) => fileVisible(state, id));
}

function openFile(id) {
  ui.selectedFile = id;
  setMobileDetail('files', true);
  if (!state.opened[id]) state = act(state, { do: 'open', id });
}

function fileStatus(id) {
  return state.tasks[id] ? state.tasks[id].status : (state.flags.helpedMarcus ? 'read' : 'unread');
}

// The handoff's first page is generated from the day's record: complete about
// activity, silent about decisions.
function handoffActivityLines() {
  const lines = [`Generated ${clock(state.t)} from workstation activity · Employee 4417`];
  Object.entries(state.tasks).filter(([id, t]) => t.status !== 'hidden' && id !== 'handoff').forEach(([id, t]) => {
    lines.push([FILES[id].name, t.status === 'done' ? 'Completed' : t.status === 'missed' ? 'Deadline passed' : 'Open']);
  });
  const sent = state.log.filter((e) => e.kind === 'message' && e.from === 'me').length;
  lines.push(['Messages sent', String(sent)]);
  lines.push(['Files opened', String(Object.keys(state.opened).length)]);
  lines.push(['Visible Activity', `${state.index}/100`]);
  return lines;
}

function pageLines(id, page) {
  const t = state.tasks[id];
  if (id === 'rework') {
    return t.kind === 'vendor'
      ? ['From: Procurement', 'The Halcyon renewal you approved this morning bills storage at $18.20 a pallet position, up from $14.00. The cover letter said nothing changed. Please explain how this was approved and what you want to do about it before the 2:30 PM finance review.']
      : ['From: Priya Shah', 'Brightline wrote back to the reply we sent this morning. Rosa says the second truck was turned away too, and she’s asking for a call with someone who can tell her what actually went wrong. I can’t cover this one again.'];
  }
  if (id === 'handoff' && page === 1) return handoffActivityLines();
  return FILES[id].pages[page - 1].lines;
}

function renderPageLine(line) {
  if (Array.isArray(line)) return h('div', 'doc-row', h('span', 'doc-key', line[0]), h('span', 'doc-val', line[1]));
  const p = h('p', 'doc-p');
  line.split('\n').forEach((part, i) => { if (i) p.append(h('br')); p.append(part); });
  return p;
}

function renderHandoffRisks(detail) {
  const risks = handoffRisks(state);
  const box = h('div', 'handoff-risks');
  const pending = state.tasks.handoff.status === 'pending';
  if (!pending) {
    const sent = state.flags.handoffRisks || [];
    if (!sent.length) box.append(h('p', 'doc-p doc-empty', 'No open risks recorded.'));
    risks.filter((r) => sent.includes(r.id)).forEach((r) => box.append(h('p', 'doc-p', `• ${r.label}`)));
    detail.append(box);
    return;
  }
  box.append(h('p', 'doc-p doc-empty', 'No open risks recorded.'));
  if (!risks.length) {
    box.append(h('p', 'doc-hint', 'Nothing from today to add yet.'));
  } else {
    box.append(h('p', 'doc-hint', 'Add from today:'));
    risks.forEach((r) => {
      const label = h('label', 'handoff-risk');
      const input = h('input');
      input.type = 'checkbox';
      input.checked = Boolean(ui.handoffChecked[r.id]);
      input.addEventListener('change', () => { ui.handoffChecked[r.id] = input.checked; });
      label.append(input, h('span', null, r.label));
      box.append(label);
    });
  }
  detail.append(box);
}

function renderFiles() {
  const list = h('div', 'list');
  visibleFiles().forEach((id) => {
    const f = FILES[id];
    const row = h('button', 'row file-row', h('span', 'file-type', f.name.split('.').pop().slice(0, 4).toUpperCase()), h('div', 'file-row-copy', h('div', 'name', f.name), h('div', 'sub', `${f.meta} · ${fileStatus(id)}`)));
    row.type = 'button'; row.setAttribute('aria-current', String(ui.selectedFile === id));
    row.addEventListener('click', () => { openFile(id); render(); });
    list.append(row);
  });
  const detail = h('div', 'detail file-body');
  const id = ui.selectedFile;
  if (!id || !FILES[id] || !visibleFiles().includes(id)) detail.append(h('div', 'empty', 'Select a file.'));
  else {
    const f = FILES[id]; const t = state.tasks[id];
    detail.append(h('h2', null, f.name), h('div', 'meta', `${f.meta} · ${fileStatus(id)}`));

    // The decision is on the document from page one, unlabeled. What it
    // does depends on how far the player read, which nothing here says.
    if (t?.status === 'pending') {
      const actions = h('div', 'file-actions file-decision');
      if (id === 'rework') REWORK_OPTIONS.forEach(([approach, label]) => actions.append(btn(label, 'btn primary', () => dispatch({ do: 'task', id, approach }))));
      else if (id === 'handoff') actions.append(btn(f.decision, 'btn primary', () => dispatch({ do: 'task', id, include: Object.keys(ui.handoffChecked).filter((k) => ui.handoffChecked[k]) })));
      else actions.append(btn(f.decision, 'btn primary', () => dispatch({ do: 'task', id })));
      detail.append(actions);
    }

    const total = PAGE_COUNTS[id] || 1;
    const read = state.pages[id] || 1;
    const page = Math.min(ui.filePage[id] || 1, read);
    const doc = h('article', 'doc-page');
    doc.append(h('div', 'doc-page-title', f.pages[page - 1].title));
    pageLines(id, page).forEach((line) => doc.append(renderPageLine(line)));
    if (id === 'handoff' && page === 2) renderHandoffRisks(doc);
    detail.append(doc);

    if (total > 1) {
      const pager = h('div', 'doc-pager');
      const prev = btn('‹ Previous', 'btn', () => { ui.filePage[id] = page - 1; render(); });
      if (page <= 1) prev.disabled = true;
      // Turning back is free. Turning to a page not read yet is an action.
      const next = btn('Next page ›', 'btn', () => {
        ui.filePage[id] = page + 1;
        if (page + 1 > read) dispatch({ do: 'page', id });
        else render();
      });
      if (page >= total) next.disabled = true;
      pager.append(prev, h('span', 'doc-page-count', `Page ${page} of ${total}`), next);
      detail.append(pager);
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
  const body = h('div', 'body narc-dashboard');
  const risk = narcRisk();
  const activity = activityBand();
  const standingLabel = standingName(state.standing.status, 'Standard').toUpperCase();
  const openAssessmentId = NARC_REQUESTS.find((id) => state.requests[id]?.status === 'open');
  const assessment = narcAssessment(openAssessmentId);

  const status = h('section', `narc-status-card risk-${risk.key}`,
    h('div', 'narc-status-head',
      h('div', null, h('div', 'narc-kicker', 'CURRENT NARC STATUS'), h('h2', null, risk.label)),
      h('div', 'narc-risk-number', `${risk.value}% risk`)
    ),
    h('div', 'narc-risk-track', h('span', 'narc-risk-fill')),
    h('p', 'narc-status-copy', risk.copy),
    h('p', 'narc-explainer', 'Likelihood of NARC action on your account.')
  );
  status.querySelector('.narc-risk-fill').style.width = `${risk.value}%`;

  const signals = h('section', 'narc-signal-card',
    h('div', 'narc-section-title', 'VISIBLE ACTIVITY'),
    h('div', 'narc-activity-row',
      h('div', null, h('strong', null, `${state.index}/100`), h('span', null, activity.label)),
      h('div', `narc-band narc-band-${activity.key}`, activity.range)
    ),
    activityMeter(),
    h('p', 'narc-explainer', 'Keyboard, mouse, window, and calendar activity, read every 30 minutes.')
  );
  if (state.narc.lowSince !== null && !state.flags.formalReview) {
    const left = Math.max(0, 30 - (state.t - state.narc.lowSince));
    signals.append(h('p', 'narc-countdown', `Review opens in ${left} min unless activity recovers.`));
  }

  const assessmentCard = h('section', `narc-assessment-card${openAssessmentId ? ' needs-action' : ''}`,
    h('div', 'narc-section-title', openAssessmentId ? 'ACTION REQUIRED' : 'CURRENT ASSESSMENT'),
    h('h3', null, assessment.title)
  );
  [
    ['SIGNAL', assessment.signal],
    ['NARC SAYS', assessment.inference],
    ['IMPACT', assessment.consequence],
  ].forEach(([label, text]) => assessmentCard.append(h('div', 'narc-explain-row', h('span', null, label), h('p', null, text))));
  if (assessment.missing) {
    const details = h('details', 'narc-details');
    details.append(h('summary', null, 'What NARC cannot see'), h('p', null, assessment.missing));
    assessmentCard.append(details);
  }

  if (openAssessmentId) {
    assessmentCard.append(h('div', 'narc-decision-label', 'Choose a response'));
    const actions = h('div', 'narc-action-buttons');
    requestOptions(openAssessmentId).forEach(([choice, label], index) => actions.append(btn(label, index === 0 ? 'btn primary-decision' : 'btn', () => dispatch({ do: 'respond', id: openAssessmentId, choice }))));
    assessmentCard.append(actions);
  }

  const standing = h('section', `narc-standing narc-standing-${state.standing.status}`,
    h('span', null, 'EMPLOYEE STANDING'),
    h('b', null, standingLabel),
    h('p', null, state.standing.note)
  );

  body.append(status, signals, assessmentCard, standing);

  if (state.narc.adaptation) {
    body.append(h('section', 'narc-system-update',
      h('div', 'narc-update-kicker', 'SYSTEM UPDATE · NARC 2.0'),
      h('b', null, 'Focus Time weighting changed'),
      h('p', null, 'Repeated Focus Time usage was detected across Meridian. NARC now treats repeated Focus Time as possible activity manipulation rather than reliable context.')
    ));
  }

  const log = h('section', 'narc-log', h('div', 'narc-section-title', 'RECENT NARC EVENTS'));
  const events = state.log.filter((e) => e.kind === 'narc' || e.kind === 'consequence' || (e.kind === 'system' && /NARC|Focus Time|keepalive/i.test(e.text))).slice().reverse().slice(0, 8);
  events.forEach((e) => {
    const type = narcEventType(e);
    log.append(h('div', 'narc-log-row',
      h('div', 'narc-log-meta', h('span', 'narc-event-type', type), h('time', null, clock(e.t))),
      h('p', null, e.text)
    ));
  });
  if (!events.length) log.append(h('p', 'narc-copy', 'No NARC events yet.'));
  body.append(log);
  return windowShell('narc', 'NARC', body);
}

const STATUS_TONE = { employed: 'good', protected: 'good', warning: 'soon', fired: 'critical' };

function renderEnd() {
  if (state.phase !== 'end') { els.modal.replaceChildren(); return; }
  const e = ending(state);
  const shade = h('div', 'modal-shade');
  const box = h('div', 'modal-card end-day');
  const endTitle = state.flags.loggedOffEarly ? `You logged off at ${clock(state.t)}.` : 'You made it to 5:00.';
  box.append(h('div', 'loop-kicker', 'MERIDIAN · END OF DAY'), h('h2', null, endTitle), h('p', 'end-headline', e.lines[0]));

  // Your day: where the minutes actually went (#103's tracking, surfaced).
  if (e.timeBreakdown.length) {
    const section = h('section', 'end-section');
    section.append(h('div', 'end-section-h', 'Your day'));
    const row = h('div', 'end-time-row');
    e.timeBreakdown.forEach((t) => row.append(h('span', 'end-time-chip', `${t.minutes} min ${t.label}`)));
    section.append(row);
    box.append(section);
  }

  // NARC metrics: the measured picture, plainly.
  const narcSection = h('section', 'end-section');
  narcSection.append(
    h('div', 'end-section-h', 'NARC metrics'),
    h('div', 'end-metric-row', h('span', null, 'Visible Activity'), h('b', null, `${e.index}/100`)),
    h('div', 'end-metric-row', h('span', null, 'Standing'), h('b', null, standingName(e.standing.status, 'Standard'))),
    h('p', 'end-metric-note', e.standing.note)
  );
  box.append(narcSection);

  // People: what actually happened to each coworker, traceable to the day's choices.
  const peopleSection = h('section', 'end-section');
  peopleSection.append(h('div', 'end-section-h', 'People'));
  e.peopleList.forEach((p) => peopleSection.append(h('div', `end-person tone-${STATUS_TONE[p.status] || 'soon'}`, h('span', null, p.name), h('b', null, p.label))));
  box.append(peopleSection);

  // The contradiction: measured success vs. what actually happened, without
  // a fixed "you lose" thesis -- only the sharpest 1-3 that actually applied.
  if (e.contradictions.length) {
    const section = h('section', 'end-section end-contradiction');
    section.append(h('div', 'end-section-h', 'The contradiction'));
    e.contradictions.forEach((c) => section.append(h('p', null, c)));
    box.append(section);
  }

  box.append(btn('Play again', 'btn primary', restart));
  shade.append(box); els.modal.replaceChildren(shade);
}

function render() {
  renderChrome(); renderWindows(); renderEnd(); renderNotificationCenter();
  requestAnimationFrame(() => {
    if (!ui.scrollThreadToBottom || ui.selectedThread !== ui.scrollThreadToBottom) return;
    const scroll = els.windows.querySelector('.window.app-messages .thread .scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    ui.scrollThreadToBottom = null;
  });
}

render();
