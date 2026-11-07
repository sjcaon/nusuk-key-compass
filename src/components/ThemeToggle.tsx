import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let next = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try { const saved = localStorage.getItem("nosuk_theme"); if (saved) next = saved === "dark"; } catch {}
    setDark(next); document.documentElement.classList.toggle("dark", next);
  }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); try { localStorage.setItem("nosuk_theme", next ? "dark" : "light"); } catch {} };
  return <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>{dark ? <Sun /> : <Moon />}</Button>;
}