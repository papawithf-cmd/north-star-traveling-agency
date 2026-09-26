import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

const textFields = [
  ["site_name", "Website name"],
  ["tagline", "Tagline"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
  ["address", "Address"],
  ["business_hours", "Business hours"],
  ["contact_person", "Contact person"],
  ["facebook", "Facebook URL"],
  ["twitter", "X / Twitter URL"],
  ["instagram", "Instagram URL"],
  ["linkedin", "LinkedIn URL"],
] as const;

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const source = data as unknown as Record<string, string | null>;
      const next: Record<string, string> = {};
      for (const [key] of textFields) next[key] = source[key] ?? "";
      next['about_text'] = source['about_text'] ?? "";
      setForm(next);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const id = (data as { id?: string } | null)?.id;
      if (!id) throw new Error("Settings row missing");
      const { error } = await supabase.from("site_settings").update(form as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Site settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Business contact details shown across the website.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`s-${key}`}>{label}</Label>
              <Input
                id={`s-${key}`}
                value={form[key] ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
        <div>
          <Label htmlFor="s-about">About text</Label>
          <Textarea
            id="s-about"
            rows={6}
            value={form['about_text'] ?? ""}
            onChange={(e) => setForm({ ...form, about_text: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={save.isPending}>
          Save settings
        </Button>
      </form>
    </div>
  );
}
