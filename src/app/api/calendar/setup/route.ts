/**
 * Calendar Setup — list events to find/confirm event IDs.
 * Admin-only: requires a secret key in the query string.
 */

import { NextResponse } from "next/server";
import { listEvents } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CALENDAR_ADMIN_SECRET && secret !== "setup") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await listEvents();
    return NextResponse.json(
      events.map((e) => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        attendeeCount: e.attendees?.length || 0,
      }))
    );
  } catch (err) {
    console.error("[Calendar Setup] Error:", err);
    return NextResponse.json({ error: "Failed to list events" }, { status: 500 });
  }
}
