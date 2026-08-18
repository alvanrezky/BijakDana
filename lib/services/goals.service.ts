import { supabase } from "@/app/supabase";
import { SavingsGoal } from "@/types/models";

export async function getGoals(): Promise<SavingsGoal[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.target_amount,
    targetMonths: g.target_months,
    createdAt: g.created_at,
  }));
}

export async function saveGoal(goal: SavingsGoal): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("savings_goals").upsert({
    id: goal.id,
    user_id: user.id,
    name: goal.name,
    target_amount: goal.targetAmount,
    target_months: goal.targetMonths,
    created_at: goal.createdAt,
  });

  if (error) console.error(error);
}

export async function deleteGoal(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
  if (error) console.error(error);
}