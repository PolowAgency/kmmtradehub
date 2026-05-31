"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Report {
  id: string;
  reason: string;
  created_at: string;
  is_resolved?: boolean;
  community_comments: {
    id: string;
    content: string;
    post_id: string;
    profiles: { full_name: string | null; email: string } | null;
  } | null;
  profiles: { full_name: string | null; email: string } | null;
}

export function AdminReportsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const supabase = createClient();

  function reporterName(r: Report) {
    return r.profiles?.full_name ?? r.profiles?.email?.split("@")[0] ?? "Inconnu";
  }
  function authorName(r: Report) {
    return r.community_comments?.profiles?.full_name ?? r.community_comments?.profiles?.email?.split("@")[0] ?? "Inconnu";
  }

  async function handleDelete(reportId: string, commentId: string) {
    if (!confirm("Supprimer le commentaire signalé ?")) return;
    await supabase.from("community_comments").delete().eq("id", commentId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }

  async function handleDismiss(reportId: string) {
    await supabase.from("comment_reports").delete().eq("id", reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-center">
        <CheckCircle size={36} className="text-green-500/40" />
        <p className="text-muted text-sm">Aucun signalement en attente. Tout est propre !</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4 space-y-3">
          {/* Comment preview */}
          <div className="bg-surface-3 border border-red-500/15 rounded-xl p-3.5">
            <p className="text-cream text-sm leading-relaxed">
              {report.community_comments?.content ?? "(commentaire supprimé)"}
            </p>
            <p className="text-muted/50 text-[10px] mt-1.5">Par {authorName(report)}</p>
          </div>

          {/* Report meta */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-muted text-xs">
                Signalé par <span className="text-cream/80">{reporterName(report)}</span>
                <span className="text-muted/40 mx-1.5">·</span>
                {new Date(report.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              {report.reason && <p className="text-muted/60 text-[11px] italic">« {report.reason} »</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {report.community_comments?.post_id && (
                <Link
                  href={`/app/community/${report.community_comments.post_id}`}
                  target="_blank"
                  className="flex items-center gap-1 text-muted text-xs hover:text-cream transition-colors px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.06]"
                >
                  <ExternalLink size={11} /> Voir le post
                </Link>
              )}
              <button
                onClick={() => handleDismiss(report.id)}
                className="flex items-center gap-1 text-xs text-muted hover:text-green-400 transition-colors px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.06]"
              >
                <CheckCircle size={11} /> Ignorer
              </button>
              {report.community_comments && (
                <button
                  onClick={() => handleDelete(report.id, report.community_comments!.id)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.06]"
                >
                  <Trash2 size={11} /> Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
