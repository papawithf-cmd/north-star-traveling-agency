import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SkyBridge Careers" },
      { name: "description", content: "How SkyBridge Careers collects, uses and protects personal information submitted through the website." },
      { property: "og:title", content: "Privacy Policy — SkyBridge Careers" },
      { property: "og:description", content: "Our approach to personal data and enquiries." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-foreground/85">
          <p>
            This policy explains how information submitted through this website is handled. It is provided as a
            starting point and should be reviewed by the site owner before publication.
          </p>
          <Section title="Information we collect">
            We collect the name, email address, phone number and message content you submit through the contact
            form. Administrators may store internal notes relating to your enquiry.
          </Section>
          <Section title="How information is used">
            Enquiry details are used to respond to your message and to manage the opportunities published on this
            site. We do not sell personal information.
          </Section>
          <Section title="Applications to employers">
            When you apply for an opportunity you contact the employer directly using the method they published.
            Any information you send is handled under that employer's own policies.
          </Section>
          <Section title="Data retention">
            Enquiries are retained in the administration portal until they are archived or deleted by an
            administrator.
          </Section>
          <Section title="Contact">
            For questions about this policy, or to request removal of your details, use the contact page.
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
