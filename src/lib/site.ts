import { supabase } from "@/integrations/supabase/client";

import airHostess from "@/assets/cat-air-hostess.jpg";
import airmen from "@/assets/cat-airmen.jpg";
import groundCrew from "@/assets/cat-ground-crew.jpg";
import caregivers from "@/assets/cat-caregivers.jpg";
import security from "@/assets/cat-security.jpg";
import courier from "@/assets/cat-courier.jpg";
import delivery from "@/assets/cat-delivery.jpg";

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
  delivery: delivery,
};

const gallery = [airHostess, airmen, groundCrew, caregivers, security, courier, delivery];

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
  if (!slug) return gallery[0]!;
  let sum = 0;
  for (const ch of slug) sum += ch.charCodeAt(0);
  return gallery[sum % gallery.length]!;
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
