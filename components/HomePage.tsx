"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Search,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import { Welcome } from "./Welcome";
import { SidebarButton } from "./SidebarButton";
import { MarkdownContent } from "./MarkdownContent";
import { Settings } from "./Settings";
import { defaultSettings } from "@/data/User";
import { ChatMessage } from "./ChatMessage";
import { Typing } from "./Typing";
import Link from "next/link";
import UserDropdown from "./homepage/Dropdown";

export default function Home({ user }) {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState(defaultSettings);
  const [chatSearch, setChatSearch] = useState("");

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  /* --------------------------------------------- */
  /* INITIAL LOAD */
  /* --------------------------------------------- */

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

  const loadChats = useCallback(async () => {
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
      toast.error("Could not load your chats.");
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  async function deleteChat(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingChatId(id);

    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete chat.");
      }

      setChats((currentChats) => currentChats.filter((chat) => chat.id !== id));
      toast.success("Chat deleted.");

      if (chatId === id) {
        clearChat();
      }
    } catch (error) {
      console.error("Delete chat error:", error);
      toast.error(error.message || "Failed to delete chat. Please try again.");
    } finally {
      setDeletingChatId(null);
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
      toast.error(error.message || "Could not open this chat.");
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
      toast.error(error?.message || "Something went wrong. Please try again.");
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
                    <ChatHistoryItem
                      key={chat.id}
                      chat={chat}
                      active={chat.id === chatId}
                      deleting={deletingChatId === chat.id}
                      onOpen={() => openChat(chat.id)}
                      onDelete={() => deleteChat(chat.id, chat.title)}
                    />
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
              {/* <button
                type="button"
                
                className="rounded-lg p-2 text-red-500 transition cursor-pointer hover:bg-red/[0.06] hover:bg-red-500 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              
              >
                LogoutButton
              </button> */}
              {user ? (
                <UserDropdown
                  user={user}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                >
                  Login
                </Link>
              )}
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

function ChatHistoryItem({ chat, active, deleting, onOpen, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!itemRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleDelete() {
    setMenuOpen(false);
    await onDelete();
  }

  return (
    <div
      ref={itemRef}
      className={`group relative flex items-center rounded-lg transition ${
        active
          ? "bg-white/[0.08] text-zinc-100"
          : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        title={chat.title}
        className="flex min-w-0 flex-1 items-center rounded-l-lg px-3 py-2.5 text-left text-sm"
      >
        <MessageSquare
          size={14}
          aria-hidden="true"
          className="mr-2.5 shrink-0 text-zinc-600"
        />
        <span className="min-w-0 flex-1 truncate">{chat.title}</span>
      </button>

      <button
        ref={menuButtonRef}
        type="button"
        aria-label={`More options for ${chat.title}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        disabled={deleting}
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
        className="mr-1 rounded-md p-1.5 text-zinc-500 opacity-100 transition hover:bg-white/[0.1] hover:text-white focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group-hover:opacity-100 sm:opacity-0 disabled:cursor-wait disabled:opacity-50"
      >
        {deleting ? (
          <span
            aria-label="Deleting chat"
            className="block h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"
          />
        ) : (
          <MoreHorizontal size={16} aria-hidden="true" />
        )}
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label={`Options for ${chat.title}`}
          className="absolute right-1 top-full z-30 mt-1 min-w-36 rounded-lg border border-white/10 bg-[#242424] p-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:outline-none"
          >
            <Trash size={14} aria-hidden="true" />
            Delete chat
          </button>
        </div>
      )}
    </div>
  );
}
