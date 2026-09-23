import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const tables = [
  ['drifter_players', 'id COLLATE "C"'],
  ['drifter_sessions', 'token COLLATE "C"'],
  ['drifter_saves', 'player_id COLLATE "C"'],
  ['drifter_limits', 'key COLLATE "C"'],
  ['drifter_visits', 'id COLLATE "C"'],
  ['drifter_activity', 'visitor COLLATE "C", bucket'],
  ['drifter_events', 'id COLLATE "C"'],
  ['drifter_attempts', 'id COLLATE "C"'],
  ['drifter_feedback', 'visitor COLLATE "C", planet COLLATE "C"'],
  ['drifter_profiles', 'player_id COLLATE "C"'],
  ['drifter_admins', 'player_id COLLATE "C"'],
  ['drifter_settings', 'key COLLATE "C"'],
];

function endpoint(connectionString) {
  try {
    const url = new URL(connectionString);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) return null;
    // pg-connection-string lets query parameters override the URL host and port.
    if (url.searchParams.has('host') || url.searchParams.has('port')) return null;
    return `${url.hostname.toLowerCase()}\0${url.port || '5432'}\0${decodeURI(url.pathname.slice(1))}`;
  } catch {
    return null;
  }
}

export async function inspect(client, table, order) {
  const digest = createHash('sha256');
  let count = 0;
  for (;;) {
    const { rows } = await client.query(`SELECT * FROM ${table} ORDER BY ${order} LIMIT 500 OFFSET $1`, [count]);
    if (!rows.length) break;
    for (const row of rows) {
      digest.update(JSON.stringify(Object.keys(row).sort().map(key => [key, row[key]])));
      digest.update('\n');
    }
    count += rows.length;
  }
  return { count, sha256: digest.digest('hex') };
}

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL;
  const sourceEndpoint = sourceUrl && endpoint(sourceUrl);
  const targetEndpoint = targetUrl && endpoint(targetUrl);
  if (!sourceEndpoint || !targetEndpoint || sourceEndpoint === targetEndpoint) {
    console.error('Set distinct SOURCE_DATABASE_URL and TARGET_DATABASE_URL in the private environment.');
    process.exitCode = 2;
    return;
  }
  let source;
  let target;
  let exitCode = 0;
  try {
    source = new pg.Client({ connectionString: sourceUrl });
    target = new pg.Client({ connectionString: targetUrl });
    await source.connect();
    await target.connect();
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
    await Promise.allSettled([source, target].filter(Boolean).map(client => client.end()));
  }
  process.exitCode = exitCode;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
