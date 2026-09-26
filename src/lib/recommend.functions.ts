import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  skills: z.string().trim().min(3).max(2000),
  preferences: z.string().trim().max(1000).optional().default(""),
});

export type Recommendation = { slug: string; reason: string; score: number };

export const recommendOpportunities = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ items: Recommendation[]; error?: string }> => {
    const { fetchPublicOpportunities } = await import("./site");
    const { generateTextViaGateway, GatewayError } = await import("./ai-gateway.server");
    const jobs = (await fetchPublicOpportunities()) as Record<string, any>[];
    if (!jobs.length) return { items: [] };

    const catalog = jobs.slice(0, 80).map((j) => ({
      slug: j.slug,
      title: j.title,
      category: j.category?.name ?? null,
      country: j.country ?? null,
      city: j.city ?? j.location ?? null,
      type: j.employment_type ?? null,
      salary: j.salary ?? null,
      summary: String(j.short_description ?? j.description ?? "").slice(0, 300),
      requirements: String(j.requirements ?? "").slice(0, 300),
    }));

    const system =
      "You are a careful career-matching assistant for an international recruitment site. " +
      "Recommend only jobs from the provided catalog. Never invent jobs. Never promise employment, visas or placement. " +
      'Reply with JSON only: {"items":[{"slug":string,"score":number 0-100,"reason":string}]}. ' +
      "Return at most 6 items, best first, only genuinely relevant ones. Each reason is one friendly sentence under 30 words.";
    const prompt = `Job seeker skills & experience:\n${data.skills}\n\nCareer preferences:\n${data.preferences || "(none)"}\n\nCatalog:\n${JSON.stringify(catalog)}`;

    try {
      const text = await generateTextViaGateway(system, prompt);
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const valid = new Set(catalog.map((c) => c.slug));
      const items: Recommendation[] = (Array.isArray(json.items) ? json.items : [])
        .filter((i: any) => typeof i?.slug === "string" && valid.has(i.slug))
        .slice(0, 6)
        .map((i: any) => ({
          slug: i.slug,
          reason: String(i.reason ?? "").slice(0, 240),
          score: Math.max(0, Math.min(100, Number(i.score) || 0)),
        }));
      return { items };
    } catch (e) {
      if (e instanceof GatewayError) return { items: [], error: e.message };
      return { items: [], error: "We couldn't generate recommendations. Please try again." };
    }
  });
