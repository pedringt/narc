// NARC — deterministic game state.
// The player is a human employee. NARC observes proxies (input events, badge
// pings, message counts, records) and turns them into scores. Everything here
// is pure: act(state, controlId) returns a new state, view(state) describes
// the one screen to show.

export const SEQUENCE = ['e1', 'e2', 'e3', 'update', 'e4', 'e5', 'e6'];

export const PEOPLE = {
  luis: { name: 'Luis Perez', role: 'Customer Operations' },
  marcus: { name: 'Marcus Reed', role: 'Account Management' },
  priya: { name: 'Priya Shah', role: 'Product Marketing' },
};

export const STATUS_LABEL = {
  employed: 'EMPLOYED',
  promoted: 'PROMOTED',
  warning: 'ON WARNING',
  monitored: 'HEAVILY MONITORED',
  rewarded: 'ABSURDLY REWARDED',
  fired: 'TERMINATED',
};

// Things the player can learn about NARC by playing.
export const NOTES = {
  input: 'NARC counts keyboard and mouse events. It has no field for output.',
  comments: 'Free-text explanations are archived. They are not scored.',
  baseline: 'Idle time is judged against a team baseline, not against results.',
  fakeable: 'NARC cannot tell a hand from a script. Input is input.',
  feeds: 'An excuse is “true” when a feed or document agrees with it. NARC checks that a record exists, not that it is real.',
  history: 'Past flags outweigh today’s evidence.',
  twoMetrics: 'Collaboration and Communication Load read the same message count in opposite directions.',
  deviation: 'NARC 2.0 measures distance from a person’s own baseline, including going quiet.',
  exempt: 'A title overrides a flag. Culture Champions are exempt from Communication Load.',
  synthetic: 'NARC 2.0 spots repeating input. It does not question records created before the flag.',
  random: 'A random interval defeats the repeating-input check.',
  timing: 'Records created after a flag are treated as retroactive.',
  label: 'Relabelling time changes the category, not the time. NARC accepts the category.',
};

const clone = (s) => structuredClone(s);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function newGame() {
  return {
    phase: 'intro', // intro | signal | inspect | choose | result | reaction | update | ending
    node: 0,
    level: 1, // 1 = Workforce Support, 2 = Workforce Intelligence
    score: 61, // the player’s Visible Activity Index
    flags: 0, // integrity flags, visible from NARC 2.0 onward
    showIndex: false,
    you: { gamed: false },
    people: {
      luis: { status: 'employed', trust: 0, monitored: 0, gamed: false, caught: false },
      marcus: { status: 'employed', trust: 0, gamed: false, cred: 38 },
      priya: { status: 'employed', trust: 0, suppressed: false, champion: false },
    },
    notes: [],
    pulled: {},
    picked: {},
    result: [],
    reaction: [],
    achievements: [],
  };
}

const addNote = (s, id) => { if (!s.notes.includes(id)) s.notes.push(id); };

function moveScore(s, n) {
  const from = s.score;
  s.score = clamp(from + n, 0, 100);
  return `Visible Activity Index: ${from} → ${s.score}.`;
}

// ---------------------------------------------------------------- encounters

const e1 = {
  id: 'e1',
  day: 'Monday',
  title: 'Low Visible Activity',
  subtitle: 'Employee 4417 · You',
  signal: () => [
    ['SYSTEM', 'Employee 4417 (you), Operations Associate.'],
    ['ACTIVITY', 'This morning: 3 h 12 min with no keyboard or mouse input.'],
    ['METRIC', 'Visible Activity Index: 61. Team average: 84.'],
    ['MODEL', 'Engagement concern: low to moderate. Confidence: 64%.'],
    ['MESSAGE', 'Manager: “Just checking in! Everything okay?”'],
  ],
  sees: () => ['Keyboard and mouse events', 'Messages sent', 'Which window is in focus'],
  infers: () => ['“Engagement”'],
  evidence: () => ({
    label: 'Check what you were actually doing',
    text: 'You read the Halvorsen contract on paper, at the table by the window. NARC has no sensor for the table by the window.',
  }),
  choices: () => [
    {
      id: 'wait',
      label: 'Do nothing. The work speaks for itself.',
      note: 'Trusts the system to notice.',
      apply(s) {
        addNote(s, 'input');
        return {
          result: [['CHANGE', moveScore(s, -6)], ['NARC', '“Recommended action: increase visible activity.”']],
          reaction: [
            ['MANAGER', '“Saw the dip! No pressure. Maybe a little more… on Slack?”'],
            ['NOTE', 'The paper contained a $40,000 pricing error. You found it. Nobody has asked.'],
          ],
        };
      },
    },
    {
      id: 'explain',
      label: 'Write an explanation in the comment box.',
      note: 'Provides context.',
      apply(s) {
        addNote(s, 'input');
        addNote(s, 'comments');
        return {
          result: [
            ['CHANGE', 'Comment saved (412 characters).'],
            ['CHANGE', moveScore(s, -3)],
            ['NARC', 'Comments are archived. They are not scored.'],
          ],
          reaction: [['MANAGER', '“Got your note! Haven’t had time to read it, but I love that you wrote it.”']],
        };
      },
    },
    {
      id: 'jiggle',
      label: 'Install a mouse jiggler.',
      note: 'Changes the number, not the work.',
      apply(s) {
        s.you.gamed = true;
        addNote(s, 'input');
        addNote(s, 'fakeable');
        return {
          result: [['CHANGE', moveScore(s, 14)], ['NARC', '“Momentum trending positive.”']],
          reaction: [
            ['MANAGER', '“Love the energy!”'],
            ['NOTE', 'Your cursor has been very busy for forty minutes. You have not.'],
          ],
        };
      },
    },
  ],
};

