import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export function ChatRightSidebar({
    onChatSelect,
}: {
    onChatSelect: (conversationId: string) => void;
}) {
    const suggestedUsers = useQuery(api.messages.getSuggestedUsers);
    const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
    const sendChatInvite = useMutation((api as any).messages.sendChatInvite);

    const startChat = async (userId: string) => {
        const conversationId = await getOrCreateConversation({ otherUserId: userId as any });
        onChatSelect(conversationId);
    };

    const handleSendInvite = async (userId: string) => {
        try {
            await sendChatInvite({ toUserId: userId as any });
        } catch (err) {
            console.error("Failed to send chat invite:", err);
        }
    };

    return (
        <aside className="flex h-full w-[280px] flex-col border-l border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 px-6 py-4 min-h-[73px] bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Suggested For You</h2>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
                {suggestedUsers === undefined ? (
                    <p className="px-2 py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
                ) : suggestedUsers.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-zinc-400 dark:text-zinc-500">No users found</p>
                ) : (
                    suggestedUsers.map((user: any) => (
                        <div
                            key={user._id}
                            onClick={() => {
                                if (user.isInConversation) {
                                    startChat(user._id);
                                } else if (!user.hasPendingInvite) {
                                    handleSendInvite(user._id);
                                }
                            }}
                            className={`flex items-center rounded-xl px-2 py-2 text-left transition-all duration-200 group ${user.isInConversation
                                ? "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer active:scale-[0.98]"
                                : user.hasPendingInvite
                                    ? "opacity-80 cursor-default"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer active:scale-[0.98]"
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative shrink-0 transition-transform group-hover:scale-105">
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} alt={user.name || "User"} className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 object-cover ring-2 ring-transparent group-hover:ring-indigo-500/30" />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-200 ring-2 ring-transparent group-hover:ring-indigo-500/30">
                                            {(user.name || "User")[0].toUpperCase()}
                                        </div>
                                    )}
                                    {user.lastSeenAt && (Date.now() - user.lastSeenAt < 60000) && (
                                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {user.name || "Anonymous User"}
                                    </p>
                                </div>
                            </div>
                            {user.isInConversation ? (
                                <div className="shrink-0 px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </div>
                            ) : user.hasPendingInvite ? (
                                <div className="shrink-0 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Sent</span>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendInvite(user._id);
                                    }}
                                    className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-all cursor-pointer active:scale-90 shadow-sm opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
                                    title="Send chat request"
                                >
                                    Request
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

