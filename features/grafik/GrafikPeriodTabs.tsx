"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";

export type Period = "bulan" | "minggu" | "hari";

export default function GrafikPeriodTabs({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  const { t } = useLanguage();
  const tabs: { key: Period; labelKey: DictKey }[] = [
    { key: "bulan", labelKey: "grafik_tab_month" },
    { key: "minggu", labelKey: "grafik_tab_week" },
    { key: "hari", labelKey: "grafik_tab_day" },
  ];

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            fontSize: 12,
            padding: "5px 13px",
            borderRadius: 20,
            border: period === tab.key ? "1px solid var(--green)" : "1px solid var(--border)",
            color: period === tab.key ? "white" : "var(--text2)",
            background: period === tab.key ? "var(--green)" : "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
}