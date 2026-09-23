import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { inspect } from '../scripts/verify-drifter-copy.mjs';

test('copy digest ignores column order and detects changes across pages', async () => {
  const rows = Array.from({ length: 501 }, (_, index) => ({
    id: `player-${String(index).padStart(3, '0')}`,
    body: index === 500 ? 'last page' : `save ${index}`,
    revision: index,
  }));
  const source = {
    async query(sql, [offset]) {
      assert.match(sql, /^SELECT \* FROM drifter_saves ORDER BY player_id COLLATE "C" LIMIT 500 OFFSET \$1$/);
      return { rows: rows.slice(offset, offset + 500) };
    },
  };
  const targetRows = rows.map(({ id, body, revision }) => ({ revision, body, id }));
  const target = {
    async query(_sql, [offset]) {
      return { rows: targetRows.slice(offset, offset + 500) };
    },
  };

  const from = await inspect(source, 'drifter_saves', 'player_id COLLATE "C"');
  assert.deepEqual(await inspect(target, 'drifter_saves', 'player_id COLLATE "C"'), from);
  assert.equal(from.count, 501);

  targetRows[500].body = 'changed last page';
  assert.notEqual((await inspect(target, 'drifter_saves', 'player_id COLLATE "C"')).sha256, from.sha256);
});

test('copy verifier rejects the same endpoint with different URL text', () => {
  const childEnv = Object.fromEntries(
    ['SystemRoot', 'WINDIR', 'Path', 'PATH', 'TEMP', 'TMP']
      .filter(key => process.env[key] !== undefined)
      .map(key => [key, process.env[key]]),
  );
  for (const targetUrl of [
    'postgres://target:dummy-two@LOCALHOST/rocketjump?sslmode=require',
    'postgres://target:dummy-two@different.invalid/rocketjump?host=localhost',
  ]) {
    const result = spawnSync(process.execPath, ['scripts/verify-drifter-copy.mjs'], {
      encoding: 'utf8',
      env: {
        ...childEnv,
        SOURCE_DATABASE_URL: 'postgresql://source:dummy-one@localhost:5432/rocketjump',
        TARGET_DATABASE_URL: targetUrl,
      },
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Set distinct SOURCE_DATABASE_URL and TARGET_DATABASE_URL/);
    assert.doesNotMatch(result.stderr, /dummy-one|dummy-two/);
  }
});
