import Stripe from "stripe";
import { Resend } from "resend";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name ?? "Membre";

    if (customerEmail) {
      await resend.emails.send({
        from: "KMM VIP <noreply@kmmtradehub.com>",
        to: customerEmail,
        subject: "Bienvenue dans KMM VIP — Ton accès est confirmé",
        html: buildWelcomeEmail(customerName),
      });
    }
  }

  return new Response(null, { status: 200 });
}

function buildWelcomeEmail(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans KMM VIP</title>
</head>
<body style="background:#0A0A0A; color:#F5F5F0; font-family:sans-serif; margin:0; padding:0;">
  <div style="max-width:560px; margin:0 auto; padding:40px 24px;">
    <h1 style="color:#D4AF37; font-size:24px; margin-bottom:8px;">KMMTRADEHUB</h1>
    <p style="color:#8B8B8B; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-bottom:32px;">Accès VIP confirmé</p>

    <h2 style="color:#F5F5F0; font-size:20px; margin-bottom:16px;">Bienvenue, ${name} !</h2>

    <p style="color:#8B8B8B; line-height:1.7; margin-bottom:16px;">
      Ton paiement a été accepté. Tu fais maintenant partie de KMM VIP.
    </p>

    <p style="color:#8B8B8B; line-height:1.7; margin-bottom:24px;">
      Tu vas recevoir sous peu un email séparé avec les instructions détaillées
      pour accéder à ton espace privé et à tous les contenus.
    </p>

    <div style="background:#111111; border:1px solid rgba(212,175,55,0.2); border-radius:12px; padding:20px; margin-bottom:32px;">
      <p style="color:#D4AF37; font-size:13px; font-weight:600; margin:0 0 8px;">
        Rappel important
      </p>
      <p style="color:#8B8B8B; font-size:12px; line-height:1.7; margin:0;">
        Le trading comporte des risques de perte en capital. Les contenus KMM VIP
        sont de nature éducative et ne constituent pas des conseils en investissement.
      </p>
    </div>

    <p style="color:#8B8B8B; font-size:12px; margin-bottom:4px;">
      Une question ? Contacte-nous à{" "}
      <a href="mailto:contact@kmmtradehub.com" style="color:#D4AF37;">
        contact@kmmtradehub.com
      </a>
    </p>

    <p style="color:#555; font-size:11px; margin-top:32px;">
      © ${new Date().getFullYear()} KMMTRADEHUB — Tous droits réservés
    </p>
  </div>
</body>
</html>
  `;
}
