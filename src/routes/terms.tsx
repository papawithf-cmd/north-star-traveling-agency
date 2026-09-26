import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — SkyBridge Careers" },
      { name: "description", content: "Terms governing the use of the SkyBridge Careers opportunities website." },
      { property: "og:title", content: "Terms & Conditions — SkyBridge Careers" },
      { property: "og:description", content: "Rules for using this opportunities website." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-foreground/85">
          <p>
            These terms are provided as a starting point and should be reviewed by the site owner before
            publication.
          </p>
          <Section title="Use of the site">
            This website publishes employment and career opportunities. Listings are reviewed before publication,
            but applicants remain responsible for verifying details directly with the employer.
          </Section>
          <Section title="No fees for applicants">
            Unless clearly stated by an employer, applying to an opportunity listed here is free. Never send money
            in response to a listing without independently verifying the request.
          </Section>
          <Section title="Accuracy of listings">
            Employers supply vacancy information. While listings are reviewed, we do not guarantee the accuracy,
            availability or outcome of any opportunity.
          </Section>
          <Section title="Content and intellectual property">
            Content on this site may not be copied or republished without permission.
          </Section>
          <Section title="Changes">
            These terms may be updated at any time. Continued use of the site constitutes acceptance of the
            current terms.
          </Section>
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
