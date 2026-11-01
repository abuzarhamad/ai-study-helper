import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    // User's display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email is unique so two accounts cannot use the same email.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // We store the HASHED password, never the plain password.
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// `models.User` prevents Mongoose from recompiling the model
// when Next.js reloads files during development.
const User = models.User || mongoose.model("User", userSchema);

export default User;