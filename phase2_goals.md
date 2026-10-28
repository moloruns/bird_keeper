# Bird Keeper — Phase 2 goals

This is the remaining-work and refinement brief for the developer taking over. Read [SPEC.md](SPEC.md) for the original game and its dated author revisions, and [README.md](README.md) for setup, the code map, and current acceptance results. This document records the author's latest feedback and priorities; it does **not** claim these goals are already implemented.

## 1. The author's direction

The game should feel like an airborne, birds-and-flying-animals take on Rodeo Stampede: steering between moving creatures, making risky transfers, and discovering exciting new rides farther into a run.

The author's critiques and requests are:

1. **Bigger, rarer creatures should carry the player longer.** Discovering a stronger ride should feel rewarding, not like swapping only its appearance.
2. **Species should have different speeds inspired by real-life flying speeds**, such as eagle being faster than gull. Use readable arcade balance rather than pretending the numbers are a biology simulation.
3. **The game should get faster and harder with distance.** The flock should demand more steering, timing, and route selection as a run develops.
4. **Spawning is still too easy and too linear.** An initial revision added sweeping patterns, forks, and drift, but the author explicitly says this has not solved the problem. Treat spawn design as unfinished even though automated tests can complete the route.
5. **Add more birds and other flying animals.** Discovering unfamiliar creatures is a main reason to continue playing.
6. **Add daytime/nighttime cycles**, giving longer runs a changing atmosphere beyond the current fixed sky.
7. **Improve the aesthetic toward Rodeo Stampede's chunky 2.5D style.** The current shaded meshes and oblique camera are a foundation, not a declaration that the desired art quality has been reached.

These requests refine the existing game. Preserve the working transfer loop and extend its modules rather than rebuilding the project.

## 2. Current foundation: keep and refine

Implemented systems include steering, manual jumping, proximity catches, fatigue/ejection, falling, results/restart, four distance-gated species, session discoveries, a guide, pause/focus handling, and fixed-step simulation. Species now have different carry times, forward speeds, steering, and visual sizes. Art uses original extruded Canvas meshes, perspective scaling, shadows, and parallax scenery.

Current tuning is a starting point for playtesting:

| Species | Appears at | Carry time | Forward multiplier | Mounted steering |
| --- | --- | --- | --- | --- |
| Gull | 0 m | 5 s | 1.00× | 260 units/s |
| Eagle | 150 m | 7 s | 1.18× | 240 units/s |
| Bat | 400 m | 8 s | 1.32× | 290 units/s |
| Pterodactyl | 800 m | 10 s | 1.12× | 220 units/s |

Base speed currently rises from 180 to 330 units/s by 1,200 m. Wild creatures also use their species' speed multiplier. Airborne movement remains shared: 1.5× base forward speed and 260 units/s lateral steering. The bat gets extra stamina as a rarity reward despite its small size. Real-flight references and the fictional prehistoric-flyer tuning are explained in the README.

The current automated baseline is **16 simulation checks and 4 UI checks passing**, including 20 seeded runs beyond 1,600 m. This establishes working mechanics and examples of viable routes; it does not prove that the game is challenging, readable, or fun for people.

## 3. Highest priority: improve flock design and difficulty

**Primary files:** `src/spawn.js`, `src/game.js`, `src/config.js`, `src/species.js`.

- Replace the obvious procession of animals with varied spatial formations. Candidate approaches include staggered clusters, offset groups, branching routes, and occasional separated opportunities. These are implementation suggestions, not a requirement to build every pattern.
- Make the player choose a route and line up a transfer. Avoid a single predictable trail where repeatedly jumping forward is usually enough.
- Keep an approachable opening, then introduce more demanding formations and timing as distance increases. Difficulty should come from meaningful choices, not merely adding more animals or increasing every number simultaneously.
- Revisit density and spacing: too many nearby targets make every jump safe. However, removing targets randomly can create unavoidable losses. Preserve at least one realistically reachable continuation for a player planning ahead.
- Balance faster species and their longer carry times together. A rare ride should feel better while still requiring transfers; no creature should bypass the central mechanic.
- Account for different wild flight speeds and lateral movement when checking reachability. A target that looks reachable at spawn time may have moved out of reach by the time the rider arrives.
- Avoid new-species introductions overlapping another target so closely that the player cannot deliberately choose the new animal. Keep the spec's reachable appearance opportunity within five active seconds of its unlock threshold.
- Retain an eventual speed/difficulty cap, bounded entity counts, and a forgiving first transfer.

