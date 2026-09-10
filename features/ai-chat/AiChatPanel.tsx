"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getTransactions, saveTransaction } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { getProfile, saveProfile } from "@/lib/services/profile.service";
import { getGoals } from "@/lib/services/goals.service";
import { buildFinancePayload } from "@/lib/ai/buildFinancePayload";
import { Transaction } from "@/types/models";
import { AiStartAction } from "@/lib/ai/AiChatContext";
import { useAiToken } from "@/lib/ai/AiTokenContext";
import CameraCaptureModal from "./CameraCaptureModal";
import AiMessageText from "./AiMessageText";
import styles from "./AiChatPanel.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  tokenExhausted?: boolean;
};

type TransaksiItem = {
  type: "income" | "expense";
  cat: string;
  amount: number;
  desc: string;
  method: string;
  date?: string;
};

const AI_ENDPOINT = "/api/chat";

// Riwayat chat dianggap "basi" dan otomatis direset kalau tidak ada aktivitas
// (pesan baru / buka panel) selama durasi ini. Ubah angka di sini kalau mau
// durasi berbeda (contoh: 60 * 60 * 1000 untuk 1 jam).
const CHAT_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 jam

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Pengaman tambahan: id TIDAK PERNAH kosong / duplikat, bahkan kalau
// crypto.randomUUID tidak tersedia atau dipanggil sangat cepat berurutan.
let idCounter = 0;
function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `id-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2)}`;
}

