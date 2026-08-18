export function formatRupiah(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export function formatRupiahShort(n: number): string {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1).replace(".0", "") + "jt";
  if (n >= 1000) return "Rp " + (n / 1000).toFixed(0) + "rb";
  return formatRupiah(n);
}

export function parseRupiah(s: string): number {
  return parseInt((s || "").replace(/[^0-9]/g, "")) || 0;
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(d: string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  return monthKey(new Date().toISOString());
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return months[parseInt(month) - 1] + " " + year;

  
}

