import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUserId } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { parseDocument, serializeDocument } from "@/lib/document-validation";
import Document from "@/models/document";

export const runtime = "nodejs";

async function getDocumentId(params) {
  const { documentId } = await params;
  return mongoose.Types.ObjectId.isValid(documentId) ? documentId : null;
}

export async function GET(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const documentId = await getDocumentId(params);
    if (!documentId) {
      return NextResponse.json({ error: "Invalid document ID." }, { status: 400 });
    }

    await connectDB();
    const document = await Document.findOne({ _id: documentId, userId }).lean();
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ document: serializeDocument(document, true) });
  } catch (error) {
    console.error("GET /api/documents/[documentId] error:", error);
    return NextResponse.json({ error: "Failed to load document." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const documentId = await getDocumentId(params);
    if (!documentId) {
      return NextResponse.json({ error: "Invalid document ID." }, { status: 400 });
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

    const parsed = parseDocument(body, true);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const document = await Document.findOneAndUpdate(
      { _id: documentId, userId },
      { $set: parsed.values },
      { new: true, runValidators: true },
    ).lean();
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ document: serializeDocument(document, true) });
  } catch (error) {
    console.error("PATCH /api/documents/[documentId] error:", error);
    return NextResponse.json({ error: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const documentId = await getDocumentId(params);
    if (!documentId) {
      return NextResponse.json({ error: "Invalid document ID." }, { status: 400 });
    }

    await connectDB();
    const deleted = await Document.findOneAndDelete({ _id: documentId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents/[documentId] error:", error);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
