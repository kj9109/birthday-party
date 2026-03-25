import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Attendee } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getData("attendees"));
}

export async function POST(request: Request) {
  try {
    const { name, rsvp, photo } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const attendees = getData("attendees");
    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      photo: photo || undefined,
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

export async function PATCH(request: Request) {
  try {
    const { id, rsvp, photo } = await request.json();
    const attendees = getData("attendees");
    const attendee = attendees.find((a) => a.id === id);

    if (!attendee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (rsvp) attendee.rsvp = rsvp;
    if (photo) attendee.photo = photo;
    attendee.timestamp = new Date().toISOString();

    setData("attendees", attendees);
    return NextResponse.json(attendee);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
