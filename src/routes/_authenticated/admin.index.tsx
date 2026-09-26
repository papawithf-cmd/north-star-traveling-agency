import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  FileEdit,
  FolderTree,
  Inbox,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

async function loadStats() {
  const [opps, cats, comps, enq, apps] = await Promise.all([
    supabase.from("opportunities").select("id,status,featured,deadline"),
    supabase.from("categories").select("id"),
    supabase.from("companies").select("id"),
    supabase.from("contact_enquiries").select("id,status"),
    supabase.from("applications").select("id,status"),
  ]);
  const rows = opps.data ?? [];
  const appRows = apps.data ?? [];
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const appCount = (s: string) => appRows.filter((r) => r.status === s).length;
  return {
    total: rows.length,
    published: count("published"),
    draft: count("draft"),
    pending: count("pending_review"),
    approved: count("approved"),
    expired: rows.filter((r) => r.deadline && new Date(r.deadline) < new Date()).length,
    rejected: count("rejected"),
    archived: count("archived"),
    featured: rows.filter((r) => r.featured).length,
    categories: (cats.data ?? []).length,
    companies: (comps.data ?? []).length,
    enquiries: (enq.data ?? []).length,
    newEnquiries: (enq.data ?? []).filter((e) => e.status === "new").length,
    applications: appRows.length,
    appsPending: appCount("pending"),
    appsReview: appCount("under_review"),
    appsApproved: appCount("approved"),
    appsRejected: appCount("rejected"),
  };
}

function Dashboard() {
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: loadStats });

  const cards = [
    { label: "Total applications", value: data?.applications, icon: Users },
    { label: "Pending applications", value: data?.appsPending, icon: Clock3 },
    { label: "Applications under review", value: data?.appsReview, icon: Clock3 },
    { label: "Approved applications", value: data?.appsApproved, icon: BadgeCheck },
    { label: "Rejected applications", value: data?.appsRejected, icon: XCircle },
    { label: "Total opportunities", value: data?.total, icon: FileEdit },
    { label: "Published", value: data?.published, icon: CheckCircle2 },
    { label: "Drafts", value: data?.draft, icon: FileEdit },
    { label: "Pending approval", value: data?.pending, icon: Clock3 },
    { label: "Approved", value: data?.approved, icon: BadgeCheck },
    { label: "Expired", value: data?.expired, icon: Archive },
    { label: "Rejected", value: data?.rejected, icon: XCircle },
    { label: "Featured", value: data?.featured, icon: Star },
    { label: "Categories", value: data?.categories, icon: FolderTree },
    { label: "Companies", value: data?.companies, icon: Building2 },
    { label: "Enquiries", value: data?.enquiries, icon: Inbox },
    { label: "New enquiries", value: data?.newEnquiries, icon: Inbox },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your recruitment portal.</p>
        </div>
        <Button asChild>
          <Link to="/admin/opportunities/$id" params={{ id: "new" }}>
            Create opportunity
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="size-4 text-secondary" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{c.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/admin/applications" label="Review client applications" />
        <QuickLink to="/admin/opportunities" label="Manage opportunities" />
        <QuickLink to="/admin/categories" label="Manage categories" />
        <QuickLink to="/admin/companies" label="Manage companies" />
        <QuickLink to="/admin/enquiries" label="Review enquiries" />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  label,
}: {
  to:
    | "/admin/opportunities"
    | "/admin/categories"
    | "/admin/companies"
    | "/admin/enquiries"
    | "/admin/applications";
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 text-sm font-semibold shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      {label}
    </Link>
  );
}
