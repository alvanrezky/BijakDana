import { supabase } from './supabase'

// Simpan transaksi ke Supabase setiap kali ada transaksi baru
export async function syncTransactionToSupabase(tx: {
  id: string | number
  type: string
  cat: string
  goal?: string
  amount: number
  desc?: string
  method?: string
  date: string
  note?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('transactions').upsert({
    id: String(tx.id),
    user_id: user.id,
    type: tx.type,
    cat: tx.cat,
    goal: tx.goal || null,
    amount: tx.amount,
    description: tx.desc || '',
    method: tx.method || '',
    date: tx.date,
    note: tx.note || ''
  })
}

// Hapus transaksi dari Supabase
export async function deleteTransactionFromSupabase(id: string | number) {
  await supabase.from('transactions').delete().eq('id', String(id))
}

// Load semua transaksi dari Supabase ke localStorage
export async function loadTransactionsFromSupabase() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (!data || data.length === 0) return false

  // Konversi format Supabase ke format aplikasi
  const txs = data.map(t => ({
    id: t.id,
    type: t.type,
    cat: t.cat,
    goal: t.goal,
    amount: t.amount,
    desc: t.description,
    method: t.method,
    date: t.date,
    note: t.note
  }))

  // Simpan ke localStorage supaya aplikasi bisa baca
  localStorage.setItem('bd_transactions', JSON.stringify(txs))
  return true
}

// Cek apakah user sudah login
export async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}