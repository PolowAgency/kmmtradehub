import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileText, Headphones, Video, ExternalLink } from "lucide-react";
import { listVisibleResources } from "@/lib/learning";

const TYPE_META = {
  pdf:   { icon: FileText,    label: "PDF",    color: "text-red-400",     bg: "bg-red-400/10" },
  audio: { icon: Headphones,  label: "Audio",  color: "text-blue-400",    bg: "bg-blue-400/10" },
  video: { icon: Video,       label: "Vidéo",  color: "text-purple-400",  bg: "bg-purple-400/10" },
  link:  { icon: ExternalLink, label: "Lien",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const resources = await listVisibleResources(user.id);

  const grouped = (resources ?? []).reduce<Record<string, typeof resources>>((acc, res) => {
    const type = (res as { type: string }).type;
    if (!acc[type]) acc[type] = [];
    acc[type]!.push(res);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-cream text-2xl font-semibold">Ressources</h1>
        <p className="text-muted text-sm mt-1">Tous tes PDF, audios et vidéos de formation.</p>
      </div>

      {resources?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} className="text-muted/30 mb-4" />
          <p className="text-muted text-sm">Aucune ressource disponible pour le moment.</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, items]) => {
        const meta = TYPE_META[type as keyof typeof TYPE_META] ?? TYPE_META.link;
        const Icon = meta.icon;
        return (
          <div key={type}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${meta.bg}`}>
                <Icon size={14} className={meta.color} />
              </div>
              <h2 className="text-cream font-semibold text-sm">{meta.label}s</h2>
              <span className="text-muted text-xs">({items?.length})</span>
            </div>

            <div className="space-y-2">
              {items?.map((res) => {
                const r = res as {
                  id: string; title: string; url: string; type: string;
                  lessons?: { title?: string; modules?: { title?: string } };
                };
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-surface-2 border border-white/[0.06] rounded-xl p-4 hover:border-gold/20 transition-all duration-200 group"
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${meta.bg} shrink-0`}>
                      <Icon size={16} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{r.title}</p>
                      {r.lessons && (
                        <p className="text-muted text-[10px] truncate">
                          {r.lessons.modules?.title} · {r.lessons.title}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={14} className="text-muted group-hover:text-gold transition-colors shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
