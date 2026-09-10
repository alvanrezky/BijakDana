"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getNotifications, markAllNotificationsRead, NotificationRow } from "@/lib/notifications/notifications.service";
import styles from "./NotificationPanel.module.css";

const BODY_TRUNCATE_LENGTH = 90;

function routeForType(type: string): string | null {
  if (type === "health_score") return "/kesehatan";
  if (type === "budget_exceeded") return "/tabel";
  return null;
}

export default function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  function handleClickItem(n: NotificationRow) {
    const route = routeForType(n.type);
    if (route) {
      router.push(route);
      onClose();
    }
  }

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
                {notifs.map((n) => {
                  const clickable = routeForType(n.type) !== null;
                  const isLong = n.body.length > BODY_TRUNCATE_LENGTH;
                  const isExpanded = expandedIds.has(n.id);
                  const displayBody = isLong && !isExpanded ? n.body.slice(0, BODY_TRUNCATE_LENGTH) + "..." : n.body;

                  return (
                    <div
                      key={n.id}
                      className={styles.item}
                      style={clickable ? { cursor: "pointer" } : undefined}
                      onClick={() => clickable && handleClickItem(n)}
                    >
                      <div className={styles.itemTitle}>{n.title}</div>
                      <div className={styles.itemBody}>{displayBody}</div>
                      {isLong && (
                        <button className={styles.expandBtn} onClick={(e) => toggleExpand(n.id, e)}>
                          {isExpanded ? t("notif_show_less") : t("notif_show_more")}
                        </button>
                      )}
                      <div className={styles.itemTime}>
                        {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}