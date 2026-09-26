import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Briefcase,
  Settings,
  ExternalLink,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — SkyBridge Careers" },
      { name: "description", content: "Manage opportunities, categories, companies and enquiries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/opportunities", label: "Opportunities", icon: Briefcase, exact: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, exact: false },
  { to: "/admin/companies", label: "Companies", icon: Building2, exact: false },
  { to: "/admin/applications", label: "Applications", icon: Users, exact: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, exact: false },
  { to: "/admin/settings", label: "Site settings", icon: Settings, exact: false },
] as const;

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(data);
    },
  });
}

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: isAdmin, isLoading } = useIsAdmin();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 -translate-x-full bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : ""}`}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link to="/" className="font-display text-base font-bold">
            SkyBridge <span className="text-sidebar-primary">Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
          >
            <ExternalLink className="size-4" /> View website
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            <Menu className="size-4" />
          </Button>
          <span className="font-display font-bold">Admin Portal</span>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Checking permissions…</p>
          ) : isAdmin ? (
            <Outlet />
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <h1 className="font-display text-xl font-bold">Administrator access required</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account does not have the administrator role. Ask an existing administrator to grant access.
              </p>
              <Button className="mt-6" onClick={signOut}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
