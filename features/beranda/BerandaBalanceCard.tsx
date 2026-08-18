"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/animations/CountUp";
import { formatRupiahShort } from "@/lib/utils/format";
import { PeriodStats } from "@/lib/business/stats";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./BerandaBalanceCard.module.css";

const monthKeys: DictKey[] = [
  "month_1", "month_2", "month_3", "month_4", "month_5", "month_6",
  "month_7", "month_8", "month_9", "month_10", "month_11", "month_12",
];

export default function BerandaBalanceCard({ stats, income }: { stats: PeriodStats; income: number }) {
  const { t } = useLanguage();
  const [hidden, setHidden] = useState(false);
  const saved = Math.max(0, income - stats.expense);
  const now = new Date();
  const periodLabel = `${t(monthKeys[now.getMonth()])} ${now.getFullYear()} · ${t("beranda_balance_updated")}`;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.topRow}>
        <div className={styles.label}>{t("beranda_balance_label")}</div>
        <button className={styles.eyeBtn} onClick={() => setHidden((h) => !h)}>
          {hidden ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.42 20.42 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a20.42 20.42 0 01-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <div className={styles.amount}>{hidden ? "Rp ••••••" : <CountUp value={stats.balance} />}</div>
      <div className={styles.period}>{periodLabel}</div>
      <div className={styles.pills}>
        <div className={styles.pill}>
          {t("beranda_pill_income")}: {hidden ? "••••" : formatRupiahShort(stats.income)}
        </div>
        <div className={styles.pill}>
          {t("beranda_pill_expense")}: {hidden ? "••••" : formatRupiahShort(stats.expense)}
        </div>
        <div className={styles.pillAccent}>
          {t("beranda_pill_remaining")}: {hidden ? "••••" : formatRupiahShort(saved)}
        </div>
      </div>
    </motion.div>
  );
}