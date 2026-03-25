import { NextResponse } from "next/server";
import { getKey, setKey } from "@/lib/db";
import { sendHostNotification, sendGuestConfirmation } from "@/lib/email";
import type { Guest } from "@/lib/types";

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

    const guestData: Guest = {
      id: existingIndex >= 0 ? guests[existingIndex].id : crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      status: status || "attending",
      photoUrl: photoUrl || (existingIndex >= 0 ? guests[existingIndex].photoUrl : undefined),
      comment: comment?.trim() || undefined,
      plusOneName: plusOneName?.trim() || undefined,
      events: events || { winery: true, dinnerParty: true, stayingOver: false },
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
      // Check if plus-one already exists
      const plusOneIndex = guests.findIndex(
        (g) => g.plusOneOf === guestData.id
      );

      plusOneGuest = {
        id: plusOneIndex >= 0 ? guests[plusOneIndex].id : crypto.randomUUID(),
        name: plusOneName.trim(),
        email: "",
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

    // Send emails (don't await — fire and forget so the response is fast)
    sendHostNotification(guestData, plusOneGuest).catch(() => {});
    sendGuestConfirmation(guestData).catch(() => {});

    return NextResponse.json(
      { guest: guestData, plusOne: plusOneGuest },
      { status: existingIndex >= 0 ? 200 : 201 }
    );
  } catch (err) {
    console.error("[API] POST /api/guests error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
