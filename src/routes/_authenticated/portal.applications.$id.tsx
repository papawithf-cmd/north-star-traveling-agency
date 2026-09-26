import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/site";
import { statusClasses, statusLabel } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/portal/applications/$id")({
  component: ApplicationDetail,
});

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="border-b border-border/60 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );
}

function ApplicationDetail() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["my-application", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Application not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/portal">
          <ChevronLeft className="mr-1 size-4" /> Back
        </Link>
      </Button>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold">{data.job_category || "Application"}</h1>
          <Badge className={statusClasses(data.status)}>{statusLabel(data.status)}</Badge>
        </div>
        <dl className="mt-4">
          <Row label="Full name" value={data.full_name} />
          <Row label="Email" value={data.email} />
          <Row label="Phone" value={data.phone} />
          <Row label="Nationality" value={data.nationality} />
          <Row label="Date of birth" value={formatDate(data.date_of_birth)} />
          <Row label="Country of interest" value={data.country_of_interest} />
          <Row label="Passport status" value={data.passport_status} />
          <Row label="CV / Resume" value={data.cv_name ? `${data.cv_name} (securely stored)` : "Not uploaded"} />
          <Row label="Qualifications" value={data.qualifications} />
          <Row label="Work experience" value={data.work_experience} />
          <Row label="Additional information" value={data.additional_info} />
          <Row label="Submitted" value={formatDate(data.created_at)} />
        </dl>
      </div>
    </div>
  );
}
