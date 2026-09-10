import { supabase } from "@/app/supabase";
import { Category } from "@/types/models";

export async function getCustomCategories(type: "income" | "expense"): Promise<Category[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("custom_categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", type)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data.map((c) => ({ id: c.id, label: c.label, icon: c.icon, color: c.color, bg: c.bg }));
}

const PALETTE = [
  { color: "#0EA5E9", bg: "#F0F9FF" },
  { color: "#A855F7", bg: "#FAF5FF" },
  { color: "#F97316", bg: "#FFF7ED" },
  { color: "#14B8A6", bg: "#F0FDFA" },
  { color: "#EC4899", bg: "#FDF2F8" },
];

export async function addCustomCategory(type: "income" | "expense", label: string): Promise<Category | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !label.trim()) return null;

  const pick = PALETTE[Math.floor(Math.random() * PALETTE.length)];

  const { data, error } = await supabase
    .from("custom_categories")
    .insert({ user_id: user.id, type, label: label.trim(), icon: "🏷️", color: pick.color, bg: pick.bg })
    .select()
    .single();

  if (error || !data) {
    console.error(error);
    return null;
  }

  return { id: data.id, label: data.label, icon: data.icon, color: data.color, bg: data.bg };
}

export async function deleteCustomCategory(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("custom_categories").delete().eq("id", id).eq("user_id", user.id);
  if (error) console.error(error);
}