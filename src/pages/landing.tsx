import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next'

/* ─── FAQ accordion (hook di luar map) ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 flex justify-between items-center gap-4 bg-transparent border-0 cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-800 leading-snug">{q}</span>
        <span className={`text-xl font-light flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45 text-teal-500' : 'text-gray-400'}`}>+</span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Nav links ─── */
const NAV_LINKS = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Modul', href: '#modul' },
  { label: 'Harga', href: '#harga' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Tentang', href: '#pendiri' },
]

/* ─── Features ─── */
const FEATURES = [
  { icon: '✅', title: 'Smart Checklist PM & HK', desc: 'Template terstruktur dengan panduan langkah demi langkah. Setiap tugas terdokumentasi otomatis — tidak ada yang terlewat.' },
  { icon: '🔧', title: 'Work Order Digital', desc: 'Buat, assign, dan pantau WO dari mobile. Eskalasi otomatis sesuai SLA — tidak perlu koordinasi via WhatsApp.' },
  { icon: '📊', title: 'Live Monitoring MEP', desc: 'Dashboard real-time suhu, tekanan, daya, dan utilitas gedung dengan alert otomatis bila anomali terdeteksi.' },
  { icon: '📦', title: 'Manajemen Material & Aset', desc: 'Kontrol stok, request, approval material dalam satu alur. Notifikasi stok minimum otomatis ke tim pengadaan.' },
  { icon: '🔔', title: 'Sistem Alarm Multi-Level', desc: 'Alarm critical, major, warning dengan eskalasi otomatis ke personel yang tepat — dari teknisi lapangan hingga GM.' },
  { icon: '🛡️', title: 'Role-Based Access Control', desc: 'Teknisi, HK, SPV, Admin, hingga TRO Security — hak akses terpisah dan aman sesuai tanggung jawab masing-masing.' },
  { icon: '🪪', title: 'Visitor & Akses Management', desc: 'Registrasi tamu digital, QR akses, validasi security, dan log kunjungan — cocok untuk gedung perkantoran dan mixed-use.' },
  { icon: '📈', title: 'Analytics & Laporan Eksekutif', desc: 'Laporan PM completion, KPI tim, trend operasional, dan konsumsi utilitas — tersedia dalam format PDF siap presentasi.' },
  { icon: '📅', title: 'Penjadwalan Preventif Otomatis', desc: 'Jadwal PM berulang dibuat otomatis berdasarkan interval waktu atau jam operasional — tanpa input manual tiap bulan.' },
  { icon: '🗺️', title: 'Floor Plan & Peta Aset', desc: 'Visualisasi posisi aset dan titik masalah langsung di denah gedung. Tim lapangan tahu lokasi tanpa harus bertanya.' },
  { icon: '💰', title: 'Cost Tracking & Budget', desc: 'Pantau biaya pemeliharaan per area, per kategori, dan per tim. Bandingkan aktual vs anggaran secara real-time.' },
  { icon: '📁', title: 'Dokumentasi Digital', desc: 'Foto, nota service, SOP, dan laporan tersimpan terstruktur — tidak ada lagi dokumen hilang atau folder berantakan.' },
]

/* ─── Modules / Roles ─── */
const MODULES = [
  { role: 'Admin Gedung', icon: '🏢', color: 'bg-teal-50 text-teal-700', border: 'border-teal-100', desc: 'Dashboard KPI, aset, work order, laporan, dan alarm — akses penuh manajemen gedung.' },
  { role: 'TRO / Security', icon: '🪪', color: 'bg-slate-100 text-slate-700', border: 'border-slate-200', desc: 'Registrasi tamu, validasi QR, parkir, log akses, dan check-out visitor.' },
  { role: 'SPV Teknisi', icon: '👔', color: 'bg-blue-50 text-blue-700', border: 'border-blue-100', desc: 'Monitor tim lapangan, approval WO & material request, eskalasi SLA.' },
  { role: 'Teknisi MEP', icon: '👷', color: 'bg-green-50 text-green-700', border: 'border-green-100', desc: 'Checklist preventive maintenance, work order, foto lapangan, maintenance history.' },
  { role: 'Housekeeping', icon: '🧹', color: 'bg-rose-50 text-rose-700', border: 'border-rose-100', desc: 'Checklist kebersihan per area, request material, inspeksi, dan laporan shift.' },
  { role: 'SPV Housekeeping', icon: '📋', color: 'bg-purple-50 text-purple-700', border: 'border-purple-100', desc: 'Supervisi tim HK, review checklist, approval request, dan monitoring progres harian.' },
]

