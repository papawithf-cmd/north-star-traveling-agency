import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/site";
import { APPLICATION_STATUSES, statusClasses, statusLabel } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/admin/applications/$id")({
  component: AdminApplicationDetail,
});

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-border/60 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm sm:col-span-2 sm:mt-0">{value || "—"}</dd>
    </div>
  );
}

function AdminApplicationDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("applications").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application updated");
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Could not update the application"),
  });

  async function openCv() {
    if (!data?.cv_path) return;
    const { data: signed, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(data.cv_path, 60);
    if (error || !signed) {
      toast.error("Could not open the document");
      return;
    }
    window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Application not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/admin/applications">
          <ChevronLeft className="mr-1 size-4" /> All applications
        </Link>
      </Button>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">{data.full_name}</h1>
            <p className="text-sm text-muted-foreground">Submitted {formatDate(data.created_at)}</p>
          </div>
          <Badge className={statusClasses(data.status)}>{statusLabel(data.status)}</Badge>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Select value={data.status} onValueChange={(v) => update.mutate({ status: v, reviewed_at: new Date().toISOString() })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.cv_path ? (
            <Button variant="outline" onClick={openCv}>
              <Download className="mr-1.5 size-4" /> View CV ({data.cv_name})
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">No CV uploaded</span>
          )}
        </div>

        <dl className="mt-5">
          <Row label="Email" value={data.email} />
          <Row label="Phone" value={data.phone} />
          <Row label="Nationality" value={data.nationality} />
          <Row label="Date of birth" value={formatDate(data.date_of_birth)} />
          <Row label="Country of interest" value={data.country_of_interest} />
          <Row label="Job category" value={data.job_category} />
          <Row label="Passport status" value={data.passport_status} />
          <Row label="Qualifications" value={data.qualifications} />
          <Row label="Work experience" value={data.work_experience} />
          <Row label="Additional information" value={data.additional_info} />
          <Row label="Last reviewed" value={formatDate(data.reviewed_at)} />
        </dl>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Internal notes (admins only)</p>
          <Textarea
            className="mt-2"
            rows={3}
            value={notes ?? data.admin_notes ?? ""}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button size="sm" variant="outline" className="mt-2" onClick={() => update.mutate({ admin_notes: notes ?? "" })}>
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}
