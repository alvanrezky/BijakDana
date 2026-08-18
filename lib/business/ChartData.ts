import { Transaction } from "@/types/models";

export function getDailySpendingInMonth(transactions: Transaction[], monthKeyValue: string) {
  const [year, month] = monthKeyValue.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const values = Array(daysInMonth).fill(0);

  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(monthKeyValue))
    .forEach((t) => {
      const day = new Date(t.date).getDate() - 1;
      values[day] += t.amount;
    });

  return { labels, values };
}

export function getDailySpendingInWeek(transactions: Transaction[]) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);

  const labels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const values = Array(7).fill(0);

  transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= start)
    .forEach((t) => {
      const day = new Date(t.date).getDay();
      values[day] += t.amount;
    });

  return { labels, values };
}

export function getHourlySpendingToday(transactions: Transaction[]) {
  const today = new Date().toDateString();
  const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");
  const values = Array(24).fill(0);

  transactions
    .filter((t) => t.type === "expense" && new Date(t.date).toDateString() === today)
    .forEach((t) => {
      const hour = parseInt((t.time || "00:00").split(":")[0]);
      values[hour] += t.amount;
    });

  return { labels, values };
}