import type { Guest } from "./types";
import { EVENT_LABELS, CALENDAR_LINKS } from "./types";

const HOST_EMAIL = "kj9109@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://birthday-party-zeta.vercel.app";

function useResend(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function eventList(events: Guest["events"]): string[] {
  const items: string[] = [];
  if (events.winery) items.push(EVENT_LABELS.winery);
  if (events.dinnerParty) items.push(EVENT_LABELS.dinnerParty);
  if (events.stayingOver) items.push(EVENT_LABELS.stayingOver);
  return items;
}

function calendarLinksHtml(events: Guest["events"]): string {
  const links: string[] = [];
  if (events.winery)
    links.push(`<a href="${CALENDAR_LINKS.winery}" style="display:inline-block;padding:8px 16px;background:#D4AF37;color:#1a1a1a;border-radius:6px;text-decoration:none;font-weight:600;margin:4px;">Add Winery to Calendar</a>`);
  if (events.dinnerParty)
    links.push(`<a href="${CALENDAR_LINKS.dinnerParty}" style="display:inline-block;padding:8px 16px;background:#D4AF37;color:#1a1a1a;border-radius:6px;text-decoration:none;font-weight:600;margin:4px;">Add Dinner & Party to Calendar</a>`);
  if (events.stayingOver)
    links.push(`<a href="${CALENDAR_LINKS.stayingOver}" style="display:inline-block;padding:8px 16px;background:#D4AF37;color:#1a1a1a;border-radius:6px;text-decoration:none;font-weight:600;margin:4px;">Add Staying Over to Calendar</a>`);
  return links.join("\n");
}

function statusEmoji(status: string): string {
  if (status === "attending") return "✅";
  if (status === "maybe") return "🤔";
  return "❌";
}

function statusMessage(status: string, name: string): { heading: string; body: string } {
  const firstName = name.split(" ")[0];
  if (status === "attending") {
    return {
      heading: "You're on the list! 🎉",
      body: `We can't wait to celebrate with you, ${firstName}!`,
    };
  }
  if (status === "maybe") {
    return {
      heading: "We hope you can make it!",
      body: `Let us know when you decide, ${firstName} — we'd love to have you there.`,
    };
  }
  return {
    heading: "We'll miss you!",
    body: `Sorry you can't make it, ${firstName}. We'll be thinking of you!`,
  };
}

export async function sendHostNotification(guest: Guest, plusOne?: Guest): Promise<void> {
  if (!useResend()) {
    console.log("[EMAIL] Resend not configured — skipping host notification for", guest.name);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const events = eventList(guest.events);
  const plusOneInfo = plusOne ? `<p><strong>Plus One:</strong> ${plusOne.name}</p>` : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;padding:20px;">
      <h2 style="color:#1a1a1a;">${statusEmoji(guest.status)} ${guest.name} is ${guest.status}!</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 0;color:#666;">Name</td><td style="padding:6px 0;font-weight:600;">${guest.name}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${guest.email}</td></tr>
        ${guest.phone ? `<tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${guest.phone}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#666;">Status</td><td style="padding:6px 0;font-weight:600;">${guest.status}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Events</td><td style="padding:6px 0;">${events.join(", ") || "None selected"}</td></tr>
        ${guest.comment ? `<tr><td style="padding:6px 0;color:#666;">Comment</td><td style="padding:6px 0;">${guest.comment}</td></tr>` : ""}
      </table>
      ${plusOneInfo}
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: HOST_EMAIL,
      subject: `[RSVP] ${guest.name} is ${guest.status}!`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send host notification:", err);
  }
}

export async function sendGuestConfirmation(guest: Guest): Promise<void> {
  if (!useResend()) {
    console.log("[EMAIL] Resend not configured — skipping guest confirmation for", guest.name);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { heading, body } = statusMessage(guest.status, guest.name);
  const calLinks = calendarLinksHtml(guest.events);

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#D4AF37;font-size:28px;margin:0 0 8px;">${heading}</h1>
        <p style="color:#555;font-size:16px;margin:0;">${body}</p>
      </div>

      <div style="background:#FAFAF8;border:1px solid #F0E6C8;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;"><strong>📋 Your RSVP:</strong> ${guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}</p>
        <p style="margin:0 0 12px;"><strong>📅 Date:</strong> May 2–3, 2026</p>

        <hr style="border:none;border-top:1px solid #E8D5A3;margin:16px 0;" />

        <p style="font-weight:600;margin:0 0 8px;">Here's the plan:</p>
        <p style="margin:0 0 4px;">🍷 <strong>Winery</strong> (2–5 PM) — New Hope Winery, 6123 Lower York Rd, New Hope, PA</p>
        <p style="margin:0 0 4px;">🍝 <strong>Dinner & Evening Party</strong> — Chimney Hill Estate Inn, 207 Goat Hill Rd, Lambertville, NJ</p>
        <p style="margin:0 0 4px;">🏨 <strong>Staying Over</strong> — Chimney Hill Estate Inn</p>
      </div>

      ${calLinks ? `
        <div style="text-align:center;margin:24px 0;">
          <p style="color:#666;font-size:14px;margin:0 0 12px;">Add to your calendar:</p>
          ${calLinks}
        </div>
      ` : ""}

      <div style="text-align:center;margin-top:32px;">
        <a href="${SITE_URL}" style="display:inline-block;padding:12px 28px;background:#D4AF37;color:#1a1a1a;border-radius:8px;text-decoration:none;font-weight:600;">View Party Details</a>
      </div>

      <p style="text-align:center;color:#999;font-size:12px;margin-top:32px;">
        Daria's Birthday Celebration — May 2–3, 2026
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: guest.email,
      subject: "You're on the list! 🎉 Daria's Birthday — May 2-3",
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send guest confirmation:", err);
  }
}
