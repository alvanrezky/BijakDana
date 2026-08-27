"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { Profile } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./SavingsInitialModal.module.css";

export default function SavingsInitialModal({
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
  const [amountText, setAmountText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmountText(profile.savingsInitial ? formatRupiah(profile.savingsInitial) : "");
  }, [open, profile]);

  function handleAmountChange(value: string) {
    const raw = value.replace(/[^0-9]/g, "");
    setAmountText(raw ? formatRupiah(parseInt(raw)) : "");
  }

  async function handleSave() {
    const amount = parseRupiah(amountText) || 0;
    setSaving(true);
    await onSaved({ ...profile, savingsInitial: amount });
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
            <div className={styles.title}>{t("savings_initial_modal_title")}</div>
            <div className={styles.sub}>{t("savings_initial_modal_sub")}</div>

            <div className={styles.field}>
              <label>{t("savings_initial_amount_label")}</label>
              <input value={amountText} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Rp 0" />
            </div>

            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? t("btn_saving") : t("btn_save")}
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