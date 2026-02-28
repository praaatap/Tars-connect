import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export function ChatRightSidebar({
    onChatSelect,
}: {
    onChatSelect: (conversationId: string) => void;
}) {
    const suggestedUsers = useQuery(api.messages.getSuggestedUsers);
    const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);

    const startChat = async (userId: string) => {
        const conversationId = await getOrCreateConversation({ otherUserId: userId as any });
        onChatSelect(conversationId);
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
                        <button
                            key={user._id}
                            onClick={() => startChat(user._id)}
                            className="flex flex-col items-start rounded-xl px-2 py-2 text-left transition hover:bg-zinc-50"
                        >
                            <div className="flex items-center gap-3 w-full">
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
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}
