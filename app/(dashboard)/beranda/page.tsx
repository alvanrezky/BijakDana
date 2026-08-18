"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import BerandaGreeting from "@/features/beranda/BerandaGreeting";
import BerandaBalanceCard from "@/features/beranda/BerandaBalanceCard";
import BerandaAlerts from "@/features/beranda/BerandaAlerts";
import BerandaMenuGrid from "@/features/beranda/BerandaMenuGrid";
import BerandaRecentTx from "@/features/beranda/BerandaRecentTx";
import OnboardingWizard from "@/features/onboarding/OnboardingWizard";
import { getTransactions } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { getProfile } from "@/lib/services/profile.service";
import { calcStats } from "@/lib/business/stats";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Budget, Profile } from "@/types/models";

export default function BerandaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadAll() {
    const [tx, bud, prof] = await Promise.all([getTransactions(), getBudget(), getProfile()]);
    setTransactions(tx);
    setBudget(bud);
    setProfile(prof);
  }

  useEffect(() => {
    (async () => {
      await loadAll();
      setMounted(true);
    })();
  }, []);

  if (!mounted) {
    return (
      <>
        <Topbar titleKey="nav_beranda" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  if (!profile || !profile.onboarded) {
    return <OnboardingWizard onFinish={loadAll} />;
  }

  const stats = calcStats(transactions, "bulan");

  return (
    <>
      <Topbar titleKey="nav_beranda" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <BerandaGreeting profile={profile} />
        <BerandaBalanceCard stats={stats} income={profile.income} />
        <BerandaAlerts stats={stats} budget={budget} />

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
          {t("beranda_menu_question")}
        </div>
        <BerandaMenuGrid />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{t("beranda_recent_tx")}</span>
          <button
            onClick={() => router.push("/riwayat")}
            style={{ background: "none", border: "none", color: "#1d9e75", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            {t("beranda_see_all")}
          </button>
        </div>
        <BerandaRecentTx transactions={transactions} budget={budget} byCategory={stats.byCategory} />
      </main>
    </>
  );
}