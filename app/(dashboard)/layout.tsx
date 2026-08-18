"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Fab from "@/components/layout/Fab";
import AiChatPanel from "@/features/ai-chat/AiChatPanel";
import { isLoggedIn } from "@/lib/services/profile.service";
import styles from "@/components/layout/DashboardShell.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
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

  if (!authChecked) {
    return <div style={{ minHeight: "100vh" }} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
      <Fab onClick={() => setChatOpen(true)} />
      <AiChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}