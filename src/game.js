import { CONFIG, clamp, baseSpeed } from './config.js';
import { speciesById } from './species.js';
import { addCreature, seedFlock, extendFlock, flockSpeed } from './spawn.js';

export class Game {
  constructor(random = Math.random) {
    this.random = random;
    this.discovered = new Set();
    this.screen = 'title';
    this.creatures = [];
    this.player = { x: 270, forward: 0 };
    this.mode = 'mounted';
    this.elapsed = 0;
    this.distance = 0;
    this.notice = '';
    this.noticeTime = 0;
  }

  startRun() {
    this.screen = 'playing';
    this.mode = 'mounted';
    this.player = { x: 270, forward: 0 };
    this.creatures = [];
    this.nextId = 1;
    this.distance = 0;
    this.elapsed = 0;
    this.transfers = 0;
    this.newDiscoveries = [];
    this.introduced = new Set(['gull']);
    this.rideDuration = speciesById('gull').rideDuration;
    this.rideTime = this.rideDuration;
    this.airTime = 0;
    this.fallTime = 0;
    this.notice = '';
    this.noticeTime = 0;
    this.failureReason = '';
    this.mountId = addCreature(this, 'gull', 270, 0).id;
    this.discover('gull');
    seedFlock(this);
  }

  get mount() { return this.creatures.find((bird) => bird.id === this.mountId); }
  get speed() { return baseSpeed(this.distance) * (this.mode === 'mounted' ? speciesById(this.mount.speciesId).speedMultiplier : 1); }
  get forwardSpeed() { return this.speed * (this.mode === 'airborne' ? CONFIG.jumpMultiplier : 1); }

  discover(id) {
    if (this.discovered.has(id)) return;
    this.discovered.add(id);
    this.newDiscoveries.push(id);
    this.notice = `Discovered: ${speciesById(id).name}!`;
    this.noticeTime = 2.5;
  }

  launchJump() {
    if (this.screen !== 'playing' || this.mode !== 'mounted') return;
    this.mount.spent = true;
    this.mount.baseX = this.mount.x;
    this.mount.drift = 0;
    this.mountId = null;
    this.mode = 'airborne';
    this.airTime = 0;
  }

  catchCreature(bird) {
    this.mode = 'mounted';
    this.mountId = bird.id;
    bird.x = this.player.x;
    bird.forward = this.player.forward;
    this.rideDuration = speciesById(bird.speciesId).rideDuration;
    this.rideTime = this.rideDuration;
    this.airTime = 0;
    this.transfers += 1;
    this.discover(bird.speciesId);
  }

  findCatch() {
    return this.creatures
      .filter((bird) => !bird.spent && bird.id !== this.mountId && speciesById(bird.speciesId).threshold <= this.distance)
      .map((bird) => ({ bird, distance: ((bird.x - this.player.x) / CONFIG.catchX) ** 2 + ((bird.forward - this.player.forward) / CONFIG.catchForward) ** 2 }))
      .filter((candidate) => candidate.distance <= 1)
      .sort((a, b) => a.distance - b.distance || a.bird.id - b.bird.id)[0]?.bird;
  }

  startFall() {
    this.mode = 'falling';
    this.fallTime = 0;
    this.failureReason = 'Missed the next ride';
  }

  pause() { if (this.screen === 'playing') this.screen = 'paused'; }
  resume() { if (this.screen === 'paused') this.screen = 'playing'; }

  // Called only with a fixed 1/60-second step. Rendering never mutates world state.
  update(dt, direction = 0, jumpPressed = false) {
    if (this.screen !== 'playing') return;
    this.elapsed += dt;
    this.noticeTime = Math.max(0, this.noticeTime - dt);
    if (this.mode === 'falling') {
      this.fallTime += dt;
      if (this.fallTime + 1e-9 >= CONFIG.fallDuration) this.screen = 'gameover';
      return;
    }
    if (jumpPressed) this.launchJump();
    if (this.mode === 'mounted') {
      this.rideTime = Math.max(0, this.rideTime - dt);
      if (this.rideTime <= 1e-9) this.launchJump();
    }
    const steering = this.mode === 'mounted' ? speciesById(this.mount.speciesId).steering : CONFIG.steering;
    this.player.x = clamp(this.player.x + direction * steering * dt, CONFIG.minX, CONFIG.maxX);
    this.player.forward += this.forwardSpeed * dt;
    this.route.forward += flockSpeed(this, this.route.speciesId) * dt;
    for (const bird of this.creatures) {
      if (bird.id === this.mountId) {
        bird.x = this.player.x;
        bird.forward = this.player.forward;
      } else {
        bird.forward += flockSpeed(this, bird.speciesId) * dt;
        bird.x = clamp(bird.baseX + Math.sin(this.elapsed * 1.4 + bird.phase) * bird.drift, 50, 490);
      }
    }
    this.distance = this.player.forward / 10;
    if (this.mode === 'airborne') {
      this.airTime += dt;
      if (this.airTime + 1e-9 >= CONFIG.catchStart && this.airTime <= CONFIG.catchEnd + 1e-9) {
        const target = this.findCatch();
        if (target) this.catchCreature(target);
      }
      if (this.mode === 'airborne' && this.airTime + 1e-9 >= CONFIG.jumpDuration) this.startFall();
    }
    if (this.mode !== 'falling') extendFlock(this);
  }
}