const e2 = {
  id: 'e2',
  day: 'Tuesday',
  title: 'Restroom-Adjacent Inactivity',
  subtitle: 'Luis Perez · Customer Operations',
  signal: () => [
    ['ACTIVITY', 'Luis Perez: 47 minutes of restroom-adjacent inactivity this week.'],
    ['METRIC', 'Team baseline: 18 minutes.'],
    ['MODEL', 'Time-on-task concern: moderate. Confidence: 71%.'],
    ['MESSAGE', 'Luis: “I am not discussing my digestive system with software.”'],
  ],
  sees: () => ['Corridor sensor pings near the restrooms', 'Laptop input (none during pings)', 'The team baseline'],
  infers: () => ['“Unexplained productivity loss”'],
  evidence: () => ({
    label: 'Pull Luis’s ticket output',
    text: 'Luis closed 112% of the team median this week. NARC has this number. It is not connected to the restroom number.',
    note: 'baseline',
  }),
  choices: () => [
    {
      id: 'confirm',
      label: 'Confirm the flag. It does seem like a lot.',
      note: 'Helps NARC be accurate.',
      apply(s) {
        const p = s.people.luis;
        p.monitored = 2;
        p.trust -= 2;
        addNote(s, 'baseline');
        return {
          result: [
            ['CHANGE', 'Peer confirmation received. Confidence: 71% → 88%.'],
            ['CHANGE', 'Luis’s inactivity threshold: 18 min → 5 min.'],
            ['CHANGE', moveScore(s, 4) + ' (“Constructive feedback.”)'],
          ],
          reaction: [
            ['LUIS', '“A peer. A PEER confirmed a bathroom.”'],
            ['NARC', 'Luis walked past your desk without speaking. Logged: low-collaboration interaction.'],
          ],
        };
      },
    },
    {
      id: 'ignore',
      label: 'Say nothing.',
      note: 'Lets the process run.',
      apply(s) {
        const p = s.people.luis;
        p.monitored = 1;
        p.trust += 1;
        addNote(s, 'baseline');
        return {
          result: [
            ['CHANGE', 'No peer input received. Flag stands at 71%.'],
            ['CHANGE', 'Luis receives a Time-on-Task Advisory.'],
          ],
          reaction: [['LUIS', '“Thank you for not asking. The advisory has a chart. The chart has a title. The title is my name.”']],
        };
      },
    },
    {
      id: 'script',
      label: 'Set up a keep-alive script on Luis’s laptop.',
      note: 'Changes the number, not the reason.',
      apply(s) {
        const p = s.people.luis;
        p.gamed = true;
        p.trust += 2;
        addNote(s, 'baseline');
        addNote(s, 'fakeable');
        return {
          result: [
            ['CHANGE', 'Luis’s laptop now generates input while he is away.'],
            ['CHANGE', 'Luis’s Activity Index: 340% of baseline.'],
            ['NARC', '“Exceptionally engaged.” Time-on-task concern dismissed.'],
          ],
          reaction: [
            ['LUIS', '“I have never been more productive, and I am not at my desk.”'],
            ['NARC', 'Luis Perez has been nominated for the Innovation Council.'],
          ],
        };
      },
    },
  ],
};

