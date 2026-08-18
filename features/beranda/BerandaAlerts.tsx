"use client";
import { useState } from "react";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { PeriodStats, findOverBudgetCategories } from "@/lib/business/stats";
import { Budget } from "@/types/models";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BerandaAlerts({ stats, budget }: { stats: PeriodStats; budget: Budget }) {
  const { t, lang } = useLanguage();
  const overCategories = findOverBudgetCategories(stats, budget);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = overCategories.filter((c) => !dismissed.includes(c));

  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {visible.map((catId) => {
        const cat = findCategory(catId, "expense");
        const catLabel = getCategoryLabel(cat, lang);
        const spent = stats.byCategory[catId];
        const limit = budget[catId];
        const selisih = spent - limit;

        return (
          <div
            key={catId}
            style={{
              background: "var(--red-lt)",
              border: "1px solid var(--red)",
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "var(--red)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 2 }}>
                {t("beranda_alert_over_prefix")} {catLabel} {t("beranda_alert_over_title")}
              </div>
              <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                {t("beranda_alert_over_desc1")} {formatRupiah(spent)} {t("beranda_alert_over_desc2")}{" "}
                {formatRupiah(limit)}. {t("beranda_alert_over_desc3")} {formatRupiah(selisih)}.
              </div>
            </div>
            <button
              onClick={() => setDismissed((prev) => [...prev, catId])}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text3)",
                padding: 2,
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}