import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    sidebarWidth: number;
    uiScale: number;
    theme: 'light' | 'dark';
    isSettingsOpen: boolean;
    setSidebarWidth: (width: number) => void;
    setUIScale: (scale: number) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarWidth: 320,
            uiScale: 1.0,
            theme: 'light',
            isSettingsOpen: false,
            setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
            setUIScale: (scale: number) => {
                set({ uiScale: scale });
                if (typeof document !== 'undefined') {
                    document.documentElement.style.fontSize = `${scale * 16}px`;
                }
            },
            setTheme: (theme: 'light' | 'dark') => {
                set({ theme });
                if (typeof document !== 'undefined') {
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            },
            setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
        }),
        {
            name: 'tars-ui-storage',
            partialize: (state) => ({
                sidebarWidth: state.sidebarWidth,
                uiScale: state.uiScale,
                theme: state.theme
            }),
        }
    )
);
