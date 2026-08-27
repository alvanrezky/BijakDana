import { Transaction, SavingsGoal } from "@/types/models";

export interface GoalProgress {
  current: number;
  pct: number;
  monthsElapsed: number;
  monthsRemaining: number;
  monthlyNeeded: number;
  achieved: boolean;
}

export function calcGoalProgress(goal: SavingsGoal, transactions: Transaction[]): GoalProgress {
  const depositedIn = transactions
    .filter((t) => t.type === "expense" && t.goalId === goal.id)
    .reduce((s, t) => s + t.amount, 0);
  const withdrawnOut = transactions
    .filter((t) => t.type === "income" && t.goalId === goal.id)
    .reduce((s, t) => s + t.amount, 0);

  const current = Math.max(0, depositedIn - withdrawnOut);

  const created = new Date(goal.createdAt);
  const now = new Date();
  const monthsElapsed = Math.max(
    0,
    (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
  );
  const monthsRemaining = Math.max(0, goal.targetMonths - monthsElapsed);
  const achieved = current >= goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - current);
  const monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((current / goal.targetAmount) * 100)) : 0;

  return { current, pct, monthsElapsed, monthsRemaining, monthlyNeeded, achieved };
}