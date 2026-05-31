import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

// Appelé par Vercel Cron toutes les 30 minutes
// vercel.json : { "crons": [{ "path": "/api/cron/live-reminders", "schedule": "*/30 * * * *" }] }
export async function GET(req: NextRequest) {
  // Vercel Cron envoie Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Lives qui commencent dans les 30 prochaines minutes
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);

  const { data: lives } = await supabase
    .from("lives")
    .select("id, title, scheduled_at")
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in30.toISOString());

  if (!lives || lives.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let totalSent = 0;

  for (const live of lives) {
    // Récupérer les rappels non encore envoyés
    const { data: reminders } = await supabase
      .from("live_reminders")
      .select("id, email, user_id")
      .eq("live_id", live.id)
      .is("sent_at", null);

    if (!reminders || reminders.length === 0) continue;

    const formattedDate = new Date(live.scheduled_at).toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit",
    });

    const emails = reminders.map((r) => r.email).filter(Boolean);
    if (emails.length === 0) continue;

    await resend.emails.send({
      from: "KMM Trade <noreply@kmmtradehub.com>",
      to: emails,
      subject: `⏰ Live dans 30 min ${live.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:32px;border-radius:16px;">
          <h2 style="color:#C9A84C;margin-bottom:8px;">Ton live commence bientôt !</h2>
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 6px 0;font-weight:600;">${live.title}</p>
            <p style="margin:0;color:#888;font-size:14px;">Aujourd'hui à ${formattedDate}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.com"}/app/live/${live.id}"
             style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">
            Rejoindre le live →
          </a>
          <p style="color:#444;font-size:12px;margin-top:32px;">KMMTRADEHUB</p>
        </div>
      `,
    });

    // Marquer comme envoyés
    const reminderIds = reminders.map((r) => r.id);
    await supabase
      .from("live_reminders")
      .update({ sent_at: new Date().toISOString() })
      .in("id", reminderIds);

    totalSent += emails.length;
  }

  return NextResponse.json({ ok: true, sent: totalSent });
}
