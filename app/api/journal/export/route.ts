import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: entries } = await supabase
    .from("trading_journal")
    .select("*")
    .eq("user_id", user.id)
    .order("traded_at", { ascending: false });

  const rows = entries ?? [];

  const IND_PREFIX = "[IND:";
  const IND_SEP = "]\n";
  function parseNotes(raw: string | null) {
    if (!raw) return { indicators: "", notes: "" };
    if (raw.startsWith(IND_PREFIX)) {
      const end = raw.indexOf(IND_SEP);
      if (end !== -1) return { indicators: raw.slice(IND_PREFIX.length, end), notes: raw.slice(end + IND_SEP.length) };
    }
    return { indicators: "", notes: raw };
  }

  const headers = ["Date","Paire","Direction","Résultat","Entrée","Sortie","Lots","R:R","PnL ($)","Émotion","Indicateurs","Notes","Screenshot"];
  const csvRows = rows.map((e) => {
    const { indicators, notes } = parseNotes(e.notes);
    return [
      e.traded_at,
      e.pair,
      e.direction,
      e.result,
      e.entry_price ?? "",
      e.exit_price ?? "",
      e.lot_size ?? "",
      e.rr ?? "",
      e.pnl ?? "",
      e.emotion ?? "",
      indicators,
      (notes ?? "").replace(/"/g, '""'),
      e.screenshot_url ?? "",
    ].map((v) => `"${v}"`).join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="journal-trading-${date}.csv"`,
    },
  });
}
