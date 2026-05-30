import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const INFOBIP_KEY     = Deno.env.get("INFOBIP_API_KEY") ?? "";
const INFOBIP_BASE    = Deno.env.get("INFOBIP_BASE_URL") ?? "";
const HOOK_SECRET     = Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "";
const SENDER_NAME     = "LitoralPalma";

interface SmsData {
  otp: string;
}

interface HookUser {
  id: string;
  phone: string;
}

function buildSmsBody(otp: string): string {
  return `🌊 Litoral na Palma\n\nSeu código de acesso: ${otp}\n\nVálido por 10 minutos. Não compartilhe este código com ninguém.`;
}

Deno.serve(async (req: Request) => {

  let payload: { user: HookUser; sms_data: SmsData };
  try {
    payload = await req.json();
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
