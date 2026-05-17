import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { workOrdersApi, usersApi } from '@/lib/api'

const PRIO: Record<string, string> = { emergency: 'badge-red', high: 'badge-orange', medium: 'badge-yellow', low: 'badge-blue' }
const STAT: Record<string, string> = { completed: 'badge-green', in_progress: 'badge-blue', assigned: 'badge-yellow', open: 'badge-gray', pending_approval: 'badge-orange', rejected: 'badge-red', cancelled: 'badge-red' }
const PRIO_LABEL: Record<string, string> = { emergency: '🔴 Darurat', high: '🟠 Tinggi', medium: '🟡 Sedang', low: '🔵 Rendah' }

export default function AdminWorkOrders() {
  const { user, loading, logout } = useAuth(['building_admin', 'super_admin', 'company_admin', 'spv_teknisi'])
  const [wos, setWOs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fPrio, setFPrio] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [approveNotes, setApproveNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', wo_type: 'corrective',
    category: '', floor: '', location: '', assigned_to_id: '',
  })

  const fetchAll = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const [w, u_] = await Promise.all([
        workOrdersApi.list({ building_id: user.building_id }),
        usersApi.list({ role: 'teknisi', building_id: user.building_id }),
      ])
      setWOs(Array.isArray(w.data) ? w.data : w.data.items || [])
      setUsers(Array.isArray(u_.data) ? u_.data : u_.data.items || [])
    } catch {
      setError('Gagal memuat work order')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setSaving(true)
    try {
      await workOrdersApi.create({
        ...form,
        building_id: user.building_id,
        assigned_to_id: form.assigned_to_id || undefined,
        status: form.assigned_to_id ? 'assigned' : 'open',
      })
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'medium', wo_type: 'corrective', category: '', floor: '', location: '', assigned_to_id: '' })
      fetchAll()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal membuat WO')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (approved: boolean) => {
    if (!selected) return
    setSaving(true)
    try {
      await workOrdersApi.approve(selected.id, approved, approveNotes || undefined)
      setSelected(null)
      setApproveNotes('')
      fetchAll()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal approval')
    } finally {
      setSaving(false)
    }
  }

  const filtered = wos.filter(w =>
    (!fStatus || w.status === fStatus) &&
    (!fPrio || w.priority === fPrio) &&
    (!search || w.title?.toLowerCase().includes(search.toLowerCase()) || w.wo_number?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const pendingApproval = wos.filter(w => w.status === 'pending_approval')

  return (
    <>
      <Head><title>Work Orders — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Work Orders">
        {/* Alert pending approval */}
        {pendingApproval.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-orange-800">{pendingApproval.length} WO menunggu approval</p>
              <p className="text-xs text-orange-600">Klik WO dengan status "Pending Approval" untuk approve/reject</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Open', value: wos.filter(w => w.status === 'open').length, color: 'border-gray-400' },
            { label: 'In Progress', value: wos.filter(w => w.status === 'in_progress').length, color: 'border-blue-400' },
            { label: 'Pending Approval', value: pendingApproval.length, color: 'border-orange-400' },
            { label: 'Selesai', value: wos.filter(w => w.status === 'completed').length, color: 'border-green-400' },
          ].map(k => (
            <div key={k.label} className={`card border-l-4 ${k.color}`}>
              <p className="text-2xl font-bold text-gray-800">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input className="input-field flex-1" placeholder="Cari nomor WO atau judul..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input-field w-auto" value={fStatus} onChange={e => setFStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {['open', 'assigned', 'in_progress', 'pending_approval', 'completed', 'rejected', 'cancelled'].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
            <select className="input-field w-auto" value={fPrio} onChange={e => setFPrio(e.target.value)}>
              <option value="">Semua Prioritas</option>
              {['emergency', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={() => setShowForm(true)} className="btn-primary whitespace-nowrap">+ Buat WO</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nomor WO</th>
                  <th className="px-4 py-3 text-left">Judul</th>
                  <th className="px-4 py-3 text-left">Prioritas</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Ditugaskan ke</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {busy ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">⏳ Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada work order</td></tr>
                ) : filtered.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{w.wo_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-xs truncate">{w.title}</p>
                      <p className="text-xs text-gray-400">{w.category || ''} {w.floor ? `· Lt.${w.floor}` : ''}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${PRIO[w.priority] || 'badge-gray'}`}>{PRIO_LABEL[w.priority] || w.priority}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${STAT[w.status] || 'badge-gray'}`}>{w.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{users.find(u_ => u_.id === w.assigned_to_id)?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID') : '—'}</td>
                    <td className="px-4 py-3">
                      {w.status === 'pending_approval' ? (
                        <button onClick={() => { setSelected(w); setApproveNotes('') }}
                          className="text-xs px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-medium">
                          ⚖️ Review
                        </button>
                      ) : (
                        <button onClick={() => setSelected(w)}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approve modal */}
        {selected && selected.status === 'pending_approval' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800">⚖️ Review Work Order</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Nomor:</span> <span className="font-mono font-medium">{selected.wo_number}</span></p>
                <p><span className="text-gray-500">Judul:</span> <span className="font-medium">{selected.title}</span></p>
                <p><span className="text-gray-500">Prioritas:</span> <span className={`badge ${PRIO[selected.priority]}`}>{PRIO_LABEL[selected.priority]}</span></p>
                <p><span className="text-gray-500">Deskripsi:</span> {selected.description || '—'}</p>
                <p><span className="text-gray-500">Lokasi:</span> {selected.location || '—'} {selected.floor ? `Lt.${selected.floor}` : ''}</p>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Catatan (opsional)</label>
                <textarea className="input-field" rows={3} placeholder="Alasan approval atau penolakan..."
                  value={approveNotes} onChange={e => setApproveNotes(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleApprove(false)} disabled={saving}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                  {saving ? '⏳...' : '❌ Tolak'}
                </button>
                <button onClick={() => handleApprove(true)} disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                  {saving ? '⏳...' : '✅ Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail modal (non-approval) */}
        {selected && selected.status !== 'pending_approval' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800">Detail Work Order</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Nomor WO', selected.wo_number],
                  ['Judul', selected.title],
                  ['Tipe', selected.wo_type],
                  ['Kategori', selected.category || '—'],
                  ['Prioritas', PRIO_LABEL[selected.priority] || selected.priority],
                  ['Status', selected.status],
                  ['Lokasi', `${selected.location || '—'} ${selected.floor ? `Lt.${selected.floor}` : ''}`],
                  ['Ditugaskan', users.find(u_ => u_.id === selected.assigned_to_id)?.full_name || '—'],
                  ['Deskripsi', selected.description || '—'],
                  ['Catatan penyelesaian', selected.completion_notes || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-4">
                    <span className="text-gray-400 shrink-0">{l}</span>
                    <span className="font-medium text-gray-700 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create WO modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">+ Buat Work Order Baru</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Judul *</label>
                  <input className="input-field" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Judul work order" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
                    <select className="input-field" value={form.wo_type} onChange={e => setForm(f => ({ ...f, wo_type: e.target.value }))}>
                      <option value="corrective">Corrective</option>
                      <option value="preventive">Preventive</option>
                      <option value="emergency">Emergency</option>
                      <option value="improvement">Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prioritas</label>
                    <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {['low', 'medium', 'high', 'emergency'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                    <input className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="HVAC, Listrik..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lantai</label>
                    <input className="input-field" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="1, 2, B1..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi Detail</label>
                  <input className="input-field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ruang server, Toilet pria..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tugaskan ke Teknisi</label>
                  <select className="input-field" value={form.assigned_to_id} onChange={e => setForm(f => ({ ...f, assigned_to_id: e.target.value }))}>
                    <option value="">— Pilih teknisi (opsional) —</option>
                    {users.map(u_ => <option key={u_.id} value={u_.id}>{u_.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                  <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detail pekerjaan yang harus dilakukan..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                    {saving ? '⏳ Menyimpan...' : '+ Buat WO'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
