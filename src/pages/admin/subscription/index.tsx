import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { saasApi } from '@/lib/api'

const rp = (v: number) => `Rp${v.toLocaleString('id-ID')}`

const PAYMENT_METHODS = [
  { key: 'VA_BCA',     icon: '🏦', name: 'Virtual Account BCA' },
  { key: 'VA_BNI',     icon: '🏦', name: 'Virtual Account BNI' },
  { key: 'VA_BRI',     icon: '🏦', name: 'Virtual Account BRI' },
  { key: 'VA_MANDIRI', icon: '🏦', name: 'Virtual Account Mandiri' },
  { key: 'QRIS',       icon: '📱', name: 'QRIS' },
  { key: 'DANA',       icon: '💙', name: 'DANA' },
  { key: 'OVO',        icon: '💜', name: 'OVO' },
  { key: 'GOPAY',      icon: '💚', name: 'GoPay' },
]

const STATUS_BADGE: Record<string, string> = {
  trial: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  past_due: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-600',
}

export default function SubscriptionPage() {
  const { user, loading, logout } = useAuth(['building_admin', 'super_admin', 'company_admin'])
  const router = useRouter()
  const [sub, setSub] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [tab, setTab] = useState<'overview'|'upgrade'|'history'>('overview')
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('VA_BCA')
  const [paying, setPaying] = useState(false)
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [busy, setBusy] = useState(true)

  const fetchAll = async () => {
    if (!user) return
    try {
      const [s, p, h] = await Promise.all([
        saasApi.subscription(),
        saasApi.plans(),
        saasApi.paymentHistory(),
      ])
      setSub(s.data)
      setPlans(p.data)
      setHistory(h.data)
      setSelectedPlan(s.data.plan)
    } finally { setBusy(false) }
  }

  useEffect(() => {
    if (!user) return
    fetchAll()
    if (router.query.new === '1') setTab('overview')
    if (router.query.status === 'paid') { fetchAll(); setTab('overview') }
  }, [user])

  const handleUpgrade = async () => {
    if (!selectedPlan) return
    setPaying(true)
    setPaymentResult(null)
    try {
      const { data } = await saasApi.createPayment({
        plan: selectedPlan, billing_cycle: billing, payment_method: paymentMethod,
      })
      setPaymentResult(data)
      setHistory(h => [{ ...data, status: 'pending', created_at: new Date().toISOString() }, ...h])
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Gagal membuat transaksi')
    } finally { setPaying(false) }
  }

  if (loading || busy) return null
  if (!user) return null

  const trialDaysLeft = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const currentPlan = plans.find(p => p.key === sub?.plan)

  return (
    <>
      <Head><title>Langganan — SOMA BMS</title></Head>
      <AdminLayout user={user} onLogout={logout} title="Langganan & Pembayaran">

        {/* Trial alert */}
        {sub?.status === 'trial' && trialDaysLeft <= 7 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <p className="font-semibold text-orange-800">Trial berakhir dalam {trialDaysLeft} hari!</p>
              <p className="text-xs text-orange-600 mt-0.5">Pilih paket sebelum trial habis agar layanan tidak terganggu.</p>
            </div>
            <button onClick={() => setTab('upgrade')} className="text-sm px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Upgrade Sekarang
            </button>
          </div>
        )}

        {/* Past due alert */}
        {sub?.status === 'past_due' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <p className="font-semibold text-red-800">❌ Langganan Anda sudah kedaluwarsa</p>
            <p className="text-xs text-red-600 mt-1">Perpanjang sekarang untuk memulihkan akses penuh.</p>
            <button onClick={() => setTab('upgrade')} className="mt-2 text-sm px-4 py-2 bg-red-600 text-white rounded-lg">Perpanjang</button>
          </div>
        )}

        {/* New registration success */}
        {router.query.new === '1' && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5">
            <p className="font-semibold text-teal-800">🎉 Selamat datang di SOMA BMS!</p>
            <p className="text-xs text-teal-600 mt-1">Akun Anda sudah aktif. Trial 14 hari gratis dimulai sekarang.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {[['overview','📊 Status'], ['upgrade','⬆️ Upgrade'], ['history','🧾 Riwayat']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab===k?'border-teal-600 text-teal-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">📦 Paket Aktif</h3>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-gray-800">{currentPlan?.name || sub?.plan_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[sub?.status] || 'bg-gray-100 text-gray-600'}`}>
                    {sub?.status === 'trial' ? `⏳ Trial — ${trialDaysLeft} hari lagi`
                      : sub?.status === 'active' ? '✅ Aktif'
                      : sub?.status === 'past_due' ? '❌ Kedaluwarsa'
                      : sub?.status}
                  </span>
                </div>
                <p className="text-lg font-bold text-teal-600">
                  {rp(sub?.price_per_month || 0)}<span className="text-xs text-gray-400">/bln</span>
                </p>
              </div>
              {sub?.current_period_end && (
                <p className="text-xs text-gray-500">
                  {sub?.status === 'trial' ? 'Trial berakhir' : 'Periode aktif sampai'}: <strong>{new Date(sub.current_period_end).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}</strong>
                </p>
              )}
              <div className="mt-4 space-y-2">
                {currentPlan?.features?.map((f: string) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-teal-500">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">📊 Kuota Penggunaan</h3>
              {[
                { label: 'Gedung', used: 1, max: sub?.max_buildings },
                { label: 'Pengguna', used: 0, max: sub?.max_users },
                { label: 'Aset', used: 0, max: sub?.max_assets },
              ].map(item => (
                <div key={item.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.used} / {item.max >= 999 ? '∞' : item.max}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full"
                      style={{ width: `${item.max >= 999 ? 5 : (item.used / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
              <button onClick={() => setTab('upgrade')}
                className="mt-4 w-full text-sm py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 font-medium">
                ⬆️ Upgrade Paket
              </button>
            </div>
          </div>
        )}

        {/* UPGRADE */}
        {tab === 'upgrade' && (
          <div>
            {paymentResult ? (
              <div className="max-w-md mx-auto card border-2 border-teal-200">
                <h3 className="font-bold text-lg mb-2">💳 Instruksi Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Paket</span><strong>{paymentResult.plan_name}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total</span><strong className="text-teal-600">{paymentResult.amount_display}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Metode</span><strong>{paymentResult.payment_method}</strong></div>
                  {paymentResult.va_number && <div className="flex justify-between items-center">
                    <span className="text-gray-500">No. VA</span>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono">{paymentResult.va_number}</strong>
                      <button onClick={() => navigator.clipboard.writeText(paymentResult.va_number)}
                        className="text-xs text-teal-600 hover:underline">Salin</button>
                    </div>
                  </div>}
                  <div className="flex justify-between"><span className="text-gray-500">Kadaluarsa</span><span>{paymentResult.expires_at ? new Date(paymentResult.expires_at).toLocaleString('id-ID') : '—'}</span></div>
                </div>
                {paymentResult.payment_url && (
                  <a href={paymentResult.payment_url} target="_blank" rel="noreferrer"
                    className="block mt-4 text-center btn-primary w-full">
                    Buka Halaman Pembayaran ↗
                  </a>
                )}
                <button onClick={() => { setPaymentResult(null); fetchAll() }}
                  className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700">
                  Kembali ke langganan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan cards */}
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Pilih Paket</h3>
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                      {(['monthly','annual'] as const).map(b => (
                        <button key={b} onClick={() => setBilling(b)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${billing===b?'bg-white shadow-sm text-gray-800':'text-gray-500'}`}>
                          {b==='monthly'?'Bulanan':'Tahunan (Hemat 17%)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {plans.map(p => (
                      <div key={p.key} onClick={() => setSelectedPlan(p.key)}
                        className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${selectedPlan===p.key?'border-teal-500 bg-teal-50':'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan===p.key?'border-teal-500':'border-gray-300'}`}>
                              {selectedPlan===p.key && <div className="w-2 h-2 rounded-full bg-teal-500"/>}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                {p.highlight && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Populer</span>}
                                {sub?.plan === p.key && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paket Anda</span>}
                              </div>
                              <p className="text-xs text-gray-500">{p.max_buildings < 999 ? `${p.max_buildings} gedung` : 'Gedung ∞'} · {p.max_users < 999 ? `${p.max_users} user` : 'User ∞'}</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            {billing==='annual' ? rp(p.price_annual) : rp(p.price_monthly)}
                            <span className="text-xs font-normal text-gray-400">/{billing==='annual'?'thn':'bln'}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment method + checkout */}
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-3">Metode Pembayaran</h3>
                  <div className="space-y-2 mb-4">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${paymentMethod===pm.key?'border-teal-500 bg-teal-50':'border-gray-200 hover:border-gray-300'}`}>
                        <span>{pm.icon}</span>
                        <span className={paymentMethod===pm.key?'font-medium text-teal-700':'text-gray-700'}>{pm.name}</span>
                        {paymentMethod===pm.key && <span className="ml-auto text-teal-500">✓</span>}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-3 space-y-2 text-sm">
                    {selectedPlan && (() => {
                      const p = plans.find(x => x.key === selectedPlan)
                      if (!p) return null
                      const amt = billing==='annual' ? p.price_annual : p.price_monthly
                      const ppn = Math.round(amt * 0.11)
                      return <>
                        <div className="flex justify-between text-gray-600"><span>Paket {p.name}</span><span>{rp(amt)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>PPN 11%</span><span>{rp(ppn)}</span></div>
                        <div className="flex justify-between font-bold text-gray-800 border-t pt-2"><span>Total</span><span className="text-teal-600">{rp(amt + ppn)}</span></div>
                      </>
                    })()}
                  </div>
                  <button onClick={handleUpgrade} disabled={paying || !selectedPlan}
                    className="btn-primary w-full mt-4 py-3">
                    {paying ? '⏳ Memproses...' : '💳 Bayar Sekarang'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">Pembayaran aman melalui Duitku</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['No. Order','Paket','Jumlah','Metode','Status','Tanggal'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {history.length===0
                  ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">Belum ada riwayat pembayaran</td></tr>
                  : history.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.merchant_order_id}</td>
                      <td className="px-4 py-3 font-medium capitalize">{t.plan}</td>
                      <td className="px-4 py-3 font-semibold text-teal-600">{t.amount_display}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status==='paid'?'bg-green-100 text-green-800'
                          :t.status==='pending'?'bg-yellow-100 text-yellow-800'
                          :'bg-red-100 text-red-800'}`}>
                          {t.status==='paid'?'✅ Lunas':t.status==='pending'?'⏳ Menunggu':'❌ Gagal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
