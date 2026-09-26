import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, HeartHandshake, ShieldCheck, Target } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { fetchSettings } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — SkyBridge Careers" },
      {
        name: "description",
        content:
          "SkyBridge Careers connects professionals with verified employers across aviation, caregiving, security, courier and delivery industries.",
      },
      { property: "og:title", content: "About SkyBridge Careers" },
      { property: "og:description", content: "How we verify and publish employment opportunities." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About us"
        title={`About ${settings?.site_name ?? "SkyBridge Careers"}`}
        subtitle={settings?.tagline ?? "Verified employment opportunities worldwide."}
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/85">
            {settings?.about_text ??
              "We publish employment and career opportunities from employers across aviation, caregiving, security, courier and delivery industries. Every listing is reviewed by our team before publication."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Reviewed listings", body: "Each vacancy passes an internal review before it appears publicly." },
            { icon: BadgeCheck, title: "Verified employers", body: "Employer details are checked and marked as verified where confirmed." },
            { icon: Target, title: "Clear expectations", body: "Duration, requirements and documents are published up front." },
            { icon: HeartHandshake, title: "Direct contact", body: "Applicants reach employers through the method the employer chose." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
