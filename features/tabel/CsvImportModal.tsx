"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, mergeWithCustom } from "@/lib/constants/categories";
import { getCustomCategories } from "@/lib/services/categories.service";
import { saveTransaction } from "@/lib/services/transactions.service";
import { parseRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction } from "@/types/models";
import styles from "./CsvImportModal.module.css";

type CsvRow = Record<string, string>;
type FieldKey = "date" | "desc" | "cat" | "amount" | "type" | "method";

const FIELD_LABELS: Record<FieldKey, string> = {
  date: "Tanggal",
  desc: "Deskripsi",
  cat: "Kategori",
  amount: "Nominal",
  type: "Tipe (income/expense)",
  method: "Metode",
};

export default function CsvImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"upload" | "map" | "importing" | "done">("upload");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    date: "", desc: "", cat: "", amount: "", type: "", method: "",
  });
  const [importedCount, setImportedCount] = useState(0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setHeaders(result.meta.fields || []);
        setStep("map");
      },
    });
  }

  async function handleImport() {
    setStep("importing");
    const [customExpense, customIncome] = await Promise.all([
      getCustomCategories("expense"),
      getCustomCategories("income"),
    ]);
    const allExpenseCats = mergeWithCustom(EXPENSE_CATEGORIES, customExpense);
    const allIncomeCats = mergeWithCustom(INCOME_CATEGORIES, customIncome);

    let count = 0;
    for (const row of rows) {
      const rawType = mapping.type ? row[mapping.type]?.toLowerCase().trim() : "expense";
      const type: "income" | "expense" = rawType === "income" || rawType === "pemasukan" ? "income" : "expense";

      const amount = mapping.amount ? parseRupiah(row[mapping.amount] || "0") || Number(row[mapping.amount]) || 0 : 0;
      if (!amount || amount <= 0) continue;

      const rawCat = mapping.cat ? row[mapping.cat]?.trim().toLowerCase() : "";
      const catList = type === "expense" ? allExpenseCats : allIncomeCats;
      const matched = catList.find((c) => c.label.toLowerCase() === rawCat || c.id.toLowerCase() === rawCat);
      const cat = matched ? matched.id : type === "expense" ? "lain" : "lain-in";

      const rawDate = mapping.date ? row[mapping.date] : "";
      const date = normalizeDate(rawDate) || new Date().toISOString().split("T")[0];

      const method = mapping.method && row[mapping.method]?.trim() ? row[mapping.method].trim() : "Tidak diketahui";
      const desc = mapping.desc ? row[mapping.desc] || "" : "";

      const now = new Date();
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type,
        cat,
        amount,
        desc,
        method,
        date,
        time: now.toTimeString().slice(0, 5),
        note: "",
        createdAt: now.toISOString(),
      };

      await saveTransaction(tx);
      count++;
    }

    setImportedCount(count);
    setStep("done");
  }

  function handleClose() {
    setStep("upload");
    setRows([]);
    setHeaders([]);
    setMapping({ date: "", desc: "", cat: "", amount: "", type: "", method: "" });
    setImportedCount(0);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose}>
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.title}>{t("csv_import_title")}</div>

            {step === "upload" && (
              <>
                <div className={styles.sub}>{t("csv_import_sub")}</div>
                <label className={styles.dropzone}>
                  <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
                  📄 {t("csv_import_choose_file")}
                </label>
              </>
            )}

            {step === "map" && (
              <>
                <div className={styles.sub}>{t("csv_import_map_sub")}</div>
                <div className={styles.mapHint}>{t("csv_import_fallback_hint")}</div>
                <div className={styles.mapList}>
                  {(Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => (
                    <div key={key} className={styles.mapRow}>
                      <span className={styles.mapLabel}>{FIELD_LABELS[key]}</span>
                      <select
                        value={mapping[key]}
                        onChange={(e) => setMapping((prev) => ({ ...prev, [key]: e.target.value }))}
                      >
                        <option value="">-</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className={styles.previewNote}>{rows.length} {t("csv_import_rows_detected")}</div>
                <button className={styles.saveBtn} onClick={handleImport} disabled={!mapping.amount}>
                  {t("csv_import_start_btn")}
                </button>
              </>
            )}

            {step === "importing" && (
              <div className={styles.loadingBox}>{t("csv_import_loading")}</div>
            )}

            {step === "done" && (
              <div className={styles.doneBox}>
                <div className={styles.doneIcon}>✅</div>
                <div className={styles.doneText}>
                  {importedCount} {t("csv_import_done_suffix")}
                </div>
              </div>
            )}

            <button className={styles.cancelBtn} onClick={handleClose}>
              {step === "done" ? t("btn_close") : t("btn_cancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function normalizeDate(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[\/\-]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
  return null;
}