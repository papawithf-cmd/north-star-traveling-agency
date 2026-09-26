import { Link } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, CalendarClock, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryImage, formatDate } from "@/lib/site";

export type OpportunityRow = {
  id: string;
  title: string;
  slug: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  employment_type?: string | null;
  duration?: string | null;
  salary?: string | null;
  currency?: string | null;
  deadline?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  featured?: boolean | null;
  urgent?: boolean | null;
  verified?: boolean | null;
  category?: { name: string; slug: string } | null;
  company?: { name: string; slug: string; verified?: boolean | null } | null;
  primary_image?: string | null;
  images?: { image_url: string; display_order?: number | null; is_primary?: boolean | null }[] | null;
};

export function OpportunityCard({ job }: { job: OpportunityRow }) {
  const gallery = [...(job.images ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  const primary = gallery.find((i) => i.is_primary) ?? gallery[0];
  const image = categoryImage(job.category?.slug, job.primary_image ?? primary?.image_url);
  const posted = formatDate(job.published_at ?? job.created_at);
  const closes = formatDate(job.deadline);
  const isNew =
    !!(job.published_at ?? job.created_at) &&
    Date.now() - new Date(job.published_at ?? job.created_at!).getTime() < 1000 * 60 * 60 * 24 * 14;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image}
          alt={job.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {job.urgent ? <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge> : null}
          {job.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
          {isNew ? <Badge className="bg-secondary text-secondary-foreground">New</Badge> : null}
        </div>
        {job.verified ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-success">
            <BadgeCheck className="size-3.5" /> Verified
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {job.category ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            {job.category.name}
          </span>
        ) : null}
        <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-foreground">
          {job.title}
        </h3>
        {job.company ? (
          <p className="mt-1 text-sm text-muted-foreground">{job.company.name}</p>
        ) : null}

        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {job.location || job.city || job.country ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-secondary" />
              {[job.location ?? job.city, job.country].filter(Boolean).join(", ")}
            </li>
          ) : null}
          {job.employment_type ? (
            <li className="flex items-center gap-2">
              <Briefcase className="size-4 shrink-0 text-secondary" />
              {job.employment_type}
            </li>
          ) : null}
          {job.duration ? (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-secondary" />
              {job.duration}
            </li>
          ) : null}
          {closes ? (
            <li className="flex items-center gap-2">
              <CalendarClock className="size-4 shrink-0 text-secondary" />
              Closes {closes}
            </li>
          ) : null}
        </ul>

        {job.salary ? (
          <p className="mt-4 font-display text-base font-bold text-foreground">
            {job.salary} {job.currency ?? ""}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">{posted ? `Posted ${posted}` : ""}</span>
          <Button asChild size="sm">
            <Link to="/opportunities/$slug" params={{ slug: job.slug }}>
              View Opportunity
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
