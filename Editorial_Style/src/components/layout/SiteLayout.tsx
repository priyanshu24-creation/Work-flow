import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Standard page shell. `flush` removes the top padding for full-bleed heroes. */
export function SiteLayout({ children, flush = false }: { children: ReactNode; flush?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header overHero={flush} />
      <main className={flush ? "flex-1" : "flex-1 pt-16 md:pt-20"}>{children}</main>
      <Footer />
    </div>
  );
}
