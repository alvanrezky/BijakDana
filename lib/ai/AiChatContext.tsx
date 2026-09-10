"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type AiStartAction = "mic" | "camera" | null;

interface AiChatContextValue {
  open: boolean;
  initialMessage: string | null;
  startAction: AiStartAction;
  openChat: (initialMessage?: string, startAction?: AiStartAction) => void;
  closeChat: () => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [startAction, setStartAction] = useState<AiStartAction>(null);

  function openChat(msg?: string, action?: AiStartAction) {
    setInitialMessage(msg || null);
    setStartAction(action || null);
    setOpen(true);
  }
  function closeChat() {
    setOpen(false);
    setInitialMessage(null);
    setStartAction(null);
  }

  return (
    <AiChatContext.Provider value={{ open, initialMessage, startAction, openChat, closeChat }}>
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  const ctx = useContext(AiChatContext);
  if (!ctx) throw new Error("useAiChat must be used within AiChatProvider");
  return ctx;
}