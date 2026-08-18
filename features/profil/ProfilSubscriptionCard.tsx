"use client";
import styles from "./ProfilSubscriptionCard.module.css";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProfilSubscriptionCard({ onExtend }: { onExtend: () => void }) {
  const { t } = useLanguage();

  return (
    <div className={styles.subCard}>
      <div className={styles.label}>{t("profil_subscription_label")}</div>
      <div className={styles.plan}>{t("profil_subscription_plan")}</div>
      <div className={styles.expiry}>{t("profil_subscription_expiry")}</div>
      <button className={styles.extendBtn} onClick={onExtend}>
        {t("profil_subscription_extend")}
      </button>
    </div>
  );
}