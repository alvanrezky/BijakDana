"use client";
import { Achievement } from "@/lib/business/healthScore";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./AchievementsList.module.css";

const META: Record<string, { icon: string; labelKey: DictKey }> = {
  score_sehat: { icon: "🌟", labelKey: "achv_score_sehat" },
  ef_50: { icon: "🛡️", labelKey: "achv_ef_50" },
  ef_100: { icon: "🏆", labelKey: "achv_ef_100" },
  budget_full: { icon: "📋", labelKey: "achv_budget_full" },
  goal_achieved: { icon: "🎯", labelKey: "achv_goal_achieved" },
  first_goal: { icon: "✨", labelKey: "achv_first_goal" },
  stability_good: { icon: "📊", labelKey: "achv_stability_good" },
  all_buckets_active: { icon: "🧩", labelKey: "achv_all_buckets_active" },
};

export default function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  const { t } = useLanguage();

  return (
    <div className={styles.grid}>
      {achievements.map((a) => {
        const meta = META[a.id];
        return (
          <div key={a.id} className={a.unlocked ? styles.itemUnlocked : styles.itemLocked}>
            <span className={styles.icon}>{meta.icon}</span>
            <span className={styles.label}>{t(meta.labelKey)}</span>
          </div>
        );
      })}
    </div>
  );
}