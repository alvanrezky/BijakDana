"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import GaugeScore from "@/features/kesehatan/GaugeScore";
import ScoreTrendChart from "@/features/kesehatan/ScoreTrendChart";
import PillarBreakdown from "@/features/kesehatan/PillarBreakdown";
import PillarDrilldownModal from "@/features/kesehatan/PillarDrilldownModal";
import WhatIfSimulator from "@/features/kesehatan/WhatIfSimulator";
import AchievementsList from "@/features/kesehatan/AchievementsList";
import RecommendationsCard from "@/features/kesehatan/RecommendationsCard";
import PeerComparisonCard from "@/features/kesehatan/PeerComparisonCard";
import NotificationPrefCard from "@/features/kesehatan/NotificationPrefCard";
import { getTransactions } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { getProfile, saveProfile } from "@/lib/services/profile.service";
import { getGoals } from "@/lib/services/goals.service";
import { calcHealthScore, calcHealthScoreTrend, calcAchievements, weakestPillars, PillarKey } from "@/lib/business/healthScore";
import { calcEmergencyFund } from "@/lib/business/savings";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Budget, Profile, SavingsGoal } from "@/types/models";

export default function KesehatanPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<PillarKey | null>(null);

  async function loadAll() {
    const [tx, bud, prof, gls] = await Promise.all([getTransactions(), getBudget(), getProfile(), getGoals()]);
    setTransactions(tx);
    setBudget(bud);
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
        <Topbar titleKey="nav_kesehatan" />
        <main style={{ padding: 24 }}></main>
      </>
    );
  }

  const result = calcHealthScore(transactions, budget, profile, goals);
  const trend = calcHealthScoreTrend(transactions, budget, profile, goals);
  const achievements = calcAchievements(transactions, profile, goals, result);
  const weakest = weakestPillars(result.pillars, 2);
  const emergencyFund = calcEmergencyFund(transactions, profile);

  async function handleNotifPrefChange(pref: Profile["healthScoreNotifPref"]) {
    if (!profile) return;
    const updated = { ...profile, healthScoreNotifPref: pref };
    setProfile(updated);
    await saveProfile(updated);
  }

  return (
    <>
      <Topbar titleKey="nav_kesehatan" />
      <main style={{ padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{t("health_page_title")}</div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 20, lineHeight: 1.6 }}>{t("health_page_sub")}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_gauge_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>{t("health_gauge_sub")}</div>
            <GaugeScore result={result} />
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_trend_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_trend_sub")}</div>
            <ScoreTrendChart trend={trend} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_pillars_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_pillars_sub")}</div>
            <PillarBreakdown pillars={result.pillars} onSelectPillar={setSelectedPillar} />
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_ef_link_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_ef_link_sub")}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#3B82F6", marginBottom: 6 }}>{emergencyFund.pct}%</div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${emergencyFund.pct}%`, background: "#3B82F6", borderRadius: 20 }} />
            </div>
            <a href="/tabungan" style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, textDecoration: "none" }}>
              {t("health_ef_link_cta")} →
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_whatif_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_whatif_sub")}</div>
            <WhatIfSimulator current={result} />
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_rec_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_rec_sub")}</div>
            <RecommendationsCard weakest={weakest} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_achv_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_achv_sub")}</div>
            <AchievementsList achievements={achievements} />
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_notifpref_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_notifpref_sub")}</div>
            <NotificationPrefCard profile={profile} onChange={handleNotifPrefChange} />
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
          <PeerComparisonCard />
        </div>

        <div style={{ fontSize: 10.5, color: "var(--text3)", marginTop: 20, lineHeight: 1.6 }}>{t("health_methodology_note")}</div>
      </main>

      <PillarDrilldownModal
        pillarKey={selectedPillar}
        onClose={() => setSelectedPillar(null)}
        transactions={transactions}
        budget={budget}
      />
    </>
  );
}