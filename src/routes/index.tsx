import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Building2, Search, ShieldCheck, Users } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryImage, fetchCategories, fetchPublicOpportunities } from "@/lib/site";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyBridge Careers — Verified Jobs in Aviation, Care & Security" },
      {
        name: "description",
        content:
          "Discover verified employment opportunities across aviation, caregiving, security, courier and delivery industries. Search jobs by location, category and contract duration.",
      },
      { property: "og:title", content: "SkyBridge Careers — Verified Job Opportunities" },
      {
        property: "og:description",
        content:
          "Explore verified employment opportunities across aviation, caregiving, security, courier and delivery industries.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });

  const featured = jobs.filter((j) => j.featured).slice(0, 6);
  const list = (featured.length ? featured : jobs.slice(0, 6)) as never[];

  const activeCategories = categories.filter((c) => c.active);

  function search() {
    navigate({
      to: "/opportunities",
      search: { q: q || undefined, location: location || undefined, category: category === "all" ? undefined : category },
    });
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden hero-gradient text-navy-foreground">
        <img
          src={heroImage}
          alt="Aviation, caregiving and security professionals at an airport terminal"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative container-page py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            <ShieldCheck className="size-3.5" /> Verified employers only
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-balance-tight sm:text-5xl lg:text-6xl">
            Discover Your Next Career Opportunity
          </h1>
          <p className="mt-5 max-w-2xl text-base text-navy-foreground/80 sm:text-lg">
            Explore verified employment opportunities across aviation, caregiving, security, courier,
            delivery and other industries.
          </p>

          <div className="mt-9 rounded-2xl border border-white/15 bg-background/95 p-4 shadow-lift sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jobs, keywords, companies"
                aria-label="Search jobs"
                className="h-12"
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location or country"
                aria-label="Location"
                className="h-12"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 w-full" aria-label="Category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {activeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={search} size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                <Search className="mr-2 size-4" /> Search Opportunities
              </Button>
            </div>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            <Stat icon={<Users className="size-4" />} label="Live opportunities" value={String(jobs.length)} />
            <Stat icon={<Building2 className="size-4" />} label="Categories" value={String(activeCategories.length)} />
            <Stat icon={<BadgeCheck className="size-4" />} label="Verified roles" value={String(jobs.filter((j) => j.verified).length)} />
          </dl>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Opportunities"
          title="Featured Opportunities"
          action={{ to: "/opportunities", label: "View all" }}
        />
        {list.length === 0 ? (
          <EmptyState text="No published opportunities yet. Please check back soon." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((job: never) => (
              <OpportunityCard key={(job as { id: string }).id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Browse by field"
            title="Job Categories"
            action={{ to: "/categories", label: "All categories" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.slice(0, 6).map((c) => {
              const count = jobs.filter((j) => j.category?.slug === c.slug).length;
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={categoryImage(c.slug, c.image)}
                      alt={c.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{c.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {count} {count === 1 ? "opportunity" : "opportunities"}
                      </span>
                      <span className="inline-flex items-center font-semibold text-secondary">
                        View Jobs <ArrowRight className="ml-1 size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Verified listings", body: "Every published vacancy is reviewed and approved by our team before it goes live." },
            { title: "Clear requirements", body: "Age, education, experience, documents and duration are stated up front." },
            { title: "Direct applications", body: "Apply by email, phone, WhatsApp or the employer's own application link." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-navy-foreground/60">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { to: "/opportunities" | "/categories" | "/companies"; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1.5 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Button asChild variant="outline">
          <Link to={action.to}>
            {action.label} <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
