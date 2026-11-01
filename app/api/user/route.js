
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const allowedFields = [
  "name",
  "username",
  "bio",
  "headline",
  "profileImage",
  "coverImage",
  "phone",
  "dateOfBirth",
  "gender",
  "location",
  "website",
  "socialLinks",
  "interests",
  "skills",
  "preferences",
];

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    // Only allow approved profile fields
    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided" },
        { status: 400 }
      );
    }

    if (
      updateData.name !== undefined &&
      (typeof updateData.name !== "string" ||
        !updateData.name.trim())
    ) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    if (
      updateData.bio !== undefined &&
      (typeof updateData.bio !== "string" ||
        updateData.bio.length > 300)
    ) {
      return NextResponse.json(
        { message: "Bio must be 300 characters or less" },
        { status: 400 }
      );
    }

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    if (updateData.username) {
      updateData.username = updateData.username
        .trim()
        .toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("PATCH profile error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Username or email already exists" },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
