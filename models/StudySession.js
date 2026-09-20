import mongoose from "mongoose";

const StudySessionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      default: "beginner",
    },

    explanation: {
      type: String,
      required: true,
    },

    keyPoints: {
      type: [String],
      default: [],
    },

    example: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const StudySession =
  mongoose.models.StudySession ||
  mongoose.model("StudySession", StudySessionSchema);

export default StudySession;
