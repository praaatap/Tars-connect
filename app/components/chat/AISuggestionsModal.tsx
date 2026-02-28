interface AISuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    isLoading: boolean;
    hasMessages?: boolean;
}

export function AISuggestionsModal({
    isOpen,
    onClose,
    suggestions,
    onSelect,
    isLoading,
    hasMessages = true,
}: AISuggestionsModalProps) {
    if (!isOpen) return null;
    const Tones = ['Casual', 'Formal', 'Friendly', 'Professional', 'Humorous', 'Polite', 'Enthusiastic', 'Sarcastic', 'Witty', 'Playful'];
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-950/20">
                    <div>
                        <h2 className="font-black text-indigo-900 dark:text-indigo-200 text-lg uppercase tracking-tight flex items-center gap-2">
                            <span className="text-xl">✨</span> AI Smart Replies
                        </h2>
                        <p className="text-[10px] text-indigo-400 dark:text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Powered by Gemini AI</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors shadow-sm"
                    >
                        ✕
                    </button>
                </div>


                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="h-10 w-10 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 animate-pulse">Consulting the magic mirror...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSelect(s)}
                                        className="w-full text-left p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group active:scale-[0.98]"
                                    >
                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 leading-snug">
                                            "{s}"
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium italic">
                                        {hasMessages
                                            ? "Could not find any suggestions. Try starting the conversation!"
                                            : "Start the conversation first! Send a message and I'll suggest helpful replies."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 text-center">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-3">Choose a reply to insert it automatically into your messenger.</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-zinc-900 dark:bg-indigo-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg hover:bg-black dark:hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
