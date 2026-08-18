"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { Budget } from "@/types/models";
import { formatRupiah } from "@/lib/utils/format";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrafikBudgetChart({ budget, byCategory }: { budget: Budget; byCategory: Record<string, number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { mode } = useTheme();
  const { t, lang } = useLanguage();

  const cats = EXPENSE_CATEGORIES.filter((c) => budget[c.id] > 0);
  const tickColor = mode === "dark" ? "#9CA3AF" : "#6B7280";
  const gridColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  // Makin banyak kategori, makin tinggi kontainernya, biar label & bar tetap kebaca jelas.
  const chartHeight = Math.max(340, cats.length * 50);

  useEffect(() => {
    if (!canvasRef.current || cats.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = cats.map((c) => `${c.icon} ${getCategoryLabel(c, lang)}`);
    const budgetData = cats.map((c) => budget[c.id] || 0);
    const actualData = cats.map((c) => byCategory[c.id] || 0);

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: t("grafik_budget_legend_budget"), data: budgetData, backgroundColor: "rgba(29,158,117,0.15)", borderColor: "#1d9e75", borderWidth: 1.5, borderRadius: 5, maxBarThickness: 28 },
          {
            label: t("grafik_budget_legend_actual"),
            data: actualData,
            backgroundColor: actualData.map((v, i) => (v > budgetData[i] ? "#ef4444" : "#1d9e75")),
            borderRadius: 5,
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 12, color: tickColor } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatRupiah(c.raw as number)}` } },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { font: { size: 11 }, color: tickColor } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: tickColor } },
        },
        animation: { duration: 500 },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(budget), JSON.stringify(byCategory), mode, t, lang]);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, gridColumn: "1 / -1" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "var(--text)" }}>{t("grafik_budget_title")}</div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>{t("grafik_budget_sub")}</div>
      {cats.length === 0 ? (
        <div style={{ color: "var(--text2)", fontSize: 13 }}>{t("grafik_budget_empty")}</div>
      ) : (
        <div style={{ position: "relative", width: "100%", height: chartHeight }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}