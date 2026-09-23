import { createGameService } from '../../../../lib/roland-account.mjs';
import { clientAddress } from '../../../../lib/client-address.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let service: ReturnType<typeof createGameService> | undefined;

function getService() {
  service ??= createGameService({
    databasePath: process.env.ROLAND_DATABASE_PATH,
    databaseUrl: process.env.DATABASE_URL,
    databaseDriver: process.env.DATABASE_DRIVER,
    adminEmail: process.env.DRIFTER_ADMIN_EMAIL,
    bootstrapToken: process.env.DRIFTER_ADMIN_BOOTSTRAP_TOKEN,
    origin: process.env.ROLAND_GAME_ORIGIN || 'https://www.rocketjump.co.za',
    origins: ['https://rocketjump.co.za', 'https://rocket-jump-nu.vercel.app',
      ...(process.env.VERCEL_URL ? ['https://' + process.env.VERCEL_URL] : [])],
  }).catch(error => { service = undefined; throw error; });
  return service;
}

async function handle(request: Request) {
  // Even owner insight GETs update rate-limit rows, so pause this entire API
  // during the final source snapshot rather than allowing hidden writes.
  if (process.env.MIGRATION_READ_ONLY === '1') {
    return Response.json({ error: 'RocketJump is briefly read-only while account data moves. Please try again shortly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '300' } });
  }
  const address = clientAddress(request.headers, {
    vercel: process.env.VERCEL === '1',
    coolifyProxy: process.env.TRUST_COOLIFY_PROXY === '1',
  });
  try {
    return await (await getService()).handle(request, { clientAddress: address });
  } catch {
    return Response.json({ error: 'Account saves are temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
