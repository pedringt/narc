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

console.log('desktop integration checks passed');
