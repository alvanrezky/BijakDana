"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getNotifications, markAllNotificationsRead, NotificationRow } from "@/lib/notifications/notifications.service";
import styles from "./NotificationPanel.module.css";

export default function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const data = await getNotifications();
      setNotifs(data);
      setLoading(false);
      await markAllNotificationsRead();
    })();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.header}>
              <span className={styles.title}>{t("notif_title")}</span>
              <button className={styles.closeBtn} onClick={onClose} title={t("btn_close")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className={styles.body}>
                <div className={styles.emptyDesc}>...</div>
              </div>
            ) : notifs.length === 0 ? (
              <div className={styles.body}>
                <div className={styles.emptyIcon}>🔔</div>
                <div className={styles.emptyTitle}>{t("notif_empty_title")}</div>
                <div className={styles.emptyDesc}>{t("notif_empty_desc")}</div>
              </div>
            ) : (
              <div className={styles.list}>
                {notifs.map((n) => (
                  <div key={n.id} className={styles.item}>
                    <div className={styles.itemTitle}>{n.title}</div>
                    <div className={styles.itemBody}>{n.body}</div>
                    <div className={styles.itemTime}>
                      {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}