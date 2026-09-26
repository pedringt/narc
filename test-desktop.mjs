import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('./day-desktop-app.js', import.meta.url), 'utf8');
assert.match(app, /mobileDetail:\s*\{\s*email:\s*true/, 'opening email should be visible on mobile');
assert.match(app, /show-detail/, 'mobile detail class should be applied by the app');
assert.match(app, /setMobileDetail\('messages', true\)/, 'message selection should open mobile detail');
assert.match(app, /setMobileDetail\('files', true\)/, 'file selection should open mobile detail');
assert.match(app, /markNotificationsRead\('messages', id\)/, 'reading a thread should reconcile notification unread state');
assert.match(app, /const ids = \['vendor', 'client', 'project'\]/, 'Marcus project file should remain visible after completion');
assert.match(app, /Measures what NARC can observe, not the quality or value of your work\./, 'NARC should explain the Visible Activity Index');
assert.match(app, /Add context to NARC's assessment/, 'midmorning checkpoint should be framed as an assessment response');
assert.match(app, /state\.flags\.loggedOffEarly/, 'end screen should distinguish early logoff');
assert.match(app, /The Loop is our employee home base/, 'Dana should explain what The Loop is during onboarding');
assert.doesNotMatch(app, /completeTutorialTarget[\s\S]*?ui\.tutorialUnread = false;[\s\S]*?if \(step\.final\)/, 'advancing tutorial targets must not mark Dana read');
assert.match(app, /loop-task-actions/, 'The Loop should offer more than a single file action');
assert.match(app, /selectedArticle/, 'Browser should track an opened article');
assert.match(app, /browser-story/, 'Browser headlines should be interactive');
assert.match(app, /NARC SYSTEM UPDATE · 2\.0/, 'Focus Time adaptation should be visibly explained');
assert.match(app, /narc-checkpoint-facts/, '11:20 assessment should show concrete evidence');

console.log('desktop integration checks passed');
