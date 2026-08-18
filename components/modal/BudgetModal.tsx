"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { getBudget, saveBudget } from "@/lib/services/budget.service";
import { getProfile } from "@/lib/services/profile.service";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./BudgetModal.module.css";

export default function BudgetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const [values, setValues] = useState<Record<string, string>>({});
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [budget, profile] = await Promise.all([getBudget(), getProfile()]);
      if (cancelled) return;
      setIncome(profile?.income || 0);
      const initial: Record<string, string> = {};
      EXPENSE_CATEGORIES.forEach((c) => {
        initial[c.id] = budget[c.id] ? formatRupiah(budget[c.id]) : "";
      });
      setValues(initial);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const totalAllocated = useMemo(
    () => Object.values(values).reduce((sum, v) => sum + parseRupiah(v || "0"), 0),
    [values]
  );
  const remaining = income - totalAllocated;

  function handleChange(id: string, raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setValues((prev) => ({ ...prev, [id]: digits ? formatRupiah(parseInt(digits)) : "" }));
  }

  async function handleSave() {
    const budget: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      budget[c.id] = parseRupiah(values[c.id] || "0");
    });
    setSaving(true);
    await saveBudget(budget);
    setSaving(false);
    onClose();
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
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.title}>{t("budgetmodal_title")}</div>

            {loading ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
                {t("budgetmodal_loading")}
              </div>
            ) : (
              <>
                <div className={remaining < 0 ? styles.summaryBoxOver : styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>{t("budgetmodal_income")}</span>
                    <strong>{formatRupiah(income)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>{t("budgetmodal_allocated")}</span>
                    <strong>{formatRupiah(totalAllocated)}</strong>
                  </div>
                  <div className={styles.summaryRowMain}>
                    <span>{t("budgetmodal_remaining")}</span>
                    <strong>{formatRupiah(remaining)}</strong>
                  </div>
                </div>

                <div className={styles.list}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <div key={c.id} className={styles.row}>
                      <span className={styles.icon}>{c.icon}</span>
                      <span className={styles.name}>{getCategoryLabel(c, lang)}</span>
                      <input
                        className={styles.input}
                        value={values[c.id] || ""}
                        placeholder="Rp 0"
                        onChange={(e) => handleChange(c.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <button className={styles.saveBtn} onClick={handleSave} disabled={loading || saving}>
              {saving ? t("btn_saving") : t("budgetmodal_save_btn")}
            </button>
            <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              {t("btn_cancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}