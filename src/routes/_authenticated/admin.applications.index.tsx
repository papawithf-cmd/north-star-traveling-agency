import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/admin/applications/")({
  component: AdminApplications,
});

function AdminApplications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,full_name,email,phone,job_category,country_of_interest,nationality,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.job_category).filter(Boolean) as string[])),
    [rows],
  );
  const countries = useMemo(
    () => Array.from(new Set(rows.map((r) => r.country_of_interest).filter(Boolean))),
    [rows],
  );

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.nationality ?? "").toLowerCase().includes(q) ||
      (r.country_of_interest ?? "").toLowerCase().includes(q);
    return (
      matchesSearch &&
      (status === "all" || r.status === status) &&
      (category === "all" || r.job_category === category) &&
      (country === "all" || r.country_of_interest === country)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Client applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {rows.length} applications shown.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search name, email, country…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Job category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-semibold">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </td>
                <td className="px-4 py-3">{r.job_category || "—"}</td>
                <td className="px-4 py-3">{r.country_of_interest || "—"}</td>
                <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge className={statusClasses(r.status)}>{statusLabel(r.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/applications/$id" params={{ id: r.id }}>
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="p-6 text-sm text-muted-foreground">Loading…</p> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No applications match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
