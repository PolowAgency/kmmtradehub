import type { Database } from "@/lib/supabase/types";
import { createServiceClient } from "@/lib/supabase/service";

type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
type CurriculumModule = ModuleRow & {
  lessons: LessonRow[];
};

type ProgressRow = Pick<
  Database["public"]["Tables"]["student_progress"]["Row"],
  "lesson_id" | "completed"
>;

type QuizAccessRow = Pick<
  Database["public"]["Tables"]["quizzes"]["Row"],
  "id" | "lesson_id" | "module_id"
>;

type BadgeAwardProgressRow = {
  lesson_id: string;
  lessons: { module_id: string | null } | null;
};

type AccessState = {
  accessibleModuleIds: Set<string>;
  accessibleLessonIds: Set<string>;
  completableLessonIds: Set<string>;
  moduleQuizIds: Set<string>;
  lessonQuizIds: Set<string>;
  completedLessonIds: Set<string>;
};

const STORAGE_BUCKETS = new Set(["pdf-resources", "audio-resources", "video-resources"]);

export function sanitizeLessonHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|link|meta)[^>]*?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(['"])javascript:.*?\2/gi, '$1="#"');
}

export async function getPublishedCurriculum() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("is_published", true)
    .order("order_index");

  if (error) throw error;

  const modules = (data ?? []) as Array<ModuleRow & { lessons: LessonRow[] | null }>;

  return modules
    .map((module) => ({
      ...module,
      lessons: (module.lessons ?? [])
        .filter((lesson) => lesson.is_published)
        .sort((a, b) => a.order_index - b.order_index),
    }))
    .filter((module) => module.lessons.length > 0) as CurriculumModule[];
}

export async function getAccessState(userId: string): Promise<AccessState> {
  const supabase = createServiceClient();
  const [curriculum, progressRes, quizzesRes] = await Promise.all([
    getPublishedCurriculum(),
    supabase
      .from("student_progress")
      .select("lesson_id, completed")
      .eq("student_id", userId)
      .eq("completed", true),
    supabase.from("quizzes").select("id, lesson_id, module_id"),
  ]);

  if (progressRes.error) throw progressRes.error;
  if (quizzesRes.error) throw quizzesRes.error;

  const progressRows = (progressRes.data ?? []) as ProgressRow[];
  const quizRows = (quizzesRes.data ?? []) as QuizAccessRow[];
  const completedLessonIds = new Set(progressRows.map((entry) => entry.lesson_id));
  const accessibleModuleIds = new Set<string>();
  const accessibleLessonIds = new Set<string>();
  const completableLessonIds = new Set<string>();

  let previousModuleComplete = true;

  for (const curriculumModule of curriculum) {
    if (!previousModuleComplete) break;

    accessibleModuleIds.add(curriculumModule.id);

    for (let index = 0; index < curriculumModule.lessons.length; index += 1) {
      const lesson = curriculumModule.lessons[index];
      const previousLessonIds = curriculumModule.lessons.slice(0, index).map((entry) => entry.id);
      const previousLessonsComplete = previousLessonIds.every((id) => completedLessonIds.has(id));
      if (!previousLessonsComplete) break;

      accessibleLessonIds.add(lesson.id);
      if (!completedLessonIds.has(lesson.id)) {
        completableLessonIds.add(lesson.id);
      }
    }

    previousModuleComplete = curriculumModule.lessons.every((lesson) => completedLessonIds.has(lesson.id));
  }

  const lessonQuizIds = new Set<string>();
  const moduleQuizIds = new Set<string>();

  for (const quiz of quizRows) {
    if (quiz.lesson_id && accessibleLessonIds.has(quiz.lesson_id)) {
      lessonQuizIds.add(quiz.id);
    }

    if (quiz.module_id) {
      const quizModule = curriculum.find((entry) => entry.id === quiz.module_id);
      if (quizModule && quizModule.lessons.every((lesson) => completedLessonIds.has(lesson.id))) {
        moduleQuizIds.add(quiz.id);
      }
    }
  }

  return {
    accessibleModuleIds,
    accessibleLessonIds,
    completableLessonIds,
    moduleQuizIds,
    lessonQuizIds,
    completedLessonIds,
  };
}

export async function canAccessModule(userId: string, moduleId: string) {
  const access = await getAccessState(userId);
  return access.accessibleModuleIds.has(moduleId);
}

export async function canAccessLesson(userId: string, lessonId: string) {
  const access = await getAccessState(userId);
  return access.accessibleLessonIds.has(lessonId);
}

export async function canCompleteLesson(userId: string, lessonId: string) {
  const access = await getAccessState(userId);
  return access.completableLessonIds.has(lessonId) || access.completedLessonIds.has(lessonId);
}

export async function canAccessQuiz(userId: string, quizId: string) {
  const access = await getAccessState(userId);
  return access.lessonQuizIds.has(quizId) || access.moduleQuizIds.has(quizId);
}

export async function signResourceUrl(url: string) {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return url;

    const storagePath = parsed.pathname.slice(markerIndex + marker.length);
    const [bucket, ...rest] = storagePath.split("/");
    if (!bucket || rest.length === 0 || !STORAGE_BUCKETS.has(bucket)) return url;

    const supabase = createServiceClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(rest.join("/"), 60 * 60);

    if (error || !data?.signedUrl) return url;
    return data.signedUrl;
  } catch {
    return url;
  }
}

