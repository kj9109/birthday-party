import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Message } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getData("messages"));
}

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name and message required" }, { status: 400 });
    }

    const messages = getData("messages");
    const newMessage: Message = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    setData("messages", messages);

    return NextResponse.json(newMessage, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
