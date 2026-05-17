import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { setCookie } from 'cookies-next'
import { saasApi } from '@/lib/api'

const PLANS = [
  {
    key: 'starter', name: 'Starter', priceMonthly: 299000, priceAnnual: 2990000,
    maxBuildings: 1, maxUsers: 15, features: ['1 gedung', '15 pengguna', '150 aset', 'Checklist & Work Order', 'Mobile app'],
    highlight: false,
  },
  {
    key: 'professional', name: 'Professional', priceMonthly: 799000, priceAnnual: 7990000,
    maxBuildings: 5, maxUsers: 50, features: ['5 gedung', '50 pengguna', '1.000 aset', 'Billing & invoice', 'TRO & tamu', 'Alarm & laporan'],
    highlight: true,
  },
  {
    key: 'enterprise', name: 'Enterprise', priceMonthly: 1999000, priceAnnual: 19990000,
    maxBuildings: 999, maxUsers: 999, features: ['Gedung tidak terbatas', 'Pengguna tidak terbatas', 'API integrasi', 'Custom branding', 'Dedicated support'],
    highlight: false,
  },
]

const rp = (v: number) => `Rp${v.toLocaleString('id-ID')}`

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState<1|2|3|4>(1)
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: '', company_email: '', company_phone: '', company_address: '',
    city: 'Jakarta', building_name: '', building_floors: 10,
    admin_name: '', admin_email: '', admin_password: '', admin_password2: '',
  })

  const plan = PLANS.find(p => p.key === selectedPlan)!
  const price = billing === 'annual' ? plan.priceAnnual : plan.priceMonthly
  const priceLabel = billing === 'annual'
    ? `${rp(plan.priceAnnual)}/tahun (hemat ${rp(plan.priceMonthly * 12 - plan.priceAnnual)})`
    : `${rp(plan.priceMonthly)}/bulan`

  const next = () => {
    setError('')
    if (step === 1) {
      if (!form.company_name || !form.company_email || !form.building_name) {
        setError('Nama perusahaan, email, dan nama gedung wajib diisi.'); return
      }
    }
    if (step === 2) {
      if (!form.admin_name || !form.admin_email || !form.admin_password) {
        setError('Semua field admin wajib diisi.'); return
      }
      if (form.admin_password !== form.admin_password2) {
        setError('Konfirmasi password tidak cocok.'); return
      }
      if (form.admin_password.length < 8) {
        setError('Password minimal 8 karakter.'); return
      }
    }
    setStep(s => (s + 1) as 1|2|3|4)
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await saasApi.register({
        company_name: form.company_name, company_email: form.company_email,
        company_phone: form.company_phone, company_address: form.company_address,
        city: form.city, building_name: form.building_name,
        building_floors: form.building_floors, building_address: form.company_address,
        admin_name: form.admin_name, admin_email: form.admin_email,
        admin_password: form.admin_password, plan: selectedPlan,
      })
      setCookie('access_token', data.access_token, { maxAge: 60 * 480 })
      setCookie('user_email', data.admin_email || form.admin_email, { maxAge: 60 * 480 })
      setCookie('user_name', form.admin_name, { maxAge: 60 * 480 })
      router.push('/admin/subscription?new=1')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Registrasi gagal. Coba lagi.')
    } finally { setLoading(false) }
  }

  const inp = (field: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} className="input-field" placeholder={placeholder}
        value={form[field] as string}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
    </div>
  )

  return (
    <>
      <Head><title>Daftar — SOMA BMS</title></Head>
      <div className="min-h-screen bg-navy flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">SM</div>
            <span className="font-bold text-white">SOMA BMS</span>
          </div>
          <Link href="/login" className="text-sm text-gray-300 hover:text-white">Sudah punya akun? Masuk →</Link>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(['Pilih Paket', 'Info Perusahaan', 'Akun Admin', 'Konfirmasi'] as const).map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${i + 1 < step ? 'bg-teal-500 text-white' : i + 1 === step ? 'bg-white text-navy' : 'bg-white/20 text-gray-400'}`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-white' : 'text-gray-400'}`}>{label}</span>
                  {i < 3 && <div className="w-8 h-px bg-white/20 hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* STEP 1: Plan selection */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">Pilih Paket Langganan</h2>
                <p className="text-gray-400 text-center text-sm mb-6">Mulai dengan trial 14 hari gratis, tidak perlu kartu kredit</p>

                {/* Billing toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white/10 rounded-xl p-1 flex gap-1">
                    {(['monthly', 'annual'] as const).map(b => (
                      <button key={b} onClick={() => setBilling(b)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${billing === b ? 'bg-teal-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                        {b === 'monthly' ? 'Bulanan' : 'Tahunan'}
                        {b === 'annual' && <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">Hemat 17%</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {PLANS.map(p => (
                    <div key={p.key} onClick={() => setSelectedPlan(p.key)}
                      className={`rounded-2xl p-5 cursor-pointer transition-all border-2 ${selectedPlan === p.key ? 'border-teal-400 bg-white/10' : 'border-transparent bg-white/5 hover:bg-white/8'} ${p.highlight ? 'ring-2 ring-teal-400/50' : ''}`}>
                      {p.highlight && (
                        <div className="bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">
                          ⭐ Paling Populer
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      <p className="text-2xl font-bold text-teal-400 mt-1">
                        {billing === 'annual' ? rp(p.priceAnnual) : rp(p.priceMonthly)}
                        <span className="text-sm font-normal text-gray-400">/{billing === 'annual' ? 'thn' : 'bln'}</span>
                      </p>
                      {billing === 'annual' && (
                        <p className="text-xs text-green-400 mt-0.5">Hemat {rp(p.priceMonthly * 12 - p.priceAnnual)}/tahun</p>
                      )}
                      <ul className="mt-3 space-y-1">
                        {p.features.map(f => (
                          <li key={f} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="text-teal-400">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <div className={`mt-4 w-full py-2 rounded-xl text-center text-sm font-semibold transition-colors ${selectedPlan === p.key ? 'bg-teal-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                        {selectedPlan === p.key ? '✓ Dipilih' : 'Pilih'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button onClick={next} className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-3 rounded-xl font-semibold transition-colors">
                    Lanjut dengan {plan.name} →
                  </button>
                  <p className="text-gray-500 text-xs mt-2">Trial 14 hari gratis, batal kapan saja</p>
                </div>
              </div>
            )}

            {/* STEP 2: Company info */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Informasi Perusahaan</h2>
                <p className="text-xs text-gray-400 mb-5">Data perusahaan dan gedung pertama Anda</p>
                <div className="space-y-3">
                  {inp('company_name', 'Nama Perusahaan *', 'text', 'PT Gedung Properti Indonesia')}
                  {inp('company_email', 'Email Perusahaan *', 'email', 'admin@perusahaan.co.id')}
                  {inp('company_phone', 'No. Telepon Kantor', 'text', '021-12345678')}
                  {inp('company_address', 'Alamat Perusahaan', 'text', 'Jl. Sudirman No. 1, Jakarta')}
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">🏢 Gedung Pertama</p>
                    {inp('building_name', 'Nama Gedung *', 'text', 'Gedung Utama Lt.1-20')}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Lantai</label>
                      <input type="number" className="input-field" min={1} max={100}
                        value={form.building_floors}
                        onChange={e => setForm(f => ({ ...f, building_floors: parseInt(e.target.value) || 10 }))} />
                    </div>
                  </div>
                </div>
                {error && <p className="text-red-600 text-xs mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Kembali</button>
                  <button onClick={next} className="btn-primary flex-1">Lanjut →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Admin account */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Akun Admin Gedung</h2>
                <p className="text-xs text-gray-400 mb-5">Akun ini akan menjadi Admin Gedung yang bisa membuat semua user lainnya</p>
                <div className="space-y-3">
                  {inp('admin_name', 'Nama Lengkap Admin *', 'text', 'Ahmad Wijaya')}
                  {inp('admin_email', 'Email Login *', 'email', 'admin@perusahaan.co.id')}
                  {inp('admin_password', 'Password * (min. 8 karakter)', 'password')}
                  {inp('admin_password2', 'Ulangi Password *', 'password')}
                </div>
                {error && <p className="text-red-600 text-xs mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Kembali</button>
                  <button onClick={next} className="btn-primary flex-1">Lanjut →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirm */}
            {step === 4 && (
              <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Konfirmasi Pendaftaran</h2>
                <div className="space-y-3 text-sm">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <p className="font-semibold text-teal-800">📦 Paket: {plan.name}</p>
                    <p className="text-teal-700 text-xs mt-1">{priceLabel}</p>
                    <p className="text-teal-600 text-xs mt-1">✅ Trial 14 hari gratis — tidak ada tagihan sekarang</p>
                  </div>
                  {[
                    ['🏢 Perusahaan', form.company_name],
                    ['📧 Email Perusahaan', form.company_email],
                    ['🏗️ Gedung', form.building_name],
                    ['👤 Admin', `${form.admin_name} (${form.admin_email})`],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-xs">{label}</span>
                      <span className="font-medium text-gray-800 text-xs text-right max-w-xs truncate">{value}</span>
                    </div>
                  ))}
                </div>
                {error && <p className="text-red-600 text-xs mt-3 bg-red-50 px-3 py-2 rounded-lg">❌ {error}</p>}
                <p className="text-xs text-gray-400 mt-4">
                  Dengan mendaftar, Anda menyetujui <a href="#" className="text-teal-600">Syarat & Ketentuan</a> dan <a href="#" className="text-teal-600">Kebijakan Privasi</a> SOMA BMS.
                </p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(3)} className="btn-secondary flex-1">← Kembali</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3">
                    {loading ? '⏳ Memproses...' : '🚀 Mulai Trial Gratis'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
