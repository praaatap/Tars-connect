import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    sidebarWidth: number;
    uiScale: number;
    isSettingsOpen: boolean;
    setSidebarWidth: (width: number) => void;
    setUIScale: (scale: number) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarWidth: 320,
            uiScale: 1.0,
            isSettingsOpen: false,
            setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
            setUIScale: (scale: number) => {
                set({ uiScale: scale });
                if (typeof document !== 'undefined') {
                    document.documentElement.style.fontSize = `${scale * 16}px`;
                }
            },
            setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
        }),
        {
            name: 'tars-ui-storage',
            partialize: (state) => ({
                sidebarWidth: state.sidebarWidth,
                uiScale: state.uiScale
            }),
        }
    )
);
