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
import { Transaction, Budget } from "@/types/models";

export default function GrafikPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [period, setPeriod] = useState<Period>("bulan");

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

  const stats = calcStats(transactions, period);

  return (
    <>
      <Topbar titleKey="nav_grafik" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Grafik & Analisis</div>

        <GrafikPeriodTabs period={period} onChange={setPeriod} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
          <GrafikDonutCard stats={stats} />
          <GrafikSummaryCard stats={stats} />
          <GrafikDailyChart transactions={transactions} period={period} />
          <GrafikBudgetChart budget={budget} byCategory={stats.byCategory} />
        </div>
      </main>
    </>
  );
}