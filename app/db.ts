import { supabase } from './supabase'

// Ambil semua transaksi user yang sedang login
export async function getTransactions() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) { console.error(error); return [] }
  return data || []
}

// Simpan transaksi baru ke Supabase
export async function saveTransaction(tx: {
  type: string
  cat: string
  goal?: string
  amount: number
  description?: string
  method?: string
  date: string
  note?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: tx.type,
      cat: tx.cat,
      goal: tx.goal || null,
      amount: tx.amount,
      description: tx.description || '',
      method: tx.method || '',
      date: tx.date,
      note: tx.note || ''
    })
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

// Hapus transaksi
export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) { console.error(error); return false }
  return true
}

// Ambil info user yang sedang login
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Logout
export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}