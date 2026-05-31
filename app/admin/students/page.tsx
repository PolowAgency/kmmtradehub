import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, Trophy } from "lucide-react";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("*, student_progress(completed), student_badges(id), streaks(current_streak)")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-cream text-2xl font-semibold">Étudiants</h1>
        <p className="text-muted text-sm mt-1">{students?.length ?? 0} étudiant{(students?.length ?? 0) > 1 ? "s" : ""} inscrit{(students?.length ?? 0) > 1 ? "s" : ""}</p>
      </div>

      {students?.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Users size={40} className="text-muted/30 mb-4" />
          <p className="text-muted text-sm">Aucun étudiant inscrit.</p>
        </div>
      )}

      <div className="space-y-3">
        {students?.map((s) => {
          const st = s as {
            id: string; email: string; full_name: string | null; created_at: string;
            student_progress?: Array<{ completed: boolean }>;
            student_badges?: Array<{ id: string }>;
            streaks?: Array<{ current_streak: number }>;
          };
          const completed = st.student_progress?.filter((p) => p.completed).length ?? 0;
          const badges = st.student_badges?.length ?? 0;
          const streak = st.streaks?.[0]?.current_streak ?? 0;

          return (
            <div
              key={st.id}
              className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-3 text-muted font-semibold shrink-0">
                {st.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{st.full_name ?? ""}</p>
                <p className="text-muted text-xs truncate">{st.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1.5 text-muted text-xs">
                  <BookOpen size={12} className="text-gold" />{completed}
                </span>
                <span className="flex items-center gap-1.5 text-muted text-xs">
                  <Trophy size={12} className="text-gold" />{badges}
                </span>
                <span className="text-muted text-xs">🔥 {streak}j</span>
              </div>
              <p className="text-muted text-[10px] shrink-0 hidden md:block">
                {new Date(st.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
