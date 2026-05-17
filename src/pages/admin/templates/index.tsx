import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { templatesApi } from '@/lib/api'

const TYPE_LABEL: Record<string,string> = { maintenance:'🔧 Maintenance', inspection:'🔍 Inspeksi', cleaning:'🧹 Kebersihan', safety:'🦺 Safety', general:'📋 Umum' }

export default function TemplatesPage() {
  const { user, loading, logout } = useAuth(['building_admin','super_admin','company_admin'])
  const [templates, setTemplates] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', template_type: 'maintenance', category: '', estimated_minutes: 30, description: '',
    sections: [{ title: 'Checklist', items: [{ description: '', type: 'checkbox', required: true }] }],
  })

  const fetchAll = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const { data } = await templatesApi.list({ building_id: user.building_id })
      setTemplates(Array.isArray(data) ? data : data.items || [])
    } catch { setError('Gagal memuat template') }
    finally { setBusy(false) }
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setSaving(true)
    try {
      await templatesApi.create({ ...form, building_id: user.building_id })
      setShowForm(false)
      setForm({ name:'', template_type:'maintenance', category:'', estimated_minutes:30, description:'',
        sections:[{title:'Checklist',items:[{description:'',type:'checkbox',required:true}]}] })
      fetchAll()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSaving(false) }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await templatesApi.duplicate(id)
      fetchAll()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal duplikat') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus template "${name}"? Jadwal yang menggunakan template ini tidak akan terpengaruh.`)) return
    try {
      await templatesApi.delete(id)
      setDetail(null)
      fetchAll()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal menghapus') }
  }

  const addItem = (sIdx: number) => {
    const s = [...form.sections]
    s[sIdx].items.push({ description: '', type: 'checkbox', required: true })
    setForm(f => ({ ...f, sections: s }))
  }

  const updateItem = (sIdx: number, iIdx: number, val: string) => {
    const s = [...form.sections]
    s[sIdx].items[iIdx].description = val
    setForm(f => ({ ...f, sections: s }))
  }

  const filtered = templates.filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  return (
    <>
      <Head><title>Template Checklist — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Template Checklist">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <input className="input-field flex-1" placeholder="Cari template..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setShowForm(true)} className="btn-primary whitespace-nowrap">+ Buat Template</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        {busy ? <div className="text-center py-16 text-gray-400">⏳ Memuat template...</div> :
        filtered.length === 0 ? <div className="text-center py-16 text-gray-400 card">📋 Belum ada template</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {TYPE_LABEL[t.template_type] || t.template_type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {t.is_active ? '✅ Aktif' : '⛔ Nonaktif'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mt-1 mb-0.5">{t.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{t.category || '—'} · ⏱ {t.estimated_minutes || 30} menit</p>
                <p className="text-xs text-gray-500 mb-3">
                  {t.sections?.length || 0} seksi · {t.sections?.reduce((a: number, s: any) => a + (s.items?.length || 0), 0) || 0} item checklist
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDetail(t)} className="flex-1 text-xs py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-600 transition-colors">
                    👁 Detail
                  </button>
                  <button onClick={() => handleDuplicate(t.id)} className="flex-1 text-xs py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-blue-600 transition-colors">
                    📋 Duplikat
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} className="text-xs py-1.5 px-2.5 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-red-500 transition-colors">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">{detail.name}</h3>
                  <p className="text-xs text-gray-400">{TYPE_LABEL[detail.template_type]} · {detail.category}</p>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 text-xl">✕</button>
              </div>
              {detail.description && <p className="text-sm text-gray-600 mb-4">{detail.description}</p>}
              {(detail.sections || []).map((s: any, i: number) => (
                <div key={i} className="mb-4">
                  <p className="font-semibold text-sm text-gray-700 mb-2">📌 {s.title}</p>
                  <ul className="space-y-1">
                    {(s.items || []).map((item: any, j: number) => (
                      <li key={j} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-gray-300">☐</span> {item.description}
                        {item.required && <span className="text-red-400">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => handleDuplicate(detail.id)} className="flex-1 btn-secondary text-sm">📋 Duplikat</button>
                <button onClick={() => handleDelete(detail.id, detail.name)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">🗑 Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* Create form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">+ Buat Template Baru</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Template *</label>
                  <input className="input-field" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Checklist AC Bulanan" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
                    <select className="input-field" value={form.template_type} onChange={e => setForm(f => ({ ...f, template_type: e.target.value }))}>
                      {Object.keys(TYPE_LABEL).map(k => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Est. Menit</label>
                    <input type="number" className="input-field" min={5} value={form.estimated_minutes} onChange={e => setForm(f => ({ ...f, estimated_minutes: +e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                  <input className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="HVAC, Plumbing, Listrik..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Item Checklist (Seksi 1)</label>
                  {form.sections[0].items.map((item, i) => (
                    <input key={i} className="input-field mb-1" value={item.description}
                      onChange={e => updateItem(0, i, e.target.value)}
                      placeholder={`Item ${i + 1}...`} />
                  ))}
                  <button type="button" onClick={() => addItem(0)} className="text-xs text-teal-600 hover:underline mt-1">+ Tambah item</button>
                </div>
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
