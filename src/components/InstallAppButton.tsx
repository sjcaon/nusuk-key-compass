import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canOfferInstall } from "@/lib/pwa-policy";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const syncDisplay = () => setStandalone(display.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    syncDisplay();
    display.addEventListener("change", syncDisplay);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      display.removeEventListener("change", syncDisplay);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!canOfferInstall(Boolean(prompt), standalone, installed)) return null;
  const install = async () => {
    if (!prompt || busy) return;
    setBusy(true);
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { /* The browser may withdraw a prompt; keep the board usable. */ }
    finally { setPrompt(null); setBusy(false); }
  };
  return <Button variant="outline" className="btn-muted" aria-label="Install App" title="Install App" disabled={busy} onClick={install}><Download className="h-4 w-4" /><span className="hidden sm:inline">Install App</span></Button>;
}