const e3 = {
  id: 'e3',
  day: 'Wednesday',
  title: 'Attendance Integrity',
  subtitle: 'Marcus Reed · Account Management',
  signal: () => [
    ['ACTIVITY', 'Marcus Reed: badge-in 10:52. Scheduled: 09:00. Fourth late arrival this month.'],
    ['MESSAGE', 'Marcus: “A raccoon got on the 8:14 bus. The driver said we had to wait for a professional.”'],
    ['TRACE', 'Device location, 09:04–10:41: Pinecrest Family Fun Center.'],
    ['MODEL', 'Attendance credibility: 38%.'],
  ],
  sees: () => ['Badge timestamps', 'Phone location', 'City transit alerts'],
  infers: () => ['“Credibility”: how well his story matches the feeds'],
  evidence: () => ({
    label: 'Check the transit feed',
    text: 'Route 14, 08:14: “Animal-related delay, 11 minutes.” The raccoon is real. It explains 11 of his 112 minutes.',
    note: 'feeds',
  }),
  choices: () => [
    {
      id: 'truth',
      label: 'Tell NARC where he actually was.',
      note: 'The location trace is already there.',
      apply(s) {
        const p = s.people.marcus;
        p.cred = 12;
        p.status = 'warning';
        p.trust -= 2;
        return {
          result: [
            ['CHANGE', 'Location trace confirmed. Attendance credibility: 38% → 12%.'],
            ['CHANGE', 'Marcus receives a Written Attendance Warning.'],
            ['CHANGE', moveScore(s, 5)],
          ],
          reaction: [['MARCUS', '“Mini-golf is a cognitive reset. Ask anyone. Don’t ask anyone.”']],
        };
      },
    },
    {
      id: 'paper',
      label: 'Build him a paper trail.',
      note: 'A ticket, a transit alert, a calendar entry.',
      apply(s) {
        const p = s.people.marcus;
        p.gamed = true;
        p.cred = 91;
        p.trust += 2;
        addNote(s, 'feeds');
        return {
          result: [
            ['CHANGE', 'Added: transit alert (real). Facilities ticket #4471 (filed 09:31). Calendar entry: “Vendor Site Visit — Pinecrest Family Fun Center.”'],
            ['CHANGE', 'Attendance credibility: 38% → 91%.'],
            ['NARC', '“Story corroborated by 3 sources.”'],
          ],
          reaction: [
            ['MARCUS', '“I did visit the vendor. The vendor was a windmill.”'],
            ['NOTE', 'He looks at you like you have invented money.'],
          ],
        };
      },
    },
    {
      id: 'stay',
      label: 'Stay out of it.',
      note: 'Lets NARC decide.',
      apply(s) {
        const p = s.people.marcus;
        p.status = 'warning';
        return {
          result: [
            ['CHANGE', 'No corroboration submitted. Attendance credibility: 38%.'],
            ['NARC', 'An Attendance Integrity Notice has been issued automatically.'],
          ],
          reaction: [['MARCUS', '“I’m going to need a better raccoon.”']],
        };
      },
    },
  ],
};

const e4 = {
  id: 'e4',
  day: 'Thursday',
  title: 'Communication Load',
  subtitle: 'Priya Shah · Product Marketing',
  signal: () => [
    ['ACTIVITY', 'Priya Shah: 63 Slack threads this week. In-person proximity pings: 41% above baseline.'],
    ['METRIC', 'Collaboration Index: 97 (highest in Operations).'],
    ['MODEL', 'Communication Load: elevated. Recommended action: throttle.'],
    ['MESSAGE', 'Priya: “I asked Claire what she was having for lunch. It was a workflow.”'],
  ],
  sees: () => ['Message count', 'Proximity pings', 'Reply times'],
  infers: () => ['“Collaboration” (more is better)', '“Communication Load” (more is worse)'],
  evidence: () => ({
    label: 'Open the client escalation thread',
    text: 'Priya answered the client escalation after 3 h 10 min. She was in 14 active threads. She also got two new hires productive in a week.',
    note: 'twoMetrics',
  }),
  choices: () => [
    {
      id: 'quiet',
      label: 'Ask Priya to cut back to three channels.',
      note: 'Fixes the flag.',
      apply(s) {
        const p = s.people.priya;
        p.suppressed = true;
        p.status = 'monitored';
        addNote(s, 'twoMetrics');
        addNote(s, 'deviation');
        return {
          result: [
            ['CHANGE', 'Communication Load: elevated → normal.'],
            ['CHANGE', 'Priya’s message volume: −71%.'],
          ],
          reaction: [
            ['NARC', 'Behavioral Deviation: “Social withdrawal. 71% below personal baseline.”'],
            ['CHANGE', 'Collaboration Index: 97 → 31. Priya is enrolled in a mandatory Connection Circle.'],
            ['PRIYA', '“I am fine. I am being efficient.” (whispering) “Did you hear about Claire?”'],
          ],
        };
      },
    },
    {
      id: 'champion',
      label: 'Nominate Priya for Culture Champion.',
      note: 'Cites the other number.',
      apply(s) {
        const p = s.people.priya;
        p.champion = true;
        p.status = 'promoted';
        addNote(s, 'twoMetrics');
        addNote(s, 'exempt');
        return {
          result: [
            ['CHANGE', 'Nomination cites Collaboration Index: 97.'],
            ['NARC', 'Culture Champions are exempt from Communication Load monitoring. Flag cleared.'],
          ],
          reaction: [
            ['PRIYA', '“I have a badge. I can now talk to people officially.”'],
            ['NOTE', 'Culture Champions host five Connection Circles a week. Priya has scheduled six.'],
          ],
        };
      },
    },
    {
      id: 'leave',
      label: 'Leave it. She is doing her job.',
      note: 'Lets the flag run.',
      apply(s) {
        addNote(s, 'twoMetrics');
        return {
          result: [
            ['CHANGE', 'Automatic response: Concise Communication Coaching.'],
            ['CHANGE', 'Priya receives a summarizing assistant.'],
          ],
          reaction: [
            ['PRIYA', '“It summarizes my messages. Its summaries are better than my messages. I hate it.”'],
            ['NARC', 'Client reply time improves by 2 h 40 min.'],
          ],
        };
      },
    },
  ],
};

