import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Users,
  X,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { OPPORTUNITY_SELECT, PUBLIC_STATUSES, categoryImage, formatDate, mediaUrl } from "@/lib/site";

export const Route = createFileRoute("/opportunities/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — SkyBridge Careers` },
      {
        name: "description",
        content: `Full details, requirements, duration and application instructions for this verified vacancy.`,
      },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — SkyBridge Careers` },
      { property: "og:description", content: "Verified vacancy details and application instructions." },
    ],
  }),
  component: OpportunityDetail,
});

async function fetchOpportunity(slug: string) {
  const { data, error } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_SELECT)
    .eq("slug", slug)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: images } = await supabase
    .from("opportunity_images")
    .select("*")
    .eq("opportunity_id", data.id)
    .order("display_order");
  return { ...data, images: images ?? [] };
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="border-b border-border/70 py-2.5">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{String(value)}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{body}</div>
    </section>
  );
}

function OpportunityDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["opportunity", slug],
    queryFn: () => fetchOpportunity(slug),
  });
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center text-muted-foreground">Loading opportunity…</div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Opportunity not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This vacancy may have been closed or removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/opportunities">Browse opportunities</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const job = data;
  const images: { id: string; image_url: string; caption: string | null }[] = job.images.length
    ? job.images.map((img) => ({ ...img, image_url: mediaUrl(img.image_url) ?? img.image_url }))
    : [{ id: "fallback", image_url: categoryImage(job.category?.slug), caption: null }];
  const current = images[Math.min(active, images.length - 1)]!;

  const applyHref = (() => {
    switch (job.application_method) {
      case "email":
        return job.application_email ? `mailto:${job.application_email}?subject=${encodeURIComponent(job.title)}` : null;
      case "phone":
        return job.application_phone ? `tel:${job.application_phone}` : null;
      case "whatsapp":
        return job.application_whatsapp
          ? `https://wa.me/${job.application_whatsapp.replace(/[^0-9]/g, "")}`
          : null;
      default:
        return job.application_url || job.contact_website || null;
    }
  })();

  return (
    <SiteLayout>
      <section className="hero-gradient text-navy-foreground">
        <div className="container-page py-12">
          <Link to="/opportunities" className="inline-flex items-center text-sm text-navy-foreground/70 hover:text-accent">
            <ChevronLeft className="mr-1 size-4" /> All opportunities
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.urgent ? <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge> : null}
            {job.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
            {job.verified ? (
              <Badge className="bg-success text-success-foreground">
                <BadgeCheck className="mr-1 size-3.5" /> Verified
              </Badge>
            ) : null}
            {job.category ? <Badge variant="outline" className="border-white/30 text-navy-foreground">{job.category.name}</Badge> : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold sm:text-4xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-foreground/80">
            {job.company ? (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-4" />
                <Link to="/companies/$slug" params={{ slug: job.company.slug }} className="hover:text-accent">
                  {job.company.name}
                </Link>
              </span>
            ) : null}
            {job.location || job.city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {[job.location ?? job.city, job.country].filter(Boolean).join(", ")}
              </span>
            ) : null}
            {job.duration ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {job.duration}
              </span>
            ) : null}
            {job.deadline ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                Closes {formatDate(job.deadline)}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="block aspect-[16/9] w-full overflow-hidden"
              aria-label="Open image gallery"
            >
              <img src={current.image_url} alt={current.caption ?? job.title} className="size-full object-cover" />
            </button>
            {current.caption ? (
              <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{current.caption}</p>
            ) : null}
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`size-16 shrink-0 overflow-hidden rounded-md border-2 ${i === active ? "border-accent" : "border-transparent"}`}
                  >
                    <img src={img.image_url} alt={img.caption ?? ""} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Block title="Job Description" body={job.description} />
          <Block title="Responsibilities" body={job.responsibilities} />
          <Block title="Qualifications" body={job.qualifications} />
          <Block title="Benefits" body={job.benefits} />

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Requirements</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              <Field label="Minimum age" value={job.min_age} />
              <Field label="Maximum age" value={job.max_age} />
              <Field label="Education" value={job.education} />
              <Field label="Experience" value={job.experience} />
              <Field label="Skills" value={job.skills} />
              <Field label="Languages" value={job.languages} />
              <Field label="Certificates" value={job.certificates} />
              <Field label="Physical requirements" value={job.physical_requirements} />
              <Field label="Driver's licence" value={job.drivers_license} />
              <Field label="Passport" value={job.passport_required} />
              <Field label="Other requirements" value={job.other_requirements} />
            </dl>
            {job.requirements ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{job.requirements}</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Duration &amp; Location</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              <Field label="Contract duration" value={job.contract_duration ?? job.duration} />
              <Field label="Permanent / temporary" value={job.permanence} />
              <Field label="Probation period" value={job.probation} />
              <Field label="Expected start date" value={formatDate(job.start_date)} />
              <Field label="Country" value={job.country} />
              <Field label="City" value={job.city} />
              <Field label="Workplace" value={job.workplace} />
              <Field label="Address" value={job.location} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Application Information</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              <Field label="Application method" value={job.application_method} />
              <Field label="Contact person" value={job.contact_person} />
              <Field label="Phone" value={job.contact_phone ?? job.application_phone} />
              <Field label="WhatsApp" value={job.contact_whatsapp ?? job.application_whatsapp} />
              <Field label="Email" value={job.contact_email ?? job.application_email} />
              <Field label="Website" value={job.contact_website ?? job.application_url} />
            </dl>
            {job.application_instructions ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Instructions</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground/85">{job.application_instructions}</p>
              </div>
            ) : null}
            {job.required_documents ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Required documents</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground/85">{job.required_documents}</p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            {job.salary ? (
              <p className="font-display text-2xl font-bold">
                {job.salary} <span className="text-base font-medium text-muted-foreground">{job.currency ?? ""}</span>
              </p>
            ) : null}
            <dl className="mt-2">
              <Field label="Employment type" value={job.employment_type} />
              <Field label="Vacancies" value={job.vacancies} />
              <Field label="Posted" value={formatDate(job.published_at ?? job.created_at)} />
              <Field label="Last updated" value={formatDate(job.updated_at)} />
              <Field label="Application deadline" value={formatDate(job.deadline)} />
              <Field label="Status" value={job.status} />
            </dl>

            <Button asChild size="lg" className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/apply" search={{ job: job.slug }}>
                Apply Now
              </Link>
            </Button>
            {applyHref ? (
              <Button asChild variant="outline" size="lg" className="mt-3 w-full">
                <a href={applyHref} target="_blank" rel="noopener noreferrer">
                  Apply directly with employer
                </a>
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-base font-bold">Quick contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {job.contact_phone ? (
                <li className="flex items-center gap-2"><Phone className="size-4 text-secondary" />{job.contact_phone}</li>
              ) : null}
              {job.contact_whatsapp ? (
                <li className="flex items-center gap-2"><MessageCircle className="size-4 text-secondary" />{job.contact_whatsapp}</li>
              ) : null}
              {job.contact_email ? (
                <li className="flex items-center gap-2"><Mail className="size-4 text-secondary" />{job.contact_email}</li>
              ) : null}
              {job.contact_website ? (
                <li className="flex items-center gap-2"><Globe className="size-4 text-secondary" />{job.contact_website}</li>
              ) : null}
              {job.vacancies ? (
                <li className="flex items-center gap-2"><Users className="size-4 text-secondary" />{job.vacancies} vacancies</li>
              ) : null}
              {job.start_date ? (
                <li className="flex items-center gap-2"><CalendarDays className="size-4 text-secondary" />Starts {formatDate(job.start_date)}</li>
              ) : null}
            </ul>
            {!job.contact_phone && !job.contact_email && !job.contact_whatsapp && !job.contact_website ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Contact details are published by the employer when available.
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close gallery"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white"
          >
            <ChevronLeft className="size-6" />
          </button>
          <figure className="max-h-full max-w-4xl">
            <img src={current.image_url} alt={current.caption ?? job.title} className="max-h-[80vh] w-full object-contain" />
            {current.caption ? (
              <figcaption className="mt-3 text-center text-sm text-white/70">{current.caption}</figcaption>
            ) : null}
          </figure>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setActive((i) => (i + 1) % images.length)}
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      ) : null}
    </SiteLayout>
  );
}
