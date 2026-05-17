import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { schedulesApi, templatesApi } from '@/lib/api'

const FREQ_LABEL: Record<string,string> = { daily:'Harian 🔁', weekly:'Mingguan 📅', monthly:'Bulanan 🗓️', quarterly:'Kuartalan', yearly:'Tahunan' }
const ROLE_LABEL: Record<string,string> = { teknisi:'👷 Teknisi', housekeeping:'🧹 Housekeeping', spv_teknisi:'👔 SPV Teknisi' }
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAYS_ID = ['Sen','Sel','Rab','Kam','Jum','Sab','Min']

export default function SchedulesPage() {
  const { user, loading, logout } = useAuth(['building_admin','super_admin','company_admin'])
  const [schedules, setSchedules] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', template_id: '', assigned_role: 'teknisi',
    freq: 'daily', time: '08:00', days: [] as string[],
  })

  const fetchAll = async () => {
    if (!user) return
    setBusy(true); setError('')
    try {
      const [s, t] = await Promise.all([
        schedulesApi.list({ building_id: user.building_id }),
        templatesApi.list({ building_id: user.building_id }),
      ])
      setSchedules(Array.isArray(s.data) ? s.data : s.data.items || [])
      setTemplates(Array.isArray(t.data) ? t.data : t.data.items || [])
    } catch { setError('Gagal memuat jadwal') }
    finally { setBusy(false) }
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id || !form.template_id) return
    setSaving(true)
    try {
      const pattern: any = { freq: form.freq, time: form.time }
      if (form.freq === 'weekly') pattern.days = form.days
      await schedulesApi.create({
        name: form.name, template_id: form.template_id,
        assigned_role: form.assigned_role,
        building_id: user.building_id,
        recurrence_pattern: pattern,
      })
      setShowForm(false)
      setForm({ name:'', template_id:'', assigned_role:'teknisi', freq:'daily', time:'08:00', days:[] })
      fetchAll()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSaving(false) }
  }

  const handleToggle = async (id: string) => {
    try { await schedulesApi.toggle(id); fetchAll() }
    catch (e: any) { alert(e.response?.data?.detail || 'Gagal toggle') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Nonaktifkan jadwal "${name}"?`)) return
    try { await schedulesApi.delete(id); fetchAll() }
    catch (e: any) { alert(e.response?.data?.detail || 'Gagal menghapus') }
  }

  const toggleDay = (day: string) => {
    setForm(f => ({ ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day] }))
  }

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const active = schedules.filter(s => s.is_active)
  const inactive = schedules.filter(s => !s.is_active)

  return (
    <>
      <Head><title>Jadwal PM — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Jadwal Preventive Maintenance">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm text-gray-500">{active.length} jadwal aktif · {inactive.length} nonaktif</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Buat Jadwal</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        {busy ? <div className="text-center py-16 text-gray-400">⏳ Memuat jadwal...</div> :
        schedules.length === 0 ? <div className="text-center py-16 text-gray-400 card">📅 Belum ada jadwal PM</div> : (
          <div className="space-y-3">
            {schedules.map(s => (
              <div key={s.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${!s.is_active ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {s.is_active ? '✅ Aktif' : '⛔ Nonaktif'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-gray-500">{FREQ_LABEL[s.recurrence_pattern?.freq || 'daily']}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">⏰ {s.recurrence_pattern?.time || '08:00'}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{ROLE_LABEL[s.assigned_role] || s.assigned_role}</span>
                    {s.recurrence_pattern?.days?.length > 0 && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{s.recurrence_pattern.days.map((d: string) => d.slice(0,3)).join(', ')}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Template: {templates.find(t => t.id === s.template_id)?.name || s.template_id?.slice(0, 8) + '...'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleToggle(s.id)}
                    className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors ${s.is_active
                      ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
                    {s.is_active ? '⏸ Nonaktifkan' : '▶ Aktifkan'}
                  </button>
                  <button onClick={() => handleDelete(s.id, s.name)}
                    className="text-xs px-3 py-2 rounded-xl font-medium bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                    🗑 Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">+ Buat Jadwal PM Baru</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Jadwal *</label>
                  <input className="input-field" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="PM AC Harian" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Template Checklist *</label>
                  <select className="input-field" required value={form.template_id} onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))}>
                    <option value="">— Pilih Template —</option>
                    {templates.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ditugaskan ke</label>
                    <select className="input-field" value={form.assigned_role} onChange={e => setForm(f => ({ ...f, assigned_role: e.target.value }))}>
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Frekuensi</label>
                    <select className="input-field" value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}>
                      {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jam Pelaksanaan</label>
                  <input type="time" className="input-field" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
                {form.freq === 'weekly' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Hari</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((d, i) => (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`w-10 h-10 rounded-full text-xs font-medium border-2 transition-colors ${form.days.includes(d)
                            ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`}>
                          {DAYS_ID[i]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? '⏳...' : '+ Simpan'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
