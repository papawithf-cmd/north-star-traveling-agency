import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/restore-opportunities")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { restoreOriginalOpportunities } = await import("@/lib/restore-original-opportunities.functions");
          const result = await restoreOriginalOpportunities();
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error("[restore-opportunities]", error);
          return Response.json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "Unknown restore error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
