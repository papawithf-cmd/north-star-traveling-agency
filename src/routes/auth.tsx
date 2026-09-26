import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Northstar Traveling Agency" },
      { name: "description", content: "Sign in or create your Northstar Traveling Agency account." },
      { property: "og:title", content: "Sign In — Northstar Traveling Agency" },
      { property: "og:description", content: "Access Northstar Traveling Agency opportunities." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function routeByRole() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    navigate({ to: role ? "/admin" : "/portal" });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void routeByRole();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error && normalizedEmail === "northstaragencyweb@gmail.com") {
      // Bootstrap the designated Northstar administrator if the Auth account
      // has not been created yet. The entered password is never stored in code.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { name: "Northstar Administrator" } },
      });

      if (!signUpError && signUpData.session) {
        setBusy(false);
        toast.success("Northstar administrator account created and signed in");
        await routeByRole();
        return;
      }

      if (!signUpError && signUpData.user) {
        setBusy(false);
        toast.success("Administrator account created. Check the email inbox to confirm the account, then sign in again.");
        return;
      }

      // If the account already exists, keep Supabase's normal authentication
      // response rather than exposing account-existence details.
      if (signUpError?.message === "User already registered") {
        setBusy(false);
        toast.error("Invalid login credentials. Use the administrator password or reset the password from the email account.");
        return;
      }
    }

    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    await routeByRole();
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created");
      await routeByRole();
    } else {
      toast.success("Check your email to confirm your account.");
    }
  }

  async function googleSignIn() {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    await routeByRole();
  }


  return (
    <SiteLayout>
      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Welcome to Northstar Traveling Agency</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in or create an account to explore verified opportunities and apply.
          </p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input id="su-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  The first account created becomes the site administrator.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={googleSignIn}>
            Continue with Google
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
