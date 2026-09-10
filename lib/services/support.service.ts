import { supabase } from "@/app/supabase";

export interface SupportMessage {
  id: string;
  sender: "user" | "admin";
  message: string;
  createdAt: string;
}

export async function getOrCreateOpenTicket(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("support_tickets")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error || !created) {
    console.error(error);
    return null;
  }
  return created.id;
}

export async function getMessages(ticketId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data.map((m) => ({ id: m.id, sender: m.sender, message: m.message, createdAt: m.created_at }));
}

export async function sendUserMessage(ticketId: string, message: string): Promise<void> {
  const { error } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender: "user",
    message,
  });
  if (error) console.error(error);
}

export async function markAdminMessagesRead(ticketId: string): Promise<void> {
  const { error } = await supabase
    .from("support_messages")
    .update({ read: true })
    .eq("ticket_id", ticketId)
    .eq("sender", "admin")
    .eq("read", false);
  if (error) console.error(error);
}

/**
 * Cek apakah ada balasan admin yang belum dibaca, di ticket milik user yang lagi login.
 * Dipanggil sekali tiap dashboard dibuka, buat munculin notifikasi lonceng kalau ada balasan baru.
 */
export async function checkUnreadAdminReplies(): Promise<{ ticketId: string; message: string }[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: tickets } = await supabase.from("support_tickets").select("id").eq("user_id", user.id);
  if (!tickets || tickets.length === 0) return [];

  const ticketIds = tickets.map((t) => t.id);

  const { data, error } = await supabase
    .from("support_messages")
    .select("ticket_id, message")
    .in("ticket_id", ticketIds)
    .eq("sender", "admin")
    .eq("read", false);

  if (error || !data) return [];
  return data.map((d) => ({ ticketId: d.ticket_id, message: d.message }));
}