import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { normalizeStudySettings } from "@/lib/study-settings";
import Chat from "@/models/Chat";

export const runtime = "nodejs";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const chat = await Chat.findOne({ _id: chatId, userId }).lean();

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        settings: chat.settings,
        messages: chat.messages.map((message) => ({
          id: message._id.toString(),
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/chats/[chatId] error:", error);

    return NextResponse.json(
      { error: "Failed to load chat." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const deleted = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!deleted) {
      return NextResponse.json(
        { error: "Chat not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/chats/[chatId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to delete chat." },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
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

    await connectDB();

    const update = {};

    if (typeof body?.title === "string") {
      const title = body.title.trim();
      if (!title || title.length > 100) {
        return NextResponse.json({ error: "Title must be 1 to 100 characters." }, { status: 400 });
      }
      update.title = title;
    }

    if (body?.settings !== undefined) {
      const settings = normalizeStudySettings(body.settings);
      if (!settings) {
        return NextResponse.json({ error: "Invalid study settings." }, { status: 400 });
      }
      update.settings = settings;
    }

    if (Array.isArray(body?.messages)) {
      if (
        body.messages.length > 500 ||
        body.messages.some(
          (message) =>
            !message ||
            !["user", "assistant"].includes(message.role) ||
            typeof message.content !== "string" ||
            !message.content.trim() ||
            message.content.length > 20000,
        )
      ) {
        return NextResponse.json({ error: "Invalid chat messages." }, { status: 400 });
      }
      update.messages = body.messages.map((message) => ({
          role: message.role,
          content: message.content.trim(),
        }));
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "No valid chat changes provided." }, { status: 400 });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        settings: chat.settings,
        messages: chat.messages,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/chats/[chatId] error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to update chat." },
      { status: 500 },
    );
  }
}
