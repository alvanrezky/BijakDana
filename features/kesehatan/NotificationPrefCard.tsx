"use client";
import { Profile } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./NotificationPrefCard.module.css";

export default function NotificationPrefCard({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (pref: Profile["healthScoreNotifPref"]) => void;
}) {
  const { t } = useLanguage();

  const options: { value: Profile["healthScoreNotifPref"]; labelKey: any }[] = [
    { value: "monthly", labelKey: "notifpref_monthly" },
    { value: "on_drop", labelKey: "notifpref_on_drop" },
    { value: "off", labelKey: "notifpref_off" },
  ];

  return (
    <div className={styles.list}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={profile.healthScoreNotifPref === opt.value ? styles.optionActive : styles.option}
          onClick={() => onChange(opt.value)}
        >
          <span className={styles.radio}>{profile.healthScoreNotifPref === opt.value && <span className={styles.radioDot} />}</span>
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}