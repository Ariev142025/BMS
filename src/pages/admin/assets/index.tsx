import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { assetsApi } from '@/lib/api'

const condColor: Record<string, string> = {
  good: 'badge-green', fair: 'badge-yellow', damaged: 'badge-red',
}

export default function AssetsPage() {
  const { user, loading, logout } = useAuth(['building_admin', 'super_admin', 'company_admin', 'spv_teknisi'])
  const [assets, setAssets] = useState<any[]>([])
  const [categories, setCategories] = useState<Record<string, string[]>>({})
  const [busy, setBusy] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState<any>(null)
  const [form, setForm] = useState({
    category: '', sub_category: '', name: '', asset_code: '',
    floor: '', location: '', brand: '', model: '', serial_number: '',
    condition: 'good', notes: '', quantity: 1,
  })

  const fetchAll = () => {
    if (!user) return
    Promise.all([
      assetsApi.list({ building_id: user.building_id }),
      assetsApi.categories(user.building_id),
    ]).then(([a, c]) => {
      setAssets(a.data)
      setCategories(c.data)
    }).finally(() => setBusy(false))
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const filtered = assets.filter(a =>
    (!filterCat || a.category === filterCat) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.asset_code || '').toLowerCase().includes(search.toLowerCase()))
  )

  const openCreate = () => {
    setEditAsset(null)
    setForm({ category: '', sub_category: '', name: '', asset_code: '', floor: '', location: '', brand: '', model: '', serial_number: '', condition: 'good', notes: '', quantity: 1 })
    setShowForm(true)
  }

  const openEdit = (a: any) => {
    setEditAsset(a)
    setForm({ category: a.category, sub_category: a.sub_category || '', name: a.name, asset_code: a.asset_code || '', floor: a.floor || '', location: a.location || '', brand: a.brand || '', model: a.model || '', serial_number: a.serial_number || '', condition: a.condition || 'good', notes: a.notes || '', quantity: a.quantity || 1 })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    try {
      if (editAsset) {
        const { data } = await assetsApi.update(editAsset.id, form)
        setAssets(p => p.map(a => a.id === editAsset.id ? data : a))
      } else {
        const { data } = await assetsApi.create({ ...form, building_id: user.building_id })
        setAssets(p => [data, ...p])
      }
      setShowForm(false)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus aset ini?')) return
    await assetsApi.delete(id)
    setAssets(p => p.filter(a => a.id !== id))
  }

  if (loading) return null
  if (!user) return null

  const catEmoji: Record<string, string> = { HVAC: '❄️', Elektrikal: '⚡', Plumbing: '💧', 'Fire Fighting': '🔥', Transportasi: '🛗', Housekeeping: '🧹' }

  return (
    <>
      <Head><title>Aset — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Manajemen Aset">
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <select className="input-field max-w-xs" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Semua Kategori</option>
            {Object.keys(categories).map(c => <option key={c} value={c}>{catEmoji[c] || '🔧'} {c}</option>)}
          </select>
          <input className="input-field max-w-xs" placeholder="🔍 Cari nama, kode, brand..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="text-sm text-gray-500">{filtered.length} aset</span>
          <div className="ml-auto">
            <button onClick={openCreate} className="btn-primary">+ Tambah Aset</button>
          </div>
        </div>

        {/* Category summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {Object.entries(categories).map(([cat, subs]) => {
            const count = assets.filter(a => a.category === cat).length
            return (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                className={`text-left p-3 rounded-xl border transition-all ${filterCat === cat ? 'bg-teal-50 border-teal-300' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                <p className="text-xl">{catEmoji[cat] || '🔧'}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{cat}</p>
                <p className="text-xs text-gray-400">{count} aset</p>
              </button>
            )
          })}
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Kode', 'Nama Aset', 'Kategori', 'Lantai', 'Brand / Model', 'Kondisi', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {busy ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">⏳ Memuat...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">Tidak ada aset</td></tr>
                    : filtered.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{a.asset_code || '—'}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                          <p className="truncate">{a.name}</p>
                          {a.location && <p className="text-xs text-gray-400 truncate">{a.location}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs">{catEmoji[a.category] || '🔧'} {a.category}</span>
                          {a.sub_category && <p className="text-xs text-gray-400">{a.sub_category}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">Lt.{a.floor || '?'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {a.brand && <p>{a.brand}</p>}
                          {a.model && <p className="text-gray-400">{a.model}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={condColor[a.condition] || 'badge-gray'}>{a.condition}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(a)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Edit</button>
                            <button onClick={() => handleDelete(a.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between">
                <h3 className="font-bold">{editAsset ? 'Edit Aset' : 'Tambah Aset'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                    <select className="input-field" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">— Pilih —</option>
                      {['HVAC', 'Elektrikal', 'Plumbing', 'Fire Fighting', 'Transportasi', 'Lainnya'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sub Kategori</label>
                    <input className="input-field" placeholder="AC Indoor, Genset..." value={form.sub_category} onChange={e => setForm(f => ({ ...f, sub_category: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Aset *</label>
                  <input className="input-field" required placeholder="AC Indoor Lt.5 Unit-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kode Aset</label>
                    <input className="input-field" placeholder="AC-LT5-01" value={form.asset_code} onChange={e => setForm(f => ({ ...f, asset_code: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lantai</label>
                    <input className="input-field" placeholder="5" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi</label>
                  <input className="input-field" placeholder="Ruang server, koridor..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                    <input className="input-field" placeholder="MITSUBISHI" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
                    <input className="input-field" placeholder="FDU140KXE6F" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kondisi</label>
                  <select className="input-field" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                    {[['good', 'Baik'], ['fair', 'Cukup'], ['damaged', 'Rusak']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">{editAsset ? 'Simpan' : 'Tambah Aset'}</button>
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
