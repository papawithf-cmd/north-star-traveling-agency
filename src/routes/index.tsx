import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  CheckCircle2,
  FileSearch,
  Globe2,
  MapPin,
  Quote,
  Search,
  Send,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import type { OpportunityRow } from "@/components/site/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryImage, fetchCategories, fetchPublicOpportunities, fetchPublicTestimonials, formatDate } from "@/lib/site";
import heroImage from "@/assets/northstar-home-hero.jpg";
import careerBanner from "@/assets/northstar-career-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northstar Traveling Agency — International Career Opportunities" },
      {
        name: "description",
        content:
          "Explore international career opportunities by country, category and location with Northstar Traveling Agency.",
      },
      { property: "og:title", content: "Northstar Traveling Agency — International Opportunities" },
      {
        property: "og:description",
        content: "Discover international opportunities and take the next step in your professional future.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const countryRegions = [
  {
    name: "Africa",
    countries: [
      ["Algeria","DZ"],["Angola","AO"],["Benin","BJ"],["Botswana","BW"],["Burkina Faso","BF"],["Burundi","BI"],["Cabo Verde","CV"],["Cameroon","CM"],["Central African Republic","CF"],["Chad","TD"],["Comoros","KM"],["Democratic Republic of the Congo","CD"],["Republic of the Congo","CG"],["Côte d'Ivoire","CI"],["Djibouti","DJ"],["Egypt","EG"],["Equatorial Guinea","GQ"],["Eritrea","ER"],["Eswatini","SZ"],["Ethiopia","ET"],["Gabon","GA"],["Gambia","GM"],["Ghana","GH"],["Guinea","GN"],["Guinea-Bissau","GW"],["Kenya","KE"],["Lesotho","LS"],["Liberia","LR"],["Libya","LY"],["Madagascar","MG"],["Malawi","MW"],["Mali","ML"],["Mauritania","MR"],["Mauritius","MU"],["Morocco","MA"],["Mozambique","MZ"],["Namibia","NA"],["Niger","NE"],["Nigeria","NG"],["Rwanda","RW"],["São Tomé and Príncipe","ST"],["Senegal","SN"],["Seychelles","SC"],["Sierra Leone","SL"],["Somalia","SO"],["South Africa","ZA"],["South Sudan","SS"],["Sudan","SD"],["Tanzania","TZ"],["Togo","TG"],["Tunisia","TN"],["Uganda","UG"],["Zambia","ZM"],["Zimbabwe","ZW"]
    ]
  },
  {
    name: "Asia",
    countries: [
      ["Afghanistan","AF"],["Armenia","AM"],["Azerbaijan","AZ"],["Bangladesh","BD"],["Bhutan","BT"],["Brunei","BN"],["Cambodia","KH"],["China","CN"],["Cyprus","CY"],["Georgia","GE"],["India","IN"],["Indonesia","ID"],["Iran","IR"],["Iraq","IQ"],["Israel","IL"],["Japan","JP"],["Jordan","JO"],["Kazakhstan","KZ"],["Kyrgyzstan","KG"],["Laos","LA"],["Lebanon","LB"],["Malaysia","MY"],["Maldives","MV"],["Mongolia","MN"],["Myanmar","MM"],["Nepal","NP"],["North Korea","KP"],["Pakistan","PK"],["Palestine","PS"],["Philippines","PH"],["Singapore","SG"],["South Korea","KR"],["Sri Lanka","LK"],["Syria","SY"],["Tajikistan","TJ"],["Thailand","TH"],["Timor-Leste","TL"],["Turkey","TR"],["Turkmenistan","TM"],["Uzbekistan","UZ"],["Vietnam","VN"],["Yemen","YE"]
    ]
  },
  {
    name: "Gulf Cooperation Council (GCC)",
    countries: [
      ["Bahrain","BH"],["Kuwait","KW"],["Oman","OM"],["Qatar","QA"],["Saudi Arabia","SA"],["United Arab Emirates","AE"]
    ]
  },
  {
    name: "Europe",
    countries: [
      ["Albania","AL"],["Andorra","AD"],["Austria","AT"],["Belarus","BY"],["Belgium","BE"],["Bosnia and Herzegovina","BA"],["Bulgaria","BG"],["Croatia","HR"],["Czechia","CZ"],["Denmark","DK"],["Estonia","EE"],["Finland","FI"],["France","FR"],["Germany","DE"],["Greece","GR"],["Hungary","HU"],["Iceland","IS"],["Ireland","IE"],["Italy","IT"],["Latvia","LV"],["Liechtenstein","LI"],["Lithuania","LT"],["Luxembourg","LU"],["Malta","MT"],["Moldova","MD"],["Monaco","MC"],["Montenegro","ME"],["Netherlands","NL"],["North Macedonia","MK"],["Norway","NO"],["Poland","PL"],["Portugal","PT"],["Romania","RO"],["Russia","RU"],["San Marino","SM"],["Serbia","RS"],["Slovakia","SK"],["Slovenia","SI"],["Spain","ES"],["Sweden","SE"],["Switzerland","CH"],["Ukraine","UA"],["United Kingdom","GB"],["Vatican City","VA"]
    ]
  },
  {
    name: "North America",
    countries: [
      ["Antigua and Barbuda","AG"],["Bahamas","BS"],["Barbados","BB"],["Belize","BZ"],["Canada","CA"],["Costa Rica","CR"],["Cuba","CU"],["Dominica","DM"],["Dominican Republic","DO"],["El Salvador","SV"],["Grenada","GD"],["Guatemala","GT"],["Haiti","HT"],["Honduras","HN"],["Jamaica","JM"],["Mexico","MX"],["Nicaragua","NI"],["Panama","PA"],["Saint Kitts and Nevis","KN"],["Saint Lucia","LC"],["Saint Vincent and the Grenadines","VC"],["Trinidad and Tobago","TT"],["United States","US"]
    ]
  },
  {
    name: "South America",
    countries: [
      ["Argentina","AR"],["Bolivia","BO"],["Brazil","BR"],["Chile","CL"],["Colombia","CO"],["Ecuador","EC"],["Guyana","GY"],["Paraguay","PY"],["Peru","PE"],["Suriname","SR"],["Uruguay","UY"],["Venezuela","VE"]
    ]
  },
  {
    name: "Oceania",
    countries: [
      ["Australia","AU"],["Fiji","FJ"],["Kiribati","KI"],["Marshall Islands","MH"],["Micronesia","FM"],["Nauru","NR"],["New Zealand","NZ"],["Palau","PW"],["Papua New Guinea","PG"],["Samoa","WS"],["Solomon Islands","SB"],["Tonga","TO"],["Tuvalu","TV"],["Vanuatu","VU"]
    ]
  }
] as const;

