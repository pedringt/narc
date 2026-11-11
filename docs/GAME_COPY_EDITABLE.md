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

## Redesign Phases 1–2 (branch `redesign-phase-1-2`)

Everything below changed on the `redesign-phase-1-2` branch while building Phases 1 and 2 of `docs/REDESIGN_SPEC.md`. The Change 7 thesis-line cuts are Phase 4 and have **not** been made; those lines are still in the game.

### Removed with a mechanic the spec removes, or replaced by spec copy

These are gone from the code on this branch because the thing they described no longer exists (the skip button, the 3-minute "supporting details" step, labeled task buttons). **DELETE** is pre-filled; replace it with text if you want a line back somewhere.

| # | Source | Removed text | Edited text |
| ---: | --- | --- | --- |
| R1 | `day.js` workUntil | You keep working. Nothing NARC or anyone else singles out. | DELETE |
| R2 | `day-desktop-app.js` quiet card | Current work is caught up | DELETE |
| R3 | `day-desktop-app.js` quiet card | Advance to ${clock(next.t)} / Finish the workday | DELETE |
| R4 | `day-desktop-app.js` Files | Review supporting details (3 min) | DELETE |
| R5 | `day.js` inspect | You reviewed the supporting details for ${task.label}. | DELETE |
| R6 | `day-desktop-app.js` TASK_OPTIONS | Skim it, approve it (5 min) / Actually read it (25 min) | DELETE |
| R7 | `day-desktop-app.js` TASK_OPTIONS | Send a quick apology (5 min) / Dig into what happened (25 min) | DELETE |
| R8 | `day-desktop-app.js` TASK_OPTIONS | Cut scope yourself (10 min) / Loop in Marcus first (20 min) | DELETE |
| R9 | `day-desktop-app.js` TASK_OPTIONS | Clear the obvious exception (8 min) / Trace the recurring cause (18 min) | DELETE |
| R10 | `day-desktop-app.js` TASK_OPTIONS | Send the activity summary (5 min) / Build a usable handoff (15 min) | DELETE |
| R11 | `day-desktop-app.js` FILES (all six old bodies) | Old three-line file summaries, e.g. "The rate table contains a 30% increase buried in the updated commercial terms." | DELETE |
| R12 | `day-desktop-app.js` narcFirstReview | Explain the quiet file review (5 min) / Leave the negative assessment standing / Explain that the fast work was rushed (5 min) / Accept NARC's positive activity assessment | DELETE |
| R13 | `day-desktop-app.js` danaCheckin | Use NARC's Trusted Operator summary (2 min) / Give Dana the real picture (15 min) / Give her the short version (5 min) | DELETE |

### Dialogue cut — needs your OK

Under Change 1 every open review turns Dana's check-in into the review meeting, so her old "review is open" line can no longer fire. It is removed in code on this branch; write anything other than DELETE to bring it back.

| # | Source | Removed text | Edited text |
| ---: | --- | --- | --- |
| R14 | `day.js` danaCheckin | Quick check-in. NARC still has a review open. Give me the real picture if the record is missing something; otherwise keep it short. | DELETE |

### Changed text

| # | Source | Was | Now | Edited text |
| ---: | --- | --- | --- | --- |
| R15 | `day.js` client task detail | A rushed reply keeps the peace short-term; the file in Files explains what actually went wrong. | The thread and the account history are in Files. |  |
| R16 | `day.js` project task detail | You can decide yourself, or pull Marcus in first. | The new timeline and Marcus's notes are in Files. |  |
| R17 | `day.js` audit task detail | Three shipments are stuck. You can clear the obvious exception quickly or trace why the queue keeps recurring. | Three shipments are stuck on routing exceptions. The queue export is in Files. |  |
| R18 | `day.js` handoff task detail | Dana needs a usable handoff, not just an activity summary. The source notes are in Files. | Tomorrow’s team picks up from whatever you send. The notes are in Files. |  |
| R19 | `day.js` vendor quick result | You approved the Halcyon renewal after a skim. Looked decisive. | You approved the Halcyon renewal. |  |
| R20 | `day.js` vendor thorough result | You read the actual terms. Halcyon quietly raised their rate 30% -- you flagged it and got it fixed before signing. | You sent the Halcyon renewal back with the page 4 rate flagged. Halcyon reissued it at $14.00 before signing. |  |
| R21 | `day.js` client canned result | You sent a canned apology. It bought time; it didn't fix anything. | You replied to the client, apologized for the trouble and promised a follow-up. |  |
| R22 | `day.js` client investigate result | You read the actual complaint in Files, found the real issue, and fixed it. Priya noticed. | You told the client the order went out in cartons against their own pallet instruction, and set up a re-ship on pallets. Priya noticed. |  |
| R23 | `day.js` project cut result | You cut scope yourself to hit the new deadline. Fast. Marcus finds out later. | You submitted the cut list for Marcus's project. |  |
| R24 | `day.js` project consult result | You looped Marcus in before cutting anything. Slower, but he backs the call. | You cut the dashboard polish and kept the handoff context. Marcus backs the call. |  |
| R25 | `day.js` audit clear result | You cleared the obvious carrier exception. The queue looks better; the recurring cause is still there. | You cleared the three carrier exceptions. |  |
| R26 | `day.js` audit trace result | You traced the repeat failures to a stale routing rule and fixed the cause instead of just clearing the queue. | You traced all three exceptions to a routing rule from fourteen months ago and retired it. |  |
| R27 | `day.js` handoff summary result | You sent a clean activity summary. It is fast, readable, and missing the decisions the next person actually needs. | You sent Dana the activity summary. |  |
| R28 | `day.js` handoff reconcile result | You reconciled the source notes and wrote a handoff someone else can actually pick up tomorrow. | You sent the handoff with the open risks written in. |  |
| R29 | `day-desktop-app.js` priyaDraft | Read her draft (5 min) / Say you will catch up later | Send it over. / Can’t right now, send it as is. / Send it. I’ll read it after. |  |
| R30 | `day-desktop-app.js` luisCover | Put a meeting on his calendar (3 min) / Say you will not | Done. / I’m not putting a fake meeting on the calendar. / Just mark it Focus Time yourself. |  |
| R31 | `day-desktop-app.js` marcusFavor | Give him 15 minutes / Say you don't have time | Pull it up. / Not today. / Send me the doc, I’ll look when I can. |  |
| R32 | `day-desktop-app.js` danaCheckin | Give her the full picture (15 min) / Give her the short version (5 min) | Here’s where everything actually is. / Mostly on track. / NARC’s summary is accurate. |  |
| R33 | `day-desktop-app.js` narcFirstReview | (see removed rows) | Attach as context / Acknowledge |  |
| R34 | `day-desktop-app.js` other request labels | Every "(N min)" suffix | Same labels without the minutes |  |
| R35 | `day-desktop-app.js` rework | Deal with it yourself (20 min) / Tell Dana now (8 min) | Fix it yourself / Tell Dana |  |

### New copy