const e5 = {
  id: 'e5',
  day: 'Thursday',
  title: 'Restroom-Adjacent Inactivity, Again',
  subtitle: 'Luis Perez · Customer Operations',
  signal: (s) => {
    const p = s.people.luis;
    if (p.gamed) {
      return [
        ['SYSTEM', 'NARC 2.0: Synthetic Activity Identification.'],
        ['ACTIVITY', 'Luis Perez: input every 59 seconds, including 41 minutes while the badge shows the restroom corridor.'],
        ['MODEL', 'Automated presence pattern. Confidence: 96%.'],
        ['RECORD', 'Innovation Council nomination (Activity Index 340%): pending Integrity Review.'],
        ['MESSAGE', 'Luis: “I was so productive. Why is there a review?”'],
      ];
    }
    return [
      ['ACTIVITY', 'Luis Perez: 6 min 40 sec of restroom-adjacent inactivity, 14:14.'],
      ['METRIC', p.monitored === 2
        ? 'Threshold: 5 minutes (tightened after peer confirmation).'
        : 'NARC 2.0 now measures every pause, per visit.'],
      ['MODEL', 'Sustained unexplained productivity loss. Automatic action: Performance Improvement Plan.'],
      ['MESSAGE', 'Luis: “There is a chart in my inbox. The chart has a title. The title is my name.”'],
    ];
  },
  sees: (s) => (s.people.luis.gamed
    ? ['Input timestamps', 'Interval between inputs', 'Corridor pings']
    : ['Corridor pings, per visit', 'Laptop input', 'Notice history']),
  infers: (s) => (s.people.luis.gamed
    ? ['“Automated presence”']
    : ['“Sustained unexplained productivity loss”']),
  evidence: (s) => (s.people.luis.gamed
    ? { label: 'Open the input log', text: 'Input arrives every 59 seconds, exactly. A human has never done anything every 59 seconds.', note: 'fakeable' }
    : { label: 'Pull Luis’s ticket output again', text: 'Still 112% of median. NARC still has no field that connects this number to the notice.' }),
  choices: (s) => {
    if (s.people.luis.gamed) {
      return [
        {
          id: 'admit',
          label: 'Tell NARC the script was yours.',
          note: 'Costs you. Protects him.',
          apply(st) {
            const p = st.people.luis;
            p.status = 'warning';
            p.trust += 3;
            st.flags += 1;
            return {
              result: [
                ['CHANGE', 'Script attributed to: Employee 4417.'],
                ['CHANGE', 'Luis: verbal caution. Innovation Council nomination withdrawn.'],
                ['CHANGE', `${moveScore(st, -8)} Integrity flags: ${st.flags}.`],
              ],
              reaction: [
                ['LUIS', '“You did not have to do that.”'],
                ['LUIS', '“I am still not discussing the restroom.”'],
              ],
            };
          },
        },
        {
          id: 'human',
          label: 'Make the input look human.',
          note: 'Adapts to the update.',
          apply(st) {
            const p = st.people.luis;
            p.status = 'rewarded';
            addNote(st, 'random');
            return {
              result: [
                ['CHANGE', 'Input interval randomized (± 40 sec).'],
                ['CHANGE', 'Synthetic pattern: not detected.'],
                ['NARC', 'Innovation Council nomination approved.'],
              ],
              reaction: [
                ['LUIS', '“I chair the Council now. We meet at two. I stand up at nine past.”'],
                ['NOTE', 'The Innovation Council has 11 meetings a week and no windows.'],
              ],
            };
          },
        },
        {
          id: 'blame',
          label: 'Say it was Luis’s idea.',
          note: 'Clears you.',
          apply(st) {
            const p = st.people.luis;
            p.status = 'fired';
            p.trust -= 5;
            return {
              result: [
                ['NARC', 'Synthetic Activity Policy §4: employees are responsible for their own input.'],
                ['CHANGE', 'Luis Perez: termination pending. Nomination withdrawn.'],
                ['CHANGE', moveScore(st, 6)],
              ],
              reaction: [
                ['LUIS', '“A peer. Again.”'],
                ['NOTE', 'His badge stops working at 16:52. NARC records the badge event as “Successful.”'],
              ],
            };
          },
        },
      ];
    }
    return [
      {
        id: 'label',
        label: 'Ask his manager to relabel the time “unstructured ideation.”',
        note: 'Changes the category.',
        apply(st) {
          const p = st.people.luis;
          p.status = 'employed';
          p.trust += 1;
          addNote(st, 'label');
          return {
            result: [
              ['CHANGE', 'Manager reclassified 22 minutes/week as “Unstructured Ideation.”'],
              ['NARC', '“Ideation is not idle.” Notice withdrawn.'],
            ],
            reaction: [['LUIS', '“I have ideas. They are unstructured. I will not say when.”']],
          };
        },
      },
      {
        id: 'output',
        label: 'Attach his ticket output to the file.',
        note: 'Adds evidence.',
        apply(st) {
          const p = st.people.luis;
          p.status = 'monitored';
          addNote(st, 'input');
          return {
            result: [
              ['NARC', 'Attachment archived. NARC has no field for “output.”'],
              ['CHANGE', 'Notice stands. Luis is placed on heavy monitoring.'],
            ],
            reaction: [['LUIS', '“So it was always going to be the chart.”']],
          };
        },
      },
      {
        id: 'letit',
        label: 'Let the process run.',
        note: 'Follows the plan.',
        apply(st) {
          const p = st.people.luis;
          p.status = 'fired';
          p.trust -= 3;
          return {
            result: [
              ['CHANGE', 'Performance Improvement Plan issued. Luis declines to sign.'],
              ['CHANGE', 'Luis Perez: termination pending. Reason: “Time-on-Task.”'],
            ],
            reaction: [
              ['LUIS', '“I was in the restroom when the email arrived.”'],
              ['NARC', 'Email status: read in 4 seconds.'],
            ],
          };
        },
      },
    ];
  },
};

