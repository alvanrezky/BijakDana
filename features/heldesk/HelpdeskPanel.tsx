"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getAllFaq, FaqEntry } from "@/lib/services/faq.service";
import {
  getOrCreateOpenTicket,
  getMessages,
  sendUserMessage,
  markAdminMessagesRead,
  SupportMessage,
} from "@/lib/services/support.service";
import styles from "./HelpdeskPanel.module.css";

type ViewMode = "faq" | "ticket";

export default function HelpdeskPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [allFaq, setAllFaq] = useState<FaqEntry[]>([]);
  const [category, setCategory] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("faq");

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [ticketInput, setTicketInput] = useState("");
  const [loadingTicket, setLoadingTicket] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode("faq");
      setSearch("");
      setCategory("Semua");
      return;
    }
    getAllFaq().then(setAllFaq);
  }, [open]);

  useEffect(() => {
    if (mode !== "ticket" || !ticketId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ticketId]);

  async function loadMessages() {
    if (!ticketId) return;
    const msgs = await getMessages(ticketId);
    setMessages(msgs);
    await markAdminMessagesRead(ticketId);
  }

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(allFaq.map((f) => f.category)))], [allFaq]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allFaq.filter((f) => {
      const matchCategory = category === "Semua" || f.category === category;
      const matchSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [allFaq, category, search]);

  async function handleStartTicket() {
    setLoadingTicket(true);
    const id = await getOrCreateOpenTicket();
    setTicketId(id);
    setLoadingTicket(false);
    setMode("ticket");
  }

  async function handleSendTicketMessage() {
    if (!ticketInput.trim() || !ticketId) return;
    await sendUserMessage(ticketId, ticketInput.trim());
    setTicketInput("");
    await loadMessages();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={styles.panel}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div>
                <div className={styles.title}>{mode === "ticket" ? t("helpdesk_ticket_title") : t("helpdesk_title")}</div>
                <div className={styles.subtitle}>{mode === "ticket" ? t("helpdesk_ticket_subtitle") : t("helpdesk_subtitle")}</div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {mode === "faq" ? (
              <>
                <div className={styles.searchRow}>
                  <input
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("helpdesk_search_placeholder")}
                  />
                </div>

                <div className={styles.categoryChips}>
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={category === c ? styles.chipActive : styles.chip}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className={styles.body}>
                  {filtered.length === 0 ? (
                    <div className={styles.faqEmptyState}>{t("helpdesk_not_found_search")}</div>
                  ) : (
                    filtered.map((f) => (
                      <div key={f.id} className={styles.faqItem}>
                        <button className={styles.faqQ} onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
                          <span>{f.question}</span>
                          <svg
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                            style={{ transform: expanded === f.id ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {expanded === f.id && <div className={styles.faqA}>{f.answer}</div>}
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.footer}>
                  <div className={styles.footerText}>{t("helpdesk_not_found")}</div>
                  <button className={styles.csBtn} onClick={handleStartTicket} disabled={loadingTicket}>
                    {loadingTicket ? t("btn_saving") : t("helpdesk_contact_cs")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.ticketMessages}>
                  {messages.length === 0 ? (
                    <div className={styles.ticketEmpty}>{t("helpdesk_ticket_empty")}</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={m.sender === "user" ? styles.rowUser : styles.rowAdmin}>
                        <div className={m.sender === "user" ? styles.bubbleUser : styles.bubbleAdmin}>{m.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.ticketInputBar}>
                  <input
                    className={styles.ticketInput}
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendTicketMessage()}
                    placeholder={t("helpdesk_ticket_placeholder")}
                  />
                  <button className={styles.ticketSendBtn} onClick={handleSendTicketMessage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <button className={styles.backToFaqBtn} onClick={() => setMode("faq")}>
                  {t("helpdesk_back_to_faq")}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}