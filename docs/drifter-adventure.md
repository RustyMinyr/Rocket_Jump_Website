# Drifter

The current game is served at `/drifter/`. The existing `/roland-home/index.html` address remains compatible; both use the same game modules and save key. Drifter replaces the old real-face character with the supplied concept-art direction: an opaque visor, weathered white suit, pink hardware and the companion Dot.

## Adventure

- 13 systems, accessible in any order, with 36 planets. One is the intentional mouth trap; the asteroid system is also an intentional quick death.
- 35 explorable planets, each five times its earlier length: 16,250 units normally, 20,500–21,500 for the existing long boss worlds. Five populated stages include 25 enemies, 30 XP shards, supplies, caches, three memory signals, timed gates and two telegraphed vents.
- Character levels 1–20. Five recoverable suits plus the starter suit, and six recoverable relics. The Crystal Helm remains exclusive to Prism Break.
- Stage beacons save progress and restore some health. Journey lets players revisit reached checkpoints and read recovered memories.
- Click/tap destinations are captured in world coordinates. Water and flight support vertical steering. Arrow keys/A/D move; Up/W/Space rises or boosts; Down/S descends; E enters/exits a vehicle; Q gives a short shield burst. Dot handles automatic shooting. Tapping a nearby visible enemy gives Dot a priority target without cancelling the current travel destination. The optional X/J shortcut also remains available and no longer cancels travel.
- Dot follows with a damped spring and a loose orbit, moving into firing position while Drifter keeps facing his direction of travel. Automatic fire requires the entire target to be inside the playable viewport, within 600 world units (less on a narrow phone), and acquired for 0.38 seconds. Standard shots are spaced 0.72 seconds apart, with stronger pulses to keep encounters balanced. The ARC upgrade and vehicle shorten recharge. Shots originate at Dot's lens, with a muzzle flash, trail, target brackets and hit/defeat feedback. Dot waits out boss armour.
- Gravity fields disable bouncing. The Gravity Anchor allows walking elsewhere. Jetburst adds flight to other worlds. ARC Overcharger improves shooting. Equipment changes apply immediately; changing equipment never restores health or resets the Chrono rescue.
- The broken gravity device repeatedly launches Drifter on landing. Effective gravity is 40% of the original and launch speed is 58%, giving roughly 84% of the original height and 145% of the airtime: about 110 units high and 1.2 seconds per cycle on Moo-1. BOOST strengthens the next launch, while spring potions and spring surfaces bounce higher. There is no hover support over gaps.
- Neon Nine and the Lost & Foundry have stable gravity and continuous main paths; hold JUMP for raised platforms. Cyan Gravity Patches appear twice on ordinary bouncing worlds, suppress automatic bouncing for five playing seconds, and show a countdown. Manual jumping remains available, collecting another refreshes the duration, and opening Gear pauses it. Water worlds always use swimming; flight equipment and mounted vehicles retain their movement.
- GEAR is available beside the play controls, in the top navigation and from the pause menu. The I key opens it on a keyboard. The game pauses during equipment changes, recovered items appear first, and the sticky Done button returns to the adventure.
- Abandoned lunar landers can be driven; spaceships can be boarded and steered. Ships and landers turn their nose toward travel, accounting for their native left-facing artwork, and retain that direction when parked. Vehicles have a collection beam with additional reach. Tiny cave caches need a shrink potion found nearby.

## Saves

Version-two saves and the legacy storage key are retained. New bounded `stage`, `cache` and `signal` claims coexist with the older achievements. Checkpoint progress merges monotonically; completed discoveries and gear survive deaths and stale account saves. Guest progress is separate from account progress unless the player explicitly imports it.

The local preview uses persistent SQLite and email/password sign-in. Session cookies are HttpOnly, mutations require the configured origin, password hashes use scrypt, and account writes enforce session identity and optimistic revisions. Local browser backup happens immediately; network uploads coalesce to at most once per four seconds during ordinary play. Requests are capped at 128 KB. No recovery or verification email is sent.

Production account storage uses Neon Postgres through the project's `DATABASE_URL`. SQLite remains limited to local previews and explicitly configured persistent hosts. Cloud tables use a `drifter_` prefix. Account creation uses a transaction, rate limits increment atomically, and saving uses an atomic revision compare-and-swap so simultaneous browser sessions cannot overwrite each other's discoveries. No database credentials are delivered to the browser. Initialization is retried after a connection failure.

## Validation

`node --test --test-isolation=none tests/drifter-expedition.test.mjs tests/roland-accounts.test.mjs` covers the full 35-world campaign in the actual physics engine, reachable gear and parts, timed barriers, checkpoint migration/merges, no-heal equipment swaps, mobile targets, descent, tiny caches, account isolation and autosave throttling.

`scripts/check-drifter-journey.cjs` plays nine representative five-stage worlds using real browser clicks and keyboard input, with no writes to game state. It checks rare equipment, all six ship parts, the home ending and save restoration. `scripts/check-drifter.cjs` checks desktop and phone presentation and tap controls. `scripts/check-drifter-account.cjs` uses synthetic addresses and checks signup, explicit guest import, account isolation, cross-browser login, reload and logout. `DRIFTER_TEST_ORIGIN` selects a test origin; when `DATABASE_URL` is supplied, its temporary accounts are removed afterward. No emails are sent.

`tests/drifter-cloud.test.mjs` runs against Neon when `DATABASE_URL` is supplied and otherwise skips. It checks concurrent registration, atomic save conflicts, merge retries, session revocation and persistence across independent service instances, then removes its own test account.

Art sources, prompts, transparency checks and crop manifests are retained locally in `output/drifter-art` and `output/drifter-worlds`. Runtime art is compressed in `public/roland-home/assets`. The twelve new planet cards intentionally have dark opaque backgrounds; suits and gameplay sprites have verified alpha.

The later facing/proportion correction replaces all six suit sprites with right-facing artwork, larger helmets and compact bodies. The complete figure preserves source aspect ratio and flips around its feet when travelling left. Source atlas, prompts and alpha crop measurements are retained in `output/drifter-correction`; see `docs/drifter-art-correction.md` for the selected prompt and the visual estimate of proportions. `scripts/prepare-drifter-correction.cjs` exports the six runtime WebP assets.

`tests/drifter-combat.test.mjs` checks visible-only automatic fire, the slower cadence, lens origin, target priority without cancelling travel, independent companion motion, single-target projectile consumption, facing transforms, and short landscape phone bounds. `scripts/check-drifter-combat.cjs` verifies these controls in actual desktop and portrait/landscape phone browsers.

`tests/drifter-gravity.test.mjs` checks complete launch/landing cycles, relative height and airtime, boost and spring effects, no hover support, repair collection/pause/expiry, movement exceptions, raised pickups and frame-rate consistency. The full expedition tests also cover pickup placement around platform edges. `scripts/check-drifter-gear.cjs` checks easy gear access, pause/resume, equipment swaps and phone control layouts in a real browser. `scripts/check-drifter-bounce.cjs` checks a real phone bounce, repair pickup/countdown, gravity-world jumping, swimming and all three flyable ships turning both ways.
