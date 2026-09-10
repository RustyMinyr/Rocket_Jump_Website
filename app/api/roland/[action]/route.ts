// Shared with the local game preview; never trust hosting-injected user headers.
import { createGameService } from '../../../../lib/roland-account.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const service = createGameService({
  databasePath: process.env.ROLAND_DATABASE_PATH,
  origin: process.env.ROLAND_GAME_ORIGIN,
});

async function handle(request: Request) {
  return (await service).handle(request, { clientAddress: 'public-server' });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
