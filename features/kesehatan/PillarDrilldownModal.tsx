"use client";
import { motion, AnimatePresence } from "framer-motion";
import { PillarKey, PillarScore } from "@/lib/business/healthScore";
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

const COLOR_MAP: Record<PillarKey, string> = {
  savings: "#1D9E75",
  budget: "#3B82F6",
  emergency: "#8B5CF6",
  stability: "#F59E0B",
  diversification: "#EC4899",
};

export default function PillarDrilldownModal({
  pillar,
  referenceDate,
  onClose,
  transactions,
  budget,
}: {
  pillar: PillarScore | null;
  referenceDate: Date;
  onClose: () => void;
  transactions: Transaction[];
  budget: Budget;
}) {
  const { t, lang } = useLanguage();
  if (!pillar) return null;

  const color = COLOR_MAP[pillar.key];
  const contribution = Math.round(pillar.score * pillar.weight);

  const mk = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
  const monthTx = transactions.filter((tx) => tx.date.startsWith(mk));

  let extraDetail: React.ReactNode = null;

  if (pillar.key === "budget") {
    const spentByCat: Record<string, number> = {};
    monthTx.filter((tx) => tx.type === "expense").forEach((tx) => (spentByCat[tx.cat] = (spentByCat[tx.cat] || 0) + tx.amount));
    const rows = Object.entries(budget)
      .filter(([, amt]) => amt > 0)
      .map(([cat, amt]) => ({ cat, budgetAmt: amt, spent: spentByCat[cat] || 0 }));

    if (rows.length > 0) {
      extraDetail = (
        <div className={styles.detailList}>
          <div className={styles.detailTitle}>{t("drilldown_detail_title")}</div>
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
    }
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
          <div className={styles.header}>
            <div>
              <div className={styles.title}>{t(TITLE_KEYS[pillar.key])}</div>
              <div className={styles.sub}>{t("drilldown_sub_this_month")}</div>
            </div>
            <div className={styles.scoreCircle} style={{ borderColor: color, color }}>
              {pillar.hasData ? pillar.score : "-"}
            </div>
          </div>

          <div className={styles.contribBox}>
            <span>{t("drilldown_contribution_label")}</span>
            <strong style={{ color }}>
              {pillar.hasData ? `${contribution} / 100` : t("drilldown_no_data")}
            </strong>
          </div>

          {!pillar.hasData ? (
            <div className={styles.empty}>{t("drilldown_no_data_desc")}</div>
          ) : (
            <>
              <div className={styles.formulaBox}>
                <div className={styles.formulaLabel}>{t("drilldown_formula_label")}</div>
                <div className={styles.formulaText}>{t(pillar.formulaKey)}</div>
              </div>

              <div className={styles.metricsList}>
                {pillar.metrics.map((m) => (
                  <div key={m.labelKey} className={styles.metricRow}>
                    <span className={styles.metricLabel}>{t(m.labelKey)}</span>
                    <span className={styles.metricValue}>{m.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {extraDetail}

          <button className={styles.closeBtn} onClick={onClose}>
            {t("btn_close")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}