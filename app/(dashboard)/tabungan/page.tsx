"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import TabunganSavingsGrid from "@/features/tabungan/TabunganSavingsGrid";
import TabunganPerbandingan from "@/features/tabungan/TabunganPerbandingan";
import TabunganEdukasi from "@/features/tabungan/TabunganEdukasi";
import TransactionModal from "@/components/modal/TransactionModal";
import { getTransactions } from "@/lib/services/transactions.service";
import { getProfile, saveProfile } from "@/lib/services/profile.service";
import { getGoals } from "@/lib/services/goals.service";
import { calcEmergencyFund, calcRegularSavingsBalance } from "@/lib/business/savings";
import { monthKey } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Profile, SavingsGoal, TxType } from "@/types/models";

interface TransferTarget {
  cat?: string;
  goalId?: string;
  goalLabel?: string;
  direction: TxType;
}

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
  const regularSavingsBalance = calcRegularSavingsBalance(transactions, profile);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const savingsThisMonth = transactions
    .filter((t) => t.type === "expense" && t.cat === "tabungan" && !t.goalId && monthKey(t.date) === currentMonthKey)
    .reduce((s, t) => s + t.amount, 0);
  const savingTarget = profile.savingTarget || 0;
  const savingsPct = savingTarget > 0 ? Math.min(100, Math.round((savingsThisMonth / savingTarget) * 100)) : 0;

  function openTransfer(target: { cat?: string; goalId?: string; goalLabel?: string }) {
    setTransferTarget({ ...target, direction: "expense" });
    setModalOpen(true);
  }

  function openWithdraw(target: { cat?: string; goalId?: string; goalLabel?: string }) {
    setTransferTarget({ ...target, direction: "income" });
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setTransferTarget(null);
  }

  async function handleProfileSaved(updated: Profile) {
    await saveProfile(updated);
    await loadAll();
  }

  return (
    <>
      <Topbar titleKey="nav_tabungan" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{t("tabungan_page_title")}</div>

        <TabunganSavingsGrid
          emergencyFund={emergencyFund}
          regularSavingsBalance={regularSavingsBalance}
          profile={profile}
          goals={goals}
          transactions={transactions}
          onTransfer={openTransfer}
          onWithdraw={openWithdraw}
          onGoalsChanged={loadAll}
          onProfileSaved={handleProfileSaved}
        />

        <TabunganPerbandingan defaultMonthly={profile.savingTarget || 0} />

        <TabunganEdukasi emergencyFund={emergencyFund} savingsPct={savingsPct} />
      </main>

      <TransactionModal
        key={`${transferTarget?.goalId || transferTarget?.cat || "default"}-${transferTarget?.direction || "expense"}`}
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={loadAll}
        editTx={null}
        presetCat={transferTarget?.cat}
        presetGoalId={transferTarget?.goalId}
        presetGoalLabel={transferTarget?.goalLabel}
        presetType={transferTarget?.direction}
      />
    </>
  );
}