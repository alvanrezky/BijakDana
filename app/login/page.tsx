'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F0FBF8', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 40,
        width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo-bijakdana.png"
            alt="BijakDana"
            style={{ width: 80, height: 80, margin: '0 auto 12px', display: 'block', borderRadius: 0, background: 'transparent' }}
          />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B14' }}>Masuk ke BijakDana</div>
          <div style={{ fontSize: 13, color: '#5A7A70', marginTop: 4 }}>Kelola keuanganmu dengan bijak</div>
        </div>

        {error && (
          <div style={{
            background: '#FFF0F0', border: '1px solid #FFD0D0',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#CC2222'
          }}>{error}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0D1B14', display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            style={{
              width: '100%', border: '1.5px solid #D9EFEA', borderRadius: 12,
              padding: '11px 14px', fontSize: 14, outline: 'none',
              background: '#F0FBF8', color: '#0D1B14', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0D1B14', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Masukkan password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', border: '1.5px solid #D9EFEA', borderRadius: 12,
              padding: '11px 14px', fontSize: 14, outline: 'none',
              background: '#F0FBF8', color: '#0D1B14', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: '#00C896', color: '#fff', border: 'none',
            borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Memproses...' : 'Masuk →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#5A7A70' }}>
          Belum punya akun?{' '}
          <a href="/register" style={{ color: '#00A87E', fontWeight: 600 }}>Daftar gratis</a>
        </div>
      </div>
    </div>
  )
}