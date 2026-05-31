import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, email } = await req.json();
  if (!userId || !email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = await createClient();

  // Fetch live info
  const { data: live } = await supabase.from("lives").select("title, scheduled_at").eq("id", id).single();
  if (!live) return NextResponse.json({ error: "Live not found" }, { status: 404 });

  // Upsert reminder
  const { error } = await supabase
    .from("live_reminders")
    .upsert({ live_id: id, user_id: userId, email }, { onConflict: "live_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const formattedDate = new Date(live.scheduled_at).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  await resend.emails.send({
    from: "KMM Trade <noreply@kmmtrade.fr>",
    to: email,
    subject: `Rappel activé ${live.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:32px;border-radius:16px;">
        <h2 style="color:#C9A84C;margin-bottom:8px;">Rappel activé ✅</h2>
        <p style="color:#888;margin-bottom:24px;">Tu recevras un email 30 minutes avant le live.</p>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 6px 0;font-weight:600;">${live.title}</p>
          <p style="margin:0;color:#888;font-size:14px;">${formattedDate}</p>
        </div>
        <p style="color:#555;font-size:12px;">KMM Trade · Tu peux annuler ton rappel depuis la page du live.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("live_reminders")
    .delete()
    .eq("live_id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
