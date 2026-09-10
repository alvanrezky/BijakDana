"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import ProfilHeaderCard from "@/features/profil/ProfilHeaderCard";
import ProfilSubscriptionCard from "@/features/profil/ProfilSubscriptionCard";
import ProfilMenuList from "@/features/profil/ProfilMenuList";
import IncomeModal from "@/features/profil/IncomeModal";
import SubscriptionModal from "@/features/profil/SubscriptionModal";
import BudgetModal from "@/components/modal/BudgetModal";
import { getProfile, saveProfile } from "@/lib/services/profile.service";
import { deleteAllTransactions } from "@/lib/services/transactions.service";
import { deleteAllBudgets } from "@/lib/services/budget.service";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Profile } from "@/types/models";
import AppearanceSettingsCard from "@/features/profil/AppearanceSettingsCard";
import TokenPurchaseModal from "@/features/profil/TokenPurchaseModal";

export default function ProfilPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  async function loadAll() {
    const prof = await getProfile();
    setProfile(prof);
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
        <Topbar titleKey="nav_profil" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  async function handleIncomeSaved(updated: Profile) {
    await saveProfile(updated);
    await loadAll();
  }

  async function handleResetData() {
    if (!profile) return;
    setResetting(true);
    await deleteAllTransactions();
    await deleteAllBudgets();
    await saveProfile({
      ...profile,
      income: 0,
      incomeType: "Gaji tetap",
      dependents: "",
      savingTarget: 0,
      emergencyFundCurrent: 0,
      emergencyFundTarget: 0,
    });
    location.reload();
  }

  return (
    <>
      <Topbar titleKey="nav_profil" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>{t("profil_page_title")}</div>

        <ProfilHeaderCard profile={profile} />
        <AppearanceSettingsCard />
        <ProfilSubscriptionCard onExtend={() => setSubModalOpen(true)} />
          <div
            style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}
          >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t("token_card_title")}</div>
              <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 3 }}>
                {t("token_current_balance")} <strong>{profile.aiTokenBalance.toLocaleString("id-ID")}</strong>
              </div>
            </div>
            <button
              onClick={() => setTokenModalOpen(true)}
              style={{
                background: "var(--green)", color: "#fff", border: "none", borderRadius: 8,
                padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {t("token_buy_btn_short")}
            </button>
          </div>
        </div>

        <ProfilMenuList
          onOpenBudget={() => setBudgetModalOpen(true)}
          onOpenIncome={() => setIncomeModalOpen(true)}
          onResetData={handleResetData}
        />

        {resetting && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text2)", marginTop: 12 }}>
            {t("profil_resetting")}
          </div>
        )}
      </main>

      <IncomeModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSaved={handleIncomeSaved}
        profile={profile}
      />

      <BudgetModal open={budgetModalOpen} onClose={() => setBudgetModalOpen(false)} />
      <SubscriptionModal open={subModalOpen} onClose={() => setSubModalOpen(false)} />
      <TokenPurchaseModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} currentBalance={profile.aiTokenBalance} onPurchased={() => loadAll()} />
    </>
  );
}