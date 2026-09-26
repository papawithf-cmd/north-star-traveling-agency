import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState } from "@/routes/index";
import { categoryImage, fetchCategories, fetchPublicOpportunities } from "@/lib/site";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Job Categories — SkyBridge Careers" },
      {
        name: "description",
        content:
          "Explore job categories including cabin crew, airmen, ground crew, caregivers, security, private courier and delivery roles.",
      },
      { property: "og:title", content: "Job Categories — SkyBridge Careers" },
      { property: "og:description", content: "Browse verified opportunities by professional field." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });
  const active = categories.filter((c) => c.active);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Categories"
        title="Job Categories"
        subtitle="Choose a professional field to see the opportunities currently open."
      />
      <div className="container-page py-12">
        {active.length === 0 ? (
          <EmptyState text="No categories have been published yet." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => {
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
                    <h2 className="font-display text-lg font-bold">{c.name}</h2>
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
        )}
      </div>
    </SiteLayout>
  );
}
