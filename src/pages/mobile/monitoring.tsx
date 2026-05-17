import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { alarmsApi, dashboardApi, createWsConnection } from '@/lib/api'
import { getCookie } from 'cookies-next'

const SEV_COLOR: Record<string,string> = { emergency:'bg-red-500', critical:'bg-orange-500', major:'bg-yellow-400', warning:'bg-blue-400', info:'bg-gray-400' }
const SEV_ICON: Record<string,string> = { emergency:'🔴', critical:'🟠', major:'🟡', warning:'🔵', info:'⚪' }

export default function MobileMonitoring() {
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [alarms, setAlarms] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [wsStatus, setWsStatus] = useState<'connecting'|'connected'|'disconnected'>('disconnected')
  const [wsEvents, setWsEvents] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const [s, a] = await Promise.all([
        dashboardApi.myStats(),
        alarmsApi.list({ building_id: user.building_id, limit: 10 }),
      ])
      setStats(s.data)
      setAlarms(Array.isArray(a.data) ? a.data.slice(0, 10) : (a.data?.items || []).slice(0, 10))
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Gagal memuat data monitoring')
    } finally {
      setBusy(false)
    }
  }, [user])

  // WebSocket realtime connection
  const connectWs = useCallback(() => {
    if (!user?.building_id) return
    const token = getCookie('access_token') as string
    const ws = createWsConnection(user.building_id, token)
    if (!ws) return

    setWsStatus('connecting')
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      // Ping setiap 30 detik agar koneksi tidak timeout
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      }, 30000)
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type === 'pong' || msg.type === 'connected') return
        setWsEvents(prev => [{ ...msg, _ts: new Date().toLocaleTimeString('id-ID') }, ...prev].slice(0, 20))
        // Jika ada alarm baru — refresh data
        if (msg.type === 'alarm') fetchData()
      } catch {}
    }

    ws.onerror = () => setWsStatus('disconnected')
    ws.onclose = () => {
      setWsStatus('disconnected')
      if (pingRef.current) clearInterval(pingRef.current)
      // Auto reconnect setelah 5 detik
      setTimeout(() => { if (wsRef.current?.readyState !== WebSocket.OPEN) connectWs() }, 5000)
    }
  }, [user, fetchData])

  useEffect(() => {
    if (user) {
      fetchData()
      connectWs()
    }
    return () => {
      wsRef.current?.close()
      if (pingRef.current) clearInterval(pingRef.current)
    }
  }, [user])

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const activeAlarms = alarms.filter(a => a.status === 'active')

  return (
    <>
      <Head><title>Monitoring — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Monitoring Realtime">
        {/* WebSocket status */}
        <div className={`flex items-center gap-2 rounded-xl p-3 mb-4 text-sm ${wsStatus === 'connected' ? 'bg-green-50 text-green-700' : wsStatus === 'connecting' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500 animate-pulse' : wsStatus === 'connecting' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
          <span className="font-medium">
            {wsStatus === 'connected' ? 'Realtime terhubung' : wsStatus === 'connecting' ? 'Menghubungkan...' : 'Offline — data statis'}
          </span>
          {wsStatus === 'disconnected' && (
            <button onClick={connectWs} className="ml-auto text-xs underline">Reconnect</button>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error} <button onClick={fetchData} className="underline ml-2">Coba lagi</button></div>}

        {/* Active alarm banner */}
        {activeAlarms.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="font-semibold text-red-700 mb-2">🚨 {activeAlarms.length} Alarm Aktif</p>
            {activeAlarms.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm text-red-600 mb-1">
                <span>{SEV_ICON[a.severity]}</span>
                <span className="truncate">{a.title}</span>
                {a.location && <span className="text-xs text-red-400 shrink-0">· {a.location}</span>}
              </div>
            ))}
            {activeAlarms.length > 3 && <p className="text-xs text-red-400 mt-1">+{activeAlarms.length - 3} lainnya</p>}
          </div>
        )}

        {/* Stats grid */}
        {busy ? <div className="text-center py-8 text-gray-400">⏳ Memuat data...</div> : stats && (
          <>
            <h3 className="font-semibold text-gray-700 text-sm mb-3">📊 Status Hari Ini</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Task Saya Hari Ini', value: stats.today_tasks ?? '—', icon: '📋', color: 'text-teal-600' },
                { label: 'Selesai', value: stats.completed_today ?? '—', icon: '✅', color: 'text-green-600' },
                { label: 'Terlambat', value: stats.overdue ?? '—', icon: '⚠️', color: 'text-red-600' },
                { label: 'WO Aktif', value: stats.active_wo ?? '—', icon: '🔧', color: 'text-blue-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-2xl mb-1">{k.icon}</p>
                  <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Alarm history */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 text-sm">🔔 Alarm Terbaru</h3>
          <button onClick={fetchData} className="text-xs text-teal-600">🔄 Refresh</button>
        </div>
        {alarms.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-gray-500 text-sm">Tidak ada alarm</p>
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            {alarms.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SEV_COLOR[a.severity] || 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.location || '—'} · {a.status}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${a.status === 'active' ? 'bg-red-100 text-red-600' : a.status === 'acknowledged' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Realtime event log */}
        {wsEvents.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-700 text-sm mb-3">⚡ Event Realtime</h3>
            <div className="space-y-2">
              {wsEvents.map((ev, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-xs">
                  <span className="text-gray-400">{ev._ts}</span>
                  <span className="ml-2 font-medium text-gray-700">{ev.type}</span>
                  {ev.message && <span className="ml-2 text-gray-500">{ev.message}</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </MobileLayout>
    </>
  )
}
