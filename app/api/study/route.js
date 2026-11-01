import OpenAI from "openai";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chat from "@/models/Chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);

    const message = body?.message?.trim();
    const history = Array.isArray(body?.history) ? body.history : [];
    const chatId = body?.chatId || null;
    const settings = body?.settings || {};

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 },
      );
    }

    await connectDB();

    const messages = [
      {
        role: "system",
        content: `
You are StudyMate, a helpful AI study assistant.

Your job is to help students understand subjects clearly.

Rules:
- Explain difficult topics in simple language.
- Break complicated concepts into steps.
- Give examples when useful.
- Use headings and bullet points when appropriate.
- For math problems, show the solution step-by-step.
- If the student asks for a definition, give a clear definition first.
- If the student asks for an exam question, help them understand how to solve it.
- Do not simply give answers when explaining homework; teach the reasoning.
- If you are unsure about something, say so instead of making up information.

Response style: ${settings.style || "balanced"}
Response length: ${settings.length || "medium"}
Explanation level: ${settings.level || "standard"}
        `,
      },

      ...history
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim(),
        )
        .slice(-10),

      {
        role: "user",
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages,
    });

    let reply = completion?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("AI returned an empty response.");
    }

    /*
     * Some providers/models may return JSON-looking output.
     * If the actual response is:
     *
     * {"reply":"Hello"}
     *
     * unwrap it so the UI only displays:
     *
     * Hello
     */
    if (typeof reply === "string") {
      try {
        const parsed = JSON.parse(reply);

        if (parsed && typeof parsed.reply === "string") {
          reply = parsed.reply;
        }
      } catch {
        // Normal markdown/text response.
      }
    }

    /*
     * Find existing chat or create a new one.
     */
    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (!chat) {
        return NextResponse.json(
          {
            error: "Chat not found.",
          },
          {
            status: 404,
          },
        );
      }
    } else {
      /*
       * Generate a simple title from the first question.
       */
      const title =
        message.length > 60 ? `${message.slice(0, 60).trim()}...` : message;

      chat = new Chat({
        title,
        settings: {
          style: settings.style || "balanced",
          length: settings.length || "medium",
          level: settings.level || "standard",
        },
        messages: [],
      });
    }

    /*
     * Store both sides of the conversation.
     */
    chat.messages.push({
      role: "user",
      content: message,
    });

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    return NextResponse.json({
      success: true,
      chatId: chat._id.toString(),
      reply,
    });
  } catch (error) {
    console.error("Study API error:", error);

    return NextResponse.json(
      {
        error:
          error?.message || "Something went wrong while contacting the AI.",
      },
      {
        status: 500,
      },
    );
  }
}
