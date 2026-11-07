import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, KeyRound, ShieldCheck, Plus, Users, Eye, ExternalLink, Share2, X, Globe, Facebook, MessageCircle, Twitter, Send, Link2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
const HIDE = "nusuk_hide_used";
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
  const [showShare, setShowShare] = useState(false);
  const [hideUsed, setHideUsed] = useState(false);
  const [fading, setFading] = useState<string[]>([]);
  const toggleHide = (v: boolean) => { setHideUsed(v); localStorage.setItem(HIDE, v ? "1" : "0"); };
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
      setHideUsed(localStorage.getItem(HIDE) === "1");
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
    if (hideUsed && !copied.includes(k.id)) {
      setFading((f) => [...f, k.id]);
      setTimeout(() => setFading((f) => f.filter((x) => x !== k.id)), 450);
    }
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
  const visible = hideUsed ? sorted.filter((k) => !copied.includes(k.id) || fading.includes(k.id)) : sorted;
  const stats = [
    { label: "Total Keys Shared", value: keys.length.toLocaleString(), icon: KeyRound },
    { label: "Active Users", value: (128 + keys.length * 3).toLocaleString(), icon: Users },
    { label: "Total Views", value: (2450 + keys.length * 17).toLocaleString(), icon: Eye },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="glass mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="truncate text-lg font-bold tracking-tight sm:text-xl">Nosuk key World</span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => setShowShare(true)} className="btn-glow" aria-label="Share App">
              <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Share App</span>
            </button>
            <button onClick={() => setShowModal(true)} className="btn-brand" aria-label="Submit Key">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Submit Key</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {stats.map((st) => (
            <div key={st.label} className="glass-pill flex items-center gap-3 px-5 py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
                <st.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold leading-tight text-gradient">{st.value}</div>
                <div className="truncate text-xs text-foreground/60 sm:text-sm">{st.label}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="glass mt-6 flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" /></span>
            Live Board
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground/70">
              <Switch checked={hideUsed} onCheckedChange={toggleHide} aria-label="Hide Used Keys" />
              Hide Used Keys
            </label>
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {([["newest", "Newest First"], ["active", "Active Keys"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSort(v)} className={sort === v ? "tab-active" : "tab"}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
        {loading ? (
          <p className="text-center text-foreground/60">Loading keys…</p>
        ) : visible.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
            {keys.length === 0 ? "No keys yet — be the first to share one!" : "You've used every key here. Check back soon!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visible.map((k) => {
              const used = copied.includes(k.id);
              const leaving = fading.includes(k.id);
              return (
                <div key={k.id} className={`glass card-interactive flex flex-col gap-4 rounded-2xl p-5 ${leaving ? "card-leave" : "card-enter"} ${used && !leaving ? "opacity-50" : ""}`}>
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
      </main>
      <Footer />

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="glass-strong relative w-full max-w-lg rounded-3xl p-7 animate-in fade-in zoom-in-95">
            <button type="button" onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-foreground/50 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-center text-2xl font-bold">Submit a new key</h2>
            <p className="mt-2 text-center text-sm text-foreground/70">Help pilgrims worldwide by sharing your valid Nosuk code.</p>
            <ul className="mt-5 space-y-2 rounded-2xl bg-muted/60 p-4 text-sm text-foreground/70">
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Paste only one valid, unused referral code.</li>
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Double-check it — fake codes are removed.</li>
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Your code appears on the Live Board instantly.</li>
            </ul>
            <label className="mt-5 block text-sm font-semibold" htmlFor="key-input">Your Nosuk code</label>
            <input
              id="key-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={500}
              placeholder="e.g. NSK-XXXX-XXXX"
              className="input-glass mt-2"
            />
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn-muted flex-1">Skip</button>
              <button disabled={submitting} className="btn-brand flex-1">{submitting ? "Submitting…" : "Submit Key"}</button>
            </div>
          </form>
        </div>
      )}

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = "Find free Nosuk referral codes on Nosuk key World!";
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  const items = [
    { label: "Facebook", icon: Facebook, cls: "share-facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "WhatsApp", icon: MessageCircle, cls: "share-whatsapp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "X (Twitter)", icon: Twitter, cls: "share-x", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: "Telegram", icon: Send, cls: "share-telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Website link copied!"); }
    catch { toast.error("Clipboard unavailable"); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong relative w-full max-w-md rounded-3xl p-7 animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute right-4 top-4 text-foreground/50 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          <Globe className="h-6 w-6" />
        </div>
        <h2 className="text-center text-2xl font-bold">Share with the World</h2>
        <p className="mt-2 text-center text-sm text-foreground/60">Help more pilgrims find free codes.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {items.map((i) => (
            <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" className={`share-btn ${i.cls}`}>
              <i.icon className="h-5 w-5" /> {i.label}
            </a>
          ))}
        </div>
        <button onClick={copyLink} className="btn-brand mt-3 w-full py-3"><Link2 className="h-5 w-5" /> Copy Website Link</button>
      </div>
    </div>
  );
}
