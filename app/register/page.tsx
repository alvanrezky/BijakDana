'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError('')
    if (!name || !email || !password) {
      setError('Semua kolom wajib diisi')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter')
      setLoading(false)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError('Gagal mendaftar dengan Google')
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F0FBF8', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: 40,
          width: '100%', maxWidth: 400, textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0D1B14', marginBottom: 8 }}>
            Cek emailmu!
          </div>
          <div style={{ fontSize: 13, color: '#5A7A70', lineHeight: 1.6, marginBottom: 24 }}>
            Kami mengirim link verifikasi ke <strong>{email}</strong>.
            Klik link tersebut untuk mengaktifkan akun BijakDana-mu.
          </div>
          <a href="/login" style={{
            display: 'block', background: '#00C896', color: '#fff',
            borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700,
            textDecoration: 'none'
          }}>Pergi ke halaman Login</a>
        </div>
      </div>
    )
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
            style={{ width: 64, height: 64, margin: '0 auto 12px', display: 'block' }}
          />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B14' }}>Daftar BijakDana</div>
          <div style={{ fontSize: 13, color: '#5A7A70', marginTop: 4 }}>Gratis — mulai kelola keuanganmu</div>
        </div>

        {error && (
          <div style={{
            background: '#FFF0F0', border: '1px solid #FFD0D0',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#CC2222'
          }}>{error}</div>
        )}

        <button
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          style={{
            width: '100%', background: '#fff', color: '#0D1B14', border: '1.5px solid #E5E7EB',
            borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer', opacity: googleLoading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 20,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          {googleLoading ? 'Memproses...' : 'Daftar dengan Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>atau daftar dengan email</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0D1B14', display: 'block', marginBottom: 6 }}>
            Nama lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama kamu"
            style={{
              width: '100%', border: '1.5px solid #D9EFEA', borderRadius: 12,
              padding: '11px 14px', fontSize: 14, outline: 'none',
              background: '#F0FBF8', color: '#0D1B14', boxSizing: 'border-box'
            }}
          />
        </div>

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

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0D1B14', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={{
                width: '100%', border: '1.5px solid #D9EFEA', borderRadius: 12,
                padding: '11px 44px 11px 14px', fontSize: 14, outline: 'none',
                background: '#F0FBF8', color: '#0D1B14', boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#5A7A70',
                display: 'flex', alignItems: 'center', padding: 0,
              }}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="19" height="19">
                  <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.42 20.42 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a20.42 20.42 0 01-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="19" height="19">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', background: '#00C896', color: '#fff', border: 'none',
            borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Memproses...' : 'Daftar sekarang →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#5A7A70' }}>
          Sudah punya akun?{' '}
          <a href="/login" style={{ color: '#00A87E', fontWeight: 600 }}>Masuk di sini</a>
        </div>
      </div>
    </div>
  )
}