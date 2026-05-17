import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { setCookie } from 'cookies-next'
import { authApi } from '@/lib/api'

const DEMO = [
  { label: 'Admin Gedung',   email: 'admin@gedung.com' },
  { label: 'Super Admin',    email: 'superadmin@somabms.com' },
  { label: 'TRO',            email: 'tro@gedung.com' },
  { label: 'SPV Teknisi',    email: 'spv.teknisi@gedung.com' },
  { label: 'Teknisi 1',      email: 'teknisi1@gedung.com' },
  { label: 'Housekeeping 1', email: 'hk1@gedung.com' },
]

function getDashboardPath(role: string) {
  if (['teknisi','housekeeping','spv_teknisi','spv_housekeeping'].includes(role)) return '/mobile/dashboard'
  if (role === 'tro') return '/tro/dashboard'
  if (role === 'super_admin') return '/superadmin'
  return '/admin/dashboard'
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.login(email, password)
      setCookie('access_token', data.access_token, { maxAge: 60 * 60 * 8 })
      router.push(getDashboardPath(data.role || data.user?.role || ''))
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Login — SOMA BMS</title></Head>
      <div style={{ minHeight:'100vh', background:'#f7f7f6', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <div style={{ width:'100%', maxWidth:360 }}>

          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ width:40, height:40, background:'#111', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>SM</span>
            </div>
            <p style={{ fontSize:18, fontWeight:600, color:'#111', margin:0 }}>SOMA BMS</p>
            <p style={{ fontSize:12, color:'#aaa', margin:'4px 0 0' }}>Smart Building Management</p>
          </div>

          <div style={{ background:'#fff', border:'1px solid #ebebeb', borderRadius:12, padding:24, marginBottom:12 }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:'#555', display:'block', marginBottom:5 }}>Email</label>
                <input type="email" required className="input-field" placeholder="email@domain.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:'#555' }}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize:11, color:'#aaa', textDecoration:'none' }}>Lupa password?</Link>
                </div>
                <input type="password" required className="input-field" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <p style={{ fontSize:12, color:'#c62828', background:'#fef2f2', padding:'8px 12px', borderRadius:7, margin:0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:10, justifyContent:'center' }}>
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            </form>
          </div>

          <div style={{ background:'#fff', border:'1px solid #ebebeb', borderRadius:12, padding:16 }}>
            <p style={{ fontSize:11, color:'#aaa', fontWeight:500, letterSpacing:0.5, textTransform:'uppercase', marginBottom:10 }}>
              Akun Demo — password: Demo123!
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {DEMO.map(d => (
                <button key={d.email} onClick={() => { setEmail(d.email); setPassword('Demo123!'); setError('') }}
                  style={{ padding:'7px 10px', borderRadius:7, border:'1px solid #ebebeb', background: email === d.email ? '#f0f0f0' : '#fafafa', cursor:'pointer', textAlign:'left' }}>
                  <p style={{ fontSize:11, fontWeight:500, color:'#111', margin:0 }}>{d.label}</p>
                  <p style={{ fontSize:10, color:'#aaa', margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.email.split('@')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize:11, color:'#ccc', textAlign:'center', marginTop:20 }}>© 2026 SOMA BMS · PT Teknologi Lepas Kerja</p>
        </div>
      </div>
    </>
  )
}