"use client";
import { useRouter } from "next/navigation";
import styles from "./ProfilMenuList.module.css";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProfilMenuList({
  onOpenBudget,
  onOpenIncome,
  onResetData,
}: {
  onOpenBudget: () => void;
  onOpenIncome: () => void;
  onResetData: () => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className={styles.mlist}>
      <div className={styles.mli} onClick={onOpenBudget}>
        <div className={styles.mlico} style={{ background: "#E6F7F2" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#15795A" strokeWidth="2" width="17" height="17">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
          </svg>
        </div>
        <span className={styles.mllbl}>{t("profil_menu_budget")}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="15" height="15">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <div className={styles.mli} onClick={onOpenIncome}>
        <div className={styles.mlico} style={{ background: "#EFF6FF" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" width="17" height="17">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>
        <span className={styles.mllbl}>{t("profil_menu_income")}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="15" height="15">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <div className={styles.mli} onClick={() => router.push("/logout")}>
        <div className={styles.mlico} style={{ background: "#F3F4F6" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" width="17" height="17">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <span className={styles.mllbl}>{t("profil_menu_logout")}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="15" height="15">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <div
        className={styles.mli}
        onClick={() => {
          if (confirm(t("profil_reset_confirm"))) onResetData();
        }}
      >
        <div className={styles.mlico} style={{ background: "#FEF2F2" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" width="17" height="17">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
        </div>
        <span className={styles.mllbl} style={{ color: "#EF4444" }}>
          {t("profil_menu_reset")}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="15" height="15">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}