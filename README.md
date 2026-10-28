# Bird Keeper: Sky Rodeo

A desktop browser sky runner: steer a tiny explorer, jump between flying animals, and discover new species farther into each flight. Built with plain JavaScript, Canvas 2D, and local HTML/CSS. There are no packages, external assets, accounts, or build steps.

This is the **Phase 1 handoff foundation** for [CMU HW7](https://www.cs.cmu.edu/~113/hw7.html). Read [SPEC.md](SPEC.md) for the intended design. The dated author-revision section in the spec takes precedence over the original tuning proposals. This README describes the actual implementation and remaining work.

Read [phase2_goals.md](phase2_goals.md) for the consolidated remaining work and latest author feedback: spawning is still too easy/linear, more flying animals are desired, and day/night cycles should be added.

## Run

Prerequisites: Python 3 and a modern desktop browser (current Chrome is the tested browser).

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/**. Stop the server with Ctrl+C. If port 8000 is occupied, choose another port and use it in the URL. Serve the files over HTTP: opening `index.html` directly via `file://` will not load the ES modules correctly.

## Play

| Control | Action |
| --- | --- |
| A / D or ← / → | Steer; opposing directions cancel |
| Space | Start from title; jump while mounted |
| P / Escape | Pause or resume |
| R | Restart after game over |
| Labeled buttons | Start, pause/resume, guide/back, restart |

Click the game if keyboard focus is elsewhere. Switching tabs or moving focus outside the game pauses the flight. Resume explicitly to continue.

You start on a gull. Aim toward a bird ahead, then press Space to lunge forward. The ring beneath your airborne rider marks the position used for catches; the raised rider artwork is cosmetic. Get that marker into a target's mint ellipse to catch automatically. A first jump immediately after starting is possible with a small correction to the right.

Ride duration varies: gull 5 seconds, eagle 7, bat 8, and pterodactyl 10. Eagle and bat are faster than gull; larger mounts steer more deliberately. TIRED and JUMP! warn before automatic ejection. Missing a catch ends the run. Distance is your score. Eagle appears from 150 m, bat from 400 m, and pterodactyl from 800 m. Discoveries require riding, persist across restarts, and **reset when the page is refreshed**.

## What works and what remains

Implemented: start/results/restart, steering, manual and fatigue jumps, catches, falling, continuing flock, four species with unlock thresholds, session discovery, field guide, distance/speed progression, pause/focus behavior, species-specific stamina/speed/steering, increasingly sweeping formations with forks and drift, and original shaded 2.5D Canvas artwork.

Not implemented: persistent saves/best score, owl, region transitions, storm hazards, sound, mute, and optional P2 effects. No extra packages are needed to finish the core game.

**Next developer: start with human playtesting.** Automated pilots establish that valid routes exist, but cannot tell us whether a new player understands the jump or enjoys the timing. The main remaining P0 work is validating and tuning that experience, rather than replacing the architecture.

## Revised flight tuning and visual direction

The author's follow-up requests longer rides for later discoveries, species-relative speed, harder formations, and a Rodeo Stampede-inspired 2.5D aesthetic. These settings replace the original P0/P1 tuning defaults, including the original shorter bat timer:

| Species | Carry time | Forward pace | Mounted steering | Visual scale |
| --- | --- | --- | --- | --- |
| Gull | 5 s | 1.00× | 260 units/s | 1.00× |
| Eagle | 7 s | 1.18× | 240 units/s | 1.28× |
| Bat | 8 s | 1.32× | 290 units/s | 1.08× |
| Pterodactyl | 10 s | 1.12× | 220 units/s | 1.62× |

These are **arcade ratios**, not claimed measured cruising speeds. Gull/eagle ordering is informed by [BTO's gull flight data](https://www.bto.org/sites/default/files/publications/bto_rr_739_cook_collision_risk_models_final_web.pdf) and [bald eagle normal flight speeds](https://seaworld.org/animals/facts/birds/bald-eagle/). The fast bat takes inspiration from [research on free-tailed bats](https://www.mpg.de/10820289/freischwanz-fledermaus-ist-der-schnellste-flieger-im-tierreich?c=987944); it does not imply all bats are faster than all eagles. The prehistoric flyer's speed and all carry durations are fictional game balance. Rarity rewards stamina even for the small bat.

Base speed ramps from 180 to 330 world units/s over 1,200 m. Species pace multiplies both ridden and wild forward travel. Jump speed remains 1.5× base with 260 units/s lateral steering for every species. The HUD displays actual world metres/second, not a real-world animal fact.

Route patterns change direction in groups of 2–4 targets. Lateral steps widen from 25–65 to 100–165 units; longitudinal spacing grows from 115–140 to 145–190. Backbone drift grows to 12 units; alternate targets can drift by 28. Forks add a choice every third new route member after the opening stretch. The difficulty cap keeps endless runs bounded rather than accelerating forever. Reset restores opening pace and formations.

Visuals use a fixed oblique camera, depth-scaled extruded meshes, shaded faces, articulated wings, depth sorting, and faceted islands/clouds at different scroll speeds. They are original Canvas drawings, with no downloaded assets or 3D-engine dependency. The scenery is decorative; catch ellipses and the airborne marker remain tied to the actual world collision positions.

## Acceptance report

Evidence recorded October 28, 2026: 16/16 simulation checks and 4/4 UI checks pass in headless Chrome; title and gameplay screenshots were visually inspected. “Met” below describes that evidence, not a claim of testing every browser or human skill level.

| ID | Status | Evidence / limitation |
| --- | --- | --- |
| AC-01 | Met | Local server returns HTTP 200; title includes controls, fatigue, and discovery instructions; no external runtime resources. |
| AC-02 | Met | Simulation verifies centered gull, zero distance, five-second timer, nearby target; UI verifies starting Space is consumed. |
| AC-03 | Met | Both key pairs feed direct steering; cancellation and bounds checked; airborne steering checked separately. |
| AC-04 | Partially met | CSS preserves the 540:900 playfield; the oblique camera keeps the rider at y=648 and scales distant targets; interactive resizing across browsers still needs a human check. |
| AC-05 | Met | UI check observes fresh-press jump and held-Space suppression through landing; renderer draws an arc. |
| AC-06 | Partially met | UI checks a real keyboard-driven catch; seeded pilots complete many consecutive transfers. Three consecutive human-directed transfers still need demonstrating. |
| AC-07 | Met | Simulation checks spent exclusion, stable tie resolution, and no further transfers while mounted. |
| AC-08 | Met | Missing freezes distance at falling; late overlap cannot catch; game-over reason checked. |
| AC-09 | Met | Timer, warnings, auto-ejection, fresh catch timer, and simultaneous manual/fatigue behavior implemented and checked. |
| AC-10 | Partially met | Twenty seeds reach 1,600 m with ordinary simulation inputs, capped speed, and fewer than 30 entities. Human route/timing fairness still needs playtesting. |
| AC-11 | Met | All four species have names, distinct shape branches, thresholds, and successful catch checks; long-run checks reject premature spawns. |
| AC-12 | Met | On threshold crossing, a new species is immediately placed 180 units ahead and at most 45 units laterally from the player; checks demonstrate catchability. |
| AC-13 | Met | Gull is credited only on start; introduction alone does not discover; first catch awards once and shows a toast. |
| AC-14 | Met | UI checks title/results guide navigation, four entries, threshold hints, and retained session discovery. |
| AC-15 | Met | HUD and results include specified P0 information; inspected gameplay screenshot and UI result assertions. |
| AC-16 | Met | Base curve rises from 180 to 330 by 1,200 m, multiplied by mounted species pace; long-run and repeated-reset checks verify progression and fresh eligibility. |
| AC-17 | Met | Simulation freezes all state when paused; UI checks pause/resume and focus loss; held input clears on blur. |
| AC-18 | Met | UI executes three miss/R-restart cycles; simulation verifies fresh entity IDs, timers, pool, and retained discoveries. |
| AC-19 | Partially met | Synthetic 30/60 Hz schedules agree; end-window catch, fatigue edge, and boundaries pass. Actual low-FPS hardware still needs manual verification. |
| AC-20 | Met | Extruded shaded meshes, distinct silhouettes/labels, separate block-like rider, jump arc and projected catch rings are drawn; clouds render behind targets and have no collision. |
| AC-21 | Met | Author-revised carry times, forward speed ratios, and mounted steering are configured per species and verified through actual simulation movement. Airborne rules stay shared. |
| AC-22 | Not met | Session-only discoveries; no storage or best-distance display. |
| AC-23 | Not met | No owl or region transitions. |
| AC-24 | Not met | No storms; only missed transfers cause failure. |
| AC-25 | Not met | Silent game; no audio or mute control. |
| AC-26 | Omitted | No additional P2 feature attempted. |

## Code map

| File | Responsibility / where to change behavior |
| --- | --- |
| `index.html` | Page, playfield canvas, HUD elements, static flight notes. |
| `styles.css` | Responsive layout, preserved aspect ratio, menus, HUD and guide. |
| `src/main.js` | One animation loop, fixed-step accumulator, screen rendering, HUD, button/keyboard actions. |
| `src/game.js` | Pure simulation: `startRun`, `launchJump`, `findCatch`, `catchCreature`, `startFall`, pause/resume, distance, discovery. |
| `src/config.js` | Shared physics/timing constants, 0–1 difficulty curve, and base speed cap; adjust related values together. |
| `src/input.js` | Held keys, fresh-key filtering, movement cancellation, blur/visibility/focus handling. |
| `src/spawn.js` | Initial flock, sweeping route/forks, drift parameters, per-species wild speeds, guaranteed introductions, cleanup. |
| `src/species.js` | Roster, carry duration, speed ratio, steering, visual size, thresholds, weights, palette and flavor. |
| `src/render.js` | Original extruded bird/rider meshes, articulated wings, parallax islands/clouds, projected target rings and jump/fall art. |
| `src/projection.js` | Fixed oblique world camera and model-space mesh, extrusion, block and face-shading helpers. |
| `tests/simulation.js` | Real simulation modules, deterministic pilot, state/threshold/collision edge checks. |
| `tests/ui.js` | Actual page inside an iframe, synthetic keyboard/button actions, controlled RAF clock. |
| `prompt_log.md` | Author-maintained prompt log; the assistant does not edit it. |

### Simulation contracts to preserve

- World coordinates are `{x, forward}`. Ten world units are one metre. Projection uses a fixed oblique perspective in `projection.js`; no catch uses rendered sprite bounds. Target-ring vertices are sampled from the world ellipse and projected using the same camera as the player marker.
- Only `Game.update(1/60, direction, jumpPressed)` advances gameplay. `main.js` accumulates real elapsed time, caps a stalled frame at 0.1 s, and runs fixed steps. Long stalls intentionally slow the simulation instead of causing a large jump.
- Rendering never changes world positions. Resize changes CSS size only. Clouds derive motion from forward distance, so pausing freezes them too.
- A mounted bird follows the player. Unmounted/spent birds advance at 35% of base speed times their species ratio; the route cursor uses its most recent species. The cursor is independent of any caught bird, which is moved onto the player at catch time. Airborne speed is always 1.5 times base speed, regardless of departed mount.
- Catch candidates are filtered by spent status and current-run eligibility; smallest normalized ellipse distance wins, then lowest entity ID. Catch is evaluated before jump expiration.
- Restart resets run state. `Game.discovered` is the only session progression; `introduced` is separate and resets every run. Do not use guide discovery to decide which birds can spawn.
- Threshold introductions bypass the random species draw. They are extra opportunities near the rider; ordinary route members continue independently.
- Menu transitions clear input. There is one RAF loop and one input instance, created once at startup.

## Verify before changing things

With the server running, open:

- **http://127.0.0.1:8000/tests/** — expect `16/16 checks passed`.
- **http://127.0.0.1:8000/tests/ui.html** — expect `4/4 checks passed`.

The UI fixture intentionally replaces the iframe's animation clock and leaves a still gameplay frame. Play the normal root page to assess feel. Tests use no framework or Node runtime.

High-distance scenarios live in `tests/simulation.js`. They adjust actual forward position, distance, route cursor, and introduction eligibility together, then use ordinary updates and catches. The long-run pilot reaches high distances naturally using only steering/jump inputs. There are no production cheat keys and no misleading score-only debug control.

Human checklist:

1. Start, steer, and land three transfers in a row; check that the logical marker explains each catch/miss.
2. Wait for fatigue, then try correcting the auto-jump. Check that the warning gives enough notice.
3. Miss deliberately, restart, hold Space through a landing, and verify a fresh press is required.
4. Pause in midair and switch tabs while steering; verify frozen progress and no stuck keys after resume.
5. Reach or simulate each threshold and distinguish appearance from discovery.
6. Resize to shorter/narrower desktop windows; check target/HUD readability, guide fit, and stable proportions.

## Continue in this order

1. Human-playtest the remaining partial P0 criteria. Tune jump reach, lateral spacing, and visual instructions together; record the actual results above.
2. Improve any observed readability or input bugs before adding features. Dense route targets at the very top can pass under HUD text; near-player catch space stays clear.
3. Tune the existing species stats and advancing difficulty with human feedback. Automated pilots now pre-position while mounted; the original reactive pilot failed around 1,010 m with harder patterns. Check that humans can read and plan those turns.
4. Add a small `storage.js` adapter with validated, versioned saves and a try/catch fallback. Load session discoveries at boot; save discoveries immediately and best distance at game over. Do not serialize live runs.
5. Add owl/regions, then storms and audio only if P0 remains stable. Storms need independent safe-placement work; decorative clouds currently must stay harmless.
6. Update this report. The author will maintain `prompt_log.md`. Preserve the foundation. The assignment's Phase 2 `HANDOFF_REPORT.md` is the inheriting student's own reflection and must be written by that student.

## Known limitations and deliberate shortcuts

- Human playtesting and real 30-FPS/resize trials remain outstanding; automated pilots are more precise than new players.
- No persistence: refreshing loses discoveries. This is the P0 session behavior, not a save implementation.
- Original extruded mesh artwork shares the same world-space catch ellipse for all species, regardless of wingspan. Labels and silhouettes carry identity.
- The route retains a backbone, adds alternate fork targets after 144 m, and widens turns/drift with distance. No hazards exist. Faster species can stretch/compress longitudinal gaps; fairness is tested over seeds, not mathematically proved for every random sequence or arbitrary player choice.
- New-species introductions may overlap a route member. Deterministic nearest-candidate selection handles this, but human testing should check whether such choices are visually clear.
- Canvas stays at logical resolution, so it can look soft on high-density displays. The game is intended for desktop keyboard play; a narrow layout is not touch support.
- Styling uses modern container-query units and system fonts. Chrome was checked; other browsers were not.
- At the author’s request, the assistant-generated log was removed and the author’s `promp_log.md` was renamed to `prompt_log.md` with its contents preserved exactly. The author maintains this file.

Before the Phase 1 deadline, review the diff, include the implementation, README, tests and prompt log in a commit, push the repository, and then freeze it as the assignment requires. The existing first commit already contains `SPEC.md` only. This implementation pass does not alter Git history or publish the repository.
