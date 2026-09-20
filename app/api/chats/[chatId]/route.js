import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

export const runtime = "nodejs";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const chat = await Chat.findById(chatId).lean();

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
    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const deleted = await Chat.findByIdAndDelete(chatId);

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
    const { chatId } = await params;

    if (!isValidId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID." },
        { status: 400 },
      );
    }

    const body = await request.json();

    await connectDB();

    const update = {};

    if (typeof body?.title === "string") {
      update.title = body.title
        .trim()
        .slice(0, 100);
    }

    if (Array.isArray(body?.messages)) {
      update.messages = body.messages
        .filter(
          (message) =>
            message &&
            (message.role === "user" ||
              message.role === "assistant") &&
            typeof message.content === "string" &&
            message.content.trim(),
        )
        .map((message) => ({
          role: message.role,
          content: message.content.slice(0, 20000),
        }));
    }

    const chat = await Chat.findByIdAndUpdate(
      chatId,
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
