"use client";
import { useRouter } from "next/navigation";
import { PocketStrategyResult } from "@/lib/business/pocketStrategy";
import { findCategory, getCategoryLabel } from "@/lib/constants/categories";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./PocketStrategyCard.module.css";

export default function PocketStrategyCard({ strategy }: { strategy: PocketStrategyResult }) {
  const { t, lang } = useLanguage();
  const router = useRouter();

  if (strategy.type === "good") {
    return (
      <div className={styles.wrap}>
        <div className={styles.icon}>✅</div>
        <div className={styles.title}>{t("pocket_strategy_good_title")}</div>
        <div className={styles.desc}>{t("pocket_strategy_good_desc")}</div>
      </div>
    );
  }

  const cat = findCategory(strategy.cat, "expense");
  const catLabel = getCategoryLabel(cat, lang);

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{strategy.type === "reduce" ? "⚠️" : "👀"}</div>
      <div className={styles.title}>
        {strategy.type === "reduce" ? t("pocket_strategy_reduce_title") : t("pocket_strategy_watch_title")}
      </div>
      <div className={styles.catRow}>
        <span className={styles.catIcon} style={{ background: cat.bg }}>{cat.icon}</span>
        <span className={styles.catLabel}>{catLabel}</span>
      </div>
      <div className={styles.desc}>
        {strategy.type === "reduce"
          ? `${t("pocket_strategy_reduce_desc_prefix")} ${formatRupiah(strategy.over)} ${t("pocket_strategy_reduce_desc_suffix")}`
          : `${t("pocket_strategy_watch_desc_prefix")} ${strategy.pct}% ${t("pocket_strategy_watch_desc_suffix")}`}
      </div>
      <button className={styles.actionBtn} onClick={() => router.push("/tabel")}>
        {t("pocket_strategy_cta")}
      </button>
    </div>
  );
}