
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <p className="animate-pulse text-gray-500">Loading profile...</p>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const editFromUrl = searchParams.get("edit") === "true";
  return (
    <ProfileContent
      key={editFromUrl ? "edit" : "view"}
      initialEditing={editFromUrl}
    />
  );
}

function ProfileContent({ initialEditing }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(initialEditing);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/user", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        if (active) {
          setUser(data.user);
        }
      } catch (error) {
        if (active) {
          console.error("Load profile error:", error);
          toast.error("Unable to load your profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-gray-500 animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-red-500">
          Unable to load profile. Please sign in.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your personal information
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            {editing ? "View Profile" : "Edit Profile"}
          </button>
        </div>

        {editing ? (
          <ProfileForm
            user={user}
            onSuccess={(updatedUser) => {
              setUser(updatedUser);
              setEditing(false);
            }}
          />
        ) : (
          <ProfileCard user={user} />
        )}

      </div>
    </main>
  );
}
