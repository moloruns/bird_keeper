import { CONFIG } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { render, drawBird } from './render.js';
import { SPECIES, speciesById } from './species.js';

const game = new Game();
const stage = document.querySelector('#game');
const canvas = document.querySelector('#sky');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const hud = document.querySelector('#hud');
const distance = document.querySelector('#distance');
const mountLabel = document.querySelector('#mount');
const timerLabel = document.querySelector('#timer-label');
const timer = document.querySelector('#timer');
const discoveries = document.querySelector('#discoveries');
const speedLabel = document.querySelector('#speed');
const toast = document.querySelector('#toast');
let previousScreen;
let accumulator = 0;
let previousTime;

function start() { input.clear(); accumulator = 0; previousTime = undefined; game.startRun(); stage.focus(); }
function resume() { input.clear(); accumulator = 0; previousTime = undefined; game.resume(); stage.focus(); }
function togglePause() { if (game.screen === 'playing') { game.pause(); input.clear(); } else resume(); }

const input = new Input(stage, (code) => {
  if (code === 'Space') {
    if (game.screen === 'title') start();
    else if (game.screen === 'playing' && game.mode === 'mounted') input.jumpPressed = true;
  } else if (code === 'KeyR' && game.screen === 'gameover') start();
  else if (code === 'KeyP' || code === 'Escape') togglePause();
}, () => game.pause());

document.querySelector('#pause').addEventListener('click', togglePause);
stage.addEventListener('pointerdown', (event) => {
  if (event.target === canvas) stage.focus();
});

function showGuide() { game.guideFrom = game.screen; game.screen = 'guide'; input.clear(); }

function panel(html) { overlay.innerHTML = `<div class="panel">${html}</div>`; }
function button(id, label, secondary = false) { return `<button id="${id}" class="button ${secondary ? 'secondary' : ''}">${label}</button>`; }

function updateScreen() {
  if (previousScreen === game.screen) return;
  previousScreen = game.screen;
  hud.hidden = !['playing', 'paused'].includes(game.screen);
  overlay.hidden = game.screen === 'playing';
  if (game.screen === 'title') {
    panel(`<span class="badge">✦</span><p class="eyebrow">WELCOME TO THE OPEN SKY</p><h2>Bird Keeper</h2><p>Ride the flock. Take the leap.<br>See how far your wings will take you.</p><p>Steer with <b>A / D</b> or <b>← / →</b>.<br>Press <b>Space</b> to leap and catch a flyer.<br>Switch before your bird gets tired.<br>Ride new species to discover them.</p>${button('start', 'Take flight ↗')}${button('guide', 'Open field guide', true)}<p class="fine">P / Esc to pause · Desktop keyboard game</p>`);
    document.querySelector('#start').onclick = start;
    document.querySelector('#guide').onclick = showGuide;
  } else if (game.screen === 'paused') {
    panel(`<p class="eyebrow">A MOMENT IN THE CLOUDS</p><h2>Take a breather.</h2><p>Your flock will wait for you.</p>${button('resume', 'Keep flying ↗')}`);
    document.querySelector('#resume').onclick = resume;
  } else if (game.screen === 'gameover') {
    const newNames = game.newDiscoveries.map((id) => speciesById(id).name).join(', ') || 'None this flight';
    panel(`<p class="eyebrow">BACK TO EARTH, SOFTLY</p><h2>What a flight.</h2><div class="result">${Math.floor(game.distance)} <small>m</small></div><p>${game.failureReason}<br><b>${game.transfers}</b> successful transfers</p><p class="fine">New discoveries: ${newNames}</p>${button('restart', 'Fly again ↗')}${button('guide', 'Open field guide', true)}<p class="fine">Or press R to restart</p>`);
    document.querySelector('#restart').onclick = start;
    document.querySelector('#guide').onclick = showGuide;
  } else if (game.screen === 'guide') {
    panel(`<p class="eyebrow">NOT ALL WINGS HAVE FEATHERS</p><h2>Field guide</h2><p>${game.discovered.size} of ${SPECIES.length} flyers discovered</p><div class="guide">${SPECIES.map((species) => `<div class="guide-entry"><canvas width="120" height="90" data-species="${species.id}" aria-label="${game.discovered.has(species.id) ? species.name : 'Undiscovered flyer'}"></canvas><div><strong>${game.discovered.has(species.id) ? species.name : 'Unknown flyer'}</strong><p>${game.discovered.has(species.id) ? `${species.flavor}<br><b>${species.rideDuration}s carry · ${species.speedMultiplier.toFixed(2)}× pace</b>` : `Look beyond ${species.threshold} m. Ride to discover.`}</p></div></div>`).join('')}</div>${button('back', '← Back to ' + (game.guideFrom === 'title' ? 'the sky' : 'your flight'), true)}`);
    for (const icon of overlay.querySelectorAll('canvas')) {
      const iconContext = icon.getContext('2d');
      drawBird(iconContext, icon.dataset.species, 60, 58, 0, .55);
      if (!game.discovered.has(icon.dataset.species)) {
        iconContext.globalCompositeOperation = 'source-in';
        iconContext.fillStyle = '#809695';
        iconContext.fillRect(0, 0, 120, 90);
      }
    }
    document.querySelector('#back').onclick = () => { game.screen = game.guideFrom; };
  }
  if (game.screen !== 'playing') overlay.querySelector('button')?.focus({ preventScroll: true });
}

function updateHud() {
  distance.innerHTML = `${Math.floor(game.distance)} <small>m</small>`;
  mountLabel.textContent = game.mode === 'mounted' ? speciesById(game.mount?.speciesId ?? 'gull').name : game.mode === 'airborne' ? 'Airborne' : 'Falling';
  const mounted = game.mode === 'mounted';
  timerLabel.textContent = mounted ? `${game.rideTime.toFixed(1)} s${game.rideTime < CONFIG.warningTime ? ' · TIRED' : ''}` : 'Catch the next ride';
  timer.style.width = `${mounted ? game.rideTime / game.rideDuration * 100 : 0}%`;
  timer.style.background = game.rideTime < CONFIG.warningTime ? '#d9684c' : '#257c73';
  discoveries.textContent = `${game.discovered.size} / ${SPECIES.length} discovered`;
  speedLabel.textContent = `${Math.round(game.forwardSpeed / 10)} m/s · ${game.distance < 300 ? 'OPEN SKY' : game.distance < 800 ? 'CROSSWINDS' : 'HIGH ALTITUDE'}`;
  toast.hidden = game.screen !== 'playing' || game.noticeTime <= 0;
  if (toast.textContent !== game.notice) toast.textContent = game.notice;
}

function frame(time) {
  const delta = previousTime === undefined ? 0 : Math.min(.1, (time - previousTime) / 1000);
  previousTime = time;
  if (game.screen === 'playing') {
    accumulator += delta;
    while (accumulator + 1e-9 >= CONFIG.step) {
      game.update(CONFIG.step, input.direction, input.consumeJump());
      accumulator -= CONFIG.step;
    }
  } else accumulator = 0;
  updateScreen();
  if (!hud.hidden) updateHud();
  else toast.hidden = true;
  render(ctx, game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
