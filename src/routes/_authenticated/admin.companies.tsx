import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { fetchCompanies, slugify } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/companies")({
  component: AdminCompanies,
});

type Form = {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  industry: string;
  country: string;
  city: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
};

const empty: Form = {
  name: "",
  slug: "",
  logo: "",
  description: "",
  industry: "",
  country: "",
  city: "",
  address: "",
  website: "",
  email: "",
  phone: "",
  whatsapp: "",
  verified: false,
};

const fields: { key: "industry" | "country" | "city" | "address" | "website" | "email" | "phone" | "whatsapp" | "logo"; label: string }[] = [
  { key: "industry", label: "Industry" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "logo", label: "Logo URL" },
];

function AdminCompanies() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });

  const save = useMutation({
    mutationFn: async (value: Form) => {
      const payload = {
        name: value.name,
        slug: value.slug || slugify(value.name),
        logo: value.logo || null,
        description: value.description || null,
        industry: value.industry || null,
        country: value.country || null,
        city: value.city || null,
        address: value.address || null,
        website: value.website || null,
        email: value.email || null,
        phone: value.phone || null,
        whatsapp: value.whatsapp || null,
        verified: value.verified,
      };
      const { error } = value.id
        ? await supabase.from("companies").update(payload).eq("id", value.id)
        : await supabase.from("companies").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Company saved");
      setForm(empty);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Company deleted");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: () => toast.error("Company is in use or could not be deleted"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Companies</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage employers and their verification status.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h2 className="font-display text-base font-bold">{form.id ? "Edit company" : "New company"}</h2>
          <div>
            <Label htmlFor="co-name">Name</Label>
            <Input
              id="co-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="co-slug">Slug</Label>
            <Input id="co-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="co-desc">Description</Label>
            <Textarea id="co-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`co-${f.key}`}>{f.label}</Label>
              <Input
                id={`co-${f.key}`}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1.5"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Switch id="co-verified" checked={form.verified} onCheckedChange={(v) => setForm({ ...form, verified: v })} />
            <Label htmlFor="co-verified">Verified employer</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {form.id ? "Update" : "Create"}
            </Button>
            {form.id ? (
              <Button type="button" variant="outline" onClick={() => setForm(empty)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          setForm({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            logo: c.logo ?? "",
                            description: c.description ?? "",
                            industry: c.industry ?? "",
                            country: c.country ?? "",
                            city: c.city ?? "",
                            address: c.address ?? "",
                            website: c.website ?? "",
                            email: c.email ?? "",
                            phone: c.phone ?? "",
                            whatsapp: c.whatsapp ?? "",
                            verified: c.verified,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => {
                          if (confirm(`Delete company "${c.name}"?`)) remove.mutate(c.id);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
