import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const INFOBIP_KEY  = Deno.env.get("INFOBIP_API_KEY") ?? "";
const INFOBIP_BASE = Deno.env.get("INFOBIP_BASE_URL") ?? "";
const HOOK_SECRET  = Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "";
const SENDER_NAME  = "LitoralPalma";

interface SmsData {
  otp: string;
}

interface HookUser {
  id: string;
  phone: string;
}

// ─── HMAC validation ─────────────────────────────────────────────────────────

async function verifyHookSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!HOOK_SECRET) return true; // dev: sem secret configurado, permite tudo
  const sig = req.headers.get("x-supabase-signature") ?? "";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(HOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return sig === expectedHex;
}

// ─── SMS body ────────────────────────────────────────────────────────────────

function buildSmsBody(otp: string): string {
  return `🌊 Litoral na Palma\n\nSeu código de acesso: ${otp}\n\nVálido por 10 minutos. Não compartilhe este código com ninguém.`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const rawBody = await req.text();

  if (!(await verifyHookSignature(req, rawBody))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let payload: { user: HookUser; sms_data: SmsData };
  try {
    payload = JSON.parse(rawBody) as { user: HookUser; sms_data: SmsData };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { user, sms_data } = payload;

  if (!INFOBIP_KEY || !INFOBIP_BASE) {
    console.error("Infobip credentials not configured");
    return new Response(JSON.stringify({ error: "SMS provider not configured" }), { status: 500 });
  }

  const infobipRes = await fetch(`https://${INFOBIP_BASE}/sms/2/text/advanced`, {
    method: "POST",
    headers: {
      Authorization: `App ${INFOBIP_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      messages: [{
        from: SENDER_NAME,
        destinations: [{ to: user.phone }],
        text: buildSmsBody(sms_data.otp),
      }],
    }),
  });

  if (!infobipRes.ok) {
    const err = await infobipRes.text();
    console.error("Infobip error:", err);
    return new Response(JSON.stringify({ error: "Failed to send SMS" }), { status: 500 });
  }

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
