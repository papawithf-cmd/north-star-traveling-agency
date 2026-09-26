import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { EmptyState } from "@/routes/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYMENT_TYPES, fetchCategories, fetchPublicOpportunities } from "@/lib/site";

type Search = {
  q?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  type?: string | undefined;
  company?: string | undefined;
};


export const Route = createFileRoute("/opportunities/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search['q'] === "string" ? search['q'] : undefined,
    location: typeof search['location'] === "string" ? search['location'] : undefined,
    category: typeof search['category'] === "string" ? search['category'] : undefined,
    type: typeof search['type'] === "string" ? search['type'] : undefined,
    company: typeof search['company'] === "string" ? search['company'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Opportunities — SkyBridge Careers" },
      {
        name: "description",
        content:
          "Search and filter verified job opportunities by title, keyword, company, location, category, employment type and duration.",
      },
      { property: "og:title", content: "Browse Opportunities — SkyBridge Careers" },
      { property: "og:description", content: "Search verified vacancies across aviation, care, security and logistics." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/opportunities/" });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchPublicOpportunities,
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const set = (patch: Partial<Search>) =>
    navigate({ to: ".", search: (prev: Search) => ({ ...prev, ...patch }) });


  const results = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    const loc = (search.location ?? "").toLowerCase();
    return jobs.filter((j) => {
      const hay = `${j.title} ${j.description ?? ""} ${j.company?.name ?? ""}`.toLowerCase();
      const place = `${j.location ?? ""} ${j.city ?? ""} ${j.country ?? ""}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (loc && !place.includes(loc)) return false;
      if (search.category && j.category?.slug !== search.category) return false;
      if (search.type && j.employment_type !== search.type) return false;
      if (search.company && j.company?.slug !== search.company) return false;
      return true;
    });
  }, [jobs, search]);

  const hasFilters = Boolean(
    search.q || search.location || search.category || search.type || search.company,
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Opportunities"
        title="Browse all opportunities"
        subtitle="Filter verified vacancies by keyword, location, category and employment type."
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold">Filters</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="f-q">Keyword</Label>
              <Input
                id="f-q"
                value={search.q ?? ""}
                onChange={(e) => set({ q: e.target.value || undefined })}
                placeholder="Job title, company"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="f-loc">Location</Label>
              <Input
                id="f-loc"
                value={search.location ?? ""}
                onChange={(e) => set({ location: e.target.value || undefined })}
                placeholder="City or country"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={search.category ?? "all"}
                onValueChange={(v) => set({ category: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.filter((c) => c.active).map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Employment type</Label>
              <Select
                value={search.type ?? "all"}
                onValueChange={(v) => set({ type: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasFilters ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: ".", search: {} })}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        </aside>

        <section>
          <p className="mb-5 text-sm text-muted-foreground">
            {isLoading ? "Loading opportunities…" : `${results.length} opportunit${results.length === 1 ? "y" : "ies"} found`}
          </p>
          {!isLoading && results.length === 0 ? (
            <EmptyState text="No opportunities match your filters. Try clearing some filters." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {results.map((job) => (
                <OpportunityCard key={job.id} job={job as never} />
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
