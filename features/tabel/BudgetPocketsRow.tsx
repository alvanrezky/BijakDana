"use client";
import { useEffect, useState } from "react";
import { Budget, Category } from "@/types/models";
import { EXPENSE_CATEGORIES, getCategoryLabel, mergeWithCustom } from "@/lib/constants/categories";
import { getCustomCategories } from "@/lib/services/categories.service";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import styles from "./BudgetPocketsRow.module.css";

export default function BudgetPocketsRow({
  budget,
  byCategory,
  onSelectCategory,
}: {
  budget: Budget;
  byCategory: Record<string, number>;
  onSelectCategory: (catId: string) => void;
}) {
  const { t, lang } = useLanguage();
  const [customCats, setCustomCats] = useState<Category[]>([]);

  useEffect(() => {
    getCustomCategories("expense").then(setCustomCats);
  }, []);

  const allCategories = mergeWithCustom(EXPENSE_CATEGORIES, customCats);
  const activeCats = allCategories.filter((c) => budget[c.id] > 0);

  if (activeCats.length === 0) {
    return <div className={styles.empty}>{t("pocket_empty")}</div>;
  }

  // Semakin sedikit kategori, semakin lebar tiap kantong (fit penuh, tidak ada ruang kosong).
  const minWidth = activeCats.length <= 3 ? 220 : activeCats.length <= 6 ? 170 : 130;

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>{t("pocket_section_title")}</div>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))` }}>
        {activeCats.map((c) => {
          const spent = byCategory[c.id] || 0;
          const budgetAmt = budget[c.id];
          const pct = Math.min(100, Math.round((spent / budgetAmt) * 100));
          const over = spent > budgetAmt;
          return (
            <button key={c.id} className={styles.pocket} onClick={() => onSelectCategory(c.id)}>
              <div className={styles.pocketIcon} style={{ background: c.bg }}>{c.icon}</div>
              <div className={styles.pocketLabel}>{getCategoryLabel(c, lang)}</div>
              <div className={styles.pocketBarTrack}>
                <div
                  className={styles.pocketBarFill}
                  style={{ width: `${pct}%`, background: over ? "var(--red)" : c.color }}
                />
              </div>
              <div className={styles.pocketPct} style={{ color: over ? "var(--red)" : "var(--text2)" }}>{pct}%</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}