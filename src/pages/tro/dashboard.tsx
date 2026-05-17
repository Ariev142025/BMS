import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { visitorsApi, buildingsApi } from '@/lib/api'
import Link from 'next/link'

export default function TRODashboard() {
  const { user, loading, logout } = useAuth(['tro', 'building_admin', 'super_admin'])
  const [visits, setVisits] = useState<any[]>([])
  const [building, setBuilding] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(true)
  const [lastQR, setLastQR] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', plate_number: '',
    host_name: '', host_tenant: '', host_floor: '', purpose: '',
    is_vip: false, notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [qrResult, setQrResult] = useState<any>(null)

  const fetchVisits = async () => {
    if (!user) return
    visitorsApi.active({ building_id: user.building_id })
      .then(r => setVisits(r.data))
      .finally(() => setBusy(false))
  }

  useEffect(() => {
    if (!user) return
    fetchVisits()
    buildingsApi.list().then(r => {
      const found = (r.data as any[]).find((b: any) => b.id === user.building_id)
      setBuilding(found || null)
    })
  }, [user])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setSubmitting(true)
    try {
      const { data } = await visitorsApi.register({
        building_id: user.building_id,
        visitor_data: {
          full_name: form.full_name, phone: form.phone,
          email: form.email, plate_number: form.plate_number,
          is_vip: form.is_vip, id_type: 'KTP',
        },
        host_name: form.host_name, host_tenant: form.host_tenant,
        host_floor: form.host_floor, purpose: form.purpose,
        plate_number: form.plate_number, notes: form.notes,
        scheduled_start: new Date().toISOString(),
      })
      setLastQR(data.qr_code_uuid)
      setShowForm(false)
      setForm({ full_name: '', phone: '', email: '', plate_number: '', host_name: '', host_tenant: '', host_floor: '', purpose: '', is_vip: false, notes: '' })
      fetchVisits()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal mendaftarkan tamu') }
    finally { setSubmitting(false) }
  }

  const handleCheckout = async (id: string) => {
    await visitorsApi.checkout(id)
    fetchVisits()
  }

  const validateQR = async () => {
    if (!qrInput.trim()) return
    try {
      const { data } = await visitorsApi.validateAccess('TRO-DESK-01', qrInput.trim())
      setQrResult(data)
      if (data.decision === 'allowed') fetchVisits()
    } catch { setQrResult({ decision: 'denied', message: 'Error memvalidasi QR' }) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>
  if (!user) return null

  const statusBadge = (s: string) => {
    if (s === 'on_premise') return <span className="badge-green">Dalam Gedung</span>
    if (s === 'scheduled') return <span className="badge-yellow">Terdaftar</span>
    return <span className="badge-gray">{s}</span>
  }

  return (
    <>
      <Head><title>TRO Dashboard — SOMA BMS</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-navy text-white px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center font-bold text-sm">SM</div>
              <div>
                <p className="font-bold leading-tight">SOMA BMS · TRO</p>
                <p className="text-xs text-gray-400">{building?.name || 'Building'} · {user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="text-xs text-gray-300 hover:text-white hidden sm:block">
                📊 Admin Dashboard
              </Link>
              <button onClick={logout} className="text-xs text-gray-300 hover:text-white">Keluar</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🪪', label: 'Tamu On-site', value: visits.filter(v => v.status === 'on_premise').length, color: 'text-green-600' },
              { icon: '📋', label: 'Terdaftar', value: visits.filter(v => v.status === 'scheduled').length, color: 'text-yellow-600' },
              { icon: '👥', label: 'Total Aktif', value: visits.length, color: 'text-teal-600' },
              { icon: '🏢', label: 'Gedung', value: building?.floors_count ? `${building.floors_count} Lt` : '—', color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: QR Validate + Register */}
            <div className="space-y-4">
              {/* QR Validator */}
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-3">🔍 Validasi QR Akses</h3>
                <div className="space-y-2">
                  <input className="input-field font-mono text-xs" placeholder="Tempel / scan QR code UUID..."
                    value={qrInput} onChange={e => setQrInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && validateQR()} />
                  <button onClick={validateQR} className="btn-primary w-full text-sm">🔍 Validasi</button>
                </div>
                {qrResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${qrResult.decision === 'allowed' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="font-semibold">{qrResult.decision === 'allowed' ? '✅ AKSES DIBERIKAN' : '❌ AKSES DITOLAK'}</p>
                    {qrResult.visitor_name && <p className="text-xs mt-1">👤 {qrResult.visitor_name} {qrResult.is_vip ? '⭐ VIP' : ''}</p>}
                    {qrResult.host && <p className="text-xs text-gray-600">🏢 {qrResult.host}</p>}
                    <p className="text-xs text-gray-600 mt-1">{qrResult.message}</p>
                  </div>
                )}
              </div>

              {/* Last QR */}
              {lastQR && (
                <div className="card border-2 border-teal-200 bg-teal-50">
                  <p className="text-sm font-semibold text-teal-800 mb-2">✅ Tamu Baru Terdaftar!</p>
                  <p className="text-xs text-gray-600 mb-2">QR Code UUID (berikan ke tamu):</p>
                  <p className="font-mono text-xs bg-white rounded p-2 border break-all select-all">{lastQR}</p>
                  <button onClick={() => setLastQR(null)} className="text-xs text-teal-600 mt-2 hover:underline">Tutup</button>
                </div>
              )}

              {/* Register button */}
              <button onClick={() => setShowForm(true)} className="btn-primary w-full text-sm py-3">
                + Daftarkan Tamu Baru
              </button>
            </div>

            {/* Right: Active Visitors Table */}
            <div className="lg:col-span-2 card overflow-hidden p-0">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">🪪 Tamu Aktif</h3>
                <button onClick={fetchVisits} className="text-xs text-teal-600 hover:underline">🔄 Refresh</button>
              </div>
              {busy ? (
                <div className="text-center py-12 text-gray-400">⏳ Memuat...</div>
              ) : visits.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">🪪</p>
                  <p className="text-gray-400 text-sm">Tidak ada tamu aktif</p>
                  <p className="text-gray-300 text-xs mt-1">Klik tombol "Daftarkan Tamu Baru" untuk mulai</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{['Nama Tamu', 'Tujuan', 'Host / Tenant', 'Status', 'Checkin', 'Aksi'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {visits.map(v => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold">
                                {v.visitor?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{v.visitor?.full_name || '—'}</p>
                                {v.visitor?.is_vip && <span className="text-xs text-yellow-600">⭐ VIP</span>}
                                {v.plate_number && <p className="text-xs text-gray-400">{v.plate_number}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{v.purpose || '—'}</td>
                          <td className="px-4 py-3 text-xs">
                            <p className="text-gray-700">{v.host_tenant || '—'}</p>
                            {v.host_floor && <p className="text-gray-400">Lt.{v.host_floor}</p>}
                          </td>
                          <td className="px-4 py-3">{statusBadge(v.status)}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {v.actual_checkin ? new Date(v.actual_checkin).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {v.status === 'on_premise' && (
                              <button onClick={() => handleCheckout(v.id)}
                                className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                Checkout
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Register Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold">Daftarkan Tamu Baru</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Data Tamu</label>
                  <input className="input-field" required placeholder="Nama Lengkap *"
                    value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="No. HP" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <input className="input-field" placeholder="No. Plat Kendaraan" value={form.plate_number} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vip" checked={form.is_vip} onChange={e => setForm(f => ({ ...f, is_vip: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="vip" className="text-sm text-gray-700">⭐ Tamu VIP</label>
                </div>
                <hr />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Tujuan Kunjungan</label>
                  <input className="input-field" placeholder="Nama yang dituju" value={form.host_name} onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Nama Tenant / Perusahaan" value={form.host_tenant} onChange={e => setForm(f => ({ ...f, host_tenant: e.target.value }))} />
                  <input className="input-field" placeholder="Lantai" value={form.host_floor} onChange={e => setForm(f => ({ ...f, host_floor: e.target.value }))} />
                </div>
                <input className="input-field" placeholder="Keperluan / Tujuan kunjungan" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                <textarea className="input-field" rows={2} placeholder="Catatan tambahan" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Mendaftar...' : '✅ Daftarkan & Buat QR'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