/* ─── Pricing ─── */
const PLANS = [
  {
    name: 'Starter', price: 'Rp 2,9jt', per: '/gedung/bulan',
    features: ['Hingga 20 pengguna', 'Checklist PM & HK', 'Work Order digital', 'Dashboard admin', 'Laporan bulanan', 'Email support'],
    cta: 'Mulai Gratis 30 Hari', highlight: false,
  },
  {
    name: 'Professional', price: 'Rp 6,9jt', per: '/gedung/bulan',
    features: ['Hingga 100 pengguna', 'Semua modul mobile', 'Live monitoring MEP', 'Integrasi IoT sensor', 'Visitor management', 'Analitik & KPI lanjutan', 'Priority support 24/7'],
    cta: 'Pilih Professional', highlight: true, badge: 'Paling Populer',
  },
  {
    name: 'Enterprise', price: 'Custom', per: 'hubungi tim kami',
    features: ['Pengguna tak terbatas', 'Multi-gedung & multi-kota', 'SLA 99,9% terjamin', 'Dedicated engineer kami', 'Custom development', 'Onboarding & pelatihan tim', 'Kontrak jangka panjang'],
    cta: 'Hubungi Kami', highlight: false,
  },
]

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: 'Budi Hartono', role: 'Building Manager', company: 'Menara Sudirman Premium', avatar: 'BH', quote: 'SOMA BMS mengubah cara kami bekerja sepenuhnya. Laporan PM yang dulu memakan waktu 2 jam kini selesai otomatis. Tim teknis kami jauh lebih produktif.', tags: ['PM Efficiency', 'Laporan Otomatis'] },
  { name: 'Siti Rahayu', role: 'Facility Manager', company: 'Kawasan Komersil Bintaro', avatar: 'SR', quote: 'Work Order tidak pernah lagi terlewat sejak pakai SOMA BMS. Eskalasi otomatis ke SPV sangat membantu — tidak ada lagi koordinasi manual via WhatsApp grup.', tags: ['Work Order', 'Eskalasi SLA'] },
  { name: 'Andi Wijaya', role: 'Direktur Operasional', company: 'PT Properti Nusantara', avatar: 'AW', quote: 'Kami mengelola 12 gedung sekaligus dari satu dashboard. Visibilitas operasional yang tidak pernah kami bayangkan sebelumnya — dan harganya sangat masuk akal.', tags: ['Multi-Gedung', 'Visibilitas'] },
  { name: 'Dewi Santoso', role: 'HSE Manager', company: 'Graha Korporasi Jakarta', avatar: 'DS', quote: 'Fitur visitor management QR-nya sangat membantu keamanan gedung kami. Tamu terdokumentasi rapi, tim security bekerja lebih efisien.', tags: ['Visitor Management', 'Keamanan'] },
  { name: 'Rizal Fauzan', role: 'Chief Engineer', company: 'Menara Permata Selatan', avatar: 'RF', quote: 'Monitoring MEP real-time adalah game changer. Kami bisa mendeteksi anomali suhu chiller sebelum breakdown — menghemat biaya perbaikan jutaan rupiah.', tags: ['Live Monitoring', 'MEP'] },
  { name: 'Mega Pratiwi', role: 'GM Property', company: 'Sentral Bisnis Serpong', avatar: 'MP', quote: 'Setup dan onboarding sangat cepat. Dalam 2 hari tim kami sudah produktif menggunakan semua fitur. Dukungan teknisnya responsif dan profesional.', tags: ['Onboarding Cepat', 'Support'] },
]

