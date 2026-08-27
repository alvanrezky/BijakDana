"use client";
import { PillarScore, PillarKey } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./PillarBreakdown.module.css";

const PILLAR_META: Record<PillarKey, { icon: string; labelKey: DictKey; color: string }> = {
  savings: { icon: "💰", labelKey: "pillar_savings", color: "#1D9E75" },
  budget: { icon: "📋", labelKey: "pillar_budget", color: "#3B82F6" },
  emergency: { icon: "🛡️", labelKey: "pillar_emergency", color: "#8B5CF6" },
  stability: { icon: "📈", labelKey: "pillar_stability", color: "#F59E0B" },
  diversification: { icon: "🧩", labelKey: "pillar_diversification", color: "#EC4899" },
};

export default function PillarBreakdown({
  pillars,
  onSelectPillar,
}: {
  pillars: PillarScore[];
  onSelectPillar: (key: PillarKey) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className={styles.list}>
      {pillars.map((p) => {
        const meta = PILLAR_META[p.key];
        return (
          <button key={p.key} className={styles.row} onClick={() => onSelectPillar(p.key)}>
            <span className={styles.icon}>{meta.icon}</span>
            <div className={styles.mid}>
              <div className={styles.label}>{t(meta.labelKey)}</div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${p.score}%`, background: meta.color }} />
              </div>
            </div>
            <span className={styles.score} style={{ color: meta.color }}>
              {p.hasData ? p.score : "-"}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className={styles.chevron}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}