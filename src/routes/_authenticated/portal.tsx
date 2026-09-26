import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FilePlus2, LayoutList, LogOut, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "My Applications — SkyBridge Careers" },
      { name: "description", content: "Track the progress of your job applications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalLayout,
});

function PortalLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="size-5" />
            </span>
            <span className="font-display text-base font-bold">Applicant Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/portal">
                <LayoutList className="mr-1.5 size-4" />
                <span className="hidden sm:inline">My applications</span>
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/portal/apply" search={{ job: "" }}>
                <FilePlus2 className="mr-1.5 size-4" />
                <span className="hidden sm:inline">New application</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container-page flex-1 py-8">
        <Outlet />
      </main>
    </div>
  );
}
