import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { workOrdersApi } from '@/lib/api'

const prioColors: Record<string,string> = { emergency:'text-red-600 bg-red-100',high:'text-orange-600 bg-orange-100',medium:'text-yellow-600 bg-yellow-100',low:'text-blue-600 bg-blue-100' }
const statColors: Record<string,string> = { completed:'badge-green',in_progress:'badge-blue',assigned:'badge-yellow',open:'badge-gray' }

export default function MobileWorkOrders() {
  const { user, loading, logout } = useAuth(['teknisi','housekeeping','spv_teknisi','spv_housekeeping','building_admin'])
  const [wos, setWOs] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [activeWO, setActiveWO] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!user) return
    workOrdersApi.myWO().then(r => setWOs(r.data)).finally(() => setBusy(false))
  }, [user])

  const openWO = async (wo: any) => {
    if (wo.status === 'assigned') {
      await workOrdersApi.update(wo.id, { status: 'in_progress' })
      wo.status = 'in_progress'
    }
    setActiveWO(wo)
    const steps = wo.checklist_steps || []
    setResults(steps.map(() => ({ value: null })))
    setMaterials(wo.materials_used || [])
    setNotes('')
  }

  const completeWO = async () => {
    if (!activeWO) return
    setUpdating(true)
    try {
      await workOrdersApi.update(activeWO.id, {
        status: 'pending_approval',
        checklist_results: results,
        materials_used: materials,
      })
      setWOs(prev => prev.filter(w => w.id !== activeWO.id))
      setActiveWO(null)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setUpdating(false) }
  }

  if (loading) return null
  if (!user) return null

  // WO Detail View
  if (activeWO) {
    const steps = activeWO.checklist_steps || []
    const donePct = steps.length > 0 ? Math.round(results.filter(r=>r.value).length/steps.length*100) : 0

    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
        <header className="bg-navy text-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveWO(null)} className="text-white/80">←</button>
            <div className="flex-1">
              <p className="font-semibold text-sm">WO {activeWO.wo_number}</p>
              <p className="text-xs text-gray-300">{activeWO.title}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioColors[activeWO.priority]||'badge-gray'}`}>{activeWO.priority}</span>
          </div>
          {steps.length > 0 && (
            <div className="mt-2 bg-white/20 rounded-full h-1.5">
              <div className="bg-teal-400 h-1.5 rounded-full" style={{width:`${donePct}%`}}/>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><p className="text-gray-400">Lokasi</p><p className="font-medium text-gray-700">Lt.{activeWO.floor||'?'} · {activeWO.location||'—'}</p></div>
              <div><p className="text-gray-400">Tenggat</p><p className="font-medium text-gray-700">{activeWO.due_date?new Date(activeWO.due_date).toLocaleDateString('id-ID'):'—'}</p></div>
            </div>
            {activeWO.description && <p className="text-xs text-gray-600 mt-2">{activeWO.description}</p>}
          </div>

          <div className="px-4 py-4 space-y-3">
            {steps.length > 0 ? (
              <>
                <h3 className="text-sm font-semibold text-gray-700">Langkah Pengerjaan</h3>
                {steps.map((step: any, i: number) => (
                  <div key={i} className={`p-3 rounded-xl border-2 ${results[i]?.value ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                    <p className="text-sm text-gray-800 mb-2">{i+1}. {step.instruction||step}</p>
                    {!results[i]?.value ? (
                      <button onClick={() => setResults(prev => prev.map((r,ri) => ri===i ? {...r,value:'done'} : r))}
                        className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg">Tandai Selesai</button>
                    ) : <p className="text-xs text-green-600 font-medium">✅ Selesai</p>}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p className="text-3xl mb-2">🔧</p>
                <p className="text-sm">Tidak ada langkah spesifik. Kerjakan dan selesaikan.</p>
              </div>
            )}

            {/* Materials */}
            <div className="mobile-card">
              <p className="text-sm font-semibold text-gray-700 mb-2">📦 Material Digunakan</p>
              {materials.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-700">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.qty} {m.unit}</span>
                </div>
              ))}
              <button onClick={() => {
                const name = prompt('Nama material:')
                const qty = parseFloat(prompt('Jumlah:')||'0')
                const unit = prompt('Satuan (pcs, liter, kg):')||'pcs'
                if (name) setMaterials(p => [...p, {name, qty, unit}])
              }} className="mt-2 text-xs text-teal-600 hover:underline">+ Tambah Material</button>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Pekerjaan</label>
              <textarea className="mobile-input" rows={3} placeholder="Temuan, kendala, catatan penting..."
                value={notes} onChange={e => setNotes(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white border-t border-gray-100">
          <button onClick={completeWO} disabled={updating}
            className="mobile-btn bg-green-600 hover:bg-green-700">
            {updating ? 'Mengirim...' : '✅ Selesai & Minta Approval'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Work Order — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Work Order Saya">
        <div className="px-4 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{wos.length} WO aktif ditugaskan</p>
          </div>

          {busy ? (
            <div className="text-center py-12 text-gray-400">⏳ Memuat...</div>
          ) : wos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 font-medium">Tidak ada Work Order aktif</p>
              <p className="text-xs text-gray-400 mt-1">Semua pekerjaan sudah selesai</p>
            </div>
          ) : wos.map(wo => (
            <div key={wo.id} className={`mobile-card ${wo.priority==='emergency'?'border-red-300 bg-red-50':''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-mono text-gray-400">{wo.wo_number}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioColors[wo.priority]||''}`}>{wo.priority}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{wo.title}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 Lt.{wo.floor||'?'} · {wo.location||'Tidak ada lokasi'}</p>
                </div>
                <span className={`text-xs ${statColors[wo.status]||'badge-gray'}`}>{wo.status}</span>
              </div>

              {wo.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{wo.description}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  ⏰ {wo.due_date ? new Date(wo.due_date).toLocaleDateString('id-ID') : 'Tidak ada tenggat'}
                </span>
                <button onClick={() => openWO(wo)}
                  className="text-xs px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                  {wo.status === 'in_progress' ? '▶ Lanjut' : '▶ Mulai'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </MobileLayout>
    </>
  )
}
