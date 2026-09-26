import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Quote, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: AdminTestimonials,
});

type TestimonialForm = {
  id?: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  published: boolean;
  display_order: number;
  is_demo: boolean;
};

const empty: TestimonialForm = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  published: true,
  display_order: 0,
  is_demo: false,
};

function AdminTestimonials() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TestimonialForm>(empty);

  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (value: TestimonialForm) => {
      const name = value.name.trim();
      const quote = value.quote.trim();
      if (!name) throw new Error("Name is required.");
      if (!quote) throw new Error("Testimonial text is required.");

      const payload = {
        name,
        location: value.location.trim() || null,
        quote,
        rating: Math.min(5, Math.max(1, Number(value.rating) || 5)),
        published: value.published,
        display_order: Number(value.display_order) || 0,
        is_demo: value.is_demo,
      };

      const { error } = value.id
        ? await supabase.from("testimonials").update(payload).eq("id", value.id)
        : await supabase.from("testimonials").insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial saved");
      setForm(empty);
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Quote className="size-5 text-secondary" />
            <h1 className="font-display text-2xl font-bold">Testimonials</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add client testimonials and choose which ones appear publicly on the website.
          </p>
        </div>
        <Badge className="bg-muted text-foreground">{testimonials.length} total</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h2 className="font-display text-base font-bold">
            {form.id ? "Edit testimonial" : "Add testimonial"}
          </h2>

          <div>
            <Label htmlFor="t-name">Client name</Label>
            <Input
              id="t-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
              placeholder="e.g. Sarah M."
            />
          </div>

          <div>
            <Label htmlFor="t-location">Location</Label>
            <Input
              id="t-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1.5"
              placeholder="e.g. Nairobi"
            />
          </div>

          <div>
            <Label htmlFor="t-quote">Testimonial</Label>
            <Textarea
              id="t-quote"
              required
              rows={6}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              className="mt-1.5"
              placeholder="Write the client's testimonial here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="t-rating">Rating (1–5)</Label>
              <Input
                id="t-rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="t-order">Display order</Label>
              <Input
                id="t-order"
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="t-published">Published</Label>
              <p className="text-xs text-muted-foreground">Show this testimonial on the public site.</p>
            </div>
            <Switch
              id="t-published"
              checked={form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {form.id ? "Update testimonial" : "Publish testimonial"}
            </Button>
            {form.id ? (
              <Button type="button" variant="outline" onClick={() => setForm(empty)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading testimonials…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
              Could not load testimonials. Apply the testimonials database migration first, then refresh this page.
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No testimonials yet.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold">{testimonial.name}</h3>
                      {testimonial.is_demo ? (
                        <Badge className="bg-muted text-foreground">Demo</Badge>
                      ) : null}
                      <Badge className={testimonial.published ? "bg-success text-success-foreground" : "bg-muted text-foreground"}>
                        {testimonial.published ? "Published" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[testimonial.location, formatDate(testimonial.created_at)].filter(Boolean).join(" · ") || "No location"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${index < testimonial.rating ? "fill-current text-accent" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </div>

                <blockquote className="mt-4 border-l-2 border-accent pl-4 text-sm leading-relaxed text-foreground">
                  “{testimonial.quote}”
                </blockquote>

                <div className="mt-4 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit testimonial from ${testimonial.name}`}
                    onClick={() =>
                      setForm({
                        id: testimonial.id,
                        name: testimonial.name,
                        location: testimonial.location ?? "",
                        quote: testimonial.quote,
                        rating: testimonial.rating,
                        published: testimonial.published,
                        display_order: testimonial.display_order,
                        is_demo: testimonial.is_demo,
                      })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete testimonial from ${testimonial.name}`}
                    onClick={() => {
                      if (confirm(`Delete testimonial from "${testimonial.name}"?`)) remove.mutate(testimonial.id);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
