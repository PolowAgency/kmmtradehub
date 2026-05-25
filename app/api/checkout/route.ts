import Stripe from "stripe";
import { redirect } from "next/navigation";

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/paiement/echec`,
    locale: "fr",
    payment_method_types: ["card"],
    custom_text: {
      submit: {
        message:
          "Le trading comporte un risque de perte en capital. KMM VIP est une offre éducative.",
      },
    },
  });

  redirect(session.url!);
}
