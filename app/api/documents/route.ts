import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { parseDocument, serializeDocument } from "@/lib/document-validation";
import Document from "@/models/document";

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
    const documents = await Document.find({ userId })
      .select("-content")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      documents: documents.map((document) => serializeDocument(document)),
    });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: "Failed to load documents." }, { status: 500 });
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

    const parsed = parseDocument(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const document = await Document.create({ ...parsed.values, userId });

    return NextResponse.json(
      { document: serializeDocument(document, true) },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }
}
