import mongoose from "mongoose";

const StudySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    difficulty: {
      type: String,
      default: "beginner",
      enum: ["beginner", "intermediate", "advanced"],
    },

    explanation: {
      type: String,
      required: true,
      maxlength: 50000,
    },

    keyPoints: {
      type: [{ type: String, trim: true, maxlength: 1000 }],
      default: [],
      validate: [(points) => points.length <= 50, "Too many key points."],
    },

    example: {
      type: String,
      default: "",
      maxlength: 10000,
    },
  },
  {
    timestamps: true,
  },
);

StudySessionSchema.index({ userId: 1, updatedAt: -1 });

const StudySession =
  mongoose.models.StudySession ||
  mongoose.model("StudySession", StudySessionSchema);

export default StudySession;
