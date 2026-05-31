import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/app/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: streak },
    { data: badges },
    { data: quizResults },
    { data: progress },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("streaks").select("*").eq("student_id", user.id).single(),
    supabase.from("student_badges").select("*, badges(*)").eq("student_id", user.id),
    supabase.from("quiz_results").select("*").eq("student_id", user.id).order("completed_at", { ascending: false }).limit(5),
    supabase.from("student_progress").select("completed").eq("student_id", user.id).eq("completed", true),
  ]);

  return (
    <ProfileClient
      profile={profile}
      streak={streak}
      badges={badges ?? []}
      quizResults={quizResults ?? []}
      completedLessons={progress?.length ?? 0}
      userId={user.id}
    />
  );
}
