"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function CommunitySearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
      params.delete("cat");
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clear() {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={`flex items-center gap-2.5 bg-surface-2 border rounded-xl px-3.5 py-2.5 transition-colors ${isPending ? "border-gold/20" : "border-white/[0.07] focus-within:border-gold/25"}`}>
      <Search size={14} className="text-muted/50 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Rechercher un post…"
        className="flex-1 bg-transparent text-sm text-cream placeholder-muted/40 focus:outline-none"
      />
      {query && (
        <button onClick={clear} className="text-muted/50 hover:text-muted transition-colors shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
