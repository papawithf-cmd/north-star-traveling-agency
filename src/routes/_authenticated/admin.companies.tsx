import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { companyLogoUrl, fetchCompanies, imageUrlProblem, slugify } from "@/lib/site";

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

const fields: { key: "industry" | "country" | "city" | "address" | "website" | "email" | "phone" | "whatsapp"; label: string }[] = [
  { key: "industry", label: "Industry" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
];

function AdminCompanies() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const [logoPreviewStatus, setLogoPreviewStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });

  const save = useMutation({
    mutationFn: async (value: Form) => {
      const manualLogo = value.logo.trim();
      const manualLogoProblem = imageUrlProblem(manualLogo);
      if (manualLogoProblem) throw new Error(manualLogoProblem);

      const logo = manualLogo || companyLogoUrl({ website: value.website });
      if (!logo) {
        throw new Error("Add the company's official website so its real logo can be resolved.");
      }
      if (manualLogo && logoPreviewStatus === "invalid") {
        throw new Error("The logo image could not be loaded. Check the URL and use a direct image URL.");
      }

      const payload = {
        name: value.name,
        slug: value.slug || slugify(value.name),
        logo,
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
      setLogoPreviewStatus("idle");
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
          <div>
            <Label htmlFor="co-logo">Logo URL (optional)</Label>
            <Input
              id="co-logo"
              type="url"
              placeholder="Leave blank to use the official website logo automatically"
              value={form.logo}
              onChange={(e) => {
                setLogoPreviewStatus(e.target.value.trim() ? "loading" : "idle");
                setForm({ ...form, logo: e.target.value });
              }}
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Best practice: leave this blank and enter the company's official website. The logo will be resolved from that official domain automatically.
            </p>
            {form.website ? (
              <p className="mt-2 text-xs font-medium text-secondary">
                Automatic logo source: {companyLogoUrl({ website: form.website }) ?? "valid official website URL required"}
              </p>
            ) : null}
            {form.logo ? (
              <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex min-h-20 items-center justify-center">
                  <img
                    src={form.logo}
                    alt={form.name ? form.name + " logo preview" : "Company logo preview"}
                    className="max-h-20 max-w-full object-contain"
                    onLoad={() => setLogoPreviewStatus("valid")}
                    onError={() => setLogoPreviewStatus("invalid")}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {logoPreviewStatus === "valid"
                    ? "Logo image loaded."
                    : logoPreviewStatus === "invalid"
                      ? "Logo image could not be loaded. The official-website logo can still be used automatically."
                      : "Checking logo image…"}
                </p>
              </div>
            ) : null}
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`co-${f.key}`}>{f.label}</Label>
              <Input
                id={`co-${f.key}`}
                type={f.key === "website" ? "url" : "text"}
                required={f.key === "website" && !form.id}
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
              <Button type="button" variant="outline" onClick={() => { setForm(empty); setLogoPreviewStatus("idle"); }}>
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
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2.5">
                      {companyLogoUrl(c) ? (
                        <img src={companyLogoUrl(c)!} alt="" className="size-9 rounded-md border border-border bg-white object-contain p-1" />
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Building2 className="size-4" />
                        </span>
                      )}
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => {
                          setLogoPreviewStatus(c.logo ? "loading" : "idle");
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
                          });
                        }}
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
