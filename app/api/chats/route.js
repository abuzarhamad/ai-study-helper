import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { normalizeStudySettings } from "@/lib/study-settings";
import Chat from "@/models/Chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    await connectDB();

    const chats = await Chat.find({ userId })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      chats: chats.map((chat) => ({
        id: chat._id.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/chats error:", error);

    return NextResponse.json(
      {
        error: "Failed to load chats.",
      },
      { status: 500 },
    );
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

    const settings = normalizeStudySettings(body?.settings);
    if (!settings) {
      return NextResponse.json({ error: "Invalid study settings." }, { status: 400 });
    }

    await connectDB();

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim().slice(0, 100)
        : "New chat";

    const chat = await Chat.create({
      userId,
      title,
      settings,
      messages: [],
    });

    return NextResponse.json(
      {
        chat: {
          id: chat._id.toString(),
          title: chat.title,
          settings: chat.settings,
          messages: [],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/chats error:", error);

    return NextResponse.json(
      {
        error: "Failed to create chat.",
      },
      { status: 500 },
    );
  }
}
