"use client";
import { HealthScoreResult, MonthComparison, PillarKey } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./MonthlyNarrativeCard.module.css";

const PILLAR_NAME_KEY: Record<PillarKey, DictKey> = {
  savings: "pillar_savings",
  budget: "pillar_budget",
  emergency: "pillar_emergency",
  stability: "pillar_stability",
  diversification: "pillar_diversification",
};

export default function MonthlyNarrativeCard({
  current,
  comparison,
  monthLabel,
}: {
  current: HealthScoreResult;
  comparison: MonthComparison;
  monthLabel: string;
}) {
  const { t } = useLanguage();

  const labelKey =
    current.label === "sehat" ? "health_label_sehat" : current.label === "cukup" ? "health_label_cukup" : "health_label_perhatian";
  const badgeColor = current.label === "sehat" ? "#1D9E75" : current.label === "cukup" ? "#F59E0B" : "#EF4444";

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <span className={styles.badge} style={{ background: badgeColor }}>
          {t(labelKey as any)}
        </span>
        <span className={styles.month}>{monthLabel}</span>
      </div>

      <div className={styles.mainLine}>
        {t("narrative_overall_prefix")} <strong>{current.overall}</strong>
        {comparison.hasPrevious && (
          <>
            {", "}
            <span style={{ color: comparison.overallDelta > 0 ? "var(--green)" : comparison.overallDelta < 0 ? "var(--red)" : "var(--text2)" }}>
              {comparison.overallDelta > 0
                ? `${t("narrative_up_prefix")} ${comparison.overallDelta} ${t("narrative_points_suffix")}`
                : comparison.overallDelta < 0
                ? `${t("narrative_down_prefix")} ${Math.abs(comparison.overallDelta)} ${t("narrative_points_suffix")}`
                : t("narrative_flat")}
            </span>
            {" "}
            {t("narrative_vs_last_month")}
          </>
        )}
        .
      </div>

      {!comparison.hasPrevious && <div className={styles.subLine}>{t("narrative_no_previous")}</div>}

      {comparison.hasPrevious && comparison.topImproved && (
        <div className={styles.subLine}>
          {t("narrative_top_improved_prefix")} <strong>{t(PILLAR_NAME_KEY[comparison.topImproved.key])}</strong> (+
          {comparison.topImproved.delta}).
        </div>
      )}

      {comparison.hasPrevious && comparison.topDeclined && (
        <div className={styles.subLine} style={{ color: "var(--red)" }}>
          {t("narrative_top_declined_prefix")} <strong>{t(PILLAR_NAME_KEY[comparison.topDeclined.key])}</strong> (
          {comparison.topDeclined.delta}).
        </div>
      )}
    </div>
  );
}