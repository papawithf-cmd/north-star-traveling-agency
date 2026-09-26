import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";

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
import { OPPORTUNITY_SELECT, STATUSES, formatDate, slugify } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/opportunities/")({
  component: AdminOpportunities,
});

const statusTone: Record<string, string> = {
  published: "bg-success text-success-foreground",
  approved: "bg-secondary text-secondary-foreground",
  pending_review: "bg-accent text-accent-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

function AdminOpportunities() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(OPPORTUNITY_SELECT)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["opportunities"] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opportunity deleted");
      invalidate();
    },
    onError: () => toast.error("Could not delete opportunity"),
  });

  const duplicate = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("opportunities").select("*").eq("id", id).single();
      if (error) throw error;
      const {
        id: _id,
        created_at: _c,
        updated_at: _u,
        published_at: _p,
        approved_at: _a,
        ...rest
      } = data;
      const { error: insertError } = await supabase.from("opportunities").insert({
        ...rest,
        title: `${data.title} (copy)`,
        slug: `${slugify(data.title)}-copy-${Date.now().toString(36)}`,
        status: "draft",
        published_at: null,
        approved_at: null,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Opportunity duplicated");
      invalidate();
    },
    onError: () => toast.error("Could not duplicate opportunity"),
  });

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!term) return true;
      return `${r.title} ${r.company?.name ?? ""} ${r.location ?? ""}`.toLowerCase().includes(term);
    });
  }, [rows, q, status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} total listings</p>
        </div>
        <Button asChild>
          <Link to="/admin/opportunities/$id" params={{ id: "new" }}>
            Create opportunity
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, company, location"
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(q || status !== "all") && (
          <Button variant="outline" onClick={() => { setQ(""); setStatus("all"); }}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Posted</th>
              <th className="px-4 py-3">Closes</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">
                  {r.title}
                  <div className="mt-1 flex gap-1">
                    {r.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
                    {r.urgent ? <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge> : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.company?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.location ?? r.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={statusTone[r.status] ?? "bg-muted text-foreground"}>
                    {r.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.published_at) ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.deadline) ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.updated_at) ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="Edit">
                      <Link to="/admin/opportunities/$id" params={{ id: r.id }}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label="Preview">
                      <Link to="/opportunities/$slug" params={{ slug: r.slug }} target="_blank">
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Duplicate" onClick={() => duplicate.mutate(r.id)}>
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => {
                        if (confirm(`Delete "${r.title}"? This cannot be undone.`)) remove.mutate(r.id);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No opportunities match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
