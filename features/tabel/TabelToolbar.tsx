"use client";
import { Category } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TabelToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  availableCategories,
  monthFilter,
  onMonthFilterChange,
  availableMonths,
  sortOrder,
  onSortOrderChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  availableCategories: Category[];
  monthFilter: string;
  onMonthFilterChange: (v: string) => void;
  availableMonths: { key: string; label: string }[];
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (v: "newest" | "oldest") => void;
}) {
  const { t, lang } = useLanguage();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("tabel_search_placeholder")}
        style={{
          flex: 1,
          minWidth: 180,
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          background: "var(--card)",
          color: "var(--text)",
        }}
      />
      <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)} style={selectStyle}>
        <option value="">{t("tabel_filter_all_category")}</option>
        {availableCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {getCategoryLabelSafe(c, lang)}
          </option>
        ))}
      </select>
      <select value={monthFilter} onChange={(e) => onMonthFilterChange(e.target.value)} style={selectStyle}>
        <option value="">{t("tabel_filter_all_month")}</option>
        {availableMonths.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
        <button
          onClick={() => onSortOrderChange("newest")}
          style={{
            border: "none",
            padding: "8px 13px",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            background: sortOrder === "newest" ? "var(--green)" : "var(--card)",
            color: sortOrder === "newest" ? "#fff" : "var(--text2)",
            fontWeight: sortOrder === "newest" ? 700 : 400,
          }}
        >
          {t("sort_newest")}
        </button>
        <button
          onClick={() => onSortOrderChange("oldest")}
          style={{
            border: "none",
            padding: "8px 13px",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
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

function getCategoryLabelSafe(c: Category, lang: string) {
  return c.label;
}

const selectStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--card)",
  borderRadius: 8,
  padding: "8px 13px",
  fontSize: 12,
  fontFamily: "inherit",
  color: "var(--text2)",
  cursor: "pointer",
};