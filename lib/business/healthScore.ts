import { Transaction, Profile, Budget, SavingsGoal } from "@/types/models";
import { DictKey } from "@/lib/i18n/dictionary";

export type PillarKey = "savings" | "budget" | "emergency" | "stability" | "diversification";

export interface PillarMetric {
  labelKey: DictKey;
  value: string;
}

export interface PillarScore {
  key: PillarKey;
  score: number; // 0-100
  weight: number; // 0-1
  hasData: boolean;
  formulaKey: DictKey;
  metrics: PillarMetric[];
}

export interface HealthScoreResult {
  overall: number;
  label: "sehat" | "cukup" | "perhatian";
  pillars: PillarScore[];
  referenceDate: Date;
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

function fmtRp(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

/**
 * Untuk bulan yang sama dengan bulan sekarang beneran (real "now"), pakai waktu sekarang persis
 * (supaya transaksi hari ini ikut kehitung). Untuk bulan-bulan lain (lampau), pakai tanggal
 * terakhir bulan itu (supaya seluruh bulan lengkap ikut kehitung).
 */
export function effectiveMonthEndDate(year: number, monthIndex0: number): Date {
  const realNow = new Date();
  if (year === realNow.getFullYear() && monthIndex0 === realNow.getMonth()) return realNow;
  return new Date(year, monthIndex0 + 1, 0, 23, 59, 59);
}

function calcSavingsPillar(transactions: Transaction[], profile: Profile, ref: Date): PillarScore {
  const mk = refMonthKey(ref);
  const monthTx = transactions.filter((t) => monthKeyOf(t.date) === mk);
  const savedThisMonth = monthTx
    .filter((t) => t.type === "expense" && (t.cat === "tabungan" || t.cat === "danadrt"))
    .reduce((s, t) => s + t.amount, 0);
  const income = profile.income || 0;

  if (income <= 0) {
    return {
      key: "savings",
      score: 0,
      weight: WEIGHTS.savings,
      hasData: false,
      formulaKey: "formula_savings",
      metrics: [],
    };
  }

  const ratio = savedThisMonth / income;
  const score = Math.max(0, Math.min(100, Math.round((ratio / 0.2) * 100)));

  return {
    key: "savings",
    score,
    weight: WEIGHTS.savings,
    hasData: true,
    formulaKey: "formula_savings",
    metrics: [
      { labelKey: "metric_savings_income", value: fmtRp(income) },
      { labelKey: "metric_savings_saved", value: fmtRp(savedThisMonth) },
      { labelKey: "metric_savings_ratio", value: `${(ratio * 100).toFixed(1)}%` },
    ],
  };
}

function calcBudgetPillar(transactions: Transaction[], budget: Budget, ref: Date): PillarScore {
  const mk = refMonthKey(ref);
  const budgetedCats = Object.entries(budget).filter(([, amt]) => amt > 0);

  if (budgetedCats.length === 0) {
    return {
      key: "budget",
      score: 50,
      weight: WEIGHTS.budget,
      hasData: false,
      formulaKey: "formula_budget",
      metrics: [],
    };
  }

  const monthExpense = transactions.filter((t) => t.type === "expense" && monthKeyOf(t.date) === mk);
  const spentByCat: Record<string, number> = {};
  monthExpense.forEach((t) => {
    spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount;
  });

  const compliant = budgetedCats.filter(([cat, amt]) => (spentByCat[cat] || 0) <= amt).length;
  const score = Math.round((compliant / budgetedCats.length) * 100);

  return {
    key: "budget",
    score,
    weight: WEIGHTS.budget,
    hasData: true,
    formulaKey: "formula_budget",
    metrics: [
      { labelKey: "metric_budget_total_cats", value: String(budgetedCats.length) },
      { labelKey: "metric_budget_compliant_cats", value: String(compliant) },
    ],
  };
}

function calcEmergencyPillar(transactions: Transaction[], profile: Profile, ref: Date): PillarScore {
  const upToRef = transactions.filter((t) => new Date(t.date) <= ref);

  const target = (profile.income || 0) * 6;

  const depositedIn = upToRef
    .filter((t) => t.type === "expense" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);
  const withdrawnOut = upToRef
    .filter((t) => t.type === "income" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);
  const current = Math.max(0, (profile.emergencyFundCurrent || 0) + depositedIn - withdrawnOut);

  const score = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return {
    key: "emergency",
    score,
    weight: WEIGHTS.emergency,
    hasData: true,
    formulaKey: "formula_emergency_income",
    metrics: [
      { labelKey: "metric_emergency_current", value: fmtRp(current) },
      { labelKey: "metric_emergency_target", value: fmtRp(target) },
    ],
  };
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

  if (months.length < 2) {
    return {
      key: "stability",
      score: 50,
      weight: WEIGHTS.stability,
      hasData: false,
      formulaKey: "formula_stability",
      metrics: [],
    };
  }

  const values = months.map((m) => byMonth[m]);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;

  if (mean === 0) {
    return {
      key: "stability",
      score: 50,
      weight: WEIGHTS.stability,
      hasData: false,
      formulaKey: "formula_stability",
      metrics: [],
    };
  }

  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdev = Math.sqrt(variance);
  const cv = stdev / mean;
  const score = Math.max(0, Math.min(100, Math.round(100 - cv * 100)));

  return {
    key: "stability",
    score,
    weight: WEIGHTS.stability,
    hasData: true,
    formulaKey: "formula_stability",
    metrics: [
      { labelKey: "metric_stability_months", value: String(months.length) },
      { labelKey: "metric_stability_avg", value: fmtRp(mean) },
      { labelKey: "metric_stability_variation", value: `${(cv * 100).toFixed(1)}%` },
    ],
  };
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

  const totalPossible = 2 + goals.length;
  const score = Math.min(100, activeBuckets * 33);

  return {
    key: "diversification",
    score,
    weight: WEIGHTS.diversification,
    hasData: activeBuckets > 0,
    formulaKey: "formula_diversification",
    metrics: [
      { labelKey: "metric_diversification_active", value: `${activeBuckets} / ${totalPossible}` },
    ],
  };
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

  return { overall, label, pillars, referenceDate };
}

export function calcHealthScoreTrend(
  transactions: Transaction[],
  budget: Budget,
  profile: Profile,
  goals: SavingsGoal[],
  endReferenceDate: Date = new Date(),
  months = 6
): { monthKey: string; overall: number }[] {
  const result: { monthKey: string; overall: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = new Date(endReferenceDate.getFullYear(), endReferenceDate.getMonth() - i, 1);
    const effectiveRef = effectiveMonthEndDate(targetMonth.getFullYear(), targetMonth.getMonth());
    const r = calcHealthScore(transactions, budget, profile, goals, effectiveRef);
    result.push({ monthKey: refMonthKey(targetMonth), overall: r.overall });
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
  const stabilityPillar = currentScore.pillars.find((p) => p.key === "stability");
  const diversificationPillar = currentScore.pillars.find((p) => p.key === "diversification");

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
    { id: "stability_good", unlocked: (stabilityPillar?.score || 0) >= 80 && (stabilityPillar?.hasData ?? false) },
    { id: "all_buckets_active", unlocked: (diversificationPillar?.score || 0) === 100 },
  ];
}

export function weakestPillars(pillars: PillarScore[], count = 2): PillarScore[] {
  return pillars
    .filter((p) => p.hasData)
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

// ===== Perbandingan antar bulan (buat narasi otomatis) =====

export interface MonthComparison {
  hasPrevious: boolean;
  overallDelta: number;
  topImproved: { key: PillarKey; delta: number } | null;
  topDeclined: { key: PillarKey; delta: number } | null;
}

export function compareMonths(current: HealthScoreResult, previous: HealthScoreResult | null): MonthComparison {
  if (!previous) {
    return { hasPrevious: false, overallDelta: 0, topImproved: null, topDeclined: null };
  }

  const overallDelta = current.overall - previous.overall;

  const deltas = current.pillars
    .map((p) => {
      const prev = previous.pillars.find((pp) => pp.key === p.key);
      if (!prev || !p.hasData || !prev.hasData) return null;
      return { key: p.key, delta: p.score - prev.score };
    })
    .filter((d): d is { key: PillarKey; delta: number } => d !== null);

  const sorted = deltas.slice().sort((a, b) => b.delta - a.delta);
  const topImproved = sorted.length > 0 && sorted[0].delta > 0 ? sorted[0] : null;
  const topDeclined = sorted.length > 0 && sorted[sorted.length - 1].delta < 0 ? sorted[sorted.length - 1] : null;

  return { hasPrevious: true, overallDelta, topImproved, topDeclined };
}