**Completion evidence:** compare early, middle, and late runs; demonstrate visibly different formations and deliberate route choices. Demonstrate a human-controlled transfer chain at both opening and late-run speeds. A successful automated pilot alone does not close the author's “too linear/easy” critique. Record the tuning and any limitations in the README.

## 4. Finish manual verification of the core game

These existing P0 criteria are currently partial because they still need human/browser verification:

| Criterion | Remaining check |
| --- | --- |
| AC-04 — Composition | Resize to narrow and short desktop windows; check proportions, HUD/guide fit, and unchanged world/collision behavior. |
| AC-06 — Transfers | Perform at least three consecutive player-directed transfers with ordinary controls; check whether the visual marker explains the catch. |
| AC-10 — Viable flock | Playtest opening and capped-speed routes, especially after changing spawn patterns. Check fairness and bounded cleanup. |
| AC-19 — Timing | Verify on actual lower-frame-rate conditions as well as the synthetic 30/60 Hz test schedules. Check catches near the end of the jump window. |

Also regress fatigue warnings, held Space through a landing, pause during a jump, switching tabs while steering, missed-jump results, and three restart cycles. Fix observed control/readability bugs before adding optional systems.

## 5. Unfinished spec features

### Saved discoveries and best distance — AC-22

**Files:** add `src/storage.js`; integrate with `src/main.js` and `src/game.js`.

- Persist discovered species IDs and best distance in one versioned browser-storage entry.
- Load valid discoveries at startup; save a first discovery immediately and update best distance when a run ends.
- Display best distance in results, and optionally on the title screen.
- Validate IDs against the current roster and reject invalid/negative/non-finite distances. Malformed data or unavailable storage must fall back to a playable in-memory session.
- Restart must still reset distance, speed, and current-run species eligibility. A previously discovered late-game species must not spawn at the beginning.

**Done when:** refresh retains valid discoveries/best distance; corrupt or blocked storage does not break the game; restart starts a fresh run.

### Owl and additional flying animals — AC-23, expanded author request

**Files:** `src/species.js`, `src/render.js`, `src/spawn.js`, guide UI in `src/main.js`.

- Add the spec's owl at **600 m**, with its own silhouette, name, guide description, and discovery behavior.
- Expand the roster further as time permits. Possible candidates include a parrot, raven, albatross, or another prehistoric flyer; these are suggestions, not an author-approved mandatory species list.
- Give additions a reason to exist: recognizable shape and a meaningful balance of speed, stamina, steering, size, and rarity. Avoid a collection of differently colored copies.
- Place unlocks across the run so there is something to anticipate after the opening birds. Choose and document thresholds for species not already specified.
- Preserve the longer-carry reward for larger/rarer discoveries and the species-relative speed direction. Adjust the owl's original proposed stats if needed to fit the updated balance.
- Update spawn weights, first-appearance opportunities, guide totals, saves/validation, and tests together. Watch for hard-coded four-species assumptions in tests.

**Done when:** each added species can actually spawn after its threshold, be caught, award discovery once, and appear correctly in the guide. A drawing or data entry alone is not a completed species.

### Day/night cycle and sky progression — AC-23 plus new author request

**Files:** `src/render.js`, optionally explicit cycle state in `src/game.js`.

- Add a repeating **day → dusk → night → dawn → day** cycle. The existing spec mentioned sky-region changes; the author now also wants a day/night cycle, not just a permanent late-run tint.
- Choose and document a cycle duration that players can experience during a reasonable run. The author has not specified exact timings. Active simulation time is a simple option; pause must freeze the cycle.
- Transition sky, scenery lighting, and clouds smoothly. Stars, a moon, or warmer sunset colors are optional ways to make phases distinct.
- Keep birds, catch regions, the airborne marker, warnings, and HUD readable throughout night and transitions.
- Reset the cycle consistently on restart. Do not let darkness itself create an unfair hidden obstacle.
- Time-of-day species preferences could be a later refinement. They are not required, and must not prevent the existing guaranteed introduction after a distance threshold.

**Done when:** an entire repeating cycle is observable; pause/resume and restart behave consistently; night remains playable. Explain how to inspect a full cycle without a score-only debug hack.

### Storm hazards — AC-24

**Files:** explicit hazard state/collision in `src/game.js`, safe placement in `src/spawn.js`, distinct drawing in `src/render.js`.

