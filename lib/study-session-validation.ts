import type { StudySessionData } from "@/models/StudySession";

type StudySessionValues = Pick<
  StudySessionData,
  "topic" | "difficulty" | "explanation" | "keyPoints" | "example"
>;
type ValidationResult<Value> = { error: string } | { values: Value };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseStudySession(
  body: unknown,
): ValidationResult<StudySessionValues>;
export function parseStudySession(
  body: unknown,
  partial: true,
): ValidationResult<Partial<StudySessionValues>>;
export function parseStudySession(
  body: unknown,
  partial = false,
): ValidationResult<Partial<StudySessionValues>> {
  if (!isRecord(body)) {
    return { error: "Invalid request body." };
  }

  const values: Partial<StudySessionValues> = {};
  const fields = [
    "topic",
    "difficulty",
    "explanation",
    "keyPoints",
    "example",
  ] as const;

  for (const field of fields) {
    if (partial && body[field] === undefined) {
      continue;
    }

    if (!partial && body[field] === undefined) {
      if (field === "difficulty") {
        values.difficulty = "beginner";
      } else if (field === "keyPoints") {
        values.keyPoints = [];
      } else if (field === "example") {
        values.example = "";
      } else {
        return { error: `${field} is required.` };
      }
      continue;
    }

    const value = body[field];
    if (field === "keyPoints") {
      if (
        !Array.isArray(value) ||
        value.length > 50 ||
        value.some(
          (point) =>
            typeof point !== "string" ||
            !point.trim() ||
            point.trim().length > 1000,
        )
      ) {
        return { error: "Key points must be an array of up to 50 non-empty strings." };
      }
      values.keyPoints = value.map((point) => point.trim());
      continue;
    }

    if (typeof value !== "string") {
      return { error: `${field} must be a string.` };
    }

    const normalized = value.trim();
    if (field === "topic" && (!normalized || normalized.length > 200)) {
      return { error: "Topic must be between 1 and 200 characters." };
    }
    if (
      field === "difficulty" &&
      !["beginner", "intermediate", "advanced"].includes(normalized)
    ) {
      return { error: "Difficulty must be beginner, intermediate, or advanced." };
    }
    if (field === "explanation" && (!normalized || normalized.length > 50000)) {
      return { error: "Explanation must be between 1 and 50,000 characters." };
    }
    if (field === "example" && normalized.length > 10000) {
      return { error: "Example cannot exceed 10,000 characters." };
    }
    if (field === "topic") {
      values.topic = normalized;
    } else if (field === "difficulty") {
      values.difficulty = normalized as StudySessionValues["difficulty"];
    } else if (field === "explanation") {
      values.explanation = normalized;
    } else {
      values.example = normalized;
    }
  }

  if (!partial) {
    return { values: values as StudySessionValues };
  }

  return { values };
}
