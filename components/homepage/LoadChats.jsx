  export async function loadChats({loading, setChats}) {
    try {
      loading(true);

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