"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Transaction } from "@/types/models";
import { getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./BudgetPocketDetailModal.module.css";

export default function BudgetPocketDetailModal({
  category,
  spent,
  budgetAmt,
  transactions,
  onClose,
}: {
  category: Category | null;
  spent: number;
  budgetAmt: number;
  transactions: Transaction[];
  onClose: () => void;
}) {
  const { t, lang } = useLanguage();
  if (!category) return null;

  const pct = Math.min(100, Math.round((spent / budgetAmt) * 100));
  const over = spent > budgetAmt;
  const remaining = budgetAmt - spent;

  const sortedTx = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AnimatePresence>
      <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.icon} style={{ background: category.bg }}>{category.icon}</div>
            <div>
              <div className={styles.title}>{getCategoryLabel(category, lang)}</div>
              <div className={styles.sub}>{t("pocket_modal_sub")}</div>
            </div>
          </div>

          <div className={styles.pctBig} style={{ color: over ? "var(--red)" : "var(--green)" }}>{pct}%</div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${pct}%`, background: over ? "var(--red)" : category.color }} />
          </div>

          <div className={styles.amountsRow}>
            <span>{t("pocket_modal_spent")} <strong>{formatRupiah(spent)}</strong></span>
            <span>{t("pocket_modal_budget")} <strong>{formatRupiah(budgetAmt)}</strong></span>
          </div>

          <div className={over ? styles.noteOver : styles.note}>
            {over
              ? `${t("pocket_modal_over_prefix")} ${formatRupiah(Math.abs(remaining))}`
              : `${t("pocket_modal_remaining_prefix")} ${formatRupiah(remaining)} ${t("pocket_modal_remaining_suffix")}`}
          </div>

          <div className={styles.historyTitle}>{t("pocket_modal_history_title")}</div>
          <div className={styles.historyList}>
            {sortedTx.length === 0 ? (
              <div className={styles.historyEmpty}>{t("pocket_modal_history_empty")}</div>
            ) : (
              sortedTx.map((tx) => (
                <div key={tx.id} className={styles.historyRow}>
                  <span>{formatDate(tx.date)}</span>
                  <span className={styles.historyAmount}>{formatRupiah(tx.amount)}</span>
                </div>
              ))
            )}
          </div>

          <button className={styles.closeBtn} onClick={onClose}>{t("btn_close")}</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}