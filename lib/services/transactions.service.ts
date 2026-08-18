import { supabase } from "@/app/supabase";
import { Transaction } from "@/types/models";

export async function getTransactions(): Promise<Transaction[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data.map((t) => ({
    id: t.id,
    type: t.type,
    cat: t.cat,
    amount: t.amount,
    desc: t.description || "",
    method: t.method || "",
    date: t.date,
    time: t.time || "",
    note: t.note || "",
    createdAt: t.created_at,
    goalId: t.goal_id || null,
  }));
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("transactions").upsert({
    id: tx.id,
    user_id: user.id,
    type: tx.type,
    cat: tx.cat,
    amount: tx.amount,
    description: tx.desc,
    method: tx.method,
    date: tx.date,
    time: tx.time,
    note: tx.note,
    created_at: tx.createdAt,
    goal_id: tx.goalId || null,
  });

  if (error) console.error(error);
}

export async function deleteTransaction(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

  if (error) console.error(error);
}

export async function deleteAllTransactions(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);
  if (error) console.error(error);
}