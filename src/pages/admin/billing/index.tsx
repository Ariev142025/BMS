import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { useState, useEffect } from 'react'
import { billingApi } from '@/lib/api'

const rp = (v: number) => `Rp${(v||0).toLocaleString('id-ID')}`

export default function BillingPage() {
  const { user, loading, logout } = useAuth(['building_admin','super_admin'])
  const [meters, setMeters] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [tariffs, setTariffs] = useState<any[]>([])
  const [tab, setTab] = useState('generate')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [showMeterForm, setShowMeterForm] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ tenant_name: '', period_start: '', period_end: '' })
  const [meterForm, setMeterForm] = useState({ meter_number: '', meter_type: 'electricity', unit: 'kWh', floor: '', tenant_name: '', multiplier: 1 })
  const [readingForm, setReadingForm] = useState({ reading_value: '', notes: '' })

  const fetchAll = async () => {
    if (!user) return
    setBusy(true); setError('')
    try {
      const [m, i, t] = await Promise.all([
        billingApi.meters.list({ building_id: user.building_id }),
        billingApi.invoices.list({ building_id: user.building_id }),
        billingApi.tariffs.list({ building_id: user.building_id }),
      ])
      setMeters(m.data || [])
      setInvoices(i.data || [])
      setTariffs(t.data || [])
    } catch { setError('Gagal memuat data billing') }
    finally { setBusy(false) }
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setGenerating(true)
    try {
      const { data } = await billingApi.invoices.generate({
        building_id: user.building_id,
        tenant_name: form.tenant_name || undefined,
        period_start: form.period_start,
        period_end: form.period_end,
      })
      setPreview(data)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal generate') }
    finally { setGenerating(false) }
  }

  const issue = async () => {
    try {
      await billingApi.invoices.issue({ ...preview, building_id: user?.building_id })
      setPreview(null)
      setForm({ tenant_name: '', period_start: '', period_end: '' })
      const { data } = await billingApi.invoices.list({ building_id: user?.building_id })
      setInvoices(data || [])
      alert('✅ Invoice berhasil diterbitkan')
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal terbitkan') }
  }

  const addMeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.building_id) return
    setSaving(true)
    try {
      await billingApi.meters.create({ ...meterForm, building_id: user.building_id, multiplier: +meterForm.multiplier })
      setShowMeterForm(false)
      setMeterForm({ meter_number: '', meter_type: 'electricity', unit: 'kWh', floor: '', tenant_name: '', multiplier: 1 })
      fetchAll()
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal tambah meter') }
    finally { setSaving(false) }
  }

  const addReading = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showReadingForm) return
    setSaving(true)
    try {
      await billingApi.meters.addReading({ meter_id: showReadingForm.id, reading_value: +readingForm.reading_value, notes: readingForm.notes })
      setShowReadingForm(null)
      setReadingForm({ reading_value: '', notes: '' })
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Memuat...</div>
  if (!user) return null

  const TABS = [['generate','⚡ Generate Invoice'],['invoices','📄 Daftar Invoice'],['meters','🔌 Meter'],['tariffs','💰 Tarif']]

  return (
    <>
      <Head><title>Billing — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Billing & Invoice">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">❌ {error}</div>}

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1
                ${tab === k ? 'bg-white shadow text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>

        {/* GENERATE INVOICE */}
        {tab === 'generate' && (
          <div className="max-w-lg">
            <div className="card mb-4 bg-teal-50 border border-teal-100">
              <p className="text-sm text-teal-700">💡 Data meter diambil otomatis dari checklist rutin teknisi. Pastikan teknisi sudah mencatat angka meter sebelum generate invoice.</p>
            </div>
            {!preview ? (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4">Generate Invoice</h3>
                <form onSubmit={generate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Tenant (opsional — kosongkan untuk semua)</label>
                    <input className="input-field" placeholder="PT Contoh..." value={form.tenant_name} onChange={e => setForm(f => ({ ...f, tenant_name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Periode Mulai *</label>
                      <input type="date" className="input-field" required value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Periode Akhir *</label>
                      <input type="date" className="input-field" required value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" disabled={generating} className="btn-primary w-full py-2.5 disabled:opacity-50">
                    {generating ? '⏳ Menghitung...' : '⚡ Generate Invoice'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-800">Preview Invoice</h3>
                  <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕ Batal</button>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="text-gray-500">Tenant:</span> <span className="font-medium">{preview.tenant_name || 'Semua'}</span></p>
                  <p><span className="text-gray-500">Periode:</span> <span className="font-medium">{preview.period_start?.slice(0,10)} s/d {preview.period_end?.slice(0,10)}</span></p>
                </div>
                {(preview.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 text-sm">
                    <p className="font-medium text-gray-800">{item.meter_number} — {item.meter_type}</p>
                    <p className="text-xs text-gray-400">{item.reading_start} → {item.reading_end} ({item.consumption} {item.unit}) × {rp(item.rate_per_unit)}</p>
                    <p className="font-semibold text-teal-700 mt-1">{rp(item.amount)}</p>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="font-bold text-gray-800 text-lg">Total: {rp(preview.total_amount)}</p>
                </div>
                <button onClick={issue} className="btn-primary w-full mt-4">📄 Terbitkan Invoice</button>
              </div>
            )}
          </div>
        )}

        {/* INVOICES */}
        {tab === 'invoices' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">No. Invoice</th>
                    <th className="px-4 py-3 text-left">Tenant</th>
                    <th className="px-4 py-3 text-left">Periode</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {busy ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">⏳ Memuat...</td></tr>
                  : invoices.length === 0 ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">Belum ada invoice</td></tr>
                  : invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.invoice_number}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{inv.tenant_name || 'Semua'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{inv.period_start?.slice(0,10)} – {inv.period_end?.slice(0,10)}</td>
                      <td className="px-4 py-3 font-semibold text-teal-700">{rp(inv.total_amount)}</td>
                      <td className="px-4 py-3"><span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'issued' ? 'badge-blue' : 'badge-gray'}`}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* METERS */}
        {tab === 'meters' && (
          <>
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowMeterForm(true)} className="btn-primary text-sm">+ Tambah Meter</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {busy ? <div className="col-span-3 text-center py-10 text-gray-400">⏳ Memuat...</div>
              : meters.length === 0 ? <div className="col-span-3 text-center py-10 text-gray-400 card">Belum ada meter. Klik + Tambah Meter atau jalankan seed data.</div>
              : meters.map(m => (
                <div key={m.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.meter_type === 'electricity' ? 'bg-yellow-50 text-yellow-700' : m.meter_type === 'water' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.meter_type === 'electricity' ? '⚡ Listrik' : m.meter_type === 'water' ? '💧 Air' : '🌡️ Gas'}
                    </span>
                    <span className="text-xs text-gray-400">Lt. {m.floor || '—'}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{m.meter_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.tenant_name || '—'} · {m.unit} · ×{m.multiplier}</p>
                  <button onClick={() => setShowReadingForm(m)}
                    className="mt-3 w-full text-xs py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-medium transition-colors">
                    📊 Catat Pembacaan
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TARIFFS */}
        {tab === 'tariffs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {busy ? <div className="col-span-2 text-center py-10 text-gray-400">⏳ Memuat...</div>
            : tariffs.length === 0 ? <div className="col-span-2 text-center py-10 text-gray-400 card">Belum ada tarif</div>
            : tariffs.map(t => (
              <div key={t.id} className="card">
                <p className="font-semibold text-gray-800">{t.name || t.meter_type}</p>
                <p className="text-sm text-gray-500">{rp(t.rate_per_unit)} / {t.unit}</p>
                <p className="text-xs text-gray-400 mt-1">{t.effective_date ? `Efektif: ${t.effective_date.slice(0,10)}` : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Meter Modal */}
        {showMeterForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMeterForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">+ Tambah Meter Baru</h3>
                <button onClick={() => setShowMeterForm(false)} className="text-gray-400 text-xl">✕</button>
              </div>
              <form onSubmit={addMeter} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">No. Meter *</label>
                  <input className="input-field" required value={meterForm.meter_number} onChange={e => setMeterForm(f => ({ ...f, meter_number: e.target.value }))} placeholder="MTR-001" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
                    <select className="input-field" value={meterForm.meter_type} onChange={e => setMeterForm(f => ({ ...f, meter_type: e.target.value, unit: e.target.value === 'electricity' ? 'kWh' : e.target.value === 'water' ? 'm3' : 'm3' }))}>
                      <option value="electricity">⚡ Listrik</option>
                      <option value="water">💧 Air</option>
                      <option value="gas">🌡️ Gas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Satuan</label>
                    <input className="input-field" value={meterForm.unit} onChange={e => setMeterForm(f => ({ ...f, unit: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lantai</label>
                    <input className="input-field" value={meterForm.floor} onChange={e => setMeterForm(f => ({ ...f, floor: e.target.value }))} placeholder="1, 2, B1..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Multiplier</label>
                    <input type="number" min={1} className="input-field" value={meterForm.multiplier} onChange={e => setMeterForm(f => ({ ...f, multiplier: +e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Tenant</label>
                  <input className="input-field" value={meterForm.tenant_name} onChange={e => setMeterForm(f => ({ ...f, tenant_name: e.target.value }))} placeholder="PT Contoh Indonesia" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowMeterForm(false)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? '⏳...' : '+ Tambah'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Reading Modal */}
        {showReadingForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReadingForm(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">📊 Catat Pembacaan</h3>
                <button onClick={() => setShowReadingForm(null)} className="text-gray-400 text-xl">✕</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Meter: <strong>{showReadingForm.meter_number}</strong> ({showReadingForm.unit})</p>
              <form onSubmit={addReading} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Angka Meter *</label>
                  <input type="number" step="0.01" className="input-field" required value={readingForm.reading_value} onChange={e => setReadingForm(f => ({ ...f, reading_value: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                  <input className="input-field" value={readingForm.notes} onChange={e => setReadingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opsional..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowReadingForm(null)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? '⏳...' : '💾 Simpan'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
