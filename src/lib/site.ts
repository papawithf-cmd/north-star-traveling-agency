import { supabase } from "@/integrations/supabase/client";

import airHostess from "@/assets/cat-air-hostess.jpg";
import airmen from "@/assets/cat-airmen.jpg";
import groundCrew from "@/assets/cat-ground-crew.jpg";
import caregivers from "@/assets/cat-caregivers.jpg";
import security from "@/assets/cat-security.jpg";
import courier from "@/assets/cat-courier.jpg";
import delivery from "@/assets/cat-delivery.jpg";
import drivers from "@/assets/cat-drivers.jpg";
import restaurant from "@/assets/cat-restaurant.jpg";
import nursing from "@/assets/cat-nursing.jpg";
import nanny from "@/assets/cat-nanny.jpg";
import generalLabour from "@/assets/cat-general-labour.jpg";
import agriculture from "@/assets/cat-agriculture.jpg";
import barista from "@/assets/cat-barista.jpg";
import beautySalon from "@/assets/cat-beauty-salon.jpg";
import construction from "@/assets/cat-construction.jpg";
import customerService from "@/assets/cat-customer-service.jpg";
import electricians from "@/assets/cat-electricians.jpg";
import engineering from "@/assets/cat-engineering.jpg";
import factory from "@/assets/cat-factory.jpg";
import hospitalityHotels from "@/assets/cat-hospitality-hotels.jpg";
import housekeeping from "@/assets/cat-housekeeping.jpg";
import logistics from "@/assets/cat-logistics.jpg";
import plumbers from "@/assets/cat-plumbers.jpg";
import warehouse from "@/assets/cat-warehouse.jpg";
import { RESTORED_PUBLIC_OPPORTUNITIES } from "@/lib/restored-public-opportunities";

export const PUBLIC_STATUSES = ["published", "approved", "featured", "urgent"];

export const STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "published",
  "expired",
  "closed",
  "rejected",
  "archived",
] as const;

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Seasonal",
  "Internship",
];

export const APPLICATION_METHODS = ["link", "email", "phone", "whatsapp", "website"];

const fallbackImages: Record<string, string> = {
  "air-hostess": airHostess,
  airmen: airmen,
  "ground-crew": groundCrew,
  caregivers: caregivers,
  security: security,
  "private-courier": courier,
  courier: courier,
  delivery: delivery,
  "delivery-companies": delivery,
  drivers: drivers,
  driver: drivers,
  chauffeur: drivers,
  "truck-drivers": drivers,
  "restaurant-food-shop": restaurant,
  "restaurant-food-service": restaurant,
  restaurant: restaurant,
  "restaurant-food": restaurant,
  "food-shop": restaurant,
  hospitality: restaurant,
  "nursing-healthcare": nursing,
  nursing: nursing,
  healthcare: nursing,
  "nanny-childcare": nanny,
  nanny: nanny,
  childcare: nanny,
  "general-labour": generalLabour,
  "general-labor": generalLabour,
  labour: generalLabour,
  "agriculture-farming": agriculture,
  agriculture: agriculture,
  farming: agriculture,
  "barista-coffee-shop": barista,
  barista: barista,
  "coffee-shop": barista,
  "beauty-salon": beautySalon,
  beauty: beautySalon,
  salon: beautySalon,
  "construction-skilled-trades": construction,
  construction: construction,
  "skilled-trades": construction,
  "customer-service": customerService,
  "electricians-technicians": electricians,
  electricians: electricians,
  technicians: electricians,
  engineering: engineering,
  "factory-manufacturing": factory,
  factory: factory,
  manufacturing: factory,
  "hospital-hotels": hospitalityHotels,
  hotels: hospitalityHotels,
  "housekeeping-cleaning": housekeeping,
  housekeeping: housekeeping,
  cleaning: housekeeping,
  "logistics-supply-chain": logistics,
  logistics: logistics,
  "supply-chain": logistics,
  plumbers: plumbers,
  plumbing: plumbers,
  warehouse: warehouse,
};

const gallery = [airHostess];

/** Normalize a category slug so odd spacing/casing never breaks image lookup. */
function normalizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a stored image value (storage path or external URL) to a displayable URL. */
export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("/") || path.startsWith("data:")) return path;
  // Values under src/assets are bundled app assets, not storage objects.
  if (path.startsWith("src/assets/")) return null;
  return supabase.storage.from("site-images").getPublicUrl(path.replace(/^\/+/, "")).data.publicUrl;
}

/**
 * Returns an error message when a pasted link is a share/viewer page instead of a
 * direct image file (e.g. share.google, Google Photos/Drive links), otherwise null.
 */
