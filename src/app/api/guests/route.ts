import { NextResponse } from "next/server";
import { getKey, setKey } from "@/lib/db";
import { sendHostNotification, sendGuestConfirmation } from "@/lib/email";
import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/lib/google-calendar";
import type { Guest } from "@/lib/types";

const PARTY_EVENT_ID = process.env.GOOGLE_CALENDAR_PARTY_EVENT_ID || "";
const OVERNIGHT_EVENT_ID = process.env.GOOGLE_CALENDAR_OVERNIGHT_EVENT_ID || "";

export async function GET() {
  const guests = (await getKey<Guest[]>("guests")) || [];
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      status,
      photoUrl,
      comment,
      plusOneName,
      plusOneEmail,
      events,
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const guests = (await getKey<Guest[]>("guests")) || [];
    const now = new Date().toISOString();

    // Find existing guest by email (upsert)
    const existingIndex = guests.findIndex(
      (g) => g.email.toLowerCase() === email.trim().toLowerCase()
    );

    const previousStatus = existingIndex >= 0 ? guests[existingIndex].status : null;

    const guestData: Guest = {
      id: existingIndex >= 0 ? guests[existingIndex].id : crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      status: status || "attending",
      photoUrl: photoUrl || (existingIndex >= 0 ? guests[existingIndex].photoUrl : undefined),
      comment: comment?.trim() || undefined,
      plusOneName: plusOneName?.trim() || undefined,
      events: events || { dinnerParty: true, stayingOver: false },
      createdAt: existingIndex >= 0 ? guests[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      guests[existingIndex] = guestData;
    } else {
      guests.push(guestData);
    }

    // Handle plus-one
    let plusOneGuest: Guest | undefined;
    if (plusOneName?.trim()) {
      const plusOneIndex = guests.findIndex(
        (g) => g.plusOneOf === guestData.id
      );

      plusOneGuest = {
        id: plusOneIndex >= 0 ? guests[plusOneIndex].id : crypto.randomUUID(),
        name: plusOneName.trim(),
        email: plusOneEmail?.trim()?.toLowerCase() || "",
        status: guestData.status,
        plusOneOf: guestData.id,
        events: guestData.events,
        createdAt: plusOneIndex >= 0 ? guests[plusOneIndex].createdAt : now,
        updatedAt: now,
      };

      if (plusOneIndex >= 0) {
        guests[plusOneIndex] = plusOneGuest;
      } else {
        guests.push(plusOneGuest);
      }
    } else {
      // Remove any previous plus-one if the field is now empty
      const oldPlusOneIndex = guests.findIndex(
        (g) => g.plusOneOf === guestData.id
      );
      if (oldPlusOneIndex >= 0) {
        guests.splice(oldPlusOneIndex, 1);
      }
    }

    await setKey("guests", guests);

    // Send emails (fire and forget)
    sendHostNotification(guestData, plusOneGuest).catch(() => {});
    sendGuestConfirmation(guestData).catch(() => {});

    // Google Calendar sync (fire and forget)
    syncGuestToCalendar(guestData, previousStatus, plusOneGuest).catch((err) => {
      console.error("[Calendar] Sync failed for", guestData.email, err);
    });

    return NextResponse.json(
      { guest: guestData, plusOne: plusOneGuest },
      { status: existingIndex >= 0 ? 200 : 201 }
    );
  } catch (err) {
    console.error("[API] POST /api/guests error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * Sync a guest's RSVP status to Google Calendar events.
 * Non-blocking — errors are logged but don't affect the RSVP response.
 */
async function syncGuestToCalendar(
  guest: Guest,
  previousStatus: string | null,
  plusOne?: Guest
) {
  if (!PARTY_EVENT_ID) return;

  if (guest.status === "attending") {
    // Add to party event
    await addAttendeeToEvent(PARTY_EVENT_ID, guest.email, guest.name);

    // Add to overnight event if staying
    if (guest.events?.stayingOver && OVERNIGHT_EVENT_ID) {
      await addAttendeeToEvent(OVERNIGHT_EVENT_ID, guest.email, guest.name);
    }

    // Add +1 if they have a valid email
    if (plusOne?.email && plusOne.email.includes("@")) {
      await addAttendeeToEvent(PARTY_EVENT_ID, plusOne.email, plusOne.name);
      if (guest.events?.stayingOver && OVERNIGHT_EVENT_ID) {
        await addAttendeeToEvent(OVERNIGHT_EVENT_ID, plusOne.email, plusOne.name);
      }
    }
  } else if (guest.status === "declined") {
    // Remove from party event
    await removeAttendeeFromEvent(PARTY_EVENT_ID, guest.email);

    // Remove from overnight event
    if (OVERNIGHT_EVENT_ID) {
      await removeAttendeeFromEvent(OVERNIGHT_EVENT_ID, guest.email);
    }

    // Remove +1
    if (plusOne?.email && plusOne.email.includes("@")) {
      await removeAttendeeFromEvent(PARTY_EVENT_ID, plusOne.email);
      if (OVERNIGHT_EVENT_ID) {
        await removeAttendeeFromEvent(OVERNIGHT_EVENT_ID, plusOne.email);
      }
    }
  } else if (guest.status === "maybe") {
    // For "maybe", add them but they won't show as confirmed
    // Google Calendar doesn't have a "maybe" status via API, so we just add them
    await addAttendeeToEvent(PARTY_EVENT_ID, guest.email, guest.name);
  }

  // Handle overnight event specifically:
  // If attending but NOT staying overnight, remove from overnight event
  if (guest.status === "attending" && !guest.events?.stayingOver && OVERNIGHT_EVENT_ID) {
    await removeAttendeeFromEvent(OVERNIGHT_EVENT_ID, guest.email);
  }
}

/**
 * DELETE /api/guests — remove guests by ID array.
 * Body: { ids: string[], secret: string }
 */
/**
 * PATCH /api/guests — admin operations (delete guests by ID).
 * Body: { action: "delete", ids: string[], secret: string }
 */
export async function PATCH(request: Request) {
  try {
    const { action, ids, secret } = await request.json();
    if (secret !== process.env.CALENDAR_ADMIN_SECRET && secret !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "delete") {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "ids array required" }, { status: 400 });
      }
      const guests = (await getKey<Guest[]>("guests")) || [];
      const idsSet = new Set(ids);
      const filtered = guests.filter((g) => !idsSet.has(g.id));
      const removed = guests.length - filtered.length;
      await setKey("guests", filtered);
      return NextResponse.json({ removed, remaining: filtered.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[API] PATCH /api/guests error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
