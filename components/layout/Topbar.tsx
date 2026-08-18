"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/services/profile.service";
import { getUnreadCount } from "@/lib/notifications/notifications.service";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import NotificationPanel from "@/features/notifications/NotificationPanel";
import styles from "./Topbar.module.css";

export default function Topbar({ titleKey }: { titleKey: DictKey }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [initials, setInitials] = useState("?");
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (profile?.name) {
        const computed = profile.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setInitials(computed);
      }
      const count = await getUnreadCount();
      setUnread(count);
    })();
  }, []);

  function handleBellClick() {
    setNotifOpen((v) => !v);
    if (!notifOpen) setUnread(0);
  }

  return (
    <header className={styles.topbar}>
      <span className={styles.title}>{t(titleKey)}</span>
      <div className={styles.right}>
        <button className={styles.bellBtn} onClick={handleBellClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unread > 0 && <span className={styles.dot}></span>}
        </button>
        <div className={styles.avatar} onClick={() => router.push("/profil")} style={{ cursor: "pointer" }}>
          {initials}
        </div>
      </div>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}