/* ─── FAQ ─── */
const FAQS = [
  { q: 'Berapa lama proses implementasi SOMA BMS?', a: 'Rata-rata 1–3 hari kerja dari mulai setup akun hingga tim lapangan siap beroperasi. Kami menyediakan sesi onboarding dan pelatihan tim termasuk dalam paket.' },
  { q: 'Apakah SOMA BMS bisa digunakan tanpa koneksi internet?', a: 'Aplikasi mobile mendukung mode offline untuk checklist dan work order. Data akan tersinkronisasi otomatis begitu koneksi internet tersedia kembali.' },
  { q: 'Bagaimana keamanan data gedung kami?', a: 'Data dienkripsi end-to-end (SSL 256-bit), dihosting di server AWS Jakarta, dan memenuhi standar keamanan SNI. Kami tidak pernah mengakses data Anda tanpa izin eksplisit.' },
  { q: 'Apakah bisa terintegrasi dengan sistem BAS atau SCADA yang sudah ada?', a: 'Ya. SOMA BMS mendukung integrasi melalui API REST dan MQTT untuk koneksi ke BAS, SCADA, dan sensor IoT berbagai merek. Tim teknis kami siap membantu proses integrasi.' },
  { q: 'Berapa banyak pengguna yang bisa mengakses platform?', a: 'Tergantung paket yang dipilih. Starter mendukung hingga 20 pengguna, Professional hingga 100, dan Enterprise tidak terbatas. Semua dengan role dan hak akses yang dapat dikonfigurasi.' },
  { q: 'Bagaimana jika kami ingin membatalkan berlangganan?', a: 'Tidak ada biaya pembatalan dan tidak ada kontrak jangka panjang yang mengikat (kecuali Enterprise). Batalkan kapan saja dan data Anda dapat diekspor sepenuhnya.' },
  { q: 'Apakah ada biaya setup atau implementasi tambahan?', a: 'Tidak ada biaya setup tersembunyi. Onboarding, konfigurasi awal, dan pelatihan tim sudah termasuk dalam semua paket berlangganan.' },
  { q: 'Apakah SOMA BMS cocok untuk gedung residensial atau apartemen?', a: 'SOMA BMS dirancang terutama untuk gedung komersial, perkantoran, dan mixed-use. Untuk residensial besar, silakan hubungi tim kami untuk solusi yang disesuaikan.' },
]

/* ─── Stats ─── */
const STATS = [
  { value: '500+', label: 'Gedung Aktif' },
  { value: '12.000+', label: 'Pengguna Harian' },
  { value: '99,9%', label: 'SLA Uptime' },
  { value: '4,9★', label: 'Rating Klien' },
]

