import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
// onboarding@resend.dev = domaine sandbox Resend, fonctionne sans vérification de domaine
// Quand kmmtradehub.com sera vérifié dans Resend, remplacer par : notifications@kmmtradehub.com
const FROM   = "KMM VIP <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.vercel.app";

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KMM VIP</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" style="max-width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:#0A0A0A;padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#D4AF37;letter-spacing:-0.5px;">KMM VIP</p>
          <p style="margin:4px 0 0;font-size:11px;color:#666;letter-spacing:2px;text-transform:uppercase;">Plateforme éducative trading</p>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:11px;color:#999;">
            KMM VIP · <a href="${APP_URL}/app/dashboard" style="color:#D4AF37;text-decoration:none;">Accéder à la plateforme</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#D4AF37;color:#0A0A0A;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${label}</a>`;
}

// ── Email : badge débloqué ──────────────────────────────────────
export async function sendBadgeEmail(to: string, name: string, badgeName: string, badgeIcon: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `${badgeIcon} Tu as débloqué le badge "${badgeName}" !`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;line-height:1;margin-bottom:12px;">${badgeIcon}</div>
        <h1 style="margin:0 0 8px;font-size:22px;color:#0A0A0A;">Félicitations ${name} !</h1>
        <p style="margin:0;font-size:15px;color:#666;">Tu viens de débloquer le badge</p>
        <p style="margin:8px 0 0;font-size:20px;font-weight:700;color:#D4AF37;">"${badgeName}"</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.6;text-align:center;">
        Continue sur ta lancée — chaque leçon complétée te rapproche de la maîtrise du trading.
      </p>
      <div style="text-align:center;">
        ${btn(`${APP_URL}/app/dashboard`, "Voir mes badges")}
      </div>
    `),
  });
}

// ── Email : nouveau post de Kevin ───────────────────────────────
export async function sendNewPostEmail(to: string, name: string, postTitle: string, postId: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `📢 Nouveau post KMM : "${postTitle}"`,
    html: base(`
      <h1 style="margin:0 0 8px;font-size:20px;color:#0A0A0A;">Bonjour ${name},</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px;">
        KMM vient de publier un nouveau contenu dans la communauté :
      </p>
      <div style="background:#f9f6ee;border-left:4px solid #D4AF37;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;">📣 ${postTitle}</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Ne rate pas ce contenu — chaque analyse de KMM est une opportunité d'apprentissage.
      </p>
      <div style="text-align:center;">
        ${btn(`${APP_URL}/app/community/${postId}`, "Lire le post")}
      </div>
    `),
  });
}

// ── Email : live programmé ──────────────────────────────────────
export async function sendLiveScheduledEmail(to: string, name: string, liveTitle: string, liveId: string, scheduledAt: string) {
  const date = new Date(scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = new Date(scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return getResend().emails.send({
    from: FROM, to,
    subject: `📡 Live prévu : "${liveTitle}" — ${date} à ${time}`,
    html: base(`
      <h1 style="margin:0 0 8px;font-size:20px;color:#0A0A0A;">Bonjour ${name},</h1>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px;">
        KMM vient de programmer un nouveau live :
      </p>
      <div style="background:#f9f6ee;border:2px solid #D4AF37;padding:20px 24px;border-radius:12px;margin-bottom:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#0A0A0A;">📡 ${liveTitle}</p>
        <p style="margin:0;font-size:15px;color:#D4AF37;font-weight:600;">${date} · ${time}</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Ajoute-le à ton agenda et rejoins le live — les sessions en direct sont les meilleures opportunités pour poser tes questions à KMM.
      </p>
      <div style="text-align:center;">
        ${btn(`${APP_URL}/app/live/${liveId}`, "Voir le live")}
      </div>
    `),
  });
}

// ── Email : bienvenue ───────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: FROM, to,
    subject: `🎯 Bienvenue dans KMM VIP, ${name} !`,
    html: base(`
      <div style="text-align:center;margin-bottom:24px;">
        <p style="font-size:48px;line-height:1;margin:0 0 12px;">🎯</p>
        <h1 style="margin:0 0 8px;font-size:24px;color:#0A0A0A;">Bienvenue ${name} !</h1>
        <p style="margin:0;font-size:15px;color:#666;">Tu fais maintenant partie de KMM VIP</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.8;margin:0 0 16px;">Voici ce que tu vas trouver sur la plateforme :</p>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ["📚", "Modules & leçons", "Progression séquentielle avec quiz"],
          ["📈", "Graphique live", "XAUUSD avec indicateurs KMM"],
          ["✅", "Checklist pre-trade", "Valide chaque setup avant d'entrer"],
          ["📒", "Journal de trading", "Analyse tes trades et importe depuis MT5"],
          ["👥", "Communauté", "Échange avec les autres traders"],
        ].map(([icon, label, desc]) => `
          <tr>
            <td style="padding:8px 12px 8px 0;width:36px;vertical-align:top;font-size:20px;">${icon}</td>
            <td style="padding:8px 0;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0A0A0A;">${label}</p>
              <p style="margin:2px 0 0;font-size:12px;color:#888;">${desc}</p>
            </td>
          </tr>
        `).join("")}
      </table>
      <div style="text-align:center;margin-top:8px;">
        ${btn(`${APP_URL}/app/dashboard`, "Accéder à la plateforme")}
      </div>
    `),
  });
}
