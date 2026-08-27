"use client";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils/format";
import { EmergencyFundResult } from "@/lib/business/savings";
import { calcGoalProgress } from "@/lib/business/goals";
import { Profile, SavingsGoal, Transaction } from "@/types/models";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import GoalModal from "./GoalModal";
import SavingsInitialModal from "./SavingsInitialModal";
import styles from "./TabunganSavingsGrid.module.css";

export default function TabunganSavingsGrid({
  emergencyFund,
  regularSavingsBalance,
  profile,
  goals,
  transactions,
  onTransfer,
  onWithdraw,
  onGoalsChanged,
  onProfileSaved,
}: {
  emergencyFund: EmergencyFundResult;
  regularSavingsBalance: number;
  profile: Profile;
  goals: SavingsGoal[];
  transactions: Transaction[];
  onTransfer: (target: { cat?: string; goalId?: string; goalLabel?: string }) => void;
  onWithdraw: (target: { cat?: string; goalId?: string; goalLabel?: string }) => void;
  onGoalsChanged: () => void;
  onProfileSaved: (updated: Profile) => void;
}) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [initialModalOpen, setInitialModalOpen] = useState(false);

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
          <div className={styles.headerActions}>
            <button className={styles.jbtn} style={{ background: "#3B82F6" }} onClick={() => onTransfer({ cat: "danadrt" })}>
              {t("jar_transfer_btn")}
            </button>
            <button className={styles.jbtnOutline} onClick={() => onWithdraw({ cat: "danadrt" })}>
              {t("jar_withdraw_btn")}
            </button>
          </div>
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

      {/* Tabungan Biasa — TANPA target, cuma saldo berjalan */}
      <div className={styles.jcard}>
        <div className={styles.jheader}>
          <div className={styles.jico} style={{ background: "#FEF3C7" }}>🏦</div>
          <div className={styles.headerActions}>
            <button className={styles.jbtn} style={{ background: "#F59E0B" }} onClick={() => onTransfer({ cat: "tabungan" })}>
              {t("jar_transfer_btn")}
            </button>
            <button className={styles.jbtnOutline} onClick={() => onWithdraw({ cat: "tabungan" })}>
              {t("jar_withdraw_btn")}
            </button>
            <button className={styles.editBtn} onClick={() => setInitialModalOpen(true)} title={t("savings_initial_edit_btn")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.jtitle}>{t("jar_savings_title")}</div>
        <div className={styles.jsub}>{t("jar_savings_sub")}</div>

        <div className={styles.balanceDisplay}>
          <div className={styles.balanceLabel}>{t("jar_balance_label")}</div>
          <div className={styles.balanceValue}>{formatRupiah(regularSavingsBalance)}</div>
        </div>

        {profile.savingsInitial > 0 && (
          <div className={styles.initialNote}>
            {t("savings_initial_note_prefix")} {formatRupiah(profile.savingsInitial)}
          </div>
        )}
      </div>

      {/* Target custom */}
      {goals.map((goal) => {
        const progress = calcGoalProgress(goal, transactions);
        return (
          <div key={goal.id} className={styles.jcard}>
            <div className={styles.jheader}>
              <div className={styles.jico} style={{ background: "#F5F3FF" }}>🎯</div>
              <div className={styles.headerActions}>
                <button className={styles.jbtn} style={{ background: "#8B5CF6" }} onClick={() => onTransfer({ goalId: goal.id, goalLabel: goal.name })}>
                  {t("jar_transfer_btn")}
                </button>
                <button className={styles.jbtnOutline} onClick={() => onWithdraw({ goalId: goal.id, goalLabel: goal.name })}>
                  {t("jar_withdraw_btn")}
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

      <button className={styles.addCard} onClick={handleAddNew}>
        <div className={styles.addIcon}>+</div>
        <div className={styles.addLabel}>{t("goals_add_btn")}</div>
      </button>

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={onGoalsChanged} editGoal={editingGoal} />
      <SavingsInitialModal
        open={initialModalOpen}
        onClose={() => setInitialModalOpen(false)}
        onSaved={onProfileSaved}
        profile={profile}
      />
    </div>
  );
}