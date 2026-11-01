import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { parseStudySession } from "@/lib/study-session-validation";
import StudySession from "@/models/StudySession";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { sessionId } = await params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid study session ID." }, { status: 400 });
    }

    await connectDB();
    const session = await StudySession.findOne({ _id: sessionId, userId }).lean();
    if (!session) {
      return NextResponse.json({ error: "Study session not found." }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("GET /api/study-sessions/[sessionId] error:", error);
    return NextResponse.json({ error: "Failed to load study session." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { sessionId } = await params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid study session ID." }, { status: 400 });
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

    const { values, error } = parseStudySession(body, true);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    if (!Object.keys(values).length) {
      return NextResponse.json({ error: "No study session changes provided." }, { status: 400 });
    }

    await connectDB();
    const session = await StudySession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: values },
      { new: true, runValidators: true },
    ).lean();
    if (!session) {
      return NextResponse.json({ error: "Study session not found." }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("PATCH /api/study-sessions/[sessionId] error:", error);
    return NextResponse.json({ error: "Failed to update study session." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { sessionId } = await params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid study session ID." }, { status: 400 });
    }

    await connectDB();
    const deleted = await StudySession.findOneAndDelete({ _id: sessionId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Study session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/study-sessions/[sessionId] error:", error);
    return NextResponse.json({ error: "Failed to delete study session." }, { status: 500 });
  }
}
