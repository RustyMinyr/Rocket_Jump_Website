import pg from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.DATABASE_DRIVER !== "pg") {
    return Response.json({ status: "ready" }, { headers: { "Cache-Control": "no-store" } });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000, query_timeout: 2000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return Response.json({ status: "ready" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  } finally {
    await client.end().catch(() => {});
  }
}
