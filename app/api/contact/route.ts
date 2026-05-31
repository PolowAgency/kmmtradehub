import { Resend } from "resend";
import type { NextRequest } from "next/server";
import { escapeHtml, rateLimit } from "@/lib/utils";

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requêtes par IP par heure
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return Response.json({ error: "Trop de tentatives. Réessaie dans une heure." }, { status: 429 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, email, message } = payload;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  if (name.length > 100 || message.length > 2000) {
    return Response.json({ error: "Message too long" }, { status: 400 });
  }

  await resend.emails.send({
    from: "Contact KMM <noreply@kmmtradehub.com>",
    to: "contact@kmmtradehub.com",
    replyTo: email,
    subject: `[KMM Contact] Message de ${name}`,
    html: `
      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
    `,
  });

  return Response.json({ success: true }, { status: 200 });
}
