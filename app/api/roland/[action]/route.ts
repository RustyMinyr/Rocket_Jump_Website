import { isIP } from 'node:net';
import { createGameService } from '../../../../lib/roland-account.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let service: ReturnType<typeof createGameService> | undefined;

function getService() {
  service ??= createGameService({
    databasePath: process.env.ROLAND_DATABASE_PATH,
    databaseUrl: process.env.DATABASE_URL,
    origin: process.env.ROLAND_GAME_ORIGIN || 'https://www.rocketjump.co.za',
    origins: ['https://rocketjump.co.za', 'https://rocket-jump-nu.vercel.app',
      ...(process.env.VERCEL_URL ? ['https://' + process.env.VERCEL_URL] : [])],
  }).catch(error => { service = undefined; throw error; });
  return service;
}

async function handle(request: Request) {
  // Vercel overwrites these ingress headers. Never trust them outside Vercel.
  const forwarded = process.env.VERCEL === '1'
    ? (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || '')
    : '';
  const candidate = forwarded.split(',')[0].trim();
  const clientAddress = isIP(candidate) ? candidate : 'unknown-client';
  try {
    return await (await getService()).handle(request, { clientAddress });
  } catch {
    return Response.json({ error: 'Account saves are temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
