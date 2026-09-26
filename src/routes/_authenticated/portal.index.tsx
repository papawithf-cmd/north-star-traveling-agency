import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/site";
import { statusClasses, statusLabel } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,full_name,job_category,country_of_interest,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track the status of every application you have submitted.
          </p>
        </div>
        <Button asChild>
          <Link to="/portal/apply" search={{ job: "" }}>
            <FilePlus2 className="mr-1.5 size-4" /> New application
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {rows.map((r) => (
          <Link
            key={r.id}
            to="/portal/applications/$id"
            params={{ id: r.id }}
            className="block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold">{r.job_category || "General application"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.country_of_interest} · submitted {formatDate(r.created_at)}
                </p>
              </div>
              <Badge className={statusClasses(r.status)}>{statusLabel(r.status)}</Badge>
            </div>
          </Link>
        ))}
        {!isLoading && rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">You have not submitted any applications yet.</p>
            <Button asChild className="mt-5">
              <Link to="/portal/apply" search={{ job: "" }}>
                Start an application
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
