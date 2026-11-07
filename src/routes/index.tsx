import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, KeyRound, ShieldCheck, Plus, Users, Eye, ExternalLink, Share2, X, Globe, Facebook, MessageCircle, Twitter, Send, Link2, HeartHandshake, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BenefitsModal } from "@/components/BenefitsModal";
import logo from "@/assets/nosuk-mark.asset.json";
import wordmark from "@/assets/nosuk-wordmark.asset.json";
import { COPIED_STORAGE as LS, HIDE_STORAGE as HIDE, SHARE_URL, readCopied, readHideUsed, sortKeys, visibleKeys } from "@/lib/key-board";

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
  const [hideUsed, setHideUsed] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fading, setFading] = useState<string[]>([]);
  const toggleHide = (v: boolean) => { setHideUsed(v); try { localStorage.setItem(HIDE, v ? "1" : "0"); } catch { toast.error("Your preference could not be saved."); } };
  const [sort, setSort] = useState<"newest" | "active">("newest");

  const load = async () => {
    const { data, error } = await supabase
      .from("nusuk_keys")
      .select("*")
      .order("created_at", { ascending: false });
    setLoadError(Boolean(error));
    if (error) toast.error("Could not load keys");
    else setKeys(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    try {
      setCopied(readCopied(localStorage.getItem(LS)));
      setHideUsed(readHideUsed(localStorage.getItem(HIDE)));
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
    try { localStorage.setItem(LS, JSON.stringify(next)); } catch { toast.error("Copied, but tracking could not be saved on this device."); }
  };

  const sorted = sortKeys(keys, copied, sort === "active");
  const visible = visibleKeys(sorted, copied, hideUsed, fading);
  const stats = [
    { label: "Total Shared", value: keys.length.toLocaleString(), icon: KeyRound },
    { label: "Active Users", value: "—", icon: Users },
    { label: "Total Views", value: "—", icon: Eye },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="glass mx-auto grid max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <img src={logo.url} alt="" className="brand-mark shrink-0" />
            <span className="text-sm font-bold leading-tight sm:text-xl">Nosuk key World</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setShowShare(true)} className="btn-glow" aria-label="Share App">
              <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Share App</span>
            </Button>
            <Button variant="ghost" onClick={() => setShowModal(true)} className="btn-brand" aria-label="Add Key">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Key</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 sm:px-6">
        <section className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0"><img src={wordmark.url} alt="Nosuk key World — Global Umrah Competition Hub" className="brand-wordmark" /></div>
          <Button variant="outline" className="btn-glow" onClick={() => setShowBenefits(true)}><HeartHandshake /> Benefits</Button>
        </section>
        <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          {stats.map((st) => (
            <div key={st.label} className="glass-pill flex min-w-0 flex-col items-center gap-2 px-2 py-3 sm:flex-row sm:gap-3 sm:px-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
                <st.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-extrabold leading-tight text-gradient sm:text-2xl">{st.value}</div>
                <div className="text-center text-[11px] text-muted-foreground sm:text-left sm:text-sm">{st.label}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-col gap-3 border-b border-input pb-4 sm:flex-row sm:items-center sm:justify-between">
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
                <Button variant="ghost" key={v} onClick={() => setSort(v)} className={sort === v ? "tab-active" : "tab"}>{l}</Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
        {loading ? (
          <p className="text-center text-foreground/60">Loading keys…</p>
        ) : loadError ? (
          <div className="py-10 text-center"><p>Keys could not be loaded.</p><Button className="mt-3" onClick={() => { setLoading(true); load(); }}>Try again</Button></div>
        ) : visible.length === 0 ? (
          <div className="mx-auto max-w-md p-8 text-center">
            {keys.length === 0 ? "No keys yet — be the first to share one!" : "You've used every key here. Check back soon!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visible.map((k) => {
              const used = copied.includes(k.id);
              const leaving = fading.includes(k.id);
              return (
                <div key={k.id} className={`glass card-interactive flex flex-col gap-4 rounded-lg p-4 ${leaving ? "card-leave" : "card-enter"} ${used && !leaving ? "opacity-50" : ""}`}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="text-sm font-semibold text-foreground/70">Referral Code</span>
                    <span className="text-xs text-foreground/50">{timeAgo(k.created_at)}</span>
                  </div>
                  {k.is_admin_drop && (
                    <span className="badge-verified self-start"><ShieldCheck className="h-3.5 w-3.5" /> Verified Admin Drop</span>
                  )}
                  <div className="code-box">{k.key_value}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" onClick={() => copy(k)} className={`${used ? "btn-muted" : "btn-brand"} key-action`}>
                      {used ? <><Check className="h-4 w-4" /> Used</> : <><Copy className="h-4 w-4" /> Copy Code</>}
                    </Button>
                    <Button asChild variant="outline" className="btn-muted key-action"><a href={NUSUK_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> Open Nusuk App
                    </a></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
        <section className="mt-12 border-t border-input py-8" aria-labelledby="how-to-use">
          <h2 id="how-to-use" className="text-xl font-bold">How to Use</h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {[{ icon: Copy, title: "Copy Key", text: "Choose a fresh referral code." }, { icon: ExternalLink, title: "Open Nusuk App", text: "Continue to the official Nusuk platform." }, { icon: Check, title: "Paste & Redeem", text: "Enter your code in the eligible programme." }].map((step, index) => <li key={step.title} className="flex min-w-0 items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/40 bg-gold/10 text-gold"><step.icon className="h-5 w-5" /></div><div><h3 className="font-semibold"><span className="text-muted-foreground">{index + 1}.</span> {step.title}</h3><p className="mt-1 text-sm text-muted-foreground">{step.text}</p></div></li>)}
          </ol>
        </section>
      </main>
      <Footer />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-strong max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg p-7">
          <DialogTitle className="text-center text-2xl">Add a new key</DialogTitle>
          <DialogDescription className="text-center">Help pilgrims worldwide by sharing your valid Nosuk code.</DialogDescription>
          <form onSubmit={submit}>
            <ul className="space-y-2 py-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Share one valid, unused referral code.</li>
              <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Double-check it — fake codes are removed.</li>
            </ul>
            <label className="mt-3 block text-sm font-semibold" htmlFor="key-input">Your Nosuk code</label>
            <input id="key-input" required value={value} onChange={(e) => setValue(e.target.value)} maxLength={500} placeholder="e.g. NSK-XXXX-XXXX" className="input-glass mt-2" />
            <div className="mt-5 flex gap-3"><Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1">Skip</Button><Button disabled={submitting} className="btn-brand flex-1">{submitting ? "Submitting…" : "Add Key"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      <BenefitsModal open={showBenefits} onOpenChange={setShowBenefits} />
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const url = SHARE_URL;
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
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="glass-strong max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg p-7">
        <DialogTitle className="text-center text-2xl">Share with the World</DialogTitle>
        <DialogDescription className="text-center">Help more pilgrims find free codes.</DialogDescription>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {items.map((i) => (
            <Button key={i.label} asChild className={`share-btn ${i.cls} h-auto whitespace-normal`}><a href={i.href} target="_blank" rel="noopener noreferrer">
              <i.icon className="h-5 w-5" /> {i.label}
            </a></Button>
          ))}
        </div>
        <Button variant="ghost" onClick={copyLink} className="btn-brand mt-3 w-full py-3"><Link2 className="h-5 w-5" /> Copy Link</Button>
      </DialogContent>
    </Dialog>
  );
}
