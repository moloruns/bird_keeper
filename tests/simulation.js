import { Game } from '../src/game.js';
import { CONFIG, baseSpeed, difficulty } from '../src/config.js';
import { addCreature, flockSpeed, extendFlock } from '../src/spawn.js';
import { Input } from '../src/input.js';
import { SPECIES, speciesById } from '../src/species.js';
import { project } from '../src/projection.js';

const output = document.querySelector('#results');
const results = [];
let failures = 0;
function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, callback) {
  try { callback(); results.push(`PASS  ${name}`); }
  catch (error) { failures++; results.push(`FAIL  ${name}: ${error.message}`); }
}
function seeded(seed = 42) { return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; }
function fresh(seed) { const game = new Game(seeded(seed)); game.startRun(); return game; }
function steps(game, count, direction = 0) { for (let i = 0; i < count; i++) game.update(CONFIG.step, direction); }

test('Title does not discover; start seeds a centered gull and a nearby target', () => {
  const game = new Game();
  assert(game.discovered.size === 0, 'title discovery');
  game.startRun();
  assert(game.player.x === 270 && game.distance === 0 && game.rideTime === 5, 'fresh state');
  assert(game.discovered.has('gull') && game.transfers === 0, 'starting discovery');
  assert(game.creatures[1].forward === 135 && game.creatures[1].x === 290, 'first target');
});

test('Mounted and airborne steering, cancellation, nonlethal bounds', () => {
  const game = fresh();
  steps(game, 60, 1);
  assert(game.player.x === 510 && game.mode === 'mounted', 'right bound');
  steps(game, 1, 0);
  assert(game.player.x === 510, 'zero direction should stop');
  game.launchJump();
  steps(game, 5, -1);
  assert(game.player.x < 510 && game.mode === 'airborne', 'air steering');
});

test('Transfer refreshes timer without teleporting or recatching the old mount', () => {
  const game = fresh();
  const departed = game.mount;
  const target = game.creatures[1];
  game.player.x = target.x;
  game.update(CONFIG.step, 0, true);
  assert(departed.spent && game.mountId === null, 'departed mount spent');
  for (let i = 0; i < 60 && game.mode === 'airborne'; i++) game.update(CONFIG.step);
  assert(game.mountId === target.id && game.transfers === 1, 'target caught once');
  assert(game.rideTime === 5 && game.airTime === 0, 'fresh timer');
  assert(target.forward === game.player.forward && target.x === game.player.x, 'mount aligns to player');
  const transferCount = game.transfers;
  steps(game, 3);
  assert(game.transfers === transferCount, 'no repeated catch while mounted');
});

test('Nearest overlap wins; stable ID breaks ties; spent birds are excluded', () => {
  const game = fresh();
  game.launchJump();
  game.creatures = game.creatures.filter((bird) => bird.spent);
  const first = addCreature(game, 'gull', 270, 0);
  addCreature(game, 'gull', 270, 0);
  assert(game.findCatch().id === first.id, 'tie ordering');
  first.spent = true;
  assert(game.findCatch().id !== first.id, 'spent eligibility');
});

test('Catch is accepted exactly at the end of the window', () => {
  const game = fresh();
  game.launchJump();
  game.creatures = [];
  game.airTime = CONFIG.catchEnd - CONFIG.step;
  const relativeStep = game.speed * (CONFIG.jumpMultiplier - CONFIG.flockMultiplier) * CONFIG.step;
  const bird = addCreature(game, 'gull', 270, relativeStep);
  game.update(CONFIG.step);
  assert(game.mountId === bird.id && game.mode === 'mounted', 'end-window catch missed');
});

test('Miss freezes distance at falling and finishes with a clear reason', () => {
  const game = fresh();
  game.player.x = 30;
  game.launchJump();
  game.creatures = [];
  game.route.forward = 10000;
  steps(game, 63);
  assert(game.mode === 'falling', 'must fall after 1.05 seconds');
  const distance = game.distance;
  addCreature(game, 'gull', game.player.x, game.player.forward);
  steps(game, 27);
  assert(game.screen === 'gameover' && game.distance === distance && game.transfers === 0, 'fall must not catch or advance');
  assert(game.failureReason === 'Missed the next ride', 'failure reason');
});

test('Fatigue ejects once, including simultaneous manual jump', () => {
  for (const manual of [false, true]) {
    const game = fresh();
    const old = game.mount;
    game.rideTime = CONFIG.step;
    game.update(CONFIG.step, 0, manual);
    assert(game.mode === 'airborne' && old.spent && game.airTime === CONFIG.step, 'fatigue launch');
  }
});

