"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import GrafikPeriodTabs, { Period } from "@/features/grafik/GrafikPeriodTabs";
import GrafikDonutCard from "@/features/grafik/GrafikDonutCard";
import GrafikSummaryCard from "@/features/grafik/GrafikSummaryCard";
import GrafikDailyChart from "@/features/grafik/GrafikDailyChart";
import GrafikBudgetChart from "@/features/grafik/GrafikBudgetChart";
import { getTransactions } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { calcStats } from "@/lib/business/stats";
import { monthKey, monthLabel } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import { Transaction, Budget } from "@/types/models";

const monthNameKeys: DictKey[] = [
  "month_1", "month_2", "month_3", "month_4", "month_5", "month_6",
  "month_7", "month_8", "month_9", "month_10", "month_11", "month_12",
];

export default function GrafikPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [period, setPeriod] = useState<Period>("bulan");
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  async function loadAll() {
    const [tx, bud] = await Promise.all([getTransactions(), getBudget()]);
    setTransactions(tx);
    setBudget(bud);
  }

  useEffect(() => {
    (async () => {
      await loadAll();
      setMounted(true);
    })();
  }, []);

  if (!mounted) {
    return (
      <>
        <Topbar titleKey="nav_grafik" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  const stats = calcStats(transactions, period, referenceDate);

  // Daftar bulan yang tersedia dari data transaksi, dijamin selalu ada bulan berjalan.
  const currentMonthKeyStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthKeySet = new Set(transactions.map((t) => monthKey(t.date)));
  monthKeySet.add(currentMonthKeyStr);
  const availableMonths = Array.from(monthKeySet)
    .sort()
    .reverse()
    .map((key) => ({ key, label: monthLabel(key) }));

  const selectedMonthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;

  function handleMonthChange(key: string) {
    const [year, month] = key.split("-").map(Number);
    setReferenceDate(new Date(year, month - 1, 1));
  }

  function shiftWeek(deltaDays: number) {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + deltaDays);
    setReferenceDate(next);
  }

  function handleDateChange(value: string) {
    if (!value) return;
    const [year, month, day] = value.split("-").map(Number);
    setReferenceDate(new Date(year, month - 1, day));
  }

  function weekRangeLabel(): string {
    const start = new Date(referenceDate);
    start.setDate(referenceDate.getDate() - referenceDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()} ${t(monthNameKeys[d.getMonth()])}`;
    return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
  }

  function dateInputValue(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p);
  }

  return (
    <>
      <Topbar titleKey="nav_grafik" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{t("grafik_page_title")}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <GrafikPeriodTabs period={period} onChange={handlePeriodChange} />

          {period === "bulan" && (
            <select
              value={selectedMonthKey}
              onChange={(e) => handleMonthChange(e.target.value)}
              style={navSelectStyle}
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          )}

          {period === "minggu" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => shiftWeek(-7)} style={navArrowStyle} title={t("grafik_nav_prev_week")}>
                ←
              </button>
              <span style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {weekRangeLabel()}
              </span>
              <button onClick={() => shiftWeek(7)} style={navArrowStyle} title={t("grafik_nav_next_week")}>
                →
              </button>
            </div>
          )}

          {period === "hari" && (
            <input
              type="date"
              value={dateInputValue(referenceDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              style={navSelectStyle}
            />
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
          <GrafikDonutCard stats={stats} />
          <GrafikSummaryCard stats={stats} />
          <GrafikDailyChart transactions={transactions} period={period} referenceDate={referenceDate} />
          <GrafikBudgetChart budget={budget} byCategory={stats.byCategory} />
        </div>
      </main>
    </>
  );
}

const navSelectStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--card)",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 12.5,
  fontFamily: "inherit",
  color: "var(--text)",
  cursor: "pointer",
};

const navArrowStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  border: "1px solid var(--border)",
  background: "var(--card)",
  borderRadius: 8,
  color: "var(--text2)",
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};