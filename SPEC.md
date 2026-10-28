# Bird Keeper: Sky Rodeo

## Author revisions — October 28, 2026

The author's implementation feedback supersedes conflicting tuning/visual proposals below. The numbered acceptance IDs remain stable.

- Later, rarer rides should carry the player longer: current tuning is gull **5 s**, eagle **7 s**, bat **8 s**, pterodactyl **10 s**. The bat's rarity earns extra stamina despite its small size.
- Species should have different forward speeds inspired by real flying animals, with eagle faster than gull. Current arcade multipliers: gull **1.00×**, eagle **1.18×**, bat **1.32×**, pterodactyl **1.12×**. These are gameplay ratios, not literal measured speeds; see README for sources and the fictional prehistoric-flyer choice.
- Mounted steering currently uses **260 / 240 / 290 / 220 units/s**, respectively. Airborne steering and jump rules remain shared.
- Flocks should become less linear and more demanding with distance: sweeping turns, alternate routes, lateral drift, and faster travel. Base speed now ramps from **180 to 330 units/s by 1,200 m**, multiplied by ridden species pace. Preserve a viable route rather than making random unavoidable gaps.
- Visual target: **chunky 2.5D like Rodeo Stampede**, with shaded volume, an elevated oblique view, recognizable animal silhouettes, and depth in the environment. The implementation uses extruded Canvas meshes and a shared projection for creatures and catch markers. True 3D remains unnecessary.
- The author maintains `prompt_log.md`; the assistant should not write or append to it.

The original proposal follows for context. Use the README for tested implementation status and exact current tuning.

## 1. Read this first

**One-sentence pitch:** An endless sky runner in which a tiny adventurer rides flying creatures, leaps between them before they become exhausted, and discovers increasingly unusual species farther into the journey.

The player should think: “That bird is getting tired, the next one is drifting left, and there is something new just beyond it. Can I make the jump?”

This document describes intended behavior, not implemented features. At the time this spec was written, this repository contained no game code. Check the implementation and README for actual completion status.

The original creative direction is the author's: an airborne spin on Rodeo Stampede, with bird-to-bird transfers and deeper-run discoveries, potentially including prehistoric flying animals. The detailed rules, numbers, title, and scope below are **AI-assisted design proposals** that turn that direction into an implementable handoff. They are not claims about the reference game's internal behavior. AI was also utilized for help in formatting information/details below (in tabular form, e.g.)

### Assignment context

**Implementation target:** a desktop browser game written in JavaScript, using HTML Canvas 2D and ordinary HTML/CSS for menus. There is no server or account system.

**Handoff rule:** finish a coherent playable loop before expanding content. P0 is the essential game; P1 is the desired extension set; P2 is optional polish. A criterion's ID stays stable even if its implementation changes.

## 2. The experience

### The fantasy

You are a sky explorer moving with a flock above a distant landscape. Your current bird carries you forward automatically. You steer around the sky corridor, watch for your next ride, and fling yourself into open air. A successful transfer feels like a brief, risky leap followed by a satisfying landing and a fresh flight timer.

Flying creatures are both transportation and discoveries. The opening flock is familiar and welcoming. Farther into the run, larger, stranger silhouettes appear. Seeing an unfamiliar creature creates a reason to take a risk beyond simply increasing the score.

The tone is bright, playful, and a little absurd. Riding a gull should look funny; catching a pterodactyl-like creature should feel like a small achievement. Failure is a harmless tumble into clouds followed by an immediate chance to try again.

### Core loop

1. Start on a common gull.
2. Move left or right while automatically flying forward.
3. Find another creature ahead before the current mount tires out.
4. Press Space to leap; continue steering while airborne.
5. Automatically catch an eligible creature when the rider enters its catch radius.
6. Receive a fresh mount timer and, if applicable, discover a new species.
7. Repeat as distance increases and more species enter the flock.
8. Miss a transfer, fall into the clouds, review the run, and restart.

**The defining interaction is steering a leap between moving creatures.** A random selection screen, automatic periodic mount swaps, or clicking a bird to teleport to it would not satisfy this design.

### What makes this version distinct

- The entire traversal happens in the air, with clouds, flapping wings, and the sensation of falling when a transfer fails.
- Mounts include flying animals beyond birds. The intended roster includes a bat and a pterodactyl-like prehistoric flyer.
- A field guide records species actually ridden. Merely seeing a creature is not a discovery.
- There is no ground course to follow. The flock forms the route, and moving between its members is the main challenge.

## 3. Reference and visual translation

