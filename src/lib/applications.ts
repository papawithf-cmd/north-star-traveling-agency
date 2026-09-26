export const APPLICATION_STATUSES = ["pending", "under_review", "approved", "rejected"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PASSPORT_STATUSES = [
  "Valid passport",
  "Passport expired",
  "Applied / in process",
  "No passport yet",
];

export function statusLabel(status: string) {
  return status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function statusClasses(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "under_review":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-muted text-foreground";
  }
}
