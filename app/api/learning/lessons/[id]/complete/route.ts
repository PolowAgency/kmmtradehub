import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  awardStudentBadges,
  canCompleteLesson,
  getModuleCompletionState,
  updateStudentStreak,
} from "@/lib/learning";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBadgeEmail } from "@/lib/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAllowed = await canCompleteLesson(user.id, id);
  if (!isAllowed) {
    return NextResponse.json({ error: "Lesson locked" }, { status: 403 });
  }

  const service = createServiceClient();
  const { data: lesson, error: lessonError } = await service
    .from("lessons")
    .select("id, module_id, is_published")
    .eq("id", id)
    .maybeSingle<Pick<Database["public"]["Tables"]["lessons"]["Row"], "id" | "module_id" | "is_published">>();

  if (lessonError) {
    return NextResponse.json({ error: lessonError.message }, { status: 500 });
  }

  if (!lesson || !lesson.is_published) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const timestamp = new Date().toISOString();
  const progressPayload: Database["public"]["Tables"]["student_progress"]["Insert"] = {
    student_id: user.id,
    lesson_id: id,
    completed: true,
    completed_at: timestamp,
    last_accessed_at: timestamp,
  };

  const { error: progressError } = await service.from("student_progress").upsert(
    [progressPayload],
    { onConflict: "student_id,lesson_id" }
  );

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  await updateStudentStreak(user.id);
  const moduleState = await getModuleCompletionState(user.id, lesson.module_id);
  const badges = await awardStudentBadges(user.id);

  // Envoyer un email pour chaque badge débloqué
  if (badges.length > 0) {
    const { data: profile } = await service.from("profiles").select("email, full_name").eq("id", user.id).single();
    if (profile?.email) {
      for (const badge of badges) {
        sendBadgeEmail(profile.email, profile.full_name?.split(" ")[0] ?? "Trader", badge.name, badge.icon).catch(() => {});
      }
    }
  }

  return NextResponse.json({
    success: true,
    moduleComplete: moduleState.isComplete,
    badges,
  });
}
