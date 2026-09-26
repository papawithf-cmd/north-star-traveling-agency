import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { z } from "zod";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SkyBridge Careers" },
      {
        name: "description",
        content: "Get in touch with the SkyBridge Careers team about vacancies, applications or employer listings.",
      },
      { property: "og:title", content: "Contact SkyBridge Careers" },
      { property: "og:description", content: "Send us a message about vacancies or employer listings." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

function ContactPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        const next: Record<string, string> = {};
        for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
        setErrors(next);
        throw new Error("validation");
      }
      setErrors({});
      if (form.website) return; // honeypot
      const { error } = await supabase.from("contact_enquiries").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you — your message has been sent.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
    },
    onError: (e: Error) => {
      if (e.message !== "validation") toast.error("Could not send your message. Please try again.");
    },
  });

  return (
    <SiteLayout>
      <PageHeader eyebrow="Contact" title="Get in touch" subtitle="Questions about a vacancy or listing an opportunity? Send us a message." />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_400px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold">Send a message</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
              {errors['name'] ? <p className="mt-1 text-xs text-destructive">{errors['name']}</p> : null}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
              {errors['email'] ? <p className="mt-1 text-xs text-destructive">{errors['email']}</p> : null}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5" />
            {errors['message'] ? <p className="mt-1 text-xs text-destructive">{errors['message']}</p> : null}
          </div>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="hidden"
          />
          <Button type="submit" size="lg" className="mt-6" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Submit message"}
          </Button>
        </form>

        <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">Contact information</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings?.contact_person ? <li className="flex gap-2.5"><User className="size-4 text-secondary" />{settings.contact_person}</li> : null}
            {settings?.phone ? <li className="flex gap-2.5"><Phone className="size-4 text-secondary" />{settings.phone}</li> : null}
            {settings?.whatsapp ? <li className="flex gap-2.5"><MessageCircle className="size-4 text-secondary" />{settings.whatsapp}</li> : null}
            {settings?.email ? <li className="flex gap-2.5"><Mail className="size-4 text-secondary" />{settings.email}</li> : null}
            {settings?.address ? <li className="flex gap-2.5"><MapPin className="size-4 text-secondary" />{settings.address}</li> : null}
            {settings?.business_hours ? <li className="flex gap-2.5"><Clock className="size-4 text-secondary" />{settings.business_hours}</li> : null}
          </ul>
          {!settings?.phone && !settings?.email && !settings?.address ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Contact details will appear here once added in the admin portal.
            </p>
          ) : null}
        </aside>
      </div>
    </SiteLayout>
  );
}
