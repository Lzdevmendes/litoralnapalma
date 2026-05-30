import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_KEY  = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL  = Deno.env.get("RESEND_FROM") ?? "Litoral na Palma <noreply@resend.dev>";
const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";

type ActionType = "signup" | "magiclink" | "recovery" | "email_change" | "invite";

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: ActionType;
  site_url: string;
  token_new: string;
  token_hash_new: string;
}

interface HookUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; name?: string };
}

// ─── Templates ───────────────────────────────────────────────────────────────

function buildEmailHTML(token: string, actionType: ActionType): string {
  const labels: Record<ActionType, { headline: string; body: string; cta: string }> = {
    signup: {
      headline: "Confirme seu cadastro",
      body: "Obrigado por se cadastrar! Use o código abaixo para confirmar seu e-mail e acessar o <strong>Litoral na Palma</strong>.",
      cta: "Código de confirmação",
    },
    magiclink: {
      headline: "Seu link de acesso",
      body: "Use o código abaixo para entrar no <strong>Litoral na Palma</strong>. Ele expira em <strong>10 minutos</strong>.",
      cta: "Código de acesso",
    },
    recovery: {
      headline: "Recuperar acesso",
      body: "Recebemos uma solicitação para redefinir o acesso à sua conta. Use o código abaixo para continuar.",
      cta: "Código de recuperação",
    },
    email_change: {
      headline: "Confirme seu novo e-mail",
      body: "Use o código abaixo para confirmar a troca do endereço de e-mail da sua conta.",
      cta: "Código de confirmação",
    },
    invite: {
      headline: "Você foi convidado!",
      body: "Você recebeu um convite para o <strong>Litoral na Palma</strong>. Use o código abaixo para ativar sua conta.",
      cta: "Código de ativação",
    },
  };

  const { headline, body, cta } = labels[actionType] ?? labels.magiclink;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${headline} — Litoral na Palma</title>
</head>
<body style="margin:0;padding:0;background:#f0f6fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f6fc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;
                 box-shadow:0 8px 40px rgba(0,119,182,0.14);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#023e8a 0%,#0077b6 55%,#0096c7 100%);
                        padding:44px 32px 52px;text-align:center;">
              <div style="font-size:56px;margin-bottom:16px;line-height:1;">🌊</div>
              <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;
                          margin-bottom:6px;">Litoral na Palma</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.72);font-weight:500;">
                Litoral Norte de São Paulo
              </div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:40px 36px 32px;">

              <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#0f172a;
                          letter-spacing:-0.3px;line-height:1.3;">
                ${headline}
              </h1>

              <p style="margin:0 0 36px;font-size:15px;color:#475569;line-height:1.7;">
                ${body}
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);
                       border:2px solid #bfdbfe;border-radius:18px;margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 24px;text-align:center;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;
                                text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;">
                      ${cta}
                    </div>
                    <div style="font-size:44px;font-weight:900;color:#0077b6;
                                letter-spacing:14px;font-variant-numeric:tabular-nums;
                                line-height:1;">
                      ${token}
                    </div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:14px;font-weight:500;">
                      ⏱ Válido por 10 minutos
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:#fef9ec;border:1px solid #fde68a;border-radius:12px;
                       margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
                      🔒 <strong>Nunca compartilhe este código.</strong> O Litoral na Palma
                      jamais solicitará seu código por telefone ou mensagem.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
                Se você não solicitou este código, pode ignorar este e-mail com segurança.
              </p>

            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td style="padding:0 36px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 36px;text-align:center;">
              <div style="margin-bottom:14px;">
                <span style="display:inline-flex;align-items:center;gap:6px;
                             background:#f0f9ff;border-radius:100px;
                             padding:6px 14px 6px 10px;font-size:13px;color:#0077b6;font-weight:600;">
                  🏖️ &nbsp;Praias &nbsp;·&nbsp; 🚗 Trânsito &nbsp;·&nbsp; 🌤️ Clima &nbsp;·&nbsp; 🏥 UPAs
                </span>
              </div>
              <div style="font-size:12px;color:#94a3b8;line-height:1.8;">
                © 2026 Litoral na Palma · São Paulo, Brasil<br>
                Este e-mail foi enviado automaticamente — não responda.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function getSubject(actionType: ActionType): string {
  const subjects: Record<ActionType, string> = {
    signup:       "✅ Confirme seu cadastro — Litoral na Palma",
    magiclink:    "🔑 Seu código de acesso — Litoral na Palma",
    recovery:     "🔓 Recuperar acesso — Litoral na Palma",
    email_change: "📧 Confirme seu novo e-mail — Litoral na Palma",
    invite:       "🎉 Você foi convidado — Litoral na Palma",
  };
  return subjects[actionType] ?? "🌊 Litoral na Palma";
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

  let payload: { user: HookUser; email_data: EmailData };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { user, email_data } = payload;
  const actionType = email_data.email_action_type as ActionType;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      [user.email],
      subject: getSubject(actionType),
      html:    buildEmailHTML(email_data.token, actionType),
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
});
