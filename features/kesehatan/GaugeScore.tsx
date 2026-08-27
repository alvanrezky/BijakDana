"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { HealthScoreResult } from "@/lib/business/healthScore";
import styles from "./GaugeScore.module.css";

const W = 280;
const H = 170;
const CX = W / 2;
const CY = H - 10;
const R = 120;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function GaugeScore({ result }: { result: HealthScoreResult }) {
  const { t } = useLanguage();

  const needleAngle = (result.overall / 100) * 180;
  const needleTip = polarToCartesian(CX, CY, R - 16, needleAngle);

  const labelKey =
    result.label === "sehat" ? "health_label_sehat" : result.label === "cukup" ? "health_label_cukup" : "health_label_perhatian";
  const color = result.label === "sehat" ? "#1D9E75" : result.label === "cukup" ? "#F59E0B" : "#EF4444";

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        <path d={arcPath(CX, CY, R, 0, 90)} stroke="#EF4444" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={arcPath(CX, CY, R, 90, 135)} stroke="#F59E0B" strokeWidth={20} fill="none" opacity={0.85} />
        <path d={arcPath(CX, CY, R, 135, 180)} stroke="#1D9E75" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.85} />
        <line x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y} stroke="var(--text)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={7} fill="var(--text)" />
      </svg>
      <div className={styles.scoreValue} style={{ color }}>
        {result.overall}
      </div>
      <div className={styles.scoreLabel} style={{ color }}>
        {t(labelKey as any)}
      </div>
    </div>
  );
}