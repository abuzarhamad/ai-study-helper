import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const UsageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
    provider: {
      type: String,
      required: true,
      default: "openrouter",
    },
    model: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      default: "",
    },
    inputTokens: {
      type: Number,
      min: 0,
      default: null,
    },
    outputTokens: {
      type: Number,
      min: 0,
      default: null,
    },
    totalTokens: {
      type: Number,
      min: 0,
      default: null,
    },
    estimatedCostUsd: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UsageSchema.index({ userId: 1, createdAt: -1 });

export type UsageData = InferSchemaType<typeof UsageSchema>;

const Usage =
  (mongoose.models.Usage as Model<UsageData> | undefined) ??
  mongoose.model<UsageData>("Usage", UsageSchema);

export default Usage;