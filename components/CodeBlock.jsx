import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#171717]">
      <div className="flex h-9 items-center justify-between border-b border-white/[0.06] bg-white/[0.025] px-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
            <span className="h-2 w-2 rounded-full bg-green-400/70" />
          </div>

          <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            {language || "code"}
          </span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="
            flex items-center gap-1.5
            rounded-md px-2 py-1
            text-[10px] text-zinc-500
            transition
            hover:bg-white/[0.05]
            hover:text-zinc-200
          "
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="max-h-[520px] overflow-x-auto overflow-y-auto p-4">
        <code className="font-mono text-[13px] leading-6 text-zinc-300">
          {code}
        </code>
      </pre>
    </div>
  );
}