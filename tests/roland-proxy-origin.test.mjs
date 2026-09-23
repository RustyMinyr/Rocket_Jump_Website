import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { unlink } from 'node:fs/promises';
import { requestWithTrustedOrigin } from '../lib/roland-proxy-origin.mjs';
import { createGameService } from '../lib/roland-account.mjs';

const origin = 'https://www.rocketjump.co.za';
const internal = 'http://0.0.0.0:3000';
const forwarded = {
  Host: 'www.rocketjump.co.za',
  'X-Forwarded-Host': 'www.rocketjump.co.za',
  'X-Forwarded-Proto': 'https',
};

test('trusted Coolify headers restore the configured origin and preserve the route', () => {
  const request = new Request(internal + '/api/roland/admin-insights?days=7', { headers: forwarded });
  assert.equal(requestWithTrustedOrigin(request, { trustedProxy: false, origin }), request);
  const restored = requestWithTrustedOrigin(request, { trustedProxy: true, origin });
  assert.equal(restored.url, origin + '/api/roland/admin-insights?days=7');
  assert.equal(restored.method, 'GET');
  assert.equal(restored.headers.get('host'), forwarded.Host);
  assert.equal(request.url, internal + '/api/roland/admin-insights?days=7');
});

test('trusted proxy rejects missing, conflicting or multi-valued forwarding headers', () => {
  for (const headers of [
    { 'X-Forwarded-Proto': 'https' },
    { 'X-Forwarded-Host': 'www.rocketjump.co.za' },
    { ...forwarded, 'X-Forwarded-Host': 'evil.invalid' },
    { ...forwarded, 'X-Forwarded-Host': 'www.rocketjump.co.za, evil.invalid' },
    { ...forwarded, 'X-Forwarded-Host': 'www.rocketjump.co.za:443' },
    { ...forwarded, 'X-Forwarded-Proto': 'http' },
    { ...forwarded, 'X-Forwarded-Proto': 'https,http' },
  ]) {
    const request = new Request(internal + '/api/roland/status', { headers });
    assert.equal(requestWithTrustedOrigin(request, { trustedProxy: true, origin }), null);
  }
});

test('streamed registration body reaches the service with strict CSRF and a Secure cookie', async () => {
  const file = resolve('.data', `proxy-origin-${randomUUID()}.sqlite`);
  const service = await createGameService({ databasePath: file, origin, local: true });
  const payload = JSON.stringify({ email: `proxy-${randomUUID()}@example.invalid`, password: 'A private test password 42!' });
  const body = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode(payload)); controller.close(); },
  });
  try {
    const request = new Request(internal + '/api/roland/register', {
      method: 'POST',
      headers: { ...forwarded, Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' },
      body,
      duplex: 'half',
    });
    const restored = requestWithTrustedOrigin(request, { trustedProxy: true, origin });
    assert.equal(restored.url, origin + '/api/roland/register');
    const response = await service.handle(restored);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie'), /(?:^|;)\s*Secure(?:;|$)/);
    assert.equal((await response.json()).user.email, JSON.parse(payload).email);

    const forged = new Request(internal + '/api/roland/register', {
      method: 'POST',
      headers: { ...forwarded, Origin: 'https://evil.invalid', 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' },
      body: payload,
    });
    assert.equal((await service.handle(requestWithTrustedOrigin(forged, { trustedProxy: true, origin }))).status, 403);
  } finally {
    await service.close();
    for (const suffix of ['', '-wal', '-shm']) try { await unlink(file + suffix); } catch {}
  }
});
