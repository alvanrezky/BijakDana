"use client";
import { PillarScore, PillarKey } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./RecommendationsCard.module.css";

const REC_META: Record<PillarKey, { icon: string; textKey: DictKey; impactKey: DictKey }> = {
  savings: { icon: "💰", textKey: "rec_health_savings", impactKey: "rec_health_savings_impact" },
  budget: { icon: "📋", textKey: "rec_health_budget", impactKey: "rec_health_budget_impact" },
  emergency: { icon: "🛡️", textKey: "rec_health_emergency", impactKey: "rec_health_emergency_impact" },
  stability: { icon: "📈", textKey: "rec_health_stability", impactKey: "rec_health_stability_impact" },
  diversification: { icon: "🧩", textKey: "rec_health_diversification", impactKey: "rec_health_diversification_impact" },
};

export default function RecommendationsCard({ weakest }: { weakest: PillarScore[] }) {
  const { t } = useLanguage();

  if (weakest.length === 0) {
    return <div className={styles.empty}>{t("rec_health_empty")}</div>;
  }

  return (
    <div className={styles.list}>
      {weakest.map((p) => {
        const meta = REC_META[p.key];
        return (
          <div key={p.key} className={styles.item}>
            <span className={styles.icon}>{meta.icon}</span>
            <div className={styles.body}>
              <div className={styles.text}>{t(meta.textKey)}</div>
              <div className={styles.impact}>{t(meta.impactKey)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}