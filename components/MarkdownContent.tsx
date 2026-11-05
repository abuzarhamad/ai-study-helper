import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }) {
  return (
    <div className="study-markdown text-[15px] leading-7 text-zinc-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-2 text-2xl font-semibold tracking-tight text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-semibold text-white">
              {children}
            </h3>
          ),

          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,

          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),

          em: ({ children }) => <em className="text-zinc-200">{children}</em>,

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5 marker:text-zinc-500">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5 marker:text-zinc-500">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="pl-1">{children}</li>,

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-zinc-600 pl-4 text-zinc-500">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full min-w-[500px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-white/[0.04] text-left text-zinc-200">
              {children}
            </thead>
          ),

          tbody: ({ children }) => <tbody>{children}</tbody>,

          tr: ({ children }) => (
            <tr className="border-b border-white/[0.05] last:border-0">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="border-b border-white/[0.08] px-3 py-2 font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-400">{children}</td>
          ),

          /*
           * Inline code.
           */
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");

            if (isBlock) {
              return <code className={className}>{children}</code>;
            }

            return (
              <code
                className="
                  rounded-md
                  border border-white/[0.08]
                  bg-white/[0.06]
                  px-1.5 py-0.5
                  font-mono text-[13px]
                  text-violet-200
                "
              >
                {children}
              </code>
            );
          },

          /*
           * IMPORTANT:
           *
           * CodeBlock is rendered by PRE rather than CODE.
           *
           * This prevents the hydration error:
           *
           * <p>
           *   <div>...</div>
           * </p>
           */
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;

            const className = child?.props?.className || "";

            const language = className.match(/language-([\w-]+)/)?.[1] || "";

            let code = child?.props?.children ?? "";

            if (Array.isArray(code)) {
              code = code.join("");
            }

            return (
              <CodeBlock
                code={String(code).replace(/\n$/, "")}
                language={language}
              />
            );
          },

          hr: () => <hr className="my-7 border-white/[0.08]" />,

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-violet-400
                underline
                decoration-violet-500/30
                underline-offset-2
                transition
                hover:text-violet-300
              "
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}