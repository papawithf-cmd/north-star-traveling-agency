import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_METHODS,
  EMPLOYMENT_TYPES,
  STATUSES,
  fetchCategories,
  fetchCompanies,
  formatDate,
  mediaUrl,
  slugify,
} from "@/lib/site";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/opportunities/$id")({
  component: OpportunityEditor,
});

type Row = Record<string, unknown>;

const emptyForm: Row = {
  title: "",
  slug: "",
  status: "draft",
  featured: false,
  urgent: false,
  verified: false,
  vacancies: 1,
  currency: "USD",
  application_method: "email",
};

const textAreas: [string, string][] = [
  ["description", "Job description"],
  ["responsibilities", "Responsibilities"],
  ["requirements", "Requirements summary"],
  ["qualifications", "Qualifications"],
  ["benefits", "Benefits (accommodation, transport, insurance, meals, training, travel)"],
];

const generalFields: [string, string, string?][] = [
  ["location", "Location"],
  ["country", "Country"],
  ["city", "City"],
  ["workplace", "Workplace / address"],
  ["duration", "Job duration"],
  ["contract_duration", "Contract duration"],
  ["permanence", "Permanent / temporary"],
  ["probation", "Probation period"],
  ["salary", "Salary / compensation"],
  ["currency", "Currency"],
  ["start_date", "Expected start date", "date"],
  ["deadline", "Application deadline", "date"],
];

const requirementFields: [string, string, string?][] = [
  ["min_age", "Minimum age", "number"],
  ["max_age", "Maximum age", "number"],
  ["education", "Education"],
  ["experience", "Experience"],
  ["skills", "Skills"],
  ["languages", "Languages"],
  ["certificates", "Certificates"],
  ["physical_requirements", "Physical requirements"],
  ["drivers_license", "Driver's licence"],
  ["passport_required", "Passport requirements"],
  ["other_requirements", "Other requirements"],
];

const contactFields: [string, string][] = [
  ["contact_person", "Contact person"],
  ["contact_phone", "Phone number"],
  ["contact_whatsapp", "WhatsApp number"],
  ["contact_email", "Email"],
  ["contact_website", "Website"],
];

const applicationFields: [string, string][] = [
  ["application_url", "Application link"],
  ["application_email", "Application email"],
  ["application_phone", "Application phone"],
  ["application_whatsapp", "Application WhatsApp"],
];

function str(row: Row, key: string) {
  const v = row[key];
  return v === null || v === undefined ? "" : String(v);
}

function OpportunityEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Row>(emptyForm);
  const [recordId, setRecordId] = useState<string | null>(isNew ? null : id);
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const dirty = useRef(false);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });

  const { data: record } = useQuery({
    queryKey: ["opportunity", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Row;
    },
  });

  const { data: images = [] } = useQuery({
    queryKey: ["opportunity-images", recordId],
    enabled: Boolean(recordId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_images")
        .select("*")
        .eq("opportunity_id", recordId!)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["opportunity-notes", recordId],
    enabled: Boolean(recordId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_notes")
        .select("*")
        .eq("opportunity_id", recordId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (record) setForm(record);
  }, [record]);

  const set = (key: string, value: unknown) => {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = useMutation({
    mutationFn: async (extra: Row = {}) => {
      const payload: Row = { ...form, ...extra };
      payload['title'] = str(payload, "title");
      payload['slug'] = str(payload, "slug") || slugify(str(payload, "title"));
      for (const key of ["min_age", "max_age", "vacancies"]) {
        payload[key] = payload[key] === "" || payload[key] === undefined ? null : Number(payload[key]);
      }
      for (const key of ["start_date", "deadline"]) {
        if (payload[key] === "") payload[key] = null;
      }
      delete payload['category'];
      delete payload['company'];
      delete payload['created_at'];
      delete payload['updated_at'];

      if (recordId) {
        const { error } = await supabase.from("opportunities").update(payload as never).eq("id", recordId);
        if (error) throw error;
        return recordId;
      }
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("opportunities")
        .insert({ ...payload, created_by: userData.user?.id } as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (newId) => {
      dirty.current = false;
      toast.success("Opportunity saved");
      queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      if (!recordId) {
        setRecordId(newId);
        navigate({ to: "/admin/opportunities/$id", params: { id: newId }, replace: true });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Lightweight autosave for existing records.
  useEffect(() => {
    if (!recordId) return;
    const timer = setInterval(() => {
      if (dirty.current && !save.isPending) save.mutate({});
    }, 30000);
    return () => clearInterval(timer);
  }, [recordId, save]);

  const addNote = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("opportunity_notes").insert({
        opportunity_id: recordId!,
        admin_id: userData.user?.id ?? null,
        note,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      toast.success("Note added");
      queryClient.invalidateQueries({ queryKey: ["opportunity-notes", recordId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const imageMutation = useMutation({
    mutationFn: async (action: {
      type: "add" | "remove" | "move";
      id?: string;
      path?: string;
      direction?: -1 | 1;
    }) => {
      if (action.type === "add") {
        const value = action.path?.trim();
        if (!value) throw new Error("Choose a file or enter an image URL");
        if (images.length >= 6) throw new Error("Maximum of 6 images");
        const { error } = await supabase.from("opportunity_images").insert({
          opportunity_id: recordId!,
          image_url: value,
          display_order: images.length,
          is_primary: images.length === 0,
        } as never);
        if (error) throw error;
        setImageUrl("");
        return;
      }
      if (action.type === "remove") {
        const { error } = await supabase.from("opportunity_images").delete().eq("id", action.id!);
        if (error) throw error;
        return;
      }
      const index = images.findIndex((i) => i.id === action.id);
      const target = index + (action.direction ?? 0);
      if (index < 0 || target < 0 || target >= images.length) return;
      const a = images[index]!;
      const b = images[target]!;
      const updates = [
        supabase.from("opportunity_images").update({ display_order: target, is_primary: target === 0 }).eq("id", a.id),
        supabase.from("opportunity_images").update({ display_order: index, is_primary: index === 0 }).eq("id", b.id),
      ];
      await Promise.all(updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunity-images", recordId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const workflow = (status: string, extra: Row = {}) => save.mutate({ status, ...extra });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link to="/admin/opportunities">
              <ArrowLeft className="size-4" /> Back to opportunities
            </Link>
          </Button>
          <h1 className="mt-1 font-display text-2xl font-bold">
            {isNew && !recordId ? "Create opportunity" : str(form, "title") || "Edit opportunity"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: <Badge className="bg-muted text-foreground">{str(form, "status").replace("_", " ")}</Badge>
            {form['updated_at'] ? ` · updated ${formatDate(str(form, "updated_at"))}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => save.mutate({})} disabled={save.isPending}>
            Save
          </Button>
          <Button variant="outline" onClick={() => workflow("pending_review")}>Submit for review</Button>
          <Button variant="outline" onClick={() => workflow("approved", { approved_at: new Date().toISOString() })}>
            Approve
          </Button>
          <Button onClick={() => workflow("published", { published_at: new Date().toISOString() })}>Publish</Button>
          <Button variant="outline" onClick={() => workflow("draft", { published_at: null })}>Unpublish</Button>
          <Button
            variant="outline"
            onClick={() => {
              const reason = prompt("Reason for rejection?") ?? "";
              workflow("rejected", { rejection_reason: reason });
            }}
          >
            Reject
          </Button>
          <Button variant="outline" onClick={() => workflow("archived")}>Archive</Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="details">Description</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="notes">Internal notes</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title" required value={str(form, "title")} onChange={(v) => {
                set("title", v);
                if (!recordId) set("slug", slugify(v));
              }} />
              <Field label="Slug" value={str(form, "slug")} onChange={(v) => set("slug", v)} />
              <div>
                <Label>Category</Label>
                <Select value={str(form, "category_id") || "none"} onValueChange={(v) => set("category_id", v === "none" ? null : v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company</Label>
                <Select value={str(form, "company_id") || "none"} onValueChange={(v) => set("company_id", v === "none" ? null : v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No company</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employment type</Label>
                <Select value={str(form, "employment_type") || "none"} onValueChange={(v) => set("employment_type", v === "none" ? null : v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Number of vacancies" type="number" value={str(form, "vacancies")} onChange={(v) => set("vacancies", v)} />
              {generalFields.map(([key, label, type]) => (
                <Field key={key} label={label} type={type} value={str(form, key)} onChange={(v) => set(key, v)} />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <div className="space-y-4">
              {textAreas.map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`f-${key}`}>{label}</Label>
                  <Textarea id={`f-${key}`} rows={6} value={str(form, key)} onChange={(e) => set(key, e.target.value)} className="mt-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {requirementFields.map(([key, label, type]) => (
                <Field key={key} label={label} type={type} value={str(form, key)} onChange={(v) => set(key, v)} />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="application">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Application method</Label>
                <Select value={str(form, "application_method") || "email"} onValueChange={(v) => set("application_method", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPLICATION_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {applicationFields.map(([key, label]) => (
                <Field key={key} label={label} value={str(form, key)} onChange={(v) => set(key, v)} />
              ))}
              {contactFields.map(([key, label]) => (
                <Field key={key} label={label} value={str(form, key)} onChange={(v) => set(key, v)} />
              ))}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="f-instructions">Application instructions</Label>
                <Textarea id="f-instructions" rows={4} value={str(form, "application_instructions")} onChange={(e) => set("application_instructions", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="f-docs">Required documents</Label>
                <Textarea id="f-docs" rows={3} value={str(form, "required_documents")} onChange={(e) => set("required_documents", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            {recordId ? (
              <>
                <div className="max-w-md">
                  <ImageUploader
                    label={images.length >= 6 ? "Maximum of 6 images reached" : "Upload a new image"}
                    folder={`opportunities/${recordId}`}
                    value={null}
                    onChange={(path) => {
                      if (path) imageMutation.mutate({ type: "add", path });
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="…or paste an image URL"
                    className="max-w-md"
                  />
                  <Button
                    onClick={() => imageMutation.mutate({ type: "add", path: imageUrl })}
                    disabled={images.length >= 6}
                  >
                    Add image
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Up to 6 images. The first image is the main image.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((img, index) => (
                    <div key={img.id} className="overflow-hidden rounded-lg border border-border">
                      <img src={mediaUrl(img.image_url) ?? img.image_url} alt={img.caption ?? `Image ${index + 1}`} className="h-40 w-full object-cover" />
                      <div className="flex items-center justify-between gap-1 p-2">
                        <span className="text-xs text-muted-foreground">
                          {index === 0 ? "Main image" : `Image ${index + 1}`}
                        </span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => imageMutation.mutate({ type: "move", id: img.id, direction: -1 })}>
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => imageMutation.mutate({ type: "move", id: img.id, direction: 1 })}>
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => imageMutation.mutate({ type: "remove", id: img.id })}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Save the opportunity first to add images.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="publishing">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select value={str(form, "status") || "draft"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Rejection reason" value={str(form, "rejection_reason")} onChange={(v) => set("rejection_reason", v)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              <Toggle label="Featured" checked={Boolean(form['featured'])} onChange={(v) => set("featured", v)} />
              <Toggle label="Urgent" checked={Boolean(form['urgent'])} onChange={(v) => set("urgent", v)} />
              <Toggle label="Verified" checked={Boolean(form['verified'])} onChange={(v) => set("verified", v)} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            {recordId ? (
              <>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Private note visible only to administrators" />
                <Button className="mt-2" size="sm" onClick={() => addNote.mutate()} disabled={!note.trim()}>
                  Add note
                </Button>
                <div className="mt-5 space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="whitespace-pre-line">{n.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
                    </div>
                  ))}
                  {notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Save the opportunity first to add internal notes.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string | undefined;
  required?: boolean | undefined;
}) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type ?? "text"}
        required={required ?? false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = `t-${label.toLowerCase()}`;
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
