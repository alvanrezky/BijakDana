"use client";
import { PillarKey, PillarScore } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./ScoreContributionBreakdown.module.css";

const META: Record<PillarKey, { labelKey: DictKey; color: string }> = {
  savings: { labelKey: "pillar_savings", color: "#1D9E75" },
  budget: { labelKey: "pillar_budget", color: "#3B82F6" },
  emergency: { labelKey: "pillar_emergency", color: "#8B5CF6" },
  stability: { labelKey: "pillar_stability", color: "#F59E0B" },
  diversification: { labelKey: "pillar_diversification", color: "#EC4899" },
};

export default function ScoreContributionBreakdown({ pillars, overall }: { pillars: PillarScore[]; overall: number }) {
  const { t } = useLanguage();

  return (
    <div className={styles.wrap}>
      <div className={styles.barTrack}>
        {pillars.map((p) => {
          const contribution = Math.round(p.score * p.weight);
          const widthPct = (contribution / 100) * 100;
          const meta = META[p.key];
          return (
            <div
              key={p.key}
              className={styles.segment}
              style={{ width: `${widthPct}%`, background: meta.color }}
              title={`${t(meta.labelKey)}: ${contribution}`}
            />
          );
        })}
      </div>

      <div className={styles.legend}>
        {pillars.map((p) => {
          const contribution = Math.round(p.score * p.weight);
          const meta = META[p.key];
          return (
            <div key={p.key} className={styles.legendRow}>
              <span className={styles.dot} style={{ background: meta.color }} />
              <span className={styles.legendLabel}>{t(meta.labelKey)}</span>
              <span className={styles.legendFormula}>
                {p.hasData ? p.score : "-"} × {Math.round(p.weight * 100)}%
              </span>
              <span className={styles.legendContribution} style={{ color: meta.color }}>
                {p.hasData ? `+${contribution}` : "0"}
              </span>
            </div>
          );
        })}
        <div className={styles.totalRow}>
          <span>{t("contribution_total_label")}</span>
          <strong>{overall} / 100</strong>
        </div>
      </div>
    </div>
  );
}