export function imageUrlProblem(url: string) {
  const v = url.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return "Image link must start with https://";
  if (/(share\.google|photos\.app\.goo\.gl|photos\.google\.com|drive\.google\.com\/(file|open)|goo\.gl\/)/i.test(v)) {
    return "This is a share page link, not an image file. Please use Upload image instead.";
  }
  return null;
}

export function categoryImage(slug?: string | null, custom?: string | null) {
  const resolved = mediaUrl(custom);
  if (resolved) return resolved;
  if (slug) {
    const match = fallbackImages[normalizeSlug(slug)];
    if (match) return match;
  }
  // Unknown categories get a neutral default instead of an unrelated photo.
  return gallery[0]!;
}

export function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function isExpired(deadline?: string | null) {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Returns a slug that is safe to insert/update in the opportunities table.
 * The database keeps the UNIQUE constraint; this only resolves normal admin
 * form collisions by adding -2, -3, etc. while excluding the current record.
 */
export async function uniqueOpportunitySlug(value: string, excludeId?: string | null) {
  const base = slugify(value) || `opportunity-${Date.now()}`;
  const { data, error } = await supabase
    .from("opportunities")
    .select("id, slug")
    .like("slug", `${base}%`);

  if (error) throw error;

  const taken = new Set(
    (data ?? [])
      .filter((row) => !excludeId || row.id !== excludeId)
      .map((row) => row.slug),
  );

  if (!taken.has(base)) return base;

  for (let suffix = 2; ; suffix += 1) {
    const suffixText = `-${suffix}`;
    const candidate = `${base.slice(0, Math.max(1, 80 - suffixText.length))}${suffixText}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export const OPPORTUNITY_SELECT =
  "*, category:categories(id,name,slug), company:companies(id,name,slug,logo,verified), images:opportunity_images(id,image_url,display_order,is_primary)";

export async function fetchSettings() {
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  // The original project name is Northstar Traveling Agency. Normalize any
  // stale legacy "SkyBridge Careers" value so the public site never reverts
  // to the old branding while the database is being repaired.
  if (data && data.site_name === "SkyBridge Careers") {
    return {
      ...data,
      site_name: "Northstar Traveling Agency",
      about_text:
        data.about_text?.replace(/SkyBridge Careers/g, "Northstar Traveling Agency") ??
        "Northstar Traveling Agency connects job seekers with verified employment opportunities.",
    };
  }

  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPublicOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_SELECT)
    .in("status", PUBLIC_STATUSES)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const current = error ? [] : (data ?? []);
  const existingSlugs = new Set(current.map((item) => item.slug));

  // Keep any live database records, but restore the original project-defined
  // opportunities that are missing so the public catalogue does not disappear.
  const restored = RESTORED_PUBLIC_OPPORTUNITIES.filter((item) => !existingSlugs.has(item.slug));

  if (error) {
    console.warn("Public opportunities database query failed; using restored catalogue.", error.message);
  }

  return [...current, ...restored];
}

export type TestimonialRow = {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  published: boolean;
  display_order: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

const DEMO_TESTIMONIALS: TestimonialRow[] = [
  {
    id: "demo-1",
    name: "Sarah M.",
    location: "Nairobi",
    quote: "Northstar Traveling Agency helped me understand the application process clearly and prepared me for my next career step.",
    rating: 5,
    published: true,
    display_order: 1,
    is_demo: true,
    created_at: "2026-09-27T00:00:00.000Z",
    updated_at: "2026-09-27T00:00:00.000Z",
  },
  {
    id: "demo-2",
    name: "David K.",
    location: "Mombasa",
    quote: "The opportunity details were easy to review, and the application instructions were straightforward.",
    rating: 5,
    published: true,
    display_order: 2,
    is_demo: true,
    created_at: "2026-09-27T00:00:00.000Z",
    updated_at: "2026-09-27T00:00:00.000Z",
  },
  {
    id: "demo-3",
    name: "Grace W.",
    location: "Nakuru",
    quote: "A clean and helpful experience for finding international employment opportunities and checking requirements.",
    rating: 5,
    published: true,
    display_order: 3,
    is_demo: true,
    created_at: "2026-09-27T00:00:00.000Z",
    updated_at: "2026-09-27T00:00:00.000Z",
  },
];

export async function fetchPublicTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Testimonials table is unavailable; using public demo testimonials.", error.message);
    return DEMO_TESTIMONIALS;
  }

  return data?.length ? data : DEMO_TESTIMONIALS;
}

export async function fetchCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export type AnyRecord = Record<string, unknown>;
