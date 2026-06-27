'use client'
import { useEffect } from 'react'
import { supabase } from '../supabase'

export default function Logout() {
  useEffect(() => {
    async function doLogout() {
      await supabase.auth.signOut()
      localStorage.clear()
      window.location.href = '/login'
    }
    doLogout()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F0FBF8',
      fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: 12
    }}>
      <div style={{
        width: 48, height: 48, background: '#00C896', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 800, color: '#fff'
      }}>BD</div>
      <div style={{ fontSize: 15, color: '#5A7A70', fontWeight: 500 }}>
        Sedang keluar dari akun...
      </div>
    </div>
  )
}