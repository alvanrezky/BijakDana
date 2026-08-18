"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { Profile } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./IncomeModal.module.css";

export default function IncomeModal({
  open,
  onClose,
  onSaved,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
  profile: Profile;
}) {
  const { t } = useLanguage();
  const [incomeText, setIncomeText] = useState("");
  const [incomeType, setIncomeType] = useState("Gaji tetap");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIncomeText(profile.income ? formatRupiah(profile.income) : "");
    setIncomeType(profile.incomeType || "Gaji tetap");
  }, [open, profile]);

  function handleAmountChange(value: string) {
    const raw = value.replace(/[^0-9]/g, "");
    setIncomeText(raw ? formatRupiah(parseInt(raw)) : "");
  }

  async function handleSave() {
    const income = parseRupiah(incomeText);
    if (!income) return;
    setSaving(true);
    await onSaved({ ...profile, income, incomeType });
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
            <div className={styles.title}>{t("incomemodal_title")}</div>

            <div className={styles.field}>
              <label>{t("incomemodal_amount_label")}</label>
              <input value={incomeText} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Rp 5.000.000" />
            </div>

            <div className={styles.field}>
              <label>{t("incomemodal_source_label")}</label>
              <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)}>
                <option value="Gaji tetap">{t("incomemodal_source_fixed")}</option>
                <option value="Freelance">{t("incomemodal_source_freelance")}</option>
                <option value="Bisnis sendiri">{t("incomemodal_source_business")}</option>
                <option value="Campuran">{t("incomemodal_source_mixed")}</option>
              </select>
            </div>

            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? t("btn_saving") : t("incomemodal_save_btn")}
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