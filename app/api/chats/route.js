import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const chats = await Chat.find({})
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
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const title =
      typeof body?.title === "string" &&
      body.title.trim()
        ? body.title.trim().slice(0, 100)
        : "New chat";

    const chat = await Chat.create({
      title,
      messages: [],
    });

    return NextResponse.json(
      {
        chat: {
          id: chat._id.toString(),
          title: chat.title,
          messages: [],
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/chats error:", error);

    return NextResponse.json(
      {
        error: "Failed to create chat.",
      },
      {
        status: 500,
      },
    );
  }
}
