import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { bulkKeyRows } from "@/lib/bulk-keys";
import { supabase } from "@/integrations/supabase/client";
import { adminAddKey, adminBulkAddKeys, adminDeleteKey, adminLogin } from "@/lib/admin.functions";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Nosuk key World" },
      { name: "description", content: "Admin dashboard for managing Nusuk keys." },
      { property: "og:title", content: "Admin — Nosuk key World" },
      { property: "og:description", content: "Manage verified drops and remove spam keys." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Key = { id: string; key_value: string; is_admin_drop: boolean; created_at: string };
type Creds = { email: string; password: string };
const SS = "nusuk_admin";

function Admin() {
  const [creds, setCreds] = useState<Creds | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKey, setNewKey] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const submitBulkKeys = useServerFn(adminBulkAddKeys);

  useEffect(() => {
    const s = sessionStorage.getItem(SS);
    if (s) setCreds(JSON.parse(s));
  }, []);

  const load = async () => {
    const { data } = await supabase.from("nusuk_keys").select("*").order("created_at", { ascending: false });
    setKeys(data ?? []);
  };
  useEffect(() => { if (creds) load(); }, [creds]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin({ data: { email, password } });
      const c = { email, password };
      sessionStorage.setItem(SS, JSON.stringify(c));
      setCreds(c);
      toast.success("Welcome, admin");
    } catch {
      toast.error("Access denied");
    }
    setBusy(false);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds || !newKey.trim()) return;
    setBusy(true);
    try {
      await adminAddKey({ data: { ...creds, key_value: newKey.trim() } });
      toast.success("Verified key dropped");
      setNewKey("");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusy(false);
  };

  const del = async (id: string) => {
    if (!creds || !confirm("Delete this key?")) return;
    try {
      await adminDeleteKey({ data: { ...creds, id } });
      toast.success("Deleted");
      setKeys((k) => k.filter((x) => x.id !== id));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const logout = () => { sessionStorage.removeItem(SS); setCreds(null); };

  const bulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds || bulkBusy) return;
    try {
      bulkKeyRows(bulkInput);
      setBulkBusy(true);
      const result = await submitBulkKeys({ data: { ...creds, input: bulkInput } });
      toast.success(`Successfully added ${result.count} keys!`);
      setBulkInput("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk submission failed. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

  if (!creds) {
    return (
      <div className="flex min-h-screen flex-col bg-app">
        <div className="grid flex-1 place-items-center p-4">
          <form onSubmit={login} className="glass-strong w-full max-w-sm rounded-3xl p-7">
            <h1 className="text-2xl font-bold">Admin <span className="text-gradient">Login</span></h1>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-glass mt-5" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-glass mt-3" />
            <button disabled={busy} className="btn-brand mt-5 w-full">{busy ? "Checking…" : "Sign in"}</button>
            <Link to="/" className="mt-4 block text-center text-sm text-foreground/60">← Back to feed</Link>
          </form>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin <span className="text-gradient">Dashboard</span></h1>
          <div className="flex gap-2">
            <Link to="/" className="btn-muted">View feed</Link>
            <button onClick={logout} className="btn-muted"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>

        <form onSubmit={add} className="glass mt-6 flex flex-col gap-3 rounded-2xl p-5 sm:flex-row">
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} maxLength={500} placeholder="New verified key" className="input-glass flex-1" />
          <button disabled={busy} className="btn-brand"><ShieldCheck className="h-4 w-4" /> Drop Verified Key</button>
        </form>

        <form onSubmit={bulkAdd} className="mt-6 space-y-3 border-t border-input pt-6">
          <label htmlFor="bulk-keys" className="block font-semibold">Bulk Add Keys (একসাথে অনেকগুলো)</label>
          <textarea
            id="bulk-keys"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={"Paste keys separated by commas or new lines. Example: KEY-1, KEY-2\nKEY-3"}
            rows={6}
            disabled={bulkBusy}
            className="input-glass block min-h-36 resize-y"
          />
          <Button type="submit" disabled={bulkBusy} className="btn-brand h-auto w-full sm:w-auto">
            <ShieldCheck className="h-4 w-4" /> {bulkBusy ? "Submitting…" : "Bulk Submit Keys"}
          </Button>
        </form>

        <div className="glass mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full text-sm">
            <thead className="text-left text-foreground/60">
              <tr><th className="p-4">Key</th><th className="p-4">Type</th><th className="p-4">Created</th><th className="p-4" /></tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-border/60">
                  <td className="max-w-xs break-all p-4 font-mono">{k.key_value}</td>
                  <td className="p-4">{k.is_admin_drop ? <span className="badge-verified">Verified</span> : <span className="badge-community">Community</span>}</td>
                  <td className="whitespace-nowrap p-4 text-foreground/60">{new Date(k.created_at).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => del(k.id)} className="btn-danger"><Trash2 className="h-4 w-4" /> Delete</button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-foreground/60">No keys yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
