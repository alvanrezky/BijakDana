"use client";
import { useState } from "react";
import { getStreakTier } from "@/lib/business/streakTier";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./StreakBadge.module.css";

export default function StreakBadge({ streak }: { streak: number }) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const active = streak > 0;
  const tier = getStreakTier(streak);

  return (
    <div
      className={active ? styles.wrapActive : styles.wrap}
      style={active ? { background: tier.color, boxShadow: tier.glow } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered((v) => !v)}
    >
      <span className={styles.flame}>{active ? "🔥" : "🕯️"}</span>
      <span className={styles.count}>{streak}</span>
      {hovered && (
        <span className={styles.expandedLabel}>
          {t("streak_label")} · {t(tier.nameKey as any)}
        </span>
      )}
    </div>
  );
}