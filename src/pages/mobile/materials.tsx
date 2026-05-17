import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { materialsApi, alarmsApi, workOrdersApi, usersApi, tasksApi } from '@/lib/api'

// Materials Page
export default function MobileMaterials() {
  const { user, loading, logout } = useAuth(['teknisi','housekeeping','spv_teknisi','spv_housekeeping','building_admin'])
  const [materials, setMaterials] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [tab, setTab] = useState<'stock'|'requests'>('stock')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [form, setForm] = useState({ material_name:'', quantity:1, unit:'pcs', reason:'' })
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      materialsApi.list({ building_id: user.building_id }),
      materialsApi.requests.list({ building_id: user.building_id }),
    ]).then(([mr, rr]) => {
      setMaterials(mr.data)
      setRequests(rr.data)
    }).finally(() => setBusy(false))
  }, [user])

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    try {
      await materialsApi.requests.create({ ...form, building_id: user.building_id })
      const { data } = await materialsApi.requests.list({ building_id: user.building_id })
      setRequests(data)
      setShowRequestForm(false)
    } catch (e: any) { alert(e.response?.data?.detail||'Gagal') }
  }

  if (loading) return null
  if (!user) return null

  const statColors: Record<string,string> = { pending:'badge-yellow',approved_by_spv:'badge-blue',rejected:'badge-red',fulfilled:'badge-green' }

  return (
    <>
      <Head><title>Material — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Material & Stok">
        <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
          {[['stock','📦 Stok'],['requests','📋 Request']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab===k?'border-teal-600 text-teal-600':'border-transparent text-gray-500'}`}>
              {l}
              {k==='requests' && requests.filter(r=>r.status==='pending').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{requests.filter(r=>r.status==='pending').length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {tab === 'stock' && (
            <>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{materials.length} item</p>
                <span className="text-xs text-red-600">{materials.filter(m=>m.is_low_stock).length} stok rendah ⚠️</span>
              </div>
              {busy ? <div className="text-center py-10 text-gray-400">⏳ Memuat...</div> :
               materials.map(m => (
                <div key={m.id} className={`mobile-card ${m.is_low_stock?'border-red-200 bg-red-50':''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.category} · {m.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${m.is_low_stock?'text-red-600':'text-gray-800'}`}>{m.current_stock}</p>
                      <p className="text-xs text-gray-400">min: {m.min_stock_threshold}</p>
                    </div>
                  </div>
                  {m.is_low_stock && (
                    <button onClick={() => { setForm(f=>({...f,material_name:m.name,unit:m.unit})); setShowRequestForm(true) }}
                      className="mt-2 w-full text-xs py-2 bg-red-600 text-white rounded-lg">
                      ⚠️ Request Pengisian Stok
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setShowRequestForm(true)} className="mobile-btn mt-4">+ Request Material Baru</button>
            </>
          )}

          {tab === 'requests' && (
            <>
              <button onClick={() => setShowRequestForm(true)} className="mobile-btn mb-4">+ Request Material Baru</button>
              {requests.length === 0 ? (
                <div className="text-center py-10 text-gray-400"><p className="text-3xl mb-2">📦</p><p>Belum ada request</p></div>
              ) : requests.map(r => (
                <div key={r.id} className="mobile-card">
                  <div className="flex items-start justify-between">
                    <div><p className="font-semibold text-sm">{r.material_name}</p><p className="text-xs text-gray-500">{r.quantity} {r.unit} · {r.reason||'—'}</p></div>
                    <span className={statColors[r.status]||'badge-gray'}>{r.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{r.created_at?new Date(r.created_at).toLocaleDateString('id-ID'):''}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white rounded-t-2xl w-full max-w-md mx-auto p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Request Material</h3>
                <button onClick={() => setShowRequestForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={submitRequest} className="space-y-3">
                <input className="mobile-input" required placeholder="Nama material" value={form.material_name} onChange={e=>setForm(f=>({...f,material_name:e.target.value}))}/>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" className="mobile-input" required placeholder="Jumlah" min={0.1} step={0.1} value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:parseFloat(e.target.value)}))}/>
                  <input className="mobile-input" required placeholder="Satuan (pcs, kg...)" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/>
                </div>
                <textarea className="mobile-input" rows={2} placeholder="Alasan / keperluan" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/>
                <button type="submit" className="mobile-btn">📤 Kirim Request</button>
              </form>
            </div>
          </div>
        )}
      </MobileLayout>
    </>
  )
}
