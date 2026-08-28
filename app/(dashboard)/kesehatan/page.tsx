"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import GaugeScore from "@/features/kesehatan/GaugeScore";
import ScoreTrendChart from "@/features/kesehatan/ScoreTrendChart";
import MonthlyNarrativeCard from "@/features/kesehatan/MonthlyNarrativeCard";
import ScoreContributionBreakdown from "@/features/kesehatan/ScoreContributionBreakdown";
import PillarBreakdown from "@/features/kesehatan/PillarBreakdown";
import PillarDrilldownModal from "@/features/kesehatan/PillarDrilldownModal";
import AchievementsList from "@/features/kesehatan/AchievementsList";
import RecommendationsCard from "@/features/kesehatan/RecommendationsCard";
import PeerComparisonCard from "@/features/kesehatan/PeerComparisonCard";
import NotificationPrefCard from "@/features/kesehatan/NotificationPrefCard";
import { getTransactions } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { getProfile, saveProfile } from "@/lib/services/profile.service";
import { getGoals } from "@/lib/services/goals.service";
import {
  calcHealthScore,
  calcHealthScoreTrend,
  calcAchievements,
  weakestPillars,
  compareMonths,
  effectiveMonthEndDate,
  PillarKey,
  PillarScore,
} from "@/lib/business/healthScore";
import { monthKey, monthLabel } from "@/lib/utils/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Transaction, Budget, Profile, SavingsGoal } from "@/types/models";

export default function KesehatanPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<PillarScore | null>(null);

  const now = new Date();
  const currentMonthKeyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentMonthKeyStr);

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

  const [selYear, selMonth] = selectedMonthKey.split("-").map(Number);
  const referenceDate = effectiveMonthEndDate(selYear, selMonth - 1);

  const prevMonthDate = new Date(selYear, selMonth - 2, 1);
  const prevReferenceDate = effectiveMonthEndDate(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
  const hasPrevData = transactions.some((tx) => new Date(tx.date) <= prevReferenceDate);

  const result = calcHealthScore(transactions, budget, profile, goals, referenceDate);
  const previousResult = hasPrevData ? calcHealthScore(transactions, budget, profile, goals, prevReferenceDate) : null;
  const comparison = compareMonths(result, previousResult);

  const trend = calcHealthScoreTrend(transactions, budget, profile, goals, referenceDate);
  const achievements = calcAchievements(transactions, profile, goals, result);
  const weakest = weakestPillars(result.pillars, 2);

  const monthKeySet = new Set(transactions.map((tx) => monthKey(tx.date)));
  monthKeySet.add(currentMonthKeyStr);
  const availableMonths = Array.from(monthKeySet)
    .sort()
    .reverse()
    .map((key) => ({ key, label: monthLabel(key) }));

  const currentMonthLabel = monthLabel(selectedMonthKey);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{t("health_page_title")}</div>
          <select
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            style={{
              border: "1px solid var(--border)",
              background: "var(--card)",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12.5,
              fontFamily: "inherit",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            {availableMonths.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 20, lineHeight: 1.6 }}>{t("health_page_sub")}</div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", marginBottom: 16 }}>
          <MonthlyNarrativeCard current={result} comparison={comparison} monthLabel={currentMonthLabel} />
        </div>

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

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_contribution_title")}</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_contribution_sub")}</div>
          <ScoreContributionBreakdown pillars={result.pillars} overall={result.overall} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t("health_pillars_title")}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 14 }}>{t("health_pillars_sub")}</div>
            <PillarBreakdown pillars={result.pillars} onSelectPillar={(key: PillarKey) => setSelectedPillar(result.pillars.find((p) => p.key === key) || null)} />
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
        pillar={selectedPillar}
        referenceDate={referenceDate}
        onClose={() => setSelectedPillar(null)}
        transactions={transactions}
        budget={budget}
      />
    </>
  );
}