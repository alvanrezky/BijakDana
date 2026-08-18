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
}: {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  monthFilter: string;
  onMonthFilterChange: (v: string) => void;
  availableMonths: { key: string; label: string }[];
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
    </div>
  );
}