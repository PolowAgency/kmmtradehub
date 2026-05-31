import { createClient } from "@/lib/supabase/server";
import { AdminCommunityClient } from "@/components/admin/AdminCommunityClient";

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*, community_categories(id,name,icon), community_comments(id), community_reactions(user_id)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  return <AdminCommunityClient initialPosts={(posts ?? []) as any} />;
}
