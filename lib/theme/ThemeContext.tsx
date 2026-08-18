"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type AccentId =
  | "green" | "emerald" | "teal" | "cyan" | "sky"
  | "blue" | "indigo" | "violet" | "purple" | "fuchsia"
  | "pink" | "rose" | "red" | "orange" | "amber"
  | "yellow" | "lime" | "mint" | "slate" | "gray"
  | "zinc" | "stone" | "brown" | "maroon" | "navy";

export const ACCENTS: { id: AccentId; label: string; swatch: string }[] = [
  { id: "green", label: "Hijau (default)", swatch: "#1D9E75" },
  { id: "emerald", label: "Emerald", swatch: "#10B981" },
  { id: "teal", label: "Teal", swatch: "#14B8A6" },
  { id: "cyan", label: "Cyan", swatch: "#06B6D4" },
  { id: "sky", label: "Sky", swatch: "#0EA5E9" },
  { id: "blue", label: "Biru", swatch: "#3B82F6" },
  { id: "indigo", label: "Indigo", swatch: "#6366F1" },
  { id: "violet", label: "Violet", swatch: "#8B5CF6" },
  { id: "purple", label: "Ungu", swatch: "#A855F7" },
  { id: "fuchsia", label: "Fuchsia", swatch: "#D946EF" },
  { id: "pink", label: "Pink", swatch: "#EC4899" },
  { id: "rose", label: "Rose", swatch: "#F43F5E" },
  { id: "red", label: "Merah", swatch: "#EF4444" },
  { id: "orange", label: "Oranye", swatch: "#F97316" },
  { id: "amber", label: "Amber", swatch: "#F59E0B" },
  { id: "yellow", label: "Kuning", swatch: "#EAB308" },
  { id: "lime", label: "Lime", swatch: "#84CC16" },
  { id: "mint", label: "Mint", swatch: "#22C55E" },
  { id: "slate", label: "Slate", swatch: "#64748B" },
  { id: "gray", label: "Abu-abu", swatch: "#6B7280" },
  { id: "zinc", label: "Zinc", swatch: "#71717A" },
  { id: "stone", label: "Stone", swatch: "#78716C" },
  { id: "brown", label: "Coklat", swatch: "#92400E" },
  { id: "maroon", label: "Maroon", swatch: "#7F1D1D" },
  { id: "navy", label: "Navy", swatch: "#1E3A8A" },
];

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentId;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentId) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "bd_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState<AccentId>("green");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.mode) setModeState(parsed.mode);
        if (parsed.accent) setAccentState(parsed.accent);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-accent", accent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }));
  }, [mode, accent, ready]);

  function setMode(m: ThemeMode) {
    setModeState(m);
  }
  function setAccent(a: AccentId) {
    setAccentState(a);
  }
  function toggleMode() {
    setModeState((m) => (m === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}