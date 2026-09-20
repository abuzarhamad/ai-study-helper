// // // import OpenAI from "openai";
// // // import { NextResponse } from "next/server";

// // // const openai = new OpenAI({
// // //   apiKey: process.env.OPENROUTER_API_KEY,
// // //   baseURL: "https://openrouter.ai/api/v1",
// // // });

// // // export async function POST(request) {
// // //   try {
// // //     const body = await request.json();

// // //     const message = body?.message?.trim();
// // //     const history = Array.isArray(body?.history) ? body.history : [];

// // //     if (!message) {
// // //       return NextResponse.json(
// // //         {
// // //           error: "Please enter a question.",
// // //         },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     const messages = [
// // //       {
// // //         role: "system",
// // //         content: `
// // // You are StudyMate, a helpful AI study assistant.

// // // Your job is to help students understand subjects clearly.

// // // Rules:
// // // - Explain difficult topics in simple language.
// // // - Break complicated concepts into steps.
// // // - Give examples when useful.
// // // - Use headings and bullet points when appropriate.
// // // - For math problems, show the solution step-by-step.
// // // - If the student asks for a definition, give a clear definition first.
// // // - If the student asks for an exam question, help them understand how to solve it.
// // // - Do not simply give answers when explaining homework; teach the reasoning.
// // // - If you are unsure about something, say so instead of making up information.
// // // - Keep answers focused and reasonably concise.
// // //         `,
// // //       },
// // //       ...history
// // //         .filter(
// // //           (item) =>
// // //             item &&
// // //             (item.role === "user" || item.role === "assistant") &&
// // //             typeof item.content === "string" &&
// // //             item.content.trim()
// // //         )
// // //         .slice(-10),
// // //       {
// // //         role: "user",
// // //         content: message,
// // //       },
// // //     ];

// // //     const completion = await openai.chat.completions.create({
// // //       model: "openrouter/free",
// // //       messages,
// // //     });

// // //     const reply = completion?.choices?.[0]?.message?.content;

// // //     if (!reply) {
// // //       throw new Error("AI returned an empty response.");
// // //     }

// // //     return NextResponse.json({
// // //       reply,
// // //     });
// // //   } catch (error) {
// // //     console.error("Study API error:", error);

// // //     return NextResponse.json(
// // //       {
// // //         error:
// // //           error?.message || "Something went wrong while contacting the AI.",
// // //       },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // import OpenAI from "openai";

// // const openai = new OpenAI({
// //   apiKey: process.env.OPENROUTER_API_KEY,
// //   baseURL: "https://openrouter.ai/api/v1",
// // });

// // const SYSTEM_PROMPT = `
// // You are StudyMate, a helpful AI study assistant.

// // Your job is to help students understand subjects clearly.

// // Rules:
// // - Explain difficult topics in simple language.
// // - Break complicated concepts into logical steps.
// // - Give useful examples when appropriate.
// // - Use Markdown headings, lists, tables, and code blocks when they improve clarity.
// // - For math problems, show the solution step-by-step.
// // - If the student asks for a definition, give the clear definition first.
// // - If the student asks how to solve something, explain the reasoning rather than only giving the final answer.
// // - For programming questions, provide correct, practical examples.
// // - Keep responses focused and reasonably concise.
// // - Do not wrap your response in JSON.
// // - Do not add fields such as "reply", "answer", or "content".
// // - Return only the natural-language response that should be displayed to the student.
// // - If you are unsure about something, say so instead of making up information.
// // `;

// // function normalizeHistory(history) {
// //   if (!Array.isArray(history)) {
// //     return [];
// //   }

// //   return history
// //     .filter(
// //       (item) =>
// //         item &&
// //         (item.role === "user" || item.role === "assistant") &&
// //         typeof item.content === "string" &&
// //         item.content.trim(),
// //     )
// //     .slice(-10)
// //     .map((item) => ({
// //       role: item.role,
// //       content: item.content.trim(),
// //     }));
// // }

// // export async function POST(request) {
// //   try {
// //     const body = await request.json();

// //     const message =
// //       typeof body?.message === "string" ? body.message.trim() : "";

// //     const history = normalizeHistory(body?.history);

// //     if (!message) {
// //       return new Response(
// //         JSON.stringify({
// //           error: "Please enter a question.",
// //         }),
// //         {
// //           status: 400,
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //         },
// //       );
// //     }

// //     if (message.length > 4000) {
// //       return new Response(
// //         JSON.stringify({
// //           error: "Message is too long.",
// //         }),
// //         {
// //           status: 400,
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //         },
// //       );
// //     }

// //     const messages = [
// //       {
// //         role: "system",
// //         content: SYSTEM_PROMPT,
// //       },
// //       ...history,
// //       {
// //         role: "user",
// //         content: message,
// //       },
// //     ];

// //     const stream = await openai.chat.completions.create({
// //       model: "openrouter/free",
// //       messages,
// //       stream: true,
// //     });

// //     const encoder = new TextEncoder();

// //     const readableStream = new ReadableStream({
// //       async start(controller) {
// //         try {
// //           for await (const chunk of stream) {
// //             const content = chunk?.choices?.[0]?.delta?.content;

