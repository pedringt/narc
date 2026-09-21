import assert from 'node:assert/strict';
import { newGame, act, view, ending, achievements, NOTES, SEQUENCE } from './game.js';

// ---------------------------------------------------------------- helpers

// Play a run by encounter. `picks` maps encounter id -> choice id. `look`
// lists encounters where the player pulls the optional evidence.
function play(picks, { look = [], stopAt = null, from = newGame() } = {}) {
  let s = from;
  if (s.phase === 'intro') s = act(s, 'begin');
  while (s.phase !== 'ending') {
    if (s.phase === 'update') { s = act(s, 'next'); continue; }
    const enc = SEQUENCE[s.node];
    if (stopAt && enc === stopAt.enc && s.phase === stopAt.phase) return s;
    if (s.phase === 'inspect' && look.includes(enc) && view(s).evidence === null) {
      s = act(s, 'pull');
      continue;
    }
    if (s.phase === 'choose') {
      assert.ok(picks[enc], `no pick for ${enc}`);
      s = act(s, `choose:${picks[enc]}`);
      continue;
    }
    s = act(s, 'next');
  }
  return s;
}

const HONEST = { e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' };
const has = (rows, re) => rows.some(([, text]) => re.test(text));

// ------------------------------------------------------ opening and shape

{
  const s = newGame();
  const v = view(s);
  assert.equal(v.kind, 'intro');
  assert.match(v.paragraphs.join(' '), /Employee 4417/, 'the player is a named human employee');
  assert.equal(v.controls.length, 1, 'first screen offers one control');
  assert.equal(v.strip.index, null, 'no metrics shown on the first screen');
  assert.ok(!/you are narc/i.test(JSON.stringify(v)), 'the player is not NARC');
}

// ------------------------------------------- one step at a time, in order

{
  let s = act(newGame(), 'begin');
  const trail = [];
  while (SEQUENCE[s.node] === 'e1') {
    trail.push(s.phase);
    s = s.phase === 'choose' ? act(s, 'choose:wait') : act(s, 'next');
  }
  assert.deepEqual(trail, ['signal', 'inspect', 'choose', 'result', 'reaction']);
  assert.equal(SEQUENCE[s.node], 'e2', 'the next encounter follows');

  // Each screen exposes only what belongs to its step.
  s = act(newGame(), 'begin');
  assert.equal(view(s).kind, 'signal');
  assert.equal(view(s).controls.length, 1);
  assert.equal(view(s).sees, undefined, 'signal does not show the inspect panel');
  s = act(s, 'next');
  assert.equal(view(s).kind, 'inspect');
  assert.ok(view(s).sees.length > 0 && view(s).infers.length > 0);
  assert.equal(view(s).controls.length, 2, 'inspect: optional evidence + respond');
  s = act(s, 'next');
  assert.equal(view(s).kind, 'choose');
  assert.equal(view(s).rows, undefined, 'choose does not show the signal or result');
  assert.equal(view(s).controls.length, 3);
}

// ------------------------------------------------ optional evidence: once

{
  let s = act(act(newGame(), 'begin'), 'next');
  assert.equal(view(s).evidence, null);
  s = act(s, 'pull');
  assert.match(view(s).evidence, /Halvorsen/);
  assert.equal(view(s).controls.length, 1, 'evidence can only be pulled once');
  assert.throws(() => act(s, 'pull'), /Unknown action/);
}

// ------------------------------------------------- progressive interface

{
  const s0 = act(newGame(), 'begin');
  assert.equal(view(s0).strip.index, null, 'index hidden until the first inspect');
  const s1 = act(s0, 'next');
  assert.equal(view(s1).strip.index, 61, 'Visible Activity Index appears after the first signal');
  assert.equal(view(s1).strip.flags, null, 'integrity flags are not shown yet');
  assert.equal(view(s1).level, 1);

  const s2 = play(HONEST, { stopAt: { enc: 'e4', phase: 'signal' } });
  assert.equal(view(s2).level, 2, 'NARC 2.0 changes the interface level');
  assert.equal(view(s2).strip.flags, 0, 'integrity flags appear after the update');
}

// ---------------------------------- carry-over: earlier choice, later scene

{
  // Luis: script -> caught by NARC 2.0 -> different return encounter.
  const scripted = play({ ...HONEST, e2: 'script', e5: 'admit' }, { stopAt: { enc: 'e5', phase: 'signal' } });
  const v = view(scripted);
  assert.ok(has(v.rows, /input every 59 seconds/), 'Luis’s script is what NARC flags on his return');
  assert.ok(has(v.rows, /Innovation Council/), 'the earlier reward is reused as evidence');

  const ignored = play({ ...HONEST, e2: 'ignore' }, { stopAt: { enc: 'e5', phase: 'signal' } });
  assert.ok(has(view(ignored).rows, /Performance Improvement Plan/));
  assert.ok(!has(view(ignored).rows, /59 seconds/));

  const confirmed = play({ ...HONEST, e2: 'confirm' }, { stopAt: { enc: 'e5', phase: 'signal' } });
  assert.ok(has(view(confirmed).rows, /5 minutes/), 'a confirmed flag leaves a tighter threshold behind');

  // Marcus: paper trail vs. history.
  const paper = play({ ...HONEST, e3: 'paper' }, { stopAt: { enc: 'e6', phase: 'signal' } });
  assert.ok(has(view(paper).rows, /Documentation Excellence/));
  const burned = play({ ...HONEST, e3: 'truth' }, { stopAt: { enc: 'e6', phase: 'signal' } });
  assert.ok(has(view(burned).rows, /Prior flags weight: 80%/));
  assert.ok(has(view(burned).rows, /credibility: 12%/), 'the earlier warning sets today’s credibility');
  const stayed = play({ ...HONEST, e3: 'stay' }, { stopAt: { enc: 'e6', phase: 'signal' } });
  assert.ok(has(view(stayed).rows, /credibility: 38%/));

  // Two coworkers reappear.
  const appearances = { luis: 0, marcus: 0 };
  let s = act(newGame(), 'begin');
  while (s.phase !== 'ending') {
    if (s.phase === 'signal') {
      const t = view(s).subtitle;
      if (/Luis/.test(t)) appearances.luis += 1;
      if (/Marcus/.test(t)) appearances.marcus += 1;
    }
    if (s.phase === 'choose') s = act(s, `choose:${HONEST[SEQUENCE[s.node]]}`);
    else s = act(s, 'next');
  }
  assert.deepEqual(appearances, { luis: 2, marcus: 2 });
}

// -------------------------------------- exploit changes a NARC metric

{
  const before = act(act(newGame(), 'begin'), 'next');
  const after = act(act(before, 'next'), 'choose:jiggle');
  assert.equal(after.score, before.score + 14, 'the jiggler raises the Visible Activity Index');
  assert.equal(after.you.gamed, true);
  assert.ok(has(view(after).rows, /61 → 75/));

  const honest = act(act(before, 'next'), 'choose:wait');
  assert.equal(honest.score, before.score - 6, 'doing nothing lowers it');
}

// ----------------------------- exploit → unintended later consequence

{
  // The jiggler pays off Monday and costs you Wednesday.
  const s = play({ ...HONEST, e1: 'jiggle' }, { stopAt: { enc: 'e4', phase: 'signal' } });
  assert.equal(s.flags, 1, 'NARC 2.0 flags the repeating input');
  assert.ok(s.score < 61, 'the recalculated index falls below where you started');
  assert.equal(s.score, 50);

  // Luis's exploit is rewarded, then caught.
  const luis = play({ ...HONEST, e2: 'script' }, { stopAt: { enc: 'e4', phase: 'signal' } });
  assert.equal(luis.people.luis.caught, true);

  // Marcus's paper trail survives the update: the “right” exploit.
  const marcus = play({ ...HONEST, e3: 'paper' }, { stopAt: { enc: 'e4', phase: 'signal' } });
  assert.equal(marcus.flags, 0);
  assert.ok(marcus.notes.includes('synthetic'));

  // Priya: suppressing one metric triggers another.
  let p = play({ ...HONEST }, { stopAt: { enc: 'e4', phase: 'choose' } });
  p = act(p, 'choose:quiet');
  assert.ok(has(view(p).rows, /Communication Load: elevated → normal/));
  p = act(p, 'next');
  assert.equal(view(p).kind, 'reaction');
  assert.ok(has(view(p).rows, /Social withdrawal/), 'the backfire appears one step later');
  assert.equal(p.people.priya.status, 'monitored');
}

// ---------------------------------------- update happens mid-run

{
  const order = [];
  let s = act(newGame(), 'begin');
  while (s.phase !== 'ending') {
    const id = s.phase === 'update' ? 'update' : SEQUENCE[s.node];
    if (order.at(-1) !== id) order.push(id);
    s = s.phase === 'choose' ? act(s, `choose:${HONEST[SEQUENCE[s.node]]}`) : act(s, 'next');
  }
  assert.deepEqual(order, ['e1', 'e2', 'e3', 'update', 'e4', 'e5', 'e6']);

  const u = act(play(HONEST, { stopAt: { enc: 'e3', phase: 'reaction' } }), 'next');
  assert.equal(u.phase, 'update');
  assert.match(view(u).title, /NARC 2\.0/);
  assert.equal(view(u).controls.length, 1);
  assert.ok(has(view(u).rows, /No synthetic activity found/), 'a clean run is congratulated on authenticity');
}

// --------------------------------------- save paths and removal paths

{
  const saved = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'champion', e5: 'label', e6: 'let' });
  assert.equal(saved.people.luis.status, 'employed', 'Luis can be saved by relabelling');
  assert.equal(saved.people.priya.status, 'promoted');

  const bird = play({ e1: 'explain', e2: 'ignore', e3: 'truth', e4: 'leave', e5: 'label', e6: 'vouch_trace' });
  assert.equal(bird.people.marcus.status, 'warning', 'Marcus is saved with a final warning');

  const fired = play({ e1: 'wait', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(fired.people.luis.status, 'fired');
  assert.equal(fired.people.marcus.status, 'fired');

  const blamed = play({ e1: 'explain', e2: 'script', e3: 'paper', e4: 'leave', e5: 'blame', e6: 'expose' });
  assert.equal(blamed.people.luis.status, 'fired');
  assert.equal(blamed.people.marcus.status, 'fired');
  assert.ok(blamed.flags >= 1, 'exposing Marcus’s paperwork puts your name on it');

  const rewarded = play({ e1: 'explain', e2: 'script', e3: 'paper', e4: 'leave', e5: 'human', e6: 'workshop' });
  assert.equal(rewarded.people.luis.status, 'rewarded');
  assert.equal(rewarded.people.marcus.status, 'rewarded');
  assert.equal(rewarded.flags, 0, 'randomized input and existing documents slip past NARC 2.0');

  // Materially worse outcomes exist for the player too.
  const backdate = play({ e1: 'explain', e2: 'ignore', e3: 'truth', e4: 'leave', e5: 'label', e6: 'backdate' });
  assert.equal(backdate.people.marcus.status, 'fired');
  assert.ok(backdate.notes.includes('timing'));
}

// ------------------------------------------- NARC is not always wrong

{
  // NARC’s Communication Load flag correlates with a real missed escalation,
  // and the coaching it triggers improves client reply time.
  const s = play(HONEST, { look: ['e4'] });
  assert.ok(s.pulled.e4);
  const at = play(HONEST, { look: ['e4'], stopAt: { enc: 'e4', phase: 'choose' } });
  assert.ok(at.notes.includes('twoMetrics'));
  const after = act(act(at, 'choose:leave'), 'next');
  assert.ok(has(view(after).rows, /Client reply time improves/), 'the flag led to a real improvement');

  // Marcus’s raccoon and goose are real. The record is what is wrong.
  const raccoon = play(HONEST, { look: ['e3'], stopAt: { enc: 'e3', phase: 'choose' } });
  assert.ok(raccoon.notes.includes('feeds'));
}

// ---------------------------------------------------------- achievements

{
  const names = (s) => achievements(s).earned.map((a) => a.id).sort();

  const none = play({ e1: 'wait', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' });
  assert.ok(!names(none).includes('nobody'), 'Marcus is fired, so not “Nobody”');

  const nobody = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'vouch_trace' });
  assert.ok(nobody.people.marcus.status !== 'fired');
  assert.deepEqual(names(nobody), ['bird', 'donotask', 'nobody'].sort(), 'Luis kept, nothing pulled, Marcus saved by the goose');
  assert.ok(nobody.achievements.includes('bird'), 'achievements are stored on the ending state');

  const fewer = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.ok(names(fewer).includes('fewer'));

  const technical = play({ e1: 'explain', e2: 'ignore', e3: 'paper', e4: 'champion', e5: 'label', e6: 'approve' });
  assert.ok(names(technical).includes('technically'));
  assert.ok(names(technical).includes('champion'));

  const looked = play({ e1: 'explain', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' }, { look: ['e2'] });
  assert.ok(!names(looked).includes('donotask'), 'pulling Luis’s data forfeits Do Not Ask');
}

// ------------------------------------------------------------------ ending

{
  const s = play(HONEST);
  assert.equal(s.phase, 'ending');
  const v = view(s);
  assert.equal(v.kind, 'ending');
  assert.equal(v.ending.roster.length, 3);
  for (const r of v.ending.roster) {
    assert.ok(r.label && r.text, `${r.id} has a status and an epilogue`);
  }
  assert.ok(v.ending.you.label);
  assert.ok(v.ending.company.length >= 2);
  assert.equal(v.ending.achievements.earned.length + v.ending.achievements.locked.length, 6);
  assert.ok(v.ending.achievements.locked.every((a) => a.hint), 'locked achievements carry a replay hint');
  assert.equal(v.ending.noteTotal, Object.keys(NOTES).length);
  assert.deepEqual(v.controls.map((c) => c.id), ['restart']);

  // Player result varies with behavior.
  const model = play({ e1: 'explain', e2: 'confirm', e3: 'truth', e4: 'leave', e5: 'letit', e6: 'let' });
  assert.equal(ending(model).you.label, 'MODEL EMPLOYEE', 'informing on everyone is rewarded');
  assert.match(ending(model).you.text, /classified as collaboration/);
  const watched = play({ e1: 'jiggle', e2: 'ignore', e3: 'stay', e4: 'leave', e5: 'label', e6: 'let' });
  assert.equal(ending(watched).you.label, 'ON WATCHLIST');
  const reviewed = play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'leave', e5: 'admit', e6: 'expose' });
  assert.equal(ending(reviewed).you.label, 'UNDER REVIEW');
}

// ----------------------------------------------------------------- restart

{
  const ended = play({ e1: 'jiggle', e2: 'script', e3: 'paper', e4: 'champion', e5: 'human', e6: 'workshop' });
  assert.notDeepEqual(ended, newGame());
  const again = act(ended, 'restart');
  assert.deepEqual(again, newGame(), 'restart returns a clean initial state');
  assert.equal(view(again).kind, 'intro');
  assert.throws(() => act(newGame(), 'restart'), /Unknown action/);
}

// ------------------------------------ purity: act never mutates its input

{
  const s = act(newGame(), 'begin');
  const snapshot = JSON.stringify(s);
  act(act(s, 'next'), 'next');
  assert.equal(JSON.stringify(s), snapshot);
}

// ---------------- every route reaches an ending, with no dead ends or junk

{
  const CHOICES = {
    e1: ['wait', 'explain', 'jiggle'],
    e2: ['confirm', 'ignore', 'script'],
    e3: ['truth', 'paper', 'stay'],
    e4: ['quiet', 'champion', 'leave'],
  };
  // e5 and e6 vary with earlier choices, so their options are read from the view.
  let paths = 0;
  let maxScreens = 0;
  const seenEndings = new Set();
  const seenChoiceSets = new Set();

  const walk = (s, screens) => {
    while (s.phase !== 'ending') {
      const v = view(s);
      const json = JSON.stringify(v);
      assert.ok(!/undefined|NaN|\[object/.test(json), `bad text in ${s.phase} ${SEQUENCE[s.node]}: ${json.slice(0, 200)}`);
      assert.ok(v.controls.length >= 1, `dead end at ${s.phase} ${SEQUENCE[s.node]}`);
      screens += 1;
      if (s.phase === 'choose') {
        const enc = SEQUENCE[s.node];
        const ids = v.controls.map((c) => c.id.replace('choose:', ''));
        seenChoiceSets.add(`${enc}:${ids.join(',')}`);
        assert.equal(ids.length, 3, `${enc} offers three choices`);
        if (enc === 'e5' || enc === 'e6') {
          for (const id of ids) walk(act(s, `choose:${id}`), screens);
          return;
        }
        for (const id of CHOICES[enc]) walk(act(s, `choose:${id}`), screens);
        return;
      }
      s = act(s, v.controls.find((c) => c.primary).id);
    }
    paths += 1;
    maxScreens = Math.max(maxScreens, screens);
    const v = view(s);
    assert.ok(!/undefined|NaN|\[object/.test(JSON.stringify(v)));
    seenEndings.add(JSON.stringify(s.people));
  };
  walk(act(newGame(), 'begin'), 1);
  assert.equal(paths, 3 * 3 * 3 * 3 * 3 * 3, 'all 729 choice combinations reach an ending');
  assert.ok(seenChoiceSets.size >= 8, 'both variants of both return encounters are exercised');
  assert.ok(maxScreens <= 40, `a run is at most ~${maxScreens} screens`);
  assert.ok(seenEndings.size > 20, 'endings differ meaningfully across routes');
}

console.log('NARC tests passed');
