import type { ReactNode } from "react";

import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string | undefined;
  eyebrow?: string | undefined;

}) {
  return (
    <section className="hero-gradient text-navy-foreground">
      <div className="container-page py-14 sm:py-16">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75 sm:text-base">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
