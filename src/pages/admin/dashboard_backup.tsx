import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { dashboardApi, alarmsApi, workOrdersApi, buildingsApi } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const SEV_COLOR: Record<string, string> = {
  emergency: '#ef4444', critical: '#f97316',
  major: '#eab308', warning: '#3b82f6', info: '#9ca3af',
}
const SEV_BADGE: Record<string, string> = {
  emergency: 'badge-red', critical: 'badge-orange',
  major: 'badge-yellow', warning: 'badge-blue', info: 'badge-gray',
}
const PRIO_BADGE: Record<string, string> = {
  emergency: 'badge-red', high: 'badge-orange',
  medium: 'badge-yellow', low: 'badge-blue',
}
const STAT_BADGE: Record<string, string> = {
  completed: 'badge-green', in_progress: 'badge-blue',
  assigned: 'badge-yellow', open: 'badge-gray', pending_approval: 'badge-orange',
}

function KpiCard({ label, value, sub, color }: {
  label: string; value: string | number; sub: string; color: string
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '12px', color: '#999', fontWeight: 500 }}>{label}</p>
      <div>
        <p style={{ fontSize: '28px', fontWeight: 600, color, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>{sub}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth([
    'building_admin', 'super_admin', 'company_admin', 'spv_teknisi',
  ])
  const [stats, setStats] = useState<any>(null)
  const [alarms, setAlarms] = useState<any[]>([])
  const [recentWO, setRecentWO] = useState<any[]>([])
  const [building, setBuilding] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      dashboardApi.adminStats(user.building_id),
      alarmsApi.list(),
      workOrdersApi.list({ building_id: user.building_id }),
      buildingsApi.list(),
    ]).then(([s, a, w, b]) => {
      setStats(s.data)
      const alarmItems = Array.isArray(a.data) ? a.data : a.data?.items || []
      const woItems = Array.isArray(w.data) ? w.data : w.data?.items || []
      setAlarms(alarmItems.slice(0, 5))
      setRecentWO(woItems.slice(0, 6))
      const found = (Array.isArray(b.data) ? b.data : b.data?.items || [])
        .find((bld: any) => bld.id === user.building_id)
      setBuilding(found || null)
    }).catch(console.error)
  }, [user])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '28px', height: '28px', border: '2px solid #111',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: '13px', color: '#999' }}>Memuat...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
  if (!user) return null

  const chartData = stats ? [
    { name: 'Total',    v: stats.tasks.total_today, color: '#111' },
    { name: 'Selesai',  v: stats.tasks.completed,   color: '#22c55e' },
    { name: 'Terlambat',v: stats.tasks.overdue,      color: '#f87171' },
  ] : []

  const buildingName = building?.name || 'Gedung'

  return (
    <>
      <Head><title>Dashboard — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title={`Dashboard — ${buildingName}`}>

        {/* Building bar */}
        {building && (
          <div style={{
            background: '#fff', border: '1px solid #ebebeb',
            borderRadius: '10px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '36px', height: '36px', background: '#f5f5f5',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>🏢</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{building.name}</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                {building.address}
                {building.floors_count ? ` · ${building.floors_count} lantai` : ''}
                {building.total_area_m2 ? ` · ${building.total_area_m2.toLocaleString('id-ID')} m²` : ''}
              </p>
            </div>
            <span style={{
              marginLeft: 'auto', fontSize: '11px', fontWeight: 500,
              color: '#16a34a', background: '#f0fdf4',
              padding: '3px 10px', borderRadius: '20px',
            }}>Aktif</span>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <KpiCard
            label="Work Order Aktif"
            value={stats?.work_orders.open ?? '—'}
            sub={`${stats?.work_orders.emergency ?? 0} emergency`}
            color="#f97316"
          />
          <KpiCard
            label="Compliance PM"
            value={stats ? `${stats.tasks.compliance_percent}%` : '—'}
            sub={`${stats?.tasks.completed ?? 0}/${stats?.tasks.total_today ?? 0} selesai`}
            color="#111"
          />
          <KpiCard
            label="Alarm Aktif"
            value={stats?.alarms.active ?? '—'}
            sub={`${stats?.alarms.critical ?? 0} kritis`}
            color="#ef4444"
          />
          <KpiCard
            label="Tamu On-site"
            value={stats?.visitors.on_premise ?? '—'}
            sub={`${stats?.material_requests?.pending ?? 0} req. material`}
            color="#111"
          />
        </div>

        {/* Chart + Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '20px' }}>

          {/* Bar chart */}
          <div className="card">
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>
              Status Tugas Hari Ini
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#bbb' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#bbb' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px', border: '1px solid #ebebeb',
                    fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                  cursor={{ fill: '#f7f7f6' }}
                />
                <Bar dataKey="v" name="Jumlah" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="card">
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>Ringkasan</p>
            {[
              { label: 'Total Aset',          value: stats?.assets?.total ?? 0 },
              { label: 'WO Selesai Hari Ini', value: stats?.work_orders?.completed_today ?? 0 },
              { label: 'Material Pending',    value: stats?.material_requests?.pending ?? 0 },
              { label: 'Task Terlambat',      value: stats?.tasks?.overdue ?? 0, warn: true },
            ].map((r) => (
              <div key={r.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #f5f5f5',
              }}>
                <span style={{ fontSize: '12px', color: '#888' }}>{r.label}</span>
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: r.warn && r.value > 0 ? '#ef4444' : '#111',
                }}>{r.value}</span>
              </div>
            ))}

            {/* Compliance bar */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Compliance Rate</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>
                  {stats?.tasks?.compliance_percent ?? 0}%
                </span>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: '20px', height: '5px' }}>
                <div style={{
                  background: '#111', height: '5px', borderRadius: '20px',
                  width: `${stats?.tasks?.compliance_percent ?? 0}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Alarms + WO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Alarms */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Alarm Aktif</p>
              <Link href="/admin/alarms" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>
                Lihat semua →
              </Link>
            </div>
            {alarms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
                <p style={{ fontSize: '24px', marginBottom: '8px' }}>✓</p>
                <p style={{ fontSize: '13px' }}>Tidak ada alarm aktif</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {alarms.map((a) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px', background: '#fafafa',
                  }}>
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                      background: SEV_COLOR[a.severity] || '#ccc',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#bbb' }}>
                        {a.location}{a.floor ? ` · Lt. ${a.floor}` : ''}
                      </p>
                    </div>
                    <span className={SEV_BADGE[a.severity] || 'badge-gray'} style={{ textTransform: 'capitalize' }}>
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Orders */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Work Order Terbaru</p>
              <Link href="/admin/work-orders" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>
                Lihat semua →
              </Link>
            </div>
            {recentWO.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
                <p style={{ fontSize: '24px', marginBottom: '8px' }}>☐</p>
                <p style={{ fontSize: '13px' }}>Belum ada Work Order</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentWO.map((w) => (
                  <div key={w.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px', background: '#fafafa',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {w.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#bbb' }}>
                        {w.wo_number}{w.floor ? ` · Lt. ${w.floor}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className={PRIO_BADGE[w.priority] || 'badge-gray'} style={{ textTransform: 'capitalize' }}>
                        {w.priority}
                      </span>
                      <span className={STAT_BADGE[w.status] || 'badge-gray'} style={{ textTransform: 'capitalize' }}>
                        {w.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </AdminLayout>
    </>
  )
}