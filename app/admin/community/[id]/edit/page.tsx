import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPostEditorClient } from "@/components/admin/AdminPostEditorClient";

export default async function AdminEditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase
      .from("community_posts")
      .select("*, community_attachments(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("community_categories").select("id, name, icon").order("order_index"),
  ]);

  if (!post) notFound();

  return (
    <AdminPostEditorClient
      categories={categories ?? []}
      post={post as any}
      userId={user.id}
    />
  );
}
