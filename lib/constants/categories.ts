import { Category } from "@/types/models";
import { Lang } from "@/lib/i18n/dictionary";

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "makan", label: "Makan & Minum", icon: "🍜", color: "#1D9E75", bg: "#E6F7F2" },
  { id: "transport", label: "Transportasi", icon: "🚗", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "sewa", label: "Sewa/Kos/KPR", icon: "🏠", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "listrik", label: "Listrik/Air/Internet", icon: "💡", color: "#F59E0B", bg: "#FEF3C7" },
  { id: "hiburan", label: "Hiburan", icon: "🎮", color: "#EF4444", bg: "#FEF2F2" },
  { id: "kesehatan", label: "Kesehatan", icon: "💊", color: "#EC4899", bg: "#FDF2F8" },
  { id: "pendidikan", label: "Pendidikan", icon: "📚", color: "#0EA5E9", bg: "#F0F9FF" },
  { id: "pakaian", label: "Pakaian/Perawatan", icon: "👕", color: "#A855F7", bg: "#FAF5FF" },
  { id: "sosial", label: "Sosial/Hadiah", icon: "🎁", color: "#F97316", bg: "#FFF7ED" },
  { id: "tabungan", label: "Tabungan Biasa", icon: "🏦", color: "#14B8A6", bg: "#F0FDFA" },
  { id: "danadrt", label: "Dana Darurat", icon: "🛡️", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "lain", label: "Lainnya", icon: "📦", color: "#6B7280", bg: "#F3F4F6" },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: "gaji", label: "Gaji/Salary", icon: "💼", color: "#1D9E75", bg: "#E6F7F2" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "bisnis", label: "Bisnis", icon: "🏪", color: "#F59E0B", bg: "#FEF3C7" },
  { id: "invest", label: "Hasil Investasi", icon: "📈", color: "#14B8A6", bg: "#F0FDFA" },
  { id: "lain-in", label: "Lainnya", icon: "💰", color: "#6B7280", bg: "#F3F4F6" },
];

export function findCategory(id: string, type: "income" | "expense", extra: Category[] = []): Category {
  const combined = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...extra];
  const found = combined.find((c) => c.id === id);
  if (found) return found;

  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list[list.length - 1];
}

// Sisipkan kategori kustom sebelum "Lainnya", biar "Lainnya" selalu di akhir daftar.
export function mergeWithCustom(defaults: Category[], custom: Category[]): Category[] {
  if (custom.length === 0) return defaults;
  const withoutLast = defaults.slice(0, -1);
  const last = defaults[defaults.length - 1];
  return [...withoutLast, ...custom, last];
}

const CATEGORY_LABELS_EN: Record<string, string> = {
  makan: "Food & Drinks",
  transport: "Transportation",
  sewa: "Rent/Mortgage",
  listrik: "Electricity/Water/Internet",
  hiburan: "Entertainment",
  kesehatan: "Health",
  pendidikan: "Education",
  pakaian: "Clothing/Personal Care",
  sosial: "Social/Gifts",
  tabungan: "Regular Savings",
  danadrt: "Emergency Fund",
  lain: "Others",
  gaji: "Salary",
  freelance: "Freelance",
  bisnis: "Business",
  invest: "Investment Returns",
  "lain-in": "Others",
};

export function getCategoryLabel(cat: Category, lang: Lang): string {
  if (lang === "en" && CATEGORY_LABELS_EN[cat.id]) {
    return CATEGORY_LABELS_EN[cat.id];
  }
  return cat.label;
}