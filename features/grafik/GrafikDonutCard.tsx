"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiahShort, formatRupiah } from "@/lib/utils/format";
import { PeriodStats } from "@/lib/business/stats";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrafikDonutCard({ stats }: { stats: PeriodStats }) {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const entries = Object.entries(stats.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    if (entries.length === 0) return;

    const labels = entries.map(([id]) => getCategoryLabel(findCategory(id, "expense"), lang));
    const data = entries.map(([, v]) => v);
    const colors = entries.map(([id]) => findCategory(id, "expense").color);

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
      options: {
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${formatRupiah(c.raw as number)}` } },
        },
        animation: { duration: 600 },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(entries), lang]);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "var(--text)" }}>{t("grafik_donut_title")}</div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("grafik_donut_sub")}</div>

      {entries.length === 0 ? (
        <div style={{ color: "var(--text2)", fontSize: 13 }}>{t("grafik_donut_empty")}</div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
            <canvas ref={canvasRef} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatRupiahShort(stats.expense)}</div>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>{t("grafik_donut_total_out")}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {entries.map(([id, v]) => {
              const cat = findCategory(id, "expense");
              const catLabel = getCategoryLabel(cat, lang);
              const pct = Math.round((v / (stats.expense || 1)) * 100);
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>
                    {cat.icon} {catLabel}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}