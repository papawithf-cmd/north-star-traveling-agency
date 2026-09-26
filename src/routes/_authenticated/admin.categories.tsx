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
import { fetchCategories, slugify } from "@/lib/site";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

type Form = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  display_order: number;
  active: boolean;
};

const empty: Form = {
  name: "",
  slug: "",
  description: "",
  image: "",
  icon: "",
  display_order: 0,
  active: true,
};

function AdminCategories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const save = useMutation({
    mutationFn: async (value: Form) => {
      const payload = {
        name: value.name,
        slug: value.slug || slugify(value.name),
        description: value.description || null,
        image: value.image || null,
        icon: value.icon || null,
        display_order: Number(value.display_order) || 0,
        active: value.active,
      };
      const { error } = value.id
        ? await supabase.from("categories").update(payload).eq("id", value.id)
        : await supabase.from("categories").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category saved");
      setForm(empty);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Category is in use or could not be deleted"),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create unlimited job categories without code changes.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h2 className="font-display text-base font-bold">{form.id ? "Edit category" : "New category"}</h2>
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="c-slug">Slug</Label>
            <Input id="c-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="c-desc">Description</Label>
            <Textarea id="c-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
          </div>
          <ImageUploader
            label="Category image"
            folder={`categories/${form.slug || "new"}`}
            value={form.image || null}
            onChange={(path) => setForm({ ...form, image: path ?? "" })}
          />
          <div>
            <Label htmlFor="c-img">…or image URL</Label>
            <Input id="c-img" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1.5" placeholder="Leave empty to use a built-in image" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="c-icon">Icon name</Label>
              <Input id="c-icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="c-order">Display order</Label>
              <Input
                id="c-order"
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="c-active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <Label htmlFor="c-active">Active</Label>
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
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.display_order}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.active ? "Yes" : "No"}</td>
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
                            description: c.description ?? "",
                            image: c.image ?? "",
                            icon: c.icon ?? "",
                            display_order: c.display_order,
                            active: c.active,
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
                          if (confirm(`Delete category "${c.name}"?`)) remove.mutate(c.id);
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
