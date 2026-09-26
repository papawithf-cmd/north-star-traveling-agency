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
  return `/api/public/media/${path}`;
}

export function categoryImage(slug?: string | null, custom?: string | null) {
  const resolved = mediaUrl(custom);
  if (resolved) return resolved;
  if (slug && fallbackImages[slug]) return fallbackImages[slug]!;
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

export const OPPORTUNITY_SELECT =
  "*, category:categories(id,name,slug), company:companies(id,name,slug,logo,verified), images:opportunity_images(id,image_url,display_order,is_primary)";

export async function fetchSettings() {
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
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
  if (error) throw error;
  return data ?? [];
}

export async function fetchCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export type AnyRecord = Record<string, unknown>;
