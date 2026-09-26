import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories } from "@/lib/site";
import { PASSPORT_STATUSES } from "@/lib/applications";
import { notifyAdminOfApplication } from "@/lib/applications.functions";

export const Route = createFileRoute("/_authenticated/portal/apply")({
  validateSearch: (search: Record<string, unknown>) => ({
    job: typeof search["job"] === "string" ? (search["job"] as string) : "",
  }),
  component: ApplicationForm,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(6, "Enter your phone number").max(40),
  nationality: z.string().trim().min(2, "Enter your nationality").max(80),
  date_of_birth: z.string().trim().min(1, "Enter your date of birth"),
  country_of_interest: z.string().trim().min(2, "Enter the country you are interested in").max(80),
  job_category: z.string().trim().min(1, "Choose a job category"),
  passport_status: z.string().trim().min(1, "Select your passport status"),
  qualifications: z.string().trim().max(2000).optional(),
  work_experience: z.string().trim().max(2000).optional(),
  additional_info: z.string().trim().max(2000).optional(),
});

type FormState = z.infer<typeof schema>;

const empty: FormState = {
  full_name: "",
  email: "",
  phone: "",
  nationality: "",
  date_of_birth: "",
  country_of_interest: "",
  job_category: "",
  passport_status: "",
  qualifications: "",
  work_experience: "",
  additional_info: "",
};

function ApplicationForm() {
  const { job } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data: opportunity } = useQuery({
    queryKey: ["apply-job", job],
    enabled: Boolean(job),
    queryFn: async () => {
      const { data } = await supabase
        .from("opportunities")
        .select("id,title,country,category_id, category:categories(name)")
        .eq("slug", job)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        full_name: f.full_name || (user.user_metadata?.["name"] as string) || "",
      }));
    });
  }, []);

  useEffect(() => {
    if (!opportunity) return;
    setForm((f) => ({
      ...f,
      job_category: f.job_category || opportunity.category?.name || "",
      country_of_interest: f.country_of_interest || opportunity.country || "",
    }));
  }, [opportunity]);

  const categoryNames = useMemo(
    () => categories.map((c) => c.name).filter(Boolean),
    [categories],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goToReview() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please correct the highlighted fields");
      return;
    }
    setErrors({});
    setReview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Your session expired. Please sign in again.");

      let cvPath: string | null = null;
      let cvName: string | null = null;
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("application-documents")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        cvPath = path;
        cvName = file.name;
      }

      const category = categories.find((c) => c.name === form.job_category);
      const { data: inserted, error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          opportunity_id: opportunity?.id ?? null,
          category_id: category?.id ?? null,
          job_category: form.job_category,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          date_of_birth: form.date_of_birth,
          country_of_interest: form.country_of_interest,
          passport_status: form.passport_status,
          qualifications: form.qualifications ?? null,
          work_experience: form.work_experience ?? null,
          additional_info: form.additional_info ?? null,
          cv_path: cvPath,
          cv_name: cvName,
        })
        .select("id")
        .single();
      if (error) throw error;

      try {
        const result = await notifyAdminOfApplication({
          data: { applicationId: inserted.id, origin: window.location.origin },
        });
        if (!result.sent) {
          console.warn("[apply] admin notification not sent:", result.reason);
        }
      } catch (notifyError) {
        console.warn("[apply] admin notification failed", notifyError);
      }

      toast.success("Application submitted successfully");
      navigate({ to: "/portal/applications/$id", params: { id: inserted.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit your application");
    } finally {
      setBusy(false);
    }
  }

  if (review) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-bold">Review your application</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check everything is correct before submitting.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <dl>
            {(
              [
                ["Full name", form.full_name],
                ["Email address", form.email],
                ["Phone number", form.phone],
                ["Nationality", form.nationality],
                ["Date of birth", form.date_of_birth],
                ["Country of interest", form.country_of_interest],
                ["Job category", form.job_category],
                ["Passport status", form.passport_status],
                ["CV / Resume", file ? file.name : "Not uploaded"],
                ["Qualifications", form.qualifications || "—"],
                ["Work experience", form.work_experience || "—"],
                ["Additional information", form.additional_info || "—"],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="border-b border-border/60 py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-line text-sm sm:col-span-2 sm:mt-0">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={submit} disabled={busy} className="sm:flex-1">
              {busy ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit application"
              )}
            </Button>
            <Button variant="outline" onClick={() => setReview(false)} disabled={busy}>
              Edit details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Application form</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {opportunity ? `Applying for: ${opportunity.title}` : "Tell us about yourself and the work you are looking for."}
      </p>

      <div className="mt-6 space-y-5 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors["full_name"]}>
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Email address" error={errors["email"]}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone number" error={errors["phone"]}>
            <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Nationality" error={errors["nationality"]}>
            <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
          </Field>
          <Field label="Date of birth" error={errors["date_of_birth"]}>
            <Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
          </Field>
          <Field label="Country of interest" error={errors["country_of_interest"]}>
            <Input value={form.country_of_interest} onChange={(e) => set("country_of_interest", e.target.value)} />
          </Field>
          <Field label="Job category" error={errors["job_category"]}>
            <Select value={form.job_category} onValueChange={(v) => set("job_category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Passport status" error={errors["passport_status"]}>
            <Select value={form.passport_status} onValueChange={(v) => set("passport_status", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PASSPORT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="CV / Resume (PDF or Word, max 10MB)">
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
            <Upload className="size-4" />
            <span>{file ? file.name : "Choose file"}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && f.size > 10 * 1024 * 1024) {
                  toast.error("File must be smaller than 10MB");
                  return;
                }
                setFile(f);
              }}
            />
          </label>
        </Field>

        <Field label="Relevant qualifications">
          <Textarea rows={3} value={form.qualifications ?? ""} onChange={(e) => set("qualifications", e.target.value)} />
        </Field>
        <Field label="Work experience">
          <Textarea rows={4} value={form.work_experience ?? ""} onChange={(e) => set("work_experience", e.target.value)} />
        </Field>
        <Field label="Additional information">
          <Textarea rows={3} value={form.additional_info ?? ""} onChange={(e) => set("additional_info", e.target.value)} />
        </Field>

        <Button className="w-full" onClick={goToReview}>
          Review application
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="mt-1.5">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
          : children}
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
