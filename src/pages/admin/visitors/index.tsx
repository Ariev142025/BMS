import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { visitorsApi, buildingsApi } from '@/lib/api'

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminVisitors() {
  const { user, loading, logout } = useAuth(['building_admin', 'super_admin', 'company_admin'])
  const [visits, setVisits] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'active' | 'today'>('active')
  const [search, setSearch] = useState('')
  const [building, setBuilding] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)

  const fetchVisits = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const { data } = await visitorsApi.active({ building_id: user.building_id })
      setVisits(data)
    } catch {
      setError('Gagal memuat data tamu')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchVisits()
    buildingsApi.list().then(r => {
      const found = (r.data as any[]).find((b: any) => b.id === user.building_id)
      setBuilding(found || null)
    }).catch(() => {})
  }, [user])

  const handleCheckout = async (visitId: string) => {
    if (!confirm('Checkout tamu ini?')) return
    try {
      await visitorsApi.checkout(visitId)
      setSelected(null)
      fetchVisits()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal checkout')
    }
  }

  const filtered = visits.filter(v =>
    !search ||
    v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.host_tenant?.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose?.toLowerCase().includes(search.toLowerCase())
  )

  const onPremise = filtered.filter(v => v.status === 'on_premise')
  const scheduled = filtered.filter(v => v.status === 'scheduled')

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  return (
    <>
      <Head><title>Manajemen Tamu — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Manajemen Tamu">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">👥 Tamu {building?.name || ''}</h2>
            <p className="text-sm text-gray-500">Monitor tamu aktif & terjadwal secara realtime</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchVisits} className="btn-secondary text-sm">🔄 Refresh</button>
            <a href="/tro/dashboard" className="btn-primary text-sm">🪪 Buka TRO Dashboard</a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Di dalam gedung', value: onPremise.length, color: 'border-green-400', icon: '🟢' },
            { label: 'Terjadwal', value: scheduled.length, color: 'border-blue-400', icon: '📅' },
            { label: 'Total aktif', value: visits.length, color: 'border-teal-400', icon: '👥' },
            { label: 'VIP', value: visits.filter(v => v.is_vip).length, color: 'border-yellow-400', icon: '⭐' },
          ].map(k => (
            <div key={k.label} className={`card border-l-4 ${k.color}`}>
              <p className="text-2xl font-bold text-gray-800">{k.icon} {k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Tab */}
        <div className="card mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              className="input-field flex-1"
              placeholder="Cari nama tamu, tenant, tujuan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {[['active', '🟢 Aktif'], ['today', '📅 Terjadwal']].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${tab === k ? 'bg-white shadow text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tamu</th>
                  <th className="px-4 py-3 text-left">Tujuan & Host</th>
                  <th className="px-4 py-3 text-left">Check In</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {busy ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">⏳ Memuat data...</td></tr>
                ) : (tab === 'active' ? onPremise : scheduled).length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">
                    {tab === 'active' ? '✅ Tidak ada tamu di dalam gedung' : '📅 Tidak ada kunjungan terjadwal'}
                  </td></tr>
                ) : (tab === 'active' ? onPremise : scheduled).map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(v)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {v.is_vip && <span className="text-yellow-500">⭐</span>}
                        <div>
                          <p className="font-medium text-gray-800">{v.visitor_name}</p>
                          <p className="text-xs text-gray-400">{v.visitor_phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{v.purpose || '—'}</p>
                      <p className="text-xs text-gray-400">{v.host_name} · {v.host_tenant} Lt.{v.host_floor}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(v.actual_checkin || v.scheduled_start)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${v.status === 'on_premise' ? 'badge-green' : 'badge-blue'}`}>
                        {v.status === 'on_premise' ? '🟢 Di dalam' : '📅 Terjadwal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'on_premise' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleCheckout(v.id) }}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
                          ↩ Checkout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Detail Tamu {selected.is_vip && '⭐'}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Nama', selected.visitor_name],
                  ['Telepon', selected.visitor_phone || '—'],
                  ['Email', selected.visitor_email || '—'],
                  ['Plat nomor', selected.plate_number || '—'],
                  ['Tujuan', selected.purpose || '—'],
                  ['Host', `${selected.host_name} (${selected.host_tenant})`],
                  ['Lantai', selected.host_floor || '—'],
                  ['QR Code', selected.qr_code_uuid ? `...${selected.qr_code_uuid.slice(-8)}` : '—'],
                  ['Check In', fmt(selected.actual_checkin)],
                  ['Check Out', fmt(selected.actual_checkout)],
                  ['Status', selected.status],
                  ['Catatan', selected.notes || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-4">
                    <span className="text-gray-400 shrink-0">{l}</span>
                    <span className="font-medium text-gray-700 text-right">{v}</span>
                  </div>
                ))}
              </div>
              {selected.status === 'on_premise' && (
                <button onClick={() => handleCheckout(selected.id)} className="btn-primary w-full mt-5 py-2.5">
                  ↩ Checkout Tamu Ini
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">
          Untuk registrasi tamu baru, gunakan{' '}
          <a href="/tro/dashboard" className="text-teal-600 hover:underline">TRO Dashboard</a>
        </p>
      </AdminLayout>
    </>
  )
}
