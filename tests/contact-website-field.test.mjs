import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const route = readFileSync(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8')
  .replace('"next/server"', JSON.stringify(pathToFileURL(require.resolve('next/server')).href));
const source = ts.transpileModule(route, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const request = (data) => new Request('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

test('current website accepts optional free text without an https prefix', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 'test-only';
  const entry = { fullName: 'Test Person', phone: 'Test only', email: 'test@example.com', service: 'Other', budget: 'Not sure yet', description: 'A small business website.' };
  try {
    for (const currentSite of ['', 'mybusiness.co.za', 'www.mybusiness.co.za', 'https://mybusiness.co.za', 'http://mybusiness.co.za/shop?ref=hello', 'mybusiness.co.za/contact', 'No website yet']) {
      let called = false;
      globalThis.fetch = async (_url, options) => {
        called = true;
        const payload = JSON.parse(options.body);
        assert.ok(payload.text.includes(`Current site: ${currentSite || 'Not provided'}`));
        return Response.json({ id: 'mock-only' });
      };
      assert.equal((await POST(request({ ...entry, currentSite }))).status, 201, currentSite);
      assert.equal(called, true);
    }
    globalThis.fetch = async () => { throw new Error('Invalid input must not reach email delivery'); };
    assert.equal((await POST(request({ ...entry, currentSite: 'x'.repeat(501) }))).status, 400);
    assert.equal((await POST(request({ ...entry, email: 'invalid', currentSite: 'example.co.za' }))).status, 400);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});
