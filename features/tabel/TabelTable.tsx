"use client";
import { Transaction, Budget } from "@/types/models";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./TabelTable.module.css";

export default function TabelTable({
  transactions,
  budget,
  byCategory,
  onEdit,
  onDelete,
  sortOrder,
}: {
  transactions: Transaction[];
  budget: Budget;
  byCategory: Record<string, number>;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  sortOrder: "newest" | "oldest";
}) {
  const { t, lang } = useLanguage();

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--text2)", background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)" }}>
        {t("tabel_no_tx")}
      </div>
    );
  }

  // Saldo berjalan HARUS dihitung kronologis (lama -> baru), terlepas dari urutan tampilan.
  const ascending = transactions.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = 0;
  const rows = ascending.map((tx) => {
    if (tx.type === "income") running += tx.amount;
    else running -= tx.amount;
    return { tx, balance: running };
  });

  const displayRows = sortOrder === "newest" ? rows.slice().reverse() : rows;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("tabel_th_date")}</th>
            <th>{t("tabel_th_desc")}</th>
            <th>{t("tabel_th_category")}</th>
            <th>{t("tabel_th_amount")}</th>
            <th>{t("tabel_th_method")}</th>
            <th>{t("tabel_th_status")}</th>
            <th>{t("tabel_th_balance")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map(({ tx, balance }) => {
            const isIncome = tx.type === "income";
            const cat = findCategory(tx.cat, tx.type);
            const catLabel = getCategoryLabel(cat, lang);
            const catSpent = byCategory[tx.cat] || 0;
            const catBudget = budget[tx.cat] || 0;
            const isOver = !isIncome && catBudget > 0 && catSpent > catBudget;

            return (
              <tr key={tx.id} className={isOver ? styles.overRow : ""}>
                <td>{formatDate(tx.date)}</td>
                <td>{tx.desc || catLabel}</td>
                <td>
                  <span className={styles.catBadge} style={{ background: cat.bg, color: cat.color }}>
                    {cat.icon} {catLabel}
                  </span>
                </td>
                <td className={isIncome ? styles.inc : styles.out}>
                  {isIncome ? "+" : "-"}
                  {formatRupiah(tx.amount)}
                </td>
                <td>{tx.method}</td>
                <td>
                  <span className={isOver ? styles.statusOver : styles.statusOk}>
                    {isOver ? t("tabel_status_over") : t("tabel_status_actual")}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: balance >= 0 ? "var(--green-d)" : "var(--red)" }}>
                  {formatRupiah(balance)}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className={styles.actionBtn} onClick={() => onEdit(tx)} title={t("btn_edit")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className={styles.actionBtnDel} onClick={() => onDelete(tx)} title={t("btn_delete")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}