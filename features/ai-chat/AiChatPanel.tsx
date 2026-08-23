"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getBudget } from "@/lib/services/budget.service";
import { getGoals } from "@/lib/services/goals.service";
import { getProfile } from "@/lib/services/profile.service";
import { getTransactions } from "@/lib/services/transactions.service";
import styles from "./AiChatPanel.module.css";
import ReactMarkdown from "react-markdown";
const markdownComponents = {
  h1: ({ children }: any) => <p style={{ fontWeight: 700, margin: "0.3rem 0" }}>{children}</p>,
  h2: ({ children }: any) => <p style={{ fontWeight: 700, margin: "0.3rem 0" }}>{children}</p>,
  h3: ({ children }: any) => <p style={{ fontWeight: 700, margin: "0.3rem 0" }}>{children}</p>,
  h4: ({ children }: any) => <p style={{ fontWeight: 700, margin: "0.3rem 0" }}>{children}</p>,
  p: ({ children }: any) => <p style={{ margin: "0 0 0.4rem 0" }}>{children}</p>,
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function AiChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [userFinance, setUserFinance] = useState<any>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: "welcome", role: "ai", text: t("aichat_welcome") }]);
  }, [t]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;

    async function fetchFinanceData() {
      try {
        const [budget, goals, profile, transactions] = await Promise.all([
          getBudget(),
          getGoals(),
          getProfile(),
          getTransactions(),
        ]);

        const currentMonth = new Date().toISOString().slice(0, 7);

        const totalPengeluaranBulanIni = transactions
          .filter((tx) => tx.type === "expense" && tx.date?.startsWith(currentMonth))
          .reduce((sum, tx) => sum + tx.amount, 0);

        const totalPemasukanBulanIni = transactions
          .filter((tx) => tx.type === "income" && tx.date?.startsWith(currentMonth))
          .reduce((sum, tx) => sum + tx.amount, 0);

        setUserFinance({
          profile,
          budget,
          goals,
          totalPengeluaranBulanIni,
          totalPemasukanBulanIni,
          transaksiTerakhir: transactions.slice(0, 15),
        });
      } catch (err) {
        console.error("Gagal ambil data finance untuk AI:", err);
      }
    }

    fetchFinanceData();
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
              role: m.role === "ai" ? "assistant" : "user",
              content: m.text,
            })),
          userFinance,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-ai", role: "ai", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-ai", role: "ai", text: "Maaf, terjadi kesalahan koneksi." },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.panel}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.headerIcon}>🤖</div>
              <div className={styles.headerText}>
                <div className={styles.title}>{t("aichat_title")}</div>
                <div className={styles.subtitle}>{t("aichat_subtitle")}</div>
              </div>
              <button className={styles.closeBtn} onClick={onClose} title={t("btn_close")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.messages} ref={listRef}>
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? styles.rowUser : styles.rowAi}>
                  {m.role === "ai" && <div className={styles.avatarAi}>🤖</div>}
                  <div className={m.role === "user" ? styles.bubbleUser : styles.bubbleAi}>
                    {m.role === "ai" ? (
                      <ReactMarkdown components={markdownComponents}>{m.text}</ReactMarkdown>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className={styles.rowAi}>
                  <div className={styles.avatarAi}>🤖</div>
                  <div className={styles.bubbleAi}>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                    <span className={styles.typingDot}></span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.inputBar}>
              <input
                className={styles.input}
                placeholder={t("aichat_input_placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.sendBtn} onClick={handleSend} title={t("btn_save")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}