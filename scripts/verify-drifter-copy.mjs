import { createHash } from 'node:crypto';
import pg from 'pg';

const tables = [
  ['drifter_players', 'id'],
  ['drifter_sessions', 'token'],
  ['drifter_saves', 'player_id'],
  ['drifter_limits', 'key'],
  ['drifter_visits', 'id'],
  ['drifter_activity', 'visitor, bucket'],
  ['drifter_events', 'id'],
  ['drifter_attempts', 'id'],
  ['drifter_feedback', 'visitor, planet'],
  ['drifter_profiles', 'player_id'],
  ['drifter_admins', 'player_id'],
  ['drifter_settings', 'key'],
];

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;
if (!sourceUrl || !targetUrl || sourceUrl === targetUrl) {
  console.error('Set distinct SOURCE_DATABASE_URL and TARGET_DATABASE_URL in the private environment.');
  process.exit(2);
}

async function inspect(client, table, order) {
  const digest = createHash('sha256');
  let count = 0;
  for (;;) {
    const { rows } = await client.query(`SELECT * FROM ${table} ORDER BY ${order} LIMIT 500 OFFSET $1`, [count]);
    if (!rows.length) break;
    for (const row of rows) {
      digest.update(JSON.stringify(row));
      digest.update('\n');
    }
    count += rows.length;
  }
  return { count, sha256: digest.digest('hex') };
}

const source = new pg.Client({ connectionString: sourceUrl });
const target = new pg.Client({ connectionString: targetUrl });
let exitCode = 0;
try {
  await Promise.all([source.connect(), target.connect()]);
  await Promise.all([
    source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'),
    target.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'),
  ]);
  for (const [table, order] of tables) {
    const [from, to] = await Promise.all([inspect(source, table, order), inspect(target, table, order)]);
    const equal = from.count === to.count && from.sha256 === to.sha256;
    console.log(`${table}: ${equal ? 'MATCH' : 'MISMATCH'}; source=${from.count}, target=${to.count}`);
    if (!equal) exitCode = 1;
  }
  await Promise.all([source.query('ROLLBACK'), target.query('ROLLBACK')]);
} catch (error) {
  console.error(`Copy verification failed: ${error.code || error.name || 'error'}`);
  exitCode = 1;
} finally {
  await Promise.allSettled([source.end(), target.end()]);
}
process.exitCode = exitCode;
