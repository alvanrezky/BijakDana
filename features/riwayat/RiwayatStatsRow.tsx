"use client";
import styles from "./RiwayatStatsRow.module.css";
import { formatRupiah } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RiwayatStatsRow({
  income,
  expense,
  net,
  count,
}: {
  income: number;
  expense: number;
  net: number;
  count: number;
}) {
  const { t } = useLanguage();

  return (
    <div className={styles.srow}>
      <div className={styles.sc}>
        <div className={styles.scl}>{t("riwayat_stat_income")}</div>
        <div className={styles.scv} style={{ color: "var(--green)" }}>
          {formatRupiah(income)}
        </div>
      </div>
      <div className={styles.sc}>
        <div className={styles.scl}>{t("riwayat_stat_expense")}</div>
        <div className={styles.scv} style={{ color: "var(--red)" }}>
          {formatRupiah(expense)}
        </div>
      </div>
      <div className={styles.sc}>
        <div className={styles.scl}>{t("riwayat_stat_net")}</div>
        <div className={styles.scv} style={{ color: net >= 0 ? "var(--text)" : "var(--red)" }}>
          {formatRupiah(net)}
        </div>
      </div>
      <div className={styles.sc}>
        <div className={styles.scl}>{t("riwayat_stat_count")}</div>
        <div className={styles.scv}>{count}</div>
      </div>
    </div>
  );
}