"use client";
import { motion } from "framer-motion";
import styles from "./TabunganEdukasi.module.css";
import { EmergencyFundResult, getInstrumentRecommendation } from "@/lib/business/savings";
import { INSTRUMENTS } from "@/lib/constants/instruments";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TabunganEdukasi({
  emergencyFund,
  savingsPct,
}: {
  emergencyFund: EmergencyFundResult;
  savingsPct: number;
}) {
  const { t } = useLanguage();
  const rec = getInstrumentRecommendation(emergencyFund, savingsPct);
  const efReady = emergencyFund.pct >= 100;

  function findInst(id: string) {
    return INSTRUMENTS.find((i) => i.id === id)!;
  }

  const levelLabel = t(`rec_level_${rec.level}_label` as any);
  const levelDesc = t(`rec_level_${rec.level}_desc` as any).replace("{pct}", String(rec.efPct));

  return (
    <div className={styles.wrap}>
      <motion.div
        className={`${styles.recCard} ${styles[`rec_${rec.level.split("_")[0]}`] || styles.rec_seimbang}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className={styles.recBadge}>{levelLabel}</div>
        <div className={styles.recDesc}>{levelDesc}</div>

        <div className={styles.recCols}>
          <div className={styles.recCol}>
            <div className={styles.recColTitle}>{t("rec_recommend_title")}</div>
            {rec.recommend.map((r) => {
              const inst = findInst(r.id);
              return (
                <div key={r.id} className={styles.recChip} style={{ borderLeftColor: inst.color }}>
                  <div className={styles.recChipHeader}>
                    <span className={styles.recDot} style={{ background: inst.color }} />
                    <span className={styles.recChipLabel}>{t(inst.labelKey)}</span>
                  </div>
                  <p className={styles.recChipReason}>{t(r.reasonKey)}</p>
                </div>
              );
            })}
          </div>
          <div className={styles.recCol}>
            <div className={styles.recColTitle}>{t("rec_avoid_title")}</div>
            {rec.avoid.map((r) => {
              const inst = findInst(r.id);
              return (
                <div key={r.id} className={`${styles.recChip} ${styles.recChipAvoid}`}>
                  <div className={styles.recChipHeader}>
                    <span className={styles.recDot} style={{ background: inst.color }} />
                    <span className={styles.recChipLabel}>{t(inst.labelKey)}</span>
                  </div>
                  <p className={styles.recChipReason}>{t(r.reasonKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className={styles.sectionsGrid}>
        <motion.div
          className={`${styles.section} ${styles.sectionRisk}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚖️</span>
            <span className={styles.sectionTitle}>{t("edu_section_risk_title")}</span>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_risk_low_title")}</div>
            <p>{t("edu_risk_low_desc")}</p>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_risk_high_title")}</div>
            <p>{t("edu_risk_high_desc")}</p>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.section} ${styles.sectionHorizon}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⏳</span>
            <span className={styles.sectionTitle}>{t("edu_section_horizon_title")}</span>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_horizon_short_title")}</div>
            <p>{t("edu_horizon_short_desc")}</p>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_horizon_long_title")}</div>
            <p>{t("edu_horizon_long_desc")}</p>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.section} ${styles.sectionEconomy}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🌍</span>
            <span className={styles.sectionTitle}>{t("edu_section_economy_title")}</span>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_economy_rate_down_title")}</div>
            <p>{t("edu_economy_rate_down_desc")}</p>
          </div>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemTitle}>{t("edu_economy_rate_high_title")}</div>
            <p>{t("edu_economy_rate_high_desc")}</p>
          </div>
        </motion.div>
      </div>

      <div className={styles.footnote}>{t("edu_footnote")}</div>
    </div>
  );
}