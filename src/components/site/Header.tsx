import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X, Plane, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { fetchSettings } from "@/lib/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/categories", label: "Job Categories" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-foreground">
              {settings?.site_name ?? "SkyBridge Careers"}
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Verified opportunities
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Search opportunities">
            <Link to="/opportunities">
              <Search className="size-4" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/apply" search={{ job: "" }}>
              Apply Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">
              <Shield className="mr-1.5 size-4" /> Admin Login
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/apply"
              search={{ job: "" }}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-accent px-3 py-2.5 text-center text-sm font-semibold text-accent-foreground"
            >
              Apply Now
            </Link>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
