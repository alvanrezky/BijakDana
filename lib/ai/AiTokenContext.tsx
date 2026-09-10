"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AiTokenContextValue {
  open: boolean;
  openPurchase: () => void;
  closePurchase: () => void;
}

const AiTokenContext = createContext<AiTokenContextValue | null>(null);

export function AiTokenProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AiTokenContext.Provider value={{ open, openPurchase: () => setOpen(true), closePurchase: () => setOpen(false) }}>
      {children}
    </AiTokenContext.Provider>
  );
}

export function useAiToken() {
  const ctx = useContext(AiTokenContext);
  if (!ctx) throw new Error("useAiToken must be used within AiTokenProvider");
  return ctx;
}