import { NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { Question } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getData("questions"));
}

export async function POST(request: Request) {
  try {
    const { question, name } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }

    const questions = getData("questions");
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: question.trim(),
      name: name?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    questions.push(newQuestion);
    setData("questions", questions);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
