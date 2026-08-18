"use client";
import { PeriodStats } from "@/lib/business/stats";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrafikSummaryCard({ stats }: { stats: PeriodStats }) {
  const { t } = useLanguage();
  const pct = stats.income ? Math.round((stats.expense / stats.income) * 100) : 0;
  const barColor = pct > 80 ? "var(--red)" : pct > 60 ? "#f59e0b" : "var(--green)";

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "var(--text)" }}>{t("grafik_summary_title")}</div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("grafik_summary_sub")}</div>

      <Row label={t("grafik_summary_income")} value={formatRupiah(stats.income)} color="var(--green)" />
      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
      <Row label={t("grafik_summary_expense")} value={formatRupiah(stats.expense)} color="var(--red)" />
      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
      <Row label={t("grafik_summary_balance")} value={formatRupiah(stats.balance)} color={stats.balance >= 0 ? "var(--text)" : "var(--red)"} />
      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
      <Row label={t("grafik_summary_ratio")} value={pct + "%"} color={barColor} />

      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text2)", marginBottom: 5 }}>
          <span>{t("grafik_summary_from_income")}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "var(--border)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: barColor, borderRadius: 20, transition: "width 0.8s ease" }} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}