/* ════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    /* Redirect jika sudah login */
    const token = getCookie('access_token')
    if (token) {
      try {
        const p = JSON.parse(atob((token as string).split('.')[1]))
        if (['teknisi', 'housekeeping', 'spv_teknisi', 'spv_housekeeping'].includes(p.role)) {
          router.push('/mobile/dashboard')
        } else if (p.role === 'tro') {
          router.push('/tro/dashboard')
        } else {
          router.push('/admin/dashboard')
        }
      } catch {}
    }
    /* Scroll shadow navbar */
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <Head>
        <title>SOMA BMS – Smart Building Management System Indonesia</title>
        <meta name="description" content="Platform BMS enterprise untuk gedung komersial Indonesia. Kelola teknisi MEP, housekeeping, aset, alarm, dan visitor management dalam satu platform digital." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-gray-900 font-sans">

        {/* ── NAVBAR ─────────────────────────────────────── */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-black text-base">S</span>
              </div>
              <div>
                <p className="font-black text-base leading-none bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">SOMA BMS</p>
                <p className="text-[8px] text-gray-400 font-semibold tracking-widest uppercase leading-none mt-0.5">Building Management System</p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}
                  className="text-sm text-gray-500 hover:text-teal-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all">
                  {l.label}
                </a>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <a href="#kontak"
                className="text-sm text-gray-600 hover:text-teal-600 font-semibold px-4 py-2 border border-gray-200 hover:border-teal-300 rounded-lg transition-all">
                Hubungi Kami
              </a>
              <Link href="/demo/teknisi"
                className="text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md shadow-teal-200">
                Coba Demo →
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-5 space-y-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-sm text-gray-600 hover:text-teal-600 font-semibold border-b border-gray-50">
                  {l.label}
                </a>
              ))}
              <div className="pt-4 flex gap-3">
                <a href="#kontak" className="flex-1 text-center text-sm border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold">Hubungi Kami</a>
                <Link href="/demo/teknisi" className="flex-1 text-center text-sm bg-teal-600 text-white px-4 py-2.5 rounded-lg font-bold">Coba Demo</Link>
              </div>
            </div>
          )}
        </nav>

        {/* ── HERO ────────────────────────────────────────── */}
        <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-br from-white via-sky-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                Platform BMS Enterprise #1 Indonesia
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] mb-6 tracking-tight text-gray-900">
                Gedung Lebih Cerdas,{' '}
                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Biaya Lebih Hemat
                </span>
              </h1>
              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
                SOMA BMS menyatukan seluruh operasional gedung — teknisi MEP, housekeeping, aset, hingga keamanan — dalam satu platform digital yang bisa dipakai dari mana saja. Kurangi downtime, tingkatkan akuntabilitas tim.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/demo/teknisi"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-7 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-teal-200 text-center">
                  Coba Demo Gratis 30 Hari →
                </Link>
                <Link href="/demo/admin"
                  className="border-2 border-teal-200 hover:border-teal-400 text-teal-600 px-7 py-3.5 rounded-xl font-bold text-base transition-all text-center">
                  Lihat Dashboard
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {['30 hari gratis tanpa syarat', 'Tanpa kartu kredit', 'Setup & onboarding < 1 jam'].map(t => (
                  <div key={t} className="flex items-center gap-1.5">
                    <span className="text-teal-500 font-bold text-sm">✓</span>
                    <span className="text-xs text-gray-500 font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard preview */}
            <div className="hidden lg:block">
              <div className="bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-700">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-xs text-slate-400 ml-2 font-medium">SOMA BMS — Admin Dashboard</span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[['PM Hari Ini', '12', 'text-teal-400'], ['Selesai', '9', 'text-green-400'], ['Overdue', '2', 'text-red-400'], ['Alarm Aktif', '1', 'text-orange-400']].map(([l, v, c]) => (
                    <div key={l as string} className="bg-slate-700/60 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">{l}</p>
                      <p className={`text-2xl font-black ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/60 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-3 font-semibold">Work Orders Aktif</p>
                    {[['AC Lantai 3 Trip', '🔴 Darurat'], ['Pompa Air Bocor', '🟠 Tinggi'], ['Lampu Parkir Mati', '🟡 Sedang']].map(([t, p]) => (
                      <div key={t as string} className="flex justify-between py-1.5 border-b border-slate-600/50 last:border-0">
                        <span className="text-xs text-slate-300">{t}</span>
                        <span className="text-xs">{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-700/60 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-3 font-semibold">Monitoring Utilitas</p>
                    {[['Listrik Tower A', '42,5 kWh', 'text-yellow-300'], ['Air Basement B1', '12,1 m³', 'text-blue-300'], ['Generator', 'Standby', 'text-green-300']].map(([n, v, c]) => (
                      <div key={n as string} className="flex justify-between py-1.5 border-b border-slate-600/50 last:border-0">
                        <span className="text-xs text-slate-300">{n}</span>
                        <span className={`text-xs font-semibold ${c}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center py-5 px-4 ${i % 2 === 0 ? 'bg-sky-50' : 'bg-white'}`}>
                <p className="text-2xl font-black text-teal-500 mb-1">{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────── */}
        <section id="fitur" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">Fitur Platform</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Semua yang dibutuhkan gedung modern</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">Dari checklist harian hingga laporan eksekutif — SOMA BMS menangani operasional end-to-end tanpa perlu integrasi tambahan.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map(f => (
                <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-teal-100 transition-all">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MODULES / ROLES ─────────────────────────────── */}
        <section id="modul" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-sky-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">Modul per Peran</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Dirancang untuk Setiap Peran</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">Setiap role mendapat tampilan dan fitur yang disesuaikan — admin web, mobile untuk lapangan, TRO untuk lobby.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map(m => (
                <div key={m.role} className={`flex items-start gap-4 p-5 rounded-2xl border ${m.border} bg-white hover:shadow-md transition-all`}>
                  <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${m.color}`}>{m.icon}</div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1 text-sm">{m.role}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Demo link */}
            <div className="text-center mt-10">
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  {label:"📱 Teknisi MEP", href:"/demo/teknisi", dark:false},
                  {label:"🧹 Housekeeping", href:"/demo/housekeeping", dark:false},
                  {label:"👔 SPV Dashboard", href:"/demo/spv_teknisi", dark:false},
                  {label:"🖥 Admin Gedung", href:"/demo/admin", dark:true},
                  {label:"🪪 TRO Security", href:"/demo/tro", dark:true},
                ].map(d=>(
                  <Link key={d.label} href={d.href}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${d.dark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100'}`}>
                    {d.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black mb-3">Mulai dalam 3 Langkah</h2>
              <p className="text-slate-400 text-sm">Setup cepat, tanpa tim IT khusus</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Daftar & Setup Gedung', desc: 'Buat akun, masukkan data gedung dan struktur tim Anda dalam hitungan menit.' },
                { step: '2', title: 'Undang Tim Anda', desc: 'Tambahkan teknisi, SPV, dan TRO. Mereka langsung bisa akses dari browser atau HP.' },
                { step: '3', title: 'Pantau & Kelola', desc: 'Dashboard otomatis aktif. Jadwal PM berjalan sendiri. Alarm masuk real-time.' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-lg shadow-teal-900/50">{s.step}</div>
                  <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────── */}
        <section id="harga" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">Harga</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Transparan, Tanpa Biaya Tersembunyi</h2>
              <p className="text-gray-400 text-sm">Mulai gratis 30 hari. Upgrade atau batalkan kapan saja — tanpa penalti.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {PLANS.map(p => (
                <div key={p.name} className={`rounded-2xl p-7 border-2 relative flex flex-col ${p.highlight ? 'border-teal-500 bg-white shadow-xl shadow-teal-100' : 'border-gray-100 bg-white'}`}>
                  {p.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      {p.badge}
                    </span>
                  )}
                  <div className="mb-5">
                    <h3 className="font-black text-gray-900 text-lg mb-2">{p.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">{p.price}</span>
                      {p.per && <span className="text-xs text-gray-400">{p.per}</span>}
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-teal-500 font-bold mt-0.5 flex-shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.name === 'Enterprise' ? '#kontak' : '/demo/teknisi'}
                    className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${p.highlight ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md shadow-teal-200' : 'border-2 border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-600'}`}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────── */}
        <section id="testimoni" className="py-20 px-4 sm:px-6 bg-sky-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">Testimoni Klien</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Dipercaya pengelola gedung terbaik</h2>
              <p className="text-gray-400 text-sm">Apa kata mereka yang sudah merasakan manfaatnya langsung</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 italic flex-1">"{t.quote}"</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-xs font-black text-teal-700 flex-shrink-0">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <section id="faq" className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Pertanyaan yang sering ditanyakan</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {FAQS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
            </div>
            <div className="mt-12 text-center bg-sky-50 rounded-2xl p-8 border border-sky-100">
              <p className="text-sm text-gray-600 mb-5">Masih punya pertanyaan? Tim kami siap membantu.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:+6285775190949"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-teal-200">
                  📞 +62 857-7519-0949
                </a>
                <a href="https://wa.me/6285775190949" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-green-400 text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-bold text-sm transition-all">
                  💬 WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER / TENTANG ────────────────────────────── */}
        <section id="pendiri" className="py-20 px-4 sm:px-6 bg-amber-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black text-teal-500 tracking-widest uppercase mb-3">Tentang Kami</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Dibangun oleh praktisi lapangan</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Founder card */}
              <div className="bg-white rounded-2xl p-8 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl font-black text-teal-700 flex-shrink-0">AS</div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">Arief Saputro</p>
                    <p className="text-sm text-gray-500">Founder & CEO, SOMA BMS</p>
                    <a href="https://id.linkedin.com/in/arif-saputro-47047b219" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-teal-500 font-semibold hover:underline">LinkedIn →</a>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Selama lebih dari satu dekade berkarier di bidang teknik sipil, konstruksi, dan manajemen properti komersial, saya menyaksikan langsung bagaimana tim operasional gedung menghabiskan waktu berharga untuk hal-hal yang seharusnya otomatis.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  SOMA BMS lahir dari satu komitmen: <strong className="text-gray-800">setiap proses operasional gedung harus dapat dipertanggungjawabkan secara teknis, real-time, dan efisien — dan terjangkau untuk semua ukuran gedung di Indonesia.</strong>
                </p>
              </div>
              {/* Values */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: '🎯', title: 'Presisi & Akuntabilitas', desc: 'Setiap data divalidasi dan bisa ditelusuri hingga ke personel yang bertanggung jawab.' },
                  { icon: '🏗️', title: 'Dibuat oleh Praktisi Lapangan', desc: 'Tim kami adalah manajer gedung dan insinyur aktif yang memahami masalah nyata sehari-hari.' },
                  { icon: '🔓', title: 'Harga Demokratis', desc: 'Alat manajemen gedung andal tidak seharusnya dibatasi oleh lisensi ratusan juta rupiah.' },
                ].map(v => (
                  <div key={v.title} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-amber-100">
                    <span className="text-2xl flex-shrink-0">{v.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm mb-1">{v.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Siap transformasi gedung Anda?</h2>
            <p className="text-teal-100 mb-10 text-base leading-relaxed">Ribuan profesional gedung sudah membuktikannya. Sekarang giliran Anda — coba gratis 30 hari tanpa kartu kredit.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo/teknisi"
                className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-xl font-black text-base transition-all shadow-xl">
                Coba Demo Sekarang →
              </Link>
              <Link href="/login"
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-base transition-all">
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer id="kontak" className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm">S</span>
                  </div>
                  <span className="font-black text-white text-base">SOMA BMS</span>
                </div>
                <p className="text-xs leading-relaxed mb-5">Platform SaaS manajemen gedung komersial untuk Indonesia.</p>
                <div className="flex flex-col gap-2.5 text-xs">
                  <a href="tel:+6285775190949" className="hover:text-teal-400 transition-colors">📞 +62 857-7519-0949</a>
                  <a href="https://wa.me/6285775190949" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">💬 WhatsApp Support</a>
                  <a href="mailto:hello@somabms.id" className="hover:text-teal-400 transition-colors">✉️ hello@somabms.id</a>
                </div>
              </div>

              {/* Platform */}
              <div>
                <p className="text-white font-bold text-sm mb-4">Platform</p>
                {[
                  { l: 'Fitur Lengkap', href: '#fitur' },
                  { l: 'Modul Demo', href: '#modul' },
                  { l: 'Harga & Paket', href: '#harga' },
                  { l: 'Testimoni', href: '#testimoni' },
                  { l: 'FAQ', href: '#faq' },
                ].map(({ l, href }) => (
                  <a key={l} href={href} className="block text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>

              {/* Perusahaan */}
              <div>
                <p className="text-white font-bold text-sm mb-4">Perusahaan</p>
                {[
                  { l: 'Tentang & Pendiri', href: '#pendiri' },
                  { l: 'LinkedIn Pendiri', href: 'https://id.linkedin.com/in/arif-saputro-47047b219' },
                  { l: 'Karier', href: 'mailto:hello@somabms.id' },
                ].map(({ l, href }) => (
                  <a key={l} href={href} className="block text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors">{l}</a>
                ))}
              </div>

              {/* Dukungan */}
              <div>
                <p className="text-white font-bold text-sm mb-4">Dukungan</p>
                {[
                  { l: 'Hubungi Sales', href: 'tel:+6285775190949' },
                  { l: 'WhatsApp Support', href: 'https://wa.me/6285775190949' },
                  { l: 'Email Support', href: 'mailto:support@somabms.id' },
                  { l: 'Masuk / Login', href: '/login' },
                  { l: 'Daftar Gratis', href: '/register' },
                ].map(({ l, href }) => (
                  href.startsWith('/') ? (
                    <Link key={l} href={href} className="block text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors">{l}</Link>
                  ) : (
                    <a key={l} href={href} className="block text-xs text-slate-400 hover:text-teal-400 mb-2 transition-colors">{l}</a>
                  )
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs">© 2026 SOMA BMS. Hak cipta dilindungi undang-undang.</p>
              <div className="flex gap-5 text-xs">
                {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Keamanan Data'].map(t => (
                  <span key={t} className="hover:text-slate-300 cursor-pointer transition-colors">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
