import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 20000,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const ChatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "New chat",
      maxlength: 100,
      trim: true,
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

ChatSchema.index({
  updatedAt: -1,
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