- Introduce storms after **300 m**. Use dark shapes, a lightning symbol, and an explicit danger outline, clearly different from harmless clouds.
- Telegraph danger at least **two active seconds** before earliest possible contact at the current maximum approach speed.
- Use a forgiving logical collision region smaller than the artwork. Mounted and airborne riders are both vulnerable; a raised jump sprite does not bypass a world-plane collision.
- Keep hazards out of the necessary transfer corridor and off catchable targets. Never create an impassable wall; skip placement if safety is uncertain.
- Show a storm-specific failure reason. Integrate pause, restart, and cleanup correctly.

**Done when:** storms add decisions while a safe transfer route remains available, and collisions/results/cleanup are verified. Defer this feature if its fairness cannot be established in the available time.

### Audio and mute — AC-25

- Add short distinguishable jump, catch, discovery, and failure sounds.
- Provide a visible mute control; start audio only after user interaction.
- Blocked or unavailable audio must not interrupt play. Avoid repeated overlapping sounds from a single state transition.

**Done when:** effects trigger on the intended transitions and mute works through repeated runs.

## 6. Visual and interaction refinement

**Files:** `src/render.js`, `src/projection.js`, `styles.css`, `index.html`, `src/main.js`.

- Continue toward a cohesive, chunky 2.5D arcade aesthetic: readable animal volumes, stronger silhouettes, clear wing movement, a distinct rider, and depth in the sky environment.
- Check whether larger animals look and feel larger without hiding their catch area. Preserve the shared world-to-screen projection for target markers and collisions.
- Improve the jump/catch feedback so the rider's arc, landing, and return to a mount are immediately understandable. Keep the logical-position marker visible.
- Prevent distant birds from competing with HUD text. The current far flock can pass underneath the HUD.
- Reduce visual ambiguity when targets overlap, especially during new-species introductions.
- Inspect the field guide with a larger roster; add scrolling or adapt layout if cards no longer fit. Retain clear Back navigation.
- Consider high-density canvas rendering to reduce softness on high-DPI displays, while keeping logical game dimensions and collision rules unchanged.
- Check other desktop browsers; current automated/browser evidence is from Chrome.

Original Canvas art is sufficient. A full 3D engine, downloaded asset pipeline, or project rewrite is not required to achieve the requested direction.

## 7. Optional polish from the spec — AC-26

Only after the main priorities are stable:

- Cosmetic variants and additional species beyond the roster expansion above.
- More expressive wing animations, visible lasso, trails, or landing particles.
- A small consecutive-transfer chain counter/celebration.
- A reduced-motion option and additional input options if practical; mobile/controller support is still outside the required scope.
- A richer field-guide presentation.

Document only polish actually implemented. Effects must not hide catch markers, obscure targets, or change collision behavior accidentally.

## 8. Suggested Phase 2 order and handoff requirements

For approximately two hours, use this as a flexible budget, not a promise that everything fits:

| Work | Suggested time |
| --- | --- |
| Read/run the foundation and human-playtest the current loop | 15 minutes |
| Improve non-linear spawning and difficulty; verify transfers | 35 minutes |
| Add robust discovery/best-distance saving | 20 minutes |
| Add owl and, if practical, one more distinct flyer | 15 minutes |
| Add a basic readable day/night cycle | 15 minutes |
| Regress core controls, update acceptance results, document and commit | 20 minutes |

If time runs short, preserve the playable loop and prioritize the author's unresolved spawn critique. Cut optional polish, audio, and storms before destabilizing transfers. More species, visual refinement, and a richer cycle can remain honestly marked incomplete. Keep all unfinished items visible for whoever continues later.

- Run the existing simulation and UI checks, extending them for meaningful new behavior. Do not treat passing tests as proof of human playability.
- Update the README criterion by criterion: met, partially met, or not met, with actual evidence. Include the new day/night and refinement goals even where they extend the original acceptance list.
- Document final tuning, cycle timing, added species, known issues, and any small refactors. Preserve the existing foundation and the assignment's requirement to retain at least 75% of the inherited work.
- Keep the original author's creative direction and credit them as required by the assignment.
- The author manages `prompt_log.md`; do not have the assistant rewrite or append to it. The Phase 2 developer should record their own substantive prompts as required for their submission.
- The assignment's `HANDOFF_REPORT.md` is the inheriting student's own reflection and must be written by that student, not by AI.
- Commit and push the final handoff/submission at the appropriate phase deadline. Do not describe unimplemented goals as completed features.

Outside scope remains zoo/economy systems, accounts, multiplayer, online leaderboards, combat, a narrative campaign, and a true 3D migration. Spend the limited time making the sky-riding loop more varied, rewarding, and readable.
