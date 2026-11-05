import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { normalizeStudySettings } from "@/lib/study-settings";
import Chat from "@/models/Chat";
import Usage from "@/models/usage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string" &&
              item.content.trim(),
          )
          .slice(-10)
          .map(({ role, content }) => ({
            role,
            content: content.trim().slice(0, 20000),
          }))
      : [];
    const chatId = typeof body?.chatId === "string" ? body.chatId : null;
    const settings = normalizeStudySettings(body?.settings);

    if (!message || message.length > 20000) {
      return NextResponse.json(
        { error: "Enter a question of 1 to 20,000 characters." },
        { status: 400 },
      );
    }

    if (!settings) {
      return NextResponse.json({ error: "Invalid study settings." }, { status: 400 });
    }

    if (chatId && !/^[a-f\d]{24}$/i.test(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID." }, { status: 400 });
    }

    await connectDB();

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });

      if (!chat) {
        return NextResponse.json({ error: "Chat not found." }, { status: 404 });
      }
    } else {
      const title =
        message.length > 60 ? `${message.slice(0, 60).trim()}...` : message;

      chat = new Chat({
        userId,
        title,
        settings,
        messages: [],
      });
    }

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

      ...history,

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

    chat.settings = settings;

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

    const tokenUsage = completion.usage;
    const promptTokens = tokenUsage?.prompt_tokens;
    const inputTokens =
      typeof promptTokens === "number" &&
      Number.isSafeInteger(promptTokens) &&
      promptTokens >= 0
      ? promptTokens
      : null;
    const completionTokens = tokenUsage?.completion_tokens;
    const outputTokens =
      typeof completionTokens === "number" &&
      Number.isSafeInteger(completionTokens) &&
      completionTokens >= 0
      ? completionTokens
      : null;
    const providerTotalTokens = tokenUsage?.total_tokens;
    const totalTokens =
      typeof providerTotalTokens === "number" &&
      Number.isSafeInteger(providerTotalTokens) &&
      providerTotalTokens >= 0
      ? providerTotalTokens
      : inputTokens !== null && outputTokens !== null
        ? inputTokens + outputTokens
        : null;

    await Usage.create({
      userId,
      chatId: chat._id,
      provider: "openrouter",
      model: completion.model || "openrouter/free",
      requestId: completion.id || "",
      inputTokens,
      outputTokens,
      totalTokens,
    });

    return NextResponse.json({
      success: true,
      chatId: chat._id.toString(),
      reply,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
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