const e6 = {
  id: 'e6',
  day: 'Friday',
  title: 'Attendance Integrity, Again',
  subtitle: 'Marcus Reed · Account Management',
  signal: (s) => {
    const p = s.people.marcus;
    if (p.gamed) {
      return [
        ['ACTIVITY', 'Marcus Reed: badge-in 11:20. Scheduled: 09:00. Fifth late arrival this month.'],
        ['MESSAGE', 'Marcus: “There was a bird situation.”'],
        ['MODEL', 'Attendance credibility: 94%. Supporting documents attached: 6.'],
        ['RECORD', 'NARC 2.0: “Documentation Excellence.” Top 2% of Operations.'],
      ];
    }
    return [
      ['ACTIVITY', 'Marcus Reed: badge-in 11:20. Scheduled: 09:00. Fifth late arrival this month.'],
      ['MESSAGE', 'Marcus: “There was a bird situation.”'],
      ['TRACE', 'Device location, 08:14–10:55: Wingspan Bird Sanctuary. Weight: 20%.'],
      ['MODEL', `Attendance credibility: ${p.cred}%. Prior flags weight: 80%. Automatic action: Attendance Integrity Termination.`],
    ];
  },
  sees: (s) => (s.people.marcus.gamed
    ? ['Number of supporting documents', 'Whether each document exists', 'Timestamps']
    : ['Badge timestamps', 'Phone location', 'His own flag history']),
  infers: (s) => (s.people.marcus.gamed
    ? ['“Credibility”: more documents, more credible']
    : ['“Credibility”: mostly what he did last time']),
  evidence: (s) => (s.people.marcus.gamed
    ? { label: 'Open the attachments', text: 'The email from “Bird Services” was sent from marcus.reed.personal@. NARC checks that the sender exists. The sender exists.' }
    : { label: 'Read the location trace', text: 'Wingspan Bird Sanctuary opens at 09:00. Volunteer scan, 09:20: “Injured goose — intake.” It is the truest thing Marcus has said all month.', note: 'history' }),
  choices: (s) => {
    if (s.people.marcus.gamed) {
      return [
        {
          id: 'workshop',
          label: 'Nominate him to teach “Attendance Best Practices.”',
          note: 'Follows the metric.',
          apply(st) {
            st.people.marcus.status = 'rewarded';
            return {
              result: [
                ['NARC', '“Recommended for peer training. Credibility: 94%.”'],
                ['CHANGE', 'Workshop scheduled: Fridays, 09:00.'],
              ],
              reaction: [
                ['MARCUS', '“It’s at nine. I’ll be early. To the one after it.”'],
                ['NOTE', 'He is late to the first session.'],
              ],
            };
          },
        },
        {
          id: 'approve',
          label: 'Approve the absence and move on.',
          note: 'Lets the paperwork win.',
          apply(st) {
            st.people.marcus.status = 'employed';
            return {
              result: [['CHANGE', 'Absence approved. No action taken.']],
              reaction: [['MARCUS', '“The bird will be very relieved.”']],
            };
          },
        },
        {
          id: 'expose',
          label: 'Flag the documents as fabricated.',
          note: 'Tells the truth. Includes yours.',
          apply(st) {
            st.people.marcus.status = 'fired';
            st.flags += 1;
            return {
              result: [
                ['NARC', 'Document authorship: 3 of 6 last edited by Employee 4417.'],
                ['CHANGE', 'Marcus Reed: termination pending.'],
                ['CHANGE', `${moveScore(st, 8)} Integrity flags: ${st.flags}.`],
              ],
              reaction: [['MARCUS', '“I’m in a lot of trouble, and I think you might be.”']],
            };
          },
        },
      ];
    }
    return [
      {
        id: 'vouch_trace',
        label: 'Submit the location trace and vouch for him.',
        note: 'Uses NARC’s own data.',
        apply(st) {
          const p = st.people.marcus;
          p.status = 'warning';
          p.cred = 67;
          addNote(st, 'history');
          return {
            result: [
              ['CHANGE', 'Trace attached as corroboration. Credibility: 12% → 67%.'],
              ['NARC', '“Prior-flag weighting is under review.”'],
              ['CHANGE', 'Termination withdrawn. Final written warning issued.'],
            ],
            reaction: [
              ['MARCUS', '“It was a goose. I don’t want to talk about the goose.”'],
              ['NOTE', 'This is the first time his excuse was true. NARC has noted it as “an outlier.”'],
            ],
          };
        },
      },
      {
        id: 'backdate',
        label: 'Backdate a calendar entry: “Wildlife Vendor Visit.”',
        note: 'Builds a paper trail. Late.',
        apply(st) {
          const p = st.people.marcus;
          p.status = 'fired';
          st.flags += 1;
          addNote(st, 'timing');
          return {
            result: [
              ['NARC', 'Calendar entry created 11:26, after the flag at 11:20. Pattern: retroactive.'],
              ['CHANGE', 'Marcus Reed: termination pending. Integrity flag added to Employee 4417.'],
            ],
            reaction: [['MARCUS', '“It was a real goose. I had a real goose.”']],
          };
        },
      },
      {
        id: 'let',
        label: 'Let NARC’s action proceed.',
        note: 'Trusts the record.',
        apply(st) {
          st.people.marcus.status = 'fired';
          addNote(st, 'history');
          return {
            result: [
              ['CHANGE', 'Attendance Integrity Termination: confirmed. Confidence: 88%.'],
              ['NARC', 'Reason on file: repeated unexplained absence.'],
            ],
            reaction: [
              ['MARCUS', '“It was a goose.”'],
              ['MARCUS', '“Can the goose be a reference?”'],
            ],
          };
        },
      },
    ];
  },
};

