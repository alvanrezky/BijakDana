"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/services/profile.service";
import LandingPage from "@/features/landing/LandingPage";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        router.replace("/beranda");
        return;
      }
      setChecked(true);
    })();
  }, [router]);

  if (!checked) {
    return <div style={{ minHeight: "100vh" }} />;
  }

  return <LandingPage />;
}