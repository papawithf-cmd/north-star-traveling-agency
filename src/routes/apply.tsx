import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>) => ({
    job: typeof search["job"] === "string" ? (search["job"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Create Your Applicant Account — SkyBridge Careers" },
      {
        name: "description",
        content: "Register a free applicant account to apply for verified opportunities and track your application status.",
      },
      { property: "og:title", content: "Create Your Applicant Account" },
      { property: "og:description", content: "Register, apply and track your job applications online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplyGate,
});

function ApplyGate() {
  const { job } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const goToForm = () => navigate({ to: "/portal/apply", search: { job } });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal/apply", search: { job } });
    });
  }, [navigate, job]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/portal`, data: { name } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created");
      goToForm();
    } else {
      toast.success("Check your email to confirm your account, then sign in.");
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    goToForm();
  }

  return (
    <SiteLayout>
      <div className="container-page flex justify-center py-14 sm:py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <UserPlus className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Start your application</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create a free applicant account to submit and track your application.
          </p>

          <Tabs defaultValue="register" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Create account</TabsTrigger>
              <TabsTrigger value="signin">Sign in</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <form onSubmit={register} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="r-name">Full name</Label>
                  <Input id="r-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="r-email">Email address</Label>
                  <Input id="r-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="r-password">Password</Label>
                  <Input
                    id="r-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating account…" : "Create account & continue"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="s-email">Email address</Label>
                  <Input id="s-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="s-password">Password</Label>
                  <Input id="s-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in & continue"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}
