import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MT5ImportClient } from "@/components/app/MT5ImportClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Import MT5" };

export default async function JournalImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <MT5ImportClient userId={user.id} />;
}
