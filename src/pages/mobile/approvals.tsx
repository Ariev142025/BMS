import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { workOrdersApi, materialsApi } from '@/lib/api'

export default function MobileApprovals() {
  const { user, loading, logout } = useAuth(['spv_teknisi', 'spv_housekeeping', 'building_admin', 'super_admin'])
  const [wos, setWOs] = useState<any[]>([])
  const [matReqs, setMatReqs] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'wo' | 'material'>('wo')

  const fetchData = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const [w, m] = await Promise.all([
        workOrdersApi.list({ status: 'pending_approval', building_id: user.building_id }),
        materialsApi.requests.list({ status: 'pending', building_id: user.building_id }),
      ])
      setWOs(w.data.items || w.data)
      setMatReqs(m.data.items || m.data)
    } catch { setError('Gagal memuat data approval') }
    finally { setBusy(false) }
  }

  useEffect(() => { if (user) fetchData() }, [user])

  const approveWO = async (id: string, approved: boolean) => {
    try {
      await workOrdersApi.approve(id, approved)
      setWOs(prev => prev.filter(w => w.id !== id))
    } catch { setError('Gagal memproses approval WO') }
  }

  const approveMat = async (id: string, approved: boolean) => {
    try {
      await materialsApi.requests.approve(id, approved)
      setMatReqs(prev => prev.filter(r => r.id !== id))
    } catch { setError('Gagal memproses approval material') }
  }

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const prio: Record<string, string> = { emergency: 'text-red-600', high: 'text-orange-500', medium: 'text-yellow-500', low: 'text-blue-500' }

  return (
    <MobileLayout user={user} onLogout={logout} title="Approval">
      <div className="p-4">
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">❌ {error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {([['wo', `📋 Work Order (${wos.length})`], ['material', `🔧 Material (${matReqs.length})`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-500">
            {tab === 'wo' ? `${wos.length} WO menunggu approval` : `${matReqs.length} request material menunggu`}
          </p>
          <button onClick={fetchData} className="text-xs text-teal-600">🔄 Refresh</button>
        </div>

        {busy ? (
          <div className="text-center py-10 text-gray-400">Memuat...</div>
        ) : tab === 'wo' ? (
          wos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 text-sm">Tidak ada WO menunggu approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wos.map(wo => (
                <div key={wo.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm flex-1 pr-2">{wo.title}</p>
                    <span className={`text-xs font-bold ${prio[wo.priority] || 'text-gray-500'}`}>{wo.priority?.toUpperCase()}</span>
                  </div>
                  {wo.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{wo.description}</p>}
                  <p className="text-xs text-gray-400 mb-3">{wo.category}{wo.floor ? ` · Lantai ${wo.floor}` : ''}{wo.location ? ` · ${wo.location}` : ''}</p>
                  <div className="flex gap-2">
                    <button onClick={() => approveWO(wo.id, false)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">❌ Tolak</button>
                    <button onClick={() => approveWO(wo.id, true)} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold">✅ Setuju</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          matReqs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 text-sm">Tidak ada request material menunggu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matReqs.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{req.material?.name || req.material_id}</p>
                  <p className="text-xs text-gray-500 mb-1">Jumlah: <span className="font-semibold">{req.quantity} {req.material?.unit || ''}</span></p>
                  {req.reason && <p className="text-xs text-gray-400 mb-3">{req.reason}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => approveMat(req.id, false)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">❌ Tolak</button>
                    <button onClick={() => approveMat(req.id, true)} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold">✅ Setuju</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </MobileLayout>
  )
}
