import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: AdminEnquiries,
});

const STATUS = ["new", "in_progress", "resolved", "archived"];

function AdminEnquiries() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: rows = [] } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("contact_enquiries").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry updated");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Could not update enquiry"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Contact enquiries</h1>
      <p className="mt-1 text-sm text-muted-foreground">{rows.length} enquiries received.</p>

      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.subject || "General enquiry"}</p>
                <p className="text-sm text-muted-foreground">
                  {r.name} · {r.email}
                  {r.phone ? ` · ${r.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-muted text-foreground">{formatDate(r.created_at)}</Badge>
                <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id, patch: { status: v } })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{r.message}</p>
            <div className="mt-4">
              <Textarea
                value={notes[r.id] ?? r.admin_notes ?? ""}
                onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                placeholder="Internal notes (admins only)"
                rows={2}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => update.mutate({ id: r.id, patch: { admin_notes: notes[r.id] ?? r.admin_notes ?? "" } })}
              >
                Save note
              </Button>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No enquiries yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
