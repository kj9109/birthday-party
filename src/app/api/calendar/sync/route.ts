/**
 * Calendar Sync — pulls declined attendees from Google Calendar
 * and updates the website's guest list accordingly.
 *
 * Called via Vercel Cron every 10 minutes, or manually.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDeclinedAttendees } from "@/lib/google-calendar";
import { getKey, setKey } from "@/lib/db";
import type { Guest } from "@/lib/types";

export async function GET(request: NextRequest) {
  // Verify this is a cron job or authorized request
  const authHeader = request.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = new URL(request.url).searchParams.get("secret") === process.env.CALENDAR_ADMIN_SECRET;

  if (!isCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partyEventId = process.env.GOOGLE_CALENDAR_PARTY_EVENT_ID;
  const overnightEventId = process.env.GOOGLE_CALENDAR_OVERNIGHT_EVENT_ID;

  if (!partyEventId) {
    return NextResponse.json({ error: "Party event ID not configured" }, { status: 500 });
  }

  try {
    // Get declined emails from Google Calendar
    const declinedOnCalendar = await getDeclinedAttendees(partyEventId);

    if (declinedOnCalendar.length === 0) {
      return NextResponse.json({ synced: 0, message: "No changes from calendar" });
    }

    // Get current guest list
    const guests = (await getKey<Guest[]>("guests")) || [];
    let updatedCount = 0;

    for (const guest of guests) {
      if (
        guest.email &&
        declinedOnCalendar.includes(guest.email.toLowerCase()) &&
        guest.status === "attending"
      ) {
        guest.status = "declined";
        guest.updatedAt = new Date().toISOString();
        updatedCount++;
        console.log(`[Calendar Sync] ${guest.name} (${guest.email}) declined on calendar, updating website`);
      }
    }

    if (updatedCount > 0) {
      await setKey("guests", guests);
    }

    return NextResponse.json({
      synced: updatedCount,
      declinedOnCalendar: declinedOnCalendar.length,
      message: updatedCount > 0 ? `Updated ${updatedCount} guest(s)` : "No website updates needed",
    });
  } catch (err) {
    console.error("[Calendar Sync] Error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