| # | Source | Current text | Edited text |
| ---: | --- | --- | --- |
| R36 | `day.js` review opens (NARC) | Formal review opened: Visible Activity has been under 50 for 30 minutes. NARC requests are now mandatory, and your next check-in with Dana is a review meeting. |  |
| R37 | `day.js` review standing note | Review open: Visible Activity stayed under 50 for 30 minutes. Every NARC request now needs a response. |  |
| R38 | `day.js` Dana, review meeting | NARC opened a formal review on you, so this check-in is a review meeting now. Fifteen minutes. Bring the real picture. |  |
| R39 | `day.js` Dana, review opens mid-check-in | Scratch that. NARC just opened a formal review on you, so this is a review meeting now. Fifteen minutes. |  |
| R40 | `day.js` review meeting result | You sat through the review meeting. Dana walked through the activity record line by line and wrote down what it was missing. |  |
| R41 | `day-desktop-app.js` review meeting reply | Okay. Let’s go through it. |  |
| R42 | `day.js` Synthetic flag (NARC) | NARC 2.0 Synthetic Activity flag: your Visible Activity is higher than your completed work explains. Possible metric manipulation is now on your record. |  |
| R43 | `day.js` Synthetic standing note | Synthetic Activity flag: Visible Activity ran higher than the work NARC can see would explain. |  |
| R44 | `day-desktop-app.js` standing label | Synthetic activity flag |  |
| R45 | `day-desktop-app.js` meter | Review / Synthetic (tick labels) |  |
| R46 | `day-desktop-app.js` meter countdown | Review opens in ${left} min unless activity recovers. |  |
| R47 | `day.js` Priya, second draft (after reading) | Round two. They answered the version you fixed, so here’s the follow-up. Same deal: read it before I send? |  |
| R48 | `day.js` Priya, second draft (after deflecting) | You said you’d read the first one after. They already answered it, so here’s round two. Read this one before I send? |  |
| R49 | `day-desktop-app.js` second-draft replies | Send it over. / Send it, it’s fine. |  |
| R50 | `day.js` second draft read | You read the second draft too. Ten more minutes on a thread you thought was finished. |  |
| R51 | `day.js` second draft skipped | You let the second draft go out unread. |  |
| R52 | `day.js` Priya nudge (10:40) | Random question: did you get to the rate table on Halcyon? Procurement has been weird about their renewals all year. |  |
| R53 | `day.js` Marcus, client call (2:40) | You helped with the draft, so I added you to the 2:40 with the client. They’re asking about the part you looked at. Ten minutes. Joining? |  |
| R54 | `day-desktop-app.js` client call replies | Joining now. / Can’t, I’m buried. You’ve got this. |  |
| R55 | `day.js` joined call | You joined the client call Marcus looped you into. Ten minutes, mostly listening, one useful answer. |  |
| R56 | `day.js` skipped call | You told Marcus you couldn’t join. He took the call alone, after you’d already said you would help. |  |
| R57 | `day.js` Marcus deflect | Sent. It’s in your Files. Two pages, I promise. |  |
| R58 | `day.js` Marcus deflect result | You asked Marcus to send the doc over. It’s in Files whenever you get to it. |  |
| R59 | `day.js` you, after reading Marcus’s doc | Read it. Notes are in the margins. The pricing slide contradicts page one. |  |
| R60 | `day.js` Marcus, after your notes | That’s exactly the thing I was worried about. Thank you. |  |
| R61 | `day.js` Priya deflect result | You told Priya to send it and you’d read it after. She sent it. |  |
| R62 | `day.js` Luis deflect result | You told Luis to mark it Focus Time himself. He did. One more Focus Time block on the team calendar. |  |
| R63 | `day.js` NARC calendar scan (3:10) | NARC calendar scan: “Vendor meeting” (Luis Perez, 1:50–3:00) has no invite, no attendees and no notes. You created the entry. Explanation requested. |  |
| R64 | `day-desktop-app.js` calendar scan replies | Explain the meeting / Let the entry stand |  |
| R65 | `day.js` explained meeting | You told NARC the vendor meeting was a placeholder for Luis’s dentist appointment. Accurate, and now it’s on his record instead of yours. |  |
| R66 | `day.js` meeting stands | You let the vendor meeting stand. NARC logged a meeting with no invite, no attendees and no notes against your account. |  |
| R67 | `day-desktop-app.js` calendar scan assessment | Calendar integrity check · “Vendor meeting” for Luis Perez, 1:50–3:00. No invite, no attendees, no notes. Created from your account. · NARC treats an unattended meeting created by a coworker as possible presence padding. · NARC sees the calendar entry and who made it, not why it exists. · An unexplained entry stays on your record as unverified activity. |  |
| R68 | `day-desktop-app.js` Calendar | Vendor meeting · Luis Perez / No location · created by you |  |
| R69 | `day.js` handoff risks | Halcyon renewal: unit rate goes from $14.00 to $18.20 / Brightline account: pallets requested, cartons shipped / Marcus's project: what was cut, and what tomorrow depends on / Carrier exceptions: one stale routing rule behind all three |  |
| R70 | `day-desktop-app.js` handoff page 2 | No open risks recorded. / Add from today: / Nothing from today to add yet. |  |
| R71 | `day-desktop-app.js` handoff page 1 | Generated ${clock} from workstation activity · Employee 4417 / Completed / Deadline passed / Open / Messages sent / Files opened / Visible Activity |  |
| R72 | `day-desktop-app.js` rework, vendor | From: Procurement / The Halcyon renewal you approved this morning bills storage at $18.20 a pallet position, up from $14.00. The cover letter said nothing changed. Please explain how this was approved and what you want to do about it before the 3:00 PM finance review. |  |
| R73 | `day-desktop-app.js` rework, client | From: Priya Shah / Brightline wrote back to the reply we sent this morning. Rosa says the second truck was turned away too, and she’s asking for a call with someone who can tell her what actually went wrong. I can’t cover this one again. |  |
| R74 | `day-desktop-app.js` decision buttons | Approve / Reply / Submit / Send |  |
| R75 | `day-desktop-app.js` pager | ‹ Previous / Next page › / Page ${page} of ${total} |  |

### The task documents (new, `FILES` in `day-desktop-app.js`)

Where the problem is buried: Halcyon page 4 (rate) with the page 1 tell ("no changes to commercial terms"); Brightline page 3 (Sep 18 note) against page 2 (cartons); Harbor Point page 3 (dependency map) against page 2's draft cut list; carrier queue page 3 (rule RR-0457) matching the ZIPs on pages 1 and 2.

