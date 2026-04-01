"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-accent-warm group-hover:text-accent transition-colors" />
      )}
    </button>
  );
}
