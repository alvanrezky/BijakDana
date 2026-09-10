"use client";
import { useRef, useState } from "react";
import { Profile } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getGreetingKey } from "@/lib/utils/greeting";
import { useCsvImport } from "@/lib/ai/CsvImportContext";
import styles from "./AiHomeSearchBar.module.css";

export default function AiHomeSearchBar({
  profile,
  onSubmit,
  onOpenMic,
  onOpenCamera,
}: {
  profile: Profile;
  onSubmit: (message: string) => void;
  onOpenMic: () => void;
  onOpenCamera: () => void;
}) {
  const { t } = useLanguage();
  const { openImport } = useCsvImport();
  const [value, setValue] = useState("");
  const firstName = profile.name?.split(" ")[0] || "";
  const placeholder = `${t(getGreetingKey())}, ${firstName}! ${t("ai_bar_question_suffix")}`;

  function handleSubmit() {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.mascot}>
        <img src="/mono-mascot.png" alt="Mono" className={styles.mascotFallback} />
      </div>
      <input
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onOpenMic} title={t("aichat_mic_btn")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={onOpenCamera} title={t("aichat_receipt_btn")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={openImport} title={t("csv_import_btn")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        <button className={styles.sendBtn} onClick={handleSubmit} title={t("ai_bar_send")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}