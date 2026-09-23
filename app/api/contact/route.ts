import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12_000;
const services = new Set([
  "Launch Website",
  "Business Website",
  "Custom Website",
  "eCommerce",
  "Brand Identity",
  "Social Media",
  "Website Hosting",
  "Website Maintenance",
  "Other",
]);
const budgets = new Set(["Under R5,000", "R5,000–R10,000", "R10,000–R25,000", "R25,000–R50,000", "R50,000+", "Not sure yet"]);

const responseHeaders = { "Cache-Control": "no-store" };

function json(body: { ok: boolean; message?: string }, status: number) {
  return NextResponse.json(body, { status, headers: responseHeaders });
}

function readRequiredText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function readOptionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] ?? character);
}

function emailValue(value: string) {
  return escapeHtml(value || "Not provided").replace(/\n/g, "<br />");
}

function subjectValue(value: string) {
  return value.replace(/[\r\n]+/g, " ");
}

export async function POST(request: Request) {
  if (process.env.MIGRATION_READ_ONLY === "1") return json({ ok: false, message: "Enquiries are briefly paused while RocketJump moves. Please try again shortly." }, 503);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json({ ok: false, message: "Invalid request." }, 413);

  if (!request.headers.get("content-type")?.includes("application/json")) return json({ ok: false, message: "Invalid request." }, 415);

  let payload: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ ok: false, message: "Your enquiry is too long." }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  if (!isObject(payload)) return json({ ok: false, message: "Invalid request." }, 400);

  const honeypot = readOptionalText(payload["website-field"], 200);
  if (honeypot === null) return json({ ok: false, message: "Invalid request." }, 400);
  if (honeypot) return json({ ok: true }, 202);

  const fullName = readRequiredText(payload.fullName, 100);
  const businessName = readOptionalText(payload.businessName, 160);
  const phone = readRequiredText(payload.phone, 50);
  const email = readRequiredText(payload.email, 320);
  const currentSite = readOptionalText(payload.currentSite, 500);
  const service = readRequiredText(payload.service, 120);
  const budget = readRequiredText(payload.budget, 80);
  const description = readRequiredText(payload.description, 5_000);

  if (!fullName || businessName === null || !phone || !email || currentSite === null || !service || !budget || !description || !isEmail(email) || !services.has(service) || !budgets.has(budget)) {
    return json({ ok: false, message: "Please check the required fields and try again." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form delivery is not configured.");
    return json({ ok: false, message: "We couldn’t send your enquiry right now. Please try again shortly." }, 503);
  }

  const fields = [
    ["Name", fullName],
    ["Business name", businessName],
    ["Phone", phone],
    ["Email", email],
    ["Current site", currentSite],
    ["Service required", service],
    ["Estimated budget", budget],
    ["Project details", description],
  ] as const;
  const text = ["New RocketJump enquiry", "", ...fields.map(([label, value]) => `${label}: ${value || "Not provided"}`)].join("\n");
  const htmlRows = fields.map(([label, value]) => `<tr><td style="padding:11px 16px;border-bottom:1px solid #ededf0;color:#7a7781;font-size:12px;font-weight:700;vertical-align:top;width:34%;">${label}</td><td style="padding:11px 16px;border-bottom:1px solid #ededf0;color:#17151b;font-size:14px;line-height:1.55;">${emailValue(value)}</td></tr>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f3f6;font-family:Arial,sans-serif;color:#17151b;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f4f3f6;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #dedde2;"><tr><td style="padding:28px 32px;background:#110915;color:#ffffff;"><p style="margin:0 0 8px;color:#ff2da1;font-size:11px;font-weight:700;letter-spacing:1.2px;">ROCKETJUMP</p><h1 style="margin:0;font-size:28px;line-height:1.2;">New project enquiry</h1></td></tr><tr><td style="padding:16px 16px 28px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${htmlRows}</table></td></tr></table></td></tr></table></body></html>`;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Rooiko <contact@rooiko.com>",
        to: [process.env.CONTACT_TO_EMAIL || "hello@rocketjump.co.za"],
        reply_to: email,
        subject: `New RocketJump enquiry — ${subjectValue(fullName)}`,
        text,
        html,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Contact form delivery failed.", resendResponse.status);
      return json({ ok: false, message: "We couldn’t send your enquiry right now. Please try again shortly." }, 502);
    }
  } catch {
    console.error("Contact form delivery request failed.");
    return json({ ok: false, message: "We couldn’t send your enquiry right now. Please try again shortly." }, 502);
  }

  return json({ ok: true }, 201);
}
