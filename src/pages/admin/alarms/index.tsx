import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { alarmsApi } from '@/lib/api'

const SC: Record<string,string> = { emergency:'border-l-4 border-red-500 bg-red-50', critical:'border-l-4 border-orange-500 bg-orange-50', major:'border-l-4 border-yellow-500 bg-yellow-50', warning:'border-l-4 border-blue-500 bg-blue-50', info:'border-l-4 border-gray-300 bg-gray-50' }
const SI: Record<string,string> = { emergency:'🔴', critical:'🟠', major:'🟡', warning:'🔵', info:'⚪' }
const PRIO_C: Record<string,string> = { emergency:'badge-red', critical:'badge-orange', major:'badge-yellow', warning:'badge-blue', info:'badge-gray' }

const PAGE_SIZE = 20

export default function AlarmsPage() {
  const { user, loading, logout } = useAuth(['building_admin','super_admin','company_admin','spv_teknisi'])
  const [alarms, setAlarms] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [sev, setSev] = useState('')
  const [status, setStatus] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ alarm_type:'hvac_fault', severity:'warning', title:'', message:'', location:'', floor:'' })

  const fetchAlarms = useCallback(async () => {
    if (!user) return
    setBusy(true); setError('')
    try {
      const { data } = await alarmsApi.list({
        building_id: user.building_id,
        severity: sev || undefined,
        status: status || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      const items = Array.isArray(data) ? data : data.items || []
      const tot = Array.isArray(data) ? data.length : data.total ?? items.length
      setAlarms(items); setTotal(tot)
    } catch (e: any) { setError(e.response?.data?.detail || 'Gagal memuat alarm') }
    finally { setBusy(false) }
  }, [user, sev, status, page])

  useEffect(() => { if (user) fetchAlarms() }, [fetchAlarms])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setSaving(true)
    try {
      await alarmsApi.create({ ...form, building_id: user.building_id })
      setShowForm(false)
      setForm({ alarm_type:'hvac_fault', severity:'warning', title:'', message:'', location:'', floor:'' })
      fetchAlarms()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSaving(false) }
  }

  const act = async (id: string, action: 'ack'|'resolve') => {
    try {
      if (action === 'ack') await alarmsApi.ack(id)
      else await alarmsApi.resolve(id)
      fetchAlarms()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  return (
    <>
      <Head><title>Alarm — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Monitor Alarm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center">
          <select className="input-field w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}>
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="input-field w-auto" value={sev} onChange={e => { setSev(e.target.value); setPage(0) }}>
            <option value="">Semua Severity</option>
            {['emergency','critical','major','warning','info'].map(s => <option key={s} value={s}>{SI[s]} {s}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <button onClick={fetchAlarms} className="btn-secondary text-sm">🔄 Refresh</button>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Manual Alarm</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        {/* List */}
        {busy ? <div className="text-center py-16 text-gray-400">⏳ Memuat alarm...</div>
        : alarms.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 font-medium">Tidak ada alarm {status === 'active' ? 'aktif' : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map(a => (
              <div key={a.id} className={`rounded-2xl p-4 shadow-sm ${SC[a.severity] || SC.info}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{SI[a.severity]} {a.title}</span>
                      <span className={`badge ${PRIO_C[a.severity] || 'badge-gray'}`}>{a.severity}</span>
                      <span className={`badge ${a.status === 'active' ? 'badge-red' : a.status === 'acknowledged' ? 'badge-orange' : 'badge-green'}`}>{a.status}</span>
                    </div>
                    {a.message && <p className="text-sm text-gray-600 mb-1">{a.message}</p>}
                    <p className="text-xs text-gray-400">
                      {a.location && `📍 ${a.location}`}{a.floor ? ` Lt.${a.floor}` : ''} · {a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {a.status === 'active' && (
                      <button onClick={() => act(a.id, 'ack')} className="text-xs px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-medium">👁 Ack</button>
                    )}
                    {(a.status === 'active' || a.status === 'acknowledged') && (
                      <button onClick={() => act(a.id, 'resolve')} className="text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium">✅ Resolve</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              className="btn-secondary text-sm disabled:opacity-40 px-4">← Prev</button>
            <span className="text-sm text-gray-500">Hal {page+1} / {totalPages} ({total} total)</span>
            <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
              className="btn-secondary text-sm disabled:opacity-40 px-4">Next →</button>
          </div>
        )}

        {/* Create alarm modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">+ Input Alarm Manual</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Judul *</label>
                  <input className="input-field" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Deskripsi alarm..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
                    <select className="input-field" value={form.alarm_type} onChange={e => setForm(f => ({ ...f, alarm_type: e.target.value }))}>
                      {['hvac_fault','power_outage','water_leak','fire_alarm','access_breach','sensor_error','maintenance_due'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                    <select className="input-field" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                      {['emergency','critical','major','warning','info'].map(s => <option key={s} value={s}>{SI[s]} {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi</label>
                    <input className="input-field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ruang server..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lantai</label>
                    <input className="input-field" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="1, B1..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pesan</label>
                  <textarea className="input-field" rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Detail kondisi alarm..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? '⏳...' : '+ Buat Alarm'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
