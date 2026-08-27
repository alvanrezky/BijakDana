import { Transaction, Profile } from "@/types/models";
import { monthKey } from "@/lib/utils/format";
import { INSTRUMENTS, Instrument, InstrumentId } from "@/lib/constants/instruments";
import { DictKey } from "@/lib/i18n/dictionary";

const EXCLUDED_FROM_EXPENSE_AVG = ["danadrt", "tabungan"];

export interface EmergencyFundResult {
  target: number;
  current: number;
  pct: number;
  basis: "income" | "expense";
  monthlySavingNeeded: number;
  monthsToTarget: number | null;
}

export function calcEmergencyFund(transactions: Transaction[], profile: Profile): EmergencyFundResult {
  const expenseTx = transactions.filter((t) => t.type === "expense");
  const dates = expenseTx.map((t) => new Date(t.date).getTime());
  const firstTxDate = dates.length ? new Date(Math.min(...dates)) : null;

  let monthsOfHistory = 0;
  if (firstTxDate) {
    const now = new Date();
    monthsOfHistory =
      (now.getFullYear() - firstTxDate.getFullYear()) * 12 + (now.getMonth() - firstTxDate.getMonth());
  }

  let target: number;
  let basis: "income" | "expense";

  if (monthsOfHistory < 3) {
    basis = "income";
    target = (profile.income || 0) * 6;
  } else {
    basis = "expense";
    const relevant = expenseTx.filter((t) => !EXCLUDED_FROM_EXPENSE_AVG.includes(t.cat));
    const byMonth: Record<string, number> = {};
    relevant.forEach((t) => {
      const key = monthKey(t.date);
      byMonth[key] = (byMonth[key] || 0) + t.amount;
    });
    const months = Object.keys(byMonth).slice(-6);
    const avg = months.length ? months.reduce((s, m) => s + byMonth[m], 0) / months.length : 0;
    target = avg * 6;
  }

  // Deposit (Transfer): transaksi expense dengan cat "danadrt" -> nambah saldo dana darurat.
  // Withdraw (Gunakan): transaksi income dengan cat "danadrt" -> ngurangin saldo dana darurat.
  const depositedIn = transactions
    .filter((t) => t.type === "expense" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);
  const withdrawnOut = transactions
    .filter((t) => t.type === "income" && t.cat === "danadrt")
    .reduce((s, t) => s + t.amount, 0);

  const current = Math.max(0, (profile.emergencyFundCurrent || 0) + depositedIn - withdrawnOut);

  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const remaining = Math.max(0, target - current);
  const monthlySavingNeeded = remaining / 12;
  const monthsToTarget =
    current >= target ? 0 : monthlySavingNeeded > 0 ? Math.ceil(remaining / monthlySavingNeeded) : null;

  return { target, current, pct, basis, monthlySavingNeeded, monthsToTarget };
}

/**
 * Tabungan Biasa TIDAK punya target — ini cuma saldo berjalan.
 * Naik kalau ada "Transfer" (expense, cat=tabungan, tanpa goalId).
 * Turun kalau ada "Gunakan" (income, cat=tabungan, tanpa goalId).
 */
export function calcRegularSavingsBalance(transactions: Transaction[], profile: Profile): number {
  const depositedIn = transactions
    .filter((t) => t.type === "expense" && t.cat === "tabungan" && !t.goalId)
    .reduce((s, t) => s + t.amount, 0);
  const withdrawnOut = transactions
    .filter((t) => t.type === "income" && t.cat === "tabungan" && !t.goalId)
    .reduce((s, t) => s + t.amount, 0);

  return Math.max(0, (profile.savingsInitial || 0) + depositedIn - withdrawnOut);
}

export interface InstrumentProjectionPoint {
  years: number;
  values: Record<string, number>;
}

export function calcInstrumentProjections(
  monthlyAmount: number,
  horizons: number[] = [1, 3, 5, 10, 15]
): InstrumentProjectionPoint[] {
  return horizons.map((years) => {
    const values: Record<string, number> = {};
    INSTRUMENTS.forEach((inst) => {
      values[inst.id] = projectInstrument(inst, monthlyAmount, years);
    });
    return { years, values };
  });
}

function projectInstrument(inst: Instrument, monthlyAmount: number, years: number): number {
  const months = years * 12;
  const monthlyRate = inst.annualReturn / 12;
  const monthlyFeePct = (inst.annualFeePct || 0) / 12;
  let balance = 0;

  for (let i = 0; i < months; i++) {
    balance += monthlyAmount;
    const grossInterest = balance * monthlyRate;
    const interestAfterTax = inst.taxOnGainPct ? grossInterest * (1 - inst.taxOnGainPct) : grossInterest;
    balance += interestAfterTax;
    if (monthlyFeePct) balance -= balance * monthlyFeePct;
    if (inst.monthlyFeeFlat) balance = Math.max(0, balance - inst.monthlyFeeFlat);
  }

  return Math.round(balance);
}

// ===== Rekomendasi instrumen =====

export type RecLevel = "waspada" | "seimbang_ef" | "seimbang_savings" | "bertumbuh";

export interface InstrumentRecommendation {
  level: RecLevel;
  efPct: number;
  savingsPct: number;
  recommend: { id: InstrumentId; reasonKey: DictKey }[];
  avoid: { id: InstrumentId; reasonKey: DictKey }[];
}

export function getInstrumentRecommendation(
  emergencyFund: EmergencyFundResult,
  savingsPct: number
): InstrumentRecommendation {
  if (emergencyFund.pct < 50) {
    return {
      level: "waspada",
      efPct: emergencyFund.pct,
      savingsPct,
      recommend: [
        { id: "tabungan", reasonKey: "rec_waspada_recommend_tabungan" },
        { id: "reksadana", reasonKey: "rec_waspada_recommend_reksadana" },
      ],
      avoid: [
        { id: "saham", reasonKey: "rec_waspada_avoid_saham" },
        { id: "etf", reasonKey: "rec_waspada_avoid_etf" },
      ],
    };
  }
  if (emergencyFund.pct < 100) {
    return {
      level: "seimbang_ef",
      efPct: emergencyFund.pct,
      savingsPct,
      recommend: [
        { id: "deposito", reasonKey: "rec_seimbang_ef_recommend_deposito" },
        { id: "reksadana", reasonKey: "rec_seimbang_ef_recommend_reksadana" },
        { id: "emas", reasonKey: "rec_seimbang_ef_recommend_emas" },
      ],
      avoid: [{ id: "saham", reasonKey: "rec_seimbang_ef_avoid_saham" }],
    };
  }
  if (savingsPct < 50) {
    return {
      level: "seimbang_savings",
      efPct: emergencyFund.pct,
      savingsPct,
      recommend: [
        { id: "reksadana", reasonKey: "rec_seimbang_savings_recommend_reksadana" },
        { id: "deposito", reasonKey: "rec_seimbang_savings_recommend_deposito" },
      ],
      avoid: [{ id: "saham", reasonKey: "rec_seimbang_savings_avoid_saham" }],
    };
  }
  return {
    level: "bertumbuh",
    efPct: emergencyFund.pct,
    savingsPct,
    recommend: [
      { id: "saham", reasonKey: "rec_bertumbuh_recommend_saham" },
      { id: "etf", reasonKey: "rec_bertumbuh_recommend_etf" },
      { id: "emas", reasonKey: "rec_bertumbuh_recommend_emas" },
    ],
    avoid: [{ id: "tabungan", reasonKey: "rec_bertumbuh_avoid_tabungan" }],
  };
}