import { createFileRoute } from "@tanstack/react-router";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function publicStorageUrl(path: string) {
  const base = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  if (!base) return null;

  const safePath = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${base.replace(/\/$/, "")}/storage/v1/object/public/site-images/${safePath}`;
}

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const ext = path.split(".").pop()?.toLowerCase() ?? "";
        const contentType = TYPES[ext];
        if (!contentType) return new Response("Unsupported media type", { status: 415 });

        const url = publicStorageUrl(path);
        if (!url) {
          return new Response("Image storage is not configured", { status: 503 });
        }

        try {
          // The bucket is public, so image delivery must not depend on the
          // Supabase service-role secret being present in Vercel.
          const upstream = await fetch(url, {
            headers: { Accept: contentType },
            redirect: "follow",
          });

          if (!upstream.ok || !upstream.body) {
            return new Response("Not found", { status: 404 });
          }

          return new Response(upstream.body, {
            status: 200,
            headers: {
              "Content-Type": upstream.headers.get("content-type") || contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          console.error("[media] public storage fetch failed", error);
          return new Response("Image delivery failed", { status: 502 });
        }
      },
    },
  },
});
