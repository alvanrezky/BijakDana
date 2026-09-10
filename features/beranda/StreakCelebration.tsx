"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getStreakTier } from "@/lib/business/streakTier";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./StreakCelebration.module.css";

const STORAGE_KEY = "bd_last_seen_streak";

export default function StreakCelebration({ streak }: { streak: number }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (streak <= 0) return;
    const lastSeen = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    if (streak > lastSeen) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2800);
      localStorage.setItem(STORAGE_KEY, String(streak));
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem(STORAGE_KEY, String(streak));
    }
  }, [streak]);

  const tier = getStreakTier(streak);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.popup}
            style={{ background: tier.color, boxShadow: tier.glow }}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <div className={styles.flameEmoji}>🔥</div>
            <div className={styles.streakNumber}>{streak}</div>
            <div className={styles.streakText}>{t("streak_celebration_text")}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}