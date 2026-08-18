"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import TabunganSavingsGrid from "@/features/tabungan/TabunganSavingsGrid";
import TabunganPerbandingan from "@/features/tabungan/TabunganPerbandingan";
import TabunganEdukasi from "@/features/tabungan/TabunganEdukasi";
import TransactionModal from "@/components/modal/TransactionModal";
import { getTransactions } from "@/lib/services/transactions.service";
import { getProfile } from "@/lib/services/profile.service";
import { getGoals } from "@/lib/services/goals.service";
import { calcEmergencyFund } from "@/lib/business/savings";
import { monthKey } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Profile, SavingsGoal } from "@/types/models";

type TransferTarget =
  | { kind: "cat"; cat: string }
  | { kind: "goal"; goalId: string; goalLabel: string };

export default function TabunganPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(null);

  async function loadAll() {
    const [tx, prof, gls] = await Promise.all([getTransactions(), getProfile(), getGoals()]);
    setTransactions(tx);
    setProfile(prof);
    setGoals(gls);
  }

  useEffect(() => {
    (async () => {
      await loadAll();
      setMounted(true);
    })();
  }, []);

  if (!mounted || !profile) {
    return (
      <>
        <Topbar titleKey="nav_tabungan" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  const emergencyFund = calcEmergencyFund(transactions, profile);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const savingsTx = transactions.filter((t) => t.type === "expense" && t.cat === "tabungan" && !t.goalId);
  const savingsTotal = savingsTx.reduce((s, t) => s + t.amount, 0);
  const savingsThisMonth = savingsTx
    .filter((t) => monthKey(t.date) === currentMonthKey)
    .reduce((s, t) => s + t.amount, 0);

  const savingTarget = profile.savingTarget || 0;
  const savingsPct = savingTarget > 0 ? Math.min(100, Math.round((savingsThisMonth / savingTarget) * 100)) : 0;

  function openTransferModal(target: TransferTarget) {
    setTransferTarget(target);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setTransferTarget(null);
  }

  const presetCat = transferTarget?.kind === "cat" ? transferTarget.cat : undefined;
  const presetGoalId = transferTarget?.kind === "goal" ? transferTarget.goalId : undefined;
  const presetGoalLabel = transferTarget?.kind === "goal" ? transferTarget.goalLabel : undefined;

  return (
    <>
      <Topbar titleKey="nav_tabungan" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{t("tabungan_page_title")}</div>

        <TabunganSavingsGrid
          emergencyFund={emergencyFund}
          profile={profile}
          savingsThisMonth={savingsThisMonth}
          savingsTotal={savingsTotal}
          goals={goals}
          transactions={transactions}
          onTransferDanaDarurat={() => openTransferModal({ kind: "cat", cat: "danadrt" })}
          onTransferTabungan={() => openTransferModal({ kind: "cat", cat: "tabungan" })}
          onTransferGoal={(goal) => openTransferModal({ kind: "goal", goalId: goal.id, goalLabel: goal.name })}
          onGoalsChanged={loadAll}
        />

        <TabunganPerbandingan defaultMonthly={profile.savingTarget || 0} />

        <TabunganEdukasi emergencyFund={emergencyFund} savingsPct={savingsPct} />
      </main>

      <TransactionModal
        key={presetGoalId || presetCat || "default"}
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={loadAll}
        editTx={null}
        presetCat={presetCat}
        presetGoalId={presetGoalId}
        presetGoalLabel={presetGoalLabel}
      />
    </>
  );
}