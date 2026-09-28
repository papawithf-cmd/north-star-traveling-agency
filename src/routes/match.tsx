import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categoryImage, fetchPublicOpportunities, northstarWhatsAppUrl } from "@/lib/site";
import { recommendOpportunities, type Recommendation } from "@/lib/recommend.functions";

export const Route = createFileRoute("/match")({
  head: () => ({
    meta: [
      { title: "AI Job Matcher | Northstar Traveling Agency" },
      { name: "description", content: "Describe your skills and preferences and get AI-powered recommendations from published Northstar opportunities." },
      { property: "og:title", content: "AI Job Matcher | Northstar Traveling Agency" },
      { property: "og:description", content: "Get personalised opportunity recommendations based on your skills and career goals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const recommend = useServerFn(recommendOpportunities);
  const { data: jobs = [] } = useQuery({ queryKey: ["public-opportunities"], queryFn: fetchPublicOpportunities });
  const [skills, setSkills] = useState("");
  const [prefs, setPrefs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.trim().length < 3) return setError("Please describe your skills and experience.");
    setLoading(true);
    setError(null);
    try {
      const res = await recommend({ data: { skills, preferences: prefs } });
      if (res.error) setError(res.error);
      setResults(res.items);
    } catch {
      setError("We couldn't generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bySlug = new Map((jobs as any[]).map((j) => [j.slug, j]));

  return (
    <SiteLayout>
      <section className="bg-navy py-16 text-center text-primary-foreground sm:py-20">
        <div className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">AI-powered</p>
          <h1 className="mt-3 font-serif text-4xl font-light sm:text-5xl">Find Your Best-Fit Opportunities</h1>
          <p className="mt-4 text-primary-foreground/80">
            Tell us about your skills and what you're looking for. Our AI will suggest relevant published opportunities.
          </p>
        </div>
      </section>

      <section className="container-page max-w-3xl py-12">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div>
            <label htmlFor="skills" className="text-sm font-semibold">Your skills & experience</label>
            <Textarea id="skills" rows={5} maxLength={2000} value={skills} onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. 3 years as a professional driver, valid class C licence, basic English and Arabic..." className="mt-2" />
          </div>
          <div>
            <label htmlFor="prefs" className="text-sm font-semibold">Career preferences (optional)</label>
            <Textarea id="prefs" rows={3} maxLength={1000} value={prefs} onChange={(e) => setPrefs(e.target.value)}
              placeholder="e.g. Prefer Gulf countries or Canada, full-time, accommodation provided..." className="mt-2" />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Finding matches..." : "Recommend Opportunities"}
          </Button>
          <p className="text-xs text-muted-foreground">Recommendations are suggestions only and are not a guarantee of employment or visa approval.</p>
        </form>

        {results && (
          <div className="mt-10 space-y-4">
            <h2 className="font-serif text-3xl font-light">Your matches</h2>
            {results.length === 0 && !error && (
              <p className="text-muted-foreground">No close matches right now. <Link to="/opportunities" className="text-primary underline">Browse all opportunities</Link>.</p>
            )}
            {results.map((r) => {
              const job = bySlug.get(r.slug);
              if (!job) return null;
              const primary = job.images?.find((i: any) => i.is_primary) ?? job.images?.[0];
              return (
                <div key={r.slug} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
                  <img src={categoryImage(job.category?.slug, job.primary_image ?? primary?.image_url)} alt={job.title}
                    className="aspect-video w-full rounded-lg object-cover sm:w-44" loading="lazy" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{job.title}</h3>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{r.score}% match</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{[job.category?.name, job.city, job.country].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 text-sm">{r.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/opportunities/$slug" params={{ slug: job.slug }}>View Details</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/apply" search={{ job: job.slug }}>Apply</Link>
                      </Button>
                      <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe5d]">
                        <a
                          href={northstarWhatsAppUrl(
                            `Hello Northstar Traveling Agency, I am interested in the opportunity: ${job.title}.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-1.5 size-4" />
                          WhatsApp Us
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
