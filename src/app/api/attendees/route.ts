import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Attendee } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getData("attendees"));
}

export async function POST(request: Request) {
  try {
    const { name, email, rsvp } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const attendees = getData("attendees");
    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email?.trim() || undefined,
      rsvp: rsvp || "attending",
      timestamp: new Date().toISOString(),
    };

    attendees.push(newAttendee);
    setData("attendees", attendees);

    return NextResponse.json(newAttendee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
