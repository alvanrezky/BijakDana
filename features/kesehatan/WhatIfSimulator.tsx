"use client";
import { useMemo, useState } from "react";
import { HealthScoreResult, PillarKey } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./WhatIfSimulator.module.css";

export default function WhatIfSimulator({ current }: { current: HealthScoreResult }) {
  const { t } = useLanguage();
  const [savingsDelta, setSavingsDelta] = useState(0);

  const savingsPillar = current.pillars.find((p) => p.key === "savings")!;

  const simulated = useMemo(() => {
    const newSavingsScore = Math.max(0, Math.min(100, savingsPillar.score + savingsDelta));
    const otherPillars = current.pillars.filter((p) => p.key !== "savings" as PillarKey);
    const overall = Math.round(
      otherPillars.reduce((s, p) => s + p.score * p.weight, 0) + newSavingsScore * savingsPillar.weight
    );
    return { newSavingsScore, overall };
  }, [savingsDelta, current, savingsPillar]);

  const delta = simulated.overall - current.overall;

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>{t("whatif_slider_label")}</label>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={-30}
          max={30}
          value={savingsDelta}
          onChange={(e) => setSavingsDelta(parseInt(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderValue}>
          {savingsDelta > 0 ? "+" : ""}
          {savingsDelta}
        </span>
      </div>
      <div className={styles.resultRow}>
        <div className={styles.resultBox}>
          <div className={styles.resultLabel}>{t("whatif_current_score")}</div>
          <div className={styles.resultValue}>{current.overall}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" width="18" height="18">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <div className={styles.resultBox}>
          <div className={styles.resultLabel}>{t("whatif_simulated_score")}</div>
          <div className={styles.resultValue} style={{ color: delta >= 0 ? "var(--green)" : "var(--red)" }}>
            {simulated.overall}
            <span className={styles.deltaBadge}>
              {" "}
              ({delta > 0 ? "+" : ""}
              {delta})
            </span>
          </div>
        </div>
      </div>
      <div className={styles.note}>{t("whatif_disclaimer")}</div>
    </div>
  );
}