test('Paused state freezes all simulation and resumes without advancing by wall time', () => {
  const game = fresh();
  game.launchJump();
  steps(game, 8);
  game.pause();
  const before = JSON.stringify(game);
  steps(game, 600);
  assert(JSON.stringify(game) === before, 'pause changed state');
  game.resume();
  game.update(CONFIG.step);
  assert(Math.abs(game.airTime - 9 * CONFIG.step) < 1e-8, 'jump timing after resume');
});

test('Three restarts clear run state while retaining session discoveries', () => {
  const game = fresh();
  game.discover('eagle');
  for (let i = 0; i < 3; i++) {
    game.startFall(); steps(game, 27); game.startRun();
    assert(game.distance === 0 && game.transfers === 0 && game.nextId < 16, 'stale state');
    assert(game.discovered.has('eagle') && game.introduced.size === 1, 'session versus run eligibility');
    assert(game.creatures.every((bird) => bird.speciesId === 'gull'), 'locked species on restart');
  }
});

// A deterministic pilot uses ordinary jumps and steering, never teleports or refreshes stamina.
function pilot(seed, renderHz = 60) {
  const game = fresh(seed);
  let target = null;
  let accumulator = 0;
  let peakEntities = 0;
  for (let frame = 0; frame < renderHz * 120 && game.screen === 'playing' && game.distance < 1600; frame++) {
    accumulator += 1 / renderHz;
    while (accumulator + 1e-9 >= CONFIG.step) {
      if (game.mode === 'mounted') {
        if (!target || target.id === game.mountId || target.spent || target.forward - game.player.forward < 55) {
          // Plan ahead while mounted, as a player must in later sweeping formations.
          target = game.creatures.filter((bird) => !bird.spent && bird.id !== game.mountId && bird.forward - game.player.forward > 180 && bird.forward - game.player.forward < 500)
            .sort((a, b) => (a.forward + Math.abs(a.x-game.player.x)*.5) - (b.forward + Math.abs(b.x-game.player.x)*.5))[0];
        }
      }
      const direction = target && Math.abs(target.x - game.player.x) > 2.2 ? Math.sign(target.x - game.player.x) : 0;
      const catchTime = target ? (target.forward-game.player.forward) / (baseSpeed(game.distance)*CONFIG.jumpMultiplier-flockSpeed(game,target.speciesId)) : Infinity;
      const jump = !!target && game.mode === 'mounted' && catchTime < .8 && catchTime > .2 && Math.abs(target.x-game.player.x) < CONFIG.steering * (catchTime-.08);
      game.update(CONFIG.step, direction, jump);
      peakEntities = Math.max(peakEntities, game.creatures.length);
      assert(game.creatures.every((bird) => ({ gull: 0, eagle: 150, bat: 400, pterodactyl: 800 })[bird.speciesId] <= game.distance), 'premature spawn');
      accumulator -= CONFIG.step;
    }
  }
  return { game, peakEntities };
}

test('20 seeded routes allow ordinary transfers beyond 1600 m with bounded entities', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const { game, peakEntities } = pilot(seed);
    assert(game.distance >= 1600, `seed ${seed} failed at ${game.distance.toFixed(0)} m`);
    assert(game.transfers > 3 && baseSpeed(game.distance) === 330, 'chain/cap');
    assert(peakEntities < 30, `pool reached ${peakEntities}`);
    assert(game.introduced.size === 4, 'missing threshold introduction');
  }
});

test('30 and 60 Hz render schedules produce equal simulation results', () => {
  const a = pilot(7, 30).game;
  const b = pilot(7, 60).game;
  assert(Math.abs(a.distance - b.distance) < 1 && a.transfers === b.transfers, 'frame-rate dependence');
  assert(baseSpeed(0) === 180 && baseSpeed(1200) === 330 && baseSpeed(2000) === 330, 'speed curve');
});

test('Every species can be caught and discovered only once after its threshold', () => {
  for (const [id, threshold] of [['eagle', 150], ['bat', 400], ['pterodactyl', 800]]) {
    const game = fresh();
    game.player.forward = threshold * 10;
    game.distance = threshold;
    game.route.forward = game.player.forward + 1500;
    game.creatures = [game.mount];
    game.introduced = new Set(SPECIES.filter((species) => species.threshold < threshold).map((species) => species.id));
    game.update(CONFIG.step);
    const introduced = game.creatures.find((bird) => bird.speciesId === id);
    assert(introduced && Math.abs(introduced.forward - game.player.forward - 180) < 1e-8, 'timely reachable intro');
    assert(!game.discovered.has(id), 'seeing should not discover');
    game.player.x = introduced.x;
    game.launchJump();
    steps(game, 60);
    assert(game.discovered.has(id), `could not catch ${id}`);
    game.discover(id);
    assert(game.newDiscoveries.filter((value) => value === id).length === 1, 'duplicate discovery');
  }
});

