"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Square,
  Sparkles,
  BookOpen,
  Brain,
  Code2,
  Calculator,
  Trash2,
  Settings2,
  Menu,
  X,
  Plus,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Welcome } from "./Welcome";
import { SidebarButton } from "./SidebarButton";
import { MarkdownContent } from "./MarkdownContent";
import { Settings } from "./Settings";
import { defaultSettings } from "@/data/User";
import { ChatMessage } from "./ChatMessage";
import { Typing } from "./Typing";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState(defaultSettings);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  /* --------------------------------------------- */
  /* INITIAL LOAD */
  /* --------------------------------------------- */

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);


 
  async function loadChats() {
    try {
      setChatsLoading(true);

      const response = await fetch("/api/chats", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load chats.");
      }

      setChats(data.chats || []);
    } catch (error) {
      console.error("Load chats error:", error);
    } finally {
      setChatsLoading(false);
    }
  }


  async function openChat(id) {
    if (!id) return;

    if (loading) {
      abortRef.current?.abort();
      abortRef.current = null;
    }

    try {
      const response = await fetch(`/api/chats/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to open chat.");
      }

      setChatId(data.chat.id);

      setMessages(
        (data.chat.messages || []).map((message) => ({
          id: message.id || crypto.randomUUID(),
          role: message.role,
          content: message.content,
        })),
      );

      if (data.chat.settings) {
        setSettings({
          ...defaultSettings,
          ...data.chat.settings,
        });
      }

      setSidebarOpen(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    } catch (error) {
      console.error("Open chat error:", error);
    }
  }

  
  function clearChat() {
    abortRef.current?.abort();
    abortRef.current = null;

    setMessages([]);
    setInput("");
    setChatId(null);
    setLoading(false);
    setSettingsOpen(false);
    setSidebarOpen(false);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

 
  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }

  function updateInput(value) {
    setInput(value);

    requestAnimationFrame(resizeTextarea);
  }

  async function sendMessage(customText = null) {
    const text = (customText ?? input).trim();

    if (!text || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const controller = new AbortController();

    abortRef.current = controller;

    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history,
          chatId,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || `Request failed with status ${response.status}.`,
        );
      }

      if (!data.reply) {
        throw new Error("AI returned an empty response.");
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((current) => [...current, assistantMessage]);

      /*
       * The first message creates a new MongoDB chat.
       */
      if (!chatId && data.chatId) {
        setChatId(data.chatId);
      }

      /*
       * Refresh sidebar.
       */
      await loadChats();
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          error: true,
          content: error?.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      abortRef.current = null;

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

 
  function stopGeneration() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }


  async function regenerateMessage(messageId) {
    if (loading) return;

    const index = messages.findIndex((message) => message.id === messageId);

    if (index === -1) return;

    const previousUserMessage = [...messages]
      .slice(0, index)
      .reverse()
      .find((message) => message.role === "user");

    if (!previousUserMessage) return;

    const previousMessages = messages.slice(0, index);

    setMessages(previousMessages);

    /*
     * Keep the same MongoDB chat.
     *
     * The API will append the regenerated answer.
     */
    await sendMessage(previousUserMessage.content);
  }

 
  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

 

  return (
    <div className="h-dvh overflow-hidden bg-[#212121] text-zinc-100">
      <div className="flex h-full">
        {/* MOBILE BACKDROP */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* ========================================= */}
        {/* SIDEBAR */}
        {/* ========================================= */}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            flex w-[280px] shrink-0 flex-col
            border-r border-white/[0.06]
            bg-[#171717]
            transition-transform duration-200
            lg:static lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex h-full min-h-0 flex-col">
            {/* LOGO */}

            <div className="flex h-14 shrink-0 items-center justify-between px-3">
              <button
                type="button"
                onClick={clearChat}
                className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/[0.06]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/10">
                  <Sparkles size={16} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    StudyMate
                  </p>

                  <p className="truncate text-[10px] text-zinc-500">
                    AI Study Assistant
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 lg:hidden"
                aria-label="Close sidebar"
              >
                <X size={17} />
              </button>
            </div>

            {/* NEW CHAT */}

            <div className="shrink-0 px-3 pb-3">
              <button
                type="button"
                onClick={clearChat}
                className="
                  flex w-full items-center gap-3
                  rounded-lg
                  border border-white/[0.08]
                  bg-white/[0.04]
                  px-3 py-2.5
                  text-sm font-medium text-zinc-200
                  transition
                  hover:bg-white/[0.07]
                "
              >
                <Plus size={17} />
                New chat
              </button>
            </div>

            {/* TOOLS */}

            <div className="shrink-0 px-3">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Study tools
              </p>

              <div className="space-y-0.5">
                <SidebarButton
                  icon={<Brain size={16} />}
                  label="Explain a concept"
                  onClick={() =>
                    sendMessage(
                      "Explain this topic step by step with simple examples.",
                    )
                  }
                />

                <SidebarButton
                  icon={<BookOpen size={16} />}
                  label="Create study notes"
                  onClick={() =>
                    sendMessage("Create concise study notes for my topic.")
                  }
                />

                <SidebarButton
                  icon={<Calculator size={16} />}
                  label="Practice problems"
                  onClick={() =>
                    sendMessage(
                      "Create practice questions to test my understanding.",
                    )
                  }
                />

                <SidebarButton
                  icon={<Code2 size={16} />}
                  label="Programming help"
                  onClick={() =>
                    sendMessage("Help me understand this programming concept.")
                  }
                />
              </div>
            </div>

            {/* ========================================= */}
            {/* CHAT HISTORY */}
            {/* ========================================= */}

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Recent chats
              </p>

              {chatsLoading ? (
                <div className="space-y-1 px-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-9 animate-pulse rounded-lg bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <MessageSquare
                    size={20}
                    className="mx-auto mb-2 text-zinc-700"
                  />

                  <p className="text-xs text-zinc-600">
                    Your conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {chats.map((chat) => (
                    <button
                      type="button"
                      key={chat.id}
                      onClick={() => openChat(chat.id)}
                      className={`
                        group flex w-full items-center
                        rounded-lg px-3 py-2.5
                        text-left text-sm
                        transition
                        ${
                          chat.id === chatId
                            ? "bg-white/[0.08] text-zinc-100"
                            : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                        }
                      `}
                    >
                      <MessageSquare
                        size={14}
                        className="mr-2.5 shrink-0 text-zinc-600"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {chat.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="shrink-0 p-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs font-medium text-zinc-300">
                    Assistant online
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Ask questions, solve problems, understand difficult concepts,
                  and prepare for exams.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================= */}
        {/* MAIN */}
        {/* ========================================= */}

        <main className="flex min-w-0 flex-1 flex-col">
          {/* HEADER */}

          <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#212121] px-3 md:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={19} />
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen((value) => !value)}
                className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05]"
              >
                Study Assistant
                <ChevronDown
                  size={15}
                  className={`
                    text-zinc-500 transition
                    ${settingsOpen ? "rotate-180" : ""}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsOpen((value) => !value)}
                className={`
                  rounded-lg p-2 transition
                  ${
                    settingsOpen
                      ? "bg-white/[0.08] text-zinc-200"
                      : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  }
                `}
                aria-label="Settings"
              >
                <Settings2 size={17} />
              </button>

              <button
                type="button"
                onClick={clearChat}
                disabled={!messages.length}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-30"
                aria-label="New chat"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </header>

          {/* SETTINGS */}

          {settingsOpen && (
            <Settings settings={settings} setSettings={setSettings} />
          )}

          {/* ========================================= */}
          {/* CHAT */}
          {/* ========================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <Welcome sendMessage={sendMessage} />
            ) : (
              <div className="mx-auto w-full max-w-3xl px-3 pb-36 pt-6 md:px-5 md:pt-8">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRegenerate={() => regenerateMessage(message.id)}
                  />
                ))}

                {loading && messages[messages.length - 1]?.role === "user" && (
                  <Typing />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* COMPOSER */}
          {/* ========================================= */}

          <div className="shrink-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent px-3 pb-3 pt-2 md:px-5 md:pb-5">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
              <div
                className="
                  relative overflow-hidden rounded-2xl
                  border border-white/[0.12]
                  bg-[#2f2f2f]
                  shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                  transition
                  focus-within:border-white/[0.2]
                  focus-within:shadow-[0_8px_35px_rgba(0,0,0,0.35)]
                "
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => updateInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  maxLength={4000}
                  placeholder="Message StudyMate..."
                  className="
                    block max-h-[200px] min-h-[54px] w-full
                    resize-none bg-transparent
                    px-4 pb-2 pt-4
                    text-[15px] leading-6 text-zinc-100
                    outline-none
                    placeholder:text-zinc-500
                    disabled:opacity-50
                  "
                />

                <div className="flex items-center justify-between px-3 pb-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                    <span>
                      {settings.style === "teacher"
                        ? "Teacher"
                        : settings.style === "concise"
                          ? "Concise"
                          : "Balanced"}
                    </span>

                    {input.length > 3000 && (
                      <>
                        <span>·</span>
                        <span>{input.length}/4000</span>
                      </>
                    )}
                  </div>

                  {loading ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition hover:bg-zinc-200"
                      aria-label="Stop generating"
                    >
                      <Square size={12} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg
                        bg-white text-black
                        transition
                        hover:bg-zinc-200
                        disabled:cursor-not-allowed
                        disabled:bg-zinc-600
                        disabled:text-zinc-400
                      "
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-center text-[10px] text-zinc-600">
                StudyMate can make mistakes. Check important information.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
