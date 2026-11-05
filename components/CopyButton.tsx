import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="
        flex items-center gap-1.5
        rounded-md px-2 py-1.5
        text-[11px] text-zinc-600
        transition
        hover:bg-white/[0.05]
        hover:text-zinc-300
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
  );
}