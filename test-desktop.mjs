import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('./day-desktop-app.js', import.meta.url), 'utf8');
assert.match(app, /mobileDetail:\s*\{\s*email:\s*true/, 'opening email should be visible on mobile');
assert.match(app, /show-detail/, 'mobile detail class should be applied by the app');
assert.match(app, /setMobileDetail\('messages', true\)/, 'message selection should open mobile detail');
assert.match(app, /setMobileDetail\('files', true\)/, 'file selection should open mobile detail');
assert.match(app, /markNotificationsRead\('messages', id\)/, 'reading a thread should reconcile notification unread state');
assert.match(app, /const ids = \['vendor', 'client', 'project'\]/, 'Marcus project file should remain visible after completion');
assert.match(app, /Visible Activity Index is not a direct measure of work quality\./, 'NARC should explain the Visible Activity Index');
assert.match(app, /Explain the quiet work NARC missed/, 'midmorning checkpoint should describe the concrete player action');
assert.match(app, /state\.flags\.loggedOffEarly/, 'end screen should distinguish early logoff');
assert.match(app, /The Loop is your home base/, 'Dana should explain what The Loop is during onboarding');
assert.doesNotMatch(app, /completeTutorialTarget[\s\S]*?ui\.tutorialUnread = false;[\s\S]*?if \(step\.final\)/, 'advancing tutorial targets must not mark Dana read');
assert.match(app, /loop-task-actions/, 'The Loop should offer more than a single file action');
assert.match(app, /selectedArticle/, 'Browser should track an opened article');
assert.match(app, /browser-story/, 'Browser headlines should be interactive');
assert.match(app, /NARC SYSTEM UPDATE/, 'Focus Time adaptation should be visibly explained');
assert.match(app, /your first work block was (low-input|highly visible) and the current activity record is mixed/i, '11:20 assessment should show concrete evidence');

console.log('desktop integration checks passed');

assert.match(app, /Culture Champion nominations/, 'culture nomination email should exist in the one-day build');
assert.match(app, /NARC 2\.0: new capabilities/, 'NARC 2.0 rollout email should be restored');
assert.match(app, /chatOptions\(state, id\)/, 'idle message threads should offer optional conversations');
assert.match(app, /\['narcFirstReview', 'narcCheckpoint', 'priyaCase', 'luisCase', 'marcusCase', 'narcResponse'\]/, 'coworker consequence choices should be handled in NARC');
assert.match(app, /narc-action-buttons/, 'NARC response buttons should be laid out in a dedicated action row');
assert.match(app, /Advance to \$\{clock\(next\.t\)\}/, 'quiet stretches should use one contextual advance action rather than repeated background-work copy');

assert.match(app, /tutorialVisited/, 'tutorial progress should reconcile against apps actually visited');
assert.match(app, /while \(!ui\.tutorialDone\)/, 'tutorial should retire already-completed steps instead of leaving stale CTAs');
assert.match(app, /sendChat\(who, topic\)/, 'optional conversations should use paced chat delivery');
assert.match(app, /is typing/, 'message threads should show a typing indicator');
assert.match(app, /scrollThreadToBottom/, 'sending or opening a conversation should keep the latest messages in view');
assert.match(app, /pendingReplies/, 'chat replies should not appear immediately');
assert.match(app, /Accept NARC's positive activity assessment/, 'Trusted Operator choice should explain that the assessment is positive');
assert.match(app, /Meridian may give it more weight later through Trusted Operator status/, 'NARC should explain why accepting the assessment can improve standing');
assert.match(app, /ui\.notifications\.some\(\(n\) => !n\.read\)/, 'quiet-time fast-forward should not cover unread activity');

assert.match(app, /unreadMessages/, 'ambient coworker messages should contribute to the Messages badge');
assert.match(app, /n\.thread === id/, 'each coworker row should surface unread ambient messages');
assert.match(app, /optional-chat\$\{typing \? ' is-waiting' : ''\}/, 'conversation starters should remain visible while a coworker is typing');
assert.match(app, /disabled: ''/, 'remaining conversation starters should be disabled while a coworker is typing');

assert.match(app, /function narcRisk\(/, 'NARC should expose a derived intervention-risk state');
assert.match(app, /NARC status/, 'persistent UI should name the NARC status directly');
assert.match(app, /Visible activity: \$\{state\.index\}\/100/, 'Visible Activity should include a denominator and plain-English band');
assert.match(app, /'SIGNAL'/, 'NARC details should name the observed signal');
assert.match(app, /'NARC SAYS'/, 'NARC details should separate the interpretation from the signal');
assert.match(app, /'IMPACT'/, 'NARC details should state the consequence');
assert.match(app, /Choose a response/, 'NARC details should make active decisions visually explicit');
assert.match(app, /Start a conversation/, 'optional social prompts remain available when no required interaction is active');
assert.match(app, /hasRequiredAction/, 'optional social prompts should be hidden while a required/tutorial action is active');
assert.match(app, /Explain that the fast work was rushed/, 'NARC response labels should describe the actual action rather than generic context');
assert.match(app, /Explain why Focus Time spread/, 'NARC 2.0 response should use concrete language');
assert.match(app, /RECENT NARC EVENTS/, 'NARC history should be presented as a categorized event timeline');
assert.match(app, /What NARC cannot see/, 'missing context should remain available behind progressive disclosure (#105)');
assert.match(app, /missing: /, 'every narcAssessment branch should define a missing-context line, not just some of them');
assert.match(app, /loop-urgency-track/, 'task deadlines should show an in-game-clock urgency indicator (#102)');
assert.match(app, /min left/, 'urgency indicator should be readable in plain minutes, not a raw fraction');
assert.match(app, /end-section-h', 'Your day'/, 'end screen should have a structured Your-day time section (#106)');
assert.match(app, /end-section-h', 'NARC metrics'/, 'end screen should have a structured NARC-metrics section (#106)');
assert.match(app, /end-section-h', 'People'/, 'end screen should have a structured People section (#106)');
assert.match(app, /end-section-h', 'The contradiction'/, 'end screen should surface measured-vs-actual contradictions (#106)');

assert.match(app, /Quarterly employee pulse survey/, 'survey setup should exist before the survey conversation can unlock');
assert.match(app, /Compose work email/, 'Email should expose player-initiated outbound work actions');
assert.match(app, /Review supporting details \(3 min\)/, 'work files should require an evidence-review step before the final task choice');
assert.match(app, /notification-source/, 'notifications should render an explicit unread indicator');
assert.match(app, /primary-decision/, 'consequential NARC choices should have a stronger visual hierarchy');
