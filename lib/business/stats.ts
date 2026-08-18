import { Transaction } from "@/types/models";
import { monthKey, currentMonthKey } from "@/lib/utils/format";

export type PeriodStats = {
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
};

export function calcStats(transactions: Transaction[], period: "hari" | "minggu" | "bulan"): PeriodStats {
  const now = new Date();

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    if (period === "hari") return d.toDateString() === now.toDateString();
    if (period === "minggu") {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      return d >= start;
    }
    return monthKey(t.date) === currentMonthKey();
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