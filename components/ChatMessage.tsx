import { RotateCcw, Sparkles } from "lucide-react";
import { Typing } from "./Typing";
import { MarkdownContent } from "./MarkdownContent";
import { CopyButton } from "./CopyButton";

export function ChatMessage({ message, onRegenerate }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`
        group mb-7 flex gap-3
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600">
          <Sparkles size={14} />
        </div>
      )}

      <div
        className={`
          min-w-0
          ${isUser ? "max-w-[85%]" : "max-w-[calc(100%-2.5rem)]"}
        `}
      >
        {message.error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
            {message.content}
          </div>
        ) : isUser ? (
          <div className="rounded-2xl rounded-br-md bg-[#303030] px-4 py-2.5">
            <div className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-100">
              {message.content}
            </div>
          </div>
        ) : message.content ? (
          <MarkdownContent content={message.content} />
        ) : (
          <Typing />
        )}

        {!isUser && !message.error && message.content && (
          <div className="mt-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            <CopyButton text={message.content} />

            <button
              type="button"
              onClick={onRegenerate}
              className="
                  flex items-center gap-1.5
                  rounded-md px-2 py-1.5
                  text-[11px] text-zinc-600
                  transition
                  hover:bg-white/[0.05]
                  hover:text-zinc-300
                "
            >
              <RotateCcw size={12} />
              Regenerate
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.04] text-[9px] font-medium text-zinc-500">
          YOU
        </div>
      )}
    </div>
  );
}
