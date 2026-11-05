"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    // Destroy the Auth.js session.
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <button onClick={handleLogout}   className="rounded-lg p-2 text-red-500 transition cursor-pointer hover:bg-red/[0.06] hover:bg-red-500 hover:text-white disabled:pointer-events-none disabled:opacity-30">
      Logout
    </button>
  );
}