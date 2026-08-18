"use client";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils/format";
import { EmergencyFundResult } from "@/lib/business/savings";
import { calcGoalProgress } from "@/lib/business/goals";
import { Profile, SavingsGoal, Transaction } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import GoalModal from "./GoalModal";
import styles from "./TabunganSavingsGrid.module.css";

export default function TabunganSavingsGrid({
  emergencyFund,
  profile,
  savingsThisMonth,
  savingsTotal,
  goals,
  transactions,
  onTransferDanaDarurat,
  onTransferTabungan,
  onTransferGoal,
  onGoalsChanged,
}: {
  emergencyFund: EmergencyFundResult;
  profile: Profile;
  savingsThisMonth: number;
  savingsTotal: number;
  goals: SavingsGoal[];
  transactions: Transaction[];
  onTransferDanaDarurat: () => void;
  onTransferTabungan: () => void;
  onTransferGoal: (goal: SavingsGoal) => void;
  onGoalsChanged: () => void;
}) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const savingTarget = profile.savingTarget || 0;
  const savingsPct = savingTarget > 0 ? Math.min(100, Math.round((savingsTotal / savingTarget) * 100)) : 0;

  function handleAddNew() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function handleEditGoal(goal: SavingsGoal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  return (
    <div className={styles.jgrid}>
      {/* Dana Darurat */}
      <div className={styles.jcard}>
        <div className={styles.jheader}>
          <div className={styles.jico} style={{ background: "#EFF6FF" }}>🛡️</div>
          <button className={styles.jbtn} style={{ background: "#3B82F6" }} onClick={onTransferDanaDarurat}>
            {t("jar_transfer_btn")}
          </button>
        </div>
        <div className={styles.jtitle}>{t("jar_emergency_title")}</div>
        <div className={styles.jsub}>{emergencyFund.basis === "income" ? t("ef_basis_income") : t("ef_basis_expense")}</div>
        <div className={styles.jpct}>{emergencyFund.pct}%</div>
        <div className={styles.pbar}>
          <div className={styles.pfill} style={{ width: `${emergencyFund.pct}%`, background: "#3B82F6" }} />
        </div>
        <div className={styles.jamts}>
          <span>{t("jar_collected")} <strong>{formatRupiah(emergencyFund.current)}</strong></span>
          <span>{t("jar_target")} <strong>{formatRupiah(emergencyFund.target)}</strong></span>
        </div>
        <div className={styles.jproj}>
          {emergencyFund.current >= emergencyFund.target ? (
            t("ef_achieved")
          ) : (
            <>
              {t("ef_projection_prefix")} {formatRupiah(Math.round(emergencyFund.monthlySavingNeeded))}
              {t("ef_projection_middle")} {emergencyFund.monthsToTarget} {t("ef_projection_suffix")}
            </>
          )}
        </div>
      </div>

      {/* Tabungan Biasa */}
      <div className={styles.jcard}>
        <div className={styles.jheader}>
          <div className={styles.jico} style={{ background: "#FEF3C7" }}>🏦</div>
          <button className={styles.jbtn} style={{ background: "#F59E0B" }} onClick={onTransferTabungan}>
            {t("jar_transfer_btn")}
          </button>
        </div>
        <div className={styles.jtitle}>{t("jar_savings_title")}</div>
        <div className={styles.jsub}>
          {t("jar_savings_sub")} · {t("jar_this_month")} <strong>{formatRupiah(savingsThisMonth)}</strong>
        </div>
        <div className={styles.jpct}>{savingsPct}%</div>
        <div className={styles.pbar}>
          <div className={styles.pfill} style={{ width: `${savingsPct}%`, background: "#F59E0B" }} />
        </div>
        <div className={styles.jamts}>
          <span>{t("jar_recorded")} <strong>{formatRupiah(savingsTotal)}</strong></span>
          <span>
            {t("jar_target_per_month")} <strong>{formatRupiah(savingTarget)}{t("jar_per_month_suffix")}</strong>
          </span>
        </div>
        <div className={styles.jproj}>
          {savingTarget === 0
            ? t("savings_set_target")
            : savingsTotal >= savingTarget
            ? t("savings_achieved")
            : (
              <>
                {t("savings_remaining_prefix")} {formatRupiah(savingTarget - savingsTotal)} {t("savings_remaining_suffix")}
              </>
            )}
        </div>
      </div>

      {/* Target custom */}
      {goals.map((goal) => {
        const progress = calcGoalProgress(goal, transactions);
        return (
          <div key={goal.id} className={styles.jcard}>
            <div className={styles.jheader}>
              <div className={styles.jico} style={{ background: "#F5F3FF" }}>🎯</div>
              <div className={styles.headerActions}>
                <button className={styles.jbtn} style={{ background: "#8B5CF6" }} onClick={() => onTransferGoal(goal)}>
                  {t("jar_transfer_btn")}
                </button>
                <button className={styles.editBtn} onClick={() => handleEditGoal(goal)} title={t("btn_edit")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.jtitle}>{goal.name}</div>
            <div className={styles.jsub}>
              {progress.monthsRemaining > 0
                ? t("goal_months_left").replace("{n}", String(progress.monthsRemaining))
                : !progress.achieved
                ? t("goal_overdue")
                : "\u00A0"}
            </div>
            <div className={styles.jpct}>{progress.pct}%</div>
            <div className={styles.pbar}>
              <div className={styles.pfill} style={{ width: `${progress.pct}%`, background: "#8B5CF6" }} />
            </div>
            <div className={styles.jamts}>
              <span>{t("jar_collected")} <strong>{formatRupiah(progress.current)}</strong></span>
              <span>{t("jar_target")} <strong>{formatRupiah(goal.targetAmount)}</strong></span>
            </div>
            <div className={styles.jproj}>
              {progress.achieved ? (
                t("goal_achieved")
              ) : progress.monthsRemaining > 0 ? (
                <>
                  {t("ef_projection_prefix")} {formatRupiah(Math.round(progress.monthlyNeeded))}
                  {t("ef_projection_middle")} {progress.monthsRemaining} {t("ef_projection_suffix")}
                </>
              ) : (
                t("goal_overdue")
              )}
            </div>
          </div>
        );
      })}

      {/* Tombol tambah target — kartu dashed, ikut alur grid yang sama */}
      <button className={styles.addCard} onClick={handleAddNew}>
        <div className={styles.addIcon}>+</div>
        <div className={styles.addLabel}>{t("goals_add_btn")}</div>
      </button>

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={onGoalsChanged} editGoal={editingGoal} />
    </div>
  );
}