const ENCOUNTERS = { e1, e2, e3, e4, e5, e6 };

function applyUpdate(s) {
  s.level = 2;
  const rows = [];
  if (s.you.gamed) {
    const from = s.score;
    s.score = Math.max(20, from - 25);
    s.flags += 1;
    rows.push(['SCAN', `Employee 4417: input repeats every 59 seconds. Visible Activity Index recalculated: ${from} → ${s.score}. Integrity flag added.`]);
  }
  if (s.people.luis.gamed) {
    s.people.luis.caught = true;
    rows.push(['SCAN', 'Luis Perez: synthetic activity detected. Under review.']);
  }
  if (s.people.marcus.gamed) {
    rows.push(['SCAN', 'Marcus Reed: 3 supporting documents verified. No anomalies.']);
  }
  if (rows.length === 0) {
    rows.push(['SCAN', 'No synthetic activity found. NARC congratulates the team on its authenticity.']);
  } else {
    addNote(s, 'synthetic');
  }
  s.result = rows;
}

// ------------------------------------------------------------------ engine

const nodeId = (s) => SEQUENCE[s.node];
const currentEncounter = (s) => ENCOUNTERS[nodeId(s)];

function enterNode(s) {
  if (s.node >= SEQUENCE.length) {
    s.phase = 'ending';
    s.achievements = achievements(s).earned.map((a) => a.id);
    return;
  }
  if (nodeId(s) === 'update') {
    s.phase = 'update';
    applyUpdate(s);
  } else {
    s.phase = 'signal';
  }
}

export function act(state, id) {
  const s = clone(state);
  switch (s.phase) {
    case 'intro':
      if (id !== 'begin') break;
      enterNode(s);
      return s;
    case 'signal':
      if (id !== 'next') break;
      s.phase = 'inspect';
      if (nodeId(s) === 'e1') s.showIndex = true;
      return s;
    case 'inspect': {
      const enc = currentEncounter(s);
      if (id === 'pull' && !s.pulled[enc.id]) {
        const ev = enc.evidence(s);
        s.pulled[enc.id] = true;
        if (ev.note) addNote(s, ev.note);
        return s;
      }
      if (id === 'next') {
        s.phase = 'choose';
        return s;
      }
      break;
    }
    case 'choose': {
      const enc = currentEncounter(s);
      const choice = enc.choices(s).find((c) => `choose:${c.id}` === id);
      if (!choice) break;
      const out = choice.apply(s);
      s.picked[enc.id] = choice.id;
      s.result = out.result;
      s.reaction = out.reaction;
      s.phase = 'result';
      return s;
    }
    case 'result':
      if (id !== 'next') break;
      s.phase = 'reaction';
      return s;
    case 'reaction':
    case 'update':
      if (id !== 'next') break;
      s.node += 1;
      enterNode(s);
      return s;
    case 'ending':
      if (id !== 'restart') break;
      return newGame();
    default:
  }
  throw new Error(`Unknown action "${id}" in phase "${state.phase}"`);
}

