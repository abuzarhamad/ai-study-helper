"use client";

import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const providerLabels = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

export default function SocialLoginButtons({ providers }) {
  if (!providers.length) {
    return null;
  }

  async function handleSignIn(provider) {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
      toast.error(`Unable to sign in with ${providerLabels[provider]}.`);
    }
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleSignIn(provider)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {providerLabels[provider]}
          </button>
        ))}
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-sm text-slate-500">OR</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
    </>
  );
}
