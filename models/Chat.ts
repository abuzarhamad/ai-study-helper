import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import MessageSchema from "./message";

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "New chat",
      maxlength: 100,
      trim: true,
    },
    settings: {
      style: {
        type: String,
        enum: ["balanced", "teacher", "concise"],
        default: "balanced",
      },
      length: {
        type: String,
        enum: ["short", "medium", "long"],
        default: "medium",
      },
      level: {
        type: String,
        enum: ["simple", "standard", "advanced"],
        default: "standard",
      },
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

ChatSchema.index({ userId: 1, updatedAt: -1 });

export type ChatData = InferSchemaType<typeof ChatSchema>;

const Chat =
  (mongoose.models.Chat as Model<ChatData> | undefined) ??
  mongoose.model<ChatData>("Chat", ChatSchema);

export default Chat;
