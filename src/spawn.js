import { clamp, difficulty, baseSpeed, CONFIG } from './config.js';
import { eligibleSpecies, SPECIES } from './species.js';

export function addCreature(game, speciesId, x, forward, options = {}) {
  const creature = { id: game.nextId++, speciesId, x, forward, spent: false,
    baseX: x, drift: 0, phase: 0, route: false, ...options };
  game.creatures.push(creature);
  return creature;
}

function chooseSpecies(game) {
  const pool = eligibleSpecies(game.distance);
  let roll = game.random() * pool.reduce((sum, species) => sum + species.weight, 0);
  return pool.find((species) => (roll -= species.weight) < 0)?.id ?? pool.at(-1).id;
}

export function seedFlock(game) {
  game.route = { x: 290, forward: 135, speciesId: 'gull', heading: 1, remaining: 3, count: 0 };
  addCreature(game, 'gull', game.route.x, game.route.forward, { route: true });
  extendFlock(game);
}

export function extendFlock(game) {
  const level = difficulty(game.distance);
  // A moving cursor follows the newest route member's speed, not the player's mount.
  // Sweeps change direction in short phrases; alternate targets form occasional forks.
  while (game.route.forward < game.player.forward + 1100) {
    if (--game.route.remaining <= 0) {
      game.route.heading *= -1;
      game.route.remaining = 2 + Math.floor(game.random() * 3);
    }
    const stride = 25 + 75 * level + game.random() * (40 + 25 * level);
    const nextX = game.route.x + game.route.heading * stride;
    if (nextX < 85 || nextX > 455) game.route.heading *= -1;
    game.route.x = clamp(game.route.x + game.route.heading * stride, 85, 455);
    game.route.forward += 115 + 30 * level + game.random() * (25 + 20 * level);
    game.route.speciesId = chooseSpecies(game);
    game.route.count++;
    addCreature(game, game.route.speciesId, game.route.x, game.route.forward, {
      route: true, drift: 12 * level, phase: game.random() * Math.PI * 2,
    });
    if (level > .12 && game.route.count % 3 === 0) {
      const side = game.route.x < 270 ? 1 : -1;
      addCreature(game, chooseSpecies(game), clamp(game.route.x + side * (100 + level * 60), 65, 475), game.route.forward + 25, {
        drift: 28 * level, phase: game.random() * Math.PI * 2,
      });
    }
  }
  // Threshold introductions are immediate, visible, and reachable from the rider.
  // This is an opportunity only: discovery still requires an actual catch.
  for (const species of SPECIES) {
    if (game.distance >= species.threshold && !game.introduced.has(species.id)) {
      game.introduced.add(species.id);
      addCreature(game, species.id, clamp(game.player.x + 45, 65, 475), game.player.forward + 180);
    }
  }
  game.creatures = game.creatures.filter((bird) => bird.id === game.mountId || bird.forward > game.player.forward - 260);
}

export function flockSpeed(game, speciesId) {
  return baseSpeed(game.distance) * CONFIG.flockMultiplier * SPECIES.find((species) => species.id === speciesId).speedMultiplier;
}
