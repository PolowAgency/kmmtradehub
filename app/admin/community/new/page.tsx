import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPostEditorClient } from "@/components/admin/AdminPostEditorClient";

export default async function AdminNewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categories } = await supabase
    .from("community_categories")
    .select("id, name, icon")
    .order("order_index");

  return (
    <AdminPostEditorClient
      categories={categories ?? []}
      userId={user.id}
    />
  );
}
