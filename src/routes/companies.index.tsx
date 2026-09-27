import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, Building2, MapPin } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState } from "@/routes/index";
import { companyLogoUrl, fetchCompanies, fetchPublicOpportunities } from "@/lib/site";

export const Route = createFileRoute("/companies/")({
  head: () => ({
    meta: [
      { title: "Employers & Companies — Northstar Traveling Agency" },
      {
        name: "description",
        content: "Browse verified employers hiring through Northstar Traveling Agency and see their open vacancies.",
      },
      { property: "og:title", content: "Employers & Companies — Northstar Traveling Agency" },
      { property: "og:description", content: "Verified employers and their current openings." },
    ],
  }),
  component: CompaniesPage,
});

function CompanyLogo({
  logo,
  name,
  website,
}: {
  logo?: string | null;
  name: string;
  website?: string | null;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sourceIndex === 0 ? logo : sourceIndex === 1 ? companyLogoUrl({ website }) : null;

  if (!source) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Building2 className="size-5" />
      </span>
    );
  }

  return (
    <img
      src={source}
      alt={name + " company logo"}
      className="size-12 shrink-0 rounded-lg border border-border bg-white object-contain p-1"
      loading="lazy"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

function CompaniesPage() {
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });

  return (
    <SiteLayout>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1496686941088-eaa405ad5fbb?auto=format&fit=crop&fm=jpg&q=80&w=2400)",
          }}
        />
        <div className="relative">
          <PageHeader
            eyebrow="Employers"
            title="Companies"
            subtitle="Employers currently advertising verified opportunities."
          />
          <div className="container-page py-12">
            {companies.length === 0 ? (
              <EmptyState text="No companies have been added yet." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((c) => {
                  const count = jobs.filter((j) => j.company?.slug === c.slug).length;
                  return (
                    <Link
                      key={c.id}
                      to="/companies/$slug"
                      params={{ slug: c.slug }}
                      className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo logo={c.logo_verified ? c.logo : null} name={c.name} website={c.website} />
                        <div>
                          <h2 className="font-display text-base font-bold">{c.name}</h2>
                          {c.industry ? <p className="text-xs text-muted-foreground">{c.industry}</p> : null}
                        </div>
                      </div>
                      {c.description ? (
                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-4" /> {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                        </span>
                        {c.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                            <BadgeCheck className="size-4" /> Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-secondary">{count} open {count === 1 ? "role" : "roles"}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
