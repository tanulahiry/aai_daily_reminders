import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="serif text-xl tracking-tight">
            Aai
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground [&.active]:text-foreground">
              Setup
            </Link>
            <Link to="/moment" className="hover:text-foreground [&.active]:text-foreground">
              Today
            </Link>
            <Link to="/rhythm" className="hover:text-foreground [&.active]:text-foreground">
              Your Rhythm
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
