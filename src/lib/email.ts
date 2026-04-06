import type { Guest } from "./types";

const HOST_EMAIL = "kj9109@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://partyfordaria.com";

function useResend(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function statusEmoji(status: string): string {
  if (status === "attending") return "✅";
  if (status === "maybe") return "🤔";
  return "❌";
}

function statusMessage(status: string, name: string): { heading: string; body: string; subject: string } {
  const firstName = name.split(" ")[0];
  if (status === "attending") {
    return {
      heading: "You're on the list! 🎉",
      body: `We can't wait to celebrate with you, ${firstName}!`,
      subject: `You're in! 🎉 Daria's Surprise Birthday - May 2`,
    };
  }
  if (status === "maybe") {
    return {
      heading: "We hope you can make it!",
      body: `Let us know when you decide, ${firstName}. We'd love to have you there!`,
      subject: `RSVP received - Daria's Surprise Birthday - May 2`,
    };
  }
  return {
    heading: "We'll miss you!",
    body: `Sorry you can't make it, ${firstName}. We'll be thinking of you!`,
    subject: `RSVP received - Daria's Birthday - May 2`,
  };
}

/**
 * Generate an .ics calendar invite for the party.
 * Returns the raw ICS string.
 */
function generateCalendarInvite(guestName: string): string {
  // Party: May 2, 2026 3:00 PM - 11:59 PM ET
  // ET = UTC-4 in May (EDT)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PartyForDaria//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    "DTSTART:20260502T190000Z",  // 3:00 PM ET = 19:00 UTC
    "DTEND:20260503T035900Z",    // 11:59 PM ET = 03:59 UTC next day
    `SUMMARY:Daria's Surprise Birthday Party 🎉`,
    "LOCATION:Chimney Hill Estate Inn\\, 207 Goat Hill Rd\\, Lambertville\\, NJ 08530",
    `DESCRIPTION:Like Fine Wine - Daria's Surprise Birthday Party\\n\\n` +
      `3:00 PM - Party Starts (Daria arrives shortly after!)\\n` +
      `3:00-6:30 PM - Apps\\, Drinks\\, Games\\, Tarotist\\, Live Music\\n` +
      `7:00 PM - Dinner (Catered Italian Classics)\\n` +
      `9:00 PM - Evening Festivities\\n\\n` +
      `Chimney Hill Estate Inn\\n207 Goat Hill Rd\\, Lambertville\\, NJ 08530\\n\\n` +
      `Details: ${SITE_URL}`,
    `ORGANIZER;CN=Kyle:mailto:${HOST_EMAIL}`,
    `UID:daria-bday-2026-${Date.now()}@partyfordaria.com`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Daria's Surprise Birthday Party is tomorrow!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export async function sendHostNotification(guest: Guest, plusOne?: Guest): Promise<void> {
  if (!useResend()) {
    console.log("[EMAIL] Resend not configured, skipping host notification for", guest.name);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const plusOneInfo = plusOne ? `<p><strong>Plus One:</strong> ${plusOne.name}</p>` : "";
  const stayingOver = guest.events?.stayingOver ? "Yes" : "No";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;padding:20px;">
      <h2 style="color:#1a1a1a;">${statusEmoji(guest.status)} ${guest.name} is ${guest.status}!</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 0;color:#666;">Name</td><td style="padding:6px 0;font-weight:600;">${guest.name}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${guest.email}</td></tr>
        ${guest.phone ? `<tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${guest.phone}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#666;">Status</td><td style="padding:6px 0;font-weight:600;">${guest.status}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Staying overnight</td><td style="padding:6px 0;">${stayingOver}</td></tr>
        ${guest.comment ? `<tr><td style="padding:6px 0;color:#666;">Comment</td><td style="padding:6px 0;">${guest.comment}</td></tr>` : ""}
      </table>
      ${plusOneInfo}
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: HOST_EMAIL,
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
    console.log("[EMAIL] Resend not configured, skipping guest confirmation for", guest.name);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { heading, body, subject } = statusMessage(guest.status, guest.name);

  // Generate .ics calendar invite for attending/maybe guests
  const icsContent = (guest.status === "attending" || guest.status === "maybe")
    ? generateCalendarInvite(guest.name)
    : null;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <p style="color:#722F37;font-size:18px;font-style:italic;margin:0 0 4px;">Like Fine Wine</p>
        <h1 style="color:#D4AF37;font-size:28px;margin:0 0 8px;">${heading}</h1>
        <p style="color:#555;font-size:16px;margin:0;">${body}</p>
      </div>

      <div style="background:#FAFAF8;border:1px solid #F0E6C8;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;"><strong>📋 Your RSVP:</strong> ${guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}</p>
        <p style="margin:0 0 12px;"><strong>📅 Date:</strong> Saturday, May 2, 2026</p>
        <p style="margin:0 0 12px;"><strong>🕐 Time:</strong> 3:00 PM</p>
        <p style="margin:0 0 0;"><strong>📍 Venue:</strong> Chimney Hill Estate Inn</p>
        <p style="margin:0 0 0;color:#888;font-size:13px;padding-left:24px;">207 Goat Hill Rd, Lambertville, NJ 08530</p>

        <hr style="border:none;border-top:1px solid #E8D5A3;margin:16px 0;" />

        <p style="font-weight:600;margin:0 0 8px;">The plan:</p>
        <p style="margin:0 0 4px;">🥂 <strong>3:00 PM</strong> - Party Starts (Daria arrives shortly after!)</p>
        <p style="margin:0 0 4px;">🎵 <strong>3:00-6:30 PM</strong> - Apps, Drinks, Games, Tarotist, Live Music</p>
        <p style="margin:0 0 4px;">🍝 <strong>7:00 PM</strong> - Dinner (Catered Italian Classics)</p>
        <p style="margin:0 0 4px;">🔥 <strong>9:00 PM</strong> - Evening Festivities</p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}" style="display:inline-block;padding:12px 28px;background:#D4AF37;color:#1a1a1a;border-radius:8px;text-decoration:none;font-weight:600;">View Party Details</a>
      </div>

      ${guest.status !== "declined" ? `
        <p style="text-align:center;color:#888;font-size:13px;margin-top:24px;">
          A calendar invite is attached to this email. Open it to add the party to your calendar.
        </p>
      ` : ""}

      <p style="text-align:center;color:#bbb;font-size:11px;margin-top:32px;">
        This is a surprise party! Please don't tell Daria 🤫
      </p>
    </div>
  `;

  try {
    const emailPayload: Record<string, unknown> = {
      from: FROM_EMAIL,
      replyTo: HOST_EMAIL,
      to: guest.email,
      subject,
      html,
    };

    // Attach .ics calendar invite for attending/maybe guests
    if (icsContent) {
      emailPayload.attachments = [
        {
          filename: "daria-birthday-party.ics",
          content: Buffer.from(icsContent).toString("base64"),
          type: "text/calendar; method=REQUEST",
        },
      ];
    }

    await resend.emails.send(emailPayload as any);
  } catch (err) {
    console.error("[EMAIL] Failed to send guest confirmation:", err);
  }
}
