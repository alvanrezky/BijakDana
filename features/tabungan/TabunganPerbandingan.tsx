"use client";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./TabunganPerbandingan.module.css";
import { formatRupiah, parseRupiah } from "@/lib/utils/format";
import { INSTRUMENTS } from "@/lib/constants/instruments";
import { calcInstrumentProjections } from "@/lib/business/savings";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const HORIZONS = [1, 3, 5, 10, 15];
const CHART_W = 640;
const CHART_H = 280;
const PAD_L = 54;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 34;

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function TabunganPerbandingan({ defaultMonthly }: { defaultMonthly: number }) {
  const { t } = useLanguage();
  const [amountText, setAmountText] = useState(defaultMonthly ? formatRupiah(defaultMonthly) : "");
  const monthlyAmount = parseRupiah(amountText) || 0;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { mode } = useTheme();

  const gridColor = mode === "dark" ? "#2A2E37" : "#f0f1f3";
  const axisTextColor = mode === "dark" ? "#9CA3AF" : "#9ca3af";
  const axisTextActiveColor = mode === "dark" ? "#F3F4F6" : "#111827";

  const projections = useMemo(() => calcInstrumentProjections(monthlyAmount, HORIZONS), [monthlyAmount]);

  const maxValue = useMemo(() => {
    let max = 0;
    projections.forEach((p) => Object.values(p.values).forEach((v) => { if (v > max) max = v; }));
    return max || 1;
  }, [projections]);

  function xPos(i: number) {
    const usable = CHART_W - PAD_L - PAD_R;
    return PAD_L + (usable * i) / (HORIZONS.length - 1);
  }
  function yPos(v: number) {
    const usable = CHART_H - PAD_T - PAD_B;
    return PAD_T + usable - (usable * v) / maxValue;
  }

  function handleAmountChange(v: string) {
    const raw = v.replace(/[^0-9]/g, "");
    setAmountText(raw ? formatRupiah(parseInt(raw)) : "");
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    let closest = 0;
    let closestDist = Infinity;
    HORIZONS.forEach((_, i) => {
      const dist = Math.abs(xPos(i) - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIdx(closest);
  }

  const topInstrumentId = useMemo(() => {
    const last = projections[projections.length - 1];
    let top = INSTRUMENTS[0].id;
    let topVal = -1;
    INSTRUMENTS.forEach((inst) => {
      if (last.values[inst.id] > topVal) {
        topVal = last.values[inst.id];
        top = inst.id;
      }
    });
    return top;
  }, [projections]);

  const activeIdx = hoverIdx ?? projections.length - 1;
  const activeYear = HORIZONS[activeIdx];
  const tooltipWidthPx = 220;
  const containerWidthPx = svgRef.current?.getBoundingClientRect().width || CHART_W;
  const rawLeftPx = (xPos(activeIdx) / CHART_W) * containerWidthPx;
  const clampedLeftPx = Math.min(containerWidthPx - tooltipWidthPx - 8, Math.max(8, rawLeftPx - tooltipWidthPx / 2));

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className={styles.title}>{t("perbandingan_title")}</div>
        <div className={styles.sub}>{t("perbandingan_sub")}</div>
      </div>

      <div className={styles.field}>
        <label>{t("perbandingan_field_label")}</label>
        <input value={amountText} onChange={(e) => handleAmountChange(e.target.value)} placeholder="Rp 500.000" />
      </div>

      <div className={styles.chartWrap}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className={styles.svg}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {INSTRUMENTS.map((inst) => (
              <linearGradient key={inst.id} id={`grad-${inst.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={inst.color} stopOpacity={inst.id === topInstrumentId ? 0.22 : 0} />
                <stop offset="100%" stopColor={inst.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const y = PAD_T + (CHART_H - PAD_T - PAD_B) * (1 - f);
            return (
              <g key={i}>
                <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke={gridColor} strokeWidth={1} />
                <text x={PAD_L - 8} y={y + 4} fontSize={10} fill={axisTextColor} textAnchor="end">
                  {maxValue >= 1000000
                    ? Math.round((maxValue * f) / 1000000) + "jt"
                    : Math.round((maxValue * f) / 1000) + "rb"}
                </text>
              </g>
            );
          })}

          {HORIZONS.map((h, i) => (
            <text
              key={h}
              x={xPos(i)}
              y={CHART_H - PAD_B + 18}
              fontSize={11}
              fill={hoverIdx === i ? axisTextActiveColor : axisTextColor}
              fontWeight={hoverIdx === i ? 700 : 400}
              textAnchor="middle"
            >
              {h} {t("perbandingan_tooltip_years")}
            </text>
          ))}

          {hoverIdx !== null && (
            <line
              x1={xPos(hoverIdx)}
              y1={PAD_T}
              x2={xPos(hoverIdx)}
              y2={CHART_H - PAD_B}
              stroke={mode === "dark" ? "#4B5563" : "#d1d5db"}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}

          {INSTRUMENTS.map((inst) => {
            const points = projections.map((p, i) => ({ x: xPos(i), y: yPos(p.values[inst.id]) }));
            const path = smoothPath(points);
            const areaPath = `${path} L ${points[points.length - 1].x} ${CHART_H - PAD_B} L ${points[0].x} ${CHART_H - PAD_B} Z`;
            return (
              <g key={inst.id}>
                {inst.id === topInstrumentId && <path d={areaPath} fill={`url(#grad-${inst.id})`} />}
                <path
                  d={path}
                  fill="none"
                  stroke={inst.color}
                  strokeWidth={inst.id === topInstrumentId ? 3 : 2}
                  strokeLinecap="round"
                  opacity={hoverIdx !== null ? 0.9 : 1}
                />
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoverIdx === i ? 5 : 3}
                    fill={mode === "dark" ? "#1A1D23" : "#fff"}
                    stroke={inst.color}
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {hoverIdx !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={styles.tooltip}
            style={{ left: `${clampedLeftPx}px` }}
          >
            <div className={styles.tooltipYear}>
              {t("perbandingan_tooltip_horizon")} {activeYear} {t("perbandingan_tooltip_years")}
            </div>
            {INSTRUMENTS.slice()
              .sort((a, b) => projections[activeIdx].values[b.id] - projections[activeIdx].values[a.id])
              .map((inst) => (
                <div key={inst.id} className={styles.tooltipRow}>
                  <span className={styles.tooltipDot} style={{ background: inst.color }} />
                  <span className={styles.tooltipLabel}>{t(inst.labelKey)}</span>
                  <span className={styles.tooltipReturn}>
                    {(inst.annualReturn * 100).toFixed(1)}{t("perbandingan_per_year")}
                  </span>
                  <span className={styles.tooltipValue}>{formatRupiah(projections[activeIdx].values[inst.id])}</span>
                </div>
              ))}
          </motion.div>
        )}
      </div>

      <div className={styles.legend}>
        {INSTRUMENTS.map((inst) => (
          <div key={inst.id} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: inst.color }} />
            <div className={styles.legendText}>
              <span className={styles.legendLabel}>{t(inst.labelKey)}</span>
              <span className={styles.legendMeta}>
                {t(inst.riskKey)} · {(inst.annualReturn * 100).toFixed(1)}{t("perbandingan_per_year")}
              </span>
            </div>
            <span className={styles.legendValue}>
              {formatRupiah(projections[projections.length - 1].values[inst.id])}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.disclaimer}>{t("perbandingan_disclaimer")}</div>
    </motion.div>
  );
}