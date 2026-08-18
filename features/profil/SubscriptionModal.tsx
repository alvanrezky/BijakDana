"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./SubscriptionModal.module.css";

const PLANS: { id: string; priceKey: DictKey; labelKey: DictKey; best?: boolean }[] = [
  { id: "month1", priceKey: "plan_price_month1", labelKey: "plan_label_month1" },
  { id: "month3", priceKey: "plan_price_month3", labelKey: "plan_label_month3" },
  { id: "month6", priceKey: "plan_price_month6", labelKey: "plan_label_month6" },
  { id: "year1", priceKey: "plan_price_year1", labelKey: "plan_label_year1", best: true },
];

export default function SubscriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState("year1");
  const selectedPlan = PLANS.find((p) => p.id === selected) || PLANS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className={styles.title}>{t("sub_modal_title")}</div>
            <div className={styles.sub}>{t("sub_modal_sub")}</div>

            <div className={styles.plans}>
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={selected === p.id ? styles.planActive : styles.plan}
                  onClick={() => setSelected(p.id)}
                >
                  {p.best && <span className={styles.bestBadge}>{t("plan_best_value")}</span>}
                  <div className={styles.planLabel}>{t(p.labelKey)}</div>
                  <div className={styles.planPrice}>{t(p.priceKey)}</div>
                </div>
              ))}
            </div>

            <button className={styles.chooseBtn} onClick={() => alert(t("sub_modal_soon"))}>
              {t("sub_modal_choose_prefix")} {t(selectedPlan.labelKey)}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              {t("btn_cancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}