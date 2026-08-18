"use client";
import { PeriodStats } from "@/lib/business/stats";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TabelStatsRow({ stats, filteredCount }: { stats: PeriodStats; filteredCount: number }) {
  const { t } = useLanguage();
  const items = [
    { label: t("tabel_stat_income"), value: formatRupiah(stats.income), color: "var(--green)" },
    { label: t("tabel_stat_expense"), value: formatRupiah(stats.expense), color: "var(--red)" },
    {
      label: t("tabel_stat_balance"),
      value: formatRupiah(stats.balance),
      color: stats.balance >= 0 ? "var(--text)" : "var(--red)",
    },
    { label: t("tabel_stat_count"), value: String(filteredCount), color: "var(--text)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 3 }}>{item.label}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}