// ----------------------------------------------------------------- endings

function epilogue(s, id) {
  const p = s.people[id];
  if (id === 'luis') {
    switch (p.status) {
      case 'fired':
        return p.gamed
          ? 'Terminated under Synthetic Activity Policy §4. His badge worked one last time.'
          : 'Terminated. Reason on file: Time-on-Task. He was, at the time, in the restroom.';
      case 'rewarded':
        return 'Chair of the Innovation Council. Activity Index: 340%. Restroom-adjacent inactivity: unchanged.';
      case 'warning':
        return 'Verbal caution on file. Still not discussing it.';
      case 'monitored':
        return 'Retained under heavy monitoring. Has read the chart. Has notes on the chart.';
      default:
        return 'Retained. His time is now “unstructured ideation.” He has not confirmed this.';
    }
  }
  if (id === 'marcus') {
    switch (p.status) {
      case 'fired':
        return p.gamed
          ? 'Terminated after document review. The bird could not be reached for comment.'
          : 'Terminated. Reason on file: Attendance Integrity. He asked whether the goose could be a reference.';
      case 'rewarded':
        return 'Teaches Attendance Best Practices, Fridays at 09:00. Arrives 09:40.';
      case 'warning':
        return 'Final written warning. Has since volunteered at the sanctuary. Twice. On time.';
      default:
        return 'Absence approved. Credibility: 94%. It has never been lower in real life.';
    }
  }
  switch (p.status) {
    case 'promoted':
      return 'Culture Champion. Hosts six Connection Circles a week. Has scheduled a seventh.';
    case 'monitored':
      return 'Enrolled in a mandatory Connection Circle. Perfect attendance. Sole attendee.';
    default:
      return 'A summarizing assistant condenses her messages. Client replies are 2 h 40 min faster. Claire’s lunch remains unknown.';
  }
}

const ACHIEVEMENTS = [
  {
    id: 'nobody',
    name: 'Nobody Gets Fired Today',
    desc: 'Finish the week with everyone still employed.',
    hint: 'Everyone stays.',
    test: (s) => Object.values(s.people).every((p) => p.status !== 'fired'),
  },
  {
    id: 'fewer',
    name: 'Two Fewer Problems',
    desc: 'Luis and Marcus are both terminated.',
    hint: 'The opposite of the above, mostly.',
    test: (s) => s.people.luis.status === 'fired' && s.people.marcus.status === 'fired',
  },
  {
    id: 'technically',
    name: 'Technically Compliant',
    desc: 'Keep someone employed mainly by manipulating what NARC can see.',
    hint: 'A record does not have to be true.',
    test: (s) => (s.people.marcus.gamed && s.people.marcus.status !== 'fired')
      || (s.people.luis.gamed && s.people.luis.status !== 'fired'),
  },
  {
    id: 'bird',
    name: 'The Boy Who Cried Bird',
    desc: 'Save Marcus the one time his excuse is true.',
    hint: 'Sometimes the excuse is the truth.',
    test: (s) => s.picked.e6 === 'vouch_trace',
  },
  {
    id: 'donotask',
    name: 'Do Not Ask',
    desc: 'Keep Luis employed without ever looking into the restroom data.',
    hint: 'Some things are better left unpulled.',
    test: (s) => s.people.luis.status !== 'fired' && !s.pulled.e2 && !s.pulled.e5,
  },
  {
    id: 'champion',
    name: 'Culture Champion',
    desc: 'Get Priya an official badge for talking.',
    hint: 'A title outranks a flag.',
    test: (s) => s.people.priya.champion,
  },
];

export function achievements(s) {
  return {
    earned: ACHIEVEMENTS.filter((a) => a.test(s)),
    locked: ACHIEVEMENTS.filter((a) => !a.test(s)),
  };
}

function playerResult(s) {
  const informed = s.picked.e2 === 'confirm' || s.picked.e3 === 'truth'
    || s.picked.e5 === 'blame' || s.picked.e6 === 'expose';
  if (s.flags >= 2) {
    return { label: 'UNDER REVIEW', text: `Integrity flags: ${s.flags}. NARC has questions about your keyboard.` };
  }
  if (s.flags === 1) {
    return { label: 'ON WATCHLIST', text: 'One integrity flag. NARC is “keeping an open mind.”' };
  }
  if (s.score >= 65) {
    return {
      label: 'MODEL EMPLOYEE',
      text: `Visible Activity Index: ${s.score}. NARC describes you as “aligned.”${informed ? ' Your reports about colleagues have been classified as collaboration.' : ''}`,
    };
  }
  return {
    label: 'STILL EMPLOYED',
    text: `Visible Activity Index: ${s.score}. NARC is not sure what you do. It does not have a field for the $40,000 error.`,
  };
}

