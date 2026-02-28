"use client";

interface GroupCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupName: string;
    setGroupName: (val: string) => void;
    selectedParticipants: string[];
    setSelectedParticipants: (val: string[]) => void;
    allUsers: any[] | undefined;
    onCreate: () => void;
}

export function GroupCreateModal({
    isOpen,
    onClose,
    groupName,
    setGroupName,
    selectedParticipants,
    setSelectedParticipants,
    allUsers,
    onCreate,
}: GroupCreateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Create New Group</h2>
                    <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 p-1">✕</button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block mb-1.5 uppercase">Group Name</label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            className="w-full border text-black dark:text-zinc-50 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-500"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block mb-1.5 uppercase">Add Members</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {allUsers === undefined ? (
                                <div className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-500 italic">Finding users...</div>
                            ) : allUsers.length === 0 ? (
                                <div className="text-center py-4 text-xs text-zinc-400 dark:text-zinc-500">No users found</div>
                            ) : (
                                allUsers.map((u: any) => (
                                    <label
                                        key={u._id}
                                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${selectedParticipants.includes(u._id)
                                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                                            : 'border-zinc-100 dark:border-zinc-700 hover:border-zinc-200 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedParticipants.includes(u._id)}
                                            onChange={() => {
                                                if (selectedParticipants.includes(u._id)) {
                                                    setSelectedParticipants(selectedParticipants.filter(id => id !== u._id));
                                                } else {
                                                    setSelectedParticipants([...selectedParticipants, u._id]);
                                                }
                                            }}
                                        />
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-200">
                                            {u.name?.[0] || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 flex-1">{u.name}</span>
                                        {selectedParticipants.includes(u._id) && (
                                            <div className="h-4 w-4 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                    <button
                        onClick={onCreate}
                        disabled={!groupName.trim() || selectedParticipants.length === 0}
                        className="w-full bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
}
