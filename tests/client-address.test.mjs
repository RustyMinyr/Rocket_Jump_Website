import test from 'node:test';
import assert from 'node:assert/strict';
import { clientAddress } from '../lib/client-address.mjs';

test('Coolify uses the proxy client address, not a spoofed first hop', () => {
  const headers = new Headers({ 'x-forwarded-for': '198.51.100.1, 203.0.113.8', 'x-real-ip': '203.0.113.8' });
  assert.equal(clientAddress(headers, { coolifyProxy: true }), '203.0.113.8');
  assert.equal(clientAddress(headers), 'unknown-client');
  headers.delete('x-real-ip');
  assert.equal(clientAddress(headers, { coolifyProxy: true }), '203.0.113.8');
});

test('Vercel retains its trusted forwarded address', () => {
  const headers = new Headers({ 'x-vercel-forwarded-for': '203.0.113.9, 10.0.0.1' });
  assert.equal(clientAddress(headers, { vercel: true }), '203.0.113.9');
});
