import { createHash } from "node:crypto";

export const runtime = "nodejs";
const respond = (ok: boolean, status: number, message?: string) => Response.json({ ok, message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (process.env.MIGRATION_READ_ONLY === "1") return respond(false, 503, "Entries are briefly paused while RocketJump moves. Please try again shortly.");
  // Entries close at the end of 29 September in South Africa (UTC+02:00).
  if (Date.now() >= Date.parse("2026-09-30T00:00:00+02:00")) return respond(false, 410, "Entries closed on 29 September 2026. The winner is announced on 30 September 2026.");
  if (!request.headers.get("content-type")?.includes("application/json")) return respond(false, 415, "Invalid request.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond(false, 403, "Invalid request origin.");
  if (Number(request.headers.get("content-length")) > 16000) return respond(false, 413, "Your entry is too long.");
  let data: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16000) return respond(false, 413, "Your entry is too long.");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return respond(false, 400, "Invalid entry.");
    data = parsed as Record<string, unknown>;
  } catch { return respond(false, 400, "Invalid entry."); }
  if (data["company-url"]) return respond(true, 202);
  const text = (key: string, max: number) => typeof data[key] === "string" && data[key].trim().length <= max ? data[key].trim() : "";
  const name = text("name", 100), email = text("email", 254), websiteType = text("websiteType", 20), description = text("description", 5000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["Personal", "Business"].includes(websiteType) || description.length < 10) return respond(false, 400, "Please complete all fields and describe your dream website in at least 10 characters.");
  if (!process.env.RESEND_API_KEY) return respond(false, 503, "We couldn’t send your entry right now. Please try again shortly.");
  const body = `New Find Roland website application\n\nName: ${name}\nEmail: ${email}\nWebsite: ${websiteType}\n\nDream website:\n${description}`;
  const id = createHash("sha256").update(body).digest("hex");
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `roland-${id}` },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Rooiko <contact@rooiko.com>", to: ["hello@rocketjump.co.za"], reply_to: email, subject: "Find Roland — website application", text: body }),
    });
    if (!result.ok) return respond(false, 502, "We couldn’t send your entry. Please try again shortly.");
    return respond(true, 201);
  } catch { return respond(false, 502, "We couldn’t send your entry. Please try again shortly."); }
}
