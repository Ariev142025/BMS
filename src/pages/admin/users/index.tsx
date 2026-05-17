import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { usersApi, buildingsApi } from '@/lib/api'

const roleColors: Record<string, string> = {
  building_admin: 'bg-purple-100 text-purple-800',
  spv_teknisi: 'bg-blue-100 text-blue-800',
  teknisi: 'bg-teal-100 text-teal-800',
  spv_housekeeping: 'bg-pink-100 text-pink-800',
  housekeeping: 'bg-rose-100 text-rose-800',
  tro: 'bg-yellow-100 text-yellow-800',
}
const roleLabel: Record<string, string> = {
  building_admin: '🏢 Admin Gedung',
  spv_teknisi: '👔 SPV Teknisi',
  teknisi: '👷 Teknisi',
  spv_housekeeping: '👔 SPV HK',
  housekeeping: '🧹 Housekeeping',
  tro: '🪪 TRO',
}
const roleDesc: Record<string, string> = {
  building_admin: 'Akses admin dashboard penuh',
  spv_teknisi: 'Monitor tim & approval WO — mobile app',
  teknisi: 'Checklist, maintenance, WO — mobile app',
  spv_housekeeping: 'Monitor tim & approval — mobile app',
  housekeeping: 'Checklist kebersihan — mobile app',
  tro: 'Manajemen tamu & akses — TRO dashboard',
}

export default function UsersPage() {
  const { user, loading, logout } = useAuth(['building_admin', 'super_admin', 'company_admin'])
  const [users_, setUsers] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [filterRole, setFilterRole] = useState('')
  const [busy, setBusy] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', role: 'teknisi',
    phone: '', skill_category: '', building_id: '',
  })

  useEffect(() => {
    if (!user) return
    Promise.all([
      usersApi.list({ building_id: user.building_id }),
      buildingsApi.list(),
    ]).then(([u, b]) => {
      setUsers(Array.isArray(u.data) ? u.data : u.data.items || [])
      setBuildings(Array.isArray(b.data) ? b.data : b.data.items || [])
    }).finally(() => setBusy(false))
  }, [user])

  const filtered = users_.filter(u_ => !filterRole || u_.role === filterRole)

  const openCreate = () => {
    setEditUser(null)
    setForm({ email: '', password: '', full_name: '', role: 'teknisi', phone: '', skill_category: '', building_id: user?.building_id || '' })
    setShowForm(true)
  }

  const openEdit = (u_: any) => {
    setEditUser(u_)
    setForm({ email: u_.email, password: '', full_name: u_.full_name, role: u_.role, phone: u_.phone || '', skill_category: u_.skill_category || '', building_id: u_.building_id || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editUser) {
        const { data } = await usersApi.update(editUser.id, {
          full_name: form.full_name, phone: form.phone,
          skill_category: form.skill_category,
          building_id: form.building_id || undefined,
        })
        setUsers(p => p.map(u_ => u_.id === editUser.id ? data : u_))
      } else {
        const payload: any = { ...form, building_id: form.building_id || user?.building_id }
        if (!payload.password) { alert('Password wajib diisi'); return }
        const { data } = await usersApi.create(payload)
        setUsers(p => [data, ...p])
      }
      setShowForm(false)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  const toggleActive = async (u_: any) => {
    if (!confirm(`${u_.is_active ? 'Nonaktifkan' : 'Aktifkan kembali'} akun ${u_.full_name}?`)) return
    try {
      if (u_.is_active) {
        await usersApi.delete(u_.id)
        setUsers(p => p.map(x => x.id === u_.id ? { ...x, is_active: false } : x))
      } else {
        const { data } = await usersApi.update(u_.id, { is_active: true })
        setUsers(p => p.map(x => x.id === u_.id ? data : x))
      }
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  if (loading) return null
  if (!user) return null

  return (
    <>
      <Head><title>Pengguna — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Pengguna & Akses">

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-blue-800 mb-2">👤 Manajemen Pengguna</p>
          <p className="text-xs text-blue-700">Admin gedung dapat membuat akun untuk semua role. Login akan mengarahkan sesuai role:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            {Object.entries(roleDesc).map(([r, d]) => (
              <div key={r} className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                <p className="text-xs font-semibold text-gray-700">{roleLabel[r]}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <select className="input-field max-w-xs" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Semua Role</option>
            {Object.keys(roleLabel).map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} pengguna</span>
          <div className="ml-auto">
            <button onClick={openCreate} className="btn-primary">+ Tambah Pengguna</button>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Nama', 'Email', 'Role / Akses', 'Spesialisasi', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {busy
                ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">⏳ Memuat...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">Belum ada pengguna</td></tr>
                  : filtered.map(u_ => (
                    <tr key={u_.id} className={`hover:bg-gray-50 ${!u_.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
                            {u_.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{u_.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u_.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u_.role] || 'bg-gray-100 text-gray-600'}`}>
                          {roleLabel[u_.role] || u_.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u_.skill_category || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={u_.is_active ? 'badge-green' : 'badge-gray'}>
                          {u_.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u_)}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            Edit
                          </button>
                          <button onClick={() => toggleActive(u_)}
                            className={`text-xs px-2 py-1 rounded ${u_.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u_.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between">
                <h3 className="font-bold">{editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input className="input-field" required placeholder="Ahmad Teknisi"
                    value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                {!editUser && <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" className="input-field" required placeholder="teknisi@gedung.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password * (min. 8 karakter)</label>
                    <input type="password" className="input-field" required
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                </>}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                  <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {Object.entries(roleLabel).map(([r, l]) => <option key={r} value={r}>{l}</option>)}
                  </select>
                  {form.role && <p className="text-xs text-gray-400 mt-1">ℹ️ {roleDesc[form.role]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gedung</label>
                  <select className="input-field" value={form.building_id} onChange={e => setForm(f => ({ ...f, building_id: e.target.value }))}>
                    <option value="">— Pilih Gedung —</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">No. HP</label>
                  <input className="input-field" placeholder="0812-xxxx-xxxx"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Spesialisasi</label>
                  <input className="input-field" placeholder="HVAC, Elektrikal, Plumbing..."
                    value={form.skill_category} onChange={e => setForm(f => ({ ...f, skill_category: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
