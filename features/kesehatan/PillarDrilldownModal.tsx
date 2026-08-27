"use client";
import { motion, AnimatePresence } from "framer-motion";
import { PillarKey } from "@/lib/business/healthScore";
import { Transaction, Budget } from "@/types/models";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./PillarDrilldownModal.module.css";

const TITLE_KEYS: Record<PillarKey, DictKey> = {
  savings: "pillar_savings",
  budget: "pillar_budget",
  emergency: "pillar_emergency",
  stability: "pillar_stability",
  diversification: "pillar_diversification",
};

export default function PillarDrilldownModal({
  pillarKey,
  onClose,
  transactions,
  budget,
}: {
  pillarKey: PillarKey | null;
  onClose: () => void;
  transactions: Transaction[];
  budget: Budget;
}) {
  const { t, lang } = useLanguage();
  if (!pillarKey) return null;

  const now = new Date();
  const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTx = transactions.filter((tx) => tx.date.startsWith(mk));

  let content: React.ReactNode = null;

  if (pillarKey === "budget") {
    const spentByCat: Record<string, number> = {};
    monthTx.filter((tx) => tx.type === "expense").forEach((tx) => (spentByCat[tx.cat] = (spentByCat[tx.cat] || 0) + tx.amount));
    const rows = Object.entries(budget)
      .filter(([, amt]) => amt > 0)
      .map(([cat, amt]) => ({ cat, budgetAmt: amt, spent: spentByCat[cat] || 0 }));

    content = (
      <div className={styles.detailList}>
        {rows.length === 0 && <div className={styles.empty}>{t("drilldown_budget_empty")}</div>}
        {rows.map((r) => {
          const c = findCategory(r.cat, "expense");
          const over = r.spent > r.budgetAmt;
          return (
            <div key={r.cat} className={styles.detailRow}>
              <span>{c.icon} {getCategoryLabel(c, lang)}</span>
              <span style={{ color: over ? "var(--red)" : "var(--green)", fontWeight: 700 }}>
                {formatRupiah(r.spent)} / {formatRupiah(r.budgetAmt)}
              </span>
            </div>
          );
        })}
      </div>
    );
  } else if (pillarKey === "savings") {
    const savedThisMonth = monthTx
      .filter((tx) => tx.type === "expense" && (tx.cat === "tabungan" || tx.cat === "danadrt"))
      .reduce((s, tx) => s + tx.amount, 0);
    const income = monthTx.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
    content = (
      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span>{t("drilldown_savings_income")}</span>
          <span style={{ fontWeight: 700 }}>{formatRupiah(income)}</span>
        </div>
        <div className={styles.detailRow}>
          <span>{t("drilldown_savings_saved")}</span>
          <span style={{ fontWeight: 700, color: "var(--green)" }}>{formatRupiah(savedThisMonth)}</span>
        </div>
      </div>
    );
  } else {
    content = <div className={styles.empty}>{t("drilldown_generic_hint")}</div>;
  }

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
          <div className={styles.title}>{t(TITLE_KEYS[pillarKey])}</div>
          <div className={styles.sub}>{t("drilldown_sub_this_month")}</div>
          {content}
          <button className={styles.closeBtn} onClick={onClose}>
            {t("btn_close")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}