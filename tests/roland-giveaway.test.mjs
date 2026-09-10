import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../app/api/website-giveaway/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const request = (data) => new Request('http://localhost/api/website-giveaway', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'http://localhost' }, body: JSON.stringify(data) });
test('giveaway validates entries and handles provider success and failure without sending email', async () => {
  const originalNow = Date.now;
  Date.now = () => Date.parse('2026-09-10T12:00:00+02:00');
  assert.equal((await POST(request({}))).status, 400);
  assert.equal((await POST(request({ 'company-url': 'spam' }))).status, 202);
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 'test-only';
  const entry = { name: 'Test Person', email: 'test@example.com', websiteType: 'Business', description: 'A website for my small business.' };
  try {
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.to, ['hello@rocketjump.co.za']);
      assert.equal(payload.reply_to, entry.email);
      assert.ok(payload.text.includes(entry.description));
      return Response.json({ id: 'mock' });
    };
    assert.equal((await POST(request(entry))).status, 201);
    globalThis.fetch = async () => new Response('', { status: 500 });
    assert.equal((await POST(request(entry))).status, 502);
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal((await POST(request(entry))).status, 502);
  } finally {
    Date.now = originalNow;
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});

test('giveaway closes at midnight after 29 September in South Africa', async () => {
  const originalNow = Date.now;
  try {
    Date.now = () => Date.parse('2026-09-29T23:59:59+02:00');
    assert.equal((await POST(request({}))).status, 400);
    Date.now = () => Date.parse('2026-09-30T00:00:00+02:00');
    const response = await POST(request({}));
    assert.equal(response.status, 410);
    assert.match((await response.json()).message, /Entries closed/);
  } finally {
    Date.now = originalNow;
  }
});
