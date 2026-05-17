import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { materialsApi } from '@/lib/api'

export default function MaterialsPage() {
  const { user, loading, logout } = useAuth(['building_admin','super_admin','company_admin'])
  const [materials, setMaterials] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [tab, setTab] = useState<'stock'|'requests'|'transactions'>('stock')
  const [busy, setBusy] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTxn, setShowTxn] = useState<any>(null)
  const [lowOnly, setLowOnly] = useState(false)
  const [form, setForm] = useState({ name:'', code:'', category:'', unit:'pcs', current_stock:0, min_stock_threshold:5, price_per_unit:0 })
  const [txnForm, setTxnForm] = useState({ transaction_type:'stock_in', quantity:1, notes:'' })

  const fetch_ = async () => {
    if (!user) return
    Promise.all([
      materialsApi.list({ building_id: user.building_id, low_stock_only: lowOnly || undefined }),
      materialsApi.requests.list({ building_id: user.building_id }),
    ]).then(([m, r]) => { setMaterials(m.data); setRequests(r.data) }).finally(() => setBusy(false))
  }
  useEffect(() => { if (user) fetch_() }, [user, lowOnly])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    try {
      const { data } = await materialsApi.create({ ...form, building_id: user.building_id })
      setMaterials(p => [data, ...p])
      setShowForm(false)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  const handleTxn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showTxn) return
    try {
      await materialsApi.transaction({ ...txnForm, material_id: showTxn.id })
      setShowTxn(null)
      fetch_()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
  }

  const approveReq = async (id: string, approved: boolean) => {
    await materialsApi.requests.approve(id, approved)
    fetch_()
  }

  if (loading) return null
  if (!user) return null
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <>
      <Head><title>Material — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Manajemen Material & Stok">
        <div className="flex gap-2 mb-5 border-b">
          {([['stock','📦 Stok'],['requests',`📋 Request${pendingCount>0?` (${pendingCount})`:''}`]] as [string,string][]).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab===k?'border-teal-600 text-teal-600':'border-transparent text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'stock' && (
          <>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={lowOnly} onChange={e=>setLowOnly(e.target.checked)} className="w-4 h-4 rounded accent-teal-600"/>
                <span className="text-gray-600">Stok rendah saja</span>
              </label>
              <span className="text-sm text-gray-500">{materials.length} item · {materials.filter(m=>m.is_low_stock).length} stok rendah</span>
              <div className="ml-auto"><button onClick={()=>setShowForm(true)} className="btn-primary">+ Tambah Material</button></div>
            </div>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Kode','Nama','Kategori','Stok','Min. Stok','Satuan','Harga','Status'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {busy ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">⏳ Memuat...</td></tr> :
                   materials.map(m => (
                    <tr key={m.id} className={`hover:bg-gray-50 ${m.is_low_stock ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{m.code||'—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                      <td className="px-4 py-3 text-gray-500">{m.category||'—'}</td>
                      <td className={`px-4 py-3 font-bold ${m.is_low_stock?'text-red-600':'text-gray-800'}`}>{m.current_stock}</td>
                      <td className="px-4 py-3 text-gray-400">{m.min_stock_threshold}</td>
                      <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.price_per_unit>0?`Rp${m.price_per_unit.toLocaleString('id-ID')}`:'—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={m.is_low_stock?'badge-red':'badge-green'}>{m.is_low_stock?'⚠️ Rendah':'Cukup'}</span>
                          <button onClick={() => { setShowTxn(m); setTxnForm({transaction_type:'stock_in',quantity:1,notes:''}) }}
                            className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded hover:bg-teal-100">+/-</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="card text-center py-12 text-gray-400"><p className="text-3xl mb-2">📋</p><p>Tidak ada request material</p></div>
            ) : requests.map(r => (
              <div key={r.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{r.material_name}</p>
                  <p className="text-sm text-gray-500">{r.quantity} {r.unit} · {r.reason||'—'}</p>
                  <p className="text-xs text-gray-400">{r.created_at?new Date(r.created_at).toLocaleString('id-ID'):''}</p>
                </div>
                <span className={`${r.status==='pending'?'badge-yellow':r.status==='approved_by_spv'?'badge-blue':r.status==='rejected'?'badge-red':'badge-green'} mr-2`}>{r.status}</span>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => approveReq(r.id, true)} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg">✅ Setuju</button>
                    <button onClick={() => approveReq(r.id, false)} className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg">❌ Tolak</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Material Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b flex justify-between"><h3 className="font-bold">Tambah Material</h3><button onClick={()=>setShowForm(false)} className="text-gray-400">✕</button></div>
              <form onSubmit={handleCreate} className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Kode (opsional)" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))}/>
                  <input className="input-field" required placeholder="Nama *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Kategori" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}/>
                  <input className="input-field" required placeholder="Satuan (pcs, liter...)" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-600 mb-1">Stok Awal</label><input type="number" className="input-field" min={0} value={form.current_stock} onChange={e=>setForm(f=>({...f,current_stock:+e.target.value}))}/></div>
                  <div><label className="block text-xs text-gray-600 mb-1">Min. Stok</label><input type="number" className="input-field" min={0} value={form.min_stock_threshold} onChange={e=>setForm(f=>({...f,min_stock_threshold:+e.target.value}))}/></div>
                  <div><label className="block text-xs text-gray-600 mb-1">Harga/unit</label><input type="number" className="input-field" min={0} value={form.price_per_unit} onChange={e=>setForm(f=>({...f,price_per_unit:+e.target.value}))}/></div>
                </div>
                <div className="flex gap-3"><button type="submit" className="btn-primary flex-1">Simpan</button><button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1">Batal</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTxn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm">
              <div className="px-6 py-4 border-b flex justify-between">
                <div><h3 className="font-bold">Transaksi Stok</h3><p className="text-xs text-gray-500">{showTxn.name} · Stok: {showTxn.current_stock} {showTxn.unit}</p></div>
                <button onClick={() => setShowTxn(null)} className="text-gray-400">✕</button>
              </div>
              <form onSubmit={handleTxn} className="p-5 space-y-3">
                <select className="input-field" value={txnForm.transaction_type} onChange={e=>setTxnForm(f=>({...f,transaction_type:e.target.value}))}>
                  <option value="stock_in">📥 Stock In (Terima)</option>
                  <option value="usage">📤 Usage (Pakai)</option>
                  <option value="return">↩️ Return (Kembalikan)</option>
                  <option value="adjustment">🔧 Adjustment (Koreksi)</option>
                </select>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {txnForm.transaction_type === 'adjustment' ? 'Stok Baru (set ke)' : 'Jumlah'}
                  </label>
                  <input type="number" className="input-field" required min={0.1} step={0.1} value={txnForm.quantity} onChange={e=>setTxnForm(f=>({...f,quantity:+e.target.value}))}/>
                </div>
                <input className="input-field" placeholder="Catatan (opsional)" value={txnForm.notes} onChange={e=>setTxnForm(f=>({...f,notes:e.target.value}))}/>
                <div className="flex gap-3"><button type="submit" className="btn-primary flex-1">Simpan</button><button type="button" onClick={()=>setShowTxn(null)} className="btn-secondary flex-1">Batal</button></div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
