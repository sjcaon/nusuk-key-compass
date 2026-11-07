import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-app">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/" className="text-sm text-foreground/60 hover:text-foreground">← Back to Live Board</Link>
        <div className="glass mt-4 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-gradient">{title}</h1>
          <div className="mt-4 space-y-3 text-foreground/75">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
