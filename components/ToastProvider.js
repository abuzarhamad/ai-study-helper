"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#fafafa",
          border: "1px solid rgba(255,255,255,0.12)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#18181b",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#18181b",
          },
        },
      }}
    />
  );
}
