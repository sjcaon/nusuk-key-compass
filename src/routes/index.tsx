import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, KeyRound, ShieldCheck, Plus, Users, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nosuk key World — Live Community Key Feed" },
      { name: "description", content: "Share and copy Nusuk keys. Track which keys you've already used, with verified admin drops." },
      { property: "og:title", content: "Nosuk key World" },
      { property: "og:description", content: "Live community feed of Nusuk keys with verified admin drops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Key = { id: string; key_value: string; is_admin_drop: boolean; created_at: string };
const LS = "nusuk_copied_keys";
const NUSUK_URL = "https://www.nusuk.sa/";

function timeAgo(d: string) {
  const s = Math.max(0, Math.floor((Date.now() - +new Date(d)) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const dd = Math.floor(h / 24); return `${dd} day${dd > 1 ? "s" : ""} ago`;
}

function Index() {
  const [showModal, setShowModal] = useState(true);
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState<"newest" | "active">("newest");

  const load = async () => {
    const { data, error } = await supabase
      .from("nusuk_keys")
      .select("*")
      .order("is_admin_drop", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load keys");
    setKeys(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    try {
      setCopied(JSON.parse(localStorage.getItem(LS) || "[]"));
    } catch {}
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) { toast.error("Please enter a key"); return; }
    if (v.length > 500) { toast.error("Key is too long"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("nusuk_keys").insert({ key_value: v });
    setSubmitting(false);
    if (error) { toast.error("Submission failed"); return; }
    toast.success("Thank you! Key shared.");
    setValue("");
    setShowModal(false);
    load();
  };

  const copy = async (k: Key) => {
    try {
      await navigator.clipboard.writeText(k.key_value);
    } catch {
      toast.error("Clipboard unavailable");
      return;
    }
    toast.success("Copied!");
    const next = Array.from(new Set([...copied, k.id]));
    setCopied(next);
    localStorage.setItem(LS, JSON.stringify(next));
  };

  const sorted = [...keys].sort((a, b) => {
    if (sort === "active") {
      const ua = copied.includes(a.id) ? 1 : 0, ub = copied.includes(b.id) ? 1 : 0;
      if (ua !== ub) return ua - ub;
    }
    if (a.is_admin_drop !== b.is_admin_drop) return a.is_admin_drop ? -1 : 1;
    return +new Date(b.created_at) - +new Date(a.created_at);
  });
  const stats = [
    { label: "Total Keys Shared", value: keys.length.toLocaleString(), icon: KeyRound },
    { label: "Active Users", value: (128 + keys.length * 3).toLocaleString(), icon: Users },
    { label: "Total Views", value: (2450 + keys.length * 17).toLocaleString(), icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-40 px-4 pt-4">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight sm:text-xl">Nosuk key World</span>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-brand"><Plus className="h-4 w-4" /> Submit Key</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((st) => (
            <div key={st.label} className="glass rounded-2xl p-3 text-center sm:p-5">
              <st.icon className="mx-auto h-5 w-5 text-primary" />
              <div className="mt-1 text-xl font-extrabold text-gradient sm:text-3xl">{st.value}</div>
              <div className="text-[11px] text-foreground/60 sm:text-sm">{st.label}</div>
            </div>
          ))}
        </section>

        <div className="glass mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" /></span>
            Live Board
          </div>
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {([["newest", "Newest First"], ["active", "Active Keys"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setSort(v)} className={sort === v ? "tab-active" : "tab"}>{l}</button>
            ))}
          </div>
        </div>

        <div className="mt-5">
        {loading ? (
          <p className="text-center text-foreground/60">Loading keys…</p>
        ) : keys.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">No keys yet — be the first to share one!</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((k) => {
              const used = copied.includes(k.id);
              return (
                <div key={k.id} className={`glass float-card flex flex-col gap-4 rounded-2xl p-5 transition ${used ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground/70">Referral Code</span>
                    <span className="text-xs text-foreground/50">{timeAgo(k.created_at)}</span>
                  </div>
                  {k.is_admin_drop && (
                    <span className="badge-verified self-start"><ShieldCheck className="h-3.5 w-3.5" /> Verified Admin Drop</span>
                  )}
                  <div className="code-box">{k.key_value}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => copy(k)} className={`${used ? "btn-muted" : "btn-brand"} whitespace-nowrap px-2`}>
                      {used ? <><Check className="h-4 w-4" /> Already Copied</> : <><Copy className="h-4 w-4" /> Copy Code</>}
                    </button>
                    <a href={NUSUK_URL} target="_blank" rel="noopener noreferrer" className="btn-muted whitespace-nowrap px-2">
                      <ExternalLink className="h-4 w-4" /> Open Nosuk App
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
        <p className="mt-10 text-center text-xs text-foreground/40"><Link to="/admin">Admin</Link></p>
      </main>
      <Footer />

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="glass-strong w-full max-w-md rounded-3xl p-7 animate-in fade-in zoom-in-95">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-center text-2xl font-bold">Submit a new key to help others</h2>
            <p className="mt-2 text-center text-sm text-foreground/60">Share a Nusuk key with the community.</p>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={500}
              placeholder="Paste your key here"
              className="input-glass mt-5"
            />
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-muted flex-1">Skip</button>
              <button disabled={submitting} className="btn-brand flex-1">{submitting ? "Submitting…" : "Submit"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
