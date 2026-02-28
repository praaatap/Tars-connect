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
        <aside className="flex h-full w-[280px] flex-col border-l border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 min-h-[73px]">
                <h2 className="text-sm font-semibold text-zinc-900">Suggested Users</h2>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
                {suggestedUsers === undefined ? (
                    <p className="px-2 py-4 text-center text-sm text-zinc-400">Loading...</p>
                ) : suggestedUsers.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-zinc-400">No users found</p>
                ) : (
                    suggestedUsers.map((user: any) => (
                        <div
                            key={user._id}
                            className="flex items-center rounded-xl px-2 py-2 text-left transition hover:bg-zinc-50"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative shrink-0">
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} alt={user.name || "User"} className="h-8 w-8 rounded-full bg-zinc-200 object-cover" />
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
                                </div>
                            </div>
                            {user.isInConversation ? (
                                <div className="shrink-0 px-2 py-1 rounded-lg bg-zinc-200 flex items-center gap-1">
                                    <svg className="w-3 h-3 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </div>
                            ) : user.hasPendingInvite ? (
                                <div className="shrink-0 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                                    <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-[9px] font-bold text-emerald-700 uppercase">Sent</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleSendInvite(user._id)}
                                    className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95 shadow-sm"
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

