"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getBudget } from "@/lib/services/budget.service";
import { getGoals } from "@/lib/services/goals.service";
import { getProfile } from "@/lib/services/profile.service";
import { getTransactions, saveTransaction } from "@/lib/services/transactions.service";
import { calcEmergencyFund } from "@/lib/business/savings";
import { calcHealthScore, weakestPillars } from "@/lib/business/healthScore";
import { monthKey, monthLabel, formatRupiah } from "@/lib/utils/format";
import { Transaction } from "@/types/models";
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

function buildMonthlyRecap(transactions: Transaction[], monthsBack = 12) {
  const byMonth: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const key = monthKey(t.date);
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
    if (t.type === "income") byMonth[key].income += t.amount;
    else byMonth[key].expense += t.amount;
  });

  const sortedKeys = Object.keys(byMonth).sort();
  const lastKeys = sortedKeys.slice(-monthsBack);

  return lastKeys.map((key) => ({
    monthKey: key,
    label: monthLabel(key),
    pemasukan: byMonth[key].income,
    pengeluaran: byMonth[key].expense,
    selisih: byMonth[key].income - byMonth[key].expense,
  }));
}

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

      let profileForAi = profile;
      if (profile) {
        const emergencyFund = calcEmergencyFund(transactions, profile);
        profileForAi = {
          ...profile,
          emergencyFundTarget: emergencyFund.target,
          emergencyFundCurrent: emergencyFund.current,
        };
      }

      const riwayatBulanan = buildMonthlyRecap(transactions, 12);

      let skorKesehatan = null;
      if (profile) {
        const healthResult = calcHealthScore(transactions, budget, profile, goals);
        const weakest = weakestPillars(healthResult.pillars, 2);
        skorKesehatan = {
          overall: healthResult.overall,
          label: healthResult.label,
          pillars: healthResult.pillars.map((p) => ({ key: p.key, score: p.score, hasData: p.hasData })),
          pilarTerlemah: weakest.map((p) => ({ key: p.key, score: p.score })),
        };
      }

      setUserFinance({
        profile: profileForAi,
        budget,
        goals,
        totalPengeluaranBulanIni,
        totalPemasukanBulanIni,
        transaksiTerakhir: transactions.slice(0, 15),
        riwayatBulanan,
        skorKesehatan,
      });
    } catch (err) {
      console.error("Gagal ambil data finance untuk AI:", err);
    }
  }

  useEffect(() => {
    if (!open) return;
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
      let replyText = data.reply || "Maaf, terjadi kesalahan.";

      if (data.transaksi) {
        try {
          const now = new Date();
          const tx: Transaction = {
            id: crypto.randomUUID(),
            type: data.transaksi.type,
            cat: data.transaksi.cat,
            amount: data.transaksi.amount,
            desc: data.transaksi.desc || "",
            method: data.transaksi.method || "Cash",
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().slice(0, 5),
            note: "",
            createdAt: now.toISOString(),
            goalId: null,
          };

          await saveTransaction(tx);

          replyText += `\n\n📝 **Tercatat:** ${
            tx.type === "expense" ? "Pengeluaran" : "Pemasukan"
          } ${formatRupiah(tx.amount)} (${tx.desc || tx.cat})`;

          // Refresh data finance supaya pertanyaan berikutnya di sesi chat
          // yang sama langsung pakai angka terbaru (termasuk transaksi ini).
          fetchFinanceData();
        } catch (saveErr) {
          console.error("Gagal simpan transaksi dari AI:", saveErr);
          replyText += "\n\n⚠️ Maaf, transaksi ini gagal disimpan. Coba input manual ya.";
        }
      }

      setMessages((prev) => [...prev, { id: Date.now().toString() + "-ai", role: "ai", text: replyText }]);
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
                    <div className={styles.typingRow}>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                    </div>
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