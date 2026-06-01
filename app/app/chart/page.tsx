import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TradingViewWidget } from "@/components/app/TradingViewWidget";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Graphique" };

export default async function ChartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 120px)" }}>
      <div>
        <h1 className="text-cream text-2xl font-bold">Graphique</h1>
        <p className="text-muted text-sm mt-0.5">Analyse en temps réel avec indicateurs intégrés — RSI, MACD, EMA</p>
      </div>
      <TradingViewWidget />
    </div>
  );
}
