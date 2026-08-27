"use client";
import styles from "./RiwayatToolbar.module.css";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RiwayatToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  monthFilter,
  onMonthFilterChange,
  availableMonths,
  sortOrder,
  onSortOrderChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  monthFilter: string;
  onMonthFilterChange: (v: string) => void;
  availableMonths: { key: string; label: string }[];
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (v: "newest" | "oldest") => void;
}) {
  const { t } = useLanguage();

  return (
    <div className={styles.toolbar}>
      <input
        type="text"
        className={styles.sinput}
        placeholder={t("riwayat_search_placeholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select className={styles.fbtn} value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
        <option value="">{t("riwayat_filter_all_type")}</option>
        <option value="expense">{t("riwayat_filter_expense")}</option>
        <option value="income">{t("riwayat_filter_income")}</option>
      </select>
      <select className={styles.fbtn} value={monthFilter} onChange={(e) => onMonthFilterChange(e.target.value)}>
        <option value="">{t("riwayat_filter_all_month")}</option>
        {availableMonths.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
        <button
          onClick={() => onSortOrderChange("newest")}
          className={styles.fbtn}
          style={{
            border: "none",
            borderRadius: 0,
            background: sortOrder === "newest" ? "var(--green)" : "var(--card)",
            color: sortOrder === "newest" ? "#fff" : "var(--text2)",
            fontWeight: sortOrder === "newest" ? 700 : 400,
          }}
        >
          {t("sort_newest")}
        </button>
        <button
          onClick={() => onSortOrderChange("oldest")}
          className={styles.fbtn}
          style={{
            border: "none",
            borderRadius: 0,
            background: sortOrder === "oldest" ? "var(--green)" : "var(--card)",
            color: sortOrder === "oldest" ? "#fff" : "var(--text2)",
            fontWeight: sortOrder === "oldest" ? 700 : 400,
          }}
        >
          {t("sort_oldest")}
        </button>
      </div>
    </div>
  );
}