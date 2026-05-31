import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth guard admin only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (caller?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  // Fetch the post
  const { data: post } = await supabase.from("community_posts").select("title, content").eq("id", postId).single();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Fetch all student emails
  const { data: students } = await supabase.from("profiles").select("email").eq("role", "student");
  if (!students || students.length === 0) return NextResponse.json({ ok: true, count: 0 });

  const emails = students.map((s) => s.email).filter(Boolean);
  const snippet = post.content?.replace(/<[^>]*>/g, "").slice(0, 200) ?? "";

  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Batch sends (Resend allows up to 50 recipients in batch)
  const batchSize = 50;
  let sent = 0;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await resend.emails.send({
      from: "KMM Trade <noreply@kmmtrade.fr>",
      to: batch,
      subject: `Nouveau post KMM ${post.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:32px;border-radius:16px;">
          <h2 style="color:#C9A84C;margin-bottom:8px;">Nouveau post dans la communauté</h2>
          <h3 style="color:#F5F0E8;margin-bottom:12px;">${post.title}</h3>
          ${snippet ? `<p style="color:#888;font-size:14px;line-height:1.6;margin-bottom:24px;">${snippet}…</p>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtrade.fr"}/app/community"
             style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">
            Voir le post →
          </a>
          <p style="color:#444;font-size:12px;margin-top:32px;">KMM Trade · Tu reçois cet email car tu es membre de la formation.</p>
        </div>
      `,
    });
    sent += batch.length;
  }

  return NextResponse.json({ ok: true, count: sent });
}
