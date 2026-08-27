"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Transaction } from "@/types/models";
import { Period } from "./GrafikPeriodTabs";
import { getDailySpendingInMonth, getDailySpendingInWeek, getHourlySpendingToday } from "@/lib/business/ChartData";
import { formatRupiah } from "@/lib/utils/format";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GrafikDailyChart({
  transactions,
  period,
  referenceDate,
}: {
  transactions: Transaction[];
  period: Period;
  referenceDate: Date;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { mode } = useTheme();
  const { t } = useLanguage();

  const tickColor = mode === "dark" ? "#9CA3AF" : "#6B7280";
  const gridColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const emptyBarColor = mode === "dark" ? "#2A2E37" : "#e5e7eb";

  const refMonthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;

  const { labels, values, subtitle } = (() => {
    if (period === "bulan") {
      const r = getDailySpendingInMonth(transactions, refMonthKey);
      return { ...r, subtitle: t("grafik_daily_sub_month") };
    }
    if (period === "minggu") {
      const r = getDailySpendingInWeek(transactions, referenceDate);
      return { ...r, subtitle: t("grafik_daily_sub_week") };
    }
    const r = getHourlySpendingToday(transactions, referenceDate);
    return { ...r, subtitle: t("grafik_daily_sub_day") };
  })();

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: values.map((v) => (v === 0 ? emptyBarColor : "#1d9e75")),
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => formatRupiah(c.raw as number) } },
        },
        scales: {
          y: { grid: { color: gridColor }, ticks: { font: { size: 11 }, color: tickColor } },
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: tickColor, maxTicksLimit: period === "hari" ? 8 : undefined } },
        },
        animation: { duration: 500 },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(values), period, mode]);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, gridColumn: "1 / -1" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "var(--text)" }}>{t("grafik_daily_title")}</div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>{subtitle}</div>
      <div style={{ position: "relative", width: "100%", height: 340 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}