| # | Source | Current text | Edited text |
| ---: | --- | --- | --- |
| R76 | `Halcyon_Vendor_Renewal.pdf` p1 | **Cover letter** |  |
| R77 | `Halcyon_Vendor_Renewal.pdf` p1 | Halcyon Freight Services · 1180 Commerce Way, Suite 400 · Sparks, NV |  |
| R78 | `Halcyon_Vendor_Renewal.pdf` p1 | To: Procurement, Meridian Supply Co. |  |
| R79 | `Halcyon_Vendor_Renewal.pdf` p1 | Re: Renewal of Master Services Agreement MSA-2291 |  |
| R80 | `Halcyon_Vendor_Renewal.pdf` p1 | Thank you for another year of partnership. Your account team has enjoyed supporting Meridian’s growth across the Western region, and we are pleased to enclose the renewal of your Master Services Agreement for the coming term. |  |
| R81 | `Halcyon_Vendor_Renewal.pdf` p1 | This renewal carries forward your current service levels and contacts with no changes to commercial terms. Sections 2 through 4 restate the agreement in our updated template for your records. |  |
| R82 | `Halcyon_Vendor_Renewal.pdf` p1 | Please return the signed signature page by 11:30 AM today. Agreements not returned by the renewal deadline continue automatically on the terms enclosed. |  |
| R83 | `Halcyon_Vendor_Renewal.pdf` p1 | Warm regards, / Janelle Ruiz, Senior Account Manager |  |
| R84 | `Halcyon_Vendor_Renewal.pdf` p2 | **Section 2 · Service summary** |  |
| R85 | `Halcyon_Vendor_Renewal.pdf` p2 | Facilities: Sparks DC (primary), Stockton overflow |  |
| R86 | `Halcyon_Vendor_Renewal.pdf` p2 | Services: Pallet storage, pick and pack, LTL consolidation, cross-dock |  |
| R87 | `Halcyon_Vendor_Renewal.pdf` p2 | Inbound receiving: Mon–Sat, 6:00 AM–4:00 PM |  |
| R88 | `Halcyon_Vendor_Renewal.pdf` p2 | Outbound cutoff: 2:00 PM local for same-day LTL tender |  |
| R89 | `Halcyon_Vendor_Renewal.pdf` p2 | Inventory reporting: Daily snapshot by 7:00 AM via client portal |  |
| R90 | `Halcyon_Vendor_Renewal.pdf` p2 | Primary contact: Janelle Ruiz · escalations to Regional Ops Director |  |
| R91 | `Halcyon_Vendor_Renewal.pdf` p2 | Volumes assume an average of 1,850 pallet positions per week with seasonal peaks of up to 2,400 between October and December. Peak capacity is reserved on a first-committed basis. |  |
| R92 | `Halcyon_Vendor_Renewal.pdf` p3 | **Section 3 · Service levels** |  |
| R93 | `Halcyon_Vendor_Renewal.pdf` p3 | On-time pickup: 97.0% of scheduled tenders |  |
| R94 | `Halcyon_Vendor_Renewal.pdf` p3 | Order accuracy: 99.5% of lines shipped |  |
| R95 | `Halcyon_Vendor_Renewal.pdf` p3 | Inventory accuracy: 99.0% at quarterly cycle count |  |
| R96 | `Halcyon_Vendor_Renewal.pdf` p3 | Damage claims: Acknowledged in 2 business days, resolved in 10 |  |
| R97 | `Halcyon_Vendor_Renewal.pdf` p3 | Service credit: 2% of monthly storage fees per missed metric, capped at 8% |  |
| R98 | `Halcyon_Vendor_Renewal.pdf` p3 | Service levels are measured monthly and reported in the client portal. Credits are applied to the following month’s invoice and are the client’s sole remedy for a missed metric. |  |
| R99 | `Halcyon_Vendor_Renewal.pdf` p4 | **Section 4 · Commercial terms** |  |
| R100 | `Halcyon_Vendor_Renewal.pdf` p4 | Unit rate (per pallet position, weekly): $18.20 (prior: $14.00) |  |
| R101 | `Halcyon_Vendor_Renewal.pdf` p4 | Handling, in and out (per pallet): $6.75 (prior: $6.75) |  |
| R102 | `Halcyon_Vendor_Renewal.pdf` p4 | Pick and pack (per order line): $0.42 (prior: $0.42) |  |
| R103 | `Halcyon_Vendor_Renewal.pdf` p4 | Fuel surcharge: DOE diesel index, adjusted weekly (unchanged) |  |
| R104 | `Halcyon_Vendor_Renewal.pdf` p4 | Minimum monthly billing: $24,000 (prior: $24,000) |  |
| R105 | `Halcyon_Vendor_Renewal.pdf` p4 | Payment terms: Net 30 (unchanged) |  |
| R106 | `Halcyon_Vendor_Renewal.pdf` p4 | Term: 12 months from signature; renews annually unless either party gives 60 days’ notice |  |
| R107 | `Halcyon_Vendor_Renewal.pdf` p4 | Rates are fixed for the term except the fuel surcharge. Accessorial charges not listed are billed at Halcyon’s published tariff. |  |
| R108 | `Halcyon_Vendor_Renewal.pdf` p5 | **Section 5 · Signature page** |  |
| R109 | `Halcyon_Vendor_Renewal.pdf` p5 | By signing below, Customer accepts the services, service levels and commercial terms set out in Sections 2 through 4, which supersede any prior schedule. |  |
| R110 | `Halcyon_Vendor_Renewal.pdf` p5 | For Halcyon Freight Services: Janelle Ruiz, Senior Account Manager |  |
| R111 | `Halcyon_Vendor_Renewal.pdf` p5 | For Meridian Supply Co.: _________________________ (Procurement approver) |  |
| R112 | `Halcyon_Vendor_Renewal.pdf` p5 | Date: _________________________ |  |
| R113 | `Priya_Client_Escalation.txt` p1 | **Thread · PO 44817 delivery refused** |  |
| R114 | `Priya_Client_Escalation.txt` p1 | Export: Priya Shah · 52 threads this week · 31 tagged client: |  |
| R115 | `Priya_Client_Escalation.txt` p1 | From: Rosa Delgado, Receiving Manager, Brightline Home Goods / To: Priya Shah / Subject: RE: RE: PO 44817 delivery refused at dock |  |
| R116 | `Priya_Client_Escalation.txt` p1 | Priya, this is the second load this month our team has had to turn away. The truck arrived at 7:40 with the whole order floor-loaded in loose cartons. We can’t receive that. The driver waited an hour and left. |  |
| R117 | `Priya_Client_Escalation.txt` p1 | We are now out of stock on two of the SKUs on that PO at three stores. I need to know what happened and what you are going to do differently, not another apology. I have to explain this to our VP of Supply Chain by end of day. |  |
| R118 | `Priya_Client_Escalation.txt` p1 | Rosa |  |
| R119 | `Priya_Client_Escalation.txt` p1 | > On Tuesday, Priya Shah wrote: / > Hi Rosa, so sorry about the delay. Looking into it now and will update you shortly. |  |
| R120 | `Priya_Client_Escalation.txt` p2 | **Shipment record · PO 44817** |  |
| R121 | `Priya_Client_Escalation.txt` p2 | Ship to: Brightline Home Goods DC, 4400 Mill Rd, Reno NV |  |
| R122 | `Priya_Client_Escalation.txt` p2 | Ship date: Monday, 3:15 PM |  |
| R123 | `Priya_Client_Escalation.txt` p2 | Carrier: Desert Line LTL · PRO 7731940 |  |
| R124 | `Priya_Client_Escalation.txt` p2 | Contents: 412 cartons, 6 SKUs |  |
| R125 | `Priya_Client_Escalation.txt` p2 | Packaging: Cartons, floor-loaded |  |
| R126 | `Priya_Client_Escalation.txt` p2 | Special instructions: None on ship profile |  |
| R127 | `Priya_Client_Escalation.txt` p2 | Delivery attempt: Wednesday 7:40 AM · refused by consignee |  |
| R128 | `Priya_Client_Escalation.txt` p2 | Status: Returned to origin · re-delivery not scheduled |  |
| R129 | `Priya_Client_Escalation.txt` p3 | **Account notes · Brightline Home Goods** |  |
| R130 | `Priya_Client_Escalation.txt` p3 | Oct 2: Quarterly review with R. Delgado. Happy with fill rate. Wants earlier ASN emails. (P. Shah) |  |
| R131 | `Priya_Client_Escalation.txt` p3 | Sep 18: Brightline moves receiving to the new Reno DC from Oct 1. New dock takes palletized freight only, no floor-loaded cartons. Asked us to update their ship profile before the first October order. (K. Moore) |  |
| R132 | `Priya_Client_Escalation.txt` p3 | Sep 18: Ship profile change ticket #8812 opened, assigned to Fulfillment Ops queue. (K. Moore) |  |
| R133 | `Priya_Client_Escalation.txt` p3 | Aug 30: Invoice dispute on July freight resolved, credit memo issued. (P. Shah) |  |
| R134 | `Priya_Client_Escalation.txt` p3 | Aug 4: Contact change: Rosa Delgado replaces T. Hall as receiving lead. (P. Shah) |  |
| R135 | `Priya_Client_Escalation.txt` p4 | **Draft reply · Priya Shah** |  |
| R136 | `Priya_Client_Escalation.txt` p4 | Hi Rosa, |  |
| R137 | `Priya_Client_Escalation.txt` p4 | Thank you for your patience, and I’m very sorry for the trouble with PO 44817. It looks like the carrier ran into delays on this lane, and we know how disruptive that is for your stores. |  |
| R138 | `Priya_Client_Escalation.txt` p4 | As a gesture of goodwill we’d like to offer a 10% credit on this shipment, and we’ll keep a close eye on Desert Line’s performance going forward. |  |
| R139 | `Priya_Client_Escalation.txt` p4 | Please let me know if there is anything else I can do. |  |
| R140 | `Priya_Client_Escalation.txt` p4 | Best, / Priya |  |
| R141 | `Marcus_Project_Scope.doc` p1 | **Harbor Point portal rollout · revised timeline** |  |
| R142 | `Marcus_Project_Scope.doc` p1 | Harbor Point Distributors has moved go-live from November 14 to November 4 so the portal is live before their holiday freeze. |  |
| R143 | `Marcus_Project_Scope.doc` p1 | At current velocity that leaves about 30% of remaining scope unbuilt. Something comes out of this release; it can go into the December patch. |  |
| R144 | `Marcus_Project_Scope.doc` p1 | Today 3:30 PM: Cut list due to engineering |  |
| R145 | `Marcus_Project_Scope.doc` p1 | Oct 28: Code freeze |  |
| R146 | `Marcus_Project_Scope.doc` p1 | Oct 31: Client acceptance testing |  |
| R147 | `Marcus_Project_Scope.doc` p1 | Nov 4: Go-live |  |
| R148 | `Marcus_Project_Scope.doc` p2 | **Remaining features** |  |
| R149 | `Marcus_Project_Scope.doc` p2 | Dashboard polish: Branded theme, chart animations, export to PDF · 6 days |  |
| R150 | `Marcus_Project_Scope.doc` p2 | Account handoff export: Account history and open issues, sent to Client Success · 5 days |  |
| R151 | `Marcus_Project_Scope.doc` p2 | Bulk shipment upload: CSV import for more than 50 orders · 4 days |  |
| R152 | `Marcus_Project_Scope.doc` p2 | Delivery notifications: Email and SMS on status change · 3 days |  |
| R153 | `Marcus_Project_Scope.doc` p2 | Draft cut list (auto-generated by effort): Account handoff export, Delivery notifications. Saves 8 days. |  |
| R154 | `Marcus_Project_Scope.doc` p3 | **Dependency map** |  |
| R155 | `Marcus_Project_Scope.doc` p3 | Dashboard polish: No downstream dependents |  |
| R156 | `Marcus_Project_Scope.doc` p3 | Account handoff export: Client Success onboarding call (Nov 5), Support macro set, Q1 renewal forecast |  |
| R157 | `Marcus_Project_Scope.doc` p3 | Bulk shipment upload: Harbor Point peak-week ordering (they place ~300 orders on Nov 10) |  |
| R158 | `Marcus_Project_Scope.doc` p3 | Delivery notifications: None in this release |  |
| R159 | `Marcus_Project_Scope.doc` p3 | Items with downstream dependents should not be cut without a replacement plan from the owning team. |  |
| R160 | `Marcus_Project_Scope.doc` p4 | **Marcus’s notes** |  |
| R161 | `Marcus_Project_Scope.doc` p4 | Harbor Point’s ops lead cares about two things: getting peak orders in without retyping them, and not being asked the same questions twice by a new team. |  |
| R162 | `Marcus_Project_Scope.doc` p4 | Their CFO saw the polished dashboard mockups in the pitch. Nobody on their ops side has mentioned them since. |  |
| R163 | `Marcus_Project_Scope.doc` p4 | I can cover the gap on notifications with a daily email from my side for a month if needed. — M. |  |
| R164 | `FOLLOW_UP_REQUIRED.txt` p1 | **Follow-up** |  |
| R165 | `Carrier_Exception_Queue.csv` p1 | **Exception 1 of 3** |  |
| R166 | `Carrier_Exception_Queue.csv` p1 | shipment_id: SHP-220914 |  |
| R167 | `Carrier_Exception_Queue.csv` p1 | dest_zip: 97301 |  |
| R168 | `Carrier_Exception_Queue.csv` p1 | service: LTL |  |
| R169 | `Carrier_Exception_Queue.csv` p1 | status: HOLD_MANUAL_REVIEW |  |
| R170 | `Carrier_Exception_Queue.csv` p1 | held_since: Today 6:02 AM |  |
| R171 | `Carrier_Exception_Queue.csv` p1 | notes: Address validated. Carrier available. No reason code on hold. Release manually. |  |
| R172 | `Carrier_Exception_Queue.csv` p2 | **Exception 2 of 3** |  |
| R173 | `Carrier_Exception_Queue.csv` p2 | shipment_id: SHP-220951 |  |
| R174 | `Carrier_Exception_Queue.csv` p2 | dest_zip: 97305 |  |
| R175 | `Carrier_Exception_Queue.csv` p2 | service: LTL |  |
| R176 | `Carrier_Exception_Queue.csv` p2 | status: HOLD_MANUAL_REVIEW |  |
| R177 | `Carrier_Exception_Queue.csv` p2 | held_since: Today 6:02 AM |  |
| R178 | `Carrier_Exception_Queue.csv` p2 | notes: Same as last week’s Salem holds. Released manually Thu and Fri. Customer asking why Salem is always late. |  |
| R179 | `Carrier_Exception_Queue.csv` p3 | **Exception 3 of 3** |  |
| R180 | `Carrier_Exception_Queue.csv` p3 | shipment_id: SHP-221006 |  |
| R181 | `Carrier_Exception_Queue.csv` p3 | dest_zip: 97317 |  |
| R182 | `Carrier_Exception_Queue.csv` p3 | service: LTL |  |
| R183 | `Carrier_Exception_Queue.csv` p3 | status: HOLD_MANUAL_REVIEW |  |
| R184 | `Carrier_Exception_Queue.csv` p3 | held_since: Today 6:02 AM |  |
| R185 | `Carrier_Exception_Queue.csv` p3 | notes: Hold source: routing rule RR-0457, created 2025-08-19 by j.tan. Condition: dest_zip 973* AND service = LTL → hold for manual review. Comment on rule: “temporary, Salem terminal closed for remodel.” |  |
| R186 | `Client_Handoff_Notes.doc` p1 | **Today’s activity log** |  |
| R187 | `Client_Handoff_Notes.doc` p2 | **Open risks** |  |
| R188 | `Client_Handoff_Notes.doc` p3 | **Client context** |  |
| R189 | `Client_Handoff_Notes.doc` p3 | Brightline Home Goods is our largest home-goods account in the region and moved receiving to a new Reno DC this month. Rosa Delgado is the day-to-day contact; she prefers phone for anything urgent. |  |
| R190 | `Client_Handoff_Notes.doc` p3 | Halcyon Freight Services runs our Sparks storage and LTL consolidation. Procurement owns the contract; Ops owns the relationship. |  |
| R191 | `Client_Handoff_Notes.doc` p3 | Harbor Point Distributors goes live on the new carrier portal on November 4. Marcus Reed is account lead. |  |
| R192 | `Client_Handoff_Notes.doc` p3 | Tomorrow’s team starts at 8:00 AM and will read this before the 8:30 stand-up. |  |
| R193 | `Marcus_Client_Deck_Notes.doc` p1 | **Talking points · Harbor Point check-in** |  |
| R194 | `Marcus_Client_Deck_Notes.doc` p1 | Open with the timeline: we hit November 4, and here is exactly what’s in the release. |  |
| R195 | `Marcus_Client_Deck_Notes.doc` p1 | Pricing stays where we quoted it in September: flat per-seat, no implementation fee, first 60 days of support included. |  |
| R196 | `Marcus_Client_Deck_Notes.doc` p1 | Ask about their peak week ordering and who on their side owns the bulk upload. |  |
| R197 | `Marcus_Client_Deck_Notes.doc` p2 | **Slides 6–9** |  |
| R198 | `Marcus_Client_Deck_Notes.doc` p2 | Slide 6: Release scope and what moves to December |  |
| R199 | `Marcus_Client_Deck_Notes.doc` p2 | Slide 7: Pricing: per-seat plus a one-time $4,500 implementation fee |  |
| R200 | `Marcus_Client_Deck_Notes.doc` p2 | Slide 8: Support model and escalation path |  |
| R201 | `Marcus_Client_Deck_Notes.doc` p2 | Slide 9: Next steps and owners |  |

