# RocketJump: Vercel to nimda Coolify

This document records this site's migration. The supplied `WEBSITE-MIGRATION-PROMPT.md` was a general checklist; the inventory and choices below come from this repository and the live RocketJump project.

## Verified source inventory (23 September 2026)

- Vercel project: `rooiko/rocket-jump`, connected to `RustyMinyr/Rocket_Jump_Website`. Production serves `www.rocketjump.co.za`; the apex redirects there.
- Live data: one Neon PostgreSQL database, `drifter-accounts`, with 12 `drifter_*` tables. It contains player accounts and password hashes, sessions, saves, rate limits, visits, activity, events, attempts, feedback, leaderboard profiles, administrator assignments and settings. PostgreSQL is required to preserve these records and concurrent writes.
- Auth: application-owned scrypt password hashes and hashed session tokens in PostgreSQL. No external auth provider. Same-host session cookies can continue after cutover if the rows and cookie settings survive.
- Files: published images, game files and fonts are repository assets. No upload endpoint or Vercel Blob store was found. There is no separate live upload store to copy.
- Functions: Next.js routes handle game accounts/insights, contact mail, giveaway mail and health. `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL` and `DRIFTER_ADMIN_EMAIL` are production settings. The owner bootstrap token is intentionally absent after activation. No Vercel Cron Jobs or deployment hooks were found; game telemetry cleanup is request-triggered.
- DNS before cutover: apex A `216.150.1.1` (TTL 600), `www` CNAME `3a149def511b239e.vercel-dns-016.com` (TTL 3600). Zoho MX, SPF, DKIM and verification records are unrelated and must remain unchanged. Candidate nimda public IP `41.222.37.16` still needs direct server verification at cutover.

## Destination and isolation

- Coolify project `RocketJump` (`pz4ogfy88q8uxoeomrxylkfa`) has separate `staging` and `production` environments. Each needs its own application and PostgreSQL resource, distinct credentials and persistent PostgreSQL volume. The app container itself needs no writable file volume because this site has no uploads.
- Build from this GitHub repository's Dockerfile. GitHub Actions checks TypeScript, application lint, account/game tests and the production image before promotion. Keep preview and production credentials separate. The existing Vercel deployment remains available for rollback until live checks pass.
- Runtime environment on Coolify: `DATABASE_DRIVER=pg`, the site's own internal `DATABASE_URL`, `ROLAND_GAME_ORIGIN` matching the requested host, `TRUST_COOLIFY_PROXY=1`, mail settings only on production, and `DRIFTER_ADMIN_EMAIL`. Do not set the one-time owner bootstrap token on the migrated site. Never publish database ports or store secrets in Git.
- Staging must use synthetic records and separate credentials. Protect it with Coolify HTTP Basic Authentication and disable indexing. Do not send test mail to real users.

## Gates before DNS

1. Confirm GitHub CI and Coolify build use the exact reviewed commit. Privately test the complete staging site behind Basic Authentication with synthetic accounts: register, sign in, sign out, save/reload, admin authorization, leaderboard, gameplay telemetry and form validation. Confirm the stage app cannot reach another site's database or storage.
2. Obtain authorized access to the live Neon database. Record PostgreSQL version, extensions, schema, table row counts and a pre-copy backup. Export with a compatible `pg_dump` custom archive over an encrypted connection. Keep the archive private. Restore to this site's production PostgreSQL instance using `pg_restore`, preserving ownership/privileges as appropriate. Verify all 12 table row counts and canonical SHA-256 digests with `scripts/verify-drifter-copy.mjs` and confirm application logins and saves on a private production preview. Use a known owner account for admin verification; do not print personal records in logs.
3. Configure an encrypted RocketJump backup repository and scheduled dump of its production database. Verify the backup is restorable into an isolated temporary database and compare row counts and digests. Confirm retention and failure alerts. A file existing or a timer running alone is insufficient evidence.
4. Confirm Resend production key, sender/domain identity and destination mailbox in Coolify. Send one agreed test message and verify provider acceptance plus inbox receipt. Check public assets and all key routes. Confirm no uploads or scheduled jobs were missed.
5. Freeze Vercel writes by deploying the reviewed code with `MIGRATION_READ_ONLY=1`. This returns 503 for game API requests and form POSTs during the copy; even owner insight GETs can write rate-limit rows, so game GETs are paused too. Verify the freeze at the public Vercel alias. Take the **final** Neon archive, restore it to the clean target and repeat counts and digests. Keep the frozen source and its archive for rollback.
6. Only after every earlier gate passes, inventory the current records in domains.co.za and change the RocketJump website apex A and `www` record to the tested Coolify route. Preserve all unrelated records, especially MX, SPF, DKIM and Zoho verification. Do not change DNS based only on this document's earlier snapshot.
7. From independent resolvers and browsers, verify apex redirect, `www`, trusted HTTPS certificate, page/assets, account sessions, save/reload, admin access, mail and logs. Keep Vercel and Neon available until propagation and live checks pass. If a gate fails, restore website DNS to the recorded source values and resume Vercel writes only after confirming which database is authoritative.

## Current hold

Live Neon row counts/export and its encrypted restore have **not** been obtained. Vercel's Neon data editor requires account reauthentication; the owner has indicated they can unlock domains.co.za only. Do not interpret a green staging build or empty-database test as permission to cut over DNS.
