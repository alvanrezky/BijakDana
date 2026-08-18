"use client";
import { Transaction, Budget } from "@/types/models";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BerandaRecentTx({
  transactions,
  budget,
  byCategory,
}: {
  transactions: Transaction[];
  budget: Budget;
  byCategory: Record<string, number>;
}) {
  const { t, lang } = useLanguage();
  const recent = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 48,
          color: "var(--text2)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {t("beranda_no_tx")}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {recent.map((tx, i) => {
        const cat = findCategory(tx.cat, tx.type);
        const catLabel = getCategoryLabel(cat, lang);
        const isIncome = tx.type === "income";
        const catBudget = budget[tx.cat] || 0;
        const catSpent = byCategory[tx.cat] || 0;
        const isOver = !isIncome && catBudget > 0 && catSpent > catBudget;

        return (
          <div
            key={tx.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: i === recent.length - 1 ? "none" : "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: cat.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {cat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: "var(--text)" }}>
                {tx.desc || catLabel}
              </div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3, lineHeight: 1.4 }}>
                {catLabel} · {tx.method} · {formatDate(tx.date)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isIncome ? "var(--green)" : "var(--red)" }}>
                {isIncome ? "+" : "-"}
                {formatRupiah(tx.amount)}
              </div>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginTop: 3,
                  fontWeight: 500,
                  background: isIncome ? "var(--green-lt)" : isOver ? "var(--red-lt)" : "var(--green-lt)",
                  color: isIncome ? "var(--green-d)" : isOver ? "var(--red)" : "var(--green-d)",
                }}
              >
                {isIncome ? t("beranda_badge_income") : isOver ? t("beranda_badge_over") : t("beranda_badge_ok")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}