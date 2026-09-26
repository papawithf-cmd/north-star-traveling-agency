import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_ADMIN_EMAIL = "northstaragencyweb@gmail.com";

type NotifyResult = { sent: boolean; reason?: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends the admin notification for a freshly submitted application.
 * Runs server-side only: the Resend credentials never reach the browser.
 */
export const notifyAdminOfApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { applicationId: string; origin: string }) => {
    if (!input?.applicationId || typeof input.applicationId !== "string") {
      throw new Error("applicationId is required");
    }
    const origin = typeof input.origin === "string" && input.origin.startsWith("http") ? input.origin : "";
    return { applicationId: input.applicationId, origin };
  })
  .handler(async ({ data, context }): Promise<NotifyResult> => {
    const { data: app, error } = await context.supabase
      .from("applications")
      .select("id, full_name, email, phone, job_category, country_of_interest, created_at")
      .eq("id", data.applicationId)
      .maybeSingle();

    if (error || !app) return { sent: false, reason: "application_not_found" };

    const resendKey = process.env["RESEND_API_KEY"];
    if (!resendKey) {
      return { sent: false, reason: "email_not_configured" };
    }

    const adminEmail = process.env["ADMIN_NOTIFY_EMAIL"] || DEFAULT_ADMIN_EMAIL;
    const fromEmail =
      process.env["RESEND_FROM_EMAIL"] || "NorthstarTravelingAgency <onboarding@resend.dev>";
    const link = `${data.origin}/admin/applications/${app.id}`;
    const submitted = new Date(app.created_at).toUTCString();

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6">
        <h2 style="color:#0b1f3a;margin:0 0 16px">New Client Application</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
          <tr><td><strong>Full name</strong></td><td>${escapeHtml(app.full_name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(app.email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(app.phone ?? "")}</td></tr>
          <tr><td><strong>Job category</strong></td><td>${escapeHtml(app.job_category ?? "—")}</td></tr>
          <tr><td><strong>Country of interest</strong></td><td>${escapeHtml(app.country_of_interest ?? "—")}</td></tr>
          <tr><td><strong>Submitted</strong></td><td>${escapeHtml(submitted)}</td></tr>
        </table>
        ${
          data.origin
            ? `<p style="margin-top:20px"><a href="${link}" style="background:#0b1f3a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">View application in admin portal</a></p>`
            : ""
        }
      </div>`;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: app.email,
        subject: "New Client Application - NorthstarTravelingAgency",
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[applications] email send failed [${response.status}]: ${body}`);
      return { sent: false, reason: `email_failed_${response.status}` };
    }

    return { sent: true };
  });
