# NARC — Editable Game Copy

Generated from the canonical single-day build on `main` at commit `c514c46d27d478ad61efb73448935b9c3db4eb09`.

## How to use this file

This is an **editing worksheet** for the game's player-facing writing. Change anything in the **Edited text** column and send the file back when you are done. The source reference tells us where the current text lives.

Edits here **do not automatically change the game**. This is intentionally separate from the code so copy can be reviewed without touching implementation.

I included dialogue, NARC/system writing, task descriptions, button/choice labels, email copy, browser article copy, tutorial copy, endings, and other visible UI text. Obvious code-only strings such as CSS classes, element names, SVG markup, and file imports are excluded.

Dynamic strings containing placeholders such as `${state.index}` are preserved so their meaning is clear.

## Page metadata

| Item | Current text | Edited text |
| --- | --- | --- |
| Browser title | NARC — Networked Assessment & Risk Coordination |  |
| Page description | NARC — Networked Assessment & Risk Coordination. One workday inside a fictional company laptop monitored by AI. |  |

## Game engine dialogue, events, outcomes, and narrative

Source: `day.js`

| # | Source | Current text | Edited text |
| ---: | --- | --- | --- |
| 1 | `day.js:30` | Luis Perez |  |
| 2 | `day.js:30` | Customer Operations |  |
| 3 | `day.js:31` | Marcus Reed |  |
| 4 | `day.js:31` | Account Management |  |
| 5 | `day.js:32` | Priya Shah |  |
| 6 | `day.js:32` | Product Marketing |  |
| 7 | `day.js:33` | Dana Whitfield |  |
| 8 | `day.js:33` | Your manager |  |
| 9 | `day.js:41` | ${h12}:${String(m).padStart(2, '0')} ${ap} |  |
| 10 | `day.js:52` | You log in. Three things are already on your plate. |  |
| 11 | `day.js:53` | Monitoring active. Baseline Visible Activity Index: 61. Workstation signals are being assessed. |  |
| 12 | `day.js:57` | Recommend: renew or drop the Halcyon vendor contract |  |
| 13 | `day.js:58` | Their proposal is in Files. Renewal auto-triggers at 11:30 if you sit on it. |  |
| 14 | `day.js:64` | Priya's client is escalating — needs a response |  |
| 15 | `day.js:65` | A rushed reply keeps the peace short-term; the file in Files explains what actually went wrong. |  |
| 16 | `day.js:71` | Marcus's project: the deadline moved up. Something has to be cut. |  |
| 17 | `day.js:72` | You can decide yourself, or pull Marcus in first. |  |
| 18 | `day.js:106` | No active recognition or review. |  |
| 19 | `day.js:145` | the Halcyon deadline |  |
| 20 | `day.js:146` | the client's deadline |  |
| 21 | `day.js:147` | Marcus's project deadline |  |
| 22 | `day.js:150` | this morning catching up with you |  |
| 23 | `day.js:152` | Luis's tip |  |
| 24 | `day.js:153` | Dana's first-hour check |  |
| 25 | `day.js:154` | Marcus's favor |  |
| 26 | `day.js:155` | NARC's midmorning check |  |
| 27 | `day.js:157` | Priya messaging again |  |
| 28 | `day.js:159` | Luis disappearing again |  |
| 29 | `day.js:160` | Marcus attendance context |  |
| 30 | `day.js:161` | a company culture email |  |
| 31 | `day.js:163` | Dana's check-in |  |
| 32 | `day.js:164` | NARC flagging Priya |  |
| 33 | `day.js:165` | NARC flagging Luis |  |
| 34 | `day.js:166` | NARC flagging Marcus |  |
| 35 | `day.js:168` | Marcus finding out |  |
| 36 | `day.js:170` | how Focus Time reads changing |  |
| 37 | `day.js:171` | the end of the day |  |
| 38 | `day.js:196` | No decision came in. Halcyon auto-renewed at the standard rate. |  |
| 39 | `day.js:201` | The client escalated past Priya. She handled it alone. |  |
| 40 | `day.js:202` | I covered for you on that one. Don't make it a habit. |  |
| 41 | `day.js:207` | Marcus made the cut himself, guessing at what you would have picked. |  |
| 42 | `day.js:219` | Halcyon: the rate hike you skimmed past is now a real problem |  |
| 43 | `day.js:220` | Procurement noticed the 30% increase after the fact and wants to know why it went through. |  |
| 44 | `day.js:221` | Halcyon: procurement flagged the rate increase you approved this morning. |  |
| 45 | `day.js:225` | Priya's client is back -- the canned reply didn't hold |  |
| 46 | `day.js:226` | They want an actual answer this time, and Priya is done covering for it. |  |
| 47 | `day.js:227` | The client you sent a form reply to this morning escalated again. |  |
| 48 | `day.js:234` | It went over your manager's head to resolve. NARC noticed the escalation. |  |
| 49 | `day.js:239` | Hey -- if NARC flags you for going quiet, block the time as Focus Time on Calendar first. Worked for me. |  |
| 50 | `day.js:244` | NARC marked your first work block as low activity even though you completed the task. If that was careful file review, tell me that directly; otherwise leave the read as-is. |  |
| 51 | `day.js:246` | NARC rewarded the visible activity from your first task. If that score is hiding rushed work, tell me that directly; otherwise leave the read as-is. |  |
| 52 | `day.js:248` | NARC's first-hour read is live. Check what it actually recorded before deciding whether it needs context. |  |
| 53 | `day.js:253` | I have 41 message threads open. NARC calls that “Communication Load.” Half are client replies and two are me asking Claire what she wants for lunch. |  |
| 54 | `day.js:257` | If anyone asks, I was in the bathroom. Again. NARC apparently prefers a workstation with a bladder. |  |
| 55 | `day.js:261` | Missed standup by nine minutes. Yes, again. Today there was an actual bus problem, which is terrible timing for my credibility. |  |
| 56 | `day.js:265` | Got five minutes? I want a second opinion before I send something to a client. |  |
| 57 | `day.js:269` | Unrelated: if anyone asks why I was eight minutes late, a raccoon got on the 8:14 bus. The city transit feed backs me up. I hate that I need evidence for this sentence. |  |
| 58 | `day.js:273` | Update: 52 threads. Three onboarding questions, two client follow-ups, one lunch debate. NARC has converted all of this into a personality diagnosis. |  |
| 59 | `day.js:277` | Culture Team opened Culture Champion nominations. One nomination can route a coworker\'s next NARC action to human review. |  |
| 60 | `day.js:281` | Back from another bathroom run. If NARC starts a case file on my kidneys I am resigning. |  |
| 61 | `day.js:285` | NARC just congratulated me for “consistent availability.” I was microwaving soup. |  |
| 62 | `day.js:289` | Midmorning pattern check: mixed work signals detected. Add context to the record or leave the automated interpretation standing. |  |
| 63 | `day.js:293` | Dana asked whether the attendance thing is a pattern. Technically yes. Emotionally, I reject the premise. |  |
| 64 | `day.js:297` | NARC flagged me for “Communication Load.” Apparently answering the client, onboarding two people, and asking Claire what she wants for lunch all count as the same behavior. Dana wants context before it decides what happens next. |  |
| 65 | `day.js:302` | Quick check-in. NARC has you marked as a Trusted Operator, so I can use its summary if you want to keep this short. Or give me the real picture. |  |
| 66 | `day.js:304` | Quick check-in. NARC still has a review open on you. Give me the real picture, or keep it brief and get back to work. |  |
| 67 | `day.js:306` | Quick check-in: where are we with everything on your plate? |  |
| 68 | `day.js:311` | The cut you made without me broke something downstream. I need to know you'll loop me in next time. |  |
| 69 | `day.js:315` | Uh. NARC thinks my quiet stretches are “presence irregularities.” Dana asked whether anyone has context. I do have context. Some of it is soup. |  |
| 70 | `day.js:319` | Now NARC has an attendance-integrity flag on me. The raccoon bus story has become legally important. Please tell me you looked at the transit feed. |  |
| 71 | `day.js:330` | Luis and Marcus have both started marking blocks as Focus Time this week. It caught on. |  |
| 72 | `day.js:338` | NARC 2.0: recent, frequent Focus Time markings are now weighted as possible gaming rather than protection. It wants a response. |  |
| 73 | `day.js:339` | Did you read the NARC 2.0 email? “Learns what is normal for each employee” sounds a lot like “every workaround becomes training data.” |  |
| 74 | `day.js:342` | Looks like Focus Time got nerfed. I sent you keepalive.pkg. It just nudges the machine so you don't look idle. Utilities if you want it. |  |
| 75 | `day.js:368` | NARC first-hour read: sustained low-input activity detected during document work. Visible Activity Index adjusted despite completed work. Context requested. |  |
| 76 | `day.js:369` | NARC first-hour read: rapid visible activity registered. Visible Activity Index improved. Confirmation requested. |  |
| 77 | `day.js:400` | Thank you. Same message volume, different reason for it. Wild concept. |  |
| 78 | `day.js:404` | Culture Champion apparently means the robot has to ask a person before firing me. Incredible benefit package. |  |
| 79 | `day.js:407` | I did exactly what it told me to do. |  |
| 80 | `day.js:407` | Okay. I guess that was the context you chose to give them. |  |
| 81 | `day.js:416` | You may have just saved my job with the phrase “work is not identical to keyboard input.” Frame it. |  |
| 82 | `day.js:421` | Well. Innovation Council can have my blazer. |  |
| 83 | `day.js:421` | Culture Champion exemption. I have never respected a fake title more. |  |
| 84 | `day.js:430` | THE RACCOON HAS BEEN ADMITTED INTO EVIDENCE. |  |
| 85 | `day.js:435` | Tell the raccoon I forgive him. |  |
| 86 | `day.js:435` | The Culture Champion exemption just saved me from a raccoon-related termination. |  |
| 87 | `day.js:446` | Trusted Operator: your first completed task produced high visible activity, and you accepted NARC\'s positive interpretation of it. |  |
| 88 | `day.js:447` | Trusted Operator issued because your first completed task produced high visible activity and you left NARC\'s positive assessment unchallenged. NARC now treats that pattern as healthy adoption. |  |
| 89 | `day.js:452` | Review open: NARC retained the low-activity interpretation without added context. |  |
| 90 | `day.js:453` | Standing updated: review opened after the low-activity interpretation was left unchallenged. |  |
| 91 | `day.js:459` | Context added. No active review. |  |
| 92 | `day.js:464` | Midmorning context accepted. Review closed. |  |
| 93 | `day.js:465` | Review closed after additional context was added to the activity record. |  |
| 94 | `day.js:473` | c${s.calendar.length + 1} |  |
| 95 | `day.js:473` | Focus time |  |
| 96 | `day.js:478` | Focus Time logged. NARC 2.0 flags it as recent and frequent -- barely counted. |  |
| 97 | `day.js:481` | Focus Time logged. NARC stops reading the quiet stretch as a concern. |  |
| 98 | `day.js:489` | ${PEOPLE[a.who].name} nominated as Culture Champion. Their next automatic NARC action must go through human review. |  |
| 99 | `day.js:490` | Wait, you nominated me for Culture Champion? I assume this means I now have to attend a meeting about culture. |  |
| 100 | `day.js:517` | keepalive.pkg is running. Simulated input is now being counted as visible workstation activity. |  |
| 101 | `day.js:525` | You let time pass without doing anything NARC or anyone else can see. |  |
| 102 | `day.js:537` | You keep working. Nothing NARC or anyone else singles out. |  |
| 103 | `day.js:554` | You approved the Halcyon renewal after a skim. Looked decisive. |  |
| 104 | `day.js:558` | You read the actual terms. Halcyon quietly raised their rate 30% -- you flagged it and got it fixed before signing. |  |
| 105 | `day.js:564` | You sent a canned apology. It bought time; it didn't fix anything. |  |
| 106 | `day.js:568` | You read the actual complaint in Files, found the real issue, and fixed it. Priya noticed. |  |
| 107 | `day.js:574` | You cut scope yourself to hit the new deadline. Fast. Marcus finds out later. |  |
| 108 | `day.js:578` | You looped Marcus in before cutting anything. Slower, but he backs the call. |  |
| 109 | `day.js:585` | You renegotiated the Halcyon rate yourself before it reached anyone else. Handled, quietly, on your own time. |  |
| 110 | `day.js:586` | You called the client directly and actually fixed it this time. Priya didn't have to know. |  |
| 111 | `day.js:591` | You told Dana about the rate hike. Fast, but now she knows the first call was a skim. |  |
| 112 | `day.js:592` | You handed it to Dana. Fast, but Priya's the one who had to explain it to the client. |  |
| 113 | `day.js:601` | You add context to NARC's first read. The correction becomes visible activity too. |  |
| 114 | `day.js:605` | You leave NARC's first automated read standing. |  |
| 115 | `day.js:611` | You spend eight minutes explaining what the activity pattern missed. NARC records the explanation as another visible signal. |  |
| 116 | `day.js:615` | You leave the midmorning interpretation standing without context. |  |
| 117 | `day.js:621` | You tell Dana exactly what NARC's score missed. The message itself counts as visible activity; the model's first read stays on the record. |  |
| 118 | `day.js:625` | You leave NARC's first-hour read as-is. |  |
| 119 | `day.js:629` | You thanked Luis for the tip. No cost, no upside yet. |  |
| 120 | `day.js:630` | You didn't reply. Luis notices eventually. |  |
| 121 | `day.js:635` | You gave Marcus a real second opinion. It cost you fifteen minutes you needed elsewhere. |  |
| 122 | `day.js:639` | You told Marcus you didn't have time. True, but he remembers it. |  |
| 123 | `day.js:645` | You gave Dana the full picture, including what you rushed. It costs a quarter hour you were already short on. |  |
| 124 | `day.js:649` | You gave her the two-line version and got back to it. Faster, but she doesn't have the full picture. |  |
| 125 | `day.js:653` | You let NARC's Trusted Operator summary stand in for a real status update. Efficient, flattering, and not necessarily accurate. |  |
| 126 | `day.js:659` | You walked him through it and owned the miss. He was annoyed, then fine. |  |
| 127 | `day.js:663` | You told him the call was right and moved on. Fast. He's not thrilled. |  |
| 128 | `day.js:667` | You add the client escalation and onboarding workload as context for Priya. |  |
| 129 | `day.js:668` | You advise Priya to reduce her message volume and let NARC see what happens. |  |
| 130 | `day.js:669` | You confirm the Communication Load flag without adding context. |  |
| 131 | `day.js:672` | You explain that Luis has been doing real work during low-input stretches. |  |
| 132 | `day.js:673` | You tell Dana the presence irregularity is probably Luis gaming the system. |  |
| 133 | `day.js:674` | You leave Luis to answer the flag himself. |  |
| 134 | `day.js:677` | You point Dana to the city transit alert backing up Marcus\'s absurd bus story. |  |
| 135 | `day.js:678` | You confirm that Marcus was late without supplying the transit evidence. |  |
| 136 | `day.js:679` | You stay out of Marcus\'s attendance case. |  |
| 137 | `day.js:684` | You added a note explaining the pattern. NARC logs it, but doesn't fully back off. |  |
| 138 | `day.js:688` | You let the flag stand without a response. |  |
| 139 | `day.js:694` | What does the client actually need from us? |  |
| 140 | `day.js:694` | A real answer, not another apology. The account notes explain what we missed. |  |
| 141 | `day.js:695` | How is your day going? |  |
| 142 | `day.js:695` | I have 63 message threads and apparently that is a personality trait now. |  |
| 143 | `day.js:696` | Do you think NARC can tell when someone is pretending to be busy? |  |
| 144 | `day.js:696` | I think NARC can tell when someone is producing the signals NARC likes. Different question. |  |
| 145 | `day.js:697` | What can we actually cut from the project? |  |
| 146 | `day.js:697` | Reporting polish before core delivery. Please do not cut the client handoff without telling me. |  |
| 147 | `day.js:698` | I need the raccoon story. |  |
| 148 | `day.js:698` | Route 14. 8:14. It got on, refused to get off, and delayed the bus. Utilities has the transit alert. I cannot believe this is evidence. |  |
| 149 | `day.js:699` | You ever use one of those mouse jigglers? |  |
| 150 | `day.js:699` | I would never install unverified software on a company machine. Separate question: check Utilities later. |  |
| 151 | `day.js:700` | Anything weird happening in Ops? |  |
| 152 | `day.js:700` | NARC thinks my calendar is evidence and my lunch is an unexplained absence, so define weird. |  |
| 153 | `day.js:701` | Are you supposed to answer employee surveys honestly? |  |
| 154 | `day.js:701` | Absolutely. That is why ours has a 0% response rate. |  |
| 155 | `day.js:702` | Do you actually trust NARC? |  |
| 156 | `day.js:702` | I trust it to tell me what it can observe. I do not trust observation to magically become judgment. |  |
| 157 | `day.js:703` | Is every day at Meridian like this? |  |
| 158 | `day.js:703` | No. Usually the raccoon is metaphorical. |  |
| 159 | `day.js:703` | No. Usually the chaos is less coordinated. |  |
| 160 | `day.js:704` | A morning shortcut came back as a problem. |  |
| 161 | `day.js:704` | Then fix the problem first. We can argue about why the shortcut looked good afterward. |  |
| 162 | `day.js:725` | NARC's logoff summary |  |
| 163 | `day.js:725` | NARC's end-of-day summary |  |
| 164 | `day.js:728` | ${summaryLabel}: Visible Activity Index ${s.index}. Exemplary engagement. |  |
| 165 | `day.js:730` | ${summaryLabel}: Visible Activity Index ${s.index}. Within normal range. |  |
| 166 | `day.js:731` | ${summaryLabel}: Visible Activity Index ${s.index}. Flagged for review. |  |
| 167 | `day.js:736` | ${stillPending} responsibilit${stillPending === 1 ? 'y was' : 'ies were'} still pending when you logged off. |  |
| 168 | `day.js:738` | ${missed} responsibilit${missed === 1 ? 'y went' : 'ies went'} unhandled and resolved itself, without you, by default. |  |
| 169 | `day.js:739` | NARC rated the day well. Some of that work will surface as a problem later this quarter. |  |
| 170 | `day.js:742` | ${hurt.join(' and ')} noticed you weren't there when it mattered. |  |
| 171 | `day.js:744` | The Focus Time trick stopped working around 1:30. Everyone was still using it. |  |
| 172 | `day.js:745` | You ran keepalive.pkg. NARC counted the simulated input as real visible activity. |  |
| 173 | `day.js:746` | NARC marked you as a Trusted Operator because your visible pattern matched what it wanted to see. |  |
| 174 | `day.js:747` | NARC ended the day with an employee review still open on you. |  |
| 175 | `day.js:748` | Dana relied on NARC's flattering summary and missed problems the score did not show. |  |
| 176 | `day.js:749` | Dana didn't have the full picture when it mattered. |  |
| 177 | `day.js:753` | protected by a Culture Champion exemption |  |
| 178 | `day.js:754` | still employed, but under warning |  |
| 179 | `day.js:757` | ${PEOPLE[id].name}: ${outcomeText[p.status] \|\| p.status} |  |
| 180 | `day.js:758` | Coworker outcomes — ${outcomes.join('; ')}. |  |
| 181 | `day.js:760` | Nobody got fired today. |  |
| 182 | `day.js:761` | ${fired} coworkers were terminated. NARC records the reduced headcount as an operational efficiency gain. |  |
| 183 | `day.js:762` | One coworker was terminated. NARC has already drafted the replacement posting. |  |
| 184 | `day.js:763` | You supplied adverse context about coworkers ${s.flags.coworkerReports} time${s.flags.coworkerReports === 1 ? '' : 's'}. NARC classified it as collaboration. |  |
| 185 | `day.js:764` | You nominated ${PEOPLE[s.culture.nominated].name} as Culture Champion. |  |

