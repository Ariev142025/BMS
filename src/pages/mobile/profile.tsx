import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { authApi, buildingsApi } from '@/lib/api'

export default function MobileProfile() {
  const { user, loading, logout } = useAuth(['teknisi','spv_teknisi','housekeeping','spv_housekeeping','building_admin'])
  const [building, setBuilding] = useState<any>(null)
  const [pwd, setPwd] = useState({ current:'', new1:'', new2:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user?.building_id) return
    buildingsApi.list().then(r => {
      const found = (r.data as any[]).find((b:any) => b.id === user.building_id)
      setBuilding(found || null)
    })
  }, [user])

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd.new1 !== pwd.new2) { setMsg('❌ Password baru tidak cocok'); return }
    if (pwd.new1.length < 8) { setMsg('❌ Password minimal 8 karakter'); return }
    setSaving(true)
    try {
      await authApi.changePassword(pwd.current, pwd.new1)
      setMsg('✅ Password berhasil diubah')
      setPwd({ current:'', new1:'', new2:'' })
      setShowPwd(false)
    } catch (e:any) {
      setMsg('❌ ' + (e.response?.data?.detail || 'Gagal mengubah password'))
    } finally { setSaving(false) }
  }

  if (loading) return null
  if (!user) return null

  const roleLabel: Record<string,string> = {
    teknisi:'Teknisi', spv_teknisi:'SPV Teknisi',
    housekeeping:'Housekeeping', spv_housekeeping:'SPV Housekeeping',
    building_admin:'Admin Gedung', tro:'TRO',
  }

  const infos = [
    { label:'Email', value: user.email, icon:'📧' },
    { label:'Role', value: roleLabel[user.role] || user.role.replace(/_/g,' '), icon:'🏷️' },
    { label:'Gedung', value: building?.name || (user.building_id ? 'Memuat...' : 'Semua Gedung'), icon:'🏢' },
    { label:'Alamat', value: building?.address || '—', icon:'📍' },
  ]

  return (
    <>
      <Head><title>Profil — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Profil">
        <div className="px-4 py-6 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-800">{user.full_name}</h2>
            <span className="mt-1 badge-blue text-xs">{roleLabel[user.role] || user.role}</span>
          </div>

          {/* Info */}
          <div className="mobile-card space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm mb-1">Informasi Akun</h3>
            {infos.map(info => (
              <div key={info.label} className="flex items-center gap-3">
                <span className="text-lg w-7">{info.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{info.label}</p>
                  <p className="text-sm font-medium text-gray-800">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div className="mobile-card">
            <button onClick={() => setShowPwd(v => !v)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>🔐 Ubah Password</span>
              <span className="text-gray-400">{showPwd ? '▲' : '▼'}</span>
            </button>
            {showPwd && (
              <form onSubmit={handleChangePwd} className="mt-3 space-y-3">
                <input type="password" className="mobile-input" required
                  placeholder="Password saat ini" value={pwd.current}
                  onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} />
                <input type="password" className="mobile-input" required
                  placeholder="Password baru (min. 8 karakter)" value={pwd.new1}
                  onChange={e => setPwd(p => ({ ...p, new1: e.target.value }))} />
                <input type="password" className="mobile-input" required
                  placeholder="Ulangi password baru" value={pwd.new2}
                  onChange={e => setPwd(p => ({ ...p, new2: e.target.value }))} />
                {msg && <p className={`text-xs ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
                <button type="submit" disabled={saving} className="mobile-btn">
                  {saving ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </form>
            )}
          </div>

          {/* Version info */}
          <div className="text-center text-xs text-gray-400 pb-4">
            <p>SOMA BMS v1.0.0</p>
            <p>Smart Building Management System</p>
          </div>

          {/* Logout */}
          <button onClick={logout}
            className="w-full py-3 rounded-xl font-semibold text-base bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
            🚪 Keluar
          </button>
        </div>
      </MobileLayout>
    </>
  )
}
