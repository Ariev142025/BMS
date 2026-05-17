import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { alarmsApi } from '@/lib/api'

const SC: Record<string,string> = { emergency:'border-l-4 border-red-500 bg-red-50', critical:'border-l-4 border-orange-500 bg-orange-50', major:'border-l-4 border-yellow-500 bg-yellow-50', warning:'border-l-4 border-blue-500 bg-blue-50', info:'border-l-4 border-gray-300 bg-gray-50' }
const SI: Record<string,string> = { emergency:'🔴', critical:'🟠', major:'🟡', warning:'🔵', info:'⚪' }

export default function MobileAlarms() {
  const { user, loading, logout } = useAuth()
  const [alarms, setAlarms] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [fSev, setFSev] = useState('')
  const [actingId, setActingId] = useState<string|null>(null)

  const fetchAlarms = useCallback(async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const { data } = await alarmsApi.list({ building_id: user.building_id, severity: fSev || undefined })
      setAlarms(Array.isArray(data) ? data : data.items || [])
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Gagal memuat alarm')
    } finally {
      setBusy(false)
    }
  }, [user, fSev])

  useEffect(() => { if (user) fetchAlarms() }, [fetchAlarms])

  const handleAck = async (id: string) => {
    setActingId(id)
    try {
      await alarmsApi.ack(id)
      fetchAlarms()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal acknowledge')
    } finally {
      setActingId(null)
    }
  }

  const handleResolve = async (id: string) => {
    setActingId(id)
    try {
      await alarmsApi.resolve(id)
      fetchAlarms()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal resolve')
    } finally {
      setActingId(null)
    }
  }

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const active = alarms.filter(a => a.status === 'active')
  const acked = alarms.filter(a => a.status === 'acknowledged')

  return (
    <>
      <Head><title>Alarm — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Alarm">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {[['','Semua'],['emergency','🔴 Darurat'],['critical','🟠 Kritis'],['major','🟡 Mayor'],['warning','🔵 Warning']].map(([v, l]) => (
            <button key={v} onClick={() => setFSev(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                ${fSev === v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'}`}>
              {l}
            </button>
          ))}
          <button onClick={fetchAlarms} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">🔄 Refresh</button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Aktif', value: active.length, color: 'text-red-600' },
            { label: 'Diakui', value: acked.length, color: 'text-orange-500' },
            { label: 'Total', value: alarms.length, color: 'text-gray-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-gray-400">{k.label}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error} <button onClick={fetchAlarms} className="underline ml-2">Coba lagi</button></div>}

        {busy ? (
          <div className="text-center py-16 text-gray-400">⏳ Memuat alarm...</div>
        ) : alarms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 font-medium">Tidak ada alarm aktif</p>
            <p className="text-xs text-gray-400 mt-1">Semua sistem berjalan normal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map(a => (
              <div key={a.id} className={`rounded-2xl p-4 shadow-sm ${SC[a.severity] || SC.info}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{SI[a.severity]} {a.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-red-100 text-red-700' : a.status === 'acknowledged' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {a.status}
                      </span>
                    </div>
                    {a.message && <p className="text-xs text-gray-600 mb-1">{a.message}</p>}
                    {a.location && <p className="text-xs text-gray-400">📍 {a.location}{a.floor ? ` Lt.${a.floor}` : ''}</p>}
                    <p className="text-xs text-gray-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : ''}</p>
                  </div>
                </div>
                {(a.status === 'active' || a.status === 'acknowledged') && (
                  <div className="flex gap-2 mt-3">
                    {a.status === 'active' && (
                      <button onClick={() => handleAck(a.id)} disabled={actingId === a.id}
                        className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors">
                        {actingId === a.id ? '⏳...' : '👁 Acknowledge'}
                      </button>
                    )}
                    <button onClick={() => handleResolve(a.id)} disabled={actingId === a.id}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors">
                      {actingId === a.id ? '⏳...' : '✅ Resolve'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </MobileLayout>
    </>
  )
}
