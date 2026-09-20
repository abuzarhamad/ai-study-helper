import { suggestions } from "@/data/User";
import { Sparkles } from "lucide-react";

export function Welcome({ sendMessage }) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/10">
            <Sparkles size={22} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            What do you want to learn?
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Ask a question, solve a problem, or explore a topic.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.title}
                onClick={() => sendMessage(item.text)}
                className="
                  group flex min-h-[82px] items-start gap-3
                  rounded-xl border border-white/[0.08]
                  bg-white/[0.025] p-3.5
                  text-left transition
                  hover:border-white/[0.14]
                  hover:bg-white/[0.05]
                "
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400 transition group-hover:bg-violet-500/10 group-hover:text-violet-300">
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">
                    {item.title}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                    {item.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}