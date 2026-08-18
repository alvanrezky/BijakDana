"use client";
import styles from "./ThemeSettingsCard.module.css";
import { useTheme, ACCENTS } from "@/lib/theme/ThemeContext";

export default function ThemeSettingsCard() {
  const { mode, accent, setMode, setAccent } = useTheme();

  return (
    <div className={styles.card}>
      <div className={styles.title}>🎨 Tampilan</div>

      <div className={styles.row}>
        <span className={styles.label}>Mode gelap</span>
        <button
          className={mode === "dark" ? styles.toggleOn : styles.toggleOff}
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>

      <div className={styles.label} style={{ marginBottom: 10 }}>
        Warna aksen
      </div>
      <div className={styles.accentGrid}>
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            className={accent === a.id ? styles.swatchActive : styles.swatch}
            style={{ background: a.swatch }}
            onClick={() => setAccent(a.id)}
            title={a.label}
          >
            {accent === a.id && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="16" height="16">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}