The [Poki page for Rodeo Stampede](https://poki.com/en/g/rodeo-stampede-savannah) describes steering, jumping between animals, discovering creatures, and the pressure to leave a mount before being thrown off. These are the main reference mechanics. This project uses its own aerial rules and artwork.

The [Savannah gameplay image](https://rodeo-stampede.fandom.com/wiki/Savannah) and [another gameplay screenshot](https://game-ui.hateblo.jp/entry/2016/07/06/182349) are visual references for the elevated view, readable animal silhouettes, chunky shapes, and visible route ahead. The following camera and art instructions are a proposed adaptation for a small Canvas game, not a measured recreation of the original camera or timing.

| Reference quality | Translation for this game |
| --- | --- |
| Elevated view behind and above the rider | A fixed, overhead-oblique composition looking along a sky corridor |
| Animals visible ahead | Birds enter from the top and travel toward the rider as the rider overtakes them |
| Bold, chunky characters | Original flat-shaded polygon birds with large wings and distinct silhouettes |
| Readable route and obstacles | Open sky, clear mount outlines, and unobtrusive clouds |
| Urgent animal transfers | A visible flight timer and a short, steerable airborne interval |
| Animal variety | A changing flock and a small discovery checklist |

### Camera and composition

- Use a **540 × 900 logical playfield**, centered in the browser and scaled uniformly to fit. Preserve its proportions with letterboxing.
- Forward travel points toward the top of the screen. The rider's logical travel position is anchored around **50% width, 72% height**; lateral input changes horizontal position.
- Show much more space ahead than behind. The player needs time to notice targets and plan a transfer.
- The elevated angle is an art/composition effect: visible backs, wing tops, small heads facing forward, and a rider sitting above the body. A real perspective camera is unnecessary.
- Use simple 2D world projection and drawing order. Full 3D, a movable camera, and realistic flight physics are outside scope.
- Keep the camera stable during jumps. Lift the rider's artwork to show the arc, but keep a visible ring at its logical travel position so targeting remains understandable.
- On landing, the mount occupies the player's existing travel position. Do not suddenly scroll or snap the whole scene.

### Art direction

Use a cheerful, toy-like style: chunky bodies, broad angular wings, flat colors, and a tiny explorer with a scarf or aviator cap. Simple original Canvas shapes are sufficient. Avoid requiring downloaded models, sprites, or image generation to make the core game work.

Suggested palette:

| Element | Color direction |
| --- | --- |
| Main sky | Light blue, approximately `#87CEEB` |
| Lower haze/clouds | Very pale blue and white |
| Rider accent | Warm coral or orange, approximately `#F97360` |
| Catchable-target outline | Dark teal with a pale mint ring |
| Warning | Amber plus the word “TIRED” |
| Critical warning | Coral/red plus the word “JUMP!” |
| Text | Deep navy, approximately `#17324D` |
| Prehistoric flyer | Warm rust or purple with angular membrane wings |

These colors are starting points. Readability matters more than exact hex values.

Draw the rider separately from the mount. Show a small body/head or scarf so the player can understand that the person, rather than the bird, is jumping. No anatomical detail is necessary.

Birds must differ by **silhouette and label**, not color alone. A bat needs pointed membrane wings; the prehistoric flyer needs a long beak/crest and broad angular wings. A gull should have a compact body and relatively narrow wings.

### Motion and atmosphere

- The world should scroll smoothly, with several possible rides visible ahead.
- A basic wing flap can use two or three poses or a sine-wave wing angle.
- Mounted creatures can bob slightly; decorative bobbing never changes collision positions.
- Background clouds scroll more slowly than nearby creatures to suggest depth.
- Decorative clouds are translucent, have no outline suggesting danger, and never block the rider or target rings.
- Later sky colors can shift toward sunset or high-altitude violet, but visibility stays consistent.
- Tiny landing particles and a scarf trail are optional. Camera shake is optional and should be subtle.

### Speed and feel

Aim for readable arcade movement, with a transfer roughly every three to five seconds once the player understands the controls. The first jump should feel achievable after one or two attempts. The rider should remain steerable during a jump; a missed landing should be understandable from the visible positions.

All speeds below are proposed tuning defaults. They are not estimates of the reference game's speeds. Adjust them together after playtesting rather than treating each number as an independent requirement.

## 4. Scope and priorities

### P0 — Essential playable game

1. Browser launch, title/instructions, start, game over, and restart.
2. Automatic forward travel and responsive horizontal steering.
3. Mounted, airborne, and falling states.
4. Manual jumping, automatic proximity catches, and failure after a missed jump.
5. A mount timer with a warning and automatic ejection when it expires.
6. An endless stream of catchable flying creatures with reachable transfer opportunities.
7. Four distinct species: gull, eagle, bat, and prehistoric flyer.
8. Distance-gated species appearances and discoveries credited on landing.
9. Distance, mount name, timer, and discovery feedback on the HUD.
10. A field-guide/checklist view available outside active play.
11. Stable behavior across ordinary frame rates, pause/resume, and restart.

The four P0 creatures may share movement and stamina values. Their silhouettes, names, and unlock distances must differ. This preserves the author's core idea without requiring four separate movement systems.

### P1 — Desired additions after P0 works

1. Species-specific stamina and steering characteristics.
2. Saved discoveries and best distance using browser storage.
3. A fifth species, an owl, and more visual progression through sky regions.
4. Clearly marked storm clouds as an additional hazard, with fair spacing.
5. Small sound effects and a mute control.

### P2 — Optional polish

- More bird species or cosmetic variants.
- Better wing animations, a visible lasso, trails, and landing particles.
- A small chain counter that celebrates several transfers in one run.
- A reduced-motion setting and additional input options.
- A visually richer field guide.

### Explicitly outside this assignment's scope

- Zoo building, shops, currencies, upgrades, and economy systems.
- Multiplayer, online leaderboards, accounts, and a backend.
- True 3D rendering, imported 3D assets, realistic aerodynamics, or vertical flight controls.
- Combat, weapons, bosses, missions, breeding, or complex animal AI.
- Mobile/touch support, controller support, and a downloadable app.
- Multiple levels with loading screens or a narrative campaign.

These can be future projects, but they are not part of the requested handoff.

### What to sacrifice first

Cut P2, then audio and storms, then the owl and cosmetic region transitions, then species-specific physics, then saved progress. Preserve movement, transfers, fatigue, four recognizable species, distance-based discovery, and restart. If P0 still cannot be finished, report the specific incomplete criteria honestly; do not silently redefine them as optional.

## 5. Controls and screens

### Controls

| Input | Behavior |
| --- | --- |
| Left / A | Steer left while mounted or airborne |
| Right / D | Steer right while mounted or airborne |
| Space | Jump from a mount; start from the title screen |
| P / Escape | Pause or resume an active run |
| R | Restart after game over |
| Mouse click on a labeled button | Start, restart, open/close field guide, or resume |

There is no manual forward/backward movement or altitude input. Up/Down/W/S are unused. Simultaneous left and right cancel out. Prevent arrow keys and Space from scrolling the page while the game is focused.

Jumping is triggered by a **fresh key press**, not by holding Space. Holding the key must not cause an immediate second jump after landing. The Space press that starts a run is consumed and does not launch the player off the starting gull.

### Title screen

Show the game title, a Start button, a Field Guide button, and a short explanation:

> Steer: A/D or ←/→. Jump: Space. Catch another flyer before you fall. Switch before your bird gets tired. Ride new species to discover them.

Explain pause controls in smaller text. A decorative sky is sufficient; do not spend core implementation time on a cinematic menu.

### During play

The HUD shows:

- **Distance:** whole metres traveled this run.
- **Current ride:** species name, or “Airborne” during a jump.
- **Flight timer:** a clearly labeled remaining-time bar while mounted.
- **Discoveries:** number of species discovered out of the currently implemented roster.
- **Pause:** visible button or reminder.

Show a short, nonblocking “Discovered: Eagle!” notification only on that species' first successful ride in the current save/session. It must not cover the rider or freeze gameplay.

An undiscovered bird can display a small “NEW” marker. Its presence does not credit discovery.

### Paused screen

Overlay “Paused” and a Resume button. Freeze movement, timers, distance, spawns, and jump progress. Losing browser focus automatically pauses and clears held movement keys. Returning to the tab does not resume until the player requests it.

### Game-over screen

Show the final distance, successful transfers, species newly discovered this run, a clear failure reason, a Restart button, and a Field Guide button. With saved progress implemented, also show best distance.

Failure messages distinguish “Missed the next ride” from “Hit a storm cloud” if storms exist. Fatigue itself causes an automatic jump; it does not directly end the run.

### Field guide

Open from the title or game-over screen, never as an unpaused overlay during a run. Use a simple list or card grid:

- Discovered entries: silhouette/icon, species name, and a one-sentence flavor description.
- Undiscovered entries: a silhouette or question mark and the distance at which that species starts appearing.
- A Back button returns to the screen that opened the guide.

The starting gull is discovered when the first run begins. Opening the game for the first time without starting should not credit it.

## 6. Movement and transfer rules

### Coordinate model

Use a simple world plane with two values:

- `x`: horizontal location across the logical playfield.
- `forward`: distance traveled along the endless route, in logical world units.

One world unit projects to one logical screen pixel at the default scale. **Ten world units equal one displayed metre.** Starting forward position is zero.

The player's forward coordinate always increases during active mounted/airborne play. Other creatures have their own increasing forward coordinates but move more slowly, so the player overtakes them.

For a creature ahead of the player, its screen position is conceptually:

`screenY = playerAnchorY - (creatureForward - playerForward)`

Here `playerAnchorY` is approximately 648 in the 900-high logical playfield. Its `screenX` is its logical `x`. This is a design formula, not a requirement to build a perspective engine.

Use world coordinates for all catches and hazards. Do not compare the rider's raised jump artwork with an unraised creature's collision center.

### Starting movement defaults

| Parameter | Starting value | Purpose |
| --- | --- | --- |
| Base forward speed | 180 world units/second | About 18 displayed metres/second initially |
| Maximum base speed | 270 world units/second | Caps long-run difficulty |
| Difficulty curve | `min(270, 180 + 0.10 × distanceMetres)` | Gradual increase, capped at 900 m |
| Mounted horizontal speed | 260 world units/second | Responsive lateral steering |
| Airborne horizontal speed | 260 world units/second | Lets the player correct a jump |
| Airborne forward multiplier | 1.50 × current base speed | Brief forward lunge toward the next ride |
| Unmounted flock speed | 0.35 × current base speed | Slower than the player, making overtaking possible |
| Horizontal player bounds | x = 30 through 510 | Leaves room for the rider graphic |
| Jump catch window | 0.15 through 1.00 seconds | Prevents instant catches at launch |
| Maximum airborne duration | 1.05 seconds | A short, visible transfer opportunity |
| Catch ellipse radii | 28 horizontal, 35 forward world units | Forgiving, visible catch area |
| Starting ride duration | 5.0 seconds | Ensures the player must change mounts |
| Fatigue warning | Final 1.5 seconds | Gives time to line up a jump |
| Fall animation | Approximately 0.45 seconds | Brief feedback before game over |

Distance is accumulated from actual player forward movement, including the airborne boost. Freeze it as soon as falling starts. HUD distance is the floored nonnegative metre value. There is no separate points currency; distance is the score.

For P0, use direct horizontal movement at the listed speed rather than adding acceleration or drift. At the side boundaries, clamp position; touching an edge is not lethal.

### Mounted state

- The rider is attached to exactly one creature.
- The creature's position follows the player's controlled world position while mounted; suspend its former flock movement.
- Decrease its remaining ride time only during active play.
- During the final 1.5 seconds, show a textual warning and change the timer style. A slight flap/bob change is optional.
- At zero remaining time, trigger the same airborne transition as a manual jump, even if Space is not pressed.
- Landing on an ordinary unmounted bird while already riding does not switch mounts. Transfers require an airborne state.

### Jump launch

On a valid manual jump or fatigue ejection:

1. Detach the rider from its current mount at the current world position.
2. Mark the departed individual as spent and permanently ineligible for another catch during this run.
3. Give the departed creature ordinary flock motion so it drifts behind, or fade it out without collision.
4. Clear the current mount reference and start the airborne timer at zero.
5. Apply the airborne forward multiplier; keep horizontal steering enabled.
6. Draw the rider moving upward and then downward through a small arc, with a ring showing the actual catch position underneath.

The arc is visual, not a second simulated flight axis. A suggested artwork offset is a sine curve that peaks around 50–70 logical pixels. No additional jump is allowed while airborne.

### Automatic catching

A target must be unmounted, unspent, and active in the world. It must also fall inside the current run's unlocked species pool. Catching is allowed only during the catch window.

The rider catches a target if the difference in world positions satisfies the catch ellipse:

`(deltaX / 28)^2 + (deltaForward / 35)^2 <= 1`

The ellipse describes generous **lasso-assisted capture**, so catching may happen before the rider artwork finishes its arc. Snap/animate the artwork onto the new mount without changing the player's world position. The target's world position becomes the player's position, preventing a camera jump or free distance teleport.

For multiple eligible targets during one simulation step, choose the smallest normalized ellipse distance; break exact ties using a stable entity ID. Catch at most one creature per step.

On a successful catch:

- Enter the mounted state.
- Use the new creature's full ride duration.
- Increment successful transfers by one; the starting gull does not count as a transfer.
- Record discovery if this species has not been ridden before.
- Clear the airborne timer and stop drawing the jump arc/ring.
- Provide immediate feedback through the mount label and a brief landing effect.

A caught bird cannot be caught again in the same update. Ordinary unmounted birds do not damage the player, and their wing silhouettes are not obstacles.

### Missed jumps and falling

If no catch occurs by 1.05 seconds, enter falling. Disable further catches and steering, freeze score, show a brief shrinking/fading tumble into the clouds, and then display game over. No health system or extra lives are required.

Jump input during a fall does nothing. Once game over begins, stop spawning and updating gameplay entities.

### Simulation order and edge cases

Use elapsed time, not movement per frame. A fixed simulation step near 1/60 second is recommended, with a capped real-time delta after a stall. If another implementation is used, it must still prevent fast targets from skipping through the catch region.

Process each active simulation step consistently: consume fresh input, apply a permitted jump, advance movement/timers, resolve catchable overlaps within the catch window, and then resolve an expired airborne interval. If a valid catch and the end of the airborne interval coincide in the same step, prefer the valid catch.

If a manual jump and fatigue expiry coincide, launch once. Starting and restarting clear stale pressed keys. Pausing preserves the exact airborne or mounted state. Resuming must not advance the simulation by all the time spent paused.

## 7. Species and discoveries

### Essential roster

These are gameplay categories, not a biology simulation. The prehistoric creature may be named “Pterodactyl” in player-facing text; “prehistoric flyer” describes its role in this spec.

| ID | Display name | First appearance | Visual identity | Flavor text |
| --- | --- | --- | --- | --- |
| `gull` | Gull | 0 m | White/gray body, yellow beak, narrow wings | “A familiar friend for the first leap.” |
| `eagle` | Eagle | 150 m | Broad brown wings, pale head, larger body | “A confident rider of the open sky.” |
| `bat` | Bat | 400 m | Dark body, pointed ears, angular membrane wings | “Proof that this flock welcomes more than birds.” |
| `pterodactyl` | Pterodactyl | 800 m | Long beak/crest, large triangular membrane wings | “Apparently the sky forgot what century it is.” |

All four use the P0 movement defaults. They are catchable rides, not background decorations. A new silhouette alone does not satisfy species variety if its name and discovery identity remain the same.

### Appearance and discovery are different

- **Eligible/unlocked:** the current run has reached a species' distance threshold, so it may spawn.
- **Seen:** it has appeared on screen; this has no progression effect.
- **Discovered:** the player has successfully ridden that species at least once.

Each run starts at zero metres with only the initial spawn pool. Previously discovering a bat does not make bats appear at the beginning of a new run. The field guide can retain the discovery independently.

Check eligibility when creating a creature, using actual current run distance. Do not populate the visible screen with a locked species before its threshold and count it as unlocked merely because the bird is positioned far ahead.

Within five active seconds of crossing a species threshold, place at least one of that newly eligible species on a reachable part of the upcoming flock. This is an appearance guarantee, not a forced catch. If multiple threshold events are pending, queue them in threshold order.

After that first appearance, select ordinary spawns from the currently eligible pool with simple weights: gull 5, eagle 3, bat 2, prehistoric flyer 1. Normalize only the included species. These are proposed frequency weights, not rarity systems requiring special UI.

The prehistoric flyer first appears roughly 35–45 seconds into a successful run with the proposed speed curve and jump boosts. Treat this as a pacing target to check in play, not a promise of an exact timestamp.

### Optional differentiated behavior — P1

Implement these by configuration, without changing the core transfer rules:

| Species | Ride duration | Mounted horizontal speed | Tradeoff |
| --- | --- | --- | --- |
| Gull | 5.0 s | 260 units/s | Balanced starting mount |
| Eagle | 6.0 s | 230 units/s | More planning time, slower steering |
| Bat | 4.0 s | 300 units/s | Agile but needs frequent transfers |
| Pterodactyl | 7.0 s | 210 units/s | Long ride, deliberate positioning |
| Owl, optional fifth species | 5.5 s | 245 units/s | A middle-ground extra discovery at 600 m |

Keep airborne steering at 260 units/s for every species. Do not add involuntary zigzags, attacks, or species-specific jump systems. Adjust safe-route spacing if a differentiated mount makes a required transfer unreachable.

## 8. Endless flock generation and fairness

The flock is the level. A purely random field of birds can create unwinnable gaps, so build a simple continuous route of potential rides and add decorative/alternative targets around it.

### Initial layout

- Start mounted on a gull at horizontal center and forward zero.
- Populate the view ahead immediately; do not make the player wait for the first target.
- Place the first unmounted gull approximately 120–150 world units ahead and within 40 units horizontally of center.
- Keep the first three seconds free of optional hazards.
- Use ordinary controls from the beginning; no forced tutorial sequence is required.

### Route backbone

- Maintain a sequence of unmounted creatures extending beyond the visible top of the playfield.
- A starting longitudinal gap is **110–140 world units** between backbone creatures.
- Each next backbone creature changes horizontal position by at most **80 units**, clamped to x = 65 through 475.
- All ordinary flock creatures move at the same P0 forward speed. Decorative flapping does not change these gaps.
- Include enough visible rides that the player can normally identify the next one and at least one later option.
- Optional filler creatures may add choices, but must not replace the backbone with sparse random generation.

The backbone is a practical starting algorithm, not a proof that every arbitrary jump is survivable. Verify reachability at the starting and maximum speeds. There must be a viable sequence of transfers when the player makes reasonable steering/timing choices; jumping too early, too late, or toward the wrong side can still lose.

Useful tuning check: at starting speed, an airborne rider moves about 207 world units/second faster than the unmounted flock. A target 120 units ahead reaches the player's longitudinal catch region in roughly half a second, leaving time for a moderate lateral correction. Check the whole catch window and target width when tuning, not just center-to-center distances.

### Lifecycle and density

- Spawn beyond the visible forward edge and remove creatures well behind the player.
- A sensible initial target is 4–7 active creatures visible ahead, with a bounded pool around 20–30 total active entities.
- Spent mounts can fade or scroll away. They must never become a reusable stamina reset.
- Never remove the current mount during ordinary cleanup.
- Avoid a new target appearing directly underneath the rider.
- Keep HUD and effects outside gameplay decisions; a discovery banner must not hide the only reachable ride.
- Scale density conservatively as speed rises. Do not increase speed, widen lateral gaps, and remove targets at the same time.

## 9. Progression, scoring, and optional hazards

### Run progression

Distance changes the eligible species pool and smoothly raises speed to its cap. It does not permanently increase difficulty between runs. Restarting always returns to the starting speed, distance zero, and a gull.

Sky color bands can loosely support progression: clear daytime at the start, warmer clouds after 400 m, and violet high-altitude tones after 800 m. These are cosmetic P1 additions; the creatures are the important progression reward.

### Scores

Distance is the primary score. Successful transfers are a secondary statistic on game over. Newly discovered species are listed separately. Do not create a hidden scoring formula or multiplier that the HUD does not explain.

For P0, discoveries persist across restarts for the current page session. A full browser refresh may reset them. Persistent best distance is P1.

### Storm clouds — P1

Only add storms after the core loop is complete and the route has been playtested.

- Start spawning storms after 300 m.
- Make them visually distinct from scenery: dark body, lightning symbol, and an explicit danger outline.
- Collision with the logical rider position ends the run, whether mounted or airborne. The jump artwork does not let the rider fly over a storm.
- Use a forgiving collision circle around the cloud's center, smaller than the visible artwork.
- Telegraph a storm at least two active seconds before its earliest possible contact at the current maximum approach speed.
- Keep storms out of the required backbone transfer corridor and do not spawn one on top of an existing catchable target.
- Never form an impassable wall. If safe placement is uncertain, skip that storm.

P0 failures come entirely from missed transfers. This already provides a complete game; storms are additional variety.

## 10. Saving and resilience

### Session behavior — P0

A restart clears active creatures, score, timers, held input, jump state, transfer count, queued threshold events, and temporary visual effects. It retains the session's discovered-species set. Reopening the field guide must not change discoveries.

### Browser storage — P1

Use one versioned storage entry, such as `birdKeeperSaveV1`, containing only the discovered species IDs and best distance. Save a first discovery immediately and update best distance when a run ends.

Storage is a convenience. Catch parse/write failures and continue in memory. Validate loaded species against the implemented roster, reject invalid/negative best distances, and use defaults for missing fields. Do not attempt to serialize a live run.

## 11. Suggested implementation organization

This is guidance for a new implementation, not an instruction to rewrite a working foundation during the handoff. Once code exists, extend its established organization unless a small documented refactor is needed.

Use plain JavaScript and Canvas 2D. An engine, build system, framework, TypeScript migration, or external asset pipeline is unnecessary. Native ES modules served from a local static server are a reasonable default.

| Suggested file | Responsibility |
| --- | --- |
| `index.html` | Canvas, accessible buttons, and menu/HUD containers |
| `styles.css` | Responsive layout, letterboxing, typography, overlays |
| `src/main.js` | Boot, animation loop, and event wiring |
| `src/game.js` | Run state, transitions, distance, fatigue, transfers, and restart |
| `src/input.js` | Held movement keys, fresh presses, focus handling |
| `src/species.js` | Species data, thresholds, names, colors, and optional stats |
| `src/spawn.js` | Initial flock, backbone continuation, species selection, cleanup |
| `src/render.js` | Projection, creature/rider drawing, sky, and visual feedback |
| `src/storage.js` | Optional P1 save loading/writing and safe defaults |

Combining small modules is fine. Avoid splitting into many tiny classes or putting the whole game into one enormous function. Put tuning values together near the relevant system or in a small config object.

### State to keep explicit

- Screen: title, playing, paused, game over, or field guide.
- Player mode during play: mounted, airborne, or falling.
- Player world position, current mount ID, ride time, and airborne time.
- Active creatures with stable IDs, species IDs, positions, and spent status.
- Run distance, transfer count, and newly discovered species for this run.
- Session discoveries and optional saved best distance.
- Input state and queued species-appearance events.

Give transitions named functions such as `startRun`, `launchJump`, `catchCreature`, `startFall`, and `finishRun`. Keep collision calculations separate from drawing so visual changes do not change the rules accidentally.

Run locally with a documented static-server command, for example `python3 -m http.server 8000` from the repository root, then open `http://localhost:8000`. If the actual implementation uses a different setup, the README must give its real prerequisites and command. Do not advertise direct `file://` launch if modules require HTTP.

## 12. Numbered acceptance criteria

The inheriting developer should report **met / partially met / not met**, with evidence or a short explanation, for each ID in the README. P0 defines the essential game; P1 defines the desired additions; P2 may be omitted without affecting P0 completion.

### P0 — Essential

1. **AC-01 — Run and instructions.** Following the README on another machine opens the title screen. The screen states steering, jumping, the fatigue rule, and the goal of riding/discovering creatures. Starting requires no account, service key, or network-loaded gameplay asset.
2. **AC-02 — Fresh run.** Start produces a centered rider mounted on a gull, distance zero, a full ride timer, and visible targets ahead. The input used to start does not also launch a jump.
3. **AC-03 — Steering.** Left/Right and A/D move the player horizontally during both mounted and airborne play. Releasing the controls stops lateral movement; opposite inputs cancel; the player stays inside the corridor. Forward movement is automatic.
4. **AC-04 — Composition.** The playfield keeps its proportions on resize, the rider stays near the lower quarter, and targets approach from ahead. Resizing changes neither game-world positions nor collision rules.
5. **AC-05 — Manual jump.** A fresh Space press while mounted detaches the rider and starts one visible jump. Held Space and additional presses while airborne do not queue an automatic second jump.
6. **AC-06 — Successful transfer.** During the catch window, entering an eligible bird's displayed catch region mounts it automatically, refreshes ride time, updates the mount label, and increments transfers exactly once. At least three consecutive player-directed transfers can be demonstrated in ordinary play.
7. **AC-07 — No free swaps or recatches.** Passing through a bird while mounted does not switch rides. A departed individual cannot be caught again. Multiple nearby candidates resolve to one mount without duplicated score or discoveries.
8. **AC-08 — Missed jump.** A jump with no catch enters falling and then game over. Catches are disabled after falling begins, and distance stops increasing at that transition.
9. **AC-09 — Fatigue.** Remaining ride time decreases during active mounted play, warns in its final portion, and launches the rider automatically at zero. A catch starts a fresh timer. Staying on one bird indefinitely is impossible.
10. **AC-10 — Viable flock.** Targets exist at the beginning and continue spawning as the run proceeds. Playtesting at starting speed and capped speed demonstrates a usable transfer chain without unavoidable empty gaps. Offscreen cleanup retains the active mount and keeps the entity count bounded.
11. **AC-11 — Four species.** Gull, eagle, bat, and prehistoric flyer can all be ridden, have distinct names and recognizable silhouettes, and appear at their specified current-run distance thresholds. Locked species do not appear before those thresholds.
12. **AC-12 — New-species opportunity.** On crossing each new-species threshold, a reachable example appears within five active seconds. The player can choose to attempt or skip it; it is not automatically credited.
13. **AC-13 — Discovery.** Starting the first run discovers the gull. Catching each other species for the first time adds it to the session guide and shows one nonblocking notification. Seeing or missing a species does not discover it; repeat catches do not repeat the first-discovery award.
14. **AC-14 — Field guide.** From the title or game-over screen, the guide shows discovered entries and undiscovered entries with distance hints, and its Back button returns correctly. Discoveries survive ordinary run restarts within the page session.
15. **AC-15 — HUD and results.** Active play shows distance, mount/airborne status, ride time when mounted, and discovery count. Game over shows final distance, transfers, new discoveries, a failure reason, and restart controls.
16. **AC-16 — Progression.** Speed increases gradually with run distance and stops at a cap. A new run resets speed, distance, and the current-run species pool, even if the guide retains prior discoveries.
17. **AC-17 — Pause and focus.** P/Escape pauses and resumes an active run. Focus loss pauses it and clears held keys. Waiting while paused changes neither distance, mount time, jump time, nor spawn positions, and resume causes no time jump.
18. **AC-18 — Reliable restart.** Restart by button or R returns to a fresh run without reloading the page. Three successive failures/restarts do not create duplicate animation loops, duplicate input events, leftover hazards, or stale jump presses.
19. **AC-19 — Timing and boundaries.** Comparable input at approximately 30 and 60 frames/second produces comparable travel and jump duration. Side boundaries are nonlethal; simultaneous fatigue/manual jump launches once; a valid catch at the end of the catch window is handled consistently.
20. **AC-20 — Clear visuals.** The rider is visibly separate from the mount, jumping has a visible arc and logical-position marker, and species differ by shape/label. Decorative clouds do not behave like hazards or obscure required target feedback.

### P1 — Desired

21. **AC-21 — Different mount handling.** Species-specific ride durations and mounted steering values follow the roster table or documented playtested replacements. Every species retains the same airborne transfer rules.
22. **AC-22 — Persistent progress.** Refreshing preserves discoveries and best distance. Restart still resets current-run eligibility. Invalid or unavailable browser storage does not prevent starting or playing.
23. **AC-23 — Owl and regions.** An owl is catchable from 600 m, has its own guide entry and silhouette, and participates in discovery normally. Cosmetic sky transitions do not obscure targets or change collision behavior.
24. **AC-24 — Storms.** Storms start after 300 m, look different from decorative clouds, provide at least two seconds of warning, and leave the transfer route passable. Contact ends the run with a storm-specific message.
25. **AC-25 — Audio.** Jump, catch, discovery, and failure have short distinguishable effects. A visible mute control works; audio starts only after user interaction, and blocked audio does not break gameplay.

### P2 — Optional

26. **AC-26 — Additional polish.** Any extra species, chain counter, reduced-motion control, lasso, or particles are described accurately in the README, do not conceal the catch marker, and leave the P0 loop stable. Omit this criterion if no P2 features are attempted.

## 13. Manual verification plan

This plan is intentionally small. Use a temporary development overlay or console-controlled test setup if necessary; keep debug controls out of the normal player UI and document how to use them.

| Scenario | Action | Expected result |
| --- | --- | --- |
| First-time player | Open title, read instructions, start | Mounted gull, targets ahead, clear controls, no accidental jump |
| Steering and transfer | Steer toward a visible target and jump | Rider leaves gull, can correct course, catches target, timer refreshes |
| Miss | Jump deliberately away from all targets | Fall, frozen final distance, readable results, working restart |
| Fatigue | Stay on a mount without pressing Space | Warning, one automatic launch, then a catch opportunity or fall |
| Input edge | Hold Space through a catch | Remain mounted until a fresh press or fatigue ejection |
| Discovery | Cross a threshold; first miss, then catch that species | No award for sighting; one award on actual ride |
| Advanced roster | Play or use a documented debug setup around 150/400/800 m | Correct eligibility and timely reachable first appearances |
| Long run | Play or simulate beyond 900 m | Speed caps; flock continues; active entity count stays bounded |
| Pause during jump | Pause, wait several seconds, resume | Same jump resumes with its original remaining time |
| Focus loss | Hold a direction, switch tabs, release, return | Paused game; no stuck direction after resume |
| Repeat reset | Fail and restart three times | Clean run state and session discoveries retained |
| Resize and frame rate | Resize browser; inspect 30/60 FPS behavior | Stable proportions and comparable timing without skipped catches |
| Storage, if implemented | Refresh; then test invalid/blocked storage | Valid progress loads; invalid storage safely uses defaults |

For high-distance testing, do not change only the score label. A debug scenario must also reconcile actual world distance, speed, eligible species, queued introductions, and target positions so it tests the real systems.

## 14. Build sequence and handoff notes

### Suggested initial implementation, about 45 minutes

This is a suggested sequence, not a requirement to claim completion on a clock:

1. **First 10 minutes:** establish the Canvas, input handling, game loop, logical coordinates, and a visible gull/rider.
2. **Next 15 minutes:** implement steering, mounted/airborne/falling transitions, a fixed reachable target, and catch/miss behavior.
3. **Next 10 minutes:** replace the fixed target with a continuing flock and add the flight timer.
4. **Final 10 minutes:** stabilize start/restart and leave clear module boundaries/TODOs for species, discovery, and UI.

A few working systems are a better handoff than many half-connected features. Stop adding features early enough to reserve the assignment's separate documentation time.

### Suggested continuation order

1. Read this spec and the README, run the inherited game, and verify what actually works.
2. Fix core transfer, missed-jump, fatigue, and restart issues first.
3. Complete flock fairness, four species, distance thresholds, and discovery state.
4. Finish the guide, HUD, pause behavior, and acceptance checks.
5. Add P1 items only as time allows, using the cut order above.
6. Update the README's per-criterion status using actual observed behavior.

Do not replace the foundation solely to match the suggested filenames. The handoff should preserve the existing working systems and explain any necessary changes.

### What the README must tell the next developer

- The exact local run command and prerequisites.
- Current controls and implemented roster.
- Per-criterion status, with specific evidence or limitations.
- Where input, state transitions, collision, spawning, rendering, and species data live.
- The next few changes in priority order.
- Known bugs, incomplete behavior, temporary shortcuts, and tuning values that need attention.

Keep implementation status in the README; keep this file as the target design. For example, “species are configured but never spawn” is partial implementation, not a completed discovery feature. Keep the prompt log separate and record substantive AI prompts accurately, including this spec's assistance.

## 15. Decision guide for the inheriting developer

If something remains ambiguous, choose the interpretation that makes manual bird-to-bird transfers readable and playable within the time available. Preserve these decisions:

1. The player actively steers every jump; transfers are not automatic scheduled swaps.
2. Birds are temporary rides, so the player must keep switching.
3. A missed ride means falling, followed by a fast restart.
4. New species appear farther into each run and are discovered by riding them.
5. Bat and prehistoric-flyer identities matter because this is a world of flying animals, not only ordinary birds.
6. Clear original shapes and a stable elevated camera are sufficient visual fidelity for this assignment.

The intended finished result is a small, complete sky-riding arcade game that makes the player want one more run to land on the creature they just missed.
