"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryLabel, mergeWithCustom } from "@/lib/constants/categories";
import { getCustomCategories } from "@/lib/services/categories.service";
import { saveTransaction } from "@/lib/services/transactions.service";
import { parseRupiah, formatRupiah } from "@/lib/utils/format";
import { Transaction, TxType, Category } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./TransactionModal.module.css";

export default function TransactionModal({
  open,
  onClose,
  onSaved,
  editTx,
  presetCat,
  presetGoalId,
  presetGoalLabel,
  presetType,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editTx?: Transaction | null;
  presetCat?: string;
  presetGoalId?: string;
  presetGoalLabel?: string;
  presetType?: TxType;
}) {
  const { t, lang } = useLanguage();
  const [type, setType] = useState<TxType>("expense");
  const [cat, setCat] = useState("makan");
  const [amountText, setAmountText] = useState("");
  const [desc, setDesc] = useState("");
  const [method, setMethod] = useState("GoPay");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [customExpenseCats, setCustomExpenseCats] = useState<Category[]>([]);
  const [customIncomeCats, setCustomIncomeCats] = useState<Category[]>([]);

  const locked = !editTx && !!presetType;

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [ce, ci] = await Promise.all([getCustomCategories("expense"), getCustomCategories("income")]);
      setCustomExpenseCats(ce);
      setCustomIncomeCats(ci);
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editTx) {
      setType(editTx.type);
      setCat(editTx.cat);
      setAmountText(formatRupiah(editTx.amount));
      setDesc(editTx.desc);
      setMethod(editTx.method);
      setDate(editTx.date);
    } else {
      setType(presetType || "expense");
      setCat(presetGoalId ? "tabungan" : presetCat || "makan");
      setAmountText("");
      setDesc("");
      setMethod("GoPay");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, editTx, presetCat, presetGoalId, presetType]);

  const categories =
    type === "expense"
      ? mergeWithCustom(EXPENSE_CATEGORIES, customExpenseCats)
      : mergeWithCustom(INCOME_CATEGORIES, customIncomeCats);

  function handleAmountChange(value: string) {
    const raw = value.replace(/[^0-9]/g, "");
    setAmountText(raw ? formatRupiah(parseInt(raw)) : "");
  }

  async function handleSave() {
    const amount = parseRupiah(amountText);
    if (!amount || amount <= 0) return;

    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5);
    const nowIso = now.toISOString();

    const tx: Transaction = {
      id: editTx ? editTx.id : crypto.randomUUID(),
      type,
      cat,
      amount,
      desc: desc.trim(),
      method,
      date,
      time: editTx ? editTx.time : nowTime,
      note: editTx?.note || "",
      createdAt: editTx ? editTx.createdAt : nowIso,
      goalId: editTx ? editTx.goalId : presetGoalId || null,
    };

    setSaving(true);
    await saveTransaction(tx);
    setSaving(false);
    onSaved();
    onClose();
  }

  function getModalTitle(): string {
    if (editTx) return t("txmodal_title_edit");
    if (locked) {
      const targetLabel = presetGoalLabel
        ? presetGoalLabel
        : presetCat === "danadrt"
        ? t("jar_emergency_title")
        : t("jar_savings_title");
      const prefix = presetType === "income" ? t("txmodal_title_withdraw") : t("txmodal_title_transfer");
      return `${prefix} ${targetLabel}`;
    }
    return t("txmodal_title_new");
  }

  function getLockedIcon(): string {
    if (presetGoalId) return "🎯";
    if (presetCat === "danadrt") return "🛡️";
    return "🏦";
  }

  function getLockedLabel(): string {
    if (presetGoalLabel) return presetGoalLabel;
    if (presetCat === "danadrt") return t("jar_emergency_title");
    return t("jar_savings_title");
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
            <div className={styles.title}>{getModalTitle()}</div>

            {!locked && (
              <div className={styles.typeTabs}>
                <button
                  className={type === "expense" ? styles.typeActiveExpense : styles.typeBtn}
                  onClick={() => {
                    setType("expense");
                    if (!editTx) setCat("makan");
                  }}
                >
                  {t("txmodal_tab_expense")}
                </button>
                <button
                  className={type === "income" ? styles.typeActiveIncome : styles.typeBtn}
                  onClick={() => {
                    setType("income");
                    if (!editTx) setCat("gaji");
                  }}
                >
                  {t("txmodal_tab_income")}
                </button>
              </div>
            )}

            <div className={styles.field}>
              <label>{t("txmodal_amount_label")}</label>
              <input value={amountText} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Rp 0" />
            </div>

            {locked ? (
              <div className={styles.field}>
                <label>{t("txmodal_category_label")}</label>
                <div
                  style={{
                    border: `1.5px solid ${presetType === "income" ? "var(--red)" : "var(--green)"}`,
                    background: presetType === "income" ? "var(--red-lt)" : "var(--green-lt)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: presetType === "income" ? "var(--red)" : "var(--green-d)",
                    fontWeight: 600,
                  }}
                >
                  {getLockedIcon()} {getLockedLabel()}
                </div>
              </div>
            ) : (
              <div className={styles.field}>
                <label>{t("txmodal_category_label")}</label>
                <div className={styles.catGrid}>
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className={cat === c.id ? styles.catActive : styles.catItem}
                      onClick={() => setCat(c.id)}
                    >
                      {c.icon} {getCategoryLabel(c, lang)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label>{t("txmodal_desc_label")}</label>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("txmodal_desc_placeholder")} />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>{t("txmodal_method_label")}</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>GoPay</option>
                  <option>OVO</option>
                  <option>DANA</option>
                  <option>Transfer bank</option>
                  <option>Cash</option>
                  <option>Kartu debit</option>
                  <option>Kartu kredit</option>
                  <option>Tidak diketahui</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>{t("txmodal_date_label")}</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? t("btn_saving") : t("txmodal_save_btn")}
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