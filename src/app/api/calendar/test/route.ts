import { NextResponse } from "next/server";
import { addAttendeeToEvent, getEventAttendees } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== "setup") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partyEventId = (process.env.GOOGLE_CALENDAR_EVENT_ID_PARTY || "").trim();
  const enabled = process.env.ENABLE_CALENDAR_SYNC;
  const hasCredentials = !!process.env.GOOGLE_CALENDAR_CREDENTIALS;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "";

  const debug = {
    enabled,
    enabledCheck: enabled === "true",
    hasCredentials,
    calendarId: calendarId ? `${calendarId.slice(0, 10)}...` : "MISSING",
    calendarIdTrimmed: calendarId.trim() ? true : false,
    partyEventId: partyEventId || "MISSING",
    overnightEventId: (process.env.GOOGLE_CALENDAR_EVENT_ID_OVERNIGHT || "").trim() || "MISSING",
    isEnabledFull: enabled === "true" && hasCredentials && !!calendarId,
  };

  const testEmail = searchParams.get("email") || "test@example.com";
  const testName = searchParams.get("name") || "Test User";

  let addResult: string;
  try {
    const success = await addAttendeeToEvent(partyEventId, testEmail, testName);
    addResult = success ? "SUCCESS" : "RETURNED_FALSE";
  } catch (err: any) {
    addResult = `ERROR: ${err?.message || String(err)}`;
  }

  let attendees: any[] = [];
  try {
    attendees = await getEventAttendees(partyEventId);
  } catch (err: any) {
    attendees = [{ error: err?.message || String(err) }];
  }

  return NextResponse.json({ debug, addResult, attendees });
}
