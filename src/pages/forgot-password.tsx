import Head from 'next/head'
import { useState } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Lupa Password — SOMA BMS</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-teal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
            <p className="text-gray-400 text-sm mt-1">SOMA BMS — Smart Building</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {!sent ? (
              <>
                <p className="text-sm text-gray-600 mb-5 text-center">
                  Masukkan email akun Anda. Kami akan mengirimkan link reset password.
                </p>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm text-center">
                    ❌ {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="admin@gedung.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50">
                    {loading ? '⏳ Mengirim...' : '📧 Kirim Link Reset'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">📬</p>
                <h3 className="font-bold text-gray-800 mb-2">Email Terkirim!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Jika email <strong>{email}</strong> terdaftar, instruksi reset password telah dikirimkan. Cek inbox (dan folder spam).
                </p>
                <p className="text-xs text-gray-400">Link berlaku selama 1 jam.</p>
              </div>
            )}

            <div className="mt-5 text-center">
              <Link href="/login" className="text-sm text-teal-600 hover:underline font-medium">
                ← Kembali ke Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
