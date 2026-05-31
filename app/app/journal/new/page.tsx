import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalForm } from "@/components/app/JournalForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouveau trade" };

export default async function NewJournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-cream text-2xl font-bold">Nouveau trade</h1>
        <p className="text-muted text-sm mt-0.5">Documente ton analyse et ton état d'esprit</p>
      </div>
      <JournalForm userId={user.id} />
    </div>
  );
}
