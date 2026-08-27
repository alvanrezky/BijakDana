"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./PeerComparisonCard.module.css";

export default function PeerComparisonCard() {
  const { t } = useLanguage();

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>👥</div>
      <div className={styles.title}>{t("peer_comparison_title")}</div>
      <div className={styles.desc}>{t("peer_comparison_desc")}</div>
    </div>
  );
}