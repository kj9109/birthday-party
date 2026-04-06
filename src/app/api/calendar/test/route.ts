import { NextResponse } from "next/server";
import { addAttendeeToEvent, getEventAttendees } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== "setup") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partyEventId = process.env.GOOGLE_CALENDAR_EVENT_ID_PARTY || "";
  const enabled = process.env.ENABLE_CALENDAR_SYNC;
  const hasCredentials = !!process.env.GOOGLE_CALENDAR_CREDENTIALS;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "";

  // Debug info
  const debug = {
    enabled,
    hasCredentials,
    calendarId: calendarId ? `${calendarId.slice(0, 5)}...` : "MISSING",
    partyEventId: partyEventId || "MISSING",
    overnightEventId: process.env.GOOGLE_CALENDAR_EVENT_ID_OVERNIGHT || "MISSING",
  };

  // Try to add a test attendee
  const testEmail = searchParams.get("email") || "test@example.com";
  const testName = searchParams.get("name") || "Test User";

  let addResult: string;
  try {
    const success = await addAttendeeToEvent(partyEventId, testEmail, testName);
    addResult = success ? "SUCCESS" : "SKIPPED (not enabled or invalid)";
  } catch (err: any) {
    addResult = `ERROR: ${err?.message || String(err)}`;
  }

  // Get current attendees
  let attendees: any[] = [];
  try {
    attendees = await getEventAttendees(partyEventId);
  } catch (err: any) {
    attendees = [{ error: err?.message || String(err) }];
  }

  return NextResponse.json({ debug, addResult, attendees });
}
