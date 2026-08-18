"use client";
import styles from "./ProfilHeaderCard.module.css";
import { Profile } from "@/types/models";

function getInitials(name?: string) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilHeaderCard({ profile }: { profile: Profile }) {
  return (
    <div className={styles.headCard}>
      <div className={styles.avatar}>{getInitials(profile.name)}</div>
      <div className={styles.name}>{profile.name || "—"}</div>
      <div className={styles.email}>{profile.email || "—"}</div>
      <span className={styles.planBadge}>✓ Paket Tahunan · Aktif</span>
    </div>
  );
}