export async function awardStudentBadges(userId: string) {
  const supabase = createServiceClient();
  const [
    badgesRes,
    earnedBadgesRes,
    completedProgressRes,
    streakRes,
    passedQuizzesRes,
    lessonsRes,
  ] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase.from("student_badges").select("badge_id").eq("student_id", userId),
    supabase
      .from("student_progress")
      .select("lesson_id, lessons(module_id)")
      .eq("student_id", userId)
      .eq("completed", true),
    supabase.from("streaks").select("current_streak").eq("student_id", userId).maybeSingle(),
    supabase.from("quiz_results").select("id").eq("student_id", userId).eq("passed", true),
    supabase.from("lessons").select("id, module_id").eq("is_published", true),
  ]);

  if (badgesRes.error) throw badgesRes.error;
  if (earnedBadgesRes.error) throw earnedBadgesRes.error;
  if (completedProgressRes.error) throw completedProgressRes.error;
  if (streakRes.error) throw streakRes.error;
  if (passedQuizzesRes.error) throw passedQuizzesRes.error;
  if (lessonsRes.error) throw lessonsRes.error;

  const allBadges = badgesRes.data ?? [];
  const earnedIds = new Set(earnedBadgesRes.data?.map((badge) => badge.badge_id) ?? []);
  const completedProgressRows = (completedProgressRes.data ?? []) as unknown as BadgeAwardProgressRow[];
  const publishedLessons = (lessonsRes.data ?? []) as Array<Pick<LessonRow, "id" | "module_id">>;
  const completedLessonsCount = completedProgressRows.length;
  const streakDays = streakRes.data?.current_streak ?? 0;
  const passedQuizCount = passedQuizzesRes.data?.length ?? 0;

  const lessonsByModule: Record<string, number> = {};
  for (const progress of completedProgressRows) {
    const moduleId = progress.lessons?.module_id;
    if (moduleId) {
      lessonsByModule[moduleId] = (lessonsByModule[moduleId] ?? 0) + 1;
    }
  }

  const totalByModule: Record<string, number> = {};
  for (const lesson of publishedLessons) {
    totalByModule[lesson.module_id] = (totalByModule[lesson.module_id] ?? 0) + 1;
  }

  const completedModulesCount = Object.entries(lessonsByModule).filter(
    ([moduleId, count]) => totalByModule[moduleId] > 0 && count >= totalByModule[moduleId]
  ).length;

  const toAward = allBadges.filter((badge) => {
    if (earnedIds.has(badge.id)) return false;
    const target = badge.condition_value;

    switch (badge.condition_type) {
      case "lessons_completed":
        return completedLessonsCount >= target;
      case "streak_days":
        return streakDays >= target;
      case "quiz_passed":
        return passedQuizCount >= target;
      case "module_completed":
        return completedModulesCount >= target;
      default:
        return false;
    }
  });

  if (toAward.length > 0) {
    const { error } = await supabase.from("student_badges").upsert(
      toAward.map((badge) => ({ student_id: userId, badge_id: badge.id })),
      { onConflict: "student_id,badge_id", ignoreDuplicates: true }
    );

    if (error) throw error;
  }

  return toAward.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon ?? "🏆",
  }));
}

export async function updateStudentStreak(userId: string) {
  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  const { data: streak, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("student_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!streak) {
    const { error: insertError } = await supabase.from("streaks").insert({
      student_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });

    if (insertError) throw insertError;
    return { currentStreak: 1, longestStreak: 1 };
  }

  const isToday = streak.last_activity_date === today;
  const isYesterday = streak.last_activity_date === yesterday;
  const currentStreak = isToday ? streak.current_streak : isYesterday ? streak.current_streak + 1 : 1;
  const longestStreak = Math.max(currentStreak, streak.longest_streak);

  const { error: updateError } = await supabase
    .from("streaks")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    })
    .eq("student_id", userId);

  if (updateError) throw updateError;

  return { currentStreak, longestStreak };
}

export async function getModuleCompletionState(userId: string, moduleId: string) {
  const supabase = createServiceClient();
  const [lessonsRes, progressRes] = await Promise.all([
    supabase.from("lessons").select("id").eq("module_id", moduleId).eq("is_published", true),
    supabase
      .from("student_progress")
      .select("lesson_id")
      .eq("student_id", userId)
      .eq("completed", true),
  ]);

  if (lessonsRes.error) throw lessonsRes.error;
  if (progressRes.error) throw progressRes.error;

  const moduleLessonIds = (lessonsRes.data ?? []).map((lesson) => lesson.id);
  const completedIds = new Set(progressRes.data?.map((entry) => entry.lesson_id) ?? []);

  return {
    isComplete: moduleLessonIds.length > 0 && moduleLessonIds.every((id) => completedIds.has(id)),
  };
}

export async function getStudentBadgeMetadata(badges: Array<{ id: string; name: string; description: string | null; icon: string | null }>) {
  return badges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon ?? "🏆",
  }));
}

export async function listVisibleResources(userId: string) {
  const supabase = createServiceClient();
  const access = await getAccessState(userId);
  const lessonIds = [...access.accessibleLessonIds];

  if (lessonIds.length === 0) return [];

  const { data, error } = await supabase
    .from("lesson_resources")
    .select("*, lessons(title, modules(title))")
    .in("lesson_id", lessonIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (resource) => ({
      ...resource,
      url: resource.type === "link" ? resource.url : await signResourceUrl(resource.url),
    }))
  );
}

export async function listLessonResources(lessonId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (resource) => ({
      ...resource,
      url: resource.type === "link" ? resource.url : await signResourceUrl(resource.url),
    }))
  );
}

export async function createOrInviteStudent(email: string, fullName?: string | null) {
  const supabase = createServiceClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (profileError) throw profileError;
  if (existingProfile) return { invited: false, alreadyExists: true };

  const { error } = await supabase.auth.admin.inviteUserByEmail(normalizedEmail, {
    data: {
      full_name: fullName ?? normalizedEmail.split("@")[0],
      role: "student",
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://kmmtradehub.com"}/login`,
  });

  if (error) throw error;
  return { invited: true, alreadyExists: false };
}
