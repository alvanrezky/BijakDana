"use client";
import { Profile } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";

const dayKeys: DictKey[] = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu", "day_fri", "day_sat"];
const monthKeys: DictKey[] = [
  "month_1", "month_2", "month_3", "month_4", "month_5", "month_6",
  "month_7", "month_8", "month_9", "month_10", "month_11", "month_12",
];

export default function BerandaGreeting({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage();
  const now = new Date();

  return (
    <div style={{ marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
        {t("beranda_greeting")}, {profile?.name?.split(" ")[0] || "Pengguna"}! 👋
      </div>
      <div style={{ fontSize: 13, color: "var(--text2)" }}>
        {t(dayKeys[now.getDay()])}, {now.getDate()} {t(monthKeys[now.getMonth()])} {now.getFullYear()}
      </div>
    </div>
  );
}