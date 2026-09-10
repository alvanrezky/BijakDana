import { supabase } from "@/app/supabase";

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export async function getAllFaq(): Promise<FaqEntry[]> {
  const { data, error } = await supabase.from("faq_entries").select("*").order("category");
  if (error || !data) {
    console.error(error);
    return [];
  }
  return data.map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    keywords: f.keywords || [],
  }));
}