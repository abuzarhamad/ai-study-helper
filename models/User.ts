
import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    // Profile Information
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },

    // Personal Details
    phone: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    website: {
      type: String,
      default: "",
    },

    // Social Links
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },

    // Account Settings
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // User Preferences
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
    },

    // Additional Information
    interests: [{
      type: String,
      trim: true,
    }],
    skills: [{
      type: String,
      trim: true,
    }],

    // Account Activity
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type UserData = InferSchemaType<typeof userSchema>;

const User =
  (mongoose.models.users as Model<UserData> | undefined) ??
  mongoose.model<UserData>("users", userSchema);

export default User;
