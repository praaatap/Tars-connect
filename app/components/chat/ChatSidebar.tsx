type ChatItem = {
  name: string;
  message: string;
  time: string;
  active?: boolean;
  unreadCount?: number;
  conversationId?: string;
};

type SearchHistoryItem = {
  _id: string;
  query: string;
  createdAt: number;
};

type ChatSidebarProps = {
  userName: string;
  userStatus: string;
  sectionTitle: string;
  searchPlaceholder: string;
  chats: ChatItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchHistory: SearchHistoryItem[];
  onHistorySelect: (value: string) => void;
  onChatSelect: (conversationId: string) => void;
};

export function ChatSidebar({
  userName,
  userStatus,
  sectionTitle,
  searchPlaceholder,
  chats,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchHistory,
  onHistorySelect,
  onChatSelect,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-full max-w-[320px] flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-sm font-bold text-indigo-800">
            {userName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{userName}</p>
            <p className="text-xs text-emerald-500">{userStatus}</p>
          </div>
        </div>
        <button className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
          ⚙
        </button>
      </div>

      <div className="px-4 py-3">
        <input
          className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 outline-none focus:border-indigo-400"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
      </div>

      {searchHistory.length > 0 ? (
        <div className="px-4 pb-3">
          <p className="pb-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-400">
            RECENT SEARCHES
          </p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <button
                key={item._id}
                onClick={() => onHistorySelect(item.query)}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="px-4 pb-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-400">
        {sectionTitle}
      </p>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4">
        {chats.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-zinc-400">
            {searchValue.trim() !== "" ? "No people found" : "No conversations yet"}
          </p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.conversationId}
              onClick={() => chat.conversationId && onChatSelect(chat.conversationId)}
              className={`flex items-start justify-between rounded-xl px-2 py-2 text-left transition ${chat.active ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
            >
              <div className="flex items-start gap-2 flex-1">
                <div className="mt-1 h-8 w-8 rounded-full bg-zinc-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{chat.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{chat.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 pt-1 shrink-0">
                <span className="text-xs text-zinc-400 whitespace-nowrap">{chat.time}</span>
                {chat.unreadCount ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-semibold text-white">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}