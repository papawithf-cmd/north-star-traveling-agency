import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";

import { fetchCategories, fetchSettings } from "@/lib/site";

export function Footer() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <footer className="mt-20 bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold">{settings?.site_name ?? "SkyBridge Careers"}</h3>
          <p className="mt-3 text-sm text-navy-foreground/70">
            {settings?.tagline ?? "Verified employment opportunities worldwide."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li><Link to="/opportunities" className="hover:text-accent">All Opportunities</Link></li>
            <li><Link to="/categories" className="hover:text-accent">Job Categories</Link></li>
            <li><Link to="/companies" className="hover:text-accent">Companies</Link></li>
            <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Categories</h4>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            {(categories ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            {settings?.phone ? (
              <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0" />{settings.phone}</li>
            ) : null}
            {settings?.whatsapp ? (
              <li className="flex items-start gap-2"><MessageCircle className="mt-0.5 size-4 shrink-0" />{settings.whatsapp}</li>
            ) : null}
            {settings?.email ? (
              <li className="flex items-start gap-2"><Mail className="mt-0.5 size-4 shrink-0" />{settings.email}</li>
            ) : null}
            {settings?.address ? (
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{settings.address}</li>
            ) : null}
            {settings?.business_hours ? (
              <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0" />{settings.business_hours}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings?.site_name ?? "SkyBridge Careers"}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-accent">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
