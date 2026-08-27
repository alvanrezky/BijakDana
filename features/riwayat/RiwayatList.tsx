"use client";
import styles from "./RiwayatList.module.css";
import { Transaction, Budget } from "@/types/models";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";

const dayKeys: DictKey[] = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu", "day_fri", "day_sat"];
const monthKeys: DictKey[] = [
  "month_1", "month_2", "month_3", "month_4", "month_5", "month_6",
  "month_7", "month_8", "month_9", "month_10", "month_11", "month_12",
];

export default function RiwayatList({
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

  function dayStr(d: string) {
    const dt = new Date(d);
    return `${t(dayKeys[dt.getDay()])}, ${dt.getDate()} ${t(monthKeys[dt.getMonth()])} ${dt.getFullYear()}`;
  }

  function dateStr(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  if (transactions.length === 0) {
    return <div className={styles.emptyState}>{t("riwayat_empty")}</div>;
  }

  const sorted = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const groups: Record<string, Transaction[]> = {};
  sorted.forEach((t) => {
    (groups[t.date] = groups[t.date] || []).push(t);
  });

  const groupEntries = Object.entries(groups).sort((a, b) =>
    sortOrder === "newest" ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0])
  );

  return (
    <div>
      {groupEntries.map(([date, items]) => {
        const dayIncome = items.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
        const dayExpense = items.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
        const net = dayIncome - dayExpense;

        return (
          <div key={date} className={styles.group}>
            <div className={styles.hdate}>
              <span>{dayStr(date)}</span>
              <span style={{ color: net >= 0 ? "var(--green)" : "var(--red)" }}>
                {net >= 0 ? "+" : "-"}
                {formatRupiah(Math.abs(net))}
              </span>
            </div>
            {items.map((tx) => {
              const isIncome = tx.type === "income";
              const cat = findCategory(tx.cat, tx.type);
              const catLabel = getCategoryLabel(cat, lang);
              const catBudget = budget[tx.cat] || 0;
              const catSpent = byCategory[tx.cat] || 0;
              const isOver = !isIncome && catBudget > 0 && catSpent > catBudget;

              return (
                <div key={tx.id} className={styles.txitem}>
                  <div className={styles.txico} style={{ background: cat.bg }}>
                    {cat.icon}
                  </div>
                  <div className={styles.txb}>
                    <div className={styles.txn}>{tx.desc || catLabel}</div>
                    <div className={styles.txm}>
                      {catLabel} · {tx.method} · {dateStr(tx.date)}
                    </div>
                  </div>
                  <div className={styles.txr}>
                    <div className={isIncome ? styles.txaInc : styles.txaOut}>
                      {isIncome ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </div>
                    {isIncome ? (
                      <span className={styles.badgeInc}>{t("riwayat_badge_income")}</span>
                    ) : isOver ? (
                      <span className={styles.badgeOver}>{t("riwayat_badge_over")}</span>
                    ) : (
                      <span className={styles.badgeOk}>{t("riwayat_badge_ok")}</span>
                    )}
                  </div>
                  <div className={styles.txactions}>
                    <button className={styles.txact} onClick={() => onEdit(tx)} title={t("btn_edit")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className={styles.txactDel} onClick={() => onDelete(tx)} title={t("btn_delete")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}