import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendNewPostEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { postId, postTitle } = await request.json() as { postId: string; postTitle: string };
  if (!postId || !postTitle) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const service = createServiceClient();
  const { data: students } = await service
    .from("profiles")
    .select("email, full_name")
    .eq("role", "student");

  if (!students || students.length === 0) return NextResponse.json({ sent: 0 });

  let sent = 0;
  for (const student of students) {
    if (!student.email) continue;
    try {
      await sendNewPostEmail(student.email, student.full_name?.split(" ")[0] ?? "Trader", postTitle, postId);
      sent++;
    } catch {
      // continue even if one email fails
    }
  }

  return NextResponse.json({ sent });
}
