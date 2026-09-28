import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";

import { fetchCategories, fetchSettings, northstarWhatsAppUrl } from "@/lib/site";

export function Footer() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1.1fr] lg:py-20">
        <div className="max-w-sm">
          <h3 className="font-display text-xl font-bold tracking-normal">{settings?.site_name ?? "Northstar Traveling Agency"}</h3>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/70">
            {settings?.tagline ?? "Verified employment opportunities worldwide."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-normal text-accent">Explore</h4>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/75">
            <li><Link to="/opportunities" className="hover:text-accent">All Opportunities</Link></li>
            <li><Link to="/categories" className="hover:text-accent">Job Categories</Link></li>
            <li><Link to="/companies" className="hover:text-accent">Companies</Link></li>
            <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-normal text-accent">Categories</h4>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/75">
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
          <h4 className="text-sm font-semibold uppercase tracking-normal text-accent">Get in touch</h4>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-navy-foreground/75">
            <li>
              <div className="mb-2 flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span className="font-semibold text-navy-foreground">Call us</span>
              </div>
              <div className="ml-6 space-y-1.5">
                {[
                  { label: "+254 762 932 660", href: "tel:+254762932660" },
                  { label: "+254 140 863 587", href: "tel:+254140863587" },
                  { label: "+254 100 922 332", href: "tel:+254100922332" },
                ].map((phone) => (
                  <a key={phone.href} href={phone.href} className="block hover:text-accent hover:underline">
                    {phone.label}
                  </a>
                ))}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 size-4 shrink-0" />
              <a href={northstarWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
                WhatsApp Us
              </a>
            </li>
            <li className="flex items-start gap-2 break-all">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href="mailto:northstaragencyweb@gmail.com" className="hover:text-accent hover:underline">
                northstaragencyweb@gmail.com
              </a>
            </li>
            {settings?.address ? (
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{settings.address}</li>
            ) : null}
            {settings?.business_hours ? (
              <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0" />{settings.business_hours}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-center text-xs text-navy-foreground/60 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {settings?.site_name ?? "Northstar Traveling Agency"}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-accent">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
