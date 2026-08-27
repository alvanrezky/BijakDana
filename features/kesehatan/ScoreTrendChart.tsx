"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ScoreTrendChart({ trend }: { trend: { monthKey: string; overall: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { mode } = useTheme();
  const { lang } = useLanguage();

  const tickColor = mode === "dark" ? "#9CA3AF" : "#6B7280";
  const gridColor = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  const monthNamesId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNames = lang === "id" ? monthNamesId : monthNamesEn;

  const labels = trend.map((t) => {
    const [, m] = t.monthKey.split("-");
    return monthNames[parseInt(m) - 1];
  });
  const values = trend.map((t) => t.overall);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#1D9E75",
            backgroundColor: "rgba(29,158,117,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: "#1D9E75",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(values), mode, lang]);

  return (
    <div style={{ position: "relative", width: "100%", height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}