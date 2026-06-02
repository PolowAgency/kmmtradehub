import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CallRequestForm } from "@/components/app/CallRequestForm";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Session 1:1" };

export default async function CallsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: requests } = await supabase
    .from("call_requests")
    .select("id, topic, status, slot_1, confirmed_slot, admin_note, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return <CallRequestForm userId={user.id} existing={requests ?? []} />;
}
