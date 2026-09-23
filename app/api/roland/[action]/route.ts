import { createGameService } from '../../../../lib/roland-account.mjs';
import { clientAddress } from '../../../../lib/client-address.mjs';
import { requestWithTrustedOrigin } from '../../../../lib/roland-proxy-origin.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let service: ReturnType<typeof createGameService> | undefined;
const gameOrigin = () => process.env.ROLAND_GAME_ORIGIN || 'https://www.rocketjump.co.za';

function getService() {
  service ??= createGameService({
    databasePath: process.env.ROLAND_DATABASE_PATH,
    databaseUrl: process.env.DATABASE_URL,
    databaseDriver: process.env.DATABASE_DRIVER,
    adminEmail: process.env.DRIFTER_ADMIN_EMAIL,
    bootstrapToken: process.env.DRIFTER_ADMIN_BOOTSTRAP_TOKEN,
    origin: gameOrigin(),
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
    const serviceRequest = requestWithTrustedOrigin(request, {
      trustedProxy: process.env.TRUST_COOLIFY_PROXY === '1',
      origin: gameOrigin(),
    });
    if (!serviceRequest) return Response.json({ error: 'Unrecognized server address.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } });
    return await (await getService()).handle(serviceRequest, { clientAddress: address });
  } catch {
    return Response.json({ error: 'Account saves are temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
