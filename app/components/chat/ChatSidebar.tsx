type ChatItem = {
  name: string;
  message: string;
  time: string;
  active?: boolean;
  unreadCount?: number;
  conversationId?: string;
  isOnline?: boolean;
  imageUrl?: string;
  isGroup?: boolean;
  memberCount?: number;
};

type SearchHistoryItem = {
  _id: string;
  query: string;
  createdAt: number;
};

type ChatSidebarProps = {
  userName: string;
  userStatus: string;
  imageUrl?: string;
  sectionTitle: string;
  searchPlaceholder: string;
  chats: ChatItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchHistory: SearchHistoryItem[];
  onHistorySelect: (value: string) => void;
  onChatSelect: (conversationId: string) => void;
  onCreateGroup?: () => void;
  suggestedUsers?: any[];
  onUserSelect?: (userId: string) => void;
};

export function ChatSidebar({
  userName,
  userStatus,
  imageUrl,
  sectionTitle,
  searchPlaceholder,
  chats,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchHistory,
  onHistorySelect,
  onChatSelect,
  onCreateGroup,
  suggestedUsers,
  onUserSelect,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-full max-w-[320px] flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={userName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-sm font-bold text-indigo-800">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-zinc-900">{userName}</p>
            <p className="text-xs text-emerald-500">{userStatus}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateGroup}
            className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Create Group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          <button className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200">
            ⚙
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <input
          className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 outline-none focus:border-indigo-400 text-[14px]"
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
          <div className="flex flex-col flex-1">
            <p className="px-2 py-8 text-center text-sm text-zinc-400">
              {searchValue.trim() !== "" ? "No people found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.conversationId}
              onClick={() => chat.conversationId && onChatSelect(chat.conversationId)}
              className={`flex items-start justify-between rounded-xl px-2 py-2 text-left transition ${chat.active ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
            >
              <div className="flex items-start gap-2 flex-1">
                <div className="relative mt-1 shrink-0">
                  {chat.isGroup ? (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  ) : chat.imageUrl ? (
                    <img src={chat.imageUrl} alt={chat.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-200" />
                  )}
                  {chat.isOnline && !chat.isGroup && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{chat.name}</p>
                    {chat.isGroup && <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1 rounded">Group</span>}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    {chat.isGroup && chat.memberCount ? `${chat.memberCount} members · ` : ''}
                    {chat.message}
                  </p>
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

        {/* Suggested Users - Mobile only */}
        {suggestedUsers && suggestedUsers.length > 0 && !searchValue.trim() && (
          <div className="mt-8 xl:hidden">
            <p className="px-2 pb-3 text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">
              Suggested for you
            </p>
            <div className="flex flex-col gap-1">
              {suggestedUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => onUserSelect?.(user._id)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-zinc-50"
                >
                  <div className="relative shrink-0">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name || "User"} className="h-8 w-8 rounded-full bg-zinc-200 object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {(user.name || "User")[0].toUpperCase()}
                      </div>
                    )}
                    {user.lastSeenAt && (Date.now() - user.lastSeenAt < 60000) && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{user.name || "Anonymous User"}</p>
                    <p className="text-[10px] text-zinc-400 truncate">New to Tars Connect</p>
                  </div>
                  <div className="text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}