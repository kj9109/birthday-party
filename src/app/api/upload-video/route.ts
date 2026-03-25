import { NextResponse } from "next/server";
import { getKey, setKey } from "@/lib/db";
import type { VideoWish } from "@/lib/types";

export async function GET() {
  const wishes = (await getKey<VideoWish[]>("birthday-wishes")) || [];
  return NextResponse.json(wishes);
}

export async function POST(request: Request) {
  try {
    const { guestName, videoUrl } = await request.json();

    if (!guestName?.trim() || !videoUrl?.trim()) {
      return NextResponse.json(
        { error: "Guest name and video URL are required" },
        { status: 400 }
      );
    }

    const wishes = (await getKey<VideoWish[]>("birthday-wishes")) || [];

    const wish: VideoWish = {
      id: crypto.randomUUID(),
      guestName: guestName.trim(),
      videoUrl: videoUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    wishes.push(wish);
    await setKey("birthday-wishes", wishes);

    return NextResponse.json(wish, { status: 201 });
  } catch (err) {
    console.error("[API] POST /api/upload-video error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
