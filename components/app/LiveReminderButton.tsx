"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface Props {
  liveId: string;
  userId: string;
  email: string;
  isReminded: boolean;
}

export function LiveReminderButton({ liveId, userId, email, isReminded: initial }: Props) {
  const [reminded, setReminded] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/${liveId}/remind`, {
        method: reminded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      if (res.ok) setReminded(!reminded);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
        reminded
          ? "bg-gold/10 border-gold/25 text-gold hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400"
          : "bg-gold text-[#0A0A0A] border-transparent hover:bg-gold-light"
      }`}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : reminded ? (
        <BellOff size={15} />
      ) : (
        <Bell size={15} />
      )}
      {reminded ? "Rappel activé" : "Me rappeler"}
    </button>
  );
}
