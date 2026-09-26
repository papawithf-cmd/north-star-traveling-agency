import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { EmptyState } from "@/routes/index";
import { fetchCategories, fetchPublicOpportunities } from "@/lib/site";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} jobs — SkyBridge Careers` },
      {
        name: "description",
        content: `Current verified vacancies in the ${params.slug.replace(/-/g, " ")} category.`,
      },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} jobs — SkyBridge Careers` },
      { property: "og:description", content: "Verified vacancies updated regularly." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });

  const category = categories.find((c) => c.slug === slug);
  const list = jobs.filter((j) => j.category?.slug === slug);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Category"
        title={category?.name ?? slug.replace(/-/g, " ")}
        subtitle={category?.description ?? undefined}
      />
      <div className="container-page py-12">
        {list.length === 0 ? (
          <EmptyState text="No open opportunities in this category right now." />
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
