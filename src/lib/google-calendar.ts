/**
 * Google Calendar API Integration
 *
 * Adds/removes attendees from Google Calendar events when guests RSVP.
 * Uses a service account for authentication.
 * All operations are non-blocking — failures are logged but don't break the RSVP flow.
 */

import { google, calendar_v3 } from "googleapis";

function isEnabled(): boolean {
  return (
    (process.env.ENABLE_CALENDAR_SYNC || "").trim() === "true" &&
    !!process.env.GOOGLE_CALENDAR_CREDENTIALS &&
    !!(process.env.GOOGLE_CALENDAR_ID || "").trim()
  );
}

let calendarClient: calendar_v3.Calendar | null = null;

function getCalendar(): calendar_v3.Calendar {
  if (calendarClient) return calendarClient;

  const credentials = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS || "{}");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  calendarClient = google.calendar({ version: "v3", auth });
  return calendarClient;
}

function getCalendarId(): string {
  return (process.env.GOOGLE_CALENDAR_ID || "").trim();
}

/**
 * List upcoming events on the calendar (useful for finding event IDs).
 */
export async function listEvents(): Promise<calendar_v3.Schema$Event[]> {
  if (!isEnabled()) return [];

  try {
    const calendar = getCalendar();
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
  if (!isEnabled()) return [];

  try {
    const calendar = getCalendar();
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
 * Fetches current attendees, appends the new one, updates the event.
 * Uses sendUpdates: 'none' to avoid Google sending invitation emails.
 */
export async function addAttendeeToEvent(
  eventId: string,
  email: string,
  displayName: string
): Promise<boolean> {
  if (!isEnabled() || !email || !email.includes("@")) {
    console.log("[Calendar] Skipping add attendee — not enabled or invalid email");
    return false;
  }

  try {
    const calendar = getCalendar();
    const calendarId = getCalendarId();

    // Fetch current event
    const event = await calendar.events.get({ calendarId, eventId });
    const attendees = event.data.attendees || [];

    // Check if already an attendee
    const existing = attendees.find(
      (a) => a.email?.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      // Update their status to accepted if they were previously declined
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

    // Add new attendee
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
    // Re-throw so callers can see the actual error
    throw new Error(`Calendar add failed: ${msg}`);
  }
}

/**
 * Remove an attendee from a Google Calendar event or mark them as declined.
 */
export async function removeAttendeeFromEvent(
  eventId: string,
  email: string
): Promise<boolean> {
  if (!isEnabled() || !email || !email.includes("@")) return false;

  try {
    const calendar = getCalendar();
    const calendarId = getCalendarId();

    const event = await calendar.events.get({ calendarId, eventId });
    const attendees = event.data.attendees || [];

    const idx = attendees.findIndex(
      (a) => a.email?.toLowerCase() === email.toLowerCase()
    );
    if (idx === -1) {
      console.log(`[Calendar] ${email} not found on event ${eventId}`);
      return true;
    }

    // Mark as declined rather than removing (preserves history)
    attendees[idx].responseStatus = "declined";

    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: "none",
      requestBody: { attendees },
    });

    console.log(`[Calendar] Marked ${email} as declined on event ${eventId}`);
    return true;
  } catch (err) {
    console.error(`[Calendar] Failed to remove ${email} from event ${eventId}:`, err);
    return false;
  }
}

/**
 * Sync calendar attendees back to the website.
 * Returns a list of emails that have been declined/removed on the calendar
 * but are still marked as attending on the website.
 */
export async function getDeclinedAttendees(
  eventId: string
): Promise<string[]> {
  if (!isEnabled()) return [];

  try {
    const attendees = await getEventAttendees(eventId);
    return attendees
      .filter((a) => a.responseStatus === "declined" && a.email)
      .map((a) => a.email!.toLowerCase());
  } catch (err) {
    console.error("[Calendar] Failed to get declined attendees:", err);
    return [];
  }
}
