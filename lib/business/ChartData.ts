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

export function getDailySpendingInWeek(transactions: Transaction[], referenceDate: Date = new Date()) {
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - referenceDate.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const labels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const values = Array(7).fill(0);

  transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= start && new Date(t.date) < end)
    .forEach((t) => {
      const day = new Date(t.date).getDay();
      values[day] += t.amount;
    });

  return { labels, values };
}

export function getHourlySpendingToday(transactions: Transaction[], referenceDate: Date = new Date()) {
  const targetDateStr = referenceDate.toDateString();
  const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");
  const values = Array(24).fill(0);

  transactions
    .filter((t) => t.type === "expense" && new Date(t.date).toDateString() === targetDateStr)
    .forEach((t) => {
      const hour = parseInt((t.time || "00:00").split(":")[0]);
      values[hour] += t.amount;
    });

  return { labels, values };
}