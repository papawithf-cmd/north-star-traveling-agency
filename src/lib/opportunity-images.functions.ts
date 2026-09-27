import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Keep remote imports bounded so the admin tool stays predictable.
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type Input = {
  url: string;
  folder?: string;
  persist?: boolean;
};

function cleanUrl(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) throw new Error("Image URL is required");

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Please enter a valid http(s) image or webpage URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http:// and https:// URLs are supported.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    throw new Error("That URL cannot be accessed.");
  }

  return parsed;
}

function extractMetaImage(html: string, baseUrl: URL) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const property = tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (property !== "og:image" && property !== "twitter:image" && property !== "twitter:image:src") continue;

    const content = tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!content) continue;

    try {
      return new URL(content.replace(/&amp;/g, "&"), baseUrl).toString();
    } catch {
      // Keep checking other metadata candidates.
    }
  }

  const link = html.match(/<link\b[^>]*rel\s*=\s*["'][^"']*image_src[^"']*["'][^>]*>/i)?.[0];
  const href = link?.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
  if (href) {
    try {
      return new URL(href.replace(/&amp;/g, "&"), baseUrl).toString();
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchSource(url: URL) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NorthstarImageImporter/1.0)",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`The URL returned HTTP ${response.status}.`);
  }

  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

  if (ACCEPTED_TYPES.has(contentType)) {
    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BYTES) throw new Error("The image is larger than 5MB.");

    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) throw new Error("The image is larger than 5MB.");

    return {
      imageUrl: response.url || url.toString(),
      contentType,
      buffer,
    };
  }

  if (!contentType.includes("text/html")) {
    throw new Error("This URL did not return a JPG, PNG, or WebP image.");
  }

  const html = await response.text();
  const imageUrl = extractMetaImage(html, new URL(response.url || url.toString()));
  if (!imageUrl) {
    throw new Error(
      "This webpage does not expose a usable preview image. Please use a direct image URL or choose Upload image.",
    );
  }

  const imageResponse = await fetchSource(cleanUrl(imageUrl));
  return { ...imageResponse, imageUrl };
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _role: "admin",
    _user_id: context.userId,
  });

  if (error || !data) throw new Error("Unauthorized: administrator access is required");
}

export const resolveOpportunityImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Input) => ({
    url: cleanUrl(input?.url).toString(),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const source = await fetchSource(cleanUrl(data.url));
    return { imageUrl: source.imageUrl };
  });

export const importOpportunityImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Input) => {
    const folder =
      typeof input?.folder === "string" && input.folder.trim()
        ? input.folder.trim().replace(/[^a-zA-Z0-9/_-]+/g, "-").replace(/-+$/g, "")
        : "opportunities";
    return {
      url: cleanUrl(input?.url).toString(),
      folder,
    };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const source = await fetchSource(cleanUrl(data.url));
    const ext = ACCEPTED_TYPES.get(source.contentType);
    if (!ext) throw new Error("Only JPG, PNG and WebP images are supported.");

    const path = `${data.folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, new Blob([source.buffer], { type: source.contentType }), {
        contentType: source.contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Image save failed: ${error.message}`);
    }

    const { data: stored, error: verifyError } = await supabaseAdmin.storage
      .from("site-images")
      .download(path);

    if (verifyError || !stored) {
      throw new Error("The image was saved but could not be verified. Nothing was added to the opportunity.");
    }

    return {
      path,
      previewUrl: `/api/public/media/${path}`,
    };
  });
