"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Fab from "@/components/layout/Fab";
import HelpdeskPanel from "@/features/heldesk/HelpdeskPanel";
import AiChatPanel from "@/features/ai-chat/AiChatPanel";
import { isLoggedIn, getProfile, saveProfile } from "@/lib/services/profile.service"; 
import { AiChatProvider, useAiChat } from "@/lib/ai/AiChatContext";
import styles from "@/components/layout/DashboardShell.module.css";
import CsvImportModal from "@/features/tabel/CsvImportModal";
import { CsvImportProvider, useCsvImport } from "@/lib/ai/CsvImportContext";
import { checkUnreadAdminReplies } from "@/lib/services/support.service";
import { createNotification } from "@/lib/notifications/notifications.service";
import TokenPurchaseModal from "@/features/profil/TokenPurchaseModal";
import { AiTokenProvider, useAiToken } from "@/lib/ai/AiTokenContext";
import { getTransactions } from "@/lib/services/transactions.service";
import { getBudget } from "@/lib/services/budget.service";
import { getGoals } from "@/lib/services/goals.service";
import { calcHealthScore } from "@/lib/business/healthScore";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { open, initialMessage, closeChat } = useAiChat();
  const { open: csvOpen, closeImport } = useCsvImport();
  const [helpdeskOpen, setHelpdeskOpen] = useState(false);
  const { open: tokenOpen, closePurchase } = useAiToken();
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    if (tokenOpen) {
      getProfile().then((p) => setTokenBalance(p?.aiTokenBalance || 0));
    }
  }, [tokenOpen]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
      <Fab onClick={() => setHelpdeskOpen(true)} />
      <HelpdeskPanel open={helpdeskOpen} onClose={() => setHelpdeskOpen(false)} />
      <AiChatPanel open={open} initialMessage={initialMessage} onClose={closeChat} />
      <CsvImportModal open={csvOpen} onClose={closeImport} />
      <TokenPurchaseModal open={tokenOpen} onClose={closePurchase} currentBalance={tokenBalance} onPurchased={(newBalance) => setTokenBalance(newBalance)} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        router.replace("/login");
        return;
      }
      setAuthChecked(true);
    })();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      const unread = await checkUnreadAdminReplies();
      for (const u of unread) {
        await createNotification(
          "support_reply",
          "Ada balasan dari tim BijakDana",
          u.message.slice(0, 100)
        );
      }
    })();
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      const [tx, budget, profile, goals] = await Promise.all([
        getTransactions(), getBudget(), getProfile(), getGoals(),
      ]);
      if (!profile || profile.healthScoreNotifPref === "off") return;

      const result = calcHealthScore(tx, budget, profile, goals);
      const mk = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
      if (profile.lastHealthScoreCheckedMonth === mk) return;

      let shouldNotify = profile.healthScoreNotifPref === "monthly";
      if (profile.healthScoreNotifPref === "on_drop" && profile.lastHealthScoreValue >= 0) {
        shouldNotify = result.overall < profile.lastHealthScoreValue - 5;
      }

      if (shouldNotify) {
        await createNotification(
          "health_score",
          "Skor Kesehatan Keuanganmu diperbarui",
          `Skor kamu sekarang ${result.overall}/100. Ketuk untuk lihat detail & rekomendasi.`
        );
      }

      await saveProfile({ ...profile, lastHealthScoreCheckedMonth: mk, lastHealthScoreValue: result.overall });
    })();
  }, [authChecked]);

  if (!authChecked) {
    return <div style={{ minHeight: "100vh" }} />;
  }
  
  return (
    <CsvImportProvider>
      <AiChatProvider>
        <AiTokenProvider>
          <DashboardInner>{children}</DashboardInner>
        </AiTokenProvider>
      </AiChatProvider>
    </CsvImportProvider>
  );
}