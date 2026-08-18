import { supabase } from "@/app/supabase";
import { Budget } from "@/types/models";

export async function getBudget(): Promise<Budget> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase.from("budgets").select("cat, amount").eq("user_id", user.id);

  if (error || !data) {
    console.error(error);
    return {};
  }

  const budget: Budget = {};
  data.forEach((row) => {
    budget[row.cat] = row.amount;
  });
  return budget;
}

export async function saveBudget(budget: Budget): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rows = Object.entries(budget).map(([cat, amount]) => ({
    user_id: user.id,
    cat,
    amount,
  }));

  const { error } = await supabase.from("budgets").upsert(rows, { onConflict: "user_id,cat" });
  if (error) console.error(error);
}

export async function deleteAllBudgets(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("budgets").delete().eq("user_id", user.id);
  if (error) console.error(error);
}