test('Input cancels opposite keys, ignores held Space, clears on focus loss', () => {
  const element = document.createElement('div');
  document.body.append(element);
  let presses = 0, focusLosses = 0;
  const input = new Input(element, (code) => { if (code === 'Space') presses++; }, () => focusLosses++);
  const key = (code, repeat = false) => element.dispatchEvent(new KeyboardEvent('keydown', { code, repeat, bubbles: true }));
  key('KeyA'); key('ArrowRight');
  assert(input.direction === 0, 'opposites');
  key('Space'); key('Space', true); key('Space');
  assert(presses === 1, 'repeat action');
  window.dispatchEvent(new Event('blur'));
  assert(input.direction === 0 && focusLosses === 1, 'blur clear');
  key('Space');
  assert(presses === 2, 'fresh press after clear');
  element.remove();
});

test('Rarer mounts carry longer; species affect actual ridden and wild travel', () => {
  let previousDuration = 0;
  const travelled = {};
  for (const species of SPECIES) {
    const game = fresh();
    game.player.forward = 12000; game.distance = 1200;
    const bird = addCreature(game, species.id, game.player.x, game.player.forward);
    game.catchCreature(bird);
    assert(game.rideTime === species.rideDuration && game.rideTime > previousDuration, 'carry-time progression');
    previousDuration = game.rideTime;
    const start = game.player.forward;
    const startX = game.player.x;
    game.update(CONFIG.step, 1);
    travelled[species.id] = game.player.forward-start;
    assert(Math.abs(travelled[species.id]-330*species.speedMultiplier*CONFIG.step) < 1e-8, 'mounted speed');
    assert(Math.abs(game.player.x-startX-species.steering*CONFIG.step) < 1e-8, 'mounted steering');
    game.launchJump();
    assert(game.forwardSpeed === 495, 'airborne rules differ by mount');
  }
  assert(travelled.eagle > travelled.gull && travelled.bat > travelled.eagle, 'speed ordering');
  const game = fresh();
  const gull = addCreature(game,'gull',100,600);
  const eagle = addCreature(game,'eagle',100,600);
  game.update(CONFIG.step);
  assert(eagle.forward > gull.forward, 'wild speed ordering');
});

test('Later flocks have wider sweeps, lateral motion, and alternate targets', () => {
  function formation(distance) {
    const game = fresh(99);
    game.player.forward = distance*10; game.distance = distance;
    game.creatures = [game.mount];
    game.route.forward = game.player.forward;
    game.route.x = 270; game.route.count = 0;
    game.introduced = new Set(SPECIES.filter((s) => s.threshold<=distance).map((s) => s.id));
    extendFlock(game);
    return game;
  }
  const early = formation(0), late = formation(1200);
  const width = (game) => { const x=game.creatures.filter((b)=>b.route).map((b)=>b.x); return Math.max(...x)-Math.min(...x); };
  assert(width(late) > width(early), 'no wider turns');
  assert(late.creatures.some((b)=>!b.route && b.id!==late.mountId), 'missing forks');
  const drifting = late.creatures.find((b)=>b.drift>0);
  const x = drifting.x;
  steps(late, 10);
  assert(drifting.x !== x, 'no lateral movement');
  assert(difficulty(0) === 0 && difficulty(1200) === 1 && difficulty(10000) === 1, 'difficulty cap');
});

test('Oblique camera preserves the rider anchor and scales distant targets', () => {
  const player = project(270,1000,1000);
  const near = project(290,1135,1000);
  const far = project(290,1500,1000);
  assert(player.x === 270 && player.y === 648 && player.scale === 1, 'anchor');
  assert(far.y < near.y && far.scale < near.scale && near.scale < 1, 'depth');
  const moved = project(300,1000,1000);
  assert(moved.x === 300 && moved.y === 648, 'steering projection');
});

output.textContent = results.join('\n') + `\n\n${results.length - failures}/${results.length} checks passed.`;
document.body.dataset.status = failures ? 'failed' : 'passed';
