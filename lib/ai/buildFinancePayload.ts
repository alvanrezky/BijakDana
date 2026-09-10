import { Transaction, Budget, Profile, SavingsGoal } from "@/types/models";
import { calcHealthScore, weakestPillars } from "@/lib/business/healthScore";
import { monthLabel } from "@/lib/utils/format";

export function buildFinancePayload(
  transactions: Transaction[],
  budget: Budget,
  profile: Profile,
  goals: SavingsGoal[]
) {
  const now = new Date();
  const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthTx = transactions.filter((tx) => tx.date.startsWith(mk));

  const totalPengeluaranBulanIni = monthTx.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  const totalPemasukanBulanIni = monthTx.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);

  const transaksiTerakhir = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)
    .map((tx) => ({ date: tx.date, type: tx.type, cat: tx.cat, amount: tx.amount, desc: tx.desc }));

  const riwayatBulanan: { label: string; pemasukan: number; pengeluaran: number; selisih: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const tx = transactions.filter((t) => t.date.startsWith(key));
    const pemasukan = tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const pengeluaran = tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    riwayatBulanan.push({ label: monthLabel(key), pemasukan, pengeluaran, selisih: pemasukan - pengeluaran });
  }

  const health = calcHealthScore(transactions, budget, profile, goals);
  const weakest = weakestPillars(health.pillars, 2);

  return {
    profile: {
      name: profile.name,
      income: profile.income,
      incomeType: profile.incomeType,
      emergencyFundTarget: profile.income * 6,
      emergencyFundCurrent: profile.emergencyFundCurrent,
    },
    budget,
    goals: goals.map((g) => ({ name: g.name, targetAmount: g.targetAmount, targetMonths: g.targetMonths })),
    totalPengeluaranBulanIni,
    totalPemasukanBulanIni,
    transaksiTerakhir,
    riwayatBulanan,
    skorKesehatan: {
      overall: health.overall,
      label: health.label,
      pillars: health.pillars.map((p) => ({ key: p.key, score: p.score, hasData: p.hasData })),
      pilarTerlemah: weakest.map((p) => ({ key: p.key, score: p.score })),
    },
  };
}