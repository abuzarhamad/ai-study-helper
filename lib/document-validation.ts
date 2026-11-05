import type { DocumentData } from "@/models/document";

const MAX_DOCUMENT_BYTES = 1000000;
const allowedContentTypes = ["text/plain", "text/markdown"] as const;

type DocumentValues = Pick<
  DocumentData,
  "title" | "content" | "sizeBytes" | "fileName" | "contentType"
>;
type ValidationResult<Value> = { error: string } | { values: Value };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAllowedContentType(
  value: unknown,
): value is DocumentValues["contentType"] {
  return (
    typeof value === "string" &&
    allowedContentTypes.some((contentType) => contentType === value)
  );
}

export function parseDocument(
  body: unknown,
): ValidationResult<DocumentValues>;
export function parseDocument(
  body: unknown,
  partial: true,
): ValidationResult<Partial<DocumentValues>>;
export function parseDocument(
  body: unknown,
  partial = false,
): ValidationResult<Partial<DocumentValues>> {
  if (!isRecord(body)) {
    return { error: "Invalid request body." };
  }

  const values: Partial<DocumentValues> = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 200) {
      return { error: "Title must be between 1 and 200 characters." };
    }
    values.title = body.title.trim();
  }

  if (!partial || body.content !== undefined) {
    if (typeof body.content !== "string" || !body.content.trim()) {
      return { error: "Document content is required." };
    }
    const sizeBytes = Buffer.byteLength(body.content, "utf8");
    if (sizeBytes > MAX_DOCUMENT_BYTES) {
      return { error: "Document content cannot exceed 1 MB." };
    }
    values.content = body.content;
    values.sizeBytes = sizeBytes;
  }

  if (body.fileName !== undefined) {
    if (typeof body.fileName !== "string" || body.fileName.length > 255) {
      return { error: "File name cannot exceed 255 characters." };
    }
    values.fileName = body.fileName.trim();
  } else if (!partial) {
    values.fileName = "";
  }

  if (body.contentType !== undefined) {
    if (!isAllowedContentType(body.contentType)) {
      return { error: "Content type must be text/plain or text/markdown." };
    }
    values.contentType = body.contentType;
  } else if (!partial) {
    values.contentType = "text/plain";
  }

  if (partial && !Object.keys(values).length) {
    return { error: "No document changes provided." };
  }

  if (!partial) {
    return {
      values: values as DocumentValues,
    };
  }

  return { values };
}

type SerializedDocumentSource = Pick<
  DocumentData,
  "title" | "fileName" | "contentType" | "sizeBytes" | "content"
> & {
  _id: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
};

export function serializeDocument(
  document: SerializedDocumentSource,
  includeContent = false,
) {
  return {
    id: document._id.toString(),
    title: document.title,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
    ...(includeContent ? { content: document.content } : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
