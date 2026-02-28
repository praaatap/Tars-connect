"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "../store/useUIStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Initial check: if no theme is set yet (e.g. first time), try to match system
    const stored = localStorage.getItem('tars-ui-storage');
    let currentTheme = theme;

    if (!stored) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      currentTheme = prefersDark ? 'dark' : 'light';
      setTheme(currentTheme);
    }

    // Apply the theme class to the document
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for system theme changes if no explicit user preference? 
    // Actually, once user interacts, we stick to their choice.
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only change if user hasn't set one? 
      // For now, let's keep it simple: UI store is the source of truth.
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setTheme]);

  if (!isMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <>
      {children}
    </>
  );
}
