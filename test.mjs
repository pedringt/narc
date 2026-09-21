import assert from 'node:assert/strict';
import { CASES, newGame, investigate, intervene, report, next, employeeOutcome, reviewerOutcome, companyOutcome } from './game.js';

let s = newGame();
assert.equal(s.phase, 'intro');
s = next(s);
assert.equal(s.phase, 'case');

s = investigate(s, 0);
s = investigate(s, 1);
const s3 = investigate(s, 2);
assert.equal(s3.investigated.length, 2, 'case should cap investigation at 2');

s = intervene(s, 'help');
s = report(s, 'dismiss');
assert.equal(s.phase, 'result');
assert.equal(s.employees.luis.help, 1);
assert.ok(s.employees.luis.employment > 3);

s = next(s);
assert.equal(s.caseIndex, 1);
assert.equal(s.phase, 'case');

s = intervene(s, 'hurt');
s = report(s, 'escalate');
s = next(s);
assert.equal(s.phase, 'policy', 'policy update should appear before third case');
s = next(s);
assert.equal(s.phase, 'case');
assert.equal(s.caseIndex, 2);

assert.equal(CASES.length, 4);

let fire = newGame();
fire = next(fire);
for (let i = 0; i < CASES.length; i++) {
  fire = intervene(fire, 'hurt');
  fire = report(fire, 'escalate');
  fire = next(fire);
  if (fire.phase === 'policy') fire = next(fire);
}
assert.equal(fire.phase, 'ending');
const terminated = Object.values(fire.employees).filter(e => employeeOutcome(e) === 'TERMINATED').length;
assert.ok(terminated >= 3, 'punitive run should terminate most employees');
assert.equal(reviewerOutcome(fire).status, 'PROMOTED');
assert.match(companyOutcome(fire), /insufficient staff/i);

let save = newGame();
save = next(save);
for (let i = 0; i < CASES.length; i++) {
  save = intervene(save, 'help');
  save = report(save, 'dismiss');
  save = next(save);
  if (save.phase === 'policy') save = next(save);
}
assert.equal(save.phase, 'ending');
assert.equal(Object.values(save.employees).filter(e => employeeOutcome(e) === 'TERMINATED').length, 0);
assert.match(companyOutcome(save), /RETENTION: 100%/);
assert.equal(reviewerOutcome(save).status, 'UNDER REVIEW');

console.log('NARC tests passed');
