"use client";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ percent, color = "#1D9E75" }: { percent: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: clamped + "%", background: color }} />
    </div>
  );
}