function companySummary(s) {
  const fired = Object.values(s.people).filter((p) => p.status === 'fired').length;
  const rows = [`Monitored group headcount: ${3 - fired} of 3.`];
  if (fired === 0) {
    rows.push('Retention: 100%. NARC has identified no areas for improvement and is investigating this.');
  } else if (fired >= 2) {
    rows.push('Insufficient staff to sustain the Workforce Intelligence pilot. NARC recommends expansion.');
  } else {
    rows.push('One position is now open. NARC has drafted the posting.');
  }
  rows.push('Employee sentiment: Excellent. Survey responses received: 0.');
  return rows;
}

export function ending(s) {
  return {
    roster: Object.keys(PEOPLE).map((id) => ({
      id,
      name: PEOPLE[id].name,
      role: PEOPLE[id].role,
      status: s.people[id].status,
      label: STATUS_LABEL[s.people[id].status],
      text: epilogue(s, id),
    })),
    you: playerResult(s),
    company: companySummary(s),
    achievements: achievements(s),
    notes: s.notes.map((n) => NOTES[n]),
    noteTotal: Object.keys(NOTES).length,
  };
}

// -------------------------------------------------------------------- view

function progress(s) {
  const enc = currentEncounter(s);
  if (!enc) return null;
  const order = SEQUENCE.filter((n) => n !== 'update');
  return { day: enc.day, n: order.indexOf(enc.id) + 1, of: order.length };
}

export function view(s) {
  const base = {
    phase: s.phase,
    level: s.level,
    strip: {
      index: s.showIndex ? s.score : null,
      flags: s.level >= 2 ? s.flags : null,
      notes: s.notes.length,
    },
  };
  switch (s.phase) {
    case 'intro':
      return {
        ...base,
        kind: 'intro',
        eyebrow: 'NARC · Networked Assessment & Risk Coordination',
        title: 'Monday, 09:02',
        paragraphs: [
          'You are Employee 4417, Operations Associate. Your team has been enrolled in NARC, the company’s new Workforce Support system.',
          'NARC observes work activity to help everyone succeed. It has been described as “supportive.”',
        ],
        controls: [{ id: 'begin', label: 'Start the week', primary: true }],
      };
    case 'signal': {
      const enc = currentEncounter(s);
      return {
        ...base,
        kind: 'signal',
        progress: progress(s),
        title: enc.title,
        subtitle: enc.subtitle,
        rows: enc.signal(s),
        controls: [{ id: 'next', label: 'Look closer', primary: true }],
      };
    }
    case 'inspect': {
      const enc = currentEncounter(s);
      const ev = enc.evidence(s);
      const controls = [];
      if (!s.pulled[enc.id]) controls.push({ id: 'pull', label: ev.label, note: 'One look. Optional.' });
      controls.push({ id: 'next', label: 'Respond', primary: true });
      return {
        ...base,
        kind: 'inspect',
        progress: progress(s),
        title: enc.title,
        subtitle: enc.subtitle,
        sees: enc.sees(s),
        infers: enc.infers(s),
        evidence: s.pulled[enc.id] ? ev.text : null,
        controls,
      };
    }
    case 'choose': {
      const enc = currentEncounter(s);
      return {
        ...base,
        kind: 'choose',
        progress: progress(s),
        title: enc.title,
        subtitle: enc.subtitle,
        prompt: 'What do you do?',
        controls: enc.choices(s).map((c) => ({ id: `choose:${c.id}`, label: c.label, note: c.note })),
      };
    }
    case 'result': {
      const enc = currentEncounter(s);
      return {
        ...base,
        kind: 'result',
        progress: progress(s),
        title: 'NARC updates',
        subtitle: enc.title,
        rows: s.result,
        controls: [{ id: 'next', label: 'Continue', primary: true }],
      };
    }
    case 'reaction': {
      const enc = currentEncounter(s);
      const last = s.node === SEQUENCE.length - 1;
      return {
        ...base,
        kind: 'reaction',
        progress: progress(s),
        title: 'Afterward',
        subtitle: enc.title,
        rows: s.reaction,
        controls: [{ id: 'next', label: last ? 'End of week review' : 'Continue', primary: true }],
      };
    }
    case 'update':
      return {
        ...base,
        kind: 'update',
        eyebrow: 'Wednesday, 15:00 · Company announcement',
        title: 'NARC 2.0',
        paragraphs: [
          'Following a successful Workforce Support pilot, NARC has been granted two new capabilities.',
        ],
        capabilities: [
          ['Behavioral Deviation Detection', 'Understanding what is normal for every employee.'],
          ['Synthetic Activity Identification', 'Supporting authentic work.'],
        ],
        footer: 'Effective immediately. Employees are encouraged to be themselves.',
        rows: s.result,
        controls: [{ id: 'next', label: 'Acknowledge', primary: true }],
      };
    case 'ending':
      return {
        ...base,
        kind: 'ending',
        eyebrow: 'Friday, 17:00',
        title: 'End of week review',
        ending: ending(s),
        controls: [{ id: 'restart', label: 'Start over', primary: true }],
      };
    default:
      throw new Error(`Unknown phase "${s.phase}"`);
  }
}
