import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppBottomNav } from "@/components/app/AppBottomNav";
import { OnboardingModal } from "@/components/app/OnboardingModal";
import { NotificationBell } from "@/components/app/NotificationBell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: latestPost }, { data: streak }, { count: completedCount }, { count: totalCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("community_posts").select("created_at").eq("is_published", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("streaks").select("current_streak").eq("student_id", user.id).maybeSingle(),
    supabase.from("student_progress").select("*", { count: "exact", head: true }).eq("student_id", user.id).eq("completed", true),
    supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const hasNewCommunity = latestPost
    ? !profile?.community_last_seen_at || new Date(latestPost.created_at) > new Date(profile.community_last_seen_at)
    : false;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar desktop */}
      <AppSidebar
        profile={profile}
        hasNewCommunity={hasNewCommunity}
        completedLessons={completedCount ?? 0}
        totalLessons={totalCount ?? 0}
        currentStreak={streak?.current_streak ?? 0}
        userId={user.id}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:ml-64">
        {/* Top bar mobile avec cloche */}
        <div className="md:hidden flex items-center justify-end px-4 pt-4 pb-0">
          <NotificationBell userId={user.id} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <AppBottomNav hasNewCommunity={hasNewCommunity} isAdmin={profile?.role === "admin"} />
      <OnboardingModal
        userId={user.id}
        userName={profile?.full_name?.split(" ")[0] ?? "Trader"}
        onboardingDone={Boolean((profile as Record<string, unknown>)?.onboarding_done)}
      />
    </div>
  );
}