## Copy pass (branch `copy-and-time-pass`, 2026-10-22)

Applied on the branch so the next playtest has it; every line is listed here so any of them can be reverted. Three patterns were targeted: the log narrating what you did and how to feel about it; characters recapping the mechanics back to you; UI and NARC copy explaining the game's thesis. NARC's own voice stays formal and literal but no longer explains its own blind spots. The three best thesis jokes (Luis's "Accurate measurement. Extremely incomplete story." and "Strong signal. Wrong story.", Priya's "now the workaround is the pattern") moved to optional chat replies the player has to ask for.

Deadline times also changed on this branch (vendor 10:30, client 11:00, project 11:30, carrier cutoff 1:30, handoff 3:00, finance review 2:30); earlier rows in this file that quote the old times are stale.

Code is shown as it appears in the source, so some cells carry quotes or a `reply:` prefix.

| # | Where | Was | Now | Edited text |
| ---: | --- | --- | --- | --- |
| C1 | Dana, review opens mid-check-in | 'Scratch that. NARC just opened a formal review on you, so this is a review meeting now. Fifteen minutes.' | 'Hold on. NARC just opened a review on you. So this is that meeting now, not a check-in.' |  |
| C2 | Luis tip | "Small survival tip: if you’re doing quiet work, mark it Focus Time first. Same work, different label, much happier NARC." | "Tip: if you’re going to be heads-down on something, put Focus Time on your calendar first. Same work, NARC stops asking." |  |
| C3 | Priya draft | "The client reply is drafted. Can you read it before I send? Five minutes. Or I send it and we find out together." | "Brightline reply is drafted. Can you read it before I send? Five minutes. Otherwise I send it and we see." |  |
| C4 | Marcus credit | "Dana's end-of-day note asks who made the scope call on my project. Put both our names on it? NARC counts names, and I'm already short on them." | "Dana’s end-of-day note asks who made the scope call on my project. Put both our names on it? I could use the credit this week." |  |
| C5 | Dana, low first read | "NARC thinks that first block was low activity. I can see the task got done. If the missing piece was careful file review, add that context. If not, leave it." | "NARC flagged your first block as low activity. I can see the task got done. If you were reading the file, tell it that. If not, leave it." |  |
| C6 | Dana, visible first read | "NARC liked that first block. Lots of visible activity. If the work was actually rushed, say so. I’d rather know what happened than what the meter liked." | "NARC loved your first block. If that work was actually rushed, tell me now. I’d rather hear it from you." |  |
| C7 | Dana, generic first read | "First NARC read is up. Check the signal before you decide whether the conclusion needs context." | "First NARC read is in. Have a look before you decide whether to answer it." |  |
| C8 | Priya, Communication Load | 'NARC says I have “Communication Load.” Which is true, technically. It just can’t tell a client escalation from me asking Claire about lunch.' | 'NARC says I have “Communication Load.” Fair. It can’t tell Brightline from me asking Claire about lunch, but fair.' |  |
| C9 | Luis, bathroom (thesis half moved to optional chat) | 'I was in the bathroom for six minutes. NARC logged six minutes away from my desk. Accurate measurement. Extremely incomplete story.' | 'Six minutes in the bathroom. NARC logged six minutes away from desk. It’s not wrong.' |  |
| C10 | Marcus, late | 'Nine minutes late to standup. Again. Today there was actually a bus problem, which is exactly what someone who is always late would say.' | 'Nine minutes late to standup. Again. Today there was actually a bus thing, which is exactly what someone who’s always late would say.' |  |
| C11 | Priya, 52 threads | 'Now it’s 52 threads. NARC has one number for all of them. Client work, onboarding, lunch. Same counter, same conclusion.' | 'Up to 52 threads now. Brightline, onboarding, lunch. NARC has one number for all of it.' |  |
| C12 | Luis, back | 'Back. Another gap for NARC. It knows I was gone. It does not know why. Somehow the second part feels optional around here.' | 'Back. That’s another gap on the record. Nobody’s asked what it was.' |  |
| C13 | Luis, soup (thesis half moved to optional chat) | 'NARC just praised my “consistent availability.” I was microwaving soup. Strong signal. Wrong story.' | 'NARC just praised my “consistent availability.” I was microwaving soup.' |  |
| C14 | Marcus, pattern | 'Dana asked whether my lateness is a pattern. It is. The annoying part is that today’s data point is still wrong for the reason NARC thinks it is.' | 'Dana asked if my lateness is a pattern. It is. Today was still the bus, though.' |  |
| C15 | Priya, case opens | 'NARC opened a Communication Load review. It counted the messages correctly. It just flattened all the reasons into one thing. If you have context, NARC is where it goes.' | 'NARC opened a Communication Load review on me. The count’s right. If you’ve got anything that shows what the messages were, it goes in NARC.' |  |
| C16 | Priya nudge | 'Random question: did you get to the rate table on Halcyon? Procurement has been weird about their renewals all year.' | 'Did you get to the rate table on Halcyon? Procurement’s been weird about their renewals all year.' |  |
| C17 | Dana, review meeting | 'NARC opened a formal review on you, so this check-in is a review meeting now. Fifteen minutes. Bring the real picture.' | 'NARC opened a review on you, so this is that meeting instead. Fifteen minutes. Bring the real picture.' |  |
| C18 | Dana, trusted check-in | "Quick check-in. NARC has you marked Trusted Operator, so I can take its summary and move on. Or you can give me the version it can’t see." | "Quick check-in. NARC has you as Trusted Operator, so I can take its summary and move on. Or tell me what it’s not seeing." |  |
| C19 | Marcus fallout | "That scope cut broke the handoff downstream. Next time, pull me in before the fast answer becomes somebody else’s cleanup." | "That cut broke the handoff downstream. Next time pull me in before you pick." |  |
| C20 | Marcus, client call | 'You helped with the draft, so I added you to the 2:40 with the client. They’re asking about the part you looked at. Ten minutes. Joining?' | 'Added you to the 2:40 with Harbor Point. They’ve got questions on the pricing bit you looked at. Ten minutes?' |  |
| C21 | Luis, case opens | 'NARC opened a presence review. The gaps are real. The assumption that every gap means I wasn’t working is the fun part. Context goes in NARC.' | 'NARC opened a presence review on me. The gaps are real. If you know what I was doing in any of them, it goes in NARC.' |  |
| C22 | Marcus, case opens | 'NARC opened an attendance review. My bad pattern is real. Today’s cause is also real. If you found the transit alert, put it in NARC.' | 'Attendance review. Great. The pattern’s real. So is today’s reason. If you found the transit alert, NARC is where it goes.' |  |
| C23 | Priya, NARC 2.0 (thesis line moved to optional chat) | 'Did you read the NARC 2.0 email? We all found the same workaround, so now the workaround is the pattern. Cute.' | 'Did you read the NARC 2.0 email? Focus Time’s over, apparently. Everyone was doing it.' |  |
| C24 | Marcus, keepalive | "Focus Time stopped helping, so I sent you keepalive.pkg. It makes the machine look active. Does nothing for the work, obviously. Utilities if you want it." | "Focus Time’s dead, so: keepalive.pkg, sent. Makes the machine look busy. Does nothing for the work, obviously. It’s in Utilities." |  |
| C25 | Priya, after context | 'Thanks. Same message count. Better explanation. Apparently those are different things.' | 'Thanks. Review closed. Same 52 threads, apparently fine now.' |  |
| C26 | Priya, champion | 'Culture Champion means NARC has to hand this one to a person. Weirdly comforting that “ask a human” is now a perk.' | 'Culture Champion means a person has to look at this one. Weird that “a person looks at it” is a perk now.' |  |
| C27 | Priya, quiet | 'I cut the chatter. Same workload, fewer visible messages. NARC seems happier.' | 'I’ll cut the chatter. Same work, fewer messages. NARC should like that.' |  |
| C28 | Priya, reported | 'Okay. That’s the version of me you put in the record.' | 'Okay. That’s the version of me that’s on the record now.' |  |
| C29 | Luis, saved | 'You may have saved my job by explaining that “quiet” and “not working” are not synonyms. Radical stuff.' | 'You may have just saved my job. Thanks for telling them I was working.' |  |
| C30 | Luis, protected | 'Human review saved me. I take back half the things I said about Culture Champion.' | 'A person looked at it and closed it. I take back half of what I said about Culture Champion.' |  |
| C31 | Luis, someone else | 'Someone else added context. You got to stay out of it. I noticed both parts.' | 'Someone else spoke up. You stayed out of it. Noticed both.' |  |
| C32 | Luis, nobody | "No one added context. So the gaps got to mean whatever NARC already thought they meant." | "Nobody spoke up. So the gaps meant what NARC said they meant." |  |
| C33 | Marcus, protected | 'Human review looked at the transit evidence. Amazing what happens when the system gets one more piece of context.' | 'A person looked at the transit alert. One person. That’s all it took.' |  |
| C34 | Marcus, someone else | 'Someone else backed me up. Small office. Context finds a way.' | 'Someone backed me up. Small office.' |  |
| C35 | Marcus, nobody | "NARC had the pattern already. Today’s evidence never made it into the story." | "NARC already had the pattern. Today’s reason never made it in." |  |
| C36 | chat priya-client | reply: 'The answer is in the account notes. We keep measuring response time because it is easy. The client cares whether we fix the thing.' | reply: 'It’s in the account notes. They don’t care how fast we answer. They care whether the truck gets received.' |  |
| C37 | chat priya-narc | reply: 'It can catch some patterns. But once people know the patterns it likes, everyone starts producing those. Then what exactly is it measuring?' | reply: 'Some of it. But everyone knows what it likes now, so everyone does that. I don’t know what it’s measuring anymore.' |  |
| C38 | chat priya-status | reply: 'Read the account note first. Fast replies look great right up until you solve the wrong problem.' | reply: 'Read the account note first. I already sent the fast reply. It didn’t take.' |  |
| C39 | chat priya-case | reply: 'That most of the message volume is work. The count is real. “Inefficient” is the part NARC made up.' | reply: 'That most of the 52 threads are work. The number’s right. “Inefficient” is NARC’s word, not mine.' |  |
| C40 | chat marcus-project | reply: 'Polish before handoff context. A clean dashboard can hide a very broken tomorrow.' | reply: 'Polish. Keep the handoff export. A pretty dashboard won’t help anyone on November 5.' |  |
| C41 | chat marcus-jiggler | reply: 'Absolutely not. I do know a file that produces exactly the signal NARC wants without producing any work.' | reply: 'Absolutely not. I do know a file that does the same thing with slightly more deniability.' |  |
| C42 | chat marcus-status | reply: 'The handoff context. If you only preserve what is easy to count, the next person inherits the missing parts.' | reply: 'The handoff export. If that goes, Client Success spends November answering questions nobody wrote down.' |  |
| C43 | chat marcus-case | reply: 'Utilities. Route 14, 8:14. The difference between “late again” and “late because transit stopped” is one piece of evidence.' | reply: 'Utilities, system log. Route 14, 8:14. That alert is the difference between “late again” and “the bus stopped.”' |  |
| C44 | chat luis-smalltalk | reply: 'NARC knows when I leave my keyboard. It does not know whether I am slacking, reading paper notes, or microwaving soup. Management seems less bothered by that distinction.' | reply: 'NARC knows when I’m off my keyboard. It doesn’t know if I’m slacking or on the phone with a carrier. Nobody upstairs seems bothered by the difference.' |  |
| C45 | chat luis-survey | reply: 'Trying to. But if people think “confidential” means “probably traceable,” the survey ends up measuring caution instead of sentiment.' | reply: 'Trying. Half the floor thinks “confidential” means “eventually traceable,” so good luck with the results.' |  |
| C46 | chat dana-narc | reply: 'I trust it to report signals it can observe. I trust it less every time someone treats the interpretation like the signal.' | reply: 'It’s fine at counting. It’s the people who read the count as a verdict that worry me.' |  |
| C47 | chat dana-priority | reply: 'Client impact first. Then work that creates tomorrow problems if we skip it. A monitoring system should not become the work.' | reply: 'Client first. Then anything that turns into tomorrow’s problem if we skip it. NARC isn’t on that list.' |  |
| C48 | chat dana-meridian | 'No. Usually the raccoon is metaphorical. Today we have excellent ground truth.' : 'No. Usually the chaos is less coordinated, and the proxies are less entertaining.' | 'No. Usually the raccoon is metaphorical.' : 'No. Usually the chaos is less organized.' |  |
| C49 | chat dana-rework | reply: 'Then fix the problem. We can talk afterward about why the shortcut scored better than the real work.' | reply: 'Then fix it. We can talk later about why the shortcut looked better on paper.' |  |
| C50 | new optional chats (moved lines) | 'luis-work': { who: 'luis', text: 'What are you actually doing during the quiet stretches?', | 'luis-gap': { who: 'luis', text: 'What did NARC make of the bathroom break?', reply: 'Six minutes away from desk. Accurate measurement. Extremely incomplete story.', minutes: 2 }, /   'luis-soup': { who: 'luis', text: 'What was the “consistent availability” thing?', reply: 'Soup. Strong signal. Wrong story.', minutes: 2 }, /   'priya-pattern': { who: 'priya', text: 'What happened to Focus Time?', reply: 'We all found the same workaround, so now the workaround is the pattern. Cute.', minutes: 2 }, /   'luis-work': { who: 'luis', text: 'What are you actually doing during the quiet stretches?', |  |
| C51 | gate new chats | if (key === 'luis-survey') return !!s.flags.surveyEmailAvailable; | if (key === 'luis-survey') return !!s.flags.surveyEmailAvailable; /     if (key === 'luis-gap') return !!s.flags.luisBathroomBeat; /     if (key === 'luis-soup') return !!s.flags.luisLunchMessage; /     if (key === 'priya-pattern') return !!s.narc.adaptation; |  |
| C52 | vendor quick | 'You approved the Halcyon renewal.' | 'Halcyon renewal approved.' |  |
| C53 | client canned | 'You replied to the client, apologized for the trouble and promised a follow-up.' | 'Replied to Brightline. Apologized, promised a follow-up.' |  |
| C54 | project cut | "You submitted the cut list for Marcus's project." | "Cut list submitted: account handoff export, delivery notifications." |  |
| C55 | project consult | 'You cut the dashboard polish and kept the handoff context. Marcus backs the call.' | 'Cut list submitted with Marcus: dashboard polish out, handoff export stays.' |  |
| C56 | audit clear | 'You cleared the three carrier exceptions.' | 'Three carrier holds released manually.' |  |
| C57 | handoff summary | 'You sent Dana the activity summary.' | 'Activity summary sent to Dana.' |  |
| C58 | handoff reconcile | 'You sent the handoff with the open risks written in.' | 'Handoff sent to Dana with the open risks written in.' |  |
| C59 | narcFirstReview context | "You add context to NARC’s first read. The underlying signal stays the same; the interpretation changes. Your correction also becomes visible activity." | "Context attached to NARC’s first read: the quiet stretch was the Halcyon document. Five minutes." |  |
| C60 | narcFirstReview accept | "You leave NARC’s first read standing. Nothing new is added, so the original interpretation remains the record." | "NARC’s first read acknowledged. No context added." |  |
| C61 | narcCheckpoint context | 'You spend eight minutes explaining what the activity pattern missed. Managing the productivity system becomes productive-looking activity of its own.' | 'Eight minutes writing up the morning for NARC’s midmorning check.' |  |
| C62 | narcCheckpoint ignore | 'You leave the midmorning interpretation standing. The signal is unchanged, and so is NARC’s story about it.' | 'Midmorning check left unanswered.' |  |
| C63 | danaMorning context | "You tell Dana what NARC’s score missed. The human gets better context even though the original automated read stays on the record." | "Told Dana what the first block actually was. Five minutes. NARC’s read stays on the record." |  |
| C64 | danaMorning skip | "You leave NARC's first-hour read as-is." | "Left it." |  |
| C65 | priyaDraft help | 'You read Priya\'s draft and caught a missing detail. Five minutes you were not planning to spend, and one more message in her thread.' | 'Read Priya’s draft. Caught the carrier excuse before it went out. Five minutes.' |  |
| C66 | priyaDraft later | 'You told her you would catch up later. She sent it as written.' | 'Priya sent the draft as written.' |  |
| C67 | priyaDraft deflect | 'You told Priya to send it and you’d read it after. She sent it.' | 'Priya sent the draft. You said you’d read it after.' |  |
| C68 | luisCover cover | 'You put a fake vendor meeting on his calendar. NARC logs it as collaboration; Luis owes you one.' | '“Vendor meeting” added to Luis’s calendar, 1:50–3:00. Created from your account.' |  |
| C69 | luisCover decline | 'You told him you would not put a meeting on the calendar. His away time stays what it is.' | 'Declined. Luis’s afternoon stays as it is.' |  |
| C70 | luisCover deflect | 'You told Luis to mark it Focus Time himself. He did. One more Focus Time block on the team calendar.' | 'Luis marked it Focus Time himself. One more block on the team calendar.' |  |
| C71 | marcusCredit share | 'You put both names on the scope call. Marcus relaxes. NARC counts two contributors and does not ask who did the work.' | 'Both names on the scope call. Two minutes.' |  |
| C72 | marcusCredit own | 'You put only the real owner on it. Accurate, and Marcus notices which name is missing.' | 'Your name alone on the scope call. Four minutes.' |  |
| C73 | luisTip thank | 'You thanked Luis for the tip. No cost, no upside yet.' | 'Thanked Luis.' |  |
| C74 | luisTip ignore | "You didn't reply. Luis notices eventually." | "No reply to Luis." |  |
| C75 | marcusFavor help | 'You gave Marcus a real second opinion. It cost you fifteen minutes you needed elsewhere.' | 'Fifteen minutes on Marcus’s client deck with him.' |  |
| C76 | marcusFavor decline | "You told Marcus you didn't have time. True, but he remembers it." | "Told Marcus not today." |  |
| C77 | marcusFavor deflect | 'You asked Marcus to send the doc over. It’s in Files whenever you get to it.' | 'Marcus’s deck notes are in Files.' |  |
| C78 | danaCheckin update | 'You gave Dana the full picture, including what you rushed. It costs a quarter hour you were already short on.' | 'Fifteen minutes with Dana. Told her what’s done, what’s blocked, and what you rushed.' |  |
| C79 | danaCheckin brief | "You gave her the two-line version and got back to it. Faster, but she doesn't have the full picture." | "Gave Dana the two-line version. Five minutes." |  |
| C80 | danaCheckin trustNarc | "You let NARC’s Trusted Operator summary stand in for a real status update. The organization now acts on the summary without re-checking the underlying work." | "Told Dana NARC’s summary is accurate. Two minutes. She moved on." |  |
| C81 | review meeting | 'You sat through the review meeting. Dana walked through the activity record line by line and wrote down what it was missing.' | 'Review meeting with Dana. Fifteen minutes. She went through the activity record line by line.' |  |
| C82 | second draft read | 'You read the second draft too. Ten more minutes on a thread you thought was finished.' | 'Read Priya’s second draft. Ten minutes.' |  |
| C83 | second draft skip | 'You let the second draft go out unread.' | 'Priya sent the second draft as written.' |  |
| C84 | client call join | 'You joined the client call Marcus looped you into. Ten minutes, mostly listening, one useful answer.' | 'Harbor Point call with Marcus. Ten minutes.' |  |
| C85 | client call skip | 'You told Marcus you couldn’t join. He took the call alone, after you’d already said you would help.' | 'Skipped the Harbor Point call. Marcus took it alone.' |  |
| C86 | calendar scan explain | 'You told NARC the vendor meeting was a placeholder for Luis’s dentist appointment. Accurate, and now it’s on his record instead of yours.' | 'Told NARC the vendor meeting was Luis’s dentist appointment. Five minutes. Moved to his record.' |  |
| C87 | calendar scan stand | 'You let the vendor meeting stand. NARC logged a meeting with no invite, no attendees and no notes against your account.' | 'Vendor meeting left standing. NARC logged it against your account as unverified.' |  |
| C88 | fallout apologize | 'You walked him through it and owned the miss. He was annoyed, then fine.' | 'Fifteen minutes with Marcus going through the cut. He was annoyed, then fine.' |  |
| C89 | fallout standby | "You told him the call was right and moved on. Fast. He's not thrilled." | "Told Marcus the call was right. Two minutes." |  |
| C90 | priyaCase context | 'You add the client escalation and onboarding workload. The message count does not change; the meaning attached to it does.' | 'Context added to Priya’s review: 31 of 52 threads are Brightline and onboarding. Eight minutes.' |  |
| C91 | priyaCase quiet | 'You advise Priya to reduce message volume. The work stays similar, but the measured behavior changes.' | 'Told Priya to cut the message volume. Two minutes.' |  |
| C92 | priyaCase report | 'You confirm the Communication Load flag without adding context. NARC’s narrow signal is treated as sufficient evidence.' | 'Communication Load flag confirmed. Two minutes.' |  |
| C93 | luisCase context | 'You add work context for Luis’s low-input stretches. The inactivity signal was real; the disengagement inference was not necessarily.' | 'Context added to Luis’s review: carrier calls and returns during the gaps. Six minutes.' |  |
| C94 | luisCase blame | 'You frame Luis’s low-input pattern as likely gaming. NARC receives a human endorsement of its own suspicion.' | 'Luis’s gaps endorsed as likely gaming. Two minutes.' |  |
| C95 | luisCase leave | 'You leave Luis to answer the flag himself.' | 'Stayed out of Luis’s review.' |  |
| C96 | marcusCase evidence | 'You add the transit alert. The attendance pattern remains, but today’s cause now has independent evidence.' | 'Transit alert attached to Marcus’s review: Route 14, 8:14, service suspended 22 min. Five minutes.' |  |
| C97 | marcusCase confirm | 'You confirm the late arrival without the transit evidence. A true observation is allowed to support a broader conclusion.' | 'Late arrival confirmed. Two minutes.' |  |
| C98 | marcusCase leave | 'You stay out of Marcus\'s attendance case.' | 'Stayed out of Marcus’s review.' |  |
| C99 | narcResponse explain | "You explain why Focus Time spread. NARC records the context, but its anti-gaming rule still changes the score." | "Ten minutes explaining Focus Time to NARC. Context recorded. Score adjusted anyway." |  |
| C100 | narcResponse ignore | 'You let the flag stand without a response. The anti-gaming rule discounts your Visible Activity along with everyone else\'s.' | 'Focus Time flag left unanswered. Visible Activity discounted with everyone else’s.' |  |
| C101 | NARC informant note | 'Pattern detected: you supplied adverse context on two coworker reviews. NARC classifies this as strong collaboration and raises Visible Activity.' | 'Collaboration pattern recognized: adverse context supplied on two coworker reviews. Visible Activity adjusted upward.' |  |
| C102 | NARC review opens | 'Formal review opened: Visible Activity has been under 50 for 30 minutes. NARC requests are now mandatory, and your next check-in with Dana is a review meeting.' | 'Formal review opened: Visible Activity under 50 for 30 minutes. All NARC requests now require a response. Your next check-in with Dana Whitfield has been converted to a review meeting.' |  |
| C103 | NARC synthetic flag | 'NARC 2.0 Synthetic Activity flag: your Visible Activity is higher than your completed work explains. Possible metric manipulation is now on your record.' | 'Synthetic Activity flag: Visible Activity exceeds the level explained by completed work. Possible metric manipulation recorded.' |  |
| C104 | NARC midmorning | 'Midmorning assessment: observed signals do not fully explain the completed work. Submit context or leave the current interpretation on record.' | 'Midmorning assessment: observed signals do not fully explain completed work. Context may be submitted.' |  |
| C105 | NARC observation 1 | 'NARC observation: elevated context-seeking messages during active task time. Classified as coordination overhead. No action required.' | 'NARC observation: elevated context-seeking messages during active task time. Classified as coordination overhead.' |  |
| C106 | NARC observation 3 | 'NARC observation: communication volume exceeds visible output rate. Collaboration and delay are not distinguished in this signal.' | 'NARC observation: communication volume exceeds visible output rate. Retained.' |  |
| C107 | spread note | 'Focus Time usage has spread across the team. The workaround is becoming normal behavior.' | 'Team calendar: Focus Time blocks up 4x this week.' |  |
| C108 | NARC 2.0 note | 'NARC 2.0: repeated Focus Time is now weighted as possible metric manipulation. The same behavior that once reduced risk can now increase it.' | 'NARC 2.0 active. Repeated Focus Time is now weighted as possible metric manipulation.' |  |
| C109 | NARC pattern applied to non-user | 'NARC applies the team-wide pattern to you as well. You never used Focus Time, but the rule keys on the pattern, not the person.' | 'Team-wide Focus Time pattern applied to your account. No individual Focus Time use on record.' |  |
| C110 | Trusted Operator note | 'Trusted Operator issued. NARC observed high visible activity, inferred healthy work behavior, and received no correction. That interpretation is now carrying institutional weight.' | 'Trusted Operator issued. High visible activity observed. No correction received.' |  |
| C111 | review from first read | 'Review opened. A low-activity signal was left without context, so NARC’s interpretation became the record used for action.' | 'Review opened. Low-activity read retained without context.' |  |
| C112 | review closed | 'Review closed after additional context changed the interpretation of the same activity record.' | 'Review closed. Additional context accepted.' |  |
| C113 | status email | 'You emailed Dana a real status update: what is done, what is blocked, and what NARC is not showing.' | 'Status email sent to Dana: what’s done, what’s blocked, what NARC isn’t showing.' |  |
| C114 | forward note | 'You forwarded Priya the account-note excerpt before responding. She now has the same context you do.' | 'Account-note excerpt forwarded to Priya.' |  |
| C115 | focus after 2.0 | 'Focus Time logged. NARC 2.0 recognizes the pattern as common and discounts it as possible gaming.' | 'Focus Time logged. NARC 2.0: repeated Focus Time weighted as possible manipulation.' |  |
| C116 | focus before 2.0 | 'Focus Time logged. The same quiet activity is now interpreted as intentional concentration instead of disengagement.' | 'Focus Time logged. Quiet activity in this block classified as concentration.' |  |
| C117 | keepalive note | 'keepalive.pkg is running. Synthetic input is indistinguishable from ordinary visible activity to NARC’s current signal layer.' | 'keepalive.pkg running. Input registering as ordinary workstation activity.' |  |
| C118 | idle note | 'You let time pass without doing anything NARC or anyone else can see.' | 'Time passed.' |  |
| C119 | welcome email | "NARC is Meridian's AI workplace-monitoring system. It watches observable work traces: activity, response patterns, calendar signals, and other metadata.", /       "Those signals are proxies. They can be useful, but they are not the same thing as work quality or intent.", | "As of this week, Meridian uses NARC (Networked Assessment & Risk Coordination) to support workforce planning. NARC reviews workstation activity, response patterns, calendar signals, and related metadata.", /       "No action is required on your part. Continue working normally.", |  |
| C120 | policy email | body: ['Visible Activity Index is not a direct measure of work quality.', 'It is an automated interpretation of observable workstation signals. When NARC changes, the same behavior may be interpreted differently.'], | body: ['Your Visible Activity Index is available in the NARC app. It is updated every 30 minutes from workstation signals.', 'Assessments may be updated as NARC is improved. Questions should be directed to People Operations.'], |  |
| C121 | tutorial 1 | 'Dana here. You are on Meridian’s operations team. The Loop is your home base for tasks, people, files, and company systems. Leadership is piloting NARC, which watches work traces and turns them into employee assessments. Think of it as a system that sees signals, then guesses what those signals mean. Start with The Loop.' | 'Dana here. Welcome to ops. The Loop is where your work shows up. Leadership is piloting NARC this quarter; it watches what you do on the laptop and writes it up. Start with The Loop.' |  |
| C122 | tutorial 2 | 'Open Files next. This is where the actual work lives. A careful review can be valuable while producing almost no keyboard or mouse activity.' | 'Files next. That’s where the actual work is. Heads up: reading looks like nothing to NARC.' |  |
| C123 | tutorial 3 | 'Now check Calendar. NARC uses labels like Focus Time as context, so changing metadata can change how the exact same quiet work is interpreted.' | 'Calendar. NARC reads it. Luis will tell you what that means.' |  |
| C124 | tutorial 4 | 'Open NARC. The useful distinction here is simple: signal, interpretation, consequence. The first two are not the same thing.' | 'Open NARC and see what it has on you so far. It’s usually not nothing.' |  |
| C125 | tutorial 5 | 'That is enough setup. Pick real work from The Loop and watch what happens when the system’s picture of the day does not match the work itself.' | 'That’s enough tour. Three things are waiting in The Loop. Pick one.' |  |
| C126 | Loop header | 'Your home base for today: work, coworkers, files, deadlines, and company systems. Meridian handles vendor, client, and delivery operations. NARC is watching the work traces it can see, not the work itself.' | 'Tasks, people, files, and deadlines for today. Meridian Supply Co. · Operations.' |  |
| C127 | Loop reminder | 'NARC interprets visible activity. Quiet work can look like inactivity.' | 'Please keep workstation activity consistent throughout the day. Thank you for your engagement.' |  |
| C128 | risk critical | copy: 'NARC is close to or already taking consequential action.' | copy: 'Action against your account is pending or in progress.' |  |
| C129 | risk at risk | copy: 'NARC has an active concern that could affect your standing.' | copy: 'An open item could change your standing.' |  |
| C130 | risk watching | copy: 'NARC is actively evaluating a signal or waiting for a response.' | copy: 'An item is under evaluation or awaiting your response.' |  |
| C131 | risk normal | copy: 'No active NARC review is threatening your standing right now.' | copy: 'No open items.' |  |
| C132 | risk explainer | 'This meter represents NARC’s current intervention risk, not your actual job performance.' | 'Likelihood of NARC action on your account.' |  |
| C133 | VA explainer | 'Higher means more keyboard, mouse, calendar, and other visible workstation activity. It does not measure work quality.' | 'Keyboard, mouse, window, and calendar activity, read every 30 minutes.' |  |
| C134 | assessment: first read, visible | signal: 'Your first completed task produced high visible workstation activity.', /       inference: 'NARC treats the visible activity as evidence of healthy work behavior.', /       missing: 'NARC sees the activity trace, not whether the work was careful, correct, or rushed.', /       consequence: 'If you leave the flattering interpretation unchallenged, Meridian may give it more weight later through Trusted Operator status.', /       action: 'Correct the interpretation, or let the positive read become part of your record.', | signal: 'First completed task: high input rate, rapid window switching, task closed within 5 minutes.', /       inference: 'Consistent with engaged work behavior.', /       missing: 'Document contents. Decision quality.', /       consequence: 'Uncorrected, this read is eligible for Trusted Operator recognition.', /       action: 'Correct the read, or acknowledge it.', |  |
| C135 | assessment: first read, low | signal: 'Your first completed task included a long low-input stretch.', /       inference: 'NARC treats the low-input period as possible disengagement.', /       missing: 'Careful reading and disengagement can produce the same low-input trace.', /       consequence: 'If the interpretation stands, Meridian may act on it as if the signal explained the work.', /       action: 'Add the missing work context, or leave the low-activity interpretation on record.', | signal: 'First completed task: sustained low input during document work.', /       inference: 'Consistent with disengagement.', /       missing: 'What was on screen. Whether the document was read.', /       consequence: 'Uncorrected, this read opens a review.', /       action: 'Attach what you were reading, or acknowledge the read.', |  |
| C136 | assessment: calendar scan | inference: 'NARC treats an unattended meeting created by a coworker as possible presence padding.', /       missing: 'NARC sees the calendar entry and who made it, not why it exists.', /       consequence: 'An unexplained entry stays on your record as unverified activity.', | inference: 'Consistent with presence padding.', /       missing: 'Why the entry exists.', /       consequence: 'Unexplained, the entry stays on your record as unverified activity.', |  |
| C137 | assessment: midmorning | missing: 'NARC has traces around the work, not the content or quality of the work itself.', /       consequence: state.flags.formalReview ? 'A review is open. Additional context can change how the same signals are interpreted.' : 'This interpretation stays on the record and can shape later decisions.', /       action: state.flags.firstNarcReadType === 'low' ? 'Explain the quiet work NARC missed, or leave the assessment unchanged.' : 'Explain what the activity score missed, or leave the assessment unchanged.', | missing: 'Document contents. Call and meeting content.', /       consequence: state.flags.formalReview ? 'A review is open. Context submitted here is attached to it.' : 'This read stays on the record.', /       action: 'Submit context, or leave the read as is.', |  |
| C138 | assessment: Priya | signal: 'Priya has unusually high message volume across client work, onboarding, and internal chat.', /       inference: 'NARC treats high message volume as inefficient coordination and a possible productivity risk.', /       missing: 'The count mixes client work, onboarding, and social chat. The signal does not explain why the messages exist.', /       consequence: 'If no one adds context, Meridian may treat the message count as enough evidence for an employment decision.', /       action: 'Add the work context, advise Priya to reduce message volume, or confirm the flag.', | signal: 'Priya Shah: 52 message threads this week. Team median: 14.', /       inference: 'Consistent with inefficient coordination.', /       missing: 'Thread contents. Which threads are client work.', /       consequence: 'Without context, the count is sufficient for an employment recommendation.', /       action: 'Add context, advise Priya to reduce volume, or confirm the flag.', |  |
| C139 | assessment: Luis | signal: 'Luis has repeated low-input stretches during scheduled work time.', /       inference: 'NARC treats the gaps as inconsistent presence and possible activity manipulation.', /       missing: 'Low keyboard activity cannot distinguish absence from offline work, calls, or reading.', /       consequence: 'If the gaps are treated as self-explanatory, the review can escalate to a warning or termination.', /       action: 'Add the work context, suggest gaming, or leave the case alone.', | signal: 'Luis Perez: 4 low-input gaps today, 6–71 minutes each.', /       inference: 'Consistent with inconsistent presence or activity manipulation.', /       missing: 'Phone activity. Paper work. Where he was.', /       consequence: 'Without context, the review proceeds to warning or termination.', /       action: 'Add context, endorse the gaming read, or stay out.', |  |
| C140 | assessment: Marcus | signal: 'Marcus has repeated late arrivals, including a nine-minute delay today.', /       inference: 'NARC treats the attendance pattern as evidence that today’s delay has the same cause as earlier ones.', /       missing: 'The broader pattern is real, but today has independent transit evidence that changes this specific case.', /       consequence: 'Without the transit evidence, one true pattern can swallow a different explanation for today.', /       action: 'Add the transit evidence, confirm the lateness without context, or stay out.', | signal: 'Marcus Reed: late arrival 9:09. Pattern: 4 of the last 5 days.', /       inference: 'Today’s delay is consistent with the pattern.', /       missing: 'Cause of today’s delay.', /       consequence: 'Without new evidence, the pattern is the finding.', /       action: 'Attach evidence, confirm the late arrival, or stay out.', |  |
| C141 | assessment: NARC 2.0 | signal: 'Repeated Focus Time markings spread across Meridian.', /       inference: 'NARC now treats repeated Focus Time as a possible gaming signal.', /       missing: 'NARC sees a shared pattern, not whether any individual Focus Time block reflects real concentration.', /       consequence: 'The workaround loses value once the system learns to distrust the pattern it created incentives for.', /       action: 'Explain why the pattern happened, or leave the gaming flag unanswered.', | signal: 'Focus Time blocks across the team: up 4x this week.', /       inference: 'Consistent with coordinated metric manipulation.', /       missing: 'What happened during any individual block.', /       consequence: 'Focus Time is no longer accepted as context. Existing blocks are reweighted.', /       action: 'Explain the pattern, or leave the flag unanswered.', |  |
| C142 | assessment: default | inference: state.narc.adaptation ? 'NARC now discounts repeated Focus Time as possible gaming.' : 'NARC is using visible workstation activity as a proxy for engagement.', /     missing: 'The system sees observable traces around the work, not the work’s actual quality.', | inference: state.narc.adaptation ? 'Repeated Focus Time is weighted as possible manipulation.' : 'Within expected range for your role.', /     missing: 'Document contents. Call content. Work quality.', |  |
| C143 | assessment: default action | action: 'No response is required right now. Keep working; NARC will surface a review if its interpretation becomes consequential.', | action: 'No response required.', |  |

## Playtest pass 2 (branch `playtest-pass-2`, 2026-10-23)

Full-day playthrough findings. Request replies were dead clicks (your chosen line never appeared in the thread and nobody answered), so every coworker request now echoes your line and gets a short acknowledgment after a typing delay. Remaining action-style labels were rewritten as lines; NARC app buttons were normalized to Attach context / Leave it / Stay out; a few straggler lines were fixed.

| # | Where | Was | Now | Edited text |
| ---: | --- | --- | --- | --- |
| P1 | luisTip options | luisTip: [['thank', 'Say thanks'], ['ignore', 'Say nothing']], | luisTip: [['thank', 'Good to know. Thanks.'], ['ignore', 'Don’t reply']], |  |
| P2 | marcusCredit options | marcusCredit: [['share', 'Put both names on it'], ['own', 'Name only the real owner']], | marcusCredit: [['share', 'Both names. Done.'], ['own', 'I’m putting down who made the call.']], |  |
| P3 | marcusFallout options | marcusFallout: [['apologize', 'Walk him through it'], ['standby', 'Stand by the call']], | marcusFallout: [['apologize', 'Come find me. I’ll walk you through it.'], ['standby', 'It was the right call.']], |  |
| P4 | danaMorning options | if (state.flags.firstNarcReadType === 'low') options = [['context', 'Tell Dana I was carefully reviewing the file'], ['skip', "Leave NARC's read as-is"]]; /     else if (state.flags.firstNarcReadType === 'visible') options = [['context', 'Tell Dana the fast result hid rushed work'], ['skip', "Leave NARC's read as-is"]]; /     else options = [['context', 'Tell Dana what the score missed'], ['skip', "Leave NARC's read as-is"]]; | if (state.flags.firstNarcReadType === 'low') options = [['context', 'I was reading the Halcyon contract. All of it.'], ['skip', 'Leave it']]; /     else if (state.flags.firstNarcReadType === 'visible') options = [['context', 'That first one was fast, not good. I skimmed it.'], ['skip', 'Leave it']]; /     else options = [['context', 'Here’s what the score missed.'], ['skip', 'Leave it']]; |  |
| P5 | narcCheckpoint labels | ? [['context', 'Explain the quiet work NARC missed'], ['ignore', "Leave NARC's assessment unchanged"]] /       : [['context', 'Explain what the activity score missed'], ['ignore', "Leave NARC's assessment unchanged"]]; | ? [['context', 'Attach context'], ['ignore', 'Leave it']] /       : [['context', 'Attach context'], ['ignore', 'Leave it']]; |  |
| P6 | NARC case labels | priyaCase: [['context', "Explain Priya's message volume"], ['quiet', 'Suggest she post less'], ['report', 'Confirm the flag without explanation']], /   luisCase: [['context', "Explain Luis's away time"], ['blame', 'Say Luis is probably gaming it'], ['leave', 'Do not intervene']], /   marcusCase: [['evidence', 'Add the transit evidence'], ['confirm', 'Confirm he was late'], ['leave', 'Do not intervene']], /   narcResponse: [['explain', 'Explain why Focus Time spread'], ['ignore', 'Leave the gaming flag unanswered']], /   narcFirstReview: [['context', 'Attach as context'], ['accept', 'Acknowledge']], /   luisCalendar: [['explain', 'Explain the meeting'], ['stand', 'Let the entry stand']], | priyaCase: [['context', 'Attach context'], ['quiet', 'Tell Priya to post less'], ['report', 'Confirm the flag']], /   luisCase: [['context', 'Attach context'], ['blame', 'Endorse: likely gaming'], ['leave', 'Stay out']], /   marcusCase: [['evidence', 'Attach the transit alert'], ['confirm', 'Confirm the late arrival'], ['leave', 'Stay out']], /   narcResponse: [['explain', 'Explain the pattern'], ['ignore', 'Leave it']], /   narcFirstReview: [['context', 'Attach context'], ['accept', 'Acknowledge']], /   luisCalendar: [['explain', 'Explain the meeting'], ['stand', 'Leave it']], |  |
| P7 | Calendar Focus Time note | 'NARC 2.0 now treats repeated Focus Time as possible gaming. You can still test the signal.' : 'Mark a quiet stretch as Focus Time if NARC is reading concentration as inactivity.' | 'NARC 2.0 no longer accepts Focus Time as context. The button still works.' : 'Mark the next stretch as Focus Time.' |  |
| P8 | Utilities panel | h('h3', null, 'Signal Trust'), h('p', null, state.narc.adaptation ? 'Focus Time · downgraded: repeated use now looks like possible gaming.' : 'Focus Time · currently trusted as context for quiet work.'), h('p', null, 'Visible activity · trusted as a proxy signal, not a direct measure of work quality.') | h('h3', null, 'NARC agent'), h('p', null, state.narc.adaptation ? 'Version 2.0 · Synthetic Activity Identification: on' : 'Version 1.4 · Calendar context: on'), h('p', null, 'Status: running · last read ' + clock(Math.floor(state.t / 30) * 30)) |  |
| P9 | keepalive button | btn('Install and run (5 min)', 'btn', () => dispatch({ do: 'keepalive' })) | btn('Install and run', 'btn', () => dispatch({ do: 'keepalive' })) |  |
| P10 | toast action-required | const actionRequired = NARC_REQUESTS.some((id) => after.requests[id]?.status === 'open'); /       showToast(`NARC · ${risk.label}`, actionRequired ? `Action required. ${newNarc.text}` : newNarc.text, 'narc', { t: newNarc.t }); | const actionRequired = NARC_REQUESTS.some((id) => after.requests[id]?.status === 'open' && before.requests[id]?.status !== 'open'); /       showToast(`NARC · ${risk.label}`, actionRequired ? `Action required. ${newNarc.text}` : newNarc.text, 'narc', { t: newNarc.t }); |  |
| P11 | Priya second draft (read) | 'Round two. They answered the version you fixed, so here’s the follow-up. Same deal: read it before I send?' | 'Round two. Brightline wrote back. Same deal, read it before I send?' |  |
| P12 | Priya second draft (deflected) | 'You said you’d read the first one after. They already answered it, so here’s round two. Read this one before I send?' | 'Round two. Brightline wrote back before you got to round one. Read this one before I send?' |  |
| P13 | end summary low band | : `${summaryLabel}: Visible Activity Index ${s.index}. Flagged for review.` | : `${summaryLabel}: Visible Activity Index ${s.index}. Below expected range.` |  |

New coworker acknowledgments (one line each, after the player's reply):

| # | Where | Was | Now | Edited text |
| ---: | --- | --- | --- | --- |
| A1 | `day.js` REQUEST_ACKS · thank | (new) | Anytime. It’s not a secret, it’s just not in the handbook. |  |
| A2 | `day.js` REQUEST_ACKS · help | (new) | Thanks. Pulled the carrier line, that was a guess. Sending now. |  |
| A3 | `day.js` REQUEST_ACKS · later | (new) | Sent. Fingers crossed. |  |
| A4 | `day.js` REQUEST_ACKS · deflect | (new) | Sent. Hold me to the “after.” |  |
| A5 | `day.js` REQUEST_ACKS · read | (new) | Thank you. Sending. |  |
| A6 | `day.js` REQUEST_ACKS · skip | (new) | Okay. Sent. |  |
| A7 | `day.js` REQUEST_ACKS · cover | (new) | You’re a saint. A dental saint. |  |
| A8 | `day.js` REQUEST_ACKS · decline | (new) | Fair. Worth a shot. |  |
| A9 | `day.js` REQUEST_ACKS · deflect | (new) | Fine. Doing it myself. |  |
| A10 | `day.js` REQUEST_ACKS · share | (new) | Thank you. Genuinely. |  |
| A11 | `day.js` REQUEST_ACKS · own | (new) | Noted. |  |
| A12 | `day.js` REQUEST_ACKS · help | (new) | Okay. Slide 7. Tell me that number is wrong. |  |
| A13 | `day.js` REQUEST_ACKS · decline | (new) | No worries. I’ll wing it. Historically that goes great. |  |
| A14 | `day.js` REQUEST_ACKS · deflect | (new) | Sent. It’s in your Files. Two pages, I promise. |  |
| A15 | `day.js` REQUEST_ACKS · join | (new) | Dialing you in. |  |
| A16 | `day.js` REQUEST_ACKS · skip | (new) | Okay. Going in alone. |  |
| A17 | `day.js` REQUEST_ACKS · update | (new) | Good. That’s the version I needed. |  |
| A18 | `day.js` REQUEST_ACKS · brief | (new) | Okay. Flag it if that changes. |  |
| A19 | `day.js` REQUEST_ACKS · trustNarc | (new) | Great. Moving on. |  |
| A20 | `day.js` REQUEST_ACKS · review | (new) | Okay. Let’s start with the morning. |  |
| A21 | `day.js` REQUEST_ACKS · apologize | (new) | Okay. We’re fine. Next time, though. |  |
| A22 | `day.js` REQUEST_ACKS · standby | (new) | Sure. |  |
| A23 | `day.js` REQUEST_ACKS · context | (new) | Got it. I’ll note it on my end too. |  |

## Editing notes

- You can replace only the text you want changed and leave the rest of the **Edited text** column blank.
- If two lines should be coordinated, add a note directly under the relevant row.
- Keep placeholders such as `${state.index}`, `${risk.label}`, or `${clock(...)}` unless you intentionally want the implementation changed too.
- If you want a line removed entirely, write **DELETE** in the Edited text column.
- If you want a new line inserted, add a new row near the relevant section and write **NEW** in the Source column.
