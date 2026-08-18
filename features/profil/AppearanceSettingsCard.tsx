"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme, ACCENTS } from "@/lib/theme/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./AppearanceSettingsCard.module.css";

export default function AppearanceSettingsCard() {
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [accentPickerOpen, setAccentPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setAccentPickerOpen(false);
      }
    }
    if (accentPickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accentPickerOpen]);

  const currentAccent = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];

  return (
    <div className={styles.card}>
      <div className={styles.title}>🎨 Tampilan</div>

      <div className={styles.row}>
        <span className={styles.label}>{mode === "dark" ? "🌙" : "☀️"} {t("theme_dark_mode")}</span>
        <button className={`${styles.toggleBtn} ${mode === "dark" ? styles.on : ""}`} onClick={toggleMode}>
          <span className={styles.toggleKnob} />
        </button>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>🌐 {t("theme_language")}</span>
        <div className={styles.langSegment}>
          <div className={styles.langSlider} style={{ transform: lang === "en" ? "translateX(100%)" : "translateX(0)" }} />
          <button className={`${styles.langBtn} ${lang === "id" ? styles.langBtnActive : ""}`} onClick={() => setLang("id")}>ID</button>
          <button className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`} onClick={() => setLang("en")}>EN</button>
        </div>
      </div>

      <div className={styles.accentWrap} ref={pickerRef}>
        <button className={styles.accentTrigger} onClick={() => setAccentPickerOpen((v) => !v)}>
          <span className={styles.accentDot} style={{ background: currentAccent.swatch }} />
          <span className={styles.accentText}>
            <span className={styles.accentLabel}>{t("theme_color")}</span>
            <span className={styles.accentValue}>{currentAccent.label}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: accentPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
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
                  className={accent === a.id ? styles.swatchActive : styles.swatch}
                  style={{ background: a.swatch }}
                  onClick={() => { setAccent(a.id); setAccentPickerOpen(false); }}
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
    </div>
  );
}