# Drifter launch analytics and leaderboard

The game has an opt-in public explorer leaderboard under the entry screen, star map and Journey menu. Signed-in players choose a public callsign. Rankings use planets explored then XP from normalized account saves. Emails are never returned publicly. Players can leave without losing their save. This is a friendly exploration board; client-originated saves are not cheat-proof tournament scoring.

## Owner dashboard

`/admin` is a new protected owner dashboard. The existing `/client-portal` remains a sample preview. Set `DRIFTER_ADMIN_EMAIL` to the confirmed owner email and `DRIFTER_ADMIN_BOOTSTRAP_TOKEN` to a cryptographically random private token in the production environment. Sign into the matching game account, enter the token once, then remove the bootstrap token from the environment. A persistent database role protects the dashboard. Registration alone never grants admin access. Never put the token in source, a URL or public client configuration.

Owner activation is pending confirmation of the owner's email. Production remains closed to all accounts until configured and claimed.

The dashboard reports playing now, unique browsers in the last 24 hours / 7 days / 30 days, most-played stages, planet starts/completions/deaths/exits, daily trends, active minutes, optional ratings and reported runtime errors. Insight cards distinguish observed behaviour from explicit player opinions, and require minimum samples for friction and satisfaction conclusions.

## Measurement limits

- Counts represent opted-in browsers, not verified people. Multiple devices can count twice.
- Live counts use foreground heartbeats within 60 seconds. Gear, pause, menu and hidden screens are excluded.
- Tracking begins at release; previous activity cannot be backfilled.
- Durations are capped between heartbeats and grouped hourly. Boundary hours can include time just outside the requested window.
- An unfinished attempt with no heartbeat for two minutes is inferred as an exit; connection failures can look like departures.
- Ratings are optional choices, not free text; one current rating per browser and planet.
- Raw activity and feedback expire after 35 days through daily cleanup triggered by new play sessions.
- No third-party analytics is used. Browser Do Not Track / Global Privacy Control disables collection initially; controls are on the entry screen and leaderboard.
- No error reports does not mean bug-free. Ad blockers, offline devices and opted-out play are unobserved.

## Verification

Run `npm run test:game` for gameplay, auth, storage, owner authorization, ratings and leaderboard tests. `scripts/check-drifter-all-planets.cjs` plays all safe worlds, collects parts/signals/gear, checks five stages, exercises both intentional traps and verifies reload persistence. Set `DRIFTER_QA_PHONE=1` for touch checks or `DRIFTER_QA_PLANET=ice` for focused regression. Analytics is disabled for these automated journeys.

The browser harness uses the bundled Playwright runtime and Chrome. `scripts/check-drifter-admin.cjs` expects an isolated local Next preview at localhost:4180, test SQLite storage and the test-only owner configuration visible in the script. On a fresh test database use `DRIFTER_QA_SETUP=1`; subsequent runs sign in. Never point this synthetic-data test at production.
