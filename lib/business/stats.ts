import { Transaction } from "@/types/models";
import { monthKey } from "@/lib/utils/format";

export type PeriodStats = {
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
};

export function calcStats(
  transactions: Transaction[],
  period: "hari" | "minggu" | "bulan",
  referenceDate: Date = new Date()
): PeriodStats {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    if (period === "hari") return d.toDateString() === referenceDate.toDateString();
    if (period === "minggu") {
      const start = new Date(referenceDate);
      start.setDate(referenceDate.getDate() - referenceDate.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return d >= start && d < end;
    }
    const refMonthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
    return monthKey(t.date) === refMonthKey;
  });

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCategory: Record<string, number> = {};
  filtered
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      byCategory[t.cat] = (byCategory[t.cat] || 0) + t.amount;
    });

  return { income, expense, balance: income - expense, byCategory };
}

export function findOverBudgetCategories(stats: PeriodStats, budget: Record<string, number>): string[] {
  return Object.entries(stats.byCategory)
    .filter(([cat, spent]) => budget[cat] > 0 && spent > budget[cat])
    .map(([cat]) => cat);
}