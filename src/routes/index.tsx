import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nusuk Key World — Live Community Key Feed" },
      { name: "description", content: "Share and copy Nusuk keys. Track which keys you've already used, with verified admin drops." },
      { property: "og:title", content: "Nusuk Key World" },
      { property: "og:description", content: "Live community feed of Nusuk keys with verified admin drops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Key = { id: string; key_value: string; is_admin_drop: boolean; created_at: string };
const LS = "nusuk_copied_keys";

function Index() {
  const [showModal, setShowModal] = useState(true);
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (!v) return toast.error("Please enter a key");
    if (v.length > 500) return toast.error("Key is too long");
    setSubmitting(true);
    const { error } = await supabase.from("nusuk_keys").insert({ key_value: v });
    setSubmitting(false);
    if (error) return toast.error("Submission failed");
    toast.success("Thank you! Key shared.");
    setValue("");
    setShowModal(false);
    load();
  };

  const copy = async (k: Key) => {
    try {
      await navigator.clipboard.writeText(k.key_value);
    } catch {
      return toast.error("Clipboard unavailable");
    }
    toast.success("Copied!");
    const next = Array.from(new Set([...copied, k.id]));
    setCopied(next);
    localStorage.setItem(LS, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-app">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <KeyRound className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nusuk Key World</span>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-brand">Submit a key</button>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Live <span className="text-gradient">Key Feed</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-foreground/70">
            Copy a key, and we'll remember it for you so you never reuse one.
          </p>
        </section>

        {loading ? (
          <p className="text-center text-foreground/60">Loading keys…</p>
        ) : keys.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">No keys yet — be the first to share one!</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {keys.map((k) => {
              const used = copied.includes(k.id);
              return (
                <div key={k.id} className={`glass float-card flex flex-col gap-4 rounded-2xl p-5 transition ${used ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    {k.is_admin_drop ? (
                      <span className="badge-verified"><ShieldCheck className="h-3.5 w-3.5" /> Verified Admin Drop</span>
                    ) : (
                      <span className="badge-community"><Sparkles className="h-3.5 w-3.5" /> Community</span>
                    )}
                    <span className="text-xs text-foreground/50">{new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                  <code className="break-all rounded-xl bg-card/60 px-3 py-3 font-mono text-sm">{k.key_value}</code>
                  <button onClick={() => copy(k)} className={used ? "btn-muted" : "btn-brand"}>
                    {used ? <><Check className="h-4 w-4" /> Already Copied</> : <><Copy className="h-4 w-4" /> Copy Key</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
