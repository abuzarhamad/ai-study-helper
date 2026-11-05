import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { parseStudySession } from "@/lib/study-session-validation";
import StudySession from "@/models/StudySession";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const limitParam = new URL(request.url).searchParams.get("limit");
    const limit = limitParam === null ? 50 : Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Limit must be between 1 and 100." }, { status: 400 });
    }

    await connectDB();
    const sessions = await StudySession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session._id.toString(),
        topic: session.topic,
        difficulty: session.difficulty,
        explanation: session.explanation,
        keyPoints: session.keyPoints,
        example: session.example,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/study-sessions error:", error);
    return NextResponse.json({ error: "Failed to load study sessions." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
      }
      throw error;
    }

    const parsed = parseStudySession(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const session = await StudySession.create({ ...parsed.values, userId });

    return NextResponse.json(
      {
        session: {
          id: session._id.toString(),
          topic: session.topic,
          difficulty: session.difficulty,
          explanation: session.explanation,
          keyPoints: session.keyPoints,
          example: session.example,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/study-sessions error:", error);
    return NextResponse.json({ error: "Failed to save study session." }, { status: 500 });
  }
}
