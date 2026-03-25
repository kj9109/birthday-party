import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import { PARTY_CONFIG } from "@/lib/config";
import type { ChecklistItem } from "@/lib/store";

function ensureDefaults() {
  const items = getData("checklist");
  if (items.length === 0) {
    const defaults: ChecklistItem[] = PARTY_CONFIG.defaultChecklist.map(
      (text, i) => ({
        id: `default-${i}`,
        text,
        completed: false,
      })
    );
    setData("checklist", defaults);
    return defaults;
  }
  return items;
}

export async function GET() {
  return NextResponse.json(ensureDefaults());
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const items = ensureDefaults();
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
    };

    items.push(newItem);
    setData("checklist", items);

    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const items = ensureDefaults();
    const item = items.find((i) => i.id === id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    item.completed = !item.completed;
    setData("checklist", items);

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const items = ensureDefaults();
    const filtered = items.filter((i) => i.id !== id);
    setData("checklist", filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
