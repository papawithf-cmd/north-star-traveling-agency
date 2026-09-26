import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { EmptyState } from "@/routes/index";
import { fetchCompanies, fetchPublicOpportunities } from "@/lib/site";

export const Route = createFileRoute("/companies/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Employer profile | SkyBridge Careers` },
      { name: "description", content: "Employer profile and current vacancies on SkyBridge Careers." },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — Employer profile` },
      { property: "og:description", content: "See open roles from this verified employer." },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  const { slug } = Route.useParams();
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });

  const company = companies.find((c) => c.slug === slug);
  const list = jobs.filter((j) => j.company?.slug === slug);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Employer"
        title={company?.name ?? slug.replace(/-/g, " ")}
        {...(company?.description ? { subtitle: company.description } : {})}
      />
      <div className="container-page py-12">
        {company ? (
          <div className="mb-10 grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 lg:grid-cols-3">
            {company.city || company.country ? (
              <Info icon={<MapPin className="size-4" />} label="Location" value={[company.city, company.country].filter(Boolean).join(", ")} />
            ) : null}
            {company.industry ? <Info icon={<BadgeCheck className="size-4" />} label="Industry" value={company.industry} /> : null}
            {company.phone ? <Info icon={<Phone className="size-4" />} label="Phone" value={company.phone} /> : null}
            {company.whatsapp ? <Info icon={<MessageCircle className="size-4" />} label="WhatsApp" value={company.whatsapp} /> : null}
            {company.email ? <Info icon={<Mail className="size-4" />} label="Email" value={company.email} /> : null}
            {company.website ? <Info icon={<Globe className="size-4" />} label="Website" value={company.website} /> : null}
          </div>
        ) : null}

        <h2 className="mb-6 font-display text-2xl font-bold">Open opportunities</h2>
        {list.length === 0 ? (
          <EmptyState text="This employer has no open vacancies right now." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((job) => (
              <OpportunityCard key={job.id} job={job as never} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-secondary">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
