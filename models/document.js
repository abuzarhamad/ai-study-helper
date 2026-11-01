import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    fileName: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
    },
    contentType: {
      type: String,
      enum: ["text/plain", "text/markdown"],
      default: "text/plain",
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000000,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

DocumentSchema.index({ userId: 1, updatedAt: -1 });

const Document =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);

export default Document;