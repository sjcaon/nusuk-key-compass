import { Link } from "@tanstack/react-router";
import logo from "@/assets/nosuk-mark.asset.json";

export function Footer() {
  return (
    <footer className="px-4 pb-4 pt-16 sm:px-6">
      <div className="mx-auto max-w-screen-2xl border-t border-input px-2 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="" className="brand-mark" />
            <span className="text-lg font-bold">Nosuk key World</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-foreground/70">
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/community" className="hover:text-primary">Global Community</Link>
            <Link to="/admin" className="hover:text-primary">Admin</Link>
          </nav>
        </div>
        <div className="mt-6 border-t border-foreground/10 pt-5 text-center text-sm text-foreground/70">
          Developed by <span className="font-semibold text-foreground">Shoibur Rahman</span> | Support:{" "}
          <a href="tel:+8801752200299" className="font-semibold text-gradient">+880 1752-200299</a>
          <div className="mt-1 text-xs text-foreground/50">© {new Date().getFullYear()} Nosuk key World. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
