'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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
          <div style={{
            width: 48, height: 48, background: '#00C896', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 auto 12px'
          }}>BD</div>
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
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{
              width: '100%', border: '1.5px solid #D9EFEA', borderRadius: 12,
              padding: '11px 14px', fontSize: 14, outline: 'none',
              background: '#F0FBF8', color: '#0D1B14', boxSizing: 'border-box'
            }}
          />
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