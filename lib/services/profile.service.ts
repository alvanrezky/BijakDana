import { supabase } from "@/app/supabase";
import { Profile } from "@/types/models";

export async function isLoggedIn(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata || {};

  return {
    name: meta.full_name || user.email?.split("@")[0] || "Pengguna",
    email: user.email || "",
    income: meta.income || 0,
    incomeType: meta.incomeType || "Gaji tetap",
    dependents: meta.dependents || "",
    savingTarget: meta.savingTarget || 0,
    savingsInitial: meta.savingsInitial || 0,
    emergencyFundCurrent: meta.emergencyFundCurrent || 0,
    emergencyFundTarget: meta.emergencyFundTarget || 0,
    onboarded: meta.onboarded === true,
    healthScoreNotifPref: meta.healthScoreNotifPref || "monthly",
  };
}

export async function saveProfile(profile: Profile): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: profile.name,
      income: profile.income,
      incomeType: profile.incomeType,
      dependents: profile.dependents,
      savingTarget: profile.savingTarget,
      savingsInitial: profile.savingsInitial,
      emergencyFundCurrent: profile.emergencyFundCurrent,
      emergencyFundTarget: profile.emergencyFundTarget,
      onboarded: profile.onboarded,
      healthScoreNotifPref: profile.healthScoreNotifPref,
    },
  });

  if (error) console.error(error);
}