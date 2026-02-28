import { useUIStore } from "../../store/useUIStore";

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    uiScale: number;
    onScaleChange: (scale: number) => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
};

export function SettingsModal({
    isOpen,
    onClose,
    uiScale,
    onScaleChange,
    theme,
    onThemeChange,
}: SettingsModalProps) {
    if (!isOpen) return null;

    const scales = [
        { label: "Small", value: 0.85, icon: "S" },
        { label: "Normal", value: 1.0, icon: "M" },
        { label: "Large", value: 1.15, icon: "L" },
        { label: "Elite", value: 1.3, icon: "XL" },
    ];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                        <h2 className="font-black text-zinc-900 dark:text-zinc-50 text-xl uppercase tracking-tighter">Settings</h2>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Personalize your Workspace</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all active:scale-90"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Theme Toggle */}
                    <section>
                        <label className="block text-[11px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-4">Appearance</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onThemeChange('light')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'light'
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${theme === 'light' ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                                    ☀️
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Light</span>
                            </button>
                            <button
                                onClick={() => onThemeChange('dark')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'dark'
                                    ? "border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-md"
                                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${theme === 'dark' ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                                    🌙
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Dark</span>
                            </button>
                        </div>
                    </section>

                    {/* UI Scale */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Interface Scale</label>
                            <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                {(uiScale * 100).toFixed(0)}%
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {scales.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => onScaleChange(s.value)}
                                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all group ${uiScale === s.value
                                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 shadow-inner"
                                        : "border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-100 dark:hover:border-zinc-700"
                                        }`}
                                >
                                    <span className={`text-sm font-black transition-transform group-hover:scale-110 ${uiScale === s.value ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-600"
                                        }`}>
                                        {s.icon}
                                    </span>
                                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${uiScale === s.value ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-400 dark:text-zinc-500"
                                        }`}>
                                        {s.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="p-4 bg-indigo-600 dark:bg-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Scale Preview</p>
                        <p className="text-xs font-medium leading-relaxed">
                            This adjusts the size of text and layout for better visibility.
                        </p>
                    </section>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-zinc-900 dark:bg-indigo-600 text-white rounded-2xl py-4 text-sm font-black shadow-lg hover:bg-black dark:hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
}
