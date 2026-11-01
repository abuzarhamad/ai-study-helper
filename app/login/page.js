import { connection } from "next/server";
import LoginForm from "@/components/auth/LoginForm";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default async function LoginPage() {
  await connection();

  const providers = [];
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push("github");
  }
  if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
    providers.push("google");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <SocialLoginButtons providers={providers} />
        <LoginForm />
      </div>
    </main>
  );
}