export default function AiChatPanel({
  open,
  onClose,
  initialMessage,
  startAction,
}: {
  open: boolean;
  onClose: () => void;
  initialMessage?: string | null;
  startAction?: AiStartAction;
}) {
  const { t } = useLanguage();
  const { openPurchase } = useAiToken();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasSentInitial = useRef(false);
  const hasTriggeredAction = useRef(false);

  // SUMBER KEBENARAN TUNGGAL untuk riwayat pesan. State `messages` hanya dipakai untuk
  // trigger re-render; semua logic yang butuh riwayat pesan "saat ini" (kirim ke AI, dsb)
  // HARUS baca dari sini, bukan dari closure/side-effect di dalam setState.
  const messagesRef = useRef<ChatMessage[]>([]);

  // Menyimpan kapan terakhir kali ada aktivitas (pesan baru terkirim/diterima).
  // Dipakai untuk menentukan apakah history sudah "basi" dan perlu direset.
  const lastActivityRef = useRef<number>(Date.now());

  function setMessagesSynced(next: ChatMessage[]) {
    messagesRef.current = next;
    setMessages(next);
    lastActivityRef.current = Date.now();
  }

  useEffect(() => {
    if (!open) {
      hasSentInitial.current = false;
      hasTriggeredAction.current = false;
      setShowPhotoOptions(false);
      return;
    }

    const isFirstTime = messagesRef.current.length === 0;
    const isExpired = !isFirstTime && Date.now() - lastActivityRef.current > CHAT_EXPIRY_MS;

    // Reset history HANYA kalau ini percakapan baru (belum ada pesan sama sekali)
    // ATAU history sudah basi karena tidak ada aktivitas lebih dari CHAT_EXPIRY_MS.
    // Selain dua kondisi ini, history TIDAK di-reset saat panel dibuka ulang,
    // supaya jawaban AI yang masih diproses di background & percakapan yang
    // masih relevan tidak hilang begitu saja.
    if (isFirstTime || isExpired) {
      setMessagesSynced([{ id: newId(), role: "ai", text: t("aichat_welcome") }]);
    } else {
      lastActivityRef.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      setTimeout(() => sendMessage(initialMessage), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage]);

  useEffect(() => {
    if (open && startAction && !hasTriggeredAction.current) {
      hasTriggeredAction.current = true;
      setTimeout(() => {
        if (startAction === "mic") toggleMic();
        if (startAction === "camera") setShowPhotoOptions(true);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startAction]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing]);

  function addMessage(msg: Omit<ChatMessage, "id">) {
    const withId = { ...msg, id: newId() };
    setMessagesSynced([...messagesRef.current, withId]);
  }

  async function saveIncomingTransactions(list: TransaksiItem[]) {
    for (const item of list) {
      const now = new Date();
      const date = item.date || now.toISOString().split("T")[0];
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        type: item.type,
        cat: item.cat,
        amount: item.amount,
        desc: item.desc,
        method: item.method,
        date,
        time: now.toTimeString().slice(0, 5),
        note: "",
        createdAt: now.toISOString(),
      };
      await saveTransaction(newTx);
    }
  }

  async function callAi(
    apiMessages: { role: string; content: string }[],
    image?: string
  ): Promise<{ exhausted: true } | { exhausted: false; reply: string }> {
    const [transactions, budget, profile, goals] = await Promise.all([
      getTransactions(),
      getBudget(),
      getProfile(),
      getGoals(),
    ]);
    if (!profile) throw new Error("Profil tidak ditemukan");

    const TOKEN_COST = image ? 1500 : 500;
    if (profile.aiTokenBalance < TOKEN_COST) {
      return { exhausted: true };
    }

    const userFinance = buildFinancePayload(transactions, budget, profile, goals);

    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, userFinance, image }),
    });

    const data: { reply: string; transaksi: TransaksiItem[] | null } = await res.json();

    if (data.transaksi && data.transaksi.length > 0) {
      await saveIncomingTransactions(data.transaksi);
    }

    await saveProfile({ ...profile, aiTokenBalance: Math.max(0, profile.aiTokenBalance - TOKEN_COST) });

    return { exhausted: false, reply: data.reply };
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", text: trimmed };
    const snapshot = [...messagesRef.current, userMsg];
    setMessagesSynced(snapshot);
    setInput("");
    setTyping(true);

    try {
      const apiMessages = snapshot
        .filter((m, i) => !(i === 0 && m.role === "ai"))
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const result = await callAi(apiMessages);
      if (result.exhausted) {
        addMessage({ role: "ai", text: t("aichat_token_exhausted"), tokenExhausted: true });
      } else {
        addMessage({ role: "ai", text: result.reply });
      }
    } catch (err) {
      console.error(err);
      addMessage({ role: "ai", text: t("aichat_error") });
    } finally {
      setTyping(false);
    }
  }

  async function sendImageMessage(file: File) {
    const placeholderMsg: ChatMessage = {
      id: newId(),
      role: "user",
      text: `📷 ${t("aichat_receipt_uploaded")}: ${file.name}`,
    };
    const snapshot = [...messagesRef.current, placeholderMsg];
    setMessagesSynced(snapshot);
    setTyping(true);

    try {
      const base64 = await fileToBase64(file);
      const apiMessages = [
        ...snapshot
          .filter((m, i) => !(i === 0 && m.role === "ai"))
          .slice(0, -1)
          .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
        { role: "user", content: "Tolong baca struk belanja ini dan catat transaksinya." },
      ];

      const result = await callAi(apiMessages, base64);
      if (result.exhausted) {
        addMessage({ role: "ai", text: t("aichat_token_exhausted"), tokenExhausted: true });
      } else {
        addMessage({ role: "ai", text: result.reply });
      }
    } catch (err) {
      console.error(err);
      addMessage({ role: "ai", text: t("aichat_error") });
    } finally {
      setTyping(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  function toggleMic() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("aichat_mic_unsupported"));
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function handleGallerySelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setShowPhotoOptions(false);
    if (!file) return;
    sendImageMessage(file);
    e.target.value = "";
  }

  function handleCameraCapture(file: File) {
    sendImageMessage(file);
  }

  // Fix duplicate-key: overlay chat & CameraCaptureModal dipisah jadi dua
  // AnimatePresence independen (dibungkus fragment), bukan digabung dalam satu
  // AnimatePresence tanpa prop key seperti sebelumnya — itulah penyebab warning.
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-chat-overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={styles.panel}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className={styles.header}>
                <div className={styles.headerIcon}>
                  <img src="/mono-mascot.png" alt="Mono" className={styles.mascotImg} />
                </div>
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
                {messages.map((m, idx) => (
                  <div
                    key={`msg-${idx}-${m.id}`}
                    className={m.role === "user" ? styles.rowUser : styles.rowAi}
                  >
                    {m.role === "ai" && (
                      <div className={styles.avatarAi}>
                        <img src="/mono-mascot.png" alt="Mono" className={styles.mascotImgSmall} />
                      </div>
                    )}
                    <div className={m.role === "user" ? styles.bubbleUser : styles.bubbleAi}>
                      {m.role === "ai" ? <AiMessageText text={m.text} /> : m.text}
                      {m.tokenExhausted && (
                        <button className={styles.tokenBuyInlineBtn} onClick={openPurchase}>
                          {t("token_buy_btn_short")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className={styles.rowAi}>
                    <div className={styles.avatarAi}>
                      <img src="/mono-mascot.png" alt="Mono" className={styles.mascotImgSmall} />
                    </div>
                    <div className={styles.typingBubble}>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.inputBar}>
                <div className={styles.photoBtnWrap}>
                  <button className={styles.iconBtn} onClick={() => setShowPhotoOptions((v) => !v)} title={t("aichat_receipt_btn")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </button>
                  {showPhotoOptions && (
                    <div className={styles.photoPopover}>
                      <button
                        className={styles.photoOption}
                        onClick={() => {
                          setShowPhotoOptions(false);
                          setCameraOpen(true);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        {t("aichat_photo_camera")}
                      </button>
                      <button className={styles.photoOption} onClick={() => galleryInputRef.current?.click()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                        {t("aichat_photo_gallery")}
                      </button>
                    </div>
                  )}
                </div>
                <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleGallerySelected} />

                <button
                  className={recording ? styles.iconBtnActive : styles.iconBtn}
                  onClick={toggleMic}
                  title={t("aichat_mic_btn")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                </button>
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

      <CameraCaptureModal open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
    </>
  );
}