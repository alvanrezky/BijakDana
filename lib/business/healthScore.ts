import { Transaction, Profile, Budget, SavingsGoal } from "@/types/models";

export type PillarKey = "savings" | "budget" | "emergency" | "stability" | "diversification";

export interface PillarScore {
  key: PillarKey;
  score: number; // 0-100
  weight: number; // 0-1
  hasData: boolean;
}

export interface HealthScoreResult {
  overall: number;
  label: "sehat" | "cukup" | "perhatian";
  pillars: PillarScore[];
}

const WEIGHTS: Record<PillarKey, number> = {
  savings: 0.25,
  budget: 0.2,
  emergency: 0.25,
  stability: 0.15,
  diversification: 0.15,
};

function monthKeyOf(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function refMonthKey(ref: Date): string {
  return `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
}

function calcSavingsPillar(transactions: Transaction[], profile: Profile, ref: Date): PillarScore {
  const mk = refMonthKey(ref);
  const monthTx = transactions.filter((t) => monthKeyOf(t.date) === mk);
  const savedThisMonth = monthTx
    .filter((t) => t.type === "expense" && (t.cat === "tabungan" || t.cat === "danadrt"))
    .reduce((s, t) => s + t.amount, 0);
  const income = profile.income || 0;

  if (income <= 0) return { key: "savings", score: 0, weight: WEIGHTS.savings, hasData: false };

  const ratio = savedThisMonth / income;
  const score = Math.max(0, Math.min(100, Math.round((ratio / 0.2) * 100)));
  return { key: "savings", score, weight: WEIGHTS.savings, hasData: true };
}

function calcBudgetPillar(transactions: Transaction[], budget: Budget, ref: Date): PillarScore {
  const mk = refMonthKey(ref);
  const budgetedCats = Object.entries(budget).filter(([, amt]) => amt > 0);
  if (budgetedCats.length === 0) return { key: "budget", score: 50, weight: WEIGHTS.budget, hasData: false };

  const monthExpense = transactions.filter((t) => t.type === "expense" && monthKeyOf(t.date) === mk);
  const spentByCat: Record<string, number> = {};
  monthExpense.forEach((t) => {
    spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount;
  });

  const compliant = budgetedCats.filter(([cat, amt]) => (spentByCat[cat] || 0) <= amt).length;
  const score = Math.round((compliant / budgetedCats.length) * 100);
  return { key: "budget", score, weight: WEIGHTS.budget, hasData: true };
}

function calcEmergencyPillar(transactions: Transaction[], profile: Profile, ref: Date): PillarScore {
  const upToRef = transactions.filter((t) => new Date(t.date) <= ref);
  const expenseTx = upToRef.filter((t) => t.type === "expense");
  const dates = expenseTx.map((t) => new Date(t.date).getTime());
  const firstTxDate = dates.length ? new Date(Math.min(...dates)) : null;

  let monthsOfHistory = 0;
  if (firstTxDate) {
    monthsOfHistory = (ref.getFullYear() - firstTxDate.getFullYear()) * 12 + (ref.getMonth() - firstTxDate.getMonth());
  }

  let target: number;
  if (monthsOfHistory < 3) {
    target = (profile.income || 0) * 6;
  } else {
    const relevant = expenseTx.filter((t) => t.cat !== "danadrt" && t.cat !== "tabungan");
    const byMonth: Record<string, number> = {};
    relevant.forEach((t) => {
      const key = monthKeyOf(t.date);
      byMonth[key] = (byMonth[key] || 0) + t.amount;
    });
    const months = Object.keys(byMonth).sort().slice(-6);
    const avg = months.length ? months.reduce((s, m) => s + byMonth[m], 0) / months.length : 0;
    target = avg * 6;
  }

  const depositedIn = upToRef
    .filter((t) => t.type === "expense" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);
  const withdrawnOut = upToRef
    .filter((t) => t.type === "income" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);
  const current = Math.max(0, (profile.emergencyFundCurrent || 0) + depositedIn - withdrawnOut);

  const score = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return { key: "emergency", score, weight: WEIGHTS.emergency, hasData: true };
}

function calcStabilityPillar(transactions: Transaction[], ref: Date): PillarScore {
  const upToRef = transactions.filter((t) => new Date(t.date) <= ref);
  const relevant = upToRef.filter((t) => t.type === "expense" && t.cat !== "danadrt" && t.cat !== "tabungan");
  const byMonth: Record<string, number> = {};
  relevant.forEach((t) => {
    const key = monthKeyOf(t.date);
    byMonth[key] = (byMonth[key] || 0) + t.amount;
  });
  const months = Object.keys(byMonth).sort().slice(-6);

  if (months.length < 2) return { key: "stability", score: 50, weight: WEIGHTS.stability, hasData: false };

  const values = months.map((m) => byMonth[m]);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean === 0) return { key: "stability", score: 50, weight: WEIGHTS.stability, hasData: false };

  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdev = Math.sqrt(variance);
  const cv = stdev / mean;
  const score = Math.max(0, Math.min(100, Math.round(100 - cv * 100)));
  return { key: "stability", score, weight: WEIGHTS.stability, hasData: true };
}

function calcDiversificationPillar(
  transactions: Transaction[],
  profile: Profile,
  goals: SavingsGoal[],
  ref: Date
): PillarScore {
  const upToRef = transactions.filter((t) => new Date(t.date) <= ref);

  const efIn = upToRef.filter((t) => t.type === "expense" && t.cat === "danadrt").reduce((s, t) => s + t.amount, 0);
  const efOut = upToRef.filter((t) => t.type === "income" && t.cat === "danadrt").reduce((s, t) => s + t.amount, 0);
  const efBalance = (profile.emergencyFundCurrent || 0) + efIn - efOut;

  const savIn = upToRef
    .filter((t) => t.type === "expense" && t.cat === "tabungan" && !t.goalId)
    .reduce((s, t) => s + t.amount, 0);
  const savOut = upToRef
    .filter((t) => t.type === "income" && t.cat === "tabungan" && !t.goalId)
    .reduce((s, t) => s + t.amount, 0);
  const savBalance = (profile.savingsInitial || 0) + savIn - savOut;

  let activeBuckets = 0;
  if (efBalance > 0) activeBuckets++;
  if (savBalance > 0) activeBuckets++;
  goals.forEach((g) => {
    const gIn = upToRef.filter((t) => t.type === "expense" && t.goalId === g.id).reduce((s, t) => s + t.amount, 0);
    const gOut = upToRef.filter((t) => t.type === "income" && t.goalId === g.id).reduce((s, t) => s + t.amount, 0);
    if (gIn - gOut > 0) activeBuckets++;
  });

  const score = Math.min(100, activeBuckets * 33);
  return { key: "diversification", score, weight: WEIGHTS.diversification, hasData: activeBuckets > 0 };
}

export function calcHealthScore(
  transactions: Transaction[],
  budget: Budget,
  profile: Profile,
  goals: SavingsGoal[],
  referenceDate: Date = new Date()
): HealthScoreResult {
  const pillars: PillarScore[] = [
    calcSavingsPillar(transactions, profile, referenceDate),
    calcBudgetPillar(transactions, budget, referenceDate),
    calcEmergencyPillar(transactions, profile, referenceDate),
    calcStabilityPillar(transactions, referenceDate),
    calcDiversificationPillar(transactions, profile, goals, referenceDate),
  ];

  const overall = Math.round(pillars.reduce((s, p) => s + p.score * p.weight, 0));
  const label = overall >= 75 ? "sehat" : overall >= 50 ? "cukup" : "perhatian";

  return { overall, label, pillars };
}

export function calcHealthScoreTrend(
  transactions: Transaction[],
  budget: Budget,
  profile: Profile,
  goals: SavingsGoal[],
  months = 6
): { monthKey: string; overall: number }[] {
  const now = new Date();
  const result: { monthKey: string; overall: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const lastDayOfMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const effectiveRef = i === 0 ? now : lastDayOfMonth;
    const r = calcHealthScore(transactions, budget, profile, goals, effectiveRef);
    result.push({ monthKey: refMonthKey(ref), overall: r.overall });
  }

  return result;
}

export interface Achievement {
  id: string;
  unlocked: boolean;
}

export function calcAchievements(
  transactions: Transaction[],
  profile: Profile,
  goals: SavingsGoal[],
  currentScore: HealthScoreResult
): Achievement[] {
  const emergencyPillar = currentScore.pillars.find((p) => p.key === "emergency");
  const budgetPillar = currentScore.pillars.find((p) => p.key === "budget");
  const anyGoalAchieved = goals.some((g) => {
    const gIn = transactions.filter((t) => t.type === "expense" && t.goalId === g.id).reduce((s, t) => s + t.amount, 0);
    const gOut = transactions.filter((t) => t.type === "income" && t.goalId === g.id).reduce((s, t) => s + t.amount, 0);
    return gIn - gOut >= g.targetAmount;
  });

  return [
    { id: "score_sehat", unlocked: currentScore.label === "sehat" },
    { id: "ef_50", unlocked: (emergencyPillar?.score || 0) >= 50 },
    { id: "ef_100", unlocked: (emergencyPillar?.score || 0) >= 100 },
    { id: "budget_full", unlocked: (budgetPillar?.score || 0) === 100 && (budgetPillar?.hasData ?? false) },
    { id: "goal_achieved", unlocked: anyGoalAchieved },
    { id: "first_goal", unlocked: goals.length > 0 },
  ];
}

export function weakestPillars(pillars: PillarScore[], count = 2): PillarScore[] {
  return pillars
    .filter((p) => p.hasData)
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}