const countries = countryRegions.flatMap((region) =>
  region.countries.map(([label, code]) => ({ label, query: label, code })),
);

type HomeJob = OpportunityRow & {
  description?: string | null;
  application_method?: string | null;
};

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("all");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: jobs = [] } = useQuery({ queryKey: ["opportunities"], queryFn: fetchPublicOpportunities });
  const { data: testimonials = [] } = useQuery({ queryKey: ["testimonials"], queryFn: fetchPublicTestimonials });

  const activeCategories = categories.filter((item) => item.active);
  const featured = (jobs.filter((job) => job.featured).length
    ? jobs.filter((job) => job.featured)
    : jobs
  )
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
    .slice(0, 6) as HomeJob[];
  const liveCountries = new Set(jobs.map((job) => job.country?.trim()).filter(Boolean)).size;
  const recentCutoff = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const recentlyAdded = jobs.filter((job) => {
    const value = job.published_at ?? job.created_at;
    return value ? new Date(value).getTime() >= recentCutoff : false;
  }).length;

  function search() {
    navigate({
      to: "/opportunities",
      search: {
        q: q || undefined,
        location: location || undefined,
        category: category === "all" ? undefined : category,
      },
    });
  }

  return (
    <SiteLayout>
      <section className="relative min-h-[610px] overflow-hidden bg-navy text-navy-foreground sm:min-h-[650px]">
        <img
          src={heroImage}
          alt="International professionals walking through a modern airport terminal"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-[68%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-navy/45" />
        <div className="relative container-page flex min-h-[610px] items-center pb-28 pt-16 sm:min-h-[650px] sm:pb-32">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-accent">
              <span className="h-px w-8 bg-accent" /> International career opportunities
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[1.08] tracking-normal sm:text-5xl lg:text-6xl">
              Discover Your Next Opportunity
            </h1>
            <p className="mt-4 font-serif text-2xl font-light uppercase leading-tight tracking-normal text-accent sm:text-3xl">
              Build Your Future With Northstar Traveling Agency
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-navy-foreground/85 sm:text-lg">
              Explore international career opportunities, discover destinations and take the next step
              toward your professional future.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                <Link to="/opportunities">
                  Explore Opportunities <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-navy-foreground/45 bg-navy/20 px-6 text-navy-foreground hover:bg-navy-foreground hover:text-navy">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
              <Button asChild size="lg" className="h-12 border border-accent bg-transparent px-6 text-accent hover:bg-accent hover:text-accent-foreground">
                <a href="/auth?mode=signup">
                  Create Account
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-4 text-navy-foreground/90 hover:bg-navy-foreground/10 hover:text-navy-foreground">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 px-4" aria-labelledby="home-search-title">
        <div className="mx-auto max-w-6xl rounded-lg border border-border bg-card p-5 shadow-lift sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Search className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-secondary">Start your search</p>
              <h2 id="home-search-title" className="font-display text-xl font-bold uppercase tracking-normal sm:text-2xl">
                Find Your Next Opportunity
              </h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder="Job title, keyword or company"
              aria-label="Job title, keyword or company"
              className="h-12"
            />
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder="Country or location"
              aria-label="Country or location"
              className="h-12"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 w-full" aria-label="Job category">
                <SelectValue placeholder="Job category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {activeCategories.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={search} size="lg" className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
              <Search className="mr-2 size-4" /> Search Opportunities
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page -mt-2 pb-2 pt-8 sm:pt-10" aria-label="Account access">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-secondary">Your career journey</p>
            <h2 className="mt-1.5 font-display text-lg font-bold sm:text-xl">Create an account to keep your opportunities together</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Save your progress, access your applications and return to Northstar Traveling Agency whenever you need.
            </p>
          </div>
          <div className="mt-4 flex shrink-0 flex-col gap-2 sm:mt-0 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <a href="/auth?mode=signup">Create Account</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16" aria-label="Northstar Traveling Agency opportunity statistics">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
          <Stat icon={<BriefcaseBusiness className="size-5" />} label="Available Opportunities" value={jobs.length} />
          <Stat icon={<Tags className="size-5" />} label="Job Categories" value={activeCategories.length} />
          <Stat icon={<Globe2 className="size-5" />} label="Countries" value={liveCountries} />
          <Stat icon={<CalendarPlus className="size-5" />} label="Recently Added" value={recentlyAdded} />
        </dl>
      </section>

      <section className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="container-page">
          <EditorialHeading
            eyebrow="Current openings"
            title="Featured Opportunities"
            description="Explore some of the latest opportunities available on Northstar Traveling Agency."
          />
          {featured.length === 0 ? (
            <EmptyState text="No published opportunities yet. Please check back soon." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((job) => <FeaturedOpportunityCard key={job.id} job={job} />)}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/opportunities">View All Opportunities <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <EditorialHeading
          eyebrow="International destinations"
          title="Explore Opportunities by Country"
          description="Choose a destination to see matching opportunities already available in our listings."
        />
        <div className="space-y-10">
          {countryRegions.map((region) => (
            <div key={region.name}>
              <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-normal text-foreground">
                {region.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {region.countries.map(([label, code]) => (
                  <Link
                    key={code}
                    to="/opportunities"
                    search={{ location: label }}
                    className="group flex min-h-28 flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-card"
                  >
                    <span className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-primary/10" aria-hidden="true">
                      <img
                        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                        alt=""
                        width={40}
                        height={28}
                        loading="lazy"
                        className="h-7 w-10 object-cover"
                      />
                    </span>
                    <span className="mt-4 flex items-end justify-between gap-2">
                      <span className="text-sm font-semibold leading-tight text-foreground">{label}</span>
                      <ArrowRight className="size-4 shrink-0 text-secondary transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div></div>
      </section>

      <section className="bg-navy py-20 text-navy-foreground sm:py-24">
        <div className="container-page">
          <EditorialHeading
            light
            eyebrow="A clearer path forward"
            title="Why Choose Northstar Traveling Agency"
            description="Practical tools and transparent information for exploring your next international career step."
          />
          <div className="grid gap-px overflow-hidden rounded-lg bg-navy-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe2, title: "Global Opportunities", body: "Explore opportunities across multiple international destinations." },
              { icon: Search, title: "Easy to Explore", body: "Find opportunities using our simple search and country filters." },
              { icon: FileSearch, title: "Clear Requirements", body: "Review job requirements and application instructions before applying." },
              { icon: Sparkles, title: "Career Journey", body: "Take the next step toward your international career goals." },
            ].map((item) => (
              <article key={item.title} className="bg-navy p-7 sm:p-8">
                <span className="flex size-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-6 text-base font-bold uppercase tracking-normal">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-foreground/70">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <EditorialHeading
          eyebrow="Simple steps"
          title="How It Works"
          description="Move from discovery to application with a clear view of every opportunity."
        />
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Globe2, step: "01", title: "Explore", body: "Browse available opportunities." },
            { icon: Search, step: "02", title: "Find Your Match", body: "Search by job, category or country." },
            { icon: CheckCircle2, step: "03", title: "Check Requirements", body: "Review qualifications and required documents." },
            { icon: Send, step: "04", title: "Apply", body: "Follow the application instructions for the opportunity." },
          ].map((item) => (
            <li key={item.step} className="relative border-t border-border pt-7">
              <span className="absolute -top-3 left-0 bg-background pr-3 font-serif text-2xl text-secondary">{item.step}</span>
              <item.icon className="size-7 text-primary" />
              <h3 className="mt-5 text-base font-bold uppercase tracking-normal">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface py-20 sm:py-24" aria-labelledby="testimonials-title">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-secondary">Customer stories</p>
            <h2 id="testimonials-title" className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">
              What Our Clients Say
            </h2>
            <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-border" />
              <span className="size-1.5 rotate-45 bg-accent" />
              <span className="h-px w-12 bg-border" />
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Read feedback shared by clients about their Northstar Traveling Agency experience.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <article
                key={testimonial.id}
                className="flex h-full flex-col rounded-lg border border-border bg-card p-7 shadow-card"
              >
                <div className="flex items-center justify-between gap-4">
                  <Quote className="size-8 text-accent" aria-hidden="true" />

                </div>
                <div className="mt-4 flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${index < testimonial.rating ? "fill-current text-accent" : "text-muted-foreground/30"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  “{testimonial.quote}”
                </blockquote>
                <footer className="mt-6 border-t border-border pt-5">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  {testimonial.location ? (
                    <p className="mt-1 text-sm text-muted-foreground">{testimonial.location}</p>
                  ) : null}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[430px] overflow-hidden bg-navy text-navy-foreground">
        <img
          src={careerBanner}
          alt="Professionals preparing for an international career journey at an airport"
          width={1920}
          height={800}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/65" />
        <div className="relative container-page flex min-h-[430px] items-center justify-center py-16 text-center">
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl font-light uppercase leading-tight tracking-normal sm:text-5xl">
              Your Next Opportunity Could Be Closer Than You Think
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-foreground/80 sm:text-lg">
              Explore international opportunities and take the next step in your career journey with Northstar Traveling Agency.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 bg-accent px-7 text-accent-foreground hover:bg-accent/90">
              <Link to="/opportunities">Browse Opportunities <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FeaturedOpportunityCard({ job }: { job: HomeJob }) {
  const gallery = [...(job.images ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
  const primary = gallery.find((image) => image.is_primary) ?? gallery[0];
  const image = categoryImage(job.category?.slug, job.primary_image ?? primary?.image_url);
  const isDemo = /\b(demo|sample)\b/i.test(`${job.title} ${job.description ?? ""}`);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-300/80 bg-slate-100 shadow-card ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 hover:bg-slate-200/80 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image}
          alt={job.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {job.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
          {job.verified ? <Badge className="bg-success text-success-foreground">Verified</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {isDemo ? (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-xs font-bold uppercase tracking-normal text-destructive">
            Demo Vacancy — Not a Verified Job
          </p>
        ) : null}
        {job.category ? <p className="text-xs font-semibold uppercase tracking-normal text-secondary">{job.category.name}</p> : null}
        <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-normal">{job.title}</h3>
        {(job.city || job.location || job.country) ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
            {[job.city ?? job.location, job.country].filter(Boolean).join(", ")}
          </p>
        ) : null}
        {job.description ? <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{job.description}</p> : null}
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              {job.salary ? <p className="font-display font-bold">{job.salary} {job.currency ?? ""}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(job.published_at ?? job.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/opportunities/$slug" params={{ slug: job.slug }}>View Details</Link>
              </Button>
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/apply" search={{ job: job.slug }}>Apply</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex min-h-32 items-center gap-4 bg-card p-5 sm:p-7">
      <span className="hidden size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex">{icon}</span>
      <div>
        <dd className="font-serif text-4xl font-medium leading-none text-primary">{value}</dd>
        <dt className="mt-2 text-xs font-semibold uppercase leading-snug tracking-normal text-muted-foreground">{label}</dt>
      </div>
    </div>
  );
}

function EditorialHeading({ eyebrow, title, description, light = false }: { eyebrow: string; title: string; description: string; light?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className={`text-xs font-semibold uppercase tracking-normal ${light ? "text-accent" : "text-secondary"}`}>{eyebrow}</p>
      <h2 className={`mt-4 font-serif text-4xl font-light leading-tight tracking-normal sm:text-5xl ${light ? "text-navy-foreground" : "text-foreground"}`}>{title}</h2>
      <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
        <span className={`h-px w-12 ${light ? "bg-navy-foreground/20" : "bg-border"}`} />
        <span className="size-1.5 rotate-45 bg-accent" />
        <span className={`h-px w-12 ${light ? "bg-navy-foreground/20" : "bg-border"}`} />
      </div>
      <p className={`mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${light ? "text-navy-foreground/70" : "text-muted-foreground"}`}>{description}</p>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">{text}</div>;
}