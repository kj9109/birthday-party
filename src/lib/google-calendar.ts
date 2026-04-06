/**
 * Google Calendar API Integration (OAuth)
 *
 * Uses the calendar owner's OAuth tokens (not a service account)
 * so we have full permission to add/remove attendees.
 * Tokens are stored in Vercel KV and auto-refresh.
 */

import { google, calendar_v3 } from "googleapis";
import { getKey, setKey } from "./db";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

function isEnabled(): boolean {
  return (
    (process.env.ENABLE_CALENDAR_SYNC || "").trim() === "true" &&
    !!process.env.GOOGLE_OAUTH_CLIENT_ID &&
    !!process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
}

async function getAuthenticatedCalendar(): Promise<calendar_v3.Calendar | null> {
  if (!isEnabled()) return null;

  const tokens = await getKey<StoredTokens>("google_calendar_tokens");
  if (!tokens?.refresh_token) {
    console.log("[Calendar] No OAuth tokens found. Visit /api/calendar/oauth-start to authorize.");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    token_type: tokens.token_type,
  });

  // Auto-refresh: if token is expired, the client refreshes automatically.
  // Save the new tokens back to KV.
  oauth2Client.on("tokens", async (newTokens) => {
    const updated: StoredTokens = {
      ...tokens,
      access_token: newTokens.access_token || tokens.access_token,
      expiry_date: newTokens.expiry_date || tokens.expiry_date,
    };
    if (newTokens.refresh_token) {
      updated.refresh_token = newTokens.refresh_token;
    }
    await setKey("google_calendar_tokens", updated);
    console.log("[Calendar] OAuth tokens refreshed and saved");
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

function getCalendarId(): string {
  return (process.env.GOOGLE_CALENDAR_ID || "").trim();
}

/**
 * List upcoming events on the calendar.
 */
export async function listEvents(): Promise<calendar_v3.Schema$Event[]> {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return [];

  try {
    const res = await calendar.events.list({
      calendarId: getCalendarId(),
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items || [];
  } catch (err) {
    console.error("[Calendar] Failed to list events:", err);
    return [];
  }
}

/**
 * Get the current attendees of an event.
 */
export async function getEventAttendees(
  eventId: string
): Promise<calendar_v3.Schema$EventAttendee[]> {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return [];

  try {
    const res = await calendar.events.get({
      calendarId: getCalendarId(),
      eventId,
    });
    return res.data.attendees || [];
  } catch (err) {
    console.error("[Calendar] Failed to get event attendees:", err);
    return [];
  }
}

/**
 * Add an attendee to a Google Calendar event.
 */
export async function addAttendeeToEvent(
  eventId: string,
  email: string,
  displayName: string
): Promise<boolean> {
  if (!email || !email.includes("@")) {
    console.log("[Calendar] Skipping add - invalid email:", email);
    return false;
  }

  const calendar = await getAuthenticatedCalendar();
  if (!calendar) {
    console.log("[Calendar] Skipping add - not authenticated");
    return false;
  }

  try {
    const calendarId = getCalendarId();
    const event = await calendar.events.get({ calendarId, eventId });
    const attendees = event.data.attendees || [];

    const existing = attendees.find(
      (a) => a.email?.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      if (existing.responseStatus === "declined") {
        existing.responseStatus = "accepted";
        existing.displayName = displayName;
        await calendar.events.patch({
          calendarId,
          eventId,
          sendUpdates: "none",
          requestBody: { attendees },
        });
        console.log(`[Calendar] Updated ${email} to accepted on event ${eventId}`);
      } else {
        console.log(`[Calendar] ${email} already on event ${eventId}`);
      }
      return true;
    }

    attendees.push({
      email,
      displayName,
      responseStatus: "accepted",
    });

    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: "none",
      requestBody: { attendees },
    });

    console.log(`[Calendar] Added ${email} (${displayName}) to event ${eventId}`);
    return true;
  } catch (err: any) {
    const msg = err?.message || err?.errors?.[0]?.message || String(err);
    console.error(`[Calendar] Failed to add ${email} to event ${eventId}:`, msg);
    throw new Error(`Calendar add failed: ${msg}`);
  }
}

/**
 * Remove an attendee or mark them as declined.
 */
export async function removeAttendeeFromEvent(
  eventId: string,
  email: string
): Promise<boolean> {
  if (!email || !email.includes("@")) return false;

  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return false;

  try {
    const calendarId = getCalendarId();
    const event = await calendar.events.get({ calendarId, eventId });
    const attendees = event.data.attendees || [];

    const idx = attendees.findIndex(
      (a) => a.email?.toLowerCase() === email.toLowerCase()
    );
    if (idx === -1) return true;

    attendees[idx].responseStatus = "declined";

    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: "none",
      requestBody: { attendees },
    });

    console.log(`[Calendar] Marked ${email} as declined on event ${eventId}`);
    return true;
  } catch (err: any) {
    console.error(`[Calendar] Failed to remove ${email}:`, err?.message);
    return false;
  }
}

/**
 * Get list of declined attendee emails.
 */
export async function getDeclinedAttendees(eventId: string): Promise<string[]> {
  const attendees = await getEventAttendees(eventId);
  return attendees
    .filter((a) => a.responseStatus === "declined" && a.email)
    .map((a) => a.email!.toLowerCase());
}
