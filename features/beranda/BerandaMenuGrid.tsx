"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DictKey } from "@/lib/i18n/dictionary";
import styles from "./BerandaMenuGrid.module.css";

const menu: { path: string; titleKey: DictKey; descKey: DictKey; bg: string; color: string; icon: React.ReactNode }[] = [
  {
    path: "/tabel", titleKey: "beranda_menu_tabel_title", descKey: "beranda_menu_tabel_desc",
    bg: "#E6F7F2", color: "#15795A",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  },
  {
    path: "/grafik", titleKey: "beranda_menu_grafik_title", descKey: "beranda_menu_grafik_desc",
    bg: "#EFF6FF", color: "#3B82F6",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    path: "/tabungan", titleKey: "beranda_menu_tabungan_title", descKey: "beranda_menu_tabungan_desc",
    bg: "#FEF3C7", color: "#F59E0B",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    path: "/riwayat", titleKey: "beranda_menu_riwayat_title", descKey: "beranda_menu_riwayat_desc",
    bg: "#F5F3FF", color: "#8B5CF6",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
];

export default function BerandaMenuGrid() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className={styles.grid}>
      {menu.map((item, i) => (
        <motion.div
          key={item.path}
          className={styles.card}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          onClick={() => router.push(item.path)}
        >
          <div className={styles.icon} style={{ background: item.bg, color: item.color }}>
            {item.icon}
          </div>
          <div className={styles.title}>{t(item.titleKey)}</div>
          <div className={styles.desc}>{t(item.descKey)}</div>
          <div className={styles.foot}>
            <span>
              {t("beranda_menu_open_prefix")} {t(item.titleKey).split(" ")[0].toLowerCase()}
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
}