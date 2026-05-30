import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TWILIO_SID   = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_FROM  = Deno.env.get("TWILIO_PHONE_FROM") ?? "";
const HOOK_SECRET  = Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "";

interface SmsData {
  otp: string;
}

interface HookUser {
  id: string;
  phone: string;
}

// ─── Template de SMS ─────────────────────────────────────────────────────────
// SMS é texto simples — conciso, com branding e instrução de segurança.

function buildSmsBody(otp: string): string {
  return `🌊 Litoral na Palma\n\nSeu código de acesso: ${otp}\n\nVálido por 10 minutos. Não compartilhe este código com ninguém.`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Valida segredo do hook
  if (HOOK_SECRET) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${HOOK_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  let payload: { user: HookUser; sms_data: SmsData };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { user, sms_data } = payload;

  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.error("Twilio credentials not configured");
    return new Response(JSON.stringify({ error: "SMS provider not configured" }), { status: 500 });
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

  const twilioRes = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: TWILIO_FROM,
      To:   user.phone,
      Body: buildSmsBody(sms_data.otp),
    }),
  });

  if (!twilioRes.ok) {
    const err = await twilioRes.text();
    console.error("Twilio error:", err);
    return new Response(JSON.stringify({ error: "Failed to send SMS" }), { status: 500 });
  }

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