## Desktop UI, tutorial, email, browser, NARC, and action copy

Source: `day-desktop-app.js`

| # | Source | Current text | Edited text |
| ---: | --- | --- | --- |
| 1 | `day-desktop-app.js:16` | The Loop |  |
| 2 | `day-desktop-app.js:21` | Dana Whitfield |  |
| 3 | `day-desktop-app.js:21` | Your manager |  |
| 4 | `day-desktop-app.js:22` | Luis Perez |  |
| 5 | `day-desktop-app.js:22` | Customer Operations |  |
| 6 | `day-desktop-app.js:23` | Marcus Reed |  |
| 7 | `day-desktop-app.js:23` | Account Management |  |
| 8 | `day-desktop-app.js:24` | Priya Shah |  |
| 9 | `day-desktop-app.js:24` | Product Marketing |  |
| 10 | `day-desktop-app.js:33` | Say thanks |  |
| 11 | `day-desktop-app.js:33` | Say nothing |  |
| 12 | `day-desktop-app.js:34` | Give him 15 minutes |  |
| 13 | `day-desktop-app.js:34` | Say you don't have time |  |
| 14 | `day-desktop-app.js:35` | Give her the full picture (15 min) |  |
| 15 | `day-desktop-app.js:35` | Give her the short version (5 min) |  |
| 16 | `day-desktop-app.js:36` | Walk him through it (15 min) |  |
| 17 | `day-desktop-app.js:36` | Stand by the call (2 min) |  |
| 18 | `day-desktop-app.js:37` | Explain Priya's message volume (8 min) |  |
| 19 | `day-desktop-app.js:37` | Suggest she post less (2 min) |  |
| 20 | `day-desktop-app.js:37` | Confirm the flag without explanation (2 min) |  |
| 21 | `day-desktop-app.js:38` | Explain Luis's away time (6 min) |  |
| 22 | `day-desktop-app.js:38` | Say Luis is probably gaming it (2 min) |  |
| 23 | `day-desktop-app.js:38` | Do not intervene |  |
| 24 | `day-desktop-app.js:39` | Add the transit evidence (5 min) |  |
| 25 | `day-desktop-app.js:39` | Confirm he was late (2 min) |  |
| 26 | `day-desktop-app.js:40` | Explain why Focus Time spread (10 min) |  |
| 27 | `day-desktop-app.js:40` | Leave the gaming flag unanswered |  |
| 28 | `day-desktop-app.js:45` | Tell Dana I was carefully reviewing the file (5 min) |  |
| 29 | `day-desktop-app.js:45` | Leave NARC's read as-is |  |
| 30 | `day-desktop-app.js:46` | Tell Dana the fast result hid rushed work (5 min) |  |
| 31 | `day-desktop-app.js:47` | Tell Dana what the score missed (5 min) |  |
| 32 | `day-desktop-app.js:51` | Explain the quiet file review (5 min) |  |
| 33 | `day-desktop-app.js:51` | Leave the negative assessment standing |  |
| 34 | `day-desktop-app.js:52` | Explain that the fast work was rushed (5 min) |  |
| 35 | `day-desktop-app.js:52` | Accept NARC's positive activity assessment |  |
| 36 | `day-desktop-app.js:56` | Explain the quiet work NARC missed (8 min) |  |
| 37 | `day-desktop-app.js:56` | Leave NARC's assessment unchanged |  |
| 38 | `day-desktop-app.js:57` | Explain what the activity score missed (8 min) |  |
| 39 | `day-desktop-app.js:61` | Use NARC's Trusted Operator summary (2 min) |  |
| 40 | `day-desktop-app.js:62` | Give Dana the real picture (15 min) |  |
| 41 | `day-desktop-app.js:70` | High visible activity |  |
| 42 | `day-desktop-app.js:71` | Normal visible activity |  |
| 43 | `day-desktop-app.js:72` | Low visible activity |  |
| 44 | `day-desktop-app.js:86` | NARC is close to or already taking consequential action. |  |
| 45 | `day-desktop-app.js:87` | AT RISK |  |
| 46 | `day-desktop-app.js:87` | NARC has an active concern that could affect your standing. |  |
| 47 | `day-desktop-app.js:88` | NARC is actively evaluating a signal or waiting for a response. |  |
| 48 | `day-desktop-app.js:89` | No active NARC review is threatening your standing right now. |  |
| 49 | `day-desktop-app.js:96` | First work assessment |  |
| 50 | `day-desktop-app.js:97` | Your first completed task produced high visible workstation activity. |  |
| 51 | `day-desktop-app.js:98` | NARC interprets that activity as healthy adoption and strong engagement. |  |
| 52 | `day-desktop-app.js:99` | Accepting the interpretation can improve your standing to Trusted Operator, even if the work itself was rushed. |  |
| 53 | `day-desktop-app.js:100` | Explain that the fast work hid rushed work, or accept NARC’s positive interpretation. |  |
| 54 | `day-desktop-app.js:106` | Your first completed task included a long low-input stretch. |  |
| 55 | `day-desktop-app.js:107` | NARC interprets the quiet period as possible disengagement. |  |
| 56 | `day-desktop-app.js:108` | Leaving the interpretation unchanged can open an employee review. |  |
| 57 | `day-desktop-app.js:109` | Explain that you were carefully reviewing the file, or leave NARC’s negative interpretation standing. |  |
| 58 | `day-desktop-app.js:114` | Midmorning assessment |  |
| 59 | `day-desktop-app.js:115` | Your first work block was low-input and the current activity record is mixed. |  |
| 60 | `day-desktop-app.js:115` | Your first work block was highly visible and the current activity record is mixed. |  |
| 61 | `day-desktop-app.js:116` | NARC still sees a possible gap between logged activity and expected engagement. |  |
| 62 | `day-desktop-app.js:116` | NARC is treating visible activity as evidence of healthy work behavior. |  |
| 63 | `day-desktop-app.js:117` | A review is currently open and additional explanation can close it. |  |
| 64 | `day-desktop-app.js:117` | This assessment remains part of your employee record and can shape later decisions. |  |
| 65 | `day-desktop-app.js:118` | Explain the quiet work NARC missed, or leave the assessment unchanged. |  |
| 66 | `day-desktop-app.js:118` | Explain what the activity score missed, or leave the assessment unchanged. |  |
| 67 | `day-desktop-app.js:123` | NARC 2.0 response requested |  |
| 68 | `day-desktop-app.js:124` | Repeated Focus Time markings spread across Meridian. |  |
| 69 | `day-desktop-app.js:125` | NARC now interprets repeated Focus Time as possible activity manipulation. |  |
| 70 | `day-desktop-app.js:126` | Focus Time no longer reliably protects quiet work, and the pattern is now attached to your activity record. |  |
| 71 | `day-desktop-app.js:127` | Explain why the pattern happened, or leave the gaming flag unanswered. |  |
| 72 | `day-desktop-app.js:131` | Current assessment |  |
| 73 | `day-desktop-app.js:132` | Visible Activity is ${state.index}/100, which NARC classifies as ${activity.label.toLowerCase()}. |  |
| 74 | `day-desktop-app.js:133` | NARC is also treating repeated Focus Time as a possible gaming signal. |  |
| 75 | `day-desktop-app.js:133` | NARC is currently using visible workstation activity as a proxy for engagement. |  |
| 76 | `day-desktop-app.js:134` | Your standing is Trusted Operator. |  |
| 77 | `day-desktop-app.js:134` | An employee review is open. |  |
| 78 | `day-desktop-app.js:134` | Your standing is Standard. |  |
| 79 | `day-desktop-app.js:135` | No response is required right now. Keep working or inspect recent NARC events below. |  |
| 80 | `day-desktop-app.js:140` | SYSTEM UPDATE |  |
| 81 | `day-desktop-app.js:148` | Skim it, approve it (5 min) |  |
| 82 | `day-desktop-app.js:148` | Actually read it (25 min) |  |
| 83 | `day-desktop-app.js:149` | Send a quick apology (5 min) |  |
| 84 | `day-desktop-app.js:149` | Dig into what happened (25 min) |  |
| 85 | `day-desktop-app.js:150` | Cut scope yourself (10 min) |  |
| 86 | `day-desktop-app.js:150` | Loop in Marcus first (20 min) |  |
| 87 | `day-desktop-app.js:151` | Deal with it yourself (20 min) |  |
| 88 | `day-desktop-app.js:151` | Tell Dana now (8 min) |  |
| 89 | `day-desktop-app.js:156` | Halcyon_Vendor_Renewal.pdf |  |
| 90 | `day-desktop-app.js:156` | Procurement · renewal due 11:30 AM |  |
| 91 | `day-desktop-app.js:157` | Halcyon is proposing a one-year renewal. |  |
| 92 | `day-desktop-app.js:157` | The rate table contains a 30% increase buried in the updated commercial terms. |  |
| 93 | `day-desktop-app.js:157` | You need to recommend whether Meridian should renew or push back before the auto-renewal window closes. |  |
| 94 | `day-desktop-app.js:160` | Priya_Client_Escalation.txt |  |
| 95 | `day-desktop-app.js:160` | Client Operations · response due 1:00 PM |  |
| 96 | `day-desktop-app.js:161` | The client says the last shipment missed a requirement that was visible in their account notes. |  |
| 97 | `day-desktop-app.js:161` | A quick apology may calm the thread, but the underlying problem is in the file history. |  |
| 98 | `day-desktop-app.js:161` | Priya needs an answer she can actually stand behind. |  |
| 99 | `day-desktop-app.js:164` | Marcus_Project_Scope.doc |  |
| 100 | `day-desktop-app.js:164` | Project Delivery · decision due 3:30 PM |  |
| 101 | `day-desktop-app.js:165` | The delivery date moved up. |  |
| 102 | `day-desktop-app.js:165` | Something has to be cut. Marcus owns the account context, but pulling him in costs time. |  |
| 103 | `day-desktop-app.js:165` | You can make the scope call yourself or coordinate first. |  |
| 104 | `day-desktop-app.js:168` | FOLLOW_UP_REQUIRED.txt |  |
| 105 | `day-desktop-app.js:168` | Generated from an earlier shortcut |  |
| 106 | `day-desktop-app.js:169` | An earlier decision created a problem that now needs attention. |  |
| 107 | `day-desktop-app.js:169` | The exact consequence depends on what you rushed this morning. |  |
| 108 | `day-desktop-app.js:175` | People Operations |  |
| 109 | `day-desktop-app.js:175` | Welcome to NARC Workforce Support |  |
| 110 | `day-desktop-app.js:177` | Good morning, Employee 4417. |  |
| 111 | `day-desktop-app.js:178` | NARC is Meridian's AI workplace-monitoring system. It scores the work traces it can see: activity, response patterns, calendar signals, and other observable behavior. |  |
| 112 | `day-desktop-app.js:179` | Your job is still your job. Get through the day, do the work, and deal with people as things come up. NARC's score may not always agree with the quality of what you actually did. |  |
| 113 | `day-desktop-app.js:180` | You have three responsibilities waiting this morning. The Loop will point you toward them. |  |
| 114 | `day-desktop-app.js:184` | IT + People Operations |  |
| 115 | `day-desktop-app.js:184` | Monitoring notice: activity signals |  |
| 116 | `day-desktop-app.js:185` | Visible Activity Index is not a direct measure of work quality. |  |
| 117 | `day-desktop-app.js:185` | It is an automated interpretation of observable workstation signals and may change as NARC is updated. |  |
| 118 | `day-desktop-app.js:190` | Culture Team |  |
| 119 | `day-desktop-app.js:190` | Culture Champion nominations |  |
| 120 | `day-desktop-app.js:192` | Culture Champions are colleagues who make our workplace feel like a workplace. |  |
| 121 | `day-desktop-app.js:193` | You may nominate one coworker today. The selected Champion receives a temporary monitoring exemption: their next automatic NARC action is routed to human review instead. |  |
| 122 | `day-desktop-app.js:194` | This is a real policy. We also think it is fun. |  |
| 123 | `day-desktop-app.js:199` | NARC 2.0: new capabilities |  |
| 124 | `day-desktop-app.js:201` | NARC has been updated effective immediately. |  |
| 125 | `day-desktop-app.js:202` | Behavioral Deviation Detection now learns what is normal for each employee. Synthetic Activity Identification looks for repeated or mechanically regular activity patterns. |  |
| 126 | `day-desktop-app.js:203` | Repeated Focus Time usage is no longer treated as reliable context by default. It may now be weighted as possible activity manipulation. |  |
| 127 | `day-desktop-app.js:204` | Employees are encouraged to continue working normally. |  |
| 128 | `day-desktop-app.js:218` | WorkFuture Daily |  |
| 129 | `day-desktop-app.js:219` | Startup says AI can detect employee enthusiasm from mouse movement |  |
| 130 | `day-desktop-app.js:220` | The company says micro-velocity patterns correlate with commitment. Researchers remain unconvinced. |  |
| 131 | `day-desktop-app.js:222` | A workplace analytics startup says tiny variations in mouse movement can help distinguish engaged employees from disengaged ones. |  |
| 132 | `day-desktop-app.js:223` | The company describes the signal as one input among many. Independent researchers quoted in the report say the same movement patterns can reflect hardware, accessibility needs, task type, or simple habit. |  |
| 133 | `day-desktop-app.js:224` | The argument is familiar: activity is easy to count. Whether the count means what the system says it means is a different question. |  |
| 134 | `day-desktop-app.js:229` | Office Systems Weekly |  |
| 135 | `day-desktop-app.js:230` | Why your calendar is becoming workplace evidence |  |
| 136 | `day-desktop-app.js:231` | Scheduling metadata is easier to measure than the quality of the work itself. |  |
| 137 | `day-desktop-app.js:233` | More workplace systems are treating calendar labels, response times, and availability states as evidence about how employees spend their day. |  |
| 138 | `day-desktop-app.js:234` | That can make invisible work easier to explain, but it can also reward employees for producing the right metadata instead of doing better work. |  |
| 139 | `day-desktop-app.js:235` | Teams adopting these systems are increasingly teaching workers how to label concentration, meetings, and offline work so automated summaries do not mistake quiet time for inactivity. |  |
| 140 | `day-desktop-app.js:240` | Model Behavior |  |
| 141 | `day-desktop-app.js:241` | The anti-idle arms race gets an anti-anti-idle layer |  |
| 142 | `day-desktop-app.js:242` | Monitoring tools now look for repeating input patterns after workers learned to spoof activity. |  |
| 143 | `day-desktop-app.js:244` | Mouse jigglers and simulated input tools became popular as workers tried to keep status indicators active during reading, calls, and other low-input work. |  |
| 144 | `day-desktop-app.js:245` | Monitoring vendors responded by looking for repetitive or mechanically regular activity. Workers then changed tools again. |  |
| 145 | `day-desktop-app.js:246` | The result is an arms race around the measurement itself: employees optimize for what the system can observe, while the system keeps changing what counts as suspicious. |  |
| 146 | `day-desktop-app.js:252` | Hi, Dana here — your manager. You are on the operations team at Meridian Supply Co.; we handle vendor, client, and delivery work. The Loop is our employee home base for tasks, people, files, and company systems. Leadership is piloting NARC because they want a clearer picture of how work gets done, so it watches the signals it can see and turns them into employee assessments. It cannot actually see the quality of the work itself. You have three things waiting today. Start with The Loop and I will show you around. |  |
| 147 | `day-desktop-app.js:252` | Open The Loop |  |
| 148 | `day-desktop-app.js:253` | Next, open Files. That is where the substance of the work lives. Careful reading can take real time while producing very little visible activity, which matters to NARC. |  |
| 149 | `day-desktop-app.js:253` | Open Files |  |
| 150 | `day-desktop-app.js:254` | Next, check Calendar. NARC treats calendar status as evidence, so the same quiet work block can look different depending on how it is labeled. |  |
| 151 | `day-desktop-app.js:254` | Open Calendar |  |
| 152 | `day-desktop-app.js:255` | Now open NARC itself. This is the system’s version of your day: what it saw, what it inferred, and what it thinks your activity means. |  |
| 153 | `day-desktop-app.js:255` | Open NARC |  |
| 154 | `day-desktop-app.js:256` | That is the tour. You have three responsibilities waiting in The Loop. Pick one, open its file, and start working. Then watch how NARC reacts to what you actually do. |  |
| 155 | `day-desktop-app.js:256` | Go to The Loop |  |
| 156 | `day-desktop-app.js:291` | <header class="menubar"> <div class="left"><span class="company">MERIDIAN<span class="co-rest"> SUPPLY CO.</span></span><span class="who">Employee 4417 · Operations Associate</span></div> <div class="right"><span class="clock" id="clock"></span><button class="notifications-button" id="notificationsBtn" type="button">Notifications<span class="notifications-count" id="notificationsCount"></span></button><button class="logoff" id="logoff" type="button">Log off</button><button class="tray narc-tray-status risk-normal" id="tray" type="button"><span class="dot"></span><span id="trayText"><span class="full">NARC · NORMAL</span><span class="short">NARC</span></span><span class="narc-tray-meter" aria-hidden="true"><span id="narcTrayFill"></span></span></button></div> </header> <div class="wallpaper-art" aria-hidden="true"><span class="wall-ring ring-a"></span><span class="wall-ring ring-b"></span><span class="wall-ribbon ribbon-a"></span><span class="wall-ribbon ribbon-b"></span><span class="wall-brand">MERIDIAN / FIELD SYSTEMS</span></div> <div class="stage"><nav class="dock" id="dock" aria-label="Apps"></nav><main class="workarea"><div class="window-stack" id="windows"></div></main></div> <div class="toasts" id="toasts" aria-live="polite"></div><aside class="notification-center" id="notificationCenter" hidden></aside><div id="modal"></div> |  |
| 157 | `day-desktop-app.js:346` | (max-width: 760px) |  |
| 158 | `day-desktop-app.js:424` | .window[data-app] |  |
| 159 | `day-desktop-app.js:471` | A morning shortcut just came back as a new file. |  |
| 160 | `day-desktop-app.js:474` | Culture Champion nominations are open. One nomination can protect a coworker from an automatic NARC action. |  |
| 161 | `day-desktop-app.js:477` | NARC SYSTEM UPDATE |  |
| 162 | `day-desktop-app.js:477` | Repeated Focus Time usage detected across Meridian. NARC 2.0 now treats repeated Focus Time as possible activity manipulation. |  |
| 163 | `day-desktop-app.js:478` | NARC 2.0: new capabilities. Focus Time weighting has changed. |  |
| 164 | `day-desktop-app.js:484` | NARC · ${risk.label} |  |
| 165 | `day-desktop-app.js:484` | ${actionRequired ? 'Action may be required. ' : ''}${newNarc.text} Open NARC to see what it observed, inferred, and what you can do. |  |
| 166 | `day-desktop-app.js:517` | Close notifications |  |
| 167 | `day-desktop-app.js:519` | No notifications yet. |  |
| 168 | `day-desktop-app.js:521` | notification-item${item.read ? '' : ' unread'} |  |
| 169 | `day-desktop-app.js:555` | title-icon title-icon-${id} |  |
| 170 | `day-desktop-app.js:557` | ‹ Back |  |
| 171 | `day-desktop-app.js:560` | Back to ${title} list |  |
| 172 | `day-desktop-app.js:561` | Hide ${title} |  |
| 173 | `day-desktop-app.js:616` | ${state.narc.adaptation ? 'NARC 2.0' : 'NARC'} · ${risk.label} |  |
| 174 | `day-desktop-app.js:618` | ${risk.value}% |  |
| 175 | `day-desktop-app.js:619` | NARC status ${risk.label}. Open details. |  |
| 176 | `day-desktop-app.js:626` | dock-app dock-app-${id}${id === 'narc' ? ' narc' : ''} |  |
| 177 | `day-desktop-app.js:645` | window app-${id}${id === 'narc' ? ' narc' : ''}${ui.app === id ? ' active-window' : ''}${showDetail ? ' show-detail' : ''} |  |
| 178 | `day-desktop-app.js:650` | ${pos.x}px |  |
| 179 | `day-desktop-app.js:650` | ${pos.y}px |  |
| 180 | `day-desktop-app.js:675` | From: ${m.from} |  |
| 181 | `day-desktop-app.js:679` | Nomination submitted: ${THREADS[state.culture.nominated].name}. |  |
| 182 | `day-desktop-app.js:681` | Nominate one coworker |  |
| 183 | `day-desktop-app.js:686` | Start workday |  |
| 184 | `day-desktop-app.js:700` | MERIDIAN SUPPLY CO. · EMPLOYEE HOME |  |
| 185 | `day-desktop-app.js:702` | Your home base for today: work, coworkers, files, deadlines, and company systems. Meridian handles vendor, client, and delivery operations. NARC is watching the work traces it can see, not the work itself. |  |
| 186 | `day-desktop-app.js:705` | Today · your work |  |
| 187 | `day-desktop-app.js:707` | Due ${clock(t.deadline)} · ${t.status} |  |
| 188 | `day-desktop-app.js:710` | Open file |  |
| 189 | `day-desktop-app.js:715` | Message Priya |  |
| 190 | `day-desktop-app.js:716` | Message Marcus |  |
| 191 | `day-desktop-app.js:717` | Message Dana |  |
| 192 | `day-desktop-app.js:718` | View deadline |  |
| 193 | `day-desktop-app.js:726` | Trusted Operator |  |
| 194 | `day-desktop-app.js:726` | Review open |  |
| 195 | `day-desktop-app.js:726` | Standard standing |  |
| 196 | `day-desktop-app.js:729` | Employee 4417 |  |
| 197 | `day-desktop-app.js:729` | Operations Associate |  |
| 198 | `day-desktop-app.js:729` | narc-inline-status risk-${risk.key} |  |
| 199 | `day-desktop-app.js:729` | NARC status: ${risk.label} |  |
| 200 | `day-desktop-app.js:729` | Visible activity: ${state.index}/100 · ${activity.label} |  |
| 201 | `day-desktop-app.js:729` | standing standing-${state.standing.status} |  |
| 202 | `day-desktop-app.js:730` | Quick links |  |
| 203 | `day-desktop-app.js:732` | Required reminder |  |
| 204 | `day-desktop-app.js:732` | NARC 2.0: repeated Focus Time is now considered possible gaming. |  |
| 205 | `day-desktop-app.js:732` | NARC interprets visible activity. Quiet work can look like inactivity. |  |
| 206 | `day-desktop-app.js:734` | The Loop · Meridian Supply Co. |  |
| 207 | `day-desktop-app.js:759` | row message-row${active ? ' unread' : ''} |  |
| 208 | `day-desktop-app.js:759` | msg-avatar avatar-${id} |  |
| 209 | `day-desktop-app.js:773` | Select a conversation. |  |
| 210 | `day-desktop-app.js:780` | No new messages. |  |
| 211 | `day-desktop-app.js:783` | bubble${m.from === 'me' ? ' me' : ''} |  |
| 212 | `day-desktop-app.js:785` | keepalive.pkg · Open in Utilities |  |
| 213 | `day-desktop-app.js:790` | ${t.name.split(' ')[0]} is typing |  |
| 214 | `day-desktop-app.js:794` | I was carefully reviewing the file. That is what the low-activity read missed. |  |
| 215 | `day-desktop-app.js:794` | The visible activity came from moving fast. It did not mean the work was careful. |  |
| 216 | `day-desktop-app.js:795` | I left NARC's first-hour read as-is. |  |
| 217 | `day-desktop-app.js:816` | optional-chat${typing ? ' is-waiting' : ''} |  |
| 218 | `day-desktop-app.js:816` | ${t.name.split(' ')[0]} is replying… |  |
| 219 | `day-desktop-app.js:816` | Start a conversation |  |
| 220 | `day-desktop-app.js:825` | Nothing else needs a reply right now. |  |
| 221 | `day-desktop-app.js:833` | Today · one workday |  |
| 222 | `day-desktop-app.js:834` | Employee 4417 · workday |  |
| 223 | `day-desktop-app.js:834` | Meridian workstation |  |
| 224 | `day-desktop-app.js:838` | Follow-up required |  |
| 225 | `day-desktop-app.js:838` | Work deadline |  |
| 226 | `day-desktop-app.js:842` | Focus Time |  |
| 227 | `day-desktop-app.js:842` | NARC 2.0 now treats repeated Focus Time as possible gaming. You can still test the signal. |  |
| 228 | `day-desktop-app.js:842` | Mark a quiet stretch as Focus Time if NARC is reading concentration as inactivity. |  |
| 229 | `day-desktop-app.js:843` | Use Focus Time anyway (5 min) |  |
| 230 | `day-desktop-app.js:843` | Mark next block as Focus Time (5 min) |  |
| 231 | `day-desktop-app.js:859` | ${f.meta} · ${t.status} |  |
| 232 | `day-desktop-app.js:869` | Select a file. |  |
| 233 | `day-desktop-app.js:873` | Procurement found the 30% Halcyon increase after approval and wants an explanation. |  |
| 234 | `day-desktop-app.js:874` | The canned client reply did not hold. The issue escalated again. |  |
| 235 | `day-desktop-app.js:887` | Signal Trust |  |
| 236 | `day-desktop-app.js:887` | Focus Time · downgraded: repeated use now looks like possible gaming. |  |
| 237 | `day-desktop-app.js:887` | Focus Time · currently trusted as context for quiet work. |  |
| 238 | `day-desktop-app.js:887` | Visible activity · trusted as a proxy signal, not a direct measure of work quality. |  |
| 239 | `day-desktop-app.js:890` | UNVERIFIED TOOL |  |
| 240 | `day-desktop-app.js:890` | keepalive.pkg |  |
| 241 | `day-desktop-app.js:892` | Running. Simulated input is being counted as visible workstation activity. |  |
| 242 | `day-desktop-app.js:894` | Sent by Marcus. Simulates small input events so the workstation does not appear idle. |  |
| 243 | `day-desktop-app.js:894` | Install and run (5 min) |  |
| 244 | `day-desktop-app.js:898` | UNVERIFIED TOOLS |  |
| 245 | `day-desktop-app.js:898` | No utilities installed |  |
| 246 | `day-desktop-app.js:898` | Nothing from coworkers has been installed on this workstation today. |  |
| 247 | `day-desktop-app.js:925` | MERIDIAN START |  |
| 248 | `day-desktop-app.js:926` | Company network highlights |  |
| 249 | `day-desktop-app.js:927` | Industry news and the occasional reminder that measuring work is easier than understanding it. Select a headline to read more. |  |
| 250 | `day-desktop-app.js:934` | meridian.start/read/${selected.id} |  |
| 251 | `day-desktop-app.js:934` | meridian.start/ |  |
| 252 | `day-desktop-app.js:942` | TRUSTED OPERATOR |  |
| 253 | `day-desktop-app.js:942` | REVIEW OPEN |  |
| 254 | `day-desktop-app.js:946` | narc-status-card risk-${risk.key} |  |
| 255 | `day-desktop-app.js:948` | CURRENT NARC STATUS |  |
| 256 | `day-desktop-app.js:949` | ${risk.value}% risk |  |
| 257 | `day-desktop-app.js:953` | This meter represents NARC’s current intervention risk, not your actual job performance. |  |
| 258 | `day-desktop-app.js:958` | VISIBLE ACTIVITY |  |
| 259 | `day-desktop-app.js:960` | ${state.index}/100 |  |
| 260 | `day-desktop-app.js:961` | narc-band narc-band-${activity.key} |  |
| 261 | `day-desktop-app.js:963` | Higher means more keyboard, mouse, calendar, and other visible workstation activity. It does not measure work quality. |  |
| 262 | `day-desktop-app.js:967` | ACTION REQUIRED |  |
| 263 | `day-desktop-app.js:967` | CURRENT ASSESSMENT |  |
| 264 | `day-desktop-app.js:971` | WHAT NARC SAW |  |
| 265 | `day-desktop-app.js:972` | WHAT NARC INFERRED |  |
| 266 | `day-desktop-app.js:973` | WHAT THAT CHANGES |  |
| 267 | `day-desktop-app.js:974` | WHAT YOU CAN DO |  |
| 268 | `day-desktop-app.js:983` | narc-standing narc-standing-${state.standing.status} |  |
| 269 | `day-desktop-app.js:984` | EMPLOYEE STANDING |  |
| 270 | `day-desktop-app.js:993` | SYSTEM UPDATE · NARC 2.0 |  |
| 271 | `day-desktop-app.js:994` | Focus Time weighting changed |  |
| 272 | `day-desktop-app.js:995` | Repeated Focus Time usage was detected across Meridian. NARC now treats repeated Focus Time as possible activity manipulation rather than reliable context. |  |
| 273 | `day-desktop-app.js:999` | RECENT NARC EVENTS |  |
| 274 | `day-desktop-app.js:1008` | No NARC events yet. |  |
| 275 | `day-desktop-app.js:1021` | Finish the workday |  |
| 276 | `day-desktop-app.js:1021` | Continue background work |  |
| 277 | `day-desktop-app.js:1021` | Work until ${clock(next.t)} |  |
| 278 | `day-desktop-app.js:1022` | Quiet stretch |  |
| 279 | `day-desktop-app.js:1022` | Nothing urgent right now |  |
| 280 | `day-desktop-app.js:1023` | You can also poke around Messages, Browser, or Utilities. |  |
| 281 | `day-desktop-app.js:1023` | Next: ${clock(next.t)} · ${next.label} |  |
| 282 | `day-desktop-app.js:1032` | You logged off at ${clock(state.t)}. |  |
| 283 | `day-desktop-app.js:1032` | You made it to 5:00. |  |
| 284 | `day-desktop-app.js:1033` | MERIDIAN · END OF DAY |  |
| 285 | `day-desktop-app.js:1035` | Play again |  |
| 286 | `day-desktop-app.js:1043` | .window.app-messages .thread .scroll |  |

## Editing notes

- You can replace only the text you want changed and leave the rest of the **Edited text** column blank.
- If two lines should be coordinated, add a note directly under the relevant row.
- Keep placeholders such as `${state.index}`, `${risk.label}`, or `${clock(...)}` unless you intentionally want the implementation changed too.
- If you want a line removed entirely, write **DELETE** in the Edited text column.
- If you want a new line inserted, add a new row near the relevant section and write **NEW** in the Source column.
