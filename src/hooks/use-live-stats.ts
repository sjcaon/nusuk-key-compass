import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { connectedUsers } from "@/lib/key-board";

let pageLoadId: string | undefined;

export function useLiveStats() {
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    let recording = false;
    let recorded = false;
    pageLoadId ??= crypto.randomUUID();
    const loadId = pageLoadId;
    let visitorId: string = crypto.randomUUID();
    try {
      const saved = localStorage.getItem("nosuk_visitor_id");
      if (saved) visitorId = saved;
      else localStorage.setItem("nosuk_visitor_id", visitorId);
    } catch { /* A private browsing tab still participates in presence. */ }

    const updateViews = (value: number) => {
      if (alive) setTotalViews((previous) => Math.max(previous ?? 0, value));
    };
    const refreshViews = async () => {
      try {
        if (!recorded) {
          if (recording) return;
          recording = true;
          try {
            const { data, error } = await supabase.rpc("record_page_load", { p_load_id: loadId });
            if (!error && data !== null) {
              recorded = true;
              updateViews(Number(data));
            }
          } finally { recording = false; }
        } else {
          const { data, error } = await supabase.from("site_statistics").select("total_views").eq("id", 1).maybeSingle();
          if (!error && data) updateViews(Number(data.total_views));
        }
      } catch { /* Retry the same load ID, without counting a retry as a view. */ }
    };

    const channel = supabase.channel(`nosuk-live-board`, { config: { presence: { key: visitorId } } });
    channel.on("presence", { event: "sync" }, () => {
      if (alive) setActiveUsers(connectedUsers(channel.presenceState<{ visitor_id: string }>()));
    }).on("postgres_changes", { event: "*", schema: "public", table: "site_statistics" }, () => {
      void refreshViews();
    }).subscribe(async (status) => {
      if (!alive) return;
      if (status === "SUBSCRIBED") {
        await channel.track({ visitor_id: visitorId });
        void refreshViews();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setActiveUsers(null);
      }
    });
    void refreshViews();
    const timer = window.setInterval(() => { void refreshViews(); }, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, []);

  return { totalViews, activeUsers };
}