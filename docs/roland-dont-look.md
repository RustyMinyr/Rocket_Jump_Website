# Roland, Don't Look

RocketJump's footer Easter egg links to `/dont-look/index.html`. The game is static and self-contained; it has no camera, account, network API, analytics, paid service, or third-party runtime dependency. All artwork is served locally. The previous game prototypes are not part of this release.

## Journey

Eight replayable worlds: suspicious UFOs, snack moon, prehistoric dinosaurs, cavemen, an edible planet and belly escape, future city, time storm, cosmic eye. Each changes the gaze rule. Catch disguised UFOs, induce dinosaur sneezes, teach cavemen to dance, tickle a planet from inside, avoid staring at security robots, close black holes and return the cosmic eye's winks.

Move a mouse or touch the scene to look. Arrow keys move the gaze. Space Juice restores 35 health; Wooki Cookies restore 20 health and give a four-second shield. Powers unlock at journey milestones: Big Blink after world 1 (three-second shield, key 1), Time Pocket after world 3 (five-second slowdown, key 2), Super Stare after world 6 (repels creatures, key 3). Escape pauses. Checkpoints retry with full health; the surprise swallowing is survivable.

Completion unlocks the next world, saves the best stardust score and supports replay through Journey. Storage key `roland-dont-look-v1` stores only version, unlocked chapter, scores and sound preference locally. If storage is blocked, the game remains playable and explains that progress is only retained in the current tab.

## Assets

The supplied Roland helmet photo is preserved, with dynamic eye graphics drawn during gameplay. Three scene backdrops and eight creature/item sprites were generated specifically for this game. Optimized public assets total approximately 1.4 MB. Art source files and exact prompts are retained locally in `output/dont-look-art`; public distribution only includes the selected game assets.

## Verification

- `node --test --test-isolation=none tests/dont-look.test.mjs`: mechanics, all worlds, pause, resize, healing, power gates, close collisions, belly escape and malformed saves.
- `scripts/check-dont-look.cjs`: normal mouse/touch input through all eight worlds, ending, reload persistence, unlocked map, power use, keyboard, pause, sound, mobile layout and runtime/asset errors. Set `ROLAND_GAME_URL` to verify another origin.
- `scripts/check-dont-look-edge.cjs`: actual Next footer link, landscape, reduced motion, focus loss, map transitions, death/retry and denied storage.
- Production Next build, targeted footer lint and whitespace validation.

Browser scripts use the bundled local Playwright installation and save screenshots under `output/dont-look-qa`. `window.rolandJourney` exposes read-only snapshots to inspect automated play; it cannot alter progression or game state.