// //             if (content) {
// //               controller.enqueue(encoder.encode(content));
// //             }
// //           }

// //           controller.close();
// //         } catch (error) {
// //           console.error("AI stream error:", error);

// //           controller.error(error);
// //         }
// //       },

// //       cancel() {
// //         /*
// //          * The client disconnected/stopped generation.
// //          *
// //          * The OpenAI SDK stream will no longer be consumed.
// //          */
// //       },
// //     });

// //     return new Response(readableStream, {
// //       status: 200,
// //       headers: {
// //         "Content-Type": "text/plain; charset=utf-8",
// //         "Cache-Control": "no-cache, no-transform",
// //         "X-Accel-Buffering": "no",
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Study API error:", error);

// //     return new Response(
// //       JSON.stringify({
// //         error:
// //           error?.message || "Something went wrong while contacting the AI.",
// //       }),
// //       {
// //         status: 500,
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //       },
// //     );
// //   }
// // }

// import OpenAI from "openai";
// import mongoose from "mongoose";
// import connectDB from "@/lib/mongodb";
// import Chat from "@/models/Chat";

// const openai = new OpenAI({
//   apiKey: process.env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
// });

// export const runtime = "nodejs";

// const SYSTEM_PROMPT = `
// You are StudyMate, a helpful AI study assistant.

// Your job is to help students understand subjects clearly.

// Rules:
// - Explain difficult topics in simple language.
// - Break complicated concepts into logical steps.
// - Give examples when appropriate.
// - Use Markdown headings, lists, tables, and code blocks when useful.
// - For math problems, show the solution step-by-step.
// - If the student asks for a definition, give the clear definition first.
// - If the student asks how to solve something, explain the reasoning.
// - For programming questions, provide correct practical examples.
// - Keep responses focused and reasonably concise.
// - Do not return JSON.
// - Do not wrap your answer in a "reply" or "answer" field.
// - Return only the natural-language response.
// - If you are unsure, say so instead of making up information.
// `;

// function normalizeHistory(history) {
//   if (!Array.isArray(history)) {
//     return [];
//   }

//   return history
//     .filter(
//       (item) =>
//         item &&
//         (item.role === "user" ||
//           item.role === "assistant") &&
//         typeof item.content === "string" &&
//         item.content.trim(),
//     )
//     .slice(-10)
//     .map((item) => ({
//       role: item.role,
//       content: item.content.trim(),
//     }));
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();

//     const message =
//       typeof body?.message === "string"
//         ? body.message.trim()
//         : "";

//     const chatId = body?.chatId;

//     const history = normalizeHistory(body?.history);

//     if (!message) {
//       return Response.json(
//         {
//           error: "Please enter a question.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (message.length > 4000) {
//       return Response.json(
//         {
//           error: "Message is too long.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (
//       !chatId ||
//       !mongoose.Types.ObjectId.isValid(chatId)
//     ) {
//       return Response.json(
//         {
//           error: "Invalid chat.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     await connectDB();

//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return Response.json(
//         {
//           error: "Chat not found.",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     /*
//      * Save the user's message immediately.
//      */
//     chat.messages.push({
//       role: "user",
//       content: message,
//     });

//     /*
//      * Automatically title the conversation
//      * using the first user message.
//      */
//     if (
//       chat.title === "New chat" ||
//       !chat.title
//     ) {
//       chat.title =
//         message.length > 60
//           ? `${message.slice(0, 60)}...`
//           : message;
//     }

//     await chat.save();

//     const messages = [
//       {
//         role: "system",
//         content: SYSTEM_PROMPT,
//       },
//       ...history,
//       {
//         role: "user",
//         content: message,
//       },
//     ];

//     const stream =
//       await openai.chat.completions.create({
//         model: "openrouter/free",
//         messages,
//         stream: true,
//       });

//     const encoder = new TextEncoder();

//     let fullReply = "";

//     const readableStream =
//       new ReadableStream({
//         async start(controller) {
//           try {
//             for await (const chunk of stream) {
//               const content =
//                 chunk?.choices?.[0]?.delta?.content;

//               if (!content) {
//                 continue;
//               }

//               fullReply += content;

//               controller.enqueue(
//                 encoder.encode(content),
//               );
//             }

//             /*
//              * Save the complete assistant answer
//              * after generation finishes.
//              */
//             if (fullReply.trim()) {
//               await Chat.findByIdAndUpdate(
//                 chatId,
//                 {
//                   $push: {
//                     messages: {
//                       role: "assistant",
//                       content: fullReply,
//                     },
//                   },
//                 },
//               );
//             }

//             controller.close();
//           } catch (error) {
//             console.error(
//               "AI stream error:",
//               error,
//             );

//             controller.error(error);
//           }
//         },
//       });

//     return new Response(readableStream, {
//       status: 200,
//       headers: {
//         "Content-Type":
//           "text/plain; charset=utf-8",
//         "Cache-Control":
//           "no-cache, no-transform",
//         "X-Accel-Buffering": "no",
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Study API error:",
//       error,
//     );

//     return Response.json(
//       {
//         error:
//           error?.message ||
//           "Something went wrong while contacting the AI.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

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
