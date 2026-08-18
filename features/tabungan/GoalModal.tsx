"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { saveGoal, deleteGoal } from "@/lib/services/goals.service";
import { SavingsGoal } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./GoalModal.module.css";

export default function GoalModal({
  open,
  onClose,
  onSaved,
  editGoal,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editGoal?: SavingsGoal | null;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amountText, setAmountText] = useState("");
  const [durationValue, setDurationValue] = useState("12");
  const [durationUnit, setDurationUnit] = useState<"bulan" | "tahun">("bulan");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editGoal) {
      setName(editGoal.name);
      setAmountText(formatRupiah(editGoal.targetAmount));
      if (editGoal.targetMonths >= 12 && editGoal.targetMonths % 12 === 0) {
        setDurationValue(String(editGoal.targetMonths / 12));
        setDurationUnit("tahun");
      } else {
        setDurationValue(String(editGoal.targetMonths));
        setDurationUnit("bulan");
      }
    } else {
      setName("");
      setAmountText("");
      setDurationValue("12");
      setDurationUnit("bulan");
    }
  }, [open, editGoal]);

  function handleAmountChange(v: string) {
    const raw = v.replace(/[^0-9]/g, "");
    setAmountText(raw ? formatRupiah(parseInt(raw)) : "");
  }

  async function handleSave() {
    const targetAmount = parseRupiah(amountText);
    const durationNum = parseInt(durationValue) || 0;
    if (!name.trim() || !targetAmount || !durationNum) return;

    const targetMonths = durationUnit === "tahun" ? durationNum * 12 : durationNum;

    const goal: SavingsGoal = {
      id: editGoal ? editGoal.id : crypto.randomUUID(),
      name: name.trim(),
      targetAmount,
      targetMonths,
      createdAt: editGoal ? editGoal.createdAt : new Date().toISOString(),
    };

    setSaving(true);
    await saveGoal(goal);
    setSaving(false);
    onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!editGoal) return;
    const message = t("goal_delete_confirm").replace("{name}", editGoal.name);
    if (!confirm(message)) return;
    setSaving(true);
    await deleteGoal(editGoal.id);
    setSaving(false);
    onSaved();
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
            <div className={styles.title}>{editGoal ? t("goal_modal_title_edit") : t("goal_modal_title_new")}</div>

            <div className={styles.field}>
              <label>{t("goal_name_label")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("goal_name_placeholder")} />
            </div>

            <div className={styles.field}>
              <label>{t("goal_amount_label")}</label>
              <input value={amountText} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Rp 5.000.000" />
            </div>

            <div className={styles.field}>
              <label>{t("goal_duration_label")}</label>
              <div className={styles.durationRow}>
                <input
                  type="number"
                  min={1}
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className={styles.durationInput}
                />
                <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as "bulan" | "tahun")}>
                  <option value="bulan">{t("goal_duration_unit_month")}</option>
                  <option value="tahun">{t("goal_duration_unit_year")}</option>
                </select>
              </div>
            </div>

            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? t("btn_saving") : t("goal_save_btn")}
            </button>
            {editGoal && (
              <button className={styles.deleteBtn} onClick={handleDelete} disabled={saving}>
                {t("btn_delete")}
              </button>
            )}
            <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              {t("btn_cancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}