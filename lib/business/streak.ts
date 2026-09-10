import { Transaction } from "@/types/models";

export function calcStreak(transactions: Transaction[]): number {
  const uniqueDates = Array.from(new Set(transactions.map((t) => t.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Streak dianggap masih "hidup" kalau pencatatan terakhir hari ini atau kemarin.
  // Kalau bolong lebih dari 1 hari, streak otomatis 0.
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

  let streak = 0;
  const cursor = new Date(uniqueDates[0]);

  for (const d of uniqueDates) {
    const cursorStr = cursor.toISOString().split("T")[0];
    if (d === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}