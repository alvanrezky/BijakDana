import { Budget } from "@/types/models";

export type PocketStrategyResult =
  | { type: "reduce"; cat: string; over: number; spent: number; budgetAmt: number }
  | { type: "watch"; cat: string; pct: number; spent: number; budgetAmt: number }
  | { type: "good" };

export function getPocketStrategy(budget: Budget, byCategory: Record<string, number>): PocketStrategyResult {
  const entries = Object.entries(budget).filter(([, amt]) => amt > 0);
  if (entries.length === 0) return { type: "good" };

  const overBudget = entries
    .map(([cat, amt]) => ({ cat, budgetAmt: amt, spent: byCategory[cat] || 0, over: (byCategory[cat] || 0) - amt }))
    .filter((e) => e.over > 0)
    .sort((a, b) => b.over - a.over);

  if (overBudget.length > 0) {
    const top = overBudget[0];
    return { type: "reduce", cat: top.cat, over: top.over, spent: top.spent, budgetAmt: top.budgetAmt };
  }

  const nearLimit = entries
    .map(([cat, amt]) => ({ cat, budgetAmt: amt, spent: byCategory[cat] || 0, pct: Math.round(((byCategory[cat] || 0) / amt) * 100) }))
    .filter((e) => e.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  if (nearLimit.length > 0) {
    const top = nearLimit[0];
    return { type: "watch", cat: top.cat, pct: top.pct, spent: top.spent, budgetAmt: top.budgetAmt };
  }

  return { type: "good" };
}