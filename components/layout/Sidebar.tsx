"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getProfile } from "@/lib/services/profile.service";
import { Profile } from "@/types/models";
import BudgetModal from "@/components/modal/BudgetModal";
import { useTheme, ACCENTS } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./Sidebar.module.css";

const menuItems = [
  { key: "beranda", labelKey: "nav_beranda" as const, bottomLabelKey: "nav_bottombar_beranda" as const, path: "/beranda",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: "tabel", labelKey: "nav_tabel" as const, bottomLabelKey: "nav_bottombar_tabel" as const, path: "/tabel",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
  { key: "grafik", labelKey: "nav_grafik" as const, bottomLabelKey: "nav_bottombar_grafik" as const, path: "/grafik",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: "tabungan", labelKey: "nav_tabungan" as const, bottomLabelKey: "nav_bottombar_tabungan" as const, path: "/tabungan",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { key: "riwayat", labelKey: "nav_riwayat" as const, bottomLabelKey: "nav_bottombar_riwayat" as const, path: "/riwayat",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [accentPickerOpen, setAccentPickerOpen] = useState(false);
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const prof = await getProfile();
      setProfile(prof);
      setMounted(true);
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setAccentPickerOpen(false);
      }
    }
    if (accentPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accentPickerOpen]);

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const currentAccent = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];

  return (
    <>
      {/* ===== Sidebar desktop ===== */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/logo-bijakdana.png" alt="BijakDana" className={styles.logoMark} />
          <div>
            <div className={styles.logoName}>BijakDana</div>
            <div className={styles.logoTag}>{t("logo_tagline")}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>{t("nav_menu")}</div>
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
              onClick={() => router.push(item.path)}
            >
              {item.icon}
              {t(item.labelKey)}
            </button>
          ))}
          <div className={styles.navLabel}>{t("nav_account")}</div>
          <button
            className={`${styles.navItem} ${pathname === "/profil" ? styles.active : ""}`}
            onClick={() => router.push("/profil")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {t("nav_profil")}
          </button>
          <button className={styles.navItem} onClick={() => setBudgetOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
            {t("nav_budget")}
          </button>

          <div className={styles.themeToggleRow}>
            <span className={styles.themeToggleLabel}>
              {mode === "dark" ? "🌙" : "☀️"} {t("theme_dark_mode")}
            </span>
            <button
              className={`${styles.themeToggleBtn} ${mode === "dark" ? styles.on : ""}`}
              onClick={toggleMode}
              title={t("theme_dark_mode")}
            >
              <span className={styles.themeToggleKnob} />
            </button>
          </div>

          <div className={styles.themeToggleRow}>
            <span className={styles.themeToggleLabel}>🌐 {t("theme_language")}</span>
            <div className={styles.langSegment}>
              <div className={styles.langSlider} style={{ transform: lang === "en" ? "translateX(100%)" : "translateX(0)" }} />
              <button
                className={`${styles.langSegmentBtn} ${lang === "id" ? styles.langSegmentActive : ""}`}
                onClick={() => setLang("id")}
              >
                ID
              </button>
              <button
                className={`${styles.langSegmentBtn} ${lang === "en" ? styles.langSegmentActive : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>

          <div className={styles.accentWrap} ref={pickerRef}>
            <button
              className={styles.accentTrigger}
              onClick={() => setAccentPickerOpen((v) => !v)}
            >
              <span className={styles.accentTriggerDot} style={{ background: currentAccent.swatch }} />
              <span className={styles.accentTriggerText}>
                <span className={styles.accentTriggerLabel}>🎨 {t("theme_color")}</span>
                <span className={styles.accentTriggerValue}>{currentAccent.label}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
                style={{ transform: accentPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {accentPickerOpen && (
              <div className={styles.accentPopover}>
                <div className={styles.accentPopoverTitle}>{t("theme_pick_color")}</div>
                <div className={styles.accentGrid}>
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      className={accent === a.id ? styles.accentSwatchActive : styles.accentSwatch}
                      style={{ background: a.swatch }}
                      onClick={() => {
                        setAccent(a.id);
                        setAccentPickerOpen(false);
                      }}
                      title={a.label}
                    >
                      {accent === a.id && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {mounted && (
          <div className={styles.footer}>
            <div className={styles.profileChip} onClick={() => router.push("/profil")}>
              <div className={styles.profileAvatar}>{initials}</div>
              <div>
                <div className={styles.profileName}>{profile?.name || "Pengguna"}</div>
                <div className={styles.profilePlan}>{t("plan_active")}</div>
              </div>
            </div>
          </div>
        )}

        <BudgetModal open={budgetOpen} onClose={() => setBudgetOpen(false)} />
      </div>

      {/* ===== Bottom bar mobile ===== */}
      <nav className={styles.bottomBar}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.bottomBarItem} ${pathname === item.path ? styles.bottomBarActive : ""}`}
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            <span className={styles.bottomBarLabel}>{t(item.bottomLabelKey)}</span>
          </button>
        ))}
        <button
          className={`${styles.bottomBarItem} ${pathname === "/profil" ? styles.bottomBarActive : ""}`}
          onClick={() => router.push("/profil")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className={styles.bottomBarLabel}>{t("nav_bottombar_profil")}</span>
        </button>
